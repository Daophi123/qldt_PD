const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

export function formatDateTime(iosString) {
  if(!iosString) return '';
  return dateTimeFormatter.format(new Date(iosString));
}

export function formatNumber(value) {
  return (value ?? 0).toLocaleString('vi-VN');
}

export function formatFileSize(bytes) {
  if(!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while(size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} ${units[unit]}`;
}