import { DataTable } from "../../components/ui/DataTable";
import { formatSessionTime } from "../../utils/schedule";

const columns = [
  { key: 'classSectionCode', header: 'Mã lớp', nowrap: true, className: 'text-muted' },
  { key: 'courseName', header: 'Học phần', className: 'min-w-52', render: row => (
    <>
      <span className="font-semibold">{row.courseName}</span>
      <span className="block text-xs text-muted">{row.courseCode}</span>
    </>
  ) },
  { key: 'credits', header: 'Tín chỉ', align: 'right' },
  { key: 'lecturerName', header: 'Giảng viên', nowrap: true },
  { key: 'sessions', header: 'Lịch học', render: row => (
    <ul className="grid gap-1">
      {row.sessions.map(session => (
        <li key={session.id}>
          <span className="tabular-nums">{formatSessionTime(session)}</span>
          <span className="block text-xs text-muted">{session.room}</span>
        </li>
      ))}
    </ul>
  ) }
];

export function CourseListView({ items, totalCredits }) {
  return (
    <section aria-label="Danh sách học phần" className="overflow-hidden rounded-xl border border-line bg-panel">
      <DataTable caption="Danh sách học phần đang học" columns={columns} rows={items} rowKey="enrollmentId" minWidth={760} footer={
        <tr>
          <td colSpan={2} className="px-3 py-2.5">
            Tổng
          </td>
          <td className="px-3 py-2.5 text-right tabular-nums">{totalCredits}</td>
          <td colSpan={2} />
        </tr>
      } />
    </section>
  )
}