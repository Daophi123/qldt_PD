// Dữ liệu mẫu cho Văn bản, dùng bởi DocumentService.seedInitialData().
// Văn bản được tìm theo số hiệu (code): văn bản nào đã có thì bỏ qua, nên gọi seed nhiều lần không bị trùng.
// departmentCode là mã đơn vị trong bảng departments (do seed Tin tức tạo ra).

const FILE_BASE = "https://example.com/van-ban";

export const SEED_DOCUMENTS = [
  {
    code: "1520/QĐ-ĐT",
    title: "Quy chế đào tạo trình độ đại học",
    summary: "Áp dụng từ khoá tuyển sinh 2024",
    type: "regulation",
    departmentCode: "PDT",
    issuedDate: "15/08/2024",
    file: { fileName: "quy-che-dao-tao.pdf", fileUrl: `${FILE_BASE}/quy-che-dao-tao.pdf`, fileSize: 1258291, fileType: "pdf" }
  },
  {
    code: "318/QĐ-ĐT",
    title: "Quy định đánh giá chuẩn đầu ra ngoại ngữ",
    summary: "Thay thế quyết định 205/QĐ-ĐT",
    type: "rule",
    departmentCode: "PDBCL",
    issuedDate: "02/03/2026",
    file: { fileName: "chuan-dau-ra-ngoai-ngu.pdf", fileUrl: `${FILE_BASE}/chuan-dau-ra-ngoai-ngu.pdf`, fileSize: 655360, fileType: "pdf" }
  },
  {
    code: "45/HD-ĐT",
    title: "Hướng dẫn đăng ký học phần trực tuyến",
    summary: "Có ảnh minh hoạ từng bước",
    type: "guide",
    departmentCode: "PDT",
    issuedDate: "10/07/2026",
    file: { fileName: "huong-dan-dang-ky-hoc.pdf", fileUrl: `${FILE_BASE}/huong-dan-dang-ky-hoc.pdf`, fileSize: 2936013, fileType: "pdf" }
  },
  {
    code: "BM-ĐT-07",
    title: "Đơn đề nghị phúc khảo bài thi",
    type: "form",
    departmentCode: "PDBCL",
    issuedDate: "05/01/2026",
    file: { fileName: "don-phuc-khao.docx", fileUrl: `${FILE_BASE}/don-phuc-khao.docx`, fileSize: 38912, fileType: "docx" }
  },
  {
    code: "BM-ĐT-12",
    title: "Đơn xin nghỉ học tạm thời, bảo lưu kết quả",
    type: "form",
    departmentCode: "PDT",
    issuedDate: "05/01/2026",
    file: { fileName: "don-bao-luu.docx", fileUrl: `${FILE_BASE}/don-bao-luu.docx`, fileSize: 41984, fileType: "docx" }
  },
  {
    code: "212/QĐ-TCKT",
    title: "Quy định mức thu học phí năm học 2026-2027",
    type: "rule",
    departmentCode: "PTCKT",
    issuedDate: "20/08/2026",
    file: { fileName: "hoc-phi-2026-2027.pdf", fileUrl: `${FILE_BASE}/hoc-phi-2026-2027.pdf`, fileSize: 532480, fileType: "pdf" }
  },
  {
    code: "77/HD-CTSV",
    title: "Hướng dẫn xét học bổng khuyến khích học tập",
    summary: "Áp dụng từ học kỳ 1 năm học 2026-2027",
    type: "guide",
    departmentCode: "PCTSV",
    issuedDate: "28/08/2026",
    file: { fileName: "hoc-bong-khuyen-khich.pdf", fileUrl: `${FILE_BASE}/hoc-bong-khuyen-khich.pdf`, fileSize: 870400, fileType: "pdf" }
  },
  {
    code: "BM-ĐT-03",
    title: "Đơn xin cấp bảng điểm",
    type: "form",
    departmentCode: "PDT",
    issuedDate: "05/01/2026",
    file: { fileName: "don-cap-bang-diem.docx", fileUrl: `${FILE_BASE}/don-cap-bang-diem.docx`, fileSize: 35840, fileType: "docx" }
  }
] as const;