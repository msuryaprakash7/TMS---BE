const HttpStatusCodes = require("../../shared/utils/http-codes");
const formatResponse = require("../../shared/utils/responseFormatter");
const { RoleLevels } = require("../config/enums/roles-enum");

/**
 * Middleware to check user roles for route access based on levels.
 * @param {string} minRole - The minimum role required to access the route.
 * @returns {function} Middleware function.
 */
const authorizeRole = (minRole) => {
  return (req, res, next) => {
    try {
      // Extract user role from the request object
      const userRole = req.role;

      // If the role is not present, deny access
      if (!userRole) {
        return res
          .status(HttpStatusCodes.FORBIDDEN)
          .json(
            formatResponse(
              HttpStatusCodes.FORBIDDEN,
              "Forbidden",
              "Access denied",
              "User role is not defined."
            )
          );
      }

      // Check if the user's role level is sufficient
      const userRoleLevel = RoleLevels[userRole.toUpperCase()]?.level;
      const minRoleLevel = RoleLevels[minRole.toUpperCase()]?.level;

      if (userRoleLevel === undefined || minRoleLevel === undefined) {
        throw new Error("Invalid role configuration.");
      }

      if (userRoleLevel < minRoleLevel) {
        return res
          .status(HttpStatusCodes.FORBIDDEN)
          .json(
            formatResponse(
              HttpStatusCodes.FORBIDDEN,
              "Forbidden",
              "Access denied",
              "You do not have the required role level to access this resource."
            )
          );
      }

      // User has the required role level, proceed to the next middleware or route handler
      next();
    } catch (err) {
      console.error("Error in authorizeRole middleware: ", err);
      return res
        .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
        .json(
          formatResponse(
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
            "Internal Server Error",
            "An internal server error occurred while processing your request.",
            err.message
          )
        );
    }
  };
};

module.exports = authorizeRole;
