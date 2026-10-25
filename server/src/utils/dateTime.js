const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';

/**
 * Returns current date string (YYYY-MM-DD) and current time string (HH:mm) in the specified timezone
 */
function getCurrentDateTimeInTimezone(tz = DEFAULT_TIMEZONE) {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);

  return { dateStr, timeStr, now };
}

/**
 * Formats a Date object or date string into YYYY-MM-DD
 */
function formatDateToYYYYMMDD(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    return dateVal.slice(0, 10);
  }
  if (dateVal instanceof Date) {
    return dateVal.toISOString().slice(0, 10);
  }
  return '';
}

/**
 * Determines whether a slot has already started or ended relative to the current local time.
 * If slotDate < currentDate -> past.
 * If slotDate === currentDate && slotStartTime <= currentTime -> past.
 */
function isSlotInPast(slotDate, slotStartTime, tz = DEFAULT_TIMEZONE) {
  const { dateStr: currentDateStr, timeStr: currentTimeStr } = getCurrentDateTimeInTimezone(tz);
  const slotDateStr = formatDateToYYYYMMDD(slotDate);

  if (slotDateStr < currentDateStr) {
    return true;
  }
  if (slotDateStr === currentDateStr && slotStartTime <= currentTimeStr) {
    return true;
  }
  return false;
}

/**
 * Determines whether a slot's end time has passed.
 * If slotDate < currentDate -> passed.
 * If slotDate === currentDate && slotEndTime <= currentTime -> passed.
 */
function isSlotEndTimePassed(slotDate, slotEndTime, tz = DEFAULT_TIMEZONE) {
  const { dateStr: currentDateStr, timeStr: currentTimeStr } = getCurrentDateTimeInTimezone(tz);
  const slotDateStr = formatDateToYYYYMMDD(slotDate);

  if (slotDateStr < currentDateStr) {
    return true;
  }
  if (slotDateStr === currentDateStr && slotEndTime <= currentTimeStr) {
    return true;
  }
  return false;
}

/**
 * Helper to compute display status without altering the database schema
 */
function getDerivedBookingStatus(booking, tz = DEFAULT_TIMEZONE) {
  if (!booking) return 'CONFIRMED';
  if (booking.status === 'CANCELLED') return 'CANCELLED';
  if (booking.status === 'HELD') return 'HELD';
  
  if (booking.slot && isSlotEndTimePassed(booking.slot.date, booking.slot.endTime, tz)) {
    return 'COMPLETED';
  }
  return 'CONFIRMED';
}

/**
 * Normalizes date inputs into a UTC Date object representing YYYY-MM-DDT00:00:00.000Z
 * for clean PostgreSQL @db.Date column comparison and insertion in Prisma.
 */
function normalizeDateForDb(dateInput, tz = DEFAULT_TIMEZONE) {
  if (!dateInput) {
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    return new Date(`${dateStr}T00:00:00.000Z`);
  }
  if (typeof dateInput === 'string') {
    const cleanStr = dateInput.slice(0, 10);
    return new Date(`${cleanStr}T00:00:00.000Z`);
  }
  if (dateInput instanceof Date) {
    if (dateInput.toISOString().endsWith('T00:00:00.000Z')) {
      return dateInput;
    }
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateInput);
    return new Date(`${dateStr}T00:00:00.000Z`);
  }
  return new Date();
}

module.exports = {
  DEFAULT_TIMEZONE,
  getCurrentDateTimeInTimezone,
  formatDateToYYYYMMDD,
  isSlotInPast,
  isSlotEndTimePassed,
  getDerivedBookingStatus,
  normalizeDateForDb
};
