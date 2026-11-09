import { useState } from 'react'
import { CalendarBlankIcon } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { scheduleApi } from '../../../apis/scheduleApi'
import { parseVnDate, timeToMinutes } from '../../../utils/schedule'
import { LoadingState } from '../../../components/ui/LoadingState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { WidgetFrame } from './WidgetFrame'

function getDayOfWeek(date) {
  const day = date.getDay()
  return day === 0 ? 8 : day + 1
}

function getSessionState(session, nowMinutes) {
  if (nowMinutes < timeToMinutes(session.startTime)) return { label: 'Sắp tới', tone: 'neutral' }
  if (nowMinutes < timeToMinutes(session.endTime)) return { label: 'Đang học', tone: 'accent' }
  return { label: 'Đã qua', tone: 'neutral' }
}

function getTodaySessions(data, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const inSemester = today >= parseVnDate(data.semester.startDate) && today <= parseVnDate(data.semester.endDate)
  if (!inSemester) return null

  const dayOfWeek = getDayOfWeek(now)
  return data.items
    .flatMap((item) => item.sessions.filter((session) => session.dayOfWeek === dayOfWeek).map((session) => ({ ...session, item })))
    .sort((a, b) => a.startPeriod - b.startPeriod)
}

export function TodayScheduleWidget() {
  const [now] = useState(() => new Date())
  const schedule = useAsync(() => scheduleApi.getClassSchedule(), 'home-today-schedule')

  let content
  if (schedule.error) {
    content = <ErrorState error={schedule.error} onRetry={schedule.reload} className="py-6" />
  } else if (!schedule.data) {
    content = <LoadingState label="Đang tải lịch học..." className="py-6" />
  } else {
    const sessions = getTodaySessions(schedule.data, now)
    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    if (!sessions || sessions.length === 0) {
      content = (
        <EmptyState
          icon={CalendarBlankIcon}
          title="Hôm nay không có buổi học"
          description={sessions ? 'Xem cả tuần ở mục Lịch học.' : 'Hôm nay nằm ngoài thời gian học của học kỳ.'}
          className="py-6"
        />
      )
    } else {
      content = (
        <ul className="divide-y divide-line">
          {sessions.map((session) => {
            const state = getSessionState(session, nowMinutes)
            return (
              <li key={session.id} className="flex items-start gap-3 px-4 py-3">
                <div className="w-14 shrink-0 tabular-nums">
                  <span className="block font-semibold">{session.startTime}</span>
                  <span className="block text-[13px] text-muted">{session.endTime}</span>
                </div>
                <div className="min-w-0 grow">
                  <p className="font-medium">{session.item.courseName}</p>
                  <p className="text-[13px] text-muted">
                    Tiết {session.startPeriod}-{session.endPeriod}, phòng {session.room}, {session.item.lecturerName}
                  </p>
                </div>
                <StatusBadge tone={state.tone} className="mt-0.5 shrink-0">
                  {state.label}
                </StatusBadge>
              </li>
            )
          })}
        </ul>
      )
    }
  }

  return (
    <WidgetFrame title="Lịch học hôm nay" linkTo="/schedule/class" linkLabel="Xem thời khoá biểu">
      {content}
    </WidgetFrame>
  )
}
