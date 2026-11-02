export const SEED_STUDENT_PASSWORD = "Student@123";

export const SEED_STUDENTS = [
  { studentCode: "24100001", fullName: "Sinh viên mẫu", className: "K18-CNTT1", majorName: "Công nghệ thông tin", cohort: "K18" },
  { studentCode: "24100002", fullName: "Trần Thị Bình", className: "K18-CNTT1", majorName: "Công nghệ thông tin", cohort: "K18" },
  { studentCode: "24100003", fullName: "Lê Văn Cường", className: "K18-CNTT2", majorName: "Công nghệ thông tin", cohort: "K18" },
];

export const SEED_SEMESTERS = [
  { code: "2526-HK2", name: "Học kỳ 2", academicYear: "2025-2026", startDate: "19/01/2026", endDate: "14/06/2026", registrationStart: "01/12/2025", registrationEnd: "31/12/2025" },
  { code: "2627-HK1", name: "Học kỳ 1", academicYear: "2026-2027", startDate: "07/09/2026", endDate: "17/01/2027", registrationStart: "01/08/2026", registrationEnd: "31/08/2026" },
  { code: "2627-HK2", name: "Học kỳ 2", academicYear: "2026-2027", startDate: "01/02/2027", endDate: "20/06/2027", registrationStart: "01/11/2026", registrationEnd: "30/11/2026" },
];

export const SEED_COURSES = [
  { code: "INT1002", name: "Lập trình hướng đối tượng", credits: 3 },
  { code: "MAT1003", name: "Đại số tuyến tính", credits: 3 },
  { code: "ENG1002", name: "Tiếng Anh 2", credits: 3 },
  { code: "PHY1001", name: "Vật lý đại cương", credits: 3 },
  { code: "INT2001", name: "Cấu trúc dữ liệu và giải thuật", credits: 3 },
  { code: "INT2002", name: "Cơ sở dữ liệu", credits: 3 },
  { code: "INT2003", name: "Mạng máy tính", credits: 3 },
  { code: "MAT2001", name: "Xác suất thống kê", credits: 3 },
  { code: "POL1001", name: "Triết học Mác - Lênin", credits: 3 },
  { code: "INT2004", name: "Lập trình web", credits: 3 },
  { code: "INT2005", name: "Hệ điều hành", credits: 3 },
  { code: "INT2006", name: "Công nghệ phần mềm", credits: 3 },
  { code: "ENG1003", name: "Tiếng Anh 3", credits: 3 },
  { code: "MAT2002", name: "Toán rời rạc", credits: 3 },
  { code: "POL1002", name: "Kinh tế chính trị Mác - Lênin", credits: 2 },
];

export const SEED_PREREQUISITES = [
  ["INT2001", "INT1002"],
  ["INT2004", "INT2002"],
  ["INT2005", "INT2001"],
  ["INT2006", "INT1002"],
  ["ENG1003", "ENG1002"],
];

