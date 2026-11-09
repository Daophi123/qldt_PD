import { Op } from "sequelize";
import { ClassSectionModel, CourseModel, EnrollmentModel, ProgramCourseModel, ProgramModel, SemesterModel, StudentModel } from "../models";
import { ENROLLMENT_STATUS } from "../models/academic/enrollment.model";
import { CLASS_SECTION_STATUS } from "../models/academic/classSection.model";
import { ApiError } from "../utils/apiError";
import { environment } from "../config/environment";
import { SEED_PROGRAMS } from "../seeds/program.seed";

type ProgramCourseWithDetail = ProgramCourseModel & {
  course: CourseModel & { prerequisites: CourseModel[] };
};

type EnrollmentWithDetail = EnrollmentModel & {
  classSection: ClassSectionModel & { semester: SemesterModel };
};

export class ProgramService {
  public static async getMyProgram(userId: string) {
    const student = await StudentModel.findOne({ where: { userId } });
    if(!student) {
      throw new ApiError("404", "Tài khoản này không có hồ sơ sinh viên");
    }

    const program = await ProgramModel.findOne({ where: { majorName: student.majorName, cohort: student.cohort } });
    if(!program) {
      throw new ApiError("404", `Chưa có chương trình đào tạo cho ngành ${student.majorName}, khoá ${student.cohort}`);
    }

    const programCourses = await ProgramCourseModel.findAll({
      where: { programId: program.id },
      include: [{
        model: CourseModel,
        as: "course",
        include: [{ model: CourseModel, as: "prerequisites", attributes: ["code", "name"], through: { attributes: [] } }]
      }]
    }) as ProgramCourseWithDetail[];

    // Học kỳ thực tế: sinh viên đã đăng ký lớp của môn đó ở học kỳ nào
    const enrollments = await EnrollmentModel.findAll({
      where: { studentId: student.id, status: ENROLLMENT_STATUS.REGISTERED },
      include: [{
        model: ClassSectionModel,
        as: "classSection",
        required: true,
        where: { status: { [Op.ne]: CLASS_SECTION_STATUS.CANCELLED } },
        include: [{ model: SemesterModel, as: "semester" }]
      }]
    }) as EnrollmentWithDetail[];

    const actualSemesterByCourse = new Map<string, string>();
    for(const enrollment of enrollments) {
      const semester = enrollment.classSection.semester;
      actualSemesterByCourse.set(enrollment.classSection.courseId, `${semester.name}, ${semester.academicYear}`);
    }

    const items = programCourses.map(programCourse => ({
      id: programCourse.id,
      courseCode: programCourse.course.code,
      courseName: programCourse.course.name,
      credits: programCourse.course.credits,
      knowledgeBlock: programCourse.knowledgeBlock,
      isRequired: programCourse.isRequired,
      semesterNo: programCourse.semesterNo,
      prerequisites: programCourse.course.prerequisites.map(course => ({ code: course.code, name: course.name })),
      actualSemester: actualSemesterByCourse.get(programCourse.courseId) ?? null
    })).sort((a, b) => a.semesterNo - b.semesterNo || a.courseCode.localeCompare(b.courseCode));

    // Gom theo khối kiến thức: mỗi khối có bao nhiêu học phần, bao nhiêu tín chỉ
    const blocks: { name: string; courseCount: number; credits: number }[] = [];
    for(const item of items) {
      let block = blocks.find(b => b.name === item.knowledgeBlock);
      if(!block) {
        block = { name: item.knowledgeBlock, courseCount: 0, credits: 0 };
        blocks.push(block);
      }
      block.courseCount++;
      block.credits += item.credits;
    }

    return {
      program: {
        code: program.code,
        name: program.name,
        majorName: program.majorName,
        cohort: program.cohort
      },
      totalCredits: items.reduce((sum, item) => sum + item.credits, 0),
      blocks,
      items
    };
  }

  public static async seedInitialData() {
    if(environment.NODE_ENV !== "development") {
      throw new ApiError("403", "Chỉ được khởi tạo dữ liệu mẫu ở môi trường development");
    }

    let createdCount = 0;
    for(const item of SEED_PROGRAMS) {
      const { courses, ...fields } = item;
      const [program] = await ProgramModel.findOrCreate({ where: { code: item.code }, defaults: fields });

      for(const entry of courses) {
        const course = await CourseModel.findOne({ where: { code: entry.courseCode } });
        if(!course) {
          throw new ApiError("400", `Chưa có học phần ${entry.courseCode}. Hãy chạy seed học vụ (POST /api/v1/academic/seed) trước`);
        }

        const { courseCode, ...courseFields } = entry;
        const [, created] = await ProgramCourseModel.findOrCreate({
          where: { programId: program.id, courseId: course.id },
          defaults: { ...courseFields, programId: program.id, courseId: course.id }
        });
        if(created) createdCount++;
      }
    }

    if(createdCount === 0) {
      return { seeded: false, createdCount, message: "Dữ liệu chương trình học mẫu đã đủ, không thêm gì" };
    }
    return { seeded: true, createdCount, message: `Đã thêm ${createdCount} học phần vào chương trình mẫu` };
  }
}
