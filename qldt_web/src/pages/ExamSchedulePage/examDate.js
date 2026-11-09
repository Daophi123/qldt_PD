// Các hàm xử lý ngày thi, dùng chung cho trang Lịch thi và khối "Lịch thi sắp tới" ở trang chủ

// "04/01/2027" -> "Thứ 2"
export function getWeekday(dateText) {
  const [day, month, year] = dateText.split('/')
  const weekday = new Date(year, month - 1, day).getDay()
  return weekday === 0 ? 'Chủ nhật' : 'Thứ ' + (weekday + 1)
}

// "04/01/2027" -> "20270104", để so sánh ngày nào trước ngày nào
export function toSortable(dateText) {
  const [day, month, year] = dateText.split('/')
  return year + month + day
}

// Hôm nay dạng "20261109"
export function getTodaySortable() {
  const today = new Date()
  return String(today.getFullYear()) + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0')
}
