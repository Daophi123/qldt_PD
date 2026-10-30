import { SpinnerGapIcon } from "@phosphor-icons/react";
import clsx from "clsx";

const base = 'inline-flex h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  default: 'border border-line bg-panel text-ink hover:bg-canvas'
};

export function Button({ variant = 'default', type = 'button', loading = false, disabled, className, children, ...props }) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={clsx(base, variants[variant], className)} {...props}>
      { loading && (
        <SpinnerGapIcon size={18} className="motion-safe:animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}