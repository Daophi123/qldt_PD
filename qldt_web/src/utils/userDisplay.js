export const ROLE_LABEL = {
  student: 'Sinh viên',
  admin: 'Quản trị viên'
}

export function getInitials(fullname = '') {
  const words = fullname.trim().split(/\s+/).filter(Boolean);
  if(words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function getUserSubtitle(user) {
  if(user.role === 'student') return `${user.username}`;
  return ROLE_LABEL[user.role] ?? user.role;
}