import { ListIcon, SidebarSimpleIcon, XIcon } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router';
import { Logo } from '../../components/ui/Logo';
import { getInitials, getUserSubtitle } from '../../utils/userDisplay';

export function Topbar({ menuOpen, onToggleMenu, sidebarCollapsed, onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-13 items-center gap-2 border-b border-line bg-panel px-2.5 lg:col-span-2 lg:gap-3 lg:px-4">
      <button type="button" onClick={onToggleMenu} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} aria-controls="app-sidebar" className="grid size-10 place-items-center rounded-lg border border-line text-ink hover:bg-canvas lg:hidden">
        {menuOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
      </button>

      <button type="button" onClick={onToggleSidebar} aria-label={sidebarCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'} aria-expanded={!sidebarCollapsed} aria-controls="app-sidebar" title={sidebarCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'} className="hidden size-9 cursor-pointer place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink lg:grid">
        <SidebarSimpleIcon size={20} weight={sidebarCollapsed ? 'regular' : 'fill'} aria-hidden="true" />
      </button>

      <Link to="/" className="rounded-lg">
        <Logo />
      </Link>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="hidden text-right leading-tight sm:block">
          <div className="font-medium">{user.fullName}</div>
          <div className="text-xs text-muted">{getUserSubtitle(user)}</div>
        </div>
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-hover">
          {getInitials(user.fullName)}
        </span>
      </div>
    </header>
  )
}