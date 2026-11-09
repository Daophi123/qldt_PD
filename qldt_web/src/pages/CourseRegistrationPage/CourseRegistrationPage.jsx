import { useState } from 'react'
import clsx from 'clsx'
import { useSearchParams } from 'react-router'
import { CheckCircleIcon, ClockIcon, MagnifyingGlassIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useAsync } from '../../hooks/useAsync'
import { registrationApi } from '../../apis/registrationApi'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { PageHeader } from '../../components/ui/PageHeader'
import { LoadingState } from '../../components/ui/LoadingState'
import { ErrorState } from '../../components/ui/ErrorState'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { SearchInput } from '../../components/form/SearchInput'
import { Select } from '../../components/form/Select'
import { CourseOfferingCard } from './CourseOfferingCard'
import { RegisteredPanel } from './RegisteredPanel'
import { EligibleFilterBox } from './EligibleFilterBox'
import { getCourseBlock, normalizeText, shortSectionCode } from './registrationText'

const FILTERS = [
  { value: 'all', label: 'Tất cả học phần' },
  { value: 'available', label: 'Còn đăng ký được' },
  { value: 'registered', label: 'Đã đăng ký' },
]

function matchFilter(course, filter) {
  if (filter === 'registered') return Boolean(course.registeredClassSectionCode)
  if (filter === 'available') return course.classSections.some((section) => !section.isRegistered && !section.blockReason)
  return true
}

function getWindowText(semester, rules) {
  const window = `từ ${semester.registrationStart} đến hết ngày ${semester.registrationEnd}`
  if (semester.status === 'open') {
    return `Cổng đăng ký mở ${window}. Mỗi sinh viên đăng ký tối thiểu ${rules.minCredits}, tối đa ${rules.maxCredits} tín chỉ. Bấm Đăng ký là giữ chỗ ngay.`
  }
  if (semester.status === 'upcoming') {
    return `Cổng đăng ký mở ${window}. Bạn có thể xem trước các học phần mở trong kỳ.`
  }
  return `Đợt đăng ký đã kết thúc ngày ${semester.registrationEnd}. Trang chỉ hiển thị kết quả, không đăng ký hay huỷ được nữa.`
}

export function CourseRegistrationPage() {
  const [searchParams] = useSearchParams()
  const semesterCode = searchParams.get('semester') ?? undefined
  const overview = useAsync(() => registrationApi.getOverview(semesterCode), `registration:${semesterCode ?? 'default'}`)

  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('all')
  const [onlyEligible, setOnlyEligible] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const data = overview.data
  const canAct = data?.semester.status === 'open'
  const busy = overview.loading || pendingId !== null || cancelling

  async function handleRegister(section, course) {
    setPendingId(section.id)
    setNotice(null)
    try {
      await registrationApi.register(section.id)
      setNotice({ tone: 'success', text: `Đã đăng ký lớp ${shortSectionCode(section.code)}, ${course.name}.` })
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) })
    } finally {
      setPendingId(null)
      overview.reload()
    }
  }

  function openCancel(section, course) {
    const item = data.registered.find((registered) => registered.classSectionId === section.id)
    if (item) setCancelTarget(item)
    else setCancelTarget({ enrollmentId: section.enrollmentId, classSectionCode: section.code, courseName: course.name })
  }

  async function confirmCancel() {
    setCancelling(true)
    setNotice(null)
    try {
      await registrationApi.cancel(cancelTarget.enrollmentId)
      setNotice({ tone: 'success', text: `Đã huỷ lớp ${shortSectionCode(cancelTarget.classSectionCode)}, ${cancelTarget.courseName}.` })
    } catch (error) {
      setNotice({ tone: 'error', text: getErrorMessage(error) })
    } finally {
      setCancelling(false)
      setCancelTarget(null)
      overview.reload()
    }
  }

  const description = data ? `${data.semester.name}, năm học ${data.semester.academicYear}.` : undefined

  let content
  if (overview.error && !data) {
    content = <ErrorState error={overview.error} onRetry={overview.reload} className="rounded-xl border border-line bg-panel" />
  } else if (!data) {
    content = <LoadingState label="Đang tải học phần mở đăng ký..." />
  } else {
    const search = normalizeText(keyword.trim())
    const eligibleCount = data.courses.filter((course) => !getCourseBlock(course)).length
    const courses = data.courses.filter(
      (course) =>
        matchFilter(course, filter) &&
        (!onlyEligible || !getCourseBlock(course)) &&
        (!search || normalizeText(`${course.code} ${course.name}`).includes(search)),
    )

    content = (
      <div className="grid gap-4">
        <p
          className={clsx(
            'flex items-start gap-2.5 rounded-xl border px-4 py-3',
            canAct ? 'border-accent/20 bg-accent-soft text-accent-hover' : 'border-line bg-panel text-muted',
          )}
        >
          <ClockIcon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          {getWindowText(data.semester, data.rules)}
        </p>

        <div role="status" aria-live="polite" className="empty:hidden">
          {notice && (
            <p
              className={clsx(
                'flex items-start gap-2.5 rounded-xl border px-4 py-3',
                notice.tone === 'success' ? 'border-line bg-panel text-ink' : 'border-danger/30 bg-danger-soft text-danger',
              )}
            >
              {notice.tone === 'success' ? (
                <CheckCircleIcon size={18} weight="fill" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              ) : (
                <WarningCircleIcon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              )}
              {notice.text}
            </p>
          )}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-labelledby="offering-title" aria-busy={overview.loading} className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
              <h2 id="offering-title" className="mr-auto font-semibold">
                Học phần mở trong kỳ
              </h2>
              <SearchInput
                id="course-search"
                label="Tìm học phần"
                placeholder="Tìm mã hoặc tên học phần"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full sm:w-60"
              />
              <Select id="course-filter" label="Lọc học phần" value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full sm:w-auto">
                {FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>

            {courses.length === 0 ? (
              <EmptyState
                icon={MagnifyingGlassIcon}
                title={data.courses.length === 0 ? 'Học kỳ này chưa mở học phần nào' : 'Không có học phần phù hợp'}
                description={data.courses.length === 0 ? undefined : 'Thử tìm bằng mã học phần, đổi bộ lọc hoặc bỏ chọn "Chỉ hiện học phần đủ điều kiện".'}
              />
            ) : (
              courses.map((course) => (
                <CourseOfferingCard
                  key={course.id}
                  course={course}
                  canAct={canAct}
                  busy={busy}
                  pendingId={pendingId}
                  onRegister={handleRegister}
                  onCancel={openCancel}
                />
              ))
            )}
          </section>

          <RegisteredPanel
            data={data}
            canAct={canAct}
            busy={busy}
            onCancel={setCancelTarget}
            className="order-first lg:order-none"
          >
            <EligibleFilterBox
              checked={onlyEligible}
              onChange={setOnlyEligible}
              eligibleCount={eligibleCount}
              totalCount={data.courses.length}
            />
          </RegisteredPanel>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader title="Đăng ký học" group="Đăng ký trực tuyến" description={description} />
      {content}
      {cancelTarget && (
        <ConfirmDialog
          title={`Huỷ lớp ${shortSectionCode(cancelTarget.classSectionCode)}?`}
          description={`${cancelTarget.courseName}. Chỗ của bạn được trả lại cho lớp, lớp có thể hết chỗ trước khi bạn đăng ký lại.`}
          confirmLabel="Huỷ lớp"
          cancelLabel="Giữ lại"
          danger
          loading={cancelling}
          onConfirm={confirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </>
  )
}
