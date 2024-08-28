const jwt = require("jsonwebtoken");
const HttpStatusCodes = require("../../shared/utils/http-codes");
const { Roles } = require("../config/enums/roles-enum");
const formatResponse = require("../../shared/utils/responseFormatter");
const TokenTypes = require("../config/enums/token-types-enum");
const User = require("../models/user");
const publicRoutes = require("../config/route-config");

/**
 * Middleware to authenticate users based on JWT token.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Next middleware function.
 */
const authMiddleware = async (req, res, next) => {
  if (publicRoutes.some((route) => req.originalUrl.startsWith(route))) {
    next();
    return;
  }
  const token = req.header("x-auth-token");

  if (!token) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json(
        formatResponse(
          HttpStatusCodes.UNAUTHORIZED,
          "Unauthorized",
          "No token, authorization denied",
          "Token is required for authentication."
        )
      );
  }

  let decoded;
  try {
    try {
      decoded = jwt.verify(token, process.env.GOOGLE_CLIENT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json(
            formatResponse(
              HttpStatusCodes.UNAUTHORIZED,
              "Unauthorized",
              "Token expired",
              "Your session has expired. Please log in again."
            )
          );
      }
      throw err; // Re-throw the error if it's not a TokenExpiredError
    }

    if (
      !decoded ||
      !decoded.id ||
      !decoded.role ||
      !decoded.tokenType ||
      !Object.values(Roles).includes(decoded.role) ||
      (decoded.tokenType !== TokenTypes.SESSION &&
        decoded.tokenType !== TokenTypes.GUEST)
    ) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json(
          formatResponse(
            HttpStatusCodes.UNAUTHORIZED,
            "Unauthorized",
            "Token is not valid",
            "Token does not contain a valid id, role, or tokenType."
          )
        );
    }

    // Skip database check if the token type is GUEST
    if (decoded.tokenType === TokenTypes.SESSION) {
      const userData = await User.findById(decoded.id);

      if (!userData) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json(
            formatResponse(
              HttpStatusCodes.UNAUTHORIZED,
              "Unauthorized",
              "User not found",
              "No user found for the provided token id."
            )
          );
      }

      req.email = userData.email;
      req.id = decoded.id;
      req.role = userData.role;
    }
    next();
  } catch (err) {
    res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json(
        formatResponse(
          HttpStatusCodes.UNAUTHORIZED,
          "Unauthorized",
          "Token is not valid",
          "Token verification failed."
        )
      );
  }
};

module.exports = authMiddleware;
