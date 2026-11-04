import { CalendarBlankIcon, ListBulletsIcon, NotePencilIcon } from "@phosphor-icons/react";
import { Link, useSearchParams } from "react-router";
import { useAsync } from "../../hooks/useAsync";
import { scheduleApi } from "../../apis/scheduleApi";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { EmptyState } from "../../components/ui/EmptyState";
import { CourseListView } from "./CourseListView";
import { WeekView } from "./WeekView";
import clsx from "clsx";

const VIEWS = [
  { value: 'week', label: 'Tuần', icon: CalendarBlankIcon },
  { value: 'list', label: 'Danh sách', icon: ListBulletsIcon }
];

export function ClassSchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const semesters = useAsync(() => scheduleApi.getSemesters(), 'semesters');

  const semesterCode = searchParams.get('semester') ?? semesters.data?.currentCode;
  const view = searchParams.get('view') === 'list' ? 'list' : 'week';
  const fitScreen = view === 'week';

  const schedule = useAsync(() => (semesterCode ? scheduleApi.getClassSchedule(semesterCode) : Promise.resolve(null)), semesterCode ?? 'waiting');
  
  function updateParam(key, value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    })
  }

  const data = schedule.data;

  let content;
  if(semesters.error) content = <ErrorState error={semesters.error} onRetry={semesters.reload} />
  else if(schedule.error) content = <ErrorState error={schedule.error} onRetry={schedule.reload} />
  else if(!data) content = <LoadingState label="Đang tải lịch học..." />
  else if(data.items.length === 0) {
    content = (
      <EmptyState
        icon={NotePencilIcon}
        title="Chưa có học phần nào trong học kỳ này"
        description="Đăng ký học phần ở mục Đăng ký học. Lịch sẽ hiện ở đây sau khi đăng ký thành công."
        action={
          <Link to="/register-online/course-registration" className="inline-flex h-10 items-center rounded-lg bg-accent px-4 font-medium text-white hover:bg-accent-hover">
            Đăng ký học
          </Link>
        }
        className="rounded-xl border border-line bg-panel"
      />
    )
  } else if(view === 'list') {
    content = <CourseListView items={data.items} totalCredits={data.totalCredits} />
  } else {
    content = <WeekView key={data.semester.code} semester={data.semester} items={data.items} />
  }

  return (
    <div className={clsx('flex flex-col', fitScreen && 'lg:-mb-7 lg:h-[calc(100dvh-5.75rem)]')}>
      <h1 className="sr-only">Lịch học</h1>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label htmlFor="semester" className="sr-only">
          Học kỳ
        </label>
        <select
          id="semester"
          value={semesterCode ?? ''}
          onChange={event => updateParam('semester', event.target.value)} disabled={!semesters.data} className="h-11 cursor-pointer rounded-lg border border-line-strong bg-panel px-2 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-3 focus:ring-accent/15 disabled:cursor-wait sm:h-9 sm:text-sm"
        >
          {(semesters.data?.items ?? []).map(semester => (
            <option key={semester.code} value={semester.code}>
              {semester.name}, {semester.academicYear}
              {semester.code === semesters.data.currentCode ? ' (hiện tại)' : ''}
            </option>
          ))}
        </select>

        <div role="group" aria-label="Kiểu xem" className="ml-auto flex rounded-lg border border-line bg-panel p-0.5">
          {VIEWS.map(item => {
            const Icon = item.icon;
            const active = view === item.value;
            return (
              <button key={item.value} type="button" aria-pressed={active} onClick={() => updateParam('view', item.value)}
                className={clsx('inline-flex h-10 cursor-pointer items-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 sm:h-7', active ? 'bg-accent-soft text-accent-hover' : 'text-muted hover:text-ink')}>
                <Icon size={14} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div aria-busy={schedule.loading} className={clsx('transition-opacity duration-150', schedule.loading && data && 'opacity-60', fitScreen && 'lg:flex lg:min-h-0 lg:flex-1 lg:flex-col')}>
        {content}
      </div>
    </div>
  )
}