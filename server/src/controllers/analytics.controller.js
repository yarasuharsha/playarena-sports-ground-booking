const analyticsService = require('../services/analytics.service');
const { successResponse } = require('../utils/response');

class AnalyticsController {
  async getDashboard(req, res, next) {
    try {
      const stats = await analyticsService.getDashboardStats();
      return successResponse(res, stats, null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
