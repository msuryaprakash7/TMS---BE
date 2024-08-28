const express = require("express");
const router = express.Router();
const {
  googleAuth,
  magicLinkAuth,
  signUp,
  refreshSession,
  getUser,
} = require("../services/auth-service");

router.post("/google", googleAuth);
router.get("/login", getUser);
router.post("/signup", signUp);
router.get("/refresh-session", refreshSession);

module.exports = router;
