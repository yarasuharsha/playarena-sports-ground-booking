-- Advanced Database Systems: Concurrency Protection & Check Constraints

-- 1. Database-backed concurrency protection: Partial unique index on active bookings
-- Ensures only one HELD or CONFIRMED booking can exist for a slot at any point in time.
-- Any concurrent attempt to insert another active booking for the same slotId is rejected by PostgreSQL.
CREATE UNIQUE INDEX unique_active_booking_per_slot 
ON "bookings" ("slotId") 
WHERE "status" IN ('HELD', 'CONFIRMED');

-- 2. Domain integrity check constraints
ALTER TABLE "grounds" 
ADD CONSTRAINT check_grounds_hourly_price 
CHECK ("hourlyPrice" > 0);

ALTER TABLE "slots" 
ADD CONSTRAINT check_slots_price 
CHECK ("price" >= 0);

ALTER TABLE "bookings" 
ADD CONSTRAINT check_bookings_total_amount 
CHECK ("totalAmount" >= 0);