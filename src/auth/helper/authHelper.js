const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const TokenTypes = require("../config/enums/token-types-enum");
const {
  SESSION_EXPIRY_TIME,
  REFRESH_TOKEN_EXPIRY_TIME,
} = require("../config/constants/auth-constants");
const { getSessionExpiryTimestamp } = require("./util");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
};

// Function to sign JWT
const signJSONWebToken = async (payload, expiryTime) => {
  try {
    const token = jwt.sign(payload, process.env.GOOGLE_CLIENT_SECRET, {
      expiresIn: expiryTime,
    });

    return token;
  } catch (err) {
    console.error("Error signing the JWT: ", err);
  }
};
// Method to generate tokens, with an option to generate refresh token or not
const generateTokens = async (user, generateRefreshToken = true) => {
  try {
    // Create the session token
    const sessionToken = await signJSONWebToken(
      {
        id: user._id,
        role: user.role ?? "user",
        email: user.email,
        name: user.name,
        tokenType: TokenTypes.SESSION, // Indicates that this is a session token
      },
      SESSION_EXPIRY_TIME
    );
    // Get the session expiry timestamp using the utility function
    const sessionExpiryTimestamp =
      getSessionExpiryTimestamp(SESSION_EXPIRY_TIME);

    // Initialize the response object with session token and expiry time
    const response = {
      sessionToken,
      expiresIn: sessionExpiryTimestamp,
    };

    // Optionally create the refresh token if required
    if (generateRefreshToken) {
      const refreshToken = await signJSONWebToken(
        {
          id: user._id,
          email: user.email,
          name: user.name,
          tokenType: TokenTypes.REFRESH, // Indicates that this is a refresh token
        },
        REFRESH_TOKEN_EXPIRY_TIME
      );

      // Add the refresh token to the response object
      response.refreshToken = refreshToken;
    }

    return response;
  } catch (err) {
    console.error("Error generating tokens:", err);
    throw new Error("Error generating tokens");
  }
};

module.exports = {
  verifyGoogleToken,
  signJSONWebToken,
  generateTokens,
};
