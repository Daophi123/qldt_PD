import clsx from 'clsx'
import { controlClass } from './controlClass'

// Ô chọn (danh sách thả xuống) dùng ở thanh bộ lọc.
// - id, label: bắt buộc. label bị ẩn khỏi mắt nhưng trình đọc màn hình vẫn đọc.
// - children: các thẻ <option>.
// - Các thuộc tính còn lại (value, onChange, disabled...) truyền thẳng vào <select>.
export function Select({ id, label, className, children, ...selectProps }) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} className={clsx(controlClass, 'cursor-pointer px-2.5 disabled:cursor-not-allowed disabled:opacity-60', className)} {...selectProps}>
        {children}
      </select>
    </>
  )
}
