import { useEffect, useState } from "react";
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Outlet } from "react-router";

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if(!menuOpen) return;
    function handleKeyDown(event) {
      if(event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_minmax(0,1fr)] lg:grid-rows-[52px_minmax(0,1fr)]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-panel focus:px-3 focus:py-2 focus:shadow-md">
        Bỏ qua tới nội dung chính
      </a>

      <Topbar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(value => !value)} />
      <Sidebar open={menuOpen} onNavigate={closeMenu} />

      {menuOpen && (
        <div aria-hidden="true" onClick={closeMenu} className="fixed inset-x-0 top-13 bottom-0 z-35 bg-ink/40 lg:hidden" />
      )}
      <main id="main" tabIndex={-1} className="min-w-0 px-3 pt-3.5 pb-8 outline-none sm:px-5 lg:px-7 lg:pt-5 lg:pb-12">
        <Outlet />
      </main>
    </div>
  )
}