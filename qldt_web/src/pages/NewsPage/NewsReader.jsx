import { useAsync } from "../../hooks/useAsync";
import { newsApi } from "../../apis/newsApi";
import { useState } from "react";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Button } from "../../components/ui/Button";
import { ArrowLeftIcon, BookmarkSimpleIcon, CaretRightIcon, FileIcon, FilePdfIcon } from "@phosphor-icons/react";
import { Link, useLocation, useOutletContext, useParams } from "react-router";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import DOMPurify from 'dompurify'
import { NewsComments } from "./NewsComments";
import { formatFileSize, formatNumber } from "../../utils/format";

const proseClass = 'max-w-[70ch] text-[15px] leading-relaxed [&_a]:text-accent-hover [&_a]:underline [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5';

function BookmarkButton({ newsId, onChange }) {
  const status = useAsync(() => newsApi.checkBookmark(newsId), newsId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const saved = status.data === true;

  async function handleToggle() {
    setSaving(true);
    setError('');
    try {
      if(saved) await newsApi.removeBookmark(newsId);
      else await newsApi.addBookmark(newsId);
      status.setData(!saved);
      onChange?.();
    } catch(error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleToggle} loading={saving} disabled={status.loading} aria-pressed={saved}>
        {!saving && (
          <BookmarkSimpleIcon size={16} weight={saved ? 'fill' : 'regular'} className="text-accent" aria-hidden="true" />
        )}
        {saved ? 'Đã lưu' : 'Lưu tin'}
      </Button>
      {error && (
        <span role="alert" className="text-[13px] text-danger">{error}</span>
      )}
    </div>
  )
}

export function NewsReader() {
  const { newsId } = useParams();
  const { search } = useLocation();
  const { onBookmarkChange } = useOutletContext() ?? {};
  const detail = useAsync(() => newsApi.getDetail(newsId), newsId)

  const backLink = (
    <Link to={{ pathname: '/news', search }} className="inline-flex items-center gap-1.5 font-medium text-accent-hover xl:hidden">
      <ArrowLeftIcon size={16} aria-hidden="true" />
      Quay lại danh sách
    </Link>
  )

  if(detail.error) {
    return (
      <div className="p-4">
        {backLink}
        <ErrorState error={detail.error} onRetry={detail.reload} />
      </div>
    )
  }

  if(!detail.data || detail.data.id !== newsId) return <LoadingState label="Đang tải nội dung tin" />

  const news = detail.data;
  const facts = [
    { label: 'Đơn vị', value: news.department?.name },
    { label: 'Hiệu lực từ', value: news.startDate },
    { label: 'Đến hết', value: news.endDate ?? 'Không thời hạn' },
    { label: 'Lượt xem', value: formatNumber(news.views) }
  ];
  const attachments = news.attachments ?? [];

  return (
    <article className="min-w-0">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 sm:px-6 lg:sticky lg:top-0 lg:z-10 lg:bg-panel">
        {backLink}
        <div className="ml-auto">
          <BookmarkButton key={newsId} newsId={newsId} onChange={onBookmarkChange} />
        </div>
      </div>

      <div className="grid gap-5 px-4 py-5 sm:px-6 sm:py-6">
        <header className="grid gap-2">
          <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
            {news.category?.name}
            <CaretRightIcon size={12} aria-hidden="true" />
            {news.department?.name}
          </p>
          <h2 className="text-xl leading-snug font-semibold tracking-[-0.01em] text-balance sm:text-[22px]">
            {news.title}
          </h2>
          {news.authorName && <p className="text-[13px] text-muted">Người đăng: {news.authorName}</p>}
        </header>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          {facts.map(fact => (
            <div key={fact.label} className="bg-panel px-3 py-2.5">
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className="mt-0.5 font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className={proseClass} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}></div>

        {attachments.length > 0 && (
          <section aria-labelledby="news-attachments" className="grid gap-2.5">
            <h3 id="news-attachments" className="font-semibold">
              Tệp đính kèm <span className="font-normal text-muted">{attachments.length} tệp</span>
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {attachments.map(file => {
                const isPdf = file.fileType === 'application/pdf';
                const Icon = isPdf ? FilePdfIcon : FileIcon;
                return (
                  <li key={file.id}>
                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 transition-colors duration-150 hover:bg-canvas">
                      <Icon size={22} weight="fill" className={isPdf ? 'text-danger' : 'text-muted'} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{file.fileName}</span>
                        <span className="text-xs text-muted">
                          {[isPdf ? 'PDF' : null, formatFileSize(file.fileSize)].filter(Boolean).join(', ')}
                          <span className="sr-only"> (mở trong thẻ mới)</span>
                        </span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
        <NewsComments key={newsId} newsId={newsId} initialComments={news.comments ?? []} />
      </div>
    </article>
  )
}