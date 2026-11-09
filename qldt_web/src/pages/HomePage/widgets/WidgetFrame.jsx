import { Link } from 'react-router'

export function WidgetFrame({ title, linkTo, linkLabel, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {linkTo && (
          <Link to={linkTo} className="text-sm text-accent hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
