import { useState } from "react";
import { addDays, DAY_LABELS, formatDayMonth, formatVnDate, isSameDay, parseVnDate, startOfWeek, timeToMinutes, WEEK_DAYS, weeksBetween } from "../../utils/schedule";
import { Button } from "../../components/ui/Button";
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon, ClockIcon, MapPinIcon } from "@phosphor-icons/react";
import { EmptyState } from "../../components/ui/EmptyState";
import clsx from "clsx";

const START_HOUR = 6;
const END_HOUR = 19;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

function toPercent(minutes) {
  return (minutes / TOTAL_MINUTES) * 100;
}

function getSlotStyle(session) {
  const start = timeToMinutes(session.startTime) - START_HOUR * 60;
  const length = timeToMinutes(session.endTime) - timeToMinutes(session.startTime);
  return { top: `calc(${toPercent(start)}% + 2px)`, height: `calc(${toPercent(length)}% - 4px)` };
}

function groupSessionsByDay(items) {
  const groups = {};
  for(const item of items) {
    for(const session of item.sessions) {
      groups[session.dayOfWeek] ??= [];
      groups[session.dayOfWeek].push({ ...session, item });
    }
  }
  for(const day of Object.keys(groups)) {
    groups[day].sort((a, b) => a.startPeriod - b.startPeriod)
  }
  return groups;
}

function getInitialWeek(today, semesterStart, semesterEnd) {
  return today >= semesterStart && today <= addDays(semesterEnd, 1) ? startOfWeek(today) : startOfWeek(semesterStart);
}

export function WeekView({ semester, items }) {
  const semesterStart = parseVnDate(semester.startDate);
  const semesterEnd = parseVnDate(semester.endDate);

  const [today] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => getInitialWeek(today, semesterStart, semesterEnd));

  const thisWeek = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const weekNumber = weeksBetween(startOfWeek(semesterStart), weekStart) + 1;
  const outsideSemester = weekEnd < semesterStart || weekStart > semesterEnd;

  const sessionsByDay = groupSessionsByDay(items);
  const days = WEEK_DAYS.map((dayOfWeek, index) => {
    const date = addDays(weekStart, index);
    const inSemester = date >= semesterStart && date <= semesterEnd;
    return {
      dayOfWeek,
      date,
      isToday: isSameDay(date, today),
      sessions: inSemester ? (sessionsByDay[dayOfWeek] ?? []) : []
    }
  })
  const hasSession = days.some(day => day.sessions.length > 0);

  const weekLabel = `${formatDayMonth(weekStart)} - ${formatVnDate(weekEnd)}`;

  return (
    <section aria-label="Lịch theo tuần" className="rounded-xl border border-line bg-panel lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5 sm:px-4">
        <Button onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Tuần trước" className="size-8 h-8! px-0!">
          <CaretLeftIcon size={18} aria-hidden="true" />
        </Button>
        <p className="min-w-0 grow text-center sm:grow-0 sm:px-2" aria-live="polite">
          <span className="font-semibold">{outsideSemester ? 'Ngoài học kỳ' : `Tuần ${weekNumber}`}</span>
          <span className="text-muted">: {weekLabel}</span>
        </p>
        <Button onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Tuần sau" className="size-8 h-8! px-0!">
          <CaretRightIcon size={18} aria-hidden="true" />
        </Button>
        <Button onClick={() => setWeekStart(thisWeek)} disabled={isSameDay(weekStart, thisWeek)} className="h-8! sm:ml-auto">
          Tuần này
        </Button>
      </div>

      {outsideSemester ? (
        <EmptyState icon={CalendarBlankIcon} title="Tuần này nằm ngoài học kỳ" description={`${semester.name}, năm học ${semester.academicYear} học từ ${semester.startDate} - ${semester.endDate}.`}
          action={<Button onClick={() => setWeekStart(startOfWeek(semesterStart))}>Về tuần đầu học kỳ</Button>} />
      ) : !hasSession ? (
        <EmptyState icon={CalendarBlankIcon} title="Tuần này không có buổi học" />
      ) : (
        <>
          <div className="hidden min-h-0 flex-1 overflow-auto rounded-b-xl lg:flex lg:flex-col">
            <div className="grid min-w-215 flex-1 grid-cols-[56px_repeat(7,minmax(0,1fr))] grid-rows-[auto_minmax(455px,1fr)]">
              <div className="sticky top-0 z-10 border-b border-line bg-panel" />
              {days.map(day => (
                <div key={day.dayOfWeek} className={clsx('sticky top-0 z-10 border-b border-l border-line px-2 py-2 text-center', day.isToday ? 'bg-accent-soft text-accent-hover' : 'bg-panel text-muted')}>
                  <span className="block text-xs font-medium">{DAY_LABELS[day.dayOfWeek]}</span>
                  <span className={clsx('font-semibold', day.isToday ? 'text-accent-hover' : 'text-ink')}>
                    {formatDayMonth(day.date)}
                  </span>
                  {day.isToday && <span className="sr-only"> (hôm nay)</span>}
                </div>
              ))}

              <div aria-hidden="true" className="flex flex-col">
                {HOURS.map(hour => (
                  <div key={hour} className="min-h-0 flex-1 pt-0.5 pr-2 text-right text-xs text-muted tabular-nums">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {days.map(day => (
                <div key={day.dayOfWeek} className={clsx('relative border-l border-line bg-[linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)]', day.isToday && 'bg-accent-soft/40')} style={{ backgroundSize: `100% ${100 / HOURS.length}%`, backgroundPosition: '0 -1px' }}>
                  {day.sessions.map(session => {
                    const periods = session.endPeriod - session.startPeriod + 1;
                    return (
                      <div key={session.id} title={`${session.item.courseName}\n${session.startTime} - ${session.endTime}\n${session.room}`} className="absolute inset-x-1 overflow-hidden rounded-md border-l-3 border-accent bg-accent-soft px-2 py-1 text-xs leading-snug" style={getSlotStyle(session)}>
                        <p className={clsx('font-semibold text-ink', periods === 1 ? 'truncate' : 'line-clamp-2')}>{session.item.courseName}</p>
                        {periods >= 3 && (
                          <>
                            <p className="text-muted tabular-nums">{session.startTime} - {session.endTime}</p>
                            <p className="truncate text-muted">{session.room}</p>
                          </>
                        )}
                        {periods === 2 && <p className="truncate text-muted">{session.room}, {session.startTime} - {session.endTime}</p>}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <ol className="divide-y divide-line lg:hidden">
            {days.filter(day => day.sessions.length > 0).map(day => (
              <li key={day.dayOfWeek} className="grid gap-2 px-4 py-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  {DAY_LABELS[day.dayOfWeek]}, {formatDayMonth(day.date)}
                  {day.isToday && (
                    <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent-hover">
                      Hôm nay
                    </span>
                  )}
                </h3>
                <ul className="grid gap-2">
                  {day.sessions.map(session => (
                    <li key={session.id} className="rounded-lg border-l-3 border-accent bg-accent-soft px-3 py-2.5">
                      <p className="font-semibold">{session.item.courseName}</p>
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          <ClockIcon size={14} aria-hidden="true" />
                          Tiết {session.startPeriod}-{session.endPeriod}, {session.startTime} - {session.endTime}

                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinIcon size={14} aria-hidden="true" />
                          {session.room}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}