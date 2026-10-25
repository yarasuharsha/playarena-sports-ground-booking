const prisma = require('../config/prisma');

class GroundRepository {
  async findMany({ where = {}, skip = 0, take = 10, orderBy = { createdAt: 'desc' } }) {
    return prisma.ground.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { slots: true, bookings: true }
        }
      }
    });
  }

  async count(where = {}) {
    return prisma.ground.count({ where });
  }

  async findById(id) {
    return prisma.ground.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        _count: {
          select: { slots: true, bookings: true }
        }
      }
    });
  }

  async create(data) {
    return prisma.ground.create({
      data
    });
  }

  async update(id, data) {
    return prisma.ground.update({
      where: { id: parseInt(id, 10) },
      data
    });
  }

  async delete(id) {
    // Soft delete ground by setting isActive to false
    return prisma.ground.update({
      where: { id: parseInt(id, 10) },
      data: { isActive: false }
    });
  }
}

module.exports = new GroundRepository();
