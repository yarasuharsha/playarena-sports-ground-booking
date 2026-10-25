const prisma = require('../config/prisma');

class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id, 10) }
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  async create(userData) {
    return prisma.user.create({
      data: {
        ...userData,
        email: userData.email.toLowerCase()
      }
    });
  }

  async update(id, updateData) {
    return prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });
  }
}

module.exports = new UserRepository();
