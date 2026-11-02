import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Button } from "./Button";

export function ErrorState({ error, onRetry, className }) {
  return (
    <div role="alert" className={clsx('grid justify-items-center gap-2 px-6 py-12 text-center', className)}>
      <span className="grid size-10 place-items-center rounded-lg bg-danger-soft text-danger">
        <WarningCircleIcon size={20} aria-hidden="true" />
      </span>
      <p className="font-semibold">Không tải được dữ liệu</p>
      <p className="max-w-sm text-muted">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-1">
          <ArrowClockwiseIcon size={16} aria-hidden="true" />
          Thử lại
        </Button>
      )}
    </div>
  )
}