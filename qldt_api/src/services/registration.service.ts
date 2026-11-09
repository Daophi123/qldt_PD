import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { ClassSectionModel, ClassSessionModel, CourseModel, EnrollmentModel, SemesterModel, StudentModel } from "../models";
import { CLASS_SECTION_STATUS } from "../models/academic/classSection.model";
import { ENROLLMENT_STATUS } from "../models/academic/enrollment.model";
import { ApiError } from "../utils/apiError";
import { toISODate, toVietnamISO } from "../utils/date.util";
import { getPeriodTimeRange } from "../utils/period.util";
import { GradeService } from "./grade.service";

export const REGISTRATION_RULES = { minCredits: 14, maxCredits: 24 };

export const REGISTRATION_STATUS = {
  OPEN: "open",
  UPCOMING: "upcoming",
  CLOSED: "closed"
} as const;

type RegistrationStatus = typeof REGISTRATION_STATUS[keyof typeof REGISTRATION_STATUS];

const DAY_LABELS: Record<number, string> = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
  8: "Chủ nhật"
};

type CourseWithPrerequisites = CourseModel & { prerequisites?: CourseModel[] };

type SectionWithDetail = ClassSectionModel & {
  course: CourseWithPrerequisites;
  sessions: ClassSessionModel[];
  enrollments?: EnrollmentModel[];
};

type SectionWithSemester = ClassSectionModel & { semester: SemesterModel };

interface StudyHistory {
  passedIds: Set<string>;
  studyingIds: Set<string>;
  retakeIds: Set<string>;
}

interface RegisterContext {
  status: RegistrationStatus;
  history: StudyHistory;
  registered: SectionWithDetail[];
  registeredCredits: number;
}

const today = () => toVietnamISO().slice(0, 10);

function getRegistrationStatus(semester: SemesterModel): RegistrationStatus {
  if(!semester.registrationStart || !semester.registrationEnd) return REGISTRATION_STATUS.CLOSED;
  const now = today();
  if(now < toISODate(semester.registrationStart)) return REGISTRATION_STATUS.UPCOMING;
  if(now > toISODate(semester.registrationEnd)) return REGISTRATION_STATUS.CLOSED;
  return REGISTRATION_STATUS.OPEN;
}

function pickRegistrationSemester(semesters: SemesterModel[]) {
  const withWindow = semesters.filter(semester => semester.registrationStart && semester.registrationEnd);
  const open = withWindow.find(semester => getRegistrationStatus(semester) === REGISTRATION_STATUS.OPEN);
  if(open) return open;

  const upcoming = withWindow
    .filter(semester => getRegistrationStatus(semester) === REGISTRATION_STATUS.UPCOMING)
    .sort((a, b) => toISODate(a.registrationStart!).localeCompare(toISODate(b.registrationStart!)));
  if(upcoming[0]) return upcoming[0];

  const closed = [...withWindow].sort((a, b) => toISODate(b.registrationEnd!).localeCompare(toISODate(a.registrationEnd!)));
  return closed[0] ?? null;
}

function isOverlap(a: ClassSessionModel, b: ClassSessionModel) {
  return a.dayOfWeek === b.dayOfWeek && a.startPeriod <= b.endPeriod && b.startPeriod <= a.endPeriod;
}

function formatSession(session: ClassSessionModel) {
  return `${DAY_LABELS[session.dayOfWeek]}, tiết ${session.startPeriod}-${session.endPeriod}`;
}

function toSessionDto(session: ClassSessionModel) {
  return {
    id: session.id,
    dayOfWeek: session.dayOfWeek,
    startPeriod: session.startPeriod,
    endPeriod: session.endPeriod,
    room: session.room,
    ...getPeriodTimeRange(session.startPeriod, session.endPeriod)
  };
}

function sortSessions(sessions: ClassSessionModel[]) {
  return [...sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startPeriod - b.startPeriod);
}

function toSemesterDto(semester: SemesterModel) {
  return {
    code: semester.code,
    name: semester.name,
    academicYear: semester.academicYear,
    startDate: semester.startDate,
    endDate: semester.endDate,
    registrationStart: semester.registrationStart ?? null,
    registrationEnd: semester.registrationEnd ?? null,
    status: getRegistrationStatus(semester)
  };
}

