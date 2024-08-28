// Define routes that should not apply authMiddleware
const publicRoutes = ["/health", "/api/v1/auth"];

module.exports = publicRoutes;
