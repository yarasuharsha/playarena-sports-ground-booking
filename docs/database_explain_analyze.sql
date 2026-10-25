-- PlayArena Database Systems: Query Performance & Plan Evaluation
-- EXPLAIN ANALYZE demonstration on composite & partial indexes

-- 1. Ground search query using composite index grounds_sportType_city_isActive_idx
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, name, "sportType", city, "hourlyPrice", rating
FROM "grounds"
WHERE "sportType" = 'Football'
  AND "city" = 'Bangalore'
  AND "isActive" = true;

-- 2. Slot lookup using composite index slots_groundId_date_idx
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, "groundId", date, "startTime", "endTime", price, "isAvailable"
FROM "slots"
WHERE "groundId" = 1
  AND date = CURRENT_DATE;

-- 3. Active booking concurrency index lookup using unique_active_booking_per_slot partial index
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, "bookingReference", "slotId", "userId", status, "totalAmount"
FROM "bookings"
WHERE "slotId" = 1
  AND status IN ('HELD', 'CONFIRMED');
