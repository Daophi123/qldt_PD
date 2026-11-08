export const WEEK_DAYS = [2, 3, 4, 5, 6, 7, 8];

export const DAY_LABELS = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật"
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseVnDate(value) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfWeek(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysFromMonday = (monday.getDay() + 6) % 7;
  return addDays(monday, -daysFromMonday);
}

export function weeksBetween(fromMonday, toMonday) {
  return Math.round((toMonday - fromMonday) / (7 * DAY_MS))
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const pad = (value) => String(value).padStart(2, '0');

export function formatDayMonth(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

export function formatVnDate(date) {
  return `${formatDayMonth(date)}/${date.getFullYear()}`;
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatSessionTime(session) {
  return `${DAY_LABELS[session.dayOfWeek]}, tiết ${session.startPeriod}-${session.endPeriod} (${session.startTime}-${session.endTime})`;
}