import { SignOutIcon } from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'

const ROLE_LABEL = {
  student: 'Sinh viên',
  admin: 'Quản trị viên',
}

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main className="mx-auto grid max-w-xl gap-4 px-5 py-16">
      <h1 className="text-[22px] font-semibold">Xin chào {user.fullName}</h1>
      <p className="text-muted">
        Tài khoản {user.username}, vai trò {ROLE_LABEL[user.role] ?? user.role}.
      </p>
      <Button onClick={logout} className="w-max">
        <SignOutIcon size={18} aria-hidden="true" />
        Đăng xuất
      </Button>
    </main>
  )
}