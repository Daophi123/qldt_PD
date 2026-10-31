import { CaretRightIcon } from "@phosphor-icons/react";

export function PageHeader({ title, description, group }) {
  return (
    <div className="mt-1 mb-4.5">
      {group && ( <p className="flex items-center gap-1.5 text-[13px] text-muted">
        {group}
        <CaretRightIcon size={12} aria-hidden="true" />
        {title}
      </p> )}
      <h1 className="mt-1 text-[22px] leading-tight font-semibold tracking-[-0.01em]">{title}</h1>
      {description && <p className="mt-0.5 text-muted">{description}</p>}
    </div>
  )
}