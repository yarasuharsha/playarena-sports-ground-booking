const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { normalizeDateForDb, getCurrentDateTimeInTimezone } = require('../src/utils/dateTime');

const prisma = new PrismaClient();

const groundsData = [
  {
    name: 'Apex Arena Football Turf',
    sportType: 'Football',
    description: 'FIFA-approved artificial 7-a-side football turf with floodlights, player dugout, changing rooms, and high rebound perimeter fencing. Ideal for competitive matches and team practice.',
    location: '12th Main, Indiranagar, Near Metro Station',
    city: 'Bangalore',
    hourlyPrice: 1500.00,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    facilities: ['Floodlights', 'Changing Rooms', 'Drinking Water', 'Parking', 'Equipment Rental', 'Showers'],
    isActive: true,
    rating: 4.9
  },
  {
    name: 'Thunderbolt Cricket Stadium & Nets',
    sportType: 'Cricket',
    description: 'Professional outdoor cricket facility featuring 4 practice turf nets with bowling machines, full 20-yard pitch turf, pavilion seating, and tournament-grade LED illumination.',
    location: 'Sarjapur Main Road, Bellandur',
    city: 'Bangalore',
    hourlyPrice: 1800.00,
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    facilities: ['Bowling Machine', 'Turf Nets', 'Scoreboard', 'Seating Pavilion', 'Parking', 'Cafeteria'],
    isActive: true,
    rating: 4.8
  },
  {
    name: 'SmashPoint Badminton Academy',
    sportType: 'Badminton',
    description: 'Air-conditioned wooden-cushioned indoor badminton courts with BWF standard synthetic mats, anti-glare shadows, racket stringing services, and certified coaching staff.',
    location: 'Koramangala 4th Block, 80 Feet Road',
    city: 'Bangalore',
    hourlyPrice: 650.00,
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    facilities: ['Air Conditioning', 'BWF Mats', 'Locker Room', 'Pro Shop', 'Drinking Water', 'Parking'],
    isActive: true,
    rating: 4.7
  },
  {
    name: 'ClayCourt Tennis Club',
    sportType: 'Tennis',
    description: 'French Open-style red clay tennis courts surrounded by natural greenery. Features ball boy services, night illumination, and tournament viewing stands.',
    location: 'Jubilee Hills, Road No. 36',
    city: 'Hyderabad',
    hourlyPrice: 950.00,
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
    facilities: ['Clay Courts', 'Floodlights', 'Coaching Available', 'Locker Rooms', 'Refreshment Bar'],
    isActive: true,
    rating: 4.9
  },
  {
    name: 'Skyline Hoop Arena',
    sportType: 'Basketball',
    description: 'Full-court indoor hardwood basketball arena with glass backboards, electronic shot clocks, team bench areas, and sound system for events and league games.',
    location: 'Hitec City, Madhapur',
    city: 'Hyderabad',
    hourlyPrice: 1200.00,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    facilities: ['Hardwood Floor', 'Electronic Shot Clock', 'Audio System', 'Bleachers', 'First Aid Station'],
    isActive: true,
    rating: 4.6
  },
  {
    name: 'Metro Pickleball Hub',
    sportType: 'Pickleball',
    description: 'Modern 4-court dedicated pickleball facility with cushioned acrylic surfaces, tournament nets, paddles & balls included with every booking, and social lounge.',
    location: 'Bandra West, Hill Road',
    city: 'Mumbai',
    hourlyPrice: 700.00,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    facilities: ['Paddles Included', 'Lounge Area', 'Café', 'Floodlights', 'Free Wi-Fi', 'Parking'],
    isActive: true,
    rating: 4.7
  }
];

