const { PrismaClient } = require('@prisma/client');
const { normalizeDateForDb, getCurrentDateTimeInTimezone } = require('../src/utils/dateTime');

const prisma = new PrismaClient();

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
  const days = parseInt(process.env.EXTEND_DAYS || process.env.SEED_SLOT_DAYS, 10) || 14;
  console.log(`⏳ Extending slots for active grounds over the next ${days} days...`);

  const activeGrounds = await prisma.ground.findMany({
    where: { isActive: true }
  });

  if (activeGrounds.length === 0) {
    console.log('⚠️ No active grounds found to extend slots.');
    return;
  }

  const { dateStr: todayKolkata } = getCurrentDateTimeInTimezone('Asia/Kolkata');
  const baseDate = new Date(`${todayKolkata}T00:00:00.000Z`);

  let totalAdded = 0;
  for (const ground of activeGrounds) {
    const slotsToInsert = [];
    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
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
    totalAdded += res.count;
  }

  console.log(`✅ Slot extension complete: ${totalAdded} new slots added across ${activeGrounds.length} active grounds.`);
}

main()
  .catch((e) => {
    console.error('❌ Slot Extension Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
