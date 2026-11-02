import bcrypt from "bcryptjs";
import { environment } from "../config/environment";
import { ApiError } from "../utils/apiError";
import {
  UserModel,
  StudentModel,
  SemesterModel,
  CourseModel,
  CoursePrerequisiteModel,
  ClassSectionModel,
  ClassSessionModel,
  EnrollmentModel
} from "../models";
import {
  SEED_STUDENT_PASSWORD,
  SEED_STUDENTS,
  SEED_SEMESTERS,
  SEED_COURSES,
  SEED_PREREQUISITES,
  SEED_CLASS_SECTIONS,
  SEED_ENROLLMENTS
} from "../seeds/core.seed";

export class AcademicService {
  public static async seedInitialData() {
    if(environment.NODE_ENV !== "development") {
      throw new ApiError("403", "Chỉ được khởi tạo dữ liệu mẫu ở môi trường development");
    }

    let createdCount = 0;
    const passwordHash = await bcrypt.hash(SEED_STUDENT_PASSWORD, 10);

    const studentIds = new Map<string, string>();
    for(const item of SEED_STUDENTS) {
      const [user] = await UserModel.findOrCreate({
        where: { username: item.studentCode },
        defaults: { username: item.studentCode, fullName: item.fullName, role: "student", passwordHash },
      });
      const { fullName, ...profile } = item;
      const [student, created] = await StudentModel.findOrCreate({
        where: { studentCode: item.studentCode },
        defaults: { ...profile, userId: user.id },
      });
      studentIds.set(item.studentCode, student.id);
      if(created) createdCount++;
    }

    const semesterIds = new Map<string, string>();
    for(const item of SEED_SEMESTERS) {
      const [semester, created] = await SemesterModel.findOrCreate({ where: { code: item.code }, defaults: item });
      semesterIds.set(item.code, semester.id);
      if(created) createdCount++;
    }

    const courseIds = new Map<string, string>();
    for(const item of SEED_COURSES) {
      const [course, created] = await CourseModel.findOrCreate({ where: { code: item.code }, defaults: item });
      courseIds.set(item.code, course.id);
      if(created) createdCount++;
    }

    for(const [courseCode, prerequisiteCode] of SEED_PREREQUISITES) {
      const [, created] = await CoursePrerequisiteModel.findOrCreate({
        where: { courseId: courseIds.get(courseCode), prerequisiteCourseId: courseIds.get(prerequisiteCode) },
      });
      if(created) createdCount++;
    }

    const classSectionIds = new Map<string, string>();
    for(const item of SEED_CLASS_SECTIONS) {
      const { courseCode, semesterCode, sessions, ...fields } = item;
      const [classSection, created] = await ClassSectionModel.findOrCreate({
        where: { code: item.code },
        defaults: { ...fields, courseId: courseIds.get(courseCode), semesterId: semesterIds.get(semesterCode) },
      });
      classSectionIds.set(item.code, classSection.id);
      if(created) {
        createdCount++;
        for(const session of sessions) {
          await ClassSessionModel.create({ ...session, classSectionId: classSection.id });
        }
      }
    }

    for(const item of SEED_ENROLLMENTS) {
      const [, created] = await EnrollmentModel.findOrCreate({
        where: { studentId: studentIds.get(item.studentCode), classSectionId: classSectionIds.get(item.classSectionCode) },
        defaults: { status: item.status },
      });
      if(created) createdCount++;
    }

    if(createdCount === 0) {
      return { seeded: false, createdCount, message: "Dữ liệu đào tạo mẫu đã đủ, không thêm gì" };
    }
    return { seeded: true, createdCount, message: `Đã thêm ${createdCount} bản ghi dữ liệu đào tạo mẫu` };
  }
}
