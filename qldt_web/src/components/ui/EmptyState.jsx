import { TrayIcon } from '@phosphor-icons/react';
import clsx from 'clsx';

export function EmptyState({ icon: Icon = TrayIcon, title, description, action, className }) {
  return (
    <div className={clsx('grid justify-items-center gap-2 px-6 py-12 text-center', className)}>
      <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-sm text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}