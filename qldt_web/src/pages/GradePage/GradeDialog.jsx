import { useEffect, useRef } from 'react'
import { ArrowLeftIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '../../components/ui/Button'
import { formatScore } from './formatScore'

// Cửa sổ "Chi tiết" điểm của 1 học phần (cùng cách làm với BlockDialog của Chương trình học)
export function GradeDialog({ grade, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  function close() {
    dialogRef.current.close()
  }

  function handleClick(event) {
    if (event.target === dialogRef.current) close()
  }

  // Mỗi dòng: [tên, giá trị]
  const rows = [
    ['Lớp học phần', grade.classSectionCode],
    ['Giảng viên', grade.lecturerName],
    ['Số tín chỉ', grade.credits],
    ['Lần học', grade.attempt],
    ['Điểm quá trình (30%)', formatScore(grade.processScore)],
    ['Điểm thi (70%)', formatScore(grade.examScore)],
    ['Điểm tổng kết hệ 10', formatScore(grade.score10)],
    ['Điểm hệ 4', formatScore(grade.score4)],
    ['Điểm chữ', grade.letter],
    ['Đánh giá', grade.passed ? 'Đạt' : 'Học lại']
  ]

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby="grade-dialog-title"
      className="m-auto w-full max-w-lg rounded-xl border border-line bg-panel p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 id="grade-dialog-title" className="font-semibold">
          {grade.courseCode} - {grade.courseName}
        </h2>
        <button type="button" onClick={close} aria-label="Đóng" className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink">
          <XIcon size={18} aria-hidden="true" />
        </button>
      </div>

      <dl className="px-5 py-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-line py-2 text-sm last:border-b-0">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex justify-end border-t border-line px-5 py-3">
        <Button onClick={close}>
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Quay lại
        </Button>
      </div>
    </dialog>
  )
}
