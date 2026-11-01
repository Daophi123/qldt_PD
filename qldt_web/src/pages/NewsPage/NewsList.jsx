import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { BookmarkSimpleIcon, CaretLeftIcon, CaretRightIcon, EyeIcon, PushPinIcon } from "@phosphor-icons/react";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router";
import clsx from "clsx";
import { formatNumber } from "../../utils/format"

export function NewsList ({ state,  activeId, isSavedTab, hasFilters, linkSearch, onPageChange, onClearFilters }) {
  const { data, error, loading, reload } = state;

  if(error) return <ErrorState error={error} onRetry={reload} />
  if(!data) return <LoadingState label="Đang tải danh sách tin..." />

  const { items, pagination } = data;

  if(items.length === 0) {
    return isSavedTab ? 
      (<EmptyState icon={BookmarkSimpleIcon} title="Chưa có tin nào được lưu" description="Mở một tin và bấm Lưu để đọc lại sau." />) :
      (<EmptyState title="Không có tin nào phù hợp" description={hasFilters ? 'Thử bỏ bớt bộ lọc hoặc thay đổi từ khóa tìm kiếm.' : "Chuyên mục này chưa có thông báo nào."} action={hasFilters && <Button onClick={onClearFilters}>Xóa bộ lọc</Button>} />)
  }

  return (
    <div aria-busy={loading} className={clsx('transition-opacity duration-150', loading && 'opacity-60')}>
      <ul className="divide-y divide-line">
        {items.map(item => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <Link to={{ pathname: `/news/${item.id}`, search: linkSearch }} aria-current={isActive ? 'true' : undefined}
                className={clsx('grid gap-1 px-4 py-3.5 transition-colors duration-150', isActive ? 'bg-accent-soft' : 'hover:bg-canvas')}>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {item.isPinned && (<StatusBadge tone="accent" icon={PushPinIcon}>Ghim</StatusBadge>)}
                    <span className="min-w-0 truncate">{item.department?.name}</span>
                    <span className="ml-auto shrink-0">{item.startDate}</span>
                  </span>
                  <span className={clsx('leading-snug font-semibold', isActive && 'text-accent-hover')}>
                    {item.title}
                  </span>
                  {item.summary && <span className="line-clamp-2 text-[13px] text-muted">{item.summary}</span>}
                  <span className="flex items-center gap-3 text-xs text-muted">
                    {item.category?.name && <span>{item.category.name}</span>}
                    <span className="inline-flex items-center gap-1">
                      <EyeIcon size={13} aria-hidden="true" />
                      {formatNumber(item.views)}
                      <span className="sr-only">lượt xem</span>
                    </span>
                  </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {pagination && pagination.totalPages > 1 && (
        <nav aria-label="Phân trang" className="flex items-center justify-between gap-2 border-t border-line px-3 py-2.5">
          <Button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1 || loading} className="h-9 px-2.5">
            <CaretLeftIcon size={14} aria-hidden="true" />
            Trước
          </Button>
          <span className="text-[13px] text-muted">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <Button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages || loading} className="h-9 px-2.5">
            Sau
            <CaretRightIcon size={14} aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  )
}