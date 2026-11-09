import { Op } from "sequelize";
import { ClassSectionModel, CourseModel, EnrollmentModel, GradeModel, ProgramCourseModel, ProgramModel, SemesterModel, StudentModel, UserModel } from "../models";
import { ENROLLMENT_STATUS } from "../models/academic/enrollment.model";
import { CLASS_SECTION_STATUS } from "../models/academic/classSection.model";
import { ApiError } from "../utils/apiError";
import { environment } from "../config/environment";
import { SEED_GRADES } from "../seeds/grade.seed";

// Điểm tổng hệ 10 từ 4,0 trở lên là qua môn
const PASS_SCORE = 4.0;

// Bảng đổi điểm hệ 10 sang điểm chữ và hệ 4 (đọc từ trên xuống, gặp mức đầu tiên thoả thì dừng)
const SCALE = [
  { min: 8.5, letter: "A", score4: 4.0 },
  { min: 8.0, letter: "B+", score4: 3.5 },
  { min: 7.0, letter: "B", score4: 3.0 },
  { min: 6.5, letter: "C+", score4: 2.5 },
  { min: 5.5, letter: "C", score4: 2.0 },
  { min: 5.0, letter: "D+", score4: 1.5 },
  { min: 4.0, letter: "D", score4: 1.0 },
  { min: 0, letter: "F", score4: 0 }
];

// Điểm tổng = 30% quá trình + 70% thi, làm tròn 1 chữ số thập phân
function getTotalScore(processScore: number, examScore: number) {
  return Math.round(processScore * 3 + examScore * 7) / 10;
}

function convertScore(score10: number) {
  return SCALE.find(level => score10 >= level.min)!;
}

// Trung bình có trọng số theo tín chỉ, làm tròn 2 chữ số. Không có môn nào thì trả null
function average(list: { score: number; credits: number }[]) {
  const totalCredits = list.reduce((sum, item) => sum + item.credits, 0);
  if(totalCredits === 0) return null;
  const total = list.reduce((sum, item) => sum + item.score * item.credits, 0);
  return Math.round(total / totalCredits * 100) / 100;
}

interface GradeRow {
  id: string;
  classSectionCode: string;
  lecturerName: string;
  courseCode: string;
  courseName: string;
  credits: number;
  attempt: number;
  processScore: number | null;
  examScore: number | null;
  score10: number | null;
  score4: number | null;
  letter: string | null;
  passed: boolean | null;
}

interface SemesterGroup {
  code: string;
  name: string;
  academicYear: string;
  items: GradeRow[];
  summary?: object;
}

type EnrollmentWithDetail = EnrollmentModel & {
  classSection: ClassSectionModel & { course: CourseModel; semester: SemesterModel };
  grade: GradeModel | null;
};

export class GradeService {
  // Hàm dùng chung cho Phi (Đăng ký học): các học phần sinh viên đã qua.
  // Nhận students.id, trả về danh sách courses.id. Không đọc thẳng bảng grades ở chỗ khác.
  public static async getPassedCourseIds(studentId: string): Promise<string[]> {
    const enrollments = await EnrollmentModel.findAll({
      where: { studentId, status: ENROLLMENT_STATUS.REGISTERED },
      include: [
        { model: ClassSectionModel, as: "classSection", required: true },
        { model: GradeModel, as: "grade", required: true }
      ]
    }) as EnrollmentWithDetail[];

    const passed = new Set<string>();
    for(const enrollment of enrollments) {
      const grade = enrollment.grade!;
      if(getTotalScore(grade.processScore, grade.examScore) >= PASS_SCORE) {
        passed.add(enrollment.classSection.courseId);
      }
    }
    return [...passed];
  }

