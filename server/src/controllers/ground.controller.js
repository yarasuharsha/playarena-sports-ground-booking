const groundService = require('../services/ground.service');
const { successResponse } = require('../utils/response');

class GroundController {
  async listGrounds(req, res, next) {
    try {
      const { grounds, meta } = await groundService.listGrounds(req.query);
      return successResponse(res, grounds, meta, 200);
    } catch (error) {
      next(error);
    }
  }

  async getGroundById(req, res, next) {
    try {
      const ground = await groundService.getGroundById(req.params.id);
      return successResponse(res, ground, null, 200);
    } catch (error) {
      next(error);
    }
  }

  async createGround(req, res, next) {
    try {
      const ground = await groundService.createGround(req.body);
      return successResponse(res, ground, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateGround(req, res, next) {
    try {
      const ground = await groundService.updateGround(req.params.id, req.body);
      return successResponse(res, ground, null, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteGround(req, res, next) {
    try {
      await groundService.deleteGround(req.params.id);
      return successResponse(res, { message: 'Ground successfully deactivated' }, null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GroundController();
