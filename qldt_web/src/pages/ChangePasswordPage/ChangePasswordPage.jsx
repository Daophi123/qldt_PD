import { useRef, useState } from 'react'
import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../apis/authApi'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { setLoginNotice } from '../../utils/loginNotice'
import { PageHeader } from '../../components/ui/PageHeader'
import { PasswordField } from '../../components/form/PasswordField'
import { Button } from '../../components/ui/Button'

const MIN_LENGTH = 8
const FIELDS = ['oldPassword', 'newPassword', 'confirmPassword']
const WRONG_PASSWORD_MESSAGE = 'Mật khẩu cũ không đúng'

function validate(values) {
  const errors = {}
  if (!values.oldPassword) errors.oldPassword = 'Mật khẩu hiện tại không được để trống'
  if (!values.newPassword) errors.newPassword = 'Mật khẩu mới không được để trống'
  else if (values.newPassword.length < MIN_LENGTH) errors.newPassword = `Mật khẩu mới phải có ít nhất ${MIN_LENGTH} ký tự`
  else if (values.newPassword === values.oldPassword) errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
  if (!values.confirmPassword) errors.confirmPassword = 'Hãy nhập lại mật khẩu mới'
  else if (values.confirmPassword !== values.newPassword) errors.confirmPassword = 'Mật khẩu nhập lại không khớp'
  return errors
}

export function ChangePasswordPage() {
  const { logout } = useAuth()
  const oldPasswordRef = useRef(null)
  const newPasswordRef = useRef(null)
  const confirmPasswordRef = useRef(null)

  function focusField(field) {
    const ref = field === 'oldPassword' ? oldPasswordRef : field === 'newPassword' ? newPasswordRef : confirmPasswordRef
    ref.current?.focus()
  }

  const [values, setValues] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    if (formError) setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const firstInvalid = FIELDS.find((field) => nextErrors[field])
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    setSubmitting(true)
    setFormError('')
    try {
      await authApi.changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword })
      setLoginNotice('Đã đổi mật khẩu. Hãy đăng nhập lại bằng mật khẩu mới.')
      await logout()
    } catch (error) {
      const message = getErrorMessage(error)
      if (message === WRONG_PASSWORD_MESSAGE) {
        setErrors({ oldPassword: 'Mật khẩu hiện tại không đúng' })
        setValues((prev) => ({ ...prev, oldPassword: '' }))
        focusField('oldPassword')
      } else {
        setFormError(message)
      }
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Đổi mật khẩu" group="Tài khoản" />
      <section aria-label="Đổi mật khẩu" className="max-w-lg rounded-xl border border-line bg-panel px-5 py-5 sm:px-6">
        <p className="mb-5 flex items-start gap-2.5 text-muted">
          <InfoIcon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          Sau khi đổi, bạn sẽ được đăng xuất khỏi mọi thiết bị và cần đăng nhập lại bằng mật khẩu mới.
        </p>

        {formError && (
          <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3 text-danger">
            <WarningCircleIcon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{formError}</p>
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="grid gap-4.5">
          <PasswordField
            ref={oldPasswordRef}
            id="oldPassword"
            name="oldPassword"
            label="Mật khẩu hiện tại"
            autoComplete="current-password"
            value={values.oldPassword}
            onChange={handleChange}
            error={errors.oldPassword}
          />
          <PasswordField
            ref={newPasswordRef}
            id="newPassword"
            name="newPassword"
            label="Mật khẩu mới"
            autoComplete="new-password"
            hint={`Ít nhất ${MIN_LENGTH} ký tự và khác mật khẩu hiện tại.`}
            value={values.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
          />
          <PasswordField
            ref={confirmPasswordRef}
            id="confirmPassword"
            name="confirmPassword"
            label="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          <Button type="submit" variant="primary" loading={submitting} className="mt-1 w-full sm:w-auto sm:justify-self-start">
            {submitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </section>
    </>
  )
}