function findConflict(section: SectionWithDetail, registered: SectionWithDetail[]) {
  for(const other of registered) {
    if(other.id === section.id) continue;
    for(const session of section.sessions) {
      const clash = other.sessions.find(otherSession => isOverlap(session, otherSession));
      if(clash) return { section: other, session: clash };
    }
  }
  return null;
}

function getMissingPrerequisites(course: CourseWithPrerequisites, history: StudyHistory) {
  return (course.prerequisites ?? []).filter(prerequisite => !history.passedIds.has(prerequisite.id));
}

function getBlockReason(section: SectionWithDetail, context: RegisterContext, registeredCount: number) {
  if(context.status === REGISTRATION_STATUS.UPCOMING) return "Chưa đến thời gian đăng ký";
  if(context.status === REGISTRATION_STATUS.CLOSED) return "Đã hết thời gian đăng ký";
  if(section.status === CLASS_SECTION_STATUS.CANCELLED) return "Lớp đã bị huỷ";
  if(section.status === CLASS_SECTION_STATUS.CLOSED) return "Lớp đã đóng đăng ký";
  if(context.registered.some(item => item.id === section.id)) return "Bạn đã đăng ký lớp này";

  const sameCourse = context.registered.find(item => item.courseId === section.courseId);
  if(sameCourse) return `Bạn đã đăng ký lớp ${sameCourse.code} của học phần này. Huỷ lớp đó trước khi đổi lớp`;

  const missing = getMissingPrerequisites(section.course, context.history);
  if(missing.length > 0) return `Chưa đạt học phần tiên quyết ${missing.map(course => course.code).join(", ")}`;

  if(context.registeredCredits + section.course.credits > REGISTRATION_RULES.maxCredits) {
    return `Vượt quá ${REGISTRATION_RULES.maxCredits} tín chỉ tối đa của học kỳ`;
  }

  const conflict = findConflict(section, context.registered);
  if(conflict) return `Trùng lịch với lớp ${conflict.section.code} (${formatSession(conflict.session)})`;
  if(registeredCount >= section.capacity) return "Lớp đã hết chỗ";
  return null;
}

const sectionInclude = [
  {
    model: CourseModel,
    as: "course",
    include: [{ model: CourseModel, as: "prerequisites", attributes: ["id", "code", "name"], through: { attributes: [] } }]
  },
  { model: ClassSessionModel, as: "sessions" }
];

export class RegistrationService {
  private static async getStudent(userId: string) {
    const student = await StudentModel.findOne({ where: { userId } });
    if(!student) {
      throw new ApiError("404", "Tài khoản này không có hồ sơ sinh viên");
    }
    return student;
  }

  private static async getSemester(code?: string) {
    if(code) {
      const semester = await SemesterModel.findOne({ where: { code } });
      if(!semester) {
        throw new ApiError("404", "Không tìm thấy học kỳ");
      }
      return semester;
    }

    const semester = pickRegistrationSemester(await SemesterModel.findAll());
    if(!semester) {
      throw new ApiError("404", "Chưa có đợt đăng ký học nào");
    }
    return semester;
  }

  private static async getStudyHistory(studentId: string, targetSemesterId: string): Promise<StudyHistory> {
    const passedIds = new Set(await GradeService.getPassedCourseIds(studentId));
    const enrollments = await EnrollmentModel.findAll({
      where: { studentId, status: ENROLLMENT_STATUS.REGISTERED },
      include: [{
        model: ClassSectionModel,
        as: "classSection",
        required: true,
        include: [{ model: SemesterModel, as: "semester", attributes: ["id", "endDate"] }]
      }]
    });

    const studyingIds = new Set<string>();
    const retakeIds = new Set<string>();
    const now = today();
    for(const enrollment of enrollments) {
      const section = enrollment.get("classSection") as SectionWithSemester;
      if(section.semesterId === targetSemesterId || passedIds.has(section.courseId)) continue;
      if(toISODate(section.semester.endDate) < now) {
        retakeIds.add(section.courseId);
      } else {
        studyingIds.add(section.courseId);
      }
    }
    return { passedIds, studyingIds, retakeIds };
  }

