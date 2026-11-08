import { Op } from "sequelize";
import { ClassSectionModel, ClassSessionModel, CourseModel, EnrollmentModel, StudentModel } from "../models";
import { ENROLLMENT_STATUS } from "../models/academic/enrollment.model";
import { ApiError } from "../utils/apiError";
import { AcademicService } from "./academic.service";
import { CLASS_SECTION_STATUS } from "../models/academic/classSection.model";
import { getPeriodTimeRange } from "../utils/period.util";

type ClassSectionWithDetail = ClassSectionModel & {
  course: CourseModel;
  sessions: ClassSessionModel[];
};

export class ScheduleService {
  public static async getClassSchedule(userId: string, semesterCode?: string) {
    const student = await StudentModel.findOne({ where: { userId } });
    if(!student) {
      throw new ApiError("404", "Tài khoản này không có hồ sơ sinh viên");
    }

    const semester = await AcademicService.getSemester(semesterCode);

    const enrollments = await EnrollmentModel.findAll({
      where: { studentId: student.id, status: ENROLLMENT_STATUS.REGISTERED },
      include: [{
        model: ClassSectionModel,
        as: "classSection",
        required: true,
        where: { semesterId: semester.id, status: { [Op.ne]: CLASS_SECTION_STATUS.CANCELLED } },
        include: [
          { model: CourseModel, as: "course" },
          { model: ClassSessionModel, as: "sessions" }
        ]
      }]
    });

    const items = enrollments.map(enrollment => {
      const classSection = enrollment.get("classSection") as ClassSectionWithDetail;
      const sessions = [...classSection.sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startPeriod - b.startPeriod ).map(session => ({
        id: session.id,
        dayOfWeek: session.dayOfWeek,
        startPeriod: session.startPeriod,
        endPeriod: session.endPeriod,
        room: session.room,
        ...getPeriodTimeRange(session.startPeriod, session.endPeriod)
      }));

      return {
        enrollmentId: enrollment.id,
        classSectionCode: classSection.code,
        courseCode: classSection.course.code,
        courseName: classSection.course.name,
        credits: classSection.course.credits,
        lecturerName: classSection.lecturerName,
        sessions
      };
    }).sort((a, b) => a.courseCode.localeCompare(b.courseCode));

    return {
      semester: {
        code: semester.code,
        name: semester.name,
        academicYear: semester.academicYear,
        startDate: semester.startDate,
        endDate: semester.endDate
      },
      totalCredits: items.reduce((sum, item) => sum + item.credits, 0),
      items
    };
  }
}