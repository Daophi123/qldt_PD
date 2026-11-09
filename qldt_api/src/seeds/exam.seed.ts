// Lịch thi mẫu. Lớp và sinh viên lấy theo mã trong core.seed.ts của Phi.
// Môn POL1001 cố ý chưa xếp phòng để trang hiện trạng thái "Chờ xếp phòng".
export const SEED_EXAMS = [
  // Học kỳ 2, năm học 2025-2026 (đã thi xong)
  { classSectionCode: "2526-HK2-INT1002-01", examDate: "15/06/2026", startTime: "07:30", durationMinutes: 90, format: "Thực hành máy", rooms: [{ studentCode: "24100001", room: "Phòng máy B2-201", seatNumber: "015" }] },
  { classSectionCode: "2526-HK2-MAT1003-01", examDate: "17/06/2026", startTime: "09:30", durationMinutes: 90, format: "Tự luận", rooms: [{ studentCode: "24100001", room: "A1-205", seatNumber: "032" }] },
  { classSectionCode: "2526-HK2-ENG1002-01", examDate: "19/06/2026", startTime: "13:30", durationMinutes: 60, format: "Trắc nghiệm máy", rooms: [{ studentCode: "24100001", room: "Phòng máy B2-202", seatNumber: "008" }] },
  { classSectionCode: "2526-HK2-PHY1001-01", examDate: "22/06/2026", startTime: "07:30", durationMinutes: 90, format: "Tự luận", rooms: [{ studentCode: "24100001", room: "A3-110", seatNumber: "041" }] },

  // Học kỳ 1, năm học 2026-2027 (sắp thi)
  { classSectionCode: "2627-HK1-INT2001-01", examDate: "04/01/2027", startTime: "07:30", durationMinutes: 120, format: "Thực hành máy", rooms: [{ studentCode: "24100001", room: "Phòng máy B2-201", seatNumber: "017" }] },
  { classSectionCode: "2627-HK1-INT2002-01", examDate: "06/01/2027", startTime: "13:30", durationMinutes: 90, format: "Tự luận", rooms: [{ studentCode: "24100001", room: "A2-305", seatNumber: "024" }] },
  { classSectionCode: "2627-HK1-INT2003-01", examDate: "08/01/2027", startTime: "09:30", durationMinutes: 90, format: "Tự luận", rooms: [{ studentCode: "24100001", room: "A2-210", seatNumber: "009" }] },
  { classSectionCode: "2627-HK1-MAT2001-01", examDate: "11/01/2027", startTime: "07:30", durationMinutes: 90, format: "Tự luận", rooms: [{ studentCode: "24100001", room: "A1-301", seatNumber: "041" }] },
  { classSectionCode: "2627-HK1-POL1001-01", examDate: "13/01/2027", startTime: "13:30", durationMinutes: 60, format: "Trắc nghiệm", rooms: [] }
];
