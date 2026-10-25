const slotService = require('../services/slot.service');
const { successResponse } = require('../utils/response');

class SlotController {
  async getGroundSlots(req, res, next) {
    try {
      const { id } = req.params;
      const { date } = req.query;
      const slots = await slotService.getSlotsByGroundAndDate(id, date);
      return successResponse(res, slots, null, 200);
    } catch (error) {
      next(error);
    }
  }

  async createSlot(req, res, next) {
    try {
      const slot = await slotService.createSlot(req.body);
      return successResponse(res, slot, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async batchGenerateSlots(req, res, next) {
    try {
      const result = await slotService.batchGenerateSlots(req.body);
      return successResponse(res, result, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteSlot(req, res, next) {
    try {
      await slotService.deleteSlot(req.params.id);
      return successResponse(res, { message: 'Slot deleted successfully' }, null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SlotController();
