// Điểm mẫu. Sinh viên và lớp lấy theo mã trong core.seed.ts của Phi.
// Chỉ có điểm học kỳ 2 năm 2025-2026 (đã học xong). Học kỳ 1 năm 2026-2027 đang học nên chưa có điểm.
// PHY1001 cố ý bị F (điểm tổng 3,3) để trang có trạng thái "Học lại".
export const SEED_GRADES = [
  { studentCode: "24100001", classSectionCode: "2526-HK2-INT1002-01", processScore: 8.0, examScore: 7.5 },
  { studentCode: "24100001", classSectionCode: "2526-HK2-MAT1003-01", processScore: 7.0, examScore: 6.0 },
  { studentCode: "24100001", classSectionCode: "2526-HK2-ENG1002-01", processScore: 9.0, examScore: 8.5 },
  { studentCode: "24100001", classSectionCode: "2526-HK2-PHY1001-01", processScore: 5.0, examScore: 2.5 }
];
