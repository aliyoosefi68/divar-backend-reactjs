const { Router } = require("express");
const authCotroller = require("./auth.cotroller");
const Authorization = require("../../common/guard/authorization.guard");
const router = Router();

router.post("/send-otp", authCotroller.sendOTP);
router.post("/check-otp", authCotroller.checkOTP);
router.post("/check-refresh-token", authCotroller.checkRefreshToken);
router.get("/logout", Authorization, authCotroller.logout);

module.exports = {
  AuthRouter: router,
};
