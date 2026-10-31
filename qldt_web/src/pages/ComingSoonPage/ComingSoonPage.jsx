import { Link, useLocation } from 'react-router';
import { HammerIcon } from '@phosphor-icons/react';
import { findNavLink } from '../../routes/navigation';
import { PageHeader } from '../../components/ui/PageHeader';

export function ComingSoonPage() {
  const { pathname } = useLocation();
  const link = findNavLink(pathname);
  const title = link?.label ?? 'Đang phát triển';

  return (
    <>
      <PageHeader title={title} group={link?.group} />
      <section className="grid max-w-xl justify-items-start gap-3 rounded-xl border border-line bg-panel px-5 py-6">
        <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
          <HammerIcon size={20} aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold">Chức năng đang được xây dựng</h2>
        <p className="text-muted">
          Mục {title.toLowerCase()} sẽ có trên cổng mới trong thời gian tới. Trong lúc chờ, bạn xem thông báo
          mới nhất ở mục Tin tức.
        </p>
        <Link to="/" className="font-medium text-accent-hover underline underline-offset-4">
          Về trang chủ
        </Link>
      </section>
    </>
  )
}