const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, default: "" },
  firstName: { type: String },
  lastName: { type: String },
  picture: { type: String },
  mobile: { type: String, default: "" },
  password: { type: String, default: "" },
  loginFlow: { type: String, enum: ["G", "M"], required: true },
  isEmailVerified: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: false },
  blockUser: { type: Boolean, default: false },
  lastLogged: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  createdDate: { type: Date, default: Date.now },
  role: { type: String, default: "user" },
});

const User = mongoose.model("user", userSchema);
module.exports = User;
