import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { controlClass } from './controlClass'

// Ô tìm kiếm có kính lúp, dùng ở thanh bộ lọc.
// - id, label: bắt buộc. label bị ẩn khỏi mắt nhưng trình đọc màn hình vẫn đọc.
// - onSubmit (không bắt buộc): gọi khi nhấn Enter. Bỏ trống nếu trang lọc ngay khi gõ.
// - Các thuộc tính còn lại (value, onChange, placeholder...) truyền thẳng vào <input>.
export function SearchInput({ id, label, onSubmit, className, ...inputProps }) {
  function handleSubmit(event) {
    event.preventDefault()
    if (onSubmit) onSubmit()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={clsx('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <MagnifyingGlassIcon size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
      <input id={id} type="search" className={clsx(controlClass, 'w-full pr-3 pl-9 placeholder:text-muted')} {...inputProps} />
    </form>
  )
}
