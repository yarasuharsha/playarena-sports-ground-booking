const prisma = require('../config/prisma');

class BookingRepository {
  async findMany({ where = {}, skip = 0, take = 10, orderBy = { createdAt: 'desc' } }) {
    return prisma.booking.findMany({
      where,
      skip,
      take,
      orderBy,
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
  }

  async count(where = {}) {
    return prisma.booking.count({ where });
  }

  async findById(id) {
    return prisma.booking.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        ground: true,
        slot: true,
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
  }

  async findByReference(bookingReference) {
    return prisma.booking.findUnique({
      where: { bookingReference },
      include: {
        ground: true,
        slot: true,
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
  }

  async findActiveBookingForSlot(slotId, tx = prisma) {
    return tx.booking.findFirst({
      where: {
        slotId: parseInt(slotId, 10),
        status: { in: ['HELD', 'CONFIRMED'] }
      }
    });
  }

  async create(data, tx = prisma) {
    return tx.booking.create({
      data,
      include: {
        ground: true,
        slot: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async updateStatus(id, status, notes = null, tx = prisma) {
    const data = { status };
    if (notes !== null) {
      data.notes = notes;
    }
    return tx.booking.update({
      where: { id: parseInt(id, 10) },
      data,
      include: {
        ground: true,
        slot: true
      }
    });
  }
}

module.exports = new BookingRepository();
