const { UnauthorizedError, ForbiddenError } = require('../errors');
const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Access token required in Authorization header (Bearer <token>)'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(new UnauthorizedError('Invalid or expired authentication token', 'TOKEN_INVALID'));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return next(new UnauthorizedError('User account associated with token no longer exists', 'USER_NOT_FOUND'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before authorization'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`));
    }
    next();
  };
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, name: true, role: true }
        });
        if (user) req.user = user;
      } catch (e) {
        // Ignore invalid token in optionalAuth
      }
    }
    next();
  } catch (e) {
    next();
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
