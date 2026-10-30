import { useState } from "react";
import { TextField } from "./TextField";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

export function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField {...props} type={visible ? 'text' : 'password'} endAdornment={
      <button type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} className="grid size-9 place-items-center rounded-md text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-accent">
        {visible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    }>
    </TextField>
  )
}