const prisma = require('../config/prisma');
const { normalizeDateForDb } = require('../utils/dateTime');

class SlotRepository {
  async findByGroundAndDate(groundId, date) {
    const targetDate = normalizeDateForDb(date);

    return prisma.slot.findMany({
      where: {
        groundId: parseInt(groundId, 10),
        date: targetDate
      },
      orderBy: { startTime: 'asc' },
      include: {
        bookings: {
          where: {
            status: { in: ['HELD', 'CONFIRMED'] }
          },
          select: {
            id: true,
            status: true,
            userId: true
          }
        }
      }
    });
  }

  async findById(id, tx = prisma) {
    return tx.slot.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        ground: true,
        bookings: {
          where: { status: { in: ['HELD', 'CONFIRMED'] } }
        }
      }
    });
  }

  async create(data) {
    return prisma.slot.create({ data });
  }

  async createMany(dataList) {
    return prisma.slot.createMany({
      data: dataList,
      skipDuplicates: true
    });
  }

  async updateAvailability(id, isAvailable, tx = prisma) {
    return tx.slot.update({
      where: { id: parseInt(id, 10) },
      data: { isAvailable }
    });
  }

  async delete(id) {
    return prisma.slot.delete({
      where: { id: parseInt(id, 10) }
    });
  }
}

module.exports = new SlotRepository();
