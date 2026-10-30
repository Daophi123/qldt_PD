const DEFAULT_MESSAGE = 'Đã có lỗi xảy ra. Vui lòng thử lại';

export function getErrorMessage(error, fallback = DEFAULT_MESSAGE) {
  if(error?.response) {
    const message = error.response.data?.message;
    if(message) return message;

    if(error.response.status >= 500) {
      return 'Máy chủ đang gặp sự cố hoặc chưa chạy. Vui lòng thử lại sau.';
    }
    return fallback;
  }
  if(error?.request) {
    return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  }
  return fallback;
}