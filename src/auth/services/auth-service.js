const HttpStatusCodes = require("../../shared/utils/http-codes");
const formatResponse = require("../../shared/utils/responseFormatter");
const User = require("../models/user");
const LOGINFLOW = require("../config/enums/loginflow-enum");
const { Roles } = require("../config/enums/roles-enum");
const TokenTypes = require("../config/enums/token-types-enum");
const { verifyGoogleToken, generateTokens } = require("../helper/authHelper");
const jwt = require("jsonwebtoken");
const { SALT_ROUNDS } = require("../config/constants/auth-constants");
const bcrypt = require("bcrypt");
const { validationResult, check } = require("express-validator");

// Function to handle Google Authentication
const googleAuth = async (req, res) => {
  try {
    if (req.body.token) {
      const verificationResponse = await verifyGoogleToken(req.body.token);

      if (verificationResponse.error) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json(
            formatResponse(
              HttpStatusCodes.BAD_REQUEST,
              "error",
              "Invalid credentials",
              verificationResponse.error
            )
          );
      }

      const profile = verificationResponse.payload;

      // Split the full name into first name and last name
      const [firstName, ...lastNameParts] = profile?.name.split(" ");
      const lastName = lastNameParts.join(" ");

      let user = await User.findOne({ email: profile.email });
      if (!user) {
        user = new User({
          email: profile.email,
          firstName: firstName, // Assign the first name
          lastName: lastName, // Assign the last name
          picture: profile?.picture,
          mobile: null,
          loginFlow: LOGINFLOW.GOOGLE,
          role: Roles.USER,
        });

        await user.save();
      }

      // Generate both session and refresh tokens
      const tokens = await generateTokens(user);

      return res.status(HttpStatusCodes.CREATED).json(
        formatResponse(
          HttpStatusCodes.CREATED,
          "success",
          "Signup successful",
          "User signed up successfully and tokens generated",
          {
            refreshToken: tokens.refreshToken, // Refresh token
            sessionToken: tokens.sessionToken, // Session token
            expiresIn: tokens.expiresIn, // Session token expiry time in seconds
            user: user,
          }
        )
      );
    }
  } catch (err) {
    console.error("Error while creating user: ", err);
    return res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        formatResponse(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          "error",
          "Internal Server Error",
          "An internal server error occurred while processing your request"
        )
      );
  }
};
// Function to handle User Signup
const signUp = async (req, res) => {
  try {
    // Validate request
    await check("email")
      .isEmail()
      .withMessage("Invalid email format")
      .run(req);
    await check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[\W_]/)
      .withMessage("Password must contain at least one special character")
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json(
          formatResponse(
            HttpStatusCodes.BAD_REQUEST,
            "error",
            firstError.msg,
            "Please check the error below",
            null
          )
        );
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json(
          formatResponse(
            HttpStatusCodes.BAD_REQUEST,
            "error",
            "User already exists",
            "User with this email already exists."
          )
        );
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user
    user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      loginFlow: LOGINFLOW.EMAIL,
      role: Roles.USER,
    });

    await user.save();

    // Generate tokens
    const tokens = await generateTokens(user);

    return res.status(HttpStatusCodes.CREATED).json(
      formatResponse(
        HttpStatusCodes.CREATED,
        "success",
        "Signup successful",
        "User signed up successfully and tokens generated",
        {
          refreshToken: tokens.refreshToken,
          sessionToken: tokens.sessionToken,
          expiresIn: tokens.expiresIn,
          user: user,
        }
      )
    );
  } catch (err) {
    console.error("Error during signup: ", err);
    return res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        formatResponse(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          "error",
          "Internal Server Error",
          "An internal server error occurred while processing your request."
        )
      );
  }
};
const refreshSession = async (req, res) => {
  try {
    // Extract the refresh token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "error",
            "Authorization header is missing",
            "No authorization header was provided in the request"
          )
        );
    }

    const refreshToken = authHeader.split(" ")[1];
    if (!refreshToken) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "error",
            "Refresh token is required",
            "No refresh token was provided in the request headers"
          )
        );
    }

    let decoded;
    try {
      // Verify the refresh token
      decoded = jwt.verify(refreshToken, process.env.GOOGLE_CLIENT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json(
            formatResponse(
              HttpStatusCodes.UNAUTHORIZED,
              "error",
              "Refresh token expired",
              "The refresh token has expired. Please request a new token."
            )
          );
      }
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "error",
            "Invalid refresh token",
            "The refresh token is invalid or could not be verified."
          )
        );
    }

    // Validate token type
    if (!decoded || decoded.tokenType !== TokenTypes.REFRESH) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "error",
            "Invalid or expired refresh token",
            "The provided refresh token is invalid or has expired."
          )
        );
    }

    // Check if the user exists in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "error",
            "User associated with the refresh token not found",
            "No user was found for the provided refresh token."
          )
        );
    }

    // Generate new session and refresh tokens
    const tokens = await generateTokens(user, false);

    return res.status(HttpStatusCodes.CREATED).json(
      formatResponse(
        HttpStatusCodes.CREATED,
        "success",
        "Token generated successfully",
        "New session tokens have been generated.",
        {
          sessionToken: tokens.sessionToken, // Session token
          expiresIn: tokens.expiresIn, // Session token expiry time in seconds
        }
      )
    );
  } catch (err) {
    console.error("Error in refreshSession: ", err);
    return res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        formatResponse(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          "error",
          "Internal Server Error",
          "An internal server error occurred while processing your request."
        )
      );
  }
};
const getUser = async (req, res) => {
  try {
    const { email, password } = req.query;

    // Validate input
    if (!email || !password) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json(
          formatResponse(
            HttpStatusCodes.BAD_REQUEST,
            "error",
            "Missing parameters",
            "Email and password are required."
          )
        );
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "error",
            "Invalid credentials",
            "No user found with this email."
          )
        );
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "error",
            "Invalid credentials",
            "Password is incorrect."
          )
        );
    }

    // Generate tokens
    const tokens = await generateTokens(user);

    return res.status(HttpStatusCodes.OK).json(
      formatResponse(
        HttpStatusCodes.OK,
        "success",
        "Login successful",
        "User logged in successfully.",
        {
          refreshToken: tokens.refreshToken,
          sessionToken: tokens.sessionToken,
          expiresIn: tokens.expiresIn,
          user: user,
        }
      )
    );
  } catch (err) {
    console.error("Error during user retrieval: ", err);
    return res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        formatResponse(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          "error",
          "Internal Server Error",
          "An internal server error occurred while processing your request."
        )
      );
  }
};

module.exports = {
  googleAuth,
  refreshSession,
  signUp,
  getUser,
};
