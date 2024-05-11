const CookieNames = require("../../common/constant/cookie.enum");
const NodeEnv = require("../../common/constant/env.enum");
const { AuthMessages } = require("./auth.messages");
const authService = require("./auth.service");
const autoBind = require("auto-bind");

class AuthController {
  #service;
  constructor() {
    autoBind(this);
    this.#service = authService;
  }
  async sendOTP(req, res, next) {
    try {
      const { mobile } = req.body;
      await this.#service.sendOTP(mobile);
      return res.json({
        message: AuthMessages.sendOtpSuccessfully,
      });
    } catch (error) {
      next(error);
    }
  }
  async checkOTP(req, res, next) {
    try {
      const { mobile, code } = req.body;
      const { accessToken, refreshToken } = await this.#service.checkOTP(
        mobile,
        code
      );
      return res.status(200).json({
        message: AuthMessages.LoginSuccess,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkRefreshToken(req, res, next) {
    try {
      const { refreshToken: token } = req.body;
      const { accessToken, refreshToken } =
        await this.#service.checkRefreshToken(token);
      return res.status(200).json({
        message: AuthMessages.LoginSuccess,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return res.clearCookie(CookieNames.AccessToken).status(200).json({
        message: AuthMessages.LogoutSuccessfuly,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
