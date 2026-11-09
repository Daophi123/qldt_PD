import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'

export function ConfirmDialog({ title, description, confirmLabel = 'Xác nhận', cancelLabel = 'Quay lại', danger = false, loading = false, onConfirm, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
  }, [])

  function handleCancel(event) {
    if (loading) event.preventDefault()
  }

  function handleClick(event) {
    if (event.target === dialogRef.current && !loading) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={handleCancel}
      onClick={handleClick}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-panel p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="px-5 pt-5 pb-4">
        <h2 id={titleId} className="text-[17px] font-semibold">{title}</h2>
        {description && <p id={descriptionId} className="mt-1.5 text-muted">{description}</p>}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-3 sm:flex-row sm:justify-end">
        <Button onClick={onClose} disabled={loading} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
