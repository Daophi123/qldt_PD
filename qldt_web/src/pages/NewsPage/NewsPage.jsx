import { Outlet, useParams, useSearchParams } from "react-router";
import { useAsync } from "../../hooks/useAsync";
import { newsApi } from "../../apis/newsApi";
import { PageHeader } from "../../components/ui/PageHeader";
import { NewsFilters } from "./NewsFilters";
import { NewsList } from "./NewsList";
import clsx from "clsx";

const PAGE_SIZE = 10;
const ALL_TAB = 'all';
const SAVED_TAB = 'saved';

function buildListParams({ tab, keyword, departmentId, pinnedOnly, page }) {
  const params = { page, limit: PAGE_SIZE };
  if(tab !== ALL_TAB) params.categoryCode = tab;
  if(keyword) params.keyword = keyword;
  if(departmentId) params.departmentId = departmentId;
  if(pinnedOnly) params.isPinned = true;
  return params;
}

function toSavedList(bookmarks) {
  return { items: bookmarks.map(bookmark => bookmark.news).filter(Boolean), pagination: null };
}

export function NewsPage() {
  const { newsId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get('tab') ?? ALL_TAB;
  const keyword = searchParams.get('q') ?? '';
  const departmentId = searchParams.get('department') ?? '';
  const pinnedOnly = searchParams.get('pinned') === '1';
  const page = Number(searchParams.get('page')) || 1;
  const isSavedTab = tab === SAVED_TAB;

  const listParams = buildListParams({ tab, keyword, departmentId, pinnedOnly, page });
  const listKey = isSavedTab ? SAVED_TAB : JSON.stringify(listParams);

  const categories = useAsync(() => newsApi.getCategories(), 'categories');
  const departments = useAsync(() => newsApi.getDepartments(), 'departments');
  const list = useAsync(() => (isSavedTab ? newsApi.getBookmarks().then(toSavedList) : newsApi.getList(listParams)), listKey);

  function updateParams(changes) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      for(const [key, value] of Object.entries(changes)) {
        if(value === '' || value === false || value == null) next.delete(key);
        else next.set(key, value === true ? '1' : String(value));
      }
      if(!('page' in changes)) next.delete('page');
      return next;
    })
  }

  const tabs = [
    { value: ALL_TAB, label: 'Tất cả' },
    ...(categories.data ?? []).map(category => ({ value: category.code, label: category.name })),
    { value: SAVED_TAB, label: 'Đã lưu' }
  ];
  const hasFilters = Boolean(keyword || departmentId || pinnedOnly);

  return (
    <>
      <PageHeader title="Tin tức" description="Thông báo từ các phòng ban trong trường." />

      <div role="group" aria-label="Chuyên mục" className="mb-3.5 flex gap-1 overflow-x-auto border-b border-line scrollbar-none">
        {tabs.map(item => (
          <button key={item.value} type="button" aria-pressed={tab === item.value} onClick={() => updateParams({ tab: item.value === ALL_TAB ? '' : item.value })} className={clsx('h-10 shrink-0 cursor-pointer px-3 whitespace-nowrap transition-colors duration-150', tab === item.value ? 'font-semibold text-accent-hover shadow-[inset_0_-2px_0_var(--color-accent)]' : 'font-medium text-muted hover:text-ink')}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid overflow-hidden rounded-xl border border-line bg-panel xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        <section aria-label="Danh sách tin" className={clsx('min-w-0 xl:border-r xl:border-line', newsId && 'max-xl:hidden')}>
          {!isSavedTab && (
            <NewsFilters key={keyword} keyword={keyword} departmentId={departmentId} pinnedOnly={pinnedOnly} departments={departments.data ?? []} onChange={updateParams} />
          )}
          <NewsList state={list} activeId={newsId} isSavedTab={isSavedTab} hasFilters={hasFilters} linkSearch={searchParams.toString()} onPageChange={(nextPage) => updateParams({ page: nextPage })} onClearFilters={() => updateParams({ q: '', department: '', pinned: '' })} />
        </section>

        <div className={clsx('min-w-0', !newsId && 'max-xl:hidden')}>
          <Outlet context={{ onBookmarkChange: isSavedTab ? list.reload : undefined }} />
        </div>
      </div>
    </>
  )
}