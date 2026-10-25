const prisma = require('../config/prisma');
const bookingRepository = require('../repositories/booking.repository');
const slotRepository = require('../repositories/slot.repository');
const groundRepository = require('../repositories/ground.repository');
const {
  AppError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  SlotAlreadyBookedError,
  ConflictError
} = require('../errors');
const {
  isSlotInPast,
  isSlotEndTimePassed,
  getDerivedBookingStatus
} = require('../utils/dateTime');

class BookingService {
  /**
   * Create Booking with Database-backed Concurrency Protection & Transaction Isolation
   */
  async createBooking({ userId, slotId, notes }) {
    const parsedSlotId = parseInt(slotId, 10);

    return prisma.$transaction(async (tx) => {
      // 1. Fetch slot with existing active bookings inside transaction
      const slot = await tx.slot.findUnique({
        where: { id: parsedSlotId },
        include: {
          ground: true,
          bookings: {
            where: {
              status: { in: ['HELD', 'CONFIRMED'] }
            }
          }
        }
      });

      if (!slot) {
        throw new NotFoundError(`Time slot with ID ${parsedSlotId} not found.`, 'SLOT_NOT_FOUND');
      }

      if (!slot.ground || !slot.ground.isActive) {
        throw new ValidationError('The sports ground associated with this slot is currently inactive.');
      }

      // Check whether the slot is in the past (date before today OR today with start time elapsed)
      if (isSlotInPast(slot.date, slot.startTime)) {
        throw new ValidationError('Cannot book past dates or time slots that have already started. Please select an upcoming slot.');
      }

      // 2. Pre-check slot availability (Fast-fail check)
      if (!slot.isAvailable || (slot.bookings && slot.bookings.length > 0)) {
        throw new SlotAlreadyBookedError('This time slot is no longer available. Another booking has already reserved it.');
      }

      // 3. Trusted backend price calculation (Never trust client prices)
      const calculatedTotal = slot.price;

      // 4. Generate unique human-readable booking reference
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bookingReference = `PA-${datePart}-${randomPart}`;

      // 5. Atomic Booking Insert
      // Note: PostgreSQL partial unique index `unique_active_booking_per_slot`
      // guarantees that even if two concurrent requests pass step 2 simultaneously,
      // exactly one will succeed and the other will trigger a unique constraint violation.
      let createdBooking;
      try {
        createdBooking = await tx.booking.create({
          data: {
            bookingReference,
            userId,
            groundId: slot.groundId,
            slotId: slot.id,
            totalAmount: calculatedTotal,
            status: 'CONFIRMED',
            notes: notes || null
          },
          include: {
            ground: {
              select: {
                id: true,
                name: true,
                sportType: true,
                location: true,
                city: true,
                imageUrl: true
              }
            },
            slot: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                price: true
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        });
      } catch (err) {
        if (err.code === 'P2002') {
          throw new SlotAlreadyBookedError('Concurrency conflict: This slot was just booked by another user.');
        }
        throw err;
      }

      // 6. Update slot availability flag
      await tx.slot.update({
        where: { id: slot.id },
        data: { isAvailable: false }
      });

      return createdBooking;
    });
  }

  /**
   * Cancel an eligible booking (Owner or Admin only)
   * Restores slot availability atomically
   */
  async cancelBooking(bookingId, userId, userRole, cancellationReason = null) {
    const parsedId = parseInt(bookingId, 10);

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: parsedId },
        include: { slot: true, ground: true }
      });

      if (!booking) {
        throw new NotFoundError(`Booking with ID ${parsedId} not found.`, 'BOOKING_NOT_FOUND');
      }

      // Authorization check: Only booking owner or admin can cancel
      if (booking.userId !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenError('You are not authorized to cancel this booking.', 'NOT_BOOKING_OWNER');
      }

      // Status check
      if (booking.status === 'CANCELLED') {
        throw new AppError('This booking is already cancelled.', 400, 'ALREADY_CANCELLED');
      }

      // Check if slot end time has already passed
      if (booking.slot && isSlotEndTimePassed(booking.slot.date, booking.slot.endTime)) {
        throw new AppError('Cannot cancel a booking whose scheduled time slot has already passed.', 400, 'BOOKING_ALREADY_PASSED');
      }

      const updatedNotes = cancellationReason
        ? `${booking.notes || ''} [Cancelled: ${cancellationReason}]`.trim()
        : booking.notes;

      // 1. Transition booking status to CANCELLED
      const updatedBooking = await tx.booking.update({
        where: { id: parsedId },
        data: {
          status: 'CANCELLED',
          notes: updatedNotes
        },
        include: {
          ground: true,
          slot: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // 2. Mark the slot as available again
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { isAvailable: true }
      });

      return {
        ...updatedBooking,
        isPast: isSlotEndTimePassed(updatedBooking.slot?.date, updatedBooking.slot?.endTime),
        displayStatus: 'CANCELLED',
        canCancel: false
      };
    });
  }

  async listBookings({
    userId,
    userRole,
    isAllRequested = false,
    status,
    groundId,
    date,
    tab,
    search,
    page = 1,
    limit = 10
  }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Role-based visibility:
    // Regular users can ONLY EVER see their own bookings.
    // Admins only see all bookings when isAllRequested is explicitly true.
    if (userRole !== 'ADMIN' || !isAllRequested) {
      where.userId = userId;
    } else if (userId && isAllRequested) {
      where.userId = parseInt(userId, 10);
    }

    if (status && ['HELD', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    if (groundId) {
      where.groundId = parseInt(groundId, 10);
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.slot = {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      };
    }

    if (search) {
      const cleanSearch = String(search).trim();
      if (cleanSearch) {
        where.OR = [
          { bookingReference: { contains: cleanSearch, mode: 'insensitive' } },
          { user: { name: { contains: cleanSearch, mode: 'insensitive' } } },
          { user: { email: { contains: cleanSearch, mode: 'insensitive' } } },
          { ground: { name: { contains: cleanSearch, mode: 'insensitive' } } }
        ];
      }
    }

    // Helper to annotate booking
    const annotateBooking = (b) => {
      const isPast = b.slot ? isSlotEndTimePassed(b.slot.date, b.slot.endTime) : false;
      const displayStatus = getDerivedBookingStatus(b);
      const canCancel = b.status === 'CONFIRMED' && !isPast;
      return {
        ...b,
        isPast,
        displayStatus,
        canCancel
      };
    };

    // If tab is specified (e.g. UPCOMING, PAST, CANCELLED)
    if (tab && ['UPCOMING', 'PAST', 'CANCELLED'].includes(tab)) {
      if (tab === 'CANCELLED') {
        where.status = 'CANCELLED';
      }

      // Fetch candidates to filter accurately by time
      const rawCandidates = await bookingRepository.findMany({
        where,
        take: 500,
        orderBy: { createdAt: 'desc' }
      });

      const annotated = rawCandidates.map(annotateBooking);

      let filtered;
      if (tab === 'UPCOMING') {
        filtered = annotated.filter((b) => b.status === 'CONFIRMED' && !b.isPast);
      } else if (tab === 'PAST') {
        filtered = annotated.filter((b) => b.isPast);
      } else if (tab === 'CANCELLED') {
        filtered = annotated.filter((b) => b.status === 'CANCELLED');
      } else {
        filtered = annotated;
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / limitNum) || 1;
      const paginated = filtered.slice(skip, skip + limitNum);

      return {
        bookings: paginated,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    }

    // Standard database pagination
    const [rawBookings, total] = await Promise.all([
      bookingRepository.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
      bookingRepository.count(where)
    ]);

    const bookings = rawBookings.map(annotateBooking);
    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      bookings,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  async getBookingById(id, userId, userRole) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError(`Booking with ID ${id} not found.`);
    }

    if (booking.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You are not authorized to view this booking.');
    }

    return booking;
  }
}

module.exports = new BookingService();
