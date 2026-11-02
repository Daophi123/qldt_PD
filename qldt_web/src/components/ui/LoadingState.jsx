import { SpinnerGapIcon } from "@phosphor-icons/react";
import clsx from "clsx";

export function LoadingState({ label = 'Đang tải...', className }) {
  return (
    <div role="status" className={clsx('flex items-center justify-center gap-2 px-4 py-10 text-muted', className)}>
      <SpinnerGapIcon size={18} className="motion-safe:animate-spin" aria-hidden="true" />
      {label}
    </div>
  )
}