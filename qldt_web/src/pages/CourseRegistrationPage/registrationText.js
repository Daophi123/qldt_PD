import { DAY_LABELS } from '../../utils/schedule'

export function shortSectionCode(code) {
  return code.split('-').slice(2).join('-')
}

export function formatSessionDay(session) {
  return `${DAY_LABELS[session.dayOfWeek]}, tiết ${session.startPeriod}-${session.endPeriod}`
}

export function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export function getCourseBlock(course) {
  const missing = course.prerequisites.filter((prerequisite) => prerequisite.status !== 'passed')
  if (missing.length === 0) return null
  const names = missing.map((prerequisite) =>
    prerequisite.status === 'studying' ? `${prerequisite.code} (đang học, chưa có điểm)` : prerequisite.code,
  )
  return `Chưa đạt học phần tiên quyết ${names.join(', ')}.`
}
