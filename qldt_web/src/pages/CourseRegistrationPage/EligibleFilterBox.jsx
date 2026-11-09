export function EligibleFilterBox({ checked, onChange, eligibleCount, totalCount }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3">
      <label htmlFor="only-eligible" className="flex min-h-11 cursor-pointer items-start gap-3 py-1 lg:min-h-0">
        <input
          id="only-eligible"
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby="only-eligible-hint"
          className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-accent"
        />
        <span>
          <span className="block font-medium">Chỉ hiện học phần đủ điều kiện</span>
          <span id="only-eligible-hint" className="block text-[13px] text-muted">
            Ẩn học phần chưa đạt học phần tiên quyết. Có {eligibleCount}/{totalCount} học phần đủ điều kiện.
          </span>
        </span>
      </label>
    </div>
  )
}