  public static async getMyGrades(userId: string) {
    const student = await StudentModel.findOne({
      where: { userId },
      include: [{ model: UserModel, as: "user", attributes: ["fullName"] }]
    }) as (StudentModel & { user: UserModel }) | null;
    if(!student) {
      throw new ApiError("404", "Tài khoản này không có hồ sơ sinh viên");
    }

    const enrollments = await EnrollmentModel.findAll({
      where: { studentId: student.id, status: ENROLLMENT_STATUS.REGISTERED },
      include: [
        {
          model: ClassSectionModel,
          as: "classSection",
          required: true,
          where: { status: { [Op.ne]: CLASS_SECTION_STATUS.CANCELLED } },
          include: [
            { model: CourseModel, as: "course" },
            { model: SemesterModel, as: "semester" }
          ]
        },
        { model: GradeModel, as: "grade", required: false }
      ]
    }) as EnrollmentWithDetail[];

    // Xếp theo học kỳ cũ -> mới để đếm "lần học" và cộng dồn điểm tích luỹ
    enrollments.sort((a, b) => a.classSection.semester.code.localeCompare(b.classSection.semester.code));

    const attemptByCourse = new Map<string, number>();
    const passedByCourse = new Map<string, { score10: number; score4: number; credits: number }>();
    const allGraded: { score10: number; score4: number; credits: number }[] = [];
    const semesters: SemesterGroup[] = [];

    for(const enrollment of enrollments) {
      const classSection = enrollment.classSection;
      const course = classSection.course;
      const semester = classSection.semester;

      const attempt = (attemptByCourse.get(course.id) ?? 0) + 1;
      attemptByCourse.set(course.id, attempt);

      let group = semesters.find(item => item.code === semester.code);
      if(!group) {
        group = { code: semester.code, name: semester.name, academicYear: semester.academicYear, items: [] };
        semesters.push(group);
      }

      const item: GradeRow = {
        id: enrollment.id,
        classSectionCode: classSection.code,
        lecturerName: classSection.lecturerName,
        courseCode: course.code,
        courseName: course.name,
        credits: course.credits,
        attempt,
        processScore: null,
        examScore: null,
        score10: null,
        score4: null,
        letter: null,
        passed: null
      };

      if(enrollment.grade) {
        const score10 = getTotalScore(enrollment.grade.processScore, enrollment.grade.examScore);
        const level = convertScore(score10);
        item.processScore = enrollment.grade.processScore;
        item.examScore = enrollment.grade.examScore;
        item.score10 = score10;
        item.score4 = level.score4;
        item.letter = level.letter;
        item.passed = score10 >= PASS_SCORE;

        allGraded.push({ score10, score4: level.score4, credits: course.credits });
        if(item.passed) {
          passedByCourse.set(course.id, { score10, score4: level.score4, credits: course.credits });
        }
      }
      group.items.push(item);

      // Tổng kết học kỳ: tính lại mỗi lần thêm môn, môn cuối cùng của học kỳ sẽ cho kết quả đúng
      const graded = group.items.filter(row => row.score10 !== null);
      const passedList = [...passedByCourse.values()];
      group.summary = {
        credits: graded.reduce((sum, row) => sum + row.credits, 0),
        gpa10: average(graded.map(row => ({ score: row.score10!, credits: row.credits }))),
        gpa4: average(graded.map(row => ({ score: row.score4!, credits: row.credits }))),
        earnedCredits: passedList.reduce((sum, row) => sum + row.credits, 0),
        cumulativeGpa10: average(passedList.map(row => ({ score: row.score10, credits: row.credits }))),
        cumulativeGpa4: average(passedList.map(row => ({ score: row.score4, credits: row.credits })))
      };
    }

    // Tổng số tín chỉ của chương trình đào tạo (nếu đã có chương trình)
    const program = await ProgramModel.findOne({
      where: { majorName: student.majorName, cohort: student.cohort },
      include: [{ model: ProgramCourseModel, as: "courses", include: [{ model: CourseModel, as: "course" }] }]
    }) as (ProgramModel & { courses: (ProgramCourseModel & { course: CourseModel })[] }) | null;

    const passedList = [...passedByCourse.values()];
    for(const group of semesters) {
      group.items.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
    }

    return {
      student: {
        studentCode: student.studentCode,
        fullName: student.user.fullName,
        className: student.className,
        majorName: student.majorName
      },
      summary: {
        programCredits: program ? program.courses.reduce((sum, item) => sum + item.course.credits, 0) : null,
        attemptedCredits: allGraded.reduce((sum, item) => sum + item.credits, 0),
        earnedCredits: passedList.reduce((sum, item) => sum + item.credits, 0),
        gpa10: average(allGraded.map(item => ({ score: item.score10, credits: item.credits }))),
        gpa4: average(allGraded.map(item => ({ score: item.score4, credits: item.credits }))),
        cumulativeGpa10: average(passedList.map(item => ({ score: item.score10, credits: item.credits }))),
        cumulativeGpa4: average(passedList.map(item => ({ score: item.score4, credits: item.credits })))
      },
      // Học kỳ mới nhất lên đầu
      semesters: semesters.reverse()
    };
  }

  public static async seedInitialData() {
    if(environment.NODE_ENV !== "development") {
      throw new ApiError("403", "Chỉ được khởi tạo dữ liệu mẫu ở môi trường development");
    }

    let createdCount = 0;
    for(const item of SEED_GRADES) {
      const student = await StudentModel.findOne({ where: { studentCode: item.studentCode } });
      const classSection = await ClassSectionModel.findOne({ where: { code: item.classSectionCode } });
      const enrollment = student && classSection
        ? await EnrollmentModel.findOne({ where: { studentId: student.id, classSectionId: classSection.id } })
        : null;
      if(!enrollment) {
        throw new ApiError("400", `Sinh viên ${item.studentCode} chưa đăng ký lớp ${item.classSectionCode}. Hãy chạy seed học vụ (POST /api/v1/academic/seed) trước`);
      }

      const [, created] = await GradeModel.findOrCreate({
        where: { enrollmentId: enrollment.id },
        defaults: { enrollmentId: enrollment.id, processScore: item.processScore, examScore: item.examScore }
      });
      if(created) createdCount++;
    }

    if(createdCount === 0) {
      return { seeded: false, createdCount, message: "Dữ liệu điểm mẫu đã đủ, không thêm gì" };
    }
    return { seeded: true, createdCount, message: `Đã thêm ${createdCount} điểm mẫu` };
  }
}
