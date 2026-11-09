import clsx from 'clsx'
import { ArrowCounterClockwiseIcon, CheckIcon, LockSimpleIcon, TrendUpIcon, UsersIcon } from '@phosphor-icons/react'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Button } from '../../components/ui/Button'
import { formatSessionDay, getCourseBlock, shortSectionCode } from './registrationText'

function getActionLabel(section, courseBlock) {
  if (courseBlock) return 'Đăng ký'
  if (section.isFull) return 'Hết chỗ'
  if (section.conflictWith) return 'Trùng lịch'
  return 'Đăng ký'
}

export function CourseOfferingCard({ course, canAct, busy, pendingId, onRegister, onCancel }) {
  const courseBlock = getCourseBlock(course)
  const prerequisiteText = course.prerequisites.map((prerequisite) => prerequisite.code).join(', ')

  const columns = [
    {
      key: 'code',
      header: 'Lớp',
      nowrap: true,
      className: 'w-32',
      render: (section) => <span className="font-medium">{shortSectionCode(section.code)}</span>,
    },
    {
      key: 'sessions',
      header: 'Lịch học',
      className: 'min-w-48',
      render: (section) => {
        const rowReason = !courseBlock && canAct && !section.isRegistered ? section.blockReason : null
        return (
          <>
            <ul className="grid gap-1">
              {section.sessions.map((session) => (
                <li key={session.id}>
                  {formatSessionDay(session)}
                  <span className="block text-xs text-muted tabular-nums">
                    {session.startTime} đến {session.endTime}, <span className="whitespace-nowrap">phòng {session.room}</span>
                  </span>
                </li>
              ))}
            </ul>
            {rowReason && (
              <p id={`reason-${section.id}`} className="mt-1 text-xs text-danger">
                {rowReason}
              </p>
            )}
          </>
        )
      },
    },
    { key: 'lecturerName', header: 'Giảng viên', nowrap: true, className: 'w-52' },
    {
      key: 'capacity',
      header: 'Sĩ số',
      nowrap: true,
      className: 'w-24',
      render: (section) => (
        <span className={clsx('inline-flex items-center gap-1.5 tabular-nums', section.isFull && 'text-danger')}>
          <UsersIcon size={15} aria-hidden="true" />
          {section.registeredCount}/{section.capacity}
          {section.isFull && <span className="sr-only">, đã hết chỗ</span>}
        </span>
      ),
    },
    {
      key: 'action',
      header: <span className="sr-only">Thao tác</span>,
      align: 'right',
      nowrap: true,
      className: 'w-32',
      render: (section) => {
        const label = shortSectionCode(section.code)
        if (section.isRegistered) {
          return (
            <Button
              variant="dangerOutline"
              onClick={() => onCancel(section, course)}
              disabled={!canAct || busy}
              aria-label={`Huỷ lớp ${label}`}
              className="h-9 px-3 text-sm"
            >
              Huỷ
            </Button>
          )
        }
        const blocked = Boolean(section.blockReason)
        return (
          <Button
            variant={blocked ? 'default' : 'primary'}
            onClick={() => onRegister(section, course)}
            disabled={blocked || busy}
            loading={pendingId === section.id}
            aria-label={`${getActionLabel(section, courseBlock)} lớp ${label}`}
            aria-describedby={blocked && !courseBlock && canAct ? `reason-${section.id}` : undefined}
            title={section.blockReason ?? undefined}
            className="h-9 px-3 text-sm"
          >
            {getActionLabel(section, courseBlock)}
          </Button>
        )
      },
    },
  ]

  return (
    <article aria-labelledby={`course-${course.id}`} className="border-b border-line last:border-b-0">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5 px-4 pt-3.5 pb-3">
        <div className="min-w-0 grow">
          <h3 id={`course-${course.id}`} className="font-semibold">
            <span className="text-muted">{course.code}</span> {course.name}
          </h3>
          <p className="mt-0.5 text-[13px] text-muted">
            {course.credits} tín chỉ
            {prerequisiteText && `, tiên quyết ${prerequisiteText}`}
          </p>
          {courseBlock && (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-danger">
              <LockSimpleIcon size={14} aria-hidden="true" />
              {courseBlock}
            </p>
          )}
          {course.isPassed && (
            <p className="mt-1 text-[13px] text-muted">Bạn đã qua học phần này. Đăng ký lại để học cải thiện điểm.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {course.isRetake && (
            <StatusBadge icon={ArrowCounterClockwiseIcon}>Học lại</StatusBadge>
          )}
          {course.isPassed && (
            <StatusBadge icon={TrendUpIcon}>Học cải thiện</StatusBadge>
          )}
          {course.registeredClassSectionCode ? (
            <StatusBadge tone="accent" icon={CheckIcon}>
              Đã đăng ký lớp {shortSectionCode(course.registeredClassSectionCode)}
            </StatusBadge>
          ) : courseBlock ? (
            <StatusBadge tone="danger">Chưa đủ điều kiện</StatusBadge>
          ) : (
            <StatusBadge>Chưa đăng ký</StatusBadge>
          )}
        </div>
      </div>
      <DataTable
        caption={`Các lớp của học phần ${course.code} ${course.name}`}
        columns={columns}
        rows={course.classSections}
        minWidth={720}
        className="border-t border-line"
      />
    </article>
  )
}
