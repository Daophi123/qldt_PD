import { Op } from "sequelize";
import { ClassSectionModel, CourseModel, EnrollmentModel, ExamModel, ExamRoomModel, StudentModel } from "../models";
import { ENROLLMENT_STATUS } from "../models/academic/enrollment.model";
import { CLASS_SECTION_STATUS } from "../models/academic/classSection.model";
import { ApiError } from "../utils/apiError";
import { toISODate } from "../utils/date.util";
import { environment } from "../config/environment";
import { AcademicService } from "./academic.service";
import { SEED_EXAMS } from "../seeds/exam.seed";

type ExamWithDetail = ExamModel & {
  classSection: ClassSectionModel & { course: CourseModel };
  rooms: ExamRoomModel[];
};

export class ExamService {
  public static async getExamSchedule(userId: string, semesterCode?: string) {
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
        where: { semesterId: semester.id, status: { [Op.ne]: CLASS_SECTION_STATUS.CANCELLED } }
      }]
    });
    const classSectionIds = enrollments.map(enrollment => enrollment.classSectionId);

    const exams = await ExamModel.findAll({
      where: { classSectionId: classSectionIds },
      include: [
        {
          model: ClassSectionModel,
          as: "classSection",
          include: [{ model: CourseModel, as: "course" }]
        },
        {
          model: ExamRoomModel,
          as: "rooms",
          required: false,
          where: { studentId: student.id }
        }
      ]
    }) as ExamWithDetail[];

    const items = exams.map(exam => {
      const myRoom = exam.rooms[0];
      return {
        id: exam.id,
        examDate: exam.examDate,
        startTime: exam.startTime,
        durationMinutes: exam.durationMinutes,
        format: exam.format,
        courseCode: exam.classSection.course.code,
        courseName: exam.classSection.course.name,
        credits: exam.classSection.course.credits,
        room: myRoom ? myRoom.room : null,
        seatNumber: myRoom ? myRoom.seatNumber : null
      };
    }).sort((a, b) => {
      const timeA = toISODate(a.examDate) + a.startTime;
      const timeB = toISODate(b.examDate) + b.startTime;
      return timeA.localeCompare(timeB);
    });

    return {
      semester: {
        code: semester.code,
        name: semester.name,
        academicYear: semester.academicYear
      },
      items
    };
  }

  public static async seedInitialData() {
    if(environment.NODE_ENV !== "development") {
      throw new ApiError("403", "Chỉ được khởi tạo dữ liệu mẫu ở môi trường development");
    }

    let createdCount = 0;
    for(const item of SEED_EXAMS) {
      const classSection = await ClassSectionModel.findOne({ where: { code: item.classSectionCode } });
      if(!classSection) {
        throw new ApiError("400", `Chưa có lớp ${item.classSectionCode}. Hãy chạy seed học vụ (POST /api/v1/academic/seed) trước`);
      }

      const { classSectionCode, rooms, ...fields } = item;
      const [exam, created] = await ExamModel.findOrCreate({
        where: { classSectionId: classSection.id },
        defaults: { ...fields, classSectionId: classSection.id }
      });
      if(!created) continue;

      for(const room of rooms) {
        const student = await StudentModel.findOne({ where: { studentCode: room.studentCode } });
        if(!student) {
          throw new ApiError("400", `Chưa có sinh viên ${room.studentCode}. Hãy chạy seed học vụ (POST /api/v1/academic/seed) trước`);
        }
        await ExamRoomModel.create({ examId: exam.id, studentId: student.id, room: room.room, seatNumber: room.seatNumber });
      }
      createdCount++;
    }

    if(createdCount === 0) {
      return { seeded: false, createdCount, message: "Dữ liệu lịch thi mẫu đã đủ, không thêm gì" };
    }
    return { seeded: true, createdCount, message: `Đã thêm ${createdCount} lịch thi mẫu` };
  }
}
