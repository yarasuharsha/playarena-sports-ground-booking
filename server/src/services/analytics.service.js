const prisma = require('../config/prisma');

class AnalyticsService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalGrounds,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueResult,
      totalSlots,
      bookedSlots,
      recentBookings,
      groundsList
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.ground.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'CONFIRMED' }
      }),
      prisma.slot.count(),
      prisma.slot.count({ where: { isAvailable: false } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          ground: { select: { name: true, sportType: true } },
          slot: { select: { date: true, startTime: true, endTime: true } },
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.ground.findMany({
        select: {
          id: true,
          name: true,
          sportType: true,
          _count: {
            select: { bookings: true }
          }
        }
      })
    ]);

    const totalRevenue = revenueResult._sum.totalAmount || 0;
    const utilizationRate = totalSlots > 0
      ? Math.round((bookedSlots / totalSlots) * 100)
      : 0;

    return {
      summary: {
        totalUsers,
        totalGrounds,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: parseFloat(totalRevenue),
        totalSlots,
        bookedSlots,
        utilizationRate
      },
      recentBookings,
      groundsPopularity: groundsList.map((g) => ({
        id: g.id,
        name: g.name,
        sportType: g.sportType,
        totalBookings: g._count.bookings
      }))
    };
  }
}

module.exports = new AnalyticsService();
