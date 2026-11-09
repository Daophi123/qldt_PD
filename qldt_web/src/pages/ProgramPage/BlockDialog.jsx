import { useEffect, useRef } from 'react'
import { ArrowLeftIcon, XIcon } from '@phosphor-icons/react'
import { DataTable } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'

const columns = [
  { key: 'index', header: 'STT', align: 'center', render: (row, index) => index + 1 },
  { key: 'courseCode', header: 'Mã học phần', nowrap: true },
  { key: 'courseName', header: 'Tên học phần' },
  { key: 'credits', header: 'Số tín chỉ', align: 'center' },
  { key: 'semesterNo', header: 'Học kỳ dự kiến', nowrap: true, render: row => 'Học kỳ ' + row.semesterNo },
  { key: 'isRequired', header: 'Loại', nowrap: true, render: row => (row.isRequired ? 'Bắt buộc' : 'Tự chọn') }
]

// Cửa sổ bật lên: danh sách học phần của 1 khối kiến thức
export function BlockDialog({ block, items, onClose }) {
  const dialogRef = useRef(null)

  // Vừa hiện ra thì mở cửa sổ ở chế độ "modal" (che nền phía sau, nhấn Esc để đóng)
  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  function close() {
    dialogRef.current.close()
  }

  // Bấm ra vùng tối bên ngoài cửa sổ thì đóng
  function handleClick(event) {
    if (event.target === dialogRef.current) close()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby="block-dialog-title"
      className="m-auto w-full max-w-3xl rounded-xl border border-line bg-panel p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 id="block-dialog-title" className="font-semibold">
          {block.name}
        </h2>
        <button type="button" onClick={close} aria-label="Đóng" className="rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink">
          <XIcon size={18} aria-hidden="true" />
        </button>
      </div>

      <DataTable columns={columns} rows={items} rowKey="id" caption={'Học phần thuộc ' + block.name} minWidth={560} />

      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <p className="text-sm text-muted">
          {block.courseCount} học phần, {block.credits} tín chỉ
        </p>
        <Button onClick={close}>
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Quay lại
        </Button>
      </div>
    </dialog>
  )
}
