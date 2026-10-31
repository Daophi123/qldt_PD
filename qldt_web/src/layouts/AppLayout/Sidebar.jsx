import { CaretRightIcon, KeyIcon, SignOutIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import { useId, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useAuth } from '../../hooks/useAuth'
import { NAV_ITEMS } from '../../routes/navigation'

const itemBase = 'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 text-left font-medium transition-colors duration-150 lg:h-9';
const itemIdle = 'text-ink hover:bg-panel/65';
const itemActive = 'bg-panel font-semibold text-ink shadow-[0_1px_2px_rgb(22_27_43/0.07)]';

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <li>
      <NavLink to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => clsx(itemBase, isActive ? itemActive : itemIdle)}>
        {({ isActive }) => (
          <>
            <Icon size={18} aria-hidden="true" className={isActive ? 'text-accent' : 'text-muted'} />
            {item.label}
          </>
        )}
      </NavLink>
    </li>
  )
}

function NavGroup({ item, onNavigate }) {
  const Icon = item.icon;
  const { pathname } = useLocation();
  const listId = useId();
  const [open, setOpen] = useState(true);
  const hasCurrent = pathname.startsWith(item.basePath)

  return (
    <li>
      <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={listId} className={clsx(itemBase, itemIdle, hasCurrent && 'font-semibold')}>
        <Icon size={18} aria-hidden="true" className={hasCurrent ? 'text-accent' : 'text-muted'} />
        {item.label}
        <CaretRightIcon size={13} aria-hidden="true" className={clsx('ml-auto text-muted transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-90')} />
      </button>

      {open && (
        <ul id={listId} className="mt-0.5 mb-1.5 ml-4.75 grid gap-px border-l border-line-strong pl-2.5">
          {item.children.map(child => (
            <li key={child.to}>
              <NavLink to={child.to} onClick={onNavigate} className={({ isActive }) =>
                clsx('flex h-10 items-center rounded-[7px] px-2.5 transition-colors duration-150 lg:h-8', isActive ? 'bg-panel font-semibold text-accent-hover shadow-[0_1px_2px_rgb(22_27_43/0.07)]' : 'text-muted hover:bg-panel/65 hover:text-ink')
              }>
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

const footItem = 'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 text-left text-muted transition-colors duration-150 hover:bg-panel/65 hover:text-ink lg:h-[34px]';

export function Sidebar({ open, onNavigate }) {
  const { logout } = useAuth();

  return (
    <nav id="app-sidebar" aria-label="Điều hướng chính" className={clsx(
      // Điện thoại: ngăn kéo trượt từ trái, nằm dưới thanh trên cùng
      'fixed top-13 bottom-0 left-0 z-40 flex w-72 flex-col overflow-y-auto border-r border-line bg-rail px-2.5 pt-3 pb-4 scrollbar-thin',
      'transition-[translate,visibility] duration-200 ease-out motion-reduce:transition-none',
      // invisible để link bị ẩn không nhận Tab khi menu đóng
      open ? 'translate-x-0 shadow-[0_16px_40px_rgb(22_27_43/0.18)]' : 'invisible -translate-x-full',
      // Máy tính: luôn hiện, dính dưới thanh trên cùng khi cuộn trang
      'lg:visible lg:sticky lg:bottom-auto lg:z-auto lg:h-[calc(100dvh-52px)] lg:w-auto lg:translate-x-0 lg:self-start lg:shadow-none',
    )}>
      <ul className="grid gap-0.5">
        {NAV_ITEMS.map(item => item.children ? (<NavGroup key={item.label} item={item} onNavigate={onNavigate} />) : (<NavItem key={item.to} item={item} onNavigate={onNavigate} />))}
      </ul>
      <div className="mt-auto grid gap-0.5 border-t border-line pt-3">
        <NavLink to="/change-password" onClick={onNavigate} className={({ isActive }) => clsx(footItem, isActive && 'bg-panel font-semibold text-ink')}>
          <KeyIcon size={17} aria-hidden="true" />
          Đổi mật khẩu
        </NavLink>
        <button type="button" onClick={logout} className={footItem}>
          <SignOutIcon size={17} aria-hidden="true" />
          Đăng xuất
        </button>
      </div>
    </nav>
  )
}