const slotRepository = require('../repositories/slot.repository');
const groundRepository = require('../repositories/ground.repository');
const { NotFoundError, ConflictError, ValidationError } = require('../errors');
const { isSlotInPast, normalizeDateForDb } = require('../utils/dateTime');

class SlotService {
  async getSlotsByGroundAndDate(groundId, dateString) {
    const ground = await groundRepository.findById(groundId);
    if (!ground) {
      throw new NotFoundError(`Ground with ID ${groundId} not found.`);
    }

    const targetDate = normalizeDateForDb(dateString);
    const rawSlots = await slotRepository.findByGroundAndDate(groundId, targetDate);

    // Format slots with calculated status (ENDED, BOOKED, OPEN)
    const formattedSlots = rawSlots.map((slot) => {
      const activeBooking = slot.bookings && slot.bookings.length > 0 ? slot.bookings[0] : null;
      const isPast = isSlotInPast(slot.date, slot.startTime);
      const isAvailable = !activeBooking && slot.isAvailable && !isPast;

      let status;
      if (isPast) {
        status = 'ENDED';
      } else if (activeBooking || !slot.isAvailable) {
        status = 'BOOKED';
      } else {
        status = 'OPEN';
      }

      return {
        id: slot.id,
        groundId: slot.groundId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        isAvailable,
        isPast,
        status,
        bookingId: activeBooking ? activeBooking.id : null,
        bookedByUserId: activeBooking ? activeBooking.userId : null
      };
    });

    // Deduplicate slots by startTime to guarantee each time range appears exactly once
    const uniqueSlotsMap = new Map();
    for (const slot of formattedSlots) {
      if (!uniqueSlotsMap.has(slot.startTime)) {
        uniqueSlotsMap.set(slot.startTime, slot);
      } else {
        const existing = uniqueSlotsMap.get(slot.startTime);
        // Prefer non-past slot if there's any discrepancy
        if (existing.isPast && !slot.isPast) {
          uniqueSlotsMap.set(slot.startTime, slot);
        }
      }
    }

    return Array.from(uniqueSlotsMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async createSlot(data) {
    const ground = await groundRepository.findById(data.groundId);
    if (!ground) {
      throw new NotFoundError(`Ground with ID ${data.groundId} not found.`);
    }

    // Convert date string to normalized UTC Date object
    const slotDate = normalizeDateForDb(data.date);

    try {
      return await slotRepository.create({
        groundId: parseInt(data.groundId, 10),
        date: slotDate,
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price !== undefined ? parseFloat(data.price) : ground.hourlyPrice,
        isAvailable: true
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictError('A slot for this ground, date, and start time already exists.');
      }
      throw err;
    }
  }

  async batchGenerateSlots({ groundId, startDate, days = 7, slotTimes }) {
    const ground = await groundRepository.findById(groundId);
    if (!ground) {
      throw new NotFoundError(`Ground with ID ${groundId} not found.`);
    }

    const baseDate = normalizeDateForDb(startDate);

    const slotsToInsert = [];
    for (let d = 0; d < days; d++) {
      const currentDay = new Date(baseDate);
      currentDay.setUTCDate(baseDate.getUTCDate() + d);

      for (const t of slotTimes) {
        slotsToInsert.push({
          groundId: parseInt(groundId, 10),
          date: currentDay,
          startTime: t.startTime,
          endTime: t.endTime,
          price: t.price ? parseFloat(t.price) : ground.hourlyPrice,
          isAvailable: true
        });
      }
    }

    const result = await slotRepository.createMany(slotsToInsert);
    return {
      message: `Successfully created ${result.count} slots.`,
      count: result.count
    };
  }

  async deleteSlot(id) {
    const slot = await slotRepository.findById(id);
    if (!slot) {
      throw new NotFoundError(`Slot with ID ${id} not found.`);
    }
    if (slot.bookings && slot.bookings.length > 0) {
      throw new ValidationError('Cannot delete a slot with active bookings. Cancel the booking first.');
    }
    return slotRepository.delete(id);
  }
}

module.exports = new SlotService();
