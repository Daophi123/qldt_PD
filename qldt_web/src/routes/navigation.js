import { BooksIcon, CalendarBlankIcon, FilesIcon, HouseIcon, NewspaperIcon, NotePencilIcon } from "@phosphor-icons/react";

export const NAV_ITEMS = [
  { label: 'Trang chủ', to: '/', icon: HouseIcon, end: true },
  { label: 'Tin tức', to: '/news', icon: NewspaperIcon },
  { label: 'Góc học tập', icon: BooksIcon, basePath: '/study-corner', children: [
    { label: 'Tra cứu điểm', to: '/study-corner/grade'  },
    { label: 'Chương trình học', to: '/study-corner/program' },
  ] },
  { label: 'Đăng ký trực tuyến', icon: NotePencilIcon, basePath: '/register-online', children: [
    { label: 'Đăng ký học', to: '/register-online/course-registration' },
    { label: 'Tra cứu kết quả đăng ký', to: '/register-online/registration-of-course' }
  ] },
  { label: 'Thời khóa biểu', icon: CalendarBlankIcon, basePath: '/schedule', children: [
    { label: 'Lịch học', to: '/schedule/class' },
    { label: 'Lịch thi', to: '/schedule/exam' }
  ] },
  { label: 'Văn bản', to: '/document', icon: FilesIcon }
]

export const ACCOUNT_ITEMS = [
  { label: 'Đổi mật khẩu', to: '/change-password' }
]

export const NAV_LINKS = [
  ...NAV_ITEMS.flatMap(item => item.children ? item.children.map(child => ({ ...child, group: item.label })) : [item]),
  ...ACCOUNT_ITEMS
]

export function findNavLink(pathname) {
  return NAV_LINKS.find(link => link.to === pathname);
}