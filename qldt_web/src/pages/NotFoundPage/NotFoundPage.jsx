import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <h1 className="text-[22px] font-semibold">Không tìm thấy trang</h1>
        <p className="mt-1 text-muted">Đường dẫn không tồn tại hoặc đã bị thay đổi.</p>
        <Link to="/" className="mt-4 inline-block font-medium text-accent-hover underline underline-offset-4">
          Về trang chủ
        </Link>
      </div>
    </main>
  )
}