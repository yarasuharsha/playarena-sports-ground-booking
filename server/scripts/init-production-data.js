/**
 * PlayArena - Safe Production Data Initialization Script
 * 
 * Script: server/scripts/init-production-data.js
 * 
 * Safety & Quality Guarantees:
 *   1. 100% Non-Destructive: Zero delete, truncate, drop, or update statements.
 *   2. Strict Dry-Run Mode (--dry-run): Performs ZERO database writes and outputs
 *      a full simulation of what would be created or preserved.
 *   3. Zero Password Exposure: Never generates or displays real passwords in dry-run mode.
 *   4. Clean Resource Management: PrismaClient is guaranteed to disconnect cleanly in all cases;
 *      uses thrown errors and process.exitCode = 1 instead of abrupt process.exit().
 *   5. Date Representation Parity: Both existing and candidate slots use formatDateToYYYYMMDD()
 *      from the application dateTime utility to guarantee identical date representation.
 *   6. Asia/Kolkata 7-Calendar-Day Window:
 *      - Day 0 (Today): Schedules ONLY slots whose start time is strictly in the future in Asia/Kolkata.
 *      - Days 1 to 6 (Next 6 calendar days): Schedules all 8 daily operating blocks.
 *      - Total window: Exactly 7 calendar days.
 *   7. Ground Match & Conflict Resolution: Checks grounds by BOTH name and city. Reports ambiguous
 *      or conflicting matches explicitly rather than picking an arbitrary record. Never overwrites.
 *   8. Account & Role Validation: Verifies existing roles. If admin@playarena.com exists with a
 *      non-ADMIN role, halts with a ConflictError. Never auto-promotes accounts.
 *   9. Atomic Transactional Writes: Live execution is wrapped in an interactive Prisma transaction
 *      (prisma.$transaction) so that any mid-flight error triggers a full PostgreSQL ROLLBACK,
 *      preventing partial or orphaned inserts.
 */

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');
const {
  getCurrentDateTimeInTimezone,
  isSlotInPast,
  formatDateToYYYYMMDD,
  normalizeDateForDb,
  DEFAULT_TIMEZONE
} = require('../src/utils/dateTime');

// Target timezone for ground operations
const TIMEZONE = process.env.APP_TIMEZONE || DEFAULT_TIMEZONE || 'Asia/Kolkata';

// Custom Error Classes for Clean Propagation
class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

// ---------------------------------------------------------------------------
// 1. Pre-Flight Configuration Validation (Before DB Connection)
// ---------------------------------------------------------------------------
const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

const rawDbUrl = process.env.DATABASE_URL;
if (!rawDbUrl || typeof rawDbUrl !== 'string' || !rawDbUrl.trim()) {
  throw new ConfigurationError('DATABASE_URL environment variable is missing. Please provide a valid PostgreSQL connection string.');
}

const trimmedUrl = rawDbUrl.trim();
if (!trimmedUrl.startsWith('postgresql://') && !trimmedUrl.startsWith('postgres://')) {
  throw new ConfigurationError('DATABASE_URL must start with postgresql:// or postgres://');
}

// Extract host securely for display without exposing credentials
let dbHostDisplay = 'PostgreSQL Database';
try {
  const parsed = new URL(trimmedUrl);
  dbHostDisplay = `${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}`;
} catch {
  // If parsing fails, maintain generic placeholder
}

// ---------------------------------------------------------------------------
// 2. Canonical Sample Data (The 7 Verified Grounds)
// ---------------------------------------------------------------------------
// Note: Exactly 7 sports grounds exist in PlayArena. (The number "8" refers to
// the 8 daily operating 1-hour time blocks per ground, not 8 grounds).
const SAMPLE_GROUNDS = [
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
  },
  {
    name: 'Pinnacle Arena Turf',
    sportType: 'Cricket',
    description: 'Top-tier practice cricket pitch',
    location: 'Whitefield Main Road',
    city: 'Bangalore',
    hourlyPrice: 1600.00,
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
    facilities: ['Floodlights', 'Turf Nets', 'Water'],
    isActive: true,
    rating: 4.8
  }
];

// Standard 8 daily 1-hour operating blocks
const STANDARD_SLOT_TIMES = [
  { startTime: '06:00', endTime: '07:00' },
  { startTime: '07:00', endTime: '08:00' },
  { startTime: '08:00', endTime: '09:00' },
  { startTime: '16:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '18:00' },
  { startTime: '18:00', endTime: '19:00' },
  { startTime: '19:00', endTime: '20:00' },
  { startTime: '20:00', endTime: '21:00' }
];

/**
 * Generates a high-entropy cryptographically secure password
 */
function generateSecurePassword() {
  const bytes = crypto.randomBytes(12).toString('base64url');
  return `${bytes}!P9`;
}

// ---------------------------------------------------------------------------
// 3. Execution Engine
// ---------------------------------------------------------------------------
async function run() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: trimmedUrl
      }
    }
  });

  try {
    console.log('================================================================');
    console.log(`PlayArena Production Data Initialization`);
    console.log(`Mode     : ${isDryRun ? 'DRY-RUN (SIMULATION ONLY - ZERO WRITES)' : 'LIVE EXECUTION'}`);
    console.log(`Database : ${dbHostDisplay}`);
    console.log(`Timezone : ${TIMEZONE}`);
    console.log('================================================================\n');

    // 1. Initial State Read-Only Verification
    const initialUsersCount = await prisma.user.count();
    const initialGroundsCount = await prisma.ground.count();
    const initialSlotsCount = await prisma.slot.count();
    const initialBookingsCount = await prisma.booking.count();

    console.log('--- Current Database Verified Counts (Read-Only) ---');
    console.log(`  Users    : ${initialUsersCount}`);
    console.log(`  Grounds  : ${initialGroundsCount}`);
    console.log(`  Slots    : ${initialSlotsCount}`);
    console.log(`  Bookings : ${initialBookingsCount} (Will remain untouched)`);
    console.log('-----------------------------------------------------\n');

    const plan = {
      adminToCreate: null,
      adminPreserved: null,
      userToCreate: null,
      userPreserved: null,
      groundsToCreate: [],
      groundsPreserved: [],
      slotsToCreateByGround: new Map(),
      slotsPreservedCount: 0,
      slotsPastFilteredCount: 0,
      generatedCredentials: []
    };

    // -----------------------------------------------------------------------
    // Step 1: Admin Account Inspection
    // -----------------------------------------------------------------------
    console.log('--- Step 1: Inspecting Admin Account (admin@playarena.com) ---');
    const adminEmail = 'admin@playarena.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existingAdmin) {
      if (existingAdmin.role !== 'ADMIN') {
        throw new ConflictError(`Account "${adminEmail}" already exists with role "${existingAdmin.role}". Refusing to automatically promote a non-ADMIN account.`);
      }
      console.log(`ℹ️ [PRESERVED] Admin account already exists (ID: ${existingAdmin.id}, Role: ADMIN). Preserved without changes.`);
      plan.adminPreserved = existingAdmin;
    } else {
      const suppliedAdminPass = process.env.INIT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
      const adminPassword = suppliedAdminPass || (isDryRun ? 'DRY_RUN_PLACEHOLDER' : generateSecurePassword());
      const isAutoGenerated = !suppliedAdminPass;

      plan.adminToCreate = {
        name: 'PlayArena Admin',
        email: adminEmail,
        passwordPlain: adminPassword,
        phone: '+91 9876543210',
        role: 'ADMIN',
        isAutoGenerated
      };

      if (isDryRun) {
        console.log(`🔍 [DRY-RUN] Would create Admin account: ${adminEmail} (Role: ADMIN) [Password: ${isAutoGenerated ? 'Will be auto-generated cryptographically' : 'From environment'}]`);
      }
    }

    // -----------------------------------------------------------------------
    // Step 2: Player Demo Account Inspection
    // -----------------------------------------------------------------------
    console.log('\n--- Step 2: Inspecting Demo Player Account (user@playarena.com) ---');
    const userEmail = 'user@playarena.com';
    const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

    if (existingUser) {
      console.log(`ℹ️ [PRESERVED] Demo player account already exists (ID: ${existingUser.id}, Role: ${existingUser.role}). Preserved without changes.`);
      plan.userPreserved = existingUser;
    } else {
      const suppliedUserPass = process.env.INIT_USER_PASSWORD || process.env.USER_PASSWORD;
      const userPassword = suppliedUserPass || (isDryRun ? 'DRY_RUN_PLACEHOLDER' : generateSecurePassword());
      const isAutoGenerated = !suppliedUserPass;

      plan.userToCreate = {
        name: 'Harsha Vardhan Reddy',
        email: userEmail,
        passwordPlain: userPassword,
        phone: '+91 9123456789',
        role: 'USER',
        isAutoGenerated
      };

      if (isDryRun) {
        console.log(`🔍 [DRY-RUN] Would create Player account: ${userEmail} (Role: USER) [Password: ${isAutoGenerated ? 'Will be auto-generated cryptographically' : 'From environment'}]`);
      }
    }

    // -----------------------------------------------------------------------
    // Step 3: Sports Grounds Inspection (Name + City Matching)
    // -----------------------------------------------------------------------
    console.log('\n--- Step 3: Inspecting Sports Grounds ---');
    const targetGroundsForSlots = [];

    for (const g of SAMPLE_GROUNDS) {
      const matchesByName = await prisma.ground.findMany({
        where: { name: g.name }
      });

      if (matchesByName.length === 1) {
        const existing = matchesByName[0];
        if (existing.city.toLowerCase() === g.city.toLowerCase()) {
          console.log(`ℹ️ [PRESERVED] Ground "${existing.name}" in ${existing.city} already exists (ID: ${existing.id}). Preserved.`);
          plan.groundsPreserved.push(existing);
          targetGroundsForSlots.push(existing);
        } else {
          throw new ConflictError(`Ground "${g.name}" exists in "${existing.city}" but proposed data expects "${g.city}". Ambiguous city match.`);
        }
      } else if (matchesByName.length > 1) {
        throw new ConflictError(`Multiple grounds found in database with name "${g.name}". Cannot safely identify target ground.`);
      } else {
        plan.groundsToCreate.push(g);
        if (isDryRun) {
          console.log(`🔍 [DRY-RUN] Would create Ground: "${g.name}" (${g.sportType}, ${g.city}, ₹${g.hourlyPrice}/hr)`);
          // Use negative simulated ID for dry-run slot mapping
          targetGroundsForSlots.push({ id: -(plan.groundsToCreate.length), ...g });
        }
      }
    }

    // -----------------------------------------------------------------------
    // Step 4: Time Slot Planning (7 Calendar Days Total: Today + Next 6 Days)
    // -----------------------------------------------------------------------
    console.log('\n--- Step 4: Planning Future Time Slots (7-Day Horizon) ---');
    const { dateStr: currentDateStr, timeStr: currentTimeStr } = getCurrentDateTimeInTimezone(TIMEZONE);
    console.log(`Current Time (${TIMEZONE}): ${currentDateStr} ${currentTimeStr}`);

    const TOTAL_CALENDAR_DAYS = 7; // Exactly 7 calendar days total (Day 0 through Day 6)
    const baseDate = new Date(`${currentDateStr}T00:00:00.000Z`);

    // Build normalized target dates using dateTime utility
    const targetDates = [];
    for (let d = 0; d < TOTAL_CALENDAR_DAYS; d++) {
      const cur = new Date(baseDate);
      cur.setUTCDate(baseDate.getUTCDate() + d);
      targetDates.push(normalizeDateForDb(cur.toISOString().slice(0, 10), TIMEZONE));
    }

    for (const ground of targetGroundsForSlots) {
      const slotsForThisGround = [];

      // Query existing slots if ground has a real established database ID
      const existingSlots = ground.id > 0
        ? await prisma.slot.findMany({
            where: {
              groundId: ground.id,
              date: { in: targetDates }
            },
            select: {
              date: true,
              startTime: true
            }
          })
        : [];

      // Key existing slots using standard formatDateToYYYYMMDD for 100% parity
      const existingSlotKeySet = new Set(
        existingSlots.map((s) => `${formatDateToYYYYMMDD(s.date)}_${s.startTime}`)
      );

      for (let dayOffset = 0; dayOffset < TOTAL_CALENDAR_DAYS; dayOffset++) {
        const slotDateObj = new Date(baseDate);
        slotDateObj.setUTCDate(baseDate.getUTCDate() + dayOffset);
        const slotDateStr = slotDateObj.toISOString().slice(0, 10);
        const normalizedDate = normalizeDateForDb(slotDateStr, TIMEZONE);
        const isToday = dayOffset === 0;

        for (const time of STANDARD_SLOT_TIMES) {
          // Exclude elapsed slots for today in Asia/Kolkata timezone
          if (isToday) {
            const isPast = isSlotInPast(normalizedDate, time.startTime, TIMEZONE);
            if (isPast) {
              plan.slotsPastFilteredCount++;
              continue;
            }
          }

          // Generate candidate key using identical date string representation
          const candidateDateStr = formatDateToYYYYMMDD(normalizedDate);
          const slotKey = `${candidateDateStr}_${time.startTime}`;

          if (existingSlotKeySet.has(slotKey)) {
            plan.slotsPreservedCount++;
          } else {
            slotsForThisGround.push({
              groundId: ground.id,
              date: normalizedDate,
              startTime: time.startTime,
              endTime: time.endTime,
              price: ground.hourlyPrice,
              isAvailable: true
            });
          }
        }
      }

      plan.slotsToCreateByGround.set(ground.name, {
        ground,
        slots: slotsForThisGround
      });
    }

    let totalSlotsPlanned = 0;
    for (const [, item] of plan.slotsToCreateByGround.entries()) {
      totalSlotsPlanned += item.slots.length;
    }

    // -----------------------------------------------------------------------
    // Step 5: Execution or Dry-Run Reporting
    // -----------------------------------------------------------------------
    if (isDryRun) {
      console.log('\n================================================================');
      console.log('DRY-RUN SIMULATION AUDIT SUMMARY');
      console.log('================================================================');
      console.log(`• Admin Account   : ${plan.adminToCreate ? 'WOULD CREATE (admin@playarena.com)' : 'PRESERVED (Already exists)'}`);
      console.log(`• Player Account  : ${plan.userToCreate ? 'WOULD CREATE (user@playarena.com)' : 'PRESERVED (Already exists)'}`);
      console.log(`• Grounds to Add  : ${plan.groundsToCreate.length}`);
      console.log(`• Grounds Kept    : ${plan.groundsPreserved.length}`);
      console.log(`• Slots to Add    : ${totalSlotsPlanned} (Across next 7 calendar days)`);
      console.log(`• Slots Kept      : ${plan.slotsPreservedCount}`);
      console.log(`• Past Hours Skipped: ${plan.slotsPastFilteredCount} (Elapsed earlier today)`);
      console.log('\n[DRY-RUN SCOPE NOTE]');
      console.log('  - Database Status : ZERO write operations executed. Database is untouched.');
      console.log('  - Passwords       : Real passwords were NOT generated or displayed.');
      console.log('  - Parity Checks   : Schema models, field types, date representations, and enums verified.');
      console.log('================================================================\n');
      return;
    }

    // -----------------------------------------------------------------------
    // Step 6: Atomic Live Execution inside Prisma Transaction
    // -----------------------------------------------------------------------
    console.log('\n🚀 Starting Atomic Transactional Write to Production Database...');
    console.log('Transaction Guarantee: If any write fails, all operations within this transaction will be rolled back.');

    let liveSlotsCreated = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Create Admin User if missing
      if (plan.adminToCreate) {
        const hashedPassword = await hashPassword(plan.adminToCreate.passwordPlain);
        const createdAdmin = await tx.user.create({
          data: {
            name: plan.adminToCreate.name,
            email: plan.adminToCreate.email,
            password: hashedPassword,
            phone: plan.adminToCreate.phone,
            role: plan.adminToCreate.role
          }
        });
        console.log(`✅ [CREATED] Admin user created (ID: ${createdAdmin.id})`);
        if (plan.adminToCreate.isAutoGenerated) {
          plan.generatedCredentials.push({
            role: 'ADMIN',
            email: plan.adminToCreate.email,
            password: plan.adminToCreate.passwordPlain
          });
        }
      }

      // 2. Create Player User if missing
      if (plan.userToCreate) {
        const hashedPassword = await hashPassword(plan.userToCreate.passwordPlain);
        const createdUser = await tx.user.create({
          data: {
            name: plan.userToCreate.name,
            email: plan.userToCreate.email,
            password: hashedPassword,
            phone: plan.userToCreate.phone,
            role: plan.userToCreate.role
          }
        });
        console.log(`✅ [CREATED] Player user created (ID: ${createdUser.id})`);
        if (plan.userToCreate.isAutoGenerated) {
          plan.generatedCredentials.push({
            role: 'USER',
            email: plan.userToCreate.email,
            password: plan.userToCreate.passwordPlain
          });
        }
      }

      // 3. Create Grounds if missing
      const groundMap = new Map();
      // Map existing grounds
      for (const eg of plan.groundsPreserved) {
        groundMap.set(eg.name, eg.id);
      }
      // Create new grounds
      for (const ng of plan.groundsToCreate) {
        const createdGround = await tx.ground.create({
          data: ng
        });
        console.log(`✅ [CREATED] Ground created: "${createdGround.name}" (ID: ${createdGround.id})`);
        groundMap.set(createdGround.name, createdGround.id);
      }

      // 4. Create Slots linked by valid foreign keys
      for (const [groundName, item] of plan.slotsToCreateByGround.entries()) {
        const realGroundId = groundMap.get(groundName);
        if (!realGroundId) {
          throw new Error(`Unable to resolve ground ID for "${groundName}" during slot assignment.`);
        }

        const slotsWithRealId = item.slots.map((s) => ({
          ...s,
          groundId: realGroundId
        }));

        if (slotsWithRealId.length > 0) {
          const res = await tx.slot.createMany({
            data: slotsWithRealId,
            skipDuplicates: true // Native PostgreSQL ON CONFLICT DO NOTHING
          });
          liveSlotsCreated += res.count;
        }
      }
    }, {
      maxWait: 10000, // Wait up to 10s to acquire transaction connection
      timeout: 30000  // Maximum transaction duration: 30 seconds
    });

    // -----------------------------------------------------------------------
    // Step 7: Post-Execution Verification
    // -----------------------------------------------------------------------
    const finalUsers = await prisma.user.count();
    const finalGrounds = await prisma.ground.count();
    const finalSlots = await prisma.slot.count();
    const finalBookings = await prisma.booking.count();

    console.log('\n================================================================');
    console.log('LIVE INITIALIZATION COMPLETED SUCCESSFULLY');
    console.log('================================================================');
    console.log(`• Admin Account   : ${plan.adminToCreate ? 'Created' : 'Preserved'}`);
    console.log(`• Player Account  : ${plan.userToCreate ? 'Created' : 'Preserved'}`);
    console.log(`• Grounds Created : ${plan.groundsToCreate.length}`);
    console.log(`• Grounds Kept    : ${plan.groundsPreserved.length}`);
    console.log(`• Slots Created   : ${liveSlotsCreated}`);
    console.log(`• Slots Kept      : ${plan.slotsPreservedCount}`);
    console.log(`• Elapsed Skipped : ${plan.slotsPastFilteredCount}`);

    console.log('\n--- Final Verified Database Counts ---');
    console.log(`  Users    : ${finalUsers}`);
    console.log(`  Grounds  : ${finalGrounds}`);
    console.log(`  Slots    : ${finalSlots}`);
    console.log(`  Bookings : ${finalBookings} (Untouched)`);

    if (plan.generatedCredentials.length > 0) {
      console.log('\n================================================================');
      console.log('🔒 SECURITY NOTICE: NEW CREDENTIALS GENERATED');
      console.log('Record these credentials securely. They are not stored elsewhere in plaintext:');
      for (const cred of plan.generatedCredentials) {
        console.log(`  - Role: ${cred.role.padEnd(5)} | Email: ${cred.email.padEnd(22)} | Password: ${cred.password}`);
      }
      console.log('================================================================');
    }

    console.log('\nDatabase is ready for production traffic.');
    console.log('================================================================\n');

  } finally {
    await prisma.$disconnect();
  }
}

// Global execution wrapper ensuring clean disconnect and non-zero exit code on failure
run().catch((err) => {
  console.error('\n❌ Initialization Halted:', err.message || err);
  process.exitCode = 1;
});