const slotTimes = [
  { start: '06:00', end: '07:00' },
  { start: '07:00', end: '08:00' },
  { start: '08:00', end: '09:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
  { start: '19:00', end: '20:00' },
  { start: '20:00', end: '21:00' }
];

async function main() {
  console.log('🌱 Starting PlayArena Idempotent Database Seeding...');

  // Opt-in destructive mode only in non-production with SEED_RESET=true
  if (process.env.SEED_RESET === 'true' && process.env.NODE_ENV !== 'production') {
    console.log('⚠️ SEED_RESET=true and not in production. Wiping existing records...');
    await prisma.booking.deleteMany({});
    await prisma.slot.deleteMany({});
    await prisma.ground.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('🧹 Cleaned existing records.');
  }

  // 1. Seed / Upsert Users (admin, demo user, demo user 2)
  const usersToSeed = [
    {
      email: 'admin@playarena.com',
      name: 'PlayArena Admin',
      phone: '+91 9876543210',
      role: 'ADMIN',
      passwordPlain: 'AdminPass123!'
    },
    {
      email: 'user@playarena.com',
      name: 'Harsha Vardhan Reddy',
      phone: '+91 9123456789',
      role: 'USER',
      passwordPlain: 'Password123!'
    },
    {
      email: 'aditi@playarena.com',
      name: 'Aditi Sharma',
      phone: '+91 9988776655',
      role: 'USER',
      passwordPlain: 'Password123!'
    }
  ];

  const seededUsers = {};
  for (const u of usersToSeed) {
    const passwordHash = await bcrypt.hash(u.passwordPlain, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        password: passwordHash
      },
      update: process.env.SEED_RESET_PASSWORDS === 'true' ? { password: passwordHash } : {}
    });
    seededUsers[u.email] = user;
  }
  console.log(`✅ Seeded/Upserted ${Object.keys(seededUsers).length} users`);

  // 2. Seed / Upsert Grounds (findFirst by name and city)
  const seededGrounds = [];
  for (const g of groundsData) {
    let ground = await prisma.ground.findFirst({
      where: { name: g.name, city: g.city }
    });

    if (!ground) {
      ground = await prisma.ground.create({ data: g });
    } else {
      ground = await prisma.ground.update({
        where: { id: ground.id },
        data: {
          sportType: g.sportType,
          description: g.description,
          location: g.location,
          hourlyPrice: g.hourlyPrice,
          imageUrl: g.imageUrl,
          facilities: g.facilities,
          isActive: g.isActive,
          rating: g.rating
        }
      });
    }
    seededGrounds.push(ground);
  }
  console.log(`✅ Seeded/Upserted ${seededGrounds.length} sports grounds`);

  // 3. Generate Slots for NEXT 14 days (configurable with SEED_SLOT_DAYS) using createMany({ skipDuplicates: true })
  const slotDays = parseInt(process.env.SEED_SLOT_DAYS, 10) || 14;
  const { dateStr: todayKolkata } = getCurrentDateTimeInTimezone('Asia/Kolkata');
  const baseDate = new Date(`${todayKolkata}T00:00:00.000Z`);

  let totalSlotsInserted = 0;
  for (const ground of seededGrounds) {
    const slotsToInsert = [];
    for (let dayOffset = 0; dayOffset < slotDays; dayOffset++) {
      const curDate = new Date(baseDate);
      curDate.setUTCDate(baseDate.getUTCDate() + dayOffset);
      const dateStr = curDate.toISOString().slice(0, 10);
      const normalizedDate = normalizeDateForDb(dateStr, 'Asia/Kolkata');

      for (const time of slotTimes) {
        slotsToInsert.push({
          groundId: ground.id,
          date: normalizedDate,
          startTime: time.start,
          endTime: time.end,
          price: ground.hourlyPrice,
          isAvailable: true
        });
      }
    }

    const res = await prisma.slot.createMany({
      data: slotsToInsert,
      skipDuplicates: true
    });
    totalSlotsInserted += res.count;
  }
  console.log(`✅ Slot synchronization complete (${totalSlotsInserted} new slots added across ${seededGrounds.length} grounds for next ${slotDays} days)`);

  // 4. Sample Bookings: only create if no bookings exist at all
  const existingBookingsCount = await prisma.booking.count();
  if (existingBookingsCount === 0) {
    console.log('ℹ️ No bookings exist. Creating initial demonstration bookings...');
    const ground1 = seededGrounds[0];
    const demoUser = seededUsers['user@playarena.com'];
    const demoUser2 = seededUsers['aditi@playarena.com'];

    // Pick tomorrow's 17:00 slot on ground 1
    const tomorrow = new Date(baseDate);
    tomorrow.setUTCDate(baseDate.getUTCDate() + 1);
    const tomorrowNormalized = normalizeDateForDb(tomorrow.toISOString().slice(0, 10), 'Asia/Kolkata');
    const tomorrowCompact = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');

    const slot0 = await prisma.slot.findUnique({
      where: {
        groundId_date_startTime: {
          groundId: ground1.id,
          date: tomorrowNormalized,
          startTime: '17:00'
        }
      }
    });

    if (slot0 && demoUser) {
      await prisma.booking.create({
        data: {
          bookingReference: `PA-${tomorrowCompact}-0001`,
          userId: demoUser.id,
          groundId: slot0.groundId,
          slotId: slot0.id,
          totalAmount: slot0.price,
          status: 'CONFIRMED',
          notes: 'Corporate friendly match'
        }
      });
      await prisma.slot.update({
        where: { id: slot0.id },
        data: { isAvailable: false }
      });
      console.log('✅ Created demonstration booking 1 (CONFIRMED)');
    }

    // Pick day 2 08:00 slot on ground 2
    const ground2 = seededGrounds[1] || seededGrounds[0];
    const day2 = new Date(baseDate);
    day2.setUTCDate(baseDate.getUTCDate() + 2);
    const day2Normalized = normalizeDateForDb(day2.toISOString().slice(0, 10), 'Asia/Kolkata');
    const day2Compact = day2.toISOString().slice(0, 10).replace(/-/g, '');

    const slot1 = await prisma.slot.findUnique({
      where: {
        groundId_date_startTime: {
          groundId: ground2.id,
          date: day2Normalized,
          startTime: '08:00'
        }
      }
    });

    if (slot1 && demoUser2) {
      await prisma.booking.create({
        data: {
          bookingReference: `PA-${day2Compact}-0002`,
          userId: demoUser2.id,
          groundId: slot1.groundId,
          slotId: slot1.id,
          totalAmount: slot1.price,
          status: 'CONFIRMED',
          notes: 'Weekend morning training session'
        }
      });
      await prisma.slot.update({
        where: { id: slot1.id },
        data: { isAvailable: false }
      });
      console.log('✅ Created demonstration booking 2 (CONFIRMED)');
    }
  } else {
    console.log(`ℹ️ Existing bookings found (${existingBookingsCount}). Skipping sample bookings.`);
  }

  console.log('✨ PlayArena Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
