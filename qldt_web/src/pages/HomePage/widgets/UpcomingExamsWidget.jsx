import { Link } from 'react-router'
import { useAsync } from '../../../hooks/useAsync'
import { examApi } from '../../../apis/examApi'
import { LoadingState } from '../../../components/ui/LoadingState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { getWeekday, toSortable, getTodaySortable } from '../../ExamSchedulePage/examDate'

// Hiện tối đa bao nhiêu môn thi
const MAX_ITEMS = 3

// Khối "Lịch thi sắp tới" cho trang chủ (Dương viết, Phi ghép vào HomePage)
export function UpcomingExamsWidget() {
  // Không truyền mã học kỳ: API tự lấy học kỳ hiện tại
  const exams = useAsync(() => examApi.getMySchedule(), 'home-upcoming-exams')

  let content
  if (exams.error) {
    content = <ErrorState error={exams.error} onRetry={exams.reload} className="py-6" />
  } else if (!exams.data) {
    content = <LoadingState label="Đang tải lịch thi..." className="py-6" />
  } else {
    // Chỉ lấy môn thi từ hôm nay trở đi. API đã sắp xếp sẵn theo ngày
    const today = getTodaySortable()
    const upcoming = exams.data.items.filter(exam => toSortable(exam.examDate) >= today).slice(0, MAX_ITEMS)

    if (upcoming.length === 0) {
      content = <EmptyState title="Chưa có lịch thi sắp tới" description="Lịch thi học kỳ này sẽ hiện ở đây khi nhà trường công bố." className="py-6" />
    } else {
      content = (
        <ul>
          {upcoming.map(exam => (
            <li key={exam.id} className="flex gap-3 border-b border-line px-4 py-3 last:border-b-0">
              <div className="w-24 shrink-0 text-sm">
                <span className="block font-medium">{exam.examDate}</span>
                <span className="block text-xs text-muted">
                  {getWeekday(exam.examDate)}, {exam.startTime}
                </span>
              </div>
              <div className="min-w-0 text-sm">
                <span className="block font-medium">{exam.courseName}</span>
                <span className="block text-xs text-muted">
                  {exam.room ? `${exam.room}, số báo danh ${exam.seatNumber}` : 'Chưa xếp phòng'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )
    }
  }

  return (
    <section className="rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">Lịch thi sắp tới</h2>
        <Link to="/schedule/exam" className="text-sm text-accent hover:underline">
          Xem tất cả
        </Link>
      </div>
      {content}
    </section>
  )
}
