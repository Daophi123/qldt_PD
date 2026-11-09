import { Link } from 'react-router'
import { useAsync } from '../../../hooks/useAsync'
import { gradeApi } from '../../../apis/gradeApi'
import { LoadingState } from '../../../components/ui/LoadingState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { formatScore } from '../../GradePage/formatScore'

// Khối "Kết quả học tập" cho trang chủ (Dương viết, Phi ghép vào HomePage)
export function GradeSummaryWidget() {
  // Dùng lại đúng API của trang Tra cứu điểm, chỉ lấy phần tổng kết
  const grades = useAsync(() => gradeApi.getMyGrades(), 'home-grade-summary')

  let content
  if (grades.error) {
    content = <ErrorState error={grades.error} onRetry={grades.reload} className="py-6" />
  } else if (!grades.data) {
    content = <LoadingState label="Đang tải kết quả học tập..." className="py-6" />
  } else {
    const summary = grades.data.summary

    // Mỗi ô: [tên, giá trị]
    const facts = [
      ['Điểm TB tích luỹ hệ 4', formatScore(summary.cumulativeGpa4, 2)],
      ['Điểm TB tích luỹ hệ 10', formatScore(summary.cumulativeGpa10, 2)],
      ['Tín chỉ tích luỹ', `${summary.earnedCredits} / ${summary.programCredits ?? '-'}`],
      ['Tín chỉ đã học', summary.attemptedCredits]
    ]

    content = (
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-3">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <section className="rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">Kết quả học tập</h2>
        <Link to="/study-corner/grade" className="text-sm text-accent hover:underline">
          Xem bảng điểm
        </Link>
      </div>
      {content}
    </section>
  )
}
