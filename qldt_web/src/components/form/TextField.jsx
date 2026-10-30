import { WarningCircleIcon } from "@phosphor-icons/react";
import clsx from "clsx";

const inputBase = 'h-[42px] w-full rounded-lg border bg-panel px-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:ring-3';

const inputNormal = 'border-line-strong focus:border-accent focus:ring-accent/15';
const inputError = 'border-danger focus:border-danger focus:ring-danger/15';

export function TextField({ ref, id, label, error, hint, endAdornment, className, inputClassName, ...inputProps }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={clsx('grid gap-1.5', className)}>
      <label htmlFor={id} className="font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        <input ref={ref} id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={clsx(inputBase, error ? inputError : inputNormal, endAdornment && 'pr-12', inputClassName)}{...inputProps} />
        {endAdornment && ( <div className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</div> )}
      </div>
      {error ? ( <p id={errorId} className="flex items-center gap-1.5 text-[13px] text-danger">
        <WarningCircleIcon size={16} aria-hidden="true" />
        {error}
      </p> ) : (hint && ( <p id={hintId} className="text-[13px] text-muted">{hint}</p> ))}
    </div>
  )
}