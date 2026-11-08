export const PERIOD_MINUTES = 50;

export const PERIOD_START_TIMES: Record<number, string> = {
  1: "06:45",
  2: "07:40",
  3: "08:35",
  4: "09:30",
  5: "10:25",
  6: "11:20",
  7: "13:00",
  8: "13:55",
  9: "14:50",
  10: "15:45",
  11: "16:40",
  12: "17:35"
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

const toTime = (totalMinutes: number) => {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getPeriodTimeRange(startPeriod: number, endPeriod: number) {
  return {
    startTime: PERIOD_START_TIMES[startPeriod],
    endTime: toTime(toMinutes(PERIOD_START_TIMES[endPeriod]) + PERIOD_MINUTES)
  };
}