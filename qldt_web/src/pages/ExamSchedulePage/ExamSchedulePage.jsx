import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { examApi } from '../../apis/examApi'
import { scheduleApi } from '../../apis/scheduleApi'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Select } from '../../components/form/Select'
import { getWeekday, toSortable, getTodaySortable } from './examDate'

const todayText = getTodaySortable()

const columns = [
  {
    key: 'examDate',
    header: 'Ngày thi',
    nowrap: true,
    render: row => <span className="font-medium">{getWeekday(row.examDate)}, {row.examDate}</span>
  },
  {
    key: 'startTime',
    header: 'Giờ',
    nowrap: true,
    render: row => (
      <>
        {row.startTime}
        <span className="block text-xs text-muted">{row.durationMinutes} phút</span>
      </>
    )
  },
  {
    key: 'course',
    header: 'Học phần',
    render: row => (
      <>
        <span className="font-medium">{row.courseName}</span>
        <span className="block text-xs text-muted">{row.courseCode}, {row.credits} tín chỉ</span>
      </>
    )
  },
  { key: 'format', header: 'Hình thức', nowrap: true },
  { key: 'room', header: 'Phòng', nowrap: true, render: row => row.room ?? <span className="text-muted">Chưa xếp</span> },
  { key: 'seatNumber', header: 'Số báo danh', nowrap: true, render: row => row.seatNumber ?? '-' },
  {
    key: 'status',
    header: 'Trạng thái',
    nowrap: true,
    render: row => {
      if (!row.room) return <StatusBadge>Chờ xếp phòng</StatusBadge>
      if (toSortable(row.examDate) < todayText) return <StatusBadge>Đã thi</StatusBadge>
      return <StatusBadge tone="accent">Đã xếp phòng</StatusBadge>
    }
  }
]

export function ExamSchedulePage() {
  const [pickedCode, setPickedCode] = useState('')

  const semesters = useAsync(() => scheduleApi.getSemesters(), 'semesters')
  const semesterCode = pickedCode || semesters.data?.currentCode

  const exams = useAsync(
    () => (semesterCode ? examApi.getMySchedule(semesterCode) : Promise.resolve(null)),
    semesterCode ?? 'waiting'
  )

  let content
  if (semesters.error) {
    content = <ErrorState error={semesters.error} onRetry={semesters.reload} />
  } else if (exams.error) {
    content = <ErrorState error={exams.error} onRetry={exams.reload} />
  } else if (!exams.data) {
    content = <LoadingState label="Đang tải lịch thi..." />
  } else {
    content = (
      <DataTable
        columns={columns}
        rows={exams.data.items}
        caption="Lịch thi"
        busy={exams.loading}
        empty={{ title: 'Chưa có lịch thi', description: 'Học kỳ này chưa có lịch thi cho các học phần bạn đã đăng ký.' }}
      />
    )
  }

  return (
    <div>
      <PageHeader title="Lịch thi" group="Thời khóa biểu" description="Mang thẻ sinh viên hoặc CCCD khi dự thi. Có mặt trước giờ thi 15 phút." />

      <section className="rounded-xl border border-line bg-panel">
        <div className="border-b border-line p-3">
          <Select
            id="exam-semester"
            label="Học kỳ"
            value={semesterCode ?? ''}
            onChange={event => setPickedCode(event.target.value)}
            disabled={!semesters.data}
          >
            {(semesters.data?.items ?? []).map(semester => (
              <option key={semester.code} value={semester.code}>
                {semester.name}, {semester.academicYear}
                {semester.code === semesters.data.currentCode ? ' (hiện tại)' : ''}
              </option>
            ))}
          </Select>
        </div>

        {content}
      </section>
    </div>
  )
}
