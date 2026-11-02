import { useState } from "react";
import { newsApi } from "../../apis/newsApi";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "../../components/ui/Button";
import { getInitials } from "../../utils/userDisplay";
import { formatDateTime } from "../../utils/format";

const MAX_LENGTH = 1000;

export function NewsComments({ newsId, initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  async function handleSubmit(event) {
    event.preventDefault();
    const content = text.trim();
    if(!content) {
      setError('Nội dung không được để trống');
      return;
    }

    setSending(true);
    setError('');
    try {
      const created = await newsApi.addComment(newsId, content);
      setComments(prev => [created, ...prev]);
      setText('');
    } catch(error) {
      setError(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="news-comments" className="grid gap-3 border-t border-line pt-5">
      <h3 id="news-comments" className="font-semibold">
        Bình luận <span className="font-normal text-muted">{comments.length}</span>
      </h3>
      <form onSubmit={handleSubmit} noValidate className="grid gap-2">
        <label htmlFor="comment-content" className="text-[13px] text-muted">
          Bình luận hiển thị với mọi người xem thông báo này.
        </label>
        <textarea id="comment-content" value={text} onChange={event => {
          setText(event.target.value);
          if(error) setError('');
          }}
          maxLength={MAX_LENGTH}
          rows={3}
          placeholder="Viết bình luận"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'comment-error' : undefined}
          className="w-full resize-y rounded-lg border border-line-strong bg-panel px-3 py-2 text-base outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent/15 sm:text-sm"
        />
        <div className="flex items-center justify-between gap-3">
          {error ? (
            <p id="comment-error" className="flex items-center gap-1.5 text-[13px] text-danger">
              <WarningCircleIcon size={16} aria-hidden="true" />
              {error}
            </p>
          ) : (
            <span className="text-xs text-muted">
              {text.length}/{MAX_LENGTH}
            </span>
          )}
          <Button type="submit" variant="primary" loading={sending}>
            {sending ? 'Đang gửi...' : 'Gửi bình luận'}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-muted">Chưa có bình luận nào</p>
      ) : (
        <ul className="grid divide-y divide-line">
          {comments.map(comment => (
            <li key={comment.id} className="flex gap-3 py-3">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-hover">
                {getInitials(comment.authorName)}
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">{comment.authorName}</span>
                  <time dateTime={comment.createdAt} className="text-xs text-muted">{formatDateTime(comment.createdAt)}</time>
                </p>
                <p className="mt-0.5 wrap-break-word whitespace-pre-line">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}