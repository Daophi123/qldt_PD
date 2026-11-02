import clsx from "clsx";

const tones = {
  neutral: 'bg-canvas text-muted ring-line',
  accent: 'bg-accent-soft text-accent-hover ring-accent/20',
  danger: 'bg-danger-soft text-danger ring-danger/20'
};

export function StatusBadge({ tone = 'neutral', icon: Icon, children, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset', tones[tone], className)}>
      {Icon && <Icon size={12} weight="fill" aria-hidden="true" />}
      {children}
    </span>
  )
}