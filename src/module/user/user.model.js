const { Schema, model } = require("mongoose");

const OTPSchema = new Schema({
  code: { type: String, required: false, default: undefined },
  expiresIn: { type: Number, unique: true, required: false, default: 0 },
});

const UserSchema = new Schema(
  {
    fullName: { type: String, required: false },
    mobile: { type: String, unique: true, required: true },
    role: { type: String, default: "USER" },
    otp: { type: OTPSchema },
    verifiedMobile: { type: Boolean, default: false, required: true },
    refreshToken: { type: String },
    accessToken: { type: String },
  },
  { timestamps: true }
);

const UserModel = model("user", UserSchema);
module.exports = UserModel;
