import { Link } from 'react-router'
import { NewspaperIcon, PushPinIcon } from '@phosphor-icons/react'
import { useAsync } from '../../../hooks/useAsync'
import { newsApi } from '../../../apis/newsApi'
import { LoadingState } from '../../../components/ui/LoadingState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { WidgetFrame } from './WidgetFrame'

const LIMIT = 5

export function LatestNewsWidget() {
  const news = useAsync(() => newsApi.getList({ page: 1, limit: LIMIT }), 'home-latest-news')

  let content
  if (news.error) {
    content = <ErrorState error={news.error} onRetry={news.reload} className="py-6" />
  } else if (!news.data) {
    content = <LoadingState label="Đang tải tin tức..." className="py-6" />
  } else if (news.data.items.length === 0) {
    content = <EmptyState icon={NewspaperIcon} title="Chưa có tin tức nào" className="py-6" />
  } else {
    content = (
      <ul className="divide-y divide-line">
        {news.data.items.map((item) => (
          <li key={item.id}>
            <Link
              to={`/news/${item.id}`}
              className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-canvas/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <span className="w-22 shrink-0 pt-0.5 text-[13px] text-muted tabular-nums">{item.startDate}</span>
              <span className="min-w-0 grow">
                <span className="flex items-start gap-1.5 font-medium">
                  {item.isPinned && <PushPinIcon size={14} weight="fill" className="mt-1 shrink-0 text-accent" aria-label="Tin ghim" />}
                  <span className="line-clamp-2">{item.title}</span>
                </span>
                {item.department?.name && <span className="block text-[13px] text-muted">{item.department.name}</span>}
              </span>
              {item.category?.name && <StatusBadge className="mt-0.5 hidden shrink-0 sm:inline-flex">{item.category.name}</StatusBadge>}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <WidgetFrame title="Tin tức mới" linkTo="/news" linkLabel="Xem tất cả tin tức">
      {content}
    </WidgetFrame>
  )
}
