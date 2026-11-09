// 7.65 -> "7,7" (1 chữ số), 2.25 -> "2,25" (2 chữ số). Chưa có điểm (null) -> "-"
export function formatScore(value, digits = 1) {
  if (value === null || value === undefined) return '-'
  return value.toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
