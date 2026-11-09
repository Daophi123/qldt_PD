import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { documentApi } from '../../apis/documentApi'
import { newsApi } from '../../apis/newsApi'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { formatFileSize } from '../../utils/format'
import { SearchInput } from '../../components/form/SearchInput'
import { Select } from '../../components/form/Select'

const TYPE_LABEL = {
  regulation: 'Quy chế',
  rule: 'Quy định',
  guide: 'Hướng dẫn',
  form: 'Biểu mẫu'
}

const columns = [
  { key: 'code', header: 'Số hiệu', nowrap: true },
  { key: 'title', header: 'Tên văn bản' },
  { key: 'type', header: 'Loại', nowrap: true, render: row => TYPE_LABEL[row.type] },
  { key: 'department', header: 'Đơn vị ban hành', render: row => row.department?.name },
  { key: 'issuedDate', header: 'Ngày ban hành', nowrap: true },
  {
    key: 'file',
    header: 'Tệp',
    nowrap: true,
    render: row => {
      const file = row.files[0]
      if (!file) return null
      return (
        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
          Tải {file.fileType.toUpperCase()} ({formatFileSize(file.fileSize)})
        </a>
      )
    }
  }
]

export function DocumentPage() {
  const [text, setText] = useState('')
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  const departments = useAsync(() => newsApi.getDepartments(), 'departments')
  const documents = useAsync(
    () => documentApi.getList({
      limit: 100,
      keyword: keyword || undefined,
      type: type || undefined,
      departmentId: departmentId || undefined
    }),
    `${keyword}|${type}|${departmentId}`
  )

  function handleSearch() {
    setKeyword(text.trim())
  }

  let content
  if (documents.error) {
    content = <ErrorState error={documents.error} onRetry={documents.reload} />
  } else if (!documents.data) {
    content = <LoadingState label="Đang tải văn bản..." />
  } else {
    content = (
      <DataTable
        columns={columns}
        rows={documents.data.items}
        caption="Danh sách văn bản"
        busy={documents.loading}
        empty={{ title: 'Không có văn bản phù hợp', description: 'Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm.' }}
      />
    )
  }

  return (
    <div>
      <PageHeader title="Văn bản" description="Quy chế, quy định, hướng dẫn và biểu mẫu dành cho người học." />

      <section className="rounded-xl border border-line bg-panel">
        <div className="flex flex-wrap gap-2 border-b border-line p-3">
          <SearchInput
            id="document-keyword"
            label="Tìm theo số hiệu hoặc tên văn bản"
            value={text}
            onChange={event => setText(event.target.value)}
            onSubmit={handleSearch}
            placeholder="Tìm số hiệu, tên văn bản rồi nhấn Enter"
            className="w-80"
          />

          <Select id="document-type" label="Loại văn bản" value={type} onChange={event => setType(event.target.value)}>
            <option value="">Mọi loại văn bản</option>
            <option value="regulation">Quy chế</option>
            <option value="rule">Quy định</option>
            <option value="guide">Hướng dẫn</option>
            <option value="form">Biểu mẫu</option>
          </Select>

          <Select id="document-department" label="Đơn vị ban hành" value={departmentId} onChange={event => setDepartmentId(event.target.value)}>
            <option value="">Mọi đơn vị ban hành</option>
            {(departments.data ?? []).map(department => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </div>

        {content}
      </section>
    </div>
  )
}