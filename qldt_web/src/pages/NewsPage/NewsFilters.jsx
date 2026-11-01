import { MagnifyingGlassIcon, PushPinIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import { useState } from "react";

const controlBase = 'h-10 rounded-lg border border-line-strong bg-panel text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-3 focus:ring-accent/15';

export function NewsFilters({ keyword, departmentId, pinnedOnly, departments, onChange }) {
  const [text, setText] = useState(keyword);

  function handleSubmit(event) {
    event.preventDefault();
    onChange({ q: text.trim() });
  }

  return (
    <div className="grid gap-2.5 border-b border-line p-3">
      <form role="search" onSubmit={handleSubmit} className="relative">
        <label htmlFor="news-keyword" className="sr-only">
          Tìm kiếm theo tiêu đề hoặc nội dung
        </label>
        <MagnifyingGlassIcon size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
        <input id="news-keyword" type="search" value={text} onChange={event => setText(event.target.value)} placeholder="Tìm tiêu đề, nội dung rồi nhấn Enter" className={clsx(controlBase, 'w-full pr-3 pl-9 text-base placeholder:text-muted sm:text-sm')} />
      </form>

      <div className="flex flex-wrap gap-2">
        <label htmlFor="news-department" className="sr-only">
          Đơn vị ban hành
        </label>
        <select id="news-department" value={departmentId} onChange={event => onChange({ department: event.target.value })} className={clsx(controlBase, 'min-w-0 flex-1 cursor-pointer px-2.5 text-base sm:text-sm')}>
          <option value="">Tất cả</option>
          {departments.map(department => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>

        <button type="button" aria-pressed={pinnedOnly} onClick={() => onChange({ pinned: !pinnedOnly })}
          className={clsx('inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border px-3 font-medium whitespace-nowrap transition-colors duration-150', pinnedOnly ? 'border-accent/30 bg-accent-soft text-accent-hover' : 'border-line bg-panel text-muted hover:bg-canvas hover:text-ink')}  
        >
          <PushPinIcon size={15} weight={pinnedOnly ? 'fill' : 'regular'} aria-hidden="true" />
          Tin ghim
        </button>
      </div>
    </div>
  )
}