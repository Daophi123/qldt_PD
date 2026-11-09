import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { gradeApi } from '../../apis/gradeApi'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { GradeDialog } from './GradeDialog'
import { formatScore } from './formatScore'

function ResultBadge({ passed }) {
  if (passed === null) return <StatusBadge>Chưa có điểm</StatusBadge>
  if (passed) return <StatusBadge tone="accent">Đạt</StatusBadge>
  return <StatusBadge tone="danger">Học lại</StatusBadge>
}

export function GradePage() {
  const [openGrade, setOpenGrade] = useState(null)
  const grades = useAsync(() => gradeApi.getMyGrades(), 'my-grades')

  // Khai báo cột ở trong hàm vì cột "Chi tiết" cần gọi setOpenGrade
  const columns = [
    { key: 'index', header: 'STT', align: 'center', render: (row, index) => index + 1 },
    { key: 'courseCode', header: 'Mã học phần', nowrap: true },
    { key: 'courseName', header: 'Tên học phần' },
    { key: 'credits', header: 'Tín chỉ', align: 'center' },
    { key: 'attempt', header: 'Lần học', align: 'center' },
    { key: 'score10', header: 'Hệ 10', align: 'center', render: row => formatScore(row.score10) },
    { key: 'score4', header: 'Hệ 4', align: 'center', render: row => formatScore(row.score4) },
    { key: 'letter', header: 'Điểm chữ', align: 'center', render: row => row.letter ?? '-' },
    { key: 'passed', header: 'Đánh giá', nowrap: true, render: row => <ResultBadge passed={row.passed} /> },
    {
      key: 'detail',
      header: 'Chi tiết',
      nowrap: true,
      render: row => {
        if (row.score10 === null) return null
        return (
          <button type="button" onClick={() => setOpenGrade(row)} className="text-accent hover:underline">
            Chi tiết
          </button>
        )
      }
    }
  ]

  if (grades.error) {
    return (
      <div>
        <PageHeader title="Tra cứu điểm" group="Góc học tập" />
        <ErrorState error={grades.error} onRetry={grades.reload} />
      </div>
    )
  }

  if (!grades.data) {
    return (
      <div>
        <PageHeader title="Tra cứu điểm" group="Góc học tập" />
        <LoadingState label="Đang tải bảng điểm..." />
      </div>
    )
  }

  const { student, summary, semesters } = grades.data

  // Ô tổng kết toàn khoá: [tên, giá trị]
  const facts = [
    ['Tín chỉ chương trình', summary.programCredits ?? '-'],
    ['Tín chỉ đã học', summary.attemptedCredits],
    ['Tín chỉ tích luỹ', summary.earnedCredits],
    ['Điểm TB hệ 10', formatScore(summary.gpa10, 2)],
    ['Điểm TB hệ 4', formatScore(summary.gpa4, 2)],
    ['Điểm TB tích luỹ hệ 10', formatScore(summary.cumulativeGpa10, 2)],
    ['Điểm TB tích luỹ hệ 4', formatScore(summary.cumulativeGpa4, 2)]
  ]

  return (
    <div>
      <PageHeader
        title="Tra cứu điểm"
        group="Góc học tập"
        description={`${student.fullName}, mã số ${student.studentCode}, lớp ${student.className}, ngành ${student.majorName}`}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className="rounded-xl border border-line bg-panel lg:sticky lg:top-4">
          <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">Tổng kết toàn khoá</h2>
          <dl className="divide-y divide-line px-4">
            {facts.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid min-w-0 grid-cols-1 gap-4">
          {semesters.length === 0 && (
            <EmptyState title="Chưa có học phần nào" description="Bạn chưa đăng ký học phần nào nên chưa có điểm." className="rounded-xl border border-line bg-panel" />
          )}

          {semesters.map(semester => (
            <section key={semester.code} className="rounded-xl border border-line bg-panel">
              <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">
                {semester.name}, năm học {semester.academicYear}
              </h2>

              <DataTable columns={columns} rows={semester.items} caption={`Bảng điểm ${semester.name}, năm học ${semester.academicYear}`} minWidth={760} />

              <div className="border-t border-line px-4 py-3 text-sm">
                <p className="mb-2 font-semibold">Tổng kết học kỳ</p>
                {semester.summary.credits === 0 ? (
                  <p className="text-muted">Học kỳ này chưa có điểm.</p>
                ) : (
                  <dl className="grid grid-cols-2 gap-x-10 gap-y-1">
                    <div className="flex justify-between"><dt className="text-muted">Tổng tín chỉ có điểm</dt><dd>{semester.summary.credits}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Tín chỉ tích luỹ</dt><dd>{semester.summary.earnedCredits}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Điểm TB hệ 10</dt><dd>{formatScore(semester.summary.gpa10, 2)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Điểm TB tích luỹ hệ 10</dt><dd>{formatScore(semester.summary.cumulativeGpa10, 2)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Điểm TB hệ 4</dt><dd>{formatScore(semester.summary.gpa4, 2)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Điểm TB tích luỹ hệ 4</dt><dd>{formatScore(semester.summary.cumulativeGpa4, 2)}</dd></div>
                  </dl>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      {openGrade && <GradeDialog grade={openGrade} onClose={() => setOpenGrade(null)} />}
    </div>
  )
}
