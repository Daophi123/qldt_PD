import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { getUserSubtitle } from '../../utils/userDisplay';
import { TodayScheduleWidget } from './widgets/TodayScheduleWidget';
import { LatestNewsWidget } from './widgets/LatestNewsWidget';
import { TodoWidget } from './widgets/TodoWidget';
import { UpcomingExamsWidget } from './widgets/UpcomingExamsWidget';
import { GradeSummaryWidget } from './widgets/GradeSummaryWidget';

const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' });
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

function formatToday(date) {
  const weekday = weekdayFormatter.format(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${dateFormatter.format(date)}`;
}

export function HomePage() {
  const { user } = useAuth();
  const [today] = useState(() => new Date());
  const isStudent = user.role === 'student';

  return (
    <>
      <PageHeader title={`Xin chào, ${user.fullName}`} description={`${formatToday(today)}. ${getUserSubtitle(user)}.`} />
      {isStudent ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <div className="grid min-w-0 gap-4">
            <TodayScheduleWidget />
            <LatestNewsWidget />
          </div>
          <div className="grid min-w-0 gap-4">
            <TodoWidget />
            <UpcomingExamsWidget />
            <GradeSummaryWidget />
          </div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <LatestNewsWidget />
        </div>
      )}
    </>
  )
}
