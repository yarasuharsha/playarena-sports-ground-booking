const groundRepository = require('../repositories/ground.repository');
const { NotFoundError } = require('../errors');

class GroundService {
  async listGrounds(query = {}) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 9;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true
    };

    if (query.sportType && query.sportType !== 'All') {
      where.sportType = {
        equals: query.sportType,
        mode: 'insensitive'
      };
    }

    if (query.city) {
      where.city = {
        equals: query.city,
        mode: 'insensitive'
      };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.hourlyPrice = {};
      if (query.minPrice !== undefined && query.minPrice !== '') {
        where.hourlyPrice.gte = parseFloat(query.minPrice);
      }
      if (query.maxPrice !== undefined && query.maxPrice !== '') {
        where.hourlyPrice.lte = parseFloat(query.maxPrice);
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    // Sorting with deterministic secondary order
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const orderBy = [{ [sortBy]: order }, { id: order }];

    const [grounds, total] = await Promise.all([
      groundRepository.findMany({ where, skip, take: limit, orderBy }),
      groundRepository.count(where)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      grounds,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async getGroundById(id) {
    const ground = await groundRepository.findById(id);
    if (!ground) {
      throw new NotFoundError(`Sports ground with ID ${id} was not found.`, 'GROUND_NOT_FOUND');
    }
    return ground;
  }

  async createGround(data) {
    return groundRepository.create(data);
  }

  async updateGround(id, data) {
    await this.getGroundById(id);
    return groundRepository.update(id, data);
  }

  async deleteGround(id) {
    await this.getGroundById(id);
    return groundRepository.delete(id);
  }
}

module.exports = new GroundService();
