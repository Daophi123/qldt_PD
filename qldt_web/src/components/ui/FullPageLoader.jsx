import { SpinnerGapIcon } from "@phosphor-icons/react";

export function FullPageLoader({ message = 'Đang kiểm tra phiên đăng nhập' }) {
  return (
    <div role="status" className="grid min-h-dvh place-items-center text-muted">
      <div className="flex items-center gap-2">
        <SpinnerGapIcon size={20} className="motion-safe:animate-spin" aria-hidden="true" />
        {message}
      </div>
    </div>
  )
}