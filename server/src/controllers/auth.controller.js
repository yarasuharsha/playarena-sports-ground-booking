const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name, phone } = req.body;
      const result = await authService.register({ email, password, name, phone });
      return successResponse(res, result, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return successResponse(res, result, null, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getProfile(req.user.id);
      return successResponse(res, result, null, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = await authService.updateProfile(req.user.id, req.body);
      return successResponse(res, result, null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
