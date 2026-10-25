const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../errors');

class AuthService {
  async register({ email, password, name, phone }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'USER'
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password credentials', 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password credentials', 'INVALID_CREDENTIALS');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  async updateProfile(userId, updateData) {
    // Only allow safe fields
    const safeData = {};
    if (updateData.name) safeData.name = updateData.name;
    if (updateData.phone !== undefined) safeData.phone = updateData.phone;

    const user = await userRepository.update(userId, safeData);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      updatedAt: user.updatedAt
    };
  }
}

module.exports = new AuthService();
