import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircleIcon } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { registrationApi } from '../../../apis/registrationApi'
import { parseVnDate } from '../../../utils/schedule'
import { LoadingState } from '../../../components/ui/LoadingState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { WidgetFrame } from './WidgetFrame'

const DAY_MS = 24 * 60 * 60 * 1000

function daysUntil(vnDate, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((parseVnDate(vnDate) - today) / DAY_MS)
}

function formatRemain(days, isDeadline) {
  if (days === 0) return isDeadline ? 'hết hạn hôm nay' : 'mở hôm nay'
  return `còn ${days} ngày`
}

function getTodos(data, now) {
  const { semester, rules, registeredCredits } = data
  const semesterLabel = `${semester.name.toLowerCase()}, năm học ${semester.academicYear}`

  if (semester.status === 'open') {
    const missing = rules.minCredits - registeredCredits
    return [{
      key: 'registration-open',
      date: semester.registrationEnd,
      remain: formatRemain(daysUntil(semester.registrationEnd, now), true),
      title: `Đăng ký học phần ${semesterLabel}`,
      detail: missing > 0
        ? `Đã chọn ${registeredCredits}/${rules.maxCredits} tín chỉ, cần thêm ${missing} tín chỉ`
        : `Đã chọn ${registeredCredits}/${rules.maxCredits} tín chỉ`,
      urgent: missing > 0,
      to: '/register-online/course-registration',
    }]
  }
  if (semester.status === 'upcoming') {
    return [{
      key: 'registration-upcoming',
      date: semester.registrationStart,
      remain: formatRemain(daysUntil(semester.registrationStart, now), false),
      title: `Mở đăng ký học phần ${semesterLabel}`,
      detail: `Đăng ký đến hết ngày ${semester.registrationEnd}`,
      urgent: false,
      to: '/register-online/course-registration',
    }]
  }
  return []
}

export function TodoWidget() {
  const [now] = useState(() => new Date())
  const overview = useAsync(() => registrationApi.getOverview(), 'home-todo')

  let content
  if (overview.error) {
    content = <ErrorState error={overview.error} onRetry={overview.reload} className="py-6" />
  } else if (!overview.data) {
    content = <LoadingState label="Đang tải việc cần làm..." className="py-6" />
  } else {
    const todos = getTodos(overview.data, now)
    content = todos.length === 0 ? (
      <EmptyState icon={CheckCircleIcon} title="Không có việc cần làm" description="Hạn đăng ký học sẽ hiện ở đây khi có đợt mới." className="py-6" />
    ) : (
      <ul className="divide-y divide-line">
        {todos.map((todo) => (
          <li key={todo.key}>
            <Link
              to={todo.to}
              className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-canvas/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <span className="w-20 shrink-0 tabular-nums">
                <span className="block font-semibold">{todo.date.slice(0, 5)}</span>
                <span className="block text-[13px] text-muted">{todo.remain}</span>
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{todo.title}</span>
                <span className={todo.urgent ? 'block text-[13px] text-danger' : 'block text-[13px] text-muted'}>{todo.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return <WidgetFrame title="Việc cần làm">{content}</WidgetFrame>
}