export const SEED_CLASS_SECTIONS = [
  { code: "2526-HK2-INT1002-01", courseCode: "INT1002", semesterCode: "2526-HK2", lecturerName: "TS. Nguyễn Văn An", capacity: 60, status: "closed", sessions: [{ dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: "A2-301" }] },
  { code: "2526-HK2-MAT1003-01", courseCode: "MAT1003", semesterCode: "2526-HK2", lecturerName: "ThS. Phạm Thu Hà", capacity: 70, status: "closed", sessions: [{ dayOfWeek: 4, startPeriod: 4, endPeriod: 6, room: "A1-205" }] },
  { code: "2526-HK2-ENG1002-01", courseCode: "ENG1002", semesterCode: "2526-HK2", lecturerName: "ThS. Hoàng Minh Châu", capacity: 40, status: "closed", sessions: [{ dayOfWeek: 5, startPeriod: 1, endPeriod: 3, room: "C1-102" }] },
  { code: "2526-HK2-PHY1001-01", courseCode: "PHY1001", semesterCode: "2526-HK2", lecturerName: "TS. Đỗ Quang Huy", capacity: 80, status: "closed", sessions: [{ dayOfWeek: 6, startPeriod: 7, endPeriod: 9, room: "A3-110" }] },

  { code: "2627-HK1-INT2001-01", courseCode: "INT2001", semesterCode: "2627-HK1", lecturerName: "TS. Nguyễn Văn An", capacity: 60, status: "closed", sessions: [{ dayOfWeek: 2, startPeriod: 1, endPeriod: 3, room: "A2-402" }, { dayOfWeek: 5, startPeriod: 4, endPeriod: 5, room: "Phòng máy B2-201" }] },
  { code: "2627-HK1-INT2002-01", courseCode: "INT2002", semesterCode: "2627-HK1", lecturerName: "TS. Vũ Thị Lan", capacity: 60, status: "closed", sessions: [{ dayOfWeek: 3, startPeriod: 4, endPeriod: 6, room: "A2-305" }] },
  { code: "2627-HK1-INT2003-01", courseCode: "INT2003", semesterCode: "2627-HK1", lecturerName: "ThS. Bùi Đức Long", capacity: 60, status: "closed", sessions: [{ dayOfWeek: 4, startPeriod: 1, endPeriod: 3, room: "A2-210" }] },
  { code: "2627-HK1-INT2003-02", courseCode: "INT2003", semesterCode: "2627-HK1", lecturerName: "ThS. Bùi Đức Long", capacity: 60, status: "closed", sessions: [{ dayOfWeek: 7, startPeriod: 1, endPeriod: 3, room: "A2-210" }] },
  { code: "2627-HK1-MAT2001-01", courseCode: "MAT2001", semesterCode: "2627-HK1", lecturerName: "ThS. Phạm Thu Hà", capacity: 70, status: "closed", sessions: [{ dayOfWeek: 5, startPeriod: 7, endPeriod: 9, room: "A1-301" }] },
  { code: "2627-HK1-POL1001-01", courseCode: "POL1001", semesterCode: "2627-HK1", lecturerName: "TS. Ngô Thanh Tùng", capacity: 120, status: "closed", sessions: [{ dayOfWeek: 6, startPeriod: 1, endPeriod: 3, room: "Hội trường B1" }] },

  { code: "2627-HK2-INT2004-01", courseCode: "INT2004", semesterCode: "2627-HK2", lecturerName: "TS. Vũ Thị Lan", capacity: 50, status: "open", sessions: [{ dayOfWeek: 3, startPeriod: 1, endPeriod: 3, room: "A2-402" }] },
  { code: "2627-HK2-INT2004-02", courseCode: "INT2004", semesterCode: "2627-HK2", lecturerName: "TS. Vũ Thị Lan", capacity: 50, status: "open", sessions: [{ dayOfWeek: 5, startPeriod: 4, endPeriod: 6, room: "A2-402" }] },
  { code: "2627-HK2-INT2005-01", courseCode: "INT2005", semesterCode: "2627-HK2", lecturerName: "ThS. Bùi Đức Long", capacity: 60, status: "open", sessions: [{ dayOfWeek: 2, startPeriod: 4, endPeriod: 6, room: "A2-301" }] },
  { code: "2627-HK2-INT2006-01", courseCode: "INT2006", semesterCode: "2627-HK2", lecturerName: "TS. Nguyễn Văn An", capacity: 60, status: "open", sessions: [{ dayOfWeek: 4, startPeriod: 1, endPeriod: 3, room: "A2-305" }] },
  { code: "2627-HK2-ENG1003-01", courseCode: "ENG1003", semesterCode: "2627-HK2", lecturerName: "ThS. Hoàng Minh Châu", capacity: 40, status: "open", sessions: [{ dayOfWeek: 6, startPeriod: 1, endPeriod: 3, room: "C1-102" }] },
  { code: "2627-HK2-ENG1002-01", courseCode: "ENG1002", semesterCode: "2627-HK2", lecturerName: "ThS. Hoàng Minh Châu", capacity: 40, status: "open", sessions: [{ dayOfWeek: 6, startPeriod: 4, endPeriod: 6, room: "C1-104" }] },
  { code: "2627-HK2-MAT2002-01", courseCode: "MAT2002", semesterCode: "2627-HK2", lecturerName: "TS. Đinh Công Minh", capacity: 70, status: "open", sessions: [{ dayOfWeek: 3, startPeriod: 2, endPeriod: 4, room: "A1-205" }] },
  { code: "2627-HK2-POL1002-01", courseCode: "POL1002", semesterCode: "2627-HK2", lecturerName: "TS. Ngô Thanh Tùng", capacity: 2, status: "open", sessions: [{ dayOfWeek: 7, startPeriod: 1, endPeriod: 3, room: "Hội trường B1" }] },
];

export const SEED_ENROLLMENTS = [
  { studentCode: "24100001", classSectionCode: "2526-HK2-INT1002-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2526-HK2-MAT1003-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2526-HK2-ENG1002-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2526-HK2-PHY1001-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2627-HK1-INT2001-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2627-HK1-INT2002-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2627-HK1-INT2003-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2627-HK1-MAT2001-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2627-HK1-POL1001-01", status: "registered" },
  { studentCode: "24100001", classSectionCode: "2627-HK1-INT2003-02", status: "cancelled" },
  { studentCode: "24100002", classSectionCode: "2627-HK2-POL1002-01", status: "registered" },
  { studentCode: "24100003", classSectionCode: "2627-HK2-POL1002-01", status: "registered" },
];
