const bookingService = require('../services/booking.service');
const { successResponse } = require('../utils/response');

const { ForbiddenError } = require('../errors');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const { slotId, notes } = req.body;
      const booking = await bookingService.createBooking({
        userId: req.user.id,
        slotId,
        notes
      });
      return successResponse(res, booking, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async listBookings(req, res, next) {
    try {
      const isAllRequested = req.query.all === 'true' || req.query.all === true;

      // Ensure regular users cannot access all users' bookings by calling the API directly
      if (isAllRequested && req.user.role !== 'ADMIN') {
        throw new ForbiddenError('You are not authorized to view all platform bookings. Admin privileges required.');
      }

      const { bookings, meta } = await bookingService.listBookings({
        userId: isAllRequested ? (req.query.userId ? parseInt(req.query.userId, 10) : undefined) : req.user.id,
        userRole: req.user.role,
        isAllRequested,
        status: req.query.status,
        groundId: req.query.groundId,
        date: req.query.date,
        tab: req.query.tab,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      });
      return successResponse(res, bookings, meta, 200);
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
      return successResponse(res, booking, null, 200);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const booking = await bookingService.cancelBooking(id, req.user.id, req.user.role, reason);
      return successResponse(res, booking, null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