  private static async getRegisteredSections(studentId: string, semesterId: string, transaction?: Transaction) {
    const enrollments = await EnrollmentModel.findAll({
      where: { studentId, status: ENROLLMENT_STATUS.REGISTERED },
      include: [{
        model: ClassSectionModel,
        as: "classSection",
        required: true,
        where: { semesterId },
        include: sectionInclude
      }],
      transaction
    });
    return enrollments.map(enrollment => ({
      enrollment,
      section: enrollment.get("classSection") as SectionWithDetail
    }));
  }

  private static async buildContext(studentId: string, semester: SemesterModel, transaction?: Transaction) {
    const registeredItems = await this.getRegisteredSections(studentId, semester.id, transaction);
    const registered = registeredItems.map(item => item.section);
    const context: RegisterContext = {
      status: getRegistrationStatus(semester),
      history: await this.getStudyHistory(studentId, semester.id),
      registered,
      registeredCredits: registered.reduce((sum, section) => sum + section.course.credits, 0)
    };
    return { context, registeredItems };
  }

  public static async getOverview(userId: string, semesterCode?: string) {
    const student = await this.getStudent(userId);
    const semester = await this.getSemester(semesterCode);
    const { context, registeredItems } = await this.buildContext(student.id, semester);

    const sections = await ClassSectionModel.findAll({
      where: { semesterId: semester.id },
      include: [
        ...sectionInclude,
        { model: EnrollmentModel, as: "enrollments", attributes: ["id", "studentId", "status"], required: false }
      ]
    }) as SectionWithDetail[];

    const courses = new Map<string, { course: CourseWithPrerequisites; sections: SectionWithDetail[] }>();
    for(const section of sections) {
      if(section.status === CLASS_SECTION_STATUS.CANCELLED) continue;
      const group = courses.get(section.courseId) ?? { course: section.course, sections: [] };
      group.sections.push(section);
      courses.set(section.courseId, group);
    }

    const enrollmentBySection = new Map(registeredItems.map(item => [item.section.id, item.enrollment.id]));

    const courseList = [...courses.values()].map(({ course, sections: courseSections }) => {
      const registeredSection = context.registered.find(section => section.courseId === course.id);
      return {
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        isPassed: context.history.passedIds.has(course.id),
        isRetake: context.history.retakeIds.has(course.id),
        registeredClassSectionCode: registeredSection?.code ?? null,
        prerequisites: (course.prerequisites ?? []).map(prerequisite => ({
          code: prerequisite.code,
          name: prerequisite.name,
          status: context.history.passedIds.has(prerequisite.id) ? "passed" : context.history.studyingIds.has(prerequisite.id) ? "studying" : "missing"
        })),
        classSections: courseSections
          .sort((a, b) => a.code.localeCompare(b.code))
          .map(section => {
            const registeredCount = (section.enrollments ?? []).filter(enrollment => enrollment.status === ENROLLMENT_STATUS.REGISTERED).length;
            const isRegistered = enrollmentBySection.has(section.id);
            const conflict = isRegistered ? null : findConflict(section, context.registered);
            return {
              id: section.id,
              code: section.code,
              lecturerName: section.lecturerName,
              capacity: section.capacity,
              registeredCount,
              status: section.status,
              isRegistered,
              enrollmentId: enrollmentBySection.get(section.id) ?? null,
              isFull: registeredCount >= section.capacity,
              conflictWith: conflict ? { code: conflict.section.code, courseName: conflict.section.course.name, session: formatSession(conflict.session) } : null,
              blockReason: isRegistered ? null : getBlockReason(section, context, registeredCount),
              sessions: sortSessions(section.sessions).map(toSessionDto)
            };
          })
      };
    }).sort((a, b) => a.code.localeCompare(b.code));

    return {
      semester: toSemesterDto(semester),
      rules: REGISTRATION_RULES,
      registeredCredits: context.registeredCredits,
      registered: registeredItems
        .map(({ enrollment, section }) => ({
          enrollmentId: enrollment.id,
          classSectionId: section.id,
          classSectionCode: section.code,
          courseCode: section.course.code,
          courseName: section.course.name,
          credits: section.course.credits,
          lecturerName: section.lecturerName,
          registeredAt: enrollment.registeredAt,
          sessions: sortSessions(section.sessions).map(toSessionDto)
        }))
        .sort((a, b) => a.courseCode.localeCompare(b.courseCode)),
      courses: courseList
    };
  }

