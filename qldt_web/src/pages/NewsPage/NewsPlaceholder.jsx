import { NewspaperIcon } from "@phosphor-icons/react";
import { EmptyState } from "../../components/ui/EmptyState";

export function NewsPlaceholder() {
  return (
    <EmptyState icon={NewspaperIcon} title="Chọn một tin để đọc" description="Nội dung, tệp đính kèm và bình luận sẽ hiện ở đây." className="xl:py-24" />
  )
}