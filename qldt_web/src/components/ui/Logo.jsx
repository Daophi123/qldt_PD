import { StudentIcon } from "@phosphor-icons/react";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-semibold whitespace-nowrap text-ink">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-white">
        <StudentIcon size={18} weight="bold" aria-hidden="true" />
      </span>
      Cổng đào tạo
    </span>
  )
}