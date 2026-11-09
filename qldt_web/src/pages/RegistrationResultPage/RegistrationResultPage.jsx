import { Link, useSearchParams } from 'react-router'
import { NotePencilIcon } from '@phosphor-icons/react'
import { useAsync } from '../../hooks/useAsync'
import { registrationApi } from '../../apis/registrationApi'
import { scheduleApi } from '../../apis/scheduleApi'
import { formatDateTime } from '../../utils/format'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/form/Select'
import { formatSessionDay, shortSectionCode } from '../CourseRegistrationPage/registrationText'

const columns = [
  { key: 'classSectionCode', header: 'Lớp', nowrap: true, render: (row) => <span className="font-medium">{shortSectionCode(row.classSectionCode)}</span> },
  {
    key: 'courseName',
    header: 'Học phần',
    className: 'min-w-52',
    render: (row) => (
      <>
        <span className="font-medium">{row.courseName}</span>
        <span className="block text-xs text-muted">{row.courseCode}, {row.lecturerName}</span>
      </>
    ),
  },
  { key: 'credits', header: 'Tín chỉ', align: 'right' },
  {
    key: 'sessions',
    header: 'Lịch học',
    className: 'min-w-44',
    render: (row) => (
      <ul className="grid gap-1">
        {row.sessions.map((session) => (
          <li key={session.id}>
            {formatSessionDay(session)}
            <span className="block text-xs text-muted">phòng {session.room}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    nowrap: true,
    render: (row) =>
      row.status === 'registered' ? <StatusBadge tone="accent">Đã đăng ký</StatusBadge> : <StatusBadge>Đã huỷ</StatusBadge>,
  },
  {
    key: 'registeredAt',
    header: 'Thời gian',
    nowrap: true,
    render: (row) => (
      <span className="tabular-nums">
        {formatDateTime(row.registeredAt)}
        {row.cancelledAt && <span className="block text-xs text-muted">Huỷ lúc {formatDateTime(row.cancelledAt)}</span>}
      </span>
    ),
  },
]

export function RegistrationResultPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pickedCode = searchParams.get('semester') ?? undefined
  const semesters = useAsync(() => scheduleApi.getSemesters(), 'semesters')
  const history = useAsync(() => registrationApi.getHistory(pickedCode), `registration-history:${pickedCode ?? 'default'}`)

  const data = history.data
  const semesterCode = pickedCode ?? data?.semester.code ?? ''
  const registeredCount = data ? data.items.filter((item) => item.status === 'registered').length : 0

  let content
  if (history.error && !data) {
    content = <ErrorState error={history.error} onRetry={history.reload} />
  } else if (!data) {
    content = <LoadingState label="Đang tải kết quả đăng ký..." />
  } else if (data.items.length === 0) {
    content = (
      <EmptyState
        icon={NotePencilIcon}
        title="Chưa có lượt đăng ký nào trong học kỳ này"
        description={data.semester.status === 'open' ? 'Cổng đăng ký đang mở, bạn có thể đăng ký ngay.' : undefined}
        action={
          data.semester.status === 'open' && (
            <Link to="/register-online/course-registration" className="inline-flex h-10 items-center rounded-lg bg-accent px-4 font-medium text-white hover:bg-accent-hover">
              Đăng ký học
            </Link>
          )
        }
      />
    )
  } else {
    content = (
      <DataTable
        caption={`Kết quả đăng ký ${data.semester.name}, năm học ${data.semester.academicYear}`}
        columns={columns}
        rows={data.items}
        rowKey="enrollmentId"
        minWidth={820}
        busy={history.loading}
        footer={
          <tr>
            <td colSpan={2} className="px-3 py-2.5">
              Tổng {registeredCount} học phần đã đăng ký
            </td>
            <td className="px-3 py-2.5 text-right tabular-nums">{data.totalCredits}</td>
            <td colSpan={3} />
          </tr>
        }
      />
    )
  }

  const description = data
    ? `${data.semester.name}, năm học ${data.semester.academicYear}. Gồm cả các lớp đã huỷ trong đợt đăng ký.`
    : undefined

  return (
    <>
      <PageHeader title="Tra cứu kết quả đăng ký" group="Đăng ký trực tuyến" description={description} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select
          id="history-semester"
          label="Học kỳ"
          value={semesterCode}
          disabled={!semesters.data}
          onChange={(event) => setSearchParams({ semester: event.target.value })}
          className="h-11 w-full text-base sm:h-9 sm:w-auto sm:text-sm"
        >
          {!semesters.data && semesterCode && <option value={semesterCode}>{semesterCode}</option>}
          {(semesters.data?.items ?? []).map((semester) => (
            <option key={semester.code} value={semester.code}>
              {semester.name}, {semester.academicYear}
            </option>
          ))}
        </Select>
      </div>
      <section aria-label="Kết quả đăng ký" className="overflow-hidden rounded-xl border border-line bg-panel">
        {content}
      </section>
    </>
  )
}
