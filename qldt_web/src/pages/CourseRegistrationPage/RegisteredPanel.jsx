import clsx from 'clsx'
import { Link } from 'react-router'
import { CalendarBlankIcon, XIcon } from '@phosphor-icons/react'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatSessionDay, shortSectionCode } from './registrationText'

export function RegisteredPanel({ data, canAct, busy, onCancel, className, children }) {
  const { registered, registeredCredits, rules, semester } = data
  const percent = Math.min(100, (registeredCredits / rules.maxCredits) * 100)
  const missingCredits = Math.max(0, rules.minCredits - registeredCredits)

  return (
    <section aria-labelledby="registered-title" className={clsx('grid gap-3 lg:sticky lg:top-4', className)}>
      <div className="overflow-hidden rounded-xl border border-line bg-panel">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h2 id="registered-title" className="font-semibold">Học phần đã đăng ký</h2>
          <StatusBadge>{registered.length} học phần</StatusBadge>
        </div>

        <div className="border-b border-line px-4 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-muted">Tổng tín chỉ</span>
            <span className="tabular-nums">
              <span className="text-[22px] font-semibold">{registeredCredits}</span>
              <span className="text-muted"> / {rules.maxCredits} tối đa</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Tín chỉ đã đăng ký"
            aria-valuemin={0}
            aria-valuemax={rules.maxCredits}
            aria-valuenow={registeredCredits}
            aria-valuetext={`${registeredCredits} trên ${rules.maxCredits} tín chỉ`}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas"
          >
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
          <p className={clsx('mt-2 text-[13px]', missingCredits > 0 ? 'text-danger' : 'text-muted')}>
            {missingCredits > 0
              ? `Cần thêm ${missingCredits} tín chỉ để đủ tối thiểu ${rules.minCredits} tín chỉ.`
              : `Đã đủ tối thiểu ${rules.minCredits} tín chỉ.`}
          </p>
        </div>

        {registered.length === 0 ? (
          <p className="px-4 py-6 text-center text-muted">Chưa đăng ký học phần nào trong học kỳ này.</p>
        ) : (
          <ul className="divide-y divide-line">
            {registered.map((item) => (
              <li key={item.enrollmentId} className="flex items-start gap-2 px-4 py-3">
                <div className="min-w-0 grow">
                  <p className="font-medium">{item.courseName}</p>
                  <p className="text-[13px] text-muted">
                    {shortSectionCode(item.classSectionCode)}, {item.sessions.map(formatSessionDay).join('; ')}, {item.credits} tín chỉ
                  </p>
                </div>
                {canAct && (
                  <button
                    type="button"
                    onClick={() => onCancel(item)}
                    disabled={busy}
                    aria-label={`Huỷ lớp ${shortSectionCode(item.classSectionCode)}, ${item.courseName}`}
                    className="grid size-11 shrink-0 cursor-pointer lg:size-9 place-items-center rounded-lg border border-line text-muted transition-colors duration-150 hover:border-danger/30 hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XIcon size={16} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {children}

      <Link
        to={`/schedule/class?semester=${semester.code}`}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-4 font-medium transition-colors duration-150 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <CalendarBlankIcon size={18} aria-hidden="true" />
        Xem trước thời khoá biểu
      </Link>
    </section>
  )
}
