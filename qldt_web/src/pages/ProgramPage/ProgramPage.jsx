import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { programApi } from '../../apis/programApi'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { SearchInput } from '../../components/form/SearchInput'
import { BlockDialog } from './BlockDialog'

const columns = [
  { key: 'index', header: 'STT', align: 'center', render: (row, index) => index + 1 },
  { key: 'courseCode', header: 'Mã học phần', nowrap: true },
  {
    key: 'courseName',
    header: 'Tên học phần',
    render: row => (
      <>
        {row.courseName}
        {!row.isRequired && <StatusBadge className="ml-1.5">Tự chọn</StatusBadge>}
      </>
    )
  },
  { key: 'knowledgeBlock', header: 'Khối kiến thức', nowrap: true },
  { key: 'credits', header: 'Tín chỉ', align: 'center' },
  {
    key: 'prerequisites',
    header: 'Điều kiện',
    render: row => {
      if (row.prerequisites.length === 0) return null
      return 'Tiên quyết: ' + row.prerequisites.map(course => course.name).join(', ')
    }
  },
  { key: 'semesterNo', header: 'Học kỳ dự kiến', nowrap: true, render: row => 'Học kỳ ' + row.semesterNo },
  {
    key: 'actualSemester',
    header: 'Học kỳ thực tế',
    nowrap: true,
    render: row => row.actualSemester ?? <span className="text-muted">Chưa học</span>
  }
]

export function ProgramPage() {
  const [keyword, setKeyword] = useState('')
  const [openBlock, setOpenBlock] = useState(null)
  const program = useAsync(() => programApi.getMyProgram(), 'my-program')

  if (program.error) {
    return (
      <div>
        <PageHeader title="Chương trình học" group="Góc học tập" />
        <ErrorState error={program.error} onRetry={program.reload} />
      </div>
    )
  }

  if (!program.data) {
    return (
      <div>
        <PageHeader title="Chương trình học" group="Góc học tập" />
        <LoadingState label="Đang tải chương trình học..." />
      </div>
    )
  }

  const data = program.data
  const search = keyword.trim().toLowerCase()
  const rows = data.items.filter(item =>
    item.courseCode.toLowerCase().includes(search) || item.courseName.toLowerCase().includes(search)
  )

  return (
    <div>
      <PageHeader title="Chương trình học" group="Góc học tập" description={data.program.name} />

      <h2 className="mb-2 text-sm font-semibold">Khối kiến thức</h2>
      <ul className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {data.blocks.map(block => (
          <li key={block.name}>
            <button
              type="button"
              onClick={() => setOpenBlock(block)}
              className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-left hover:border-accent"
            >
              <span className="block text-sm font-medium">{block.name}</span>
              <span className="block text-xs text-muted">
                {block.courseCount} học phần, {block.credits} tín chỉ
              </span>
              <span className="mt-1 block text-xs text-accent">Xem chi tiết</span>
            </button>
          </li>
        ))}
      </ul>

      <section className="rounded-xl border border-line bg-panel">
        <div className="flex items-center justify-between gap-3 border-b border-line p-3">
          <SearchInput
            id="program-keyword"
            label="Tìm theo mã hoặc tên học phần"
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="Tìm theo mã hoặc tên học phần"
            className="w-80"
          />
          <p className="text-sm text-muted">
            {data.items.length} học phần, {data.totalCredits} tín chỉ
          </p>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          caption="Học phần theo chương trình"
          minWidth={800}
          empty={{ title: 'Không có học phần phù hợp', description: 'Thử đổi từ khoá tìm kiếm.' }}
        />
      </section>

      {openBlock && (
        <BlockDialog
          block={openBlock}
          items={data.items.filter(item => item.knowledgeBlock === openBlock.name)}
          onClose={() => setOpenBlock(null)}
        />
      )}
    </div>
  )
}
