// Define the expiration times
const SESSION_EXPIRY_TIME = 3600; // 1 hour in seconds
const REFRESH_TOKEN_EXPIRY_TIME = 365 * 24 * 60 * 60; // 1 year in seconds
const GUEST_TOKEN_EXPIRY_TIME = 24 * 60 * 60; // 1 day in seconds
const MAGIC_TOKEN_EXPIRY_TIME = 7200; //2 hour in seconds
const SALT_ROUNDS = 10;
// Export the constants
module.exports = {
  SESSION_EXPIRY_TIME,
  REFRESH_TOKEN_EXPIRY_TIME,
  GUEST_TOKEN_EXPIRY_TIME,
  MAGIC_TOKEN_EXPIRY_TIME,
  SALT_ROUNDS,
};