  public static async register(userId: string, classSectionId: string) {
    const student = await this.getStudent(userId);

    return sequelize.transaction(async(transaction) => {
      const section = await ClassSectionModel.findByPk(classSectionId, {
        include: [...sectionInclude, { model: SemesterModel, as: "semester" }],
        transaction
      }) as (SectionWithDetail & { semester: SemesterModel }) | null;
      if(!section) {
        throw new ApiError("404", "Không tìm thấy lớp học phần");
      }

      const { context } = await this.buildContext(student.id, section.semester, transaction);
      const registeredCount = await EnrollmentModel.count({
        where: { classSectionId: section.id, status: ENROLLMENT_STATUS.REGISTERED },
        transaction
      });
      const reason = getBlockReason(section, context, registeredCount);
      if(reason) {
        throw new ApiError("409", reason);
      }

      const existing = await EnrollmentModel.findOne({
        where: { studentId: student.id, classSectionId: section.id },
        transaction
      });
      const enrollment = existing
        ? await existing.update({ status: ENROLLMENT_STATUS.REGISTERED, registeredAt: new Date() }, { transaction })
        : await EnrollmentModel.create({ studentId: student.id, classSectionId: section.id, status: ENROLLMENT_STATUS.REGISTERED }, { transaction });

      return {
        enrollmentId: enrollment.id,
        classSectionCode: section.code,
        courseCode: section.course.code,
        courseName: section.course.name,
        credits: section.course.credits,
        registeredCredits: context.registeredCredits + section.course.credits
      };
    });
  }

  public static async cancel(userId: string, enrollmentId: string) {
    const student = await this.getStudent(userId);
    const enrollment = await EnrollmentModel.findOne({
      where: { id: enrollmentId, studentId: student.id },
      include: [{
        model: ClassSectionModel,
        as: "classSection",
        required: true,
        include: [{ model: SemesterModel, as: "semester" }, { model: CourseModel, as: "course" }]
      }]
    });
    if(!enrollment) {
      throw new ApiError("404", "Không tìm thấy lượt đăng ký");
    }
    if(enrollment.status !== ENROLLMENT_STATUS.REGISTERED) {
      throw new ApiError("409", "Lượt đăng ký này đã được huỷ trước đó");
    }

    const section = enrollment.get("classSection") as SectionWithSemester & { course: CourseModel };
    const status = getRegistrationStatus(section.semester);
    if(status !== REGISTRATION_STATUS.OPEN) {
      throw new ApiError("409", status === REGISTRATION_STATUS.UPCOMING ? "Chưa đến thời gian đăng ký" : "Đã hết thời gian đăng ký, không thể huỷ lớp");
    }

    await enrollment.update({ status: ENROLLMENT_STATUS.CANCELLED });
    return {
      enrollmentId: enrollment.id,
      classSectionCode: section.code,
      courseCode: section.course.code,
      courseName: section.course.name
    };
  }

  public static async getHistory(userId: string, semesterCode?: string) {
    const student = await this.getStudent(userId);
    const semester = await this.getSemester(semesterCode);

    const enrollments = await EnrollmentModel.findAll({
      where: { studentId: student.id },
      include: [{
        model: ClassSectionModel,
        as: "classSection",
        required: true,
        where: { semesterId: semester.id },
        include: [{ model: CourseModel, as: "course" }, { model: ClassSessionModel, as: "sessions" }]
      }]
    });

    const items = enrollments.map(enrollment => {
      const section = enrollment.get("classSection") as SectionWithDetail;
      const isCancelled = enrollment.status === ENROLLMENT_STATUS.CANCELLED;
      return {
        enrollmentId: enrollment.id,
        classSectionCode: section.code,
        courseCode: section.course.code,
        courseName: section.course.name,
        credits: section.course.credits,
        lecturerName: section.lecturerName,
        status: enrollment.status,
        registeredAt: enrollment.registeredAt,
        cancelledAt: isCancelled ? enrollment.get("updatedAt") as Date : null,
        sessions: sortSessions(section.sessions).map(toSessionDto)
      };
    }).sort((a, b) => a.courseCode.localeCompare(b.courseCode) || a.classSectionCode.localeCompare(b.classSectionCode));

    return {
      semester: toSemesterDto(semester),
      totalCredits: items.filter(item => item.status === ENROLLMENT_STATUS.REGISTERED).reduce((sum, item) => sum + item.credits, 0),
      items
    };
  }
}
