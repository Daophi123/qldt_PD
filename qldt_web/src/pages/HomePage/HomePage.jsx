import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { getUserSubtitle } from '../../utils/userDisplay';

export function HomePage() {
  const { user } = useAuth();

  return (
    <PageHeader title={`Xin chào, ${user.fullName}`} description={`${getUserSubtitle(user)}. Chọn một mục ở menu bên trái để bắt đầu.`} />
  )
}