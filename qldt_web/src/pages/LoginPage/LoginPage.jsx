import { useRef, useState } from 'react';
import { StudentIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { TextField } from '../../components/form/TextField';
import { PasswordField } from '../../components/form/PasswordField';
import { Button } from '../../components/ui/Button';
import campusImage from '../../assets/image.png';

function validate(values) {
  const errors = {};
  if(!values.username.trim()) errors.username = 'Tài khoản không được để trống';
  if(!values.password) errors.password = 'Mật khẩu không được để trống';
  return errors;
}

export function LoginPage() {
  const { login } = useAuth();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [values, setValues] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if(errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    if(formError) setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if(nextErrors.username) {
      usernameRef.current?.focus();
      return;
    }
    if(nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await login(values.username.trim(), values.password);
    } catch(error) {
      setFormError(getErrorMessage(error));
      if(error.response?.status === 401) {
        setValues(prev => ({ ...prev, password: '' }));
        passwordRef.current?.focus();
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,520px)_1fr]">
      <section className="flex flex-col bg-panel px-5 py-8 sm:px-10 lg:border-r lg:border-line lg:px-16 lg:py-14">
        <div className="flex items-center gap-2.5 text-[15px] font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-white">
            <StudentIcon size={18} weight="bold" aria-hidden="true" />
          </span>
          Cổng Đào tạo
        </div>

        <div className="my-auto w-full max-w-[380px] py-12">
          <h1 className="text-[28px] font-semibold tracking-[-0.015em]">Đăng nhập</h1>
          <p className="mt-1.5 mb-8 text-muted">
            Sinh viên dùng mã số sinh viên. Cán bộ dùng email công vụ.
          </p>
          {formError && ( <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3 text-danger">
            <WarningCircleIcon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{formError}</p>
          </div> )}
          <form noValidate onSubmit={handleSubmit} className="grid gap-[18px]">
            <TextField
              ref={usernameRef}
              id="username"
              name="username"
              label="Tài khoản"
              autoComplete="username"
              hint="Mã số sinh viên hoặc email do trường cấp."
              value={values.username}
              onChange={handleChange}
              error={errors.username}
            />
            <PasswordField
              ref={passwordRef}
              id="password"
              name="password"
              label="Mật khẩu"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
            />
            <Button type="submit" variant="primary" loading={submitting} className="mt-2 w-full text-[15px]">
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </div>
        <p className="text-[13px] text-muted">
          Quên mật khẩu: liên hệ Phòng Đào tạo, tầng 2 nhà A1, giờ hành chính.
        </p>
      </section>
      {/* Ảnh chỉ để trang trí nên alt rỗng; ẩn trên điện thoại để form hiện ngay */}
      <div className="relative hidden bg-accent lg:block">
        <img
          src={campusImage}
          alt=""
          className="absolute inset-0 size-full object-cover object-[68%_center]"
        />
      </div>
    </main>
  )
}