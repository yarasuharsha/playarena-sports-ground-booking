const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PlayArena Database Seeding...');

  // Clean existing records in reverse dependency order
  await prisma.booking.deleteMany({});
  await prisma.slot.deleteMany({});
  await prisma.ground.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users (with bcrypt hashed passwords)
  const passwordHashAdmin = await bcrypt.hash('AdminPass123!', 10);
  const passwordHashUser = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'PlayArena Admin',
      email: 'admin@playarena.com',
      password: passwordHashAdmin,
      phone: '+91 9876543210',
      role: 'ADMIN'
    }
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Harsha Vardhan Reddy',
      email: 'user@playarena.com',
      password: passwordHashUser,
      phone: '+91 9123456789',
      role: 'USER'
    }
  });

  const demoUser2 = await prisma.user.create({
    data: {
      name: 'Aditi Sharma',
      email: 'aditi@playarena.com',
      password: passwordHashUser,
      phone: '+91 9988776655',
      role: 'USER'
    }
  });

  console.log('✅ Seeded 3 users (1 Admin, 2 Regular Users)');

  // 2. Create Sports Grounds
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

  const createdGrounds = [];
  for (const g of groundsData) {
    const created = await prisma.ground.create({ data: g });
    createdGrounds.push(created);
  }
  console.log(`✅ Seeded ${createdGrounds.length} sports grounds`);

  // 3. Generate Slots for next 7 days for each ground
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const createdSlots = [];
  for (const ground of createdGrounds) {
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + dayOffset);

      for (const time of slotTimes) {
        const slot = await prisma.slot.create({
          data: {
            groundId: ground.id,
            date: slotDate,
            startTime: time.start,
            endTime: time.end,
            price: ground.hourlyPrice,
            isAvailable: true
          }
        });
        createdSlots.push(slot);
      }
    }
  }
  console.log(`✅ Seeded ${createdSlots.length} time slots across all grounds`);

  // 4. Create sample initial bookings
  if (createdSlots.length > 5) {
    // Book slot 0 for demoUser (CONFIRMED)
    const slot0 = createdSlots[0];
    await prisma.booking.create({
      data: {
        bookingReference: 'PA-20261024-0001',
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

    // Book slot 1 for demoUser2 (CONFIRMED)
    const slot1 = createdSlots[1];
    await prisma.booking.create({
      data: {
        bookingReference: 'PA-20261024-0002',
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

    // Book slot 2 for demoUser and then CANCELLED (slot remains available!)
    const slot2 = createdSlots[2];
    await prisma.booking.create({
      data: {
        bookingReference: 'PA-20261024-0003',
        userId: demoUser.id,
        groundId: slot2.groundId,
        slotId: slot2.id,
        totalAmount: slot2.price,
        status: 'CANCELLED',
        notes: 'Cancelled due to bad weather'
      }
    });
    // Note: slot2 remains available because booking was cancelled!
  }

  console.log('✅ Seeded initial demonstration bookings');
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
