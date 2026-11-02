// Dữ liệu mẫu cho Tin tức, dùng bởi NewsService.seedInitialData().
// Tin được thêm theo tiêu đề: tin nào đã có (trùng tiêu đề) thì bỏ qua, nên gọi seed nhiều lần không bị trùng.
// Danh sách xếp từ cũ đến mới: API sắp xếp theo thời điểm tạo, nên tin thêm sau sẽ hiện lên trước.

export const SEED_DEPARTMENTS = [
  { code: "PDT", name: "Phòng đào tạo", order: 1 },
  { code: "PDBCL", name: "Phòng Đảm bảo chất lượng và khảo thí", order: 2 },
  { code: "PKHCN", name: "Phòng Khoa học Công nghệ", order: 3 },
  { code: "PTCKT", name: "Phòng Tài chính kế toán", order: 4 },
  { code: "PCTSV", name: "Phòng Công tác sinh viên", order: 5 },
];

export const SEED_CATEGORIES = [
  { code: "training", name: "Tin đào tạo", order: 1 },
  { code: "university", name: "Tin nhà trường", order: 2 },
  { code: "student_activity", name: "Hoạt động sinh viên", order: 3 },
];

interface SeedAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

interface SeedNews {
  title: string;
  summary: string;
  content: string;
  categoryCode: string;
  departmentCode: string;
  authorName: string;
  startDate: string;
  endDate?: string;
  isPinned?: boolean;
  views?: number;
  attachments?: SeedAttachment[];
}

const FILE_BASE = "https://qldtbeta.phenikaa-uni.edu.vn/files";

const pdf = (fileName: string, fileSize: number): SeedAttachment => ({
  fileName,
  fileUrl: `${FILE_BASE}/${fileName}`,
  fileSize,
  fileType: "application/pdf",
});

const docx = (fileName: string, fileSize: number): SeedAttachment => ({
  fileName,
  fileUrl: `${FILE_BASE}/${fileName}`,
  fileSize,
  fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

const xlsx = (fileName: string, fileSize: number): SeedAttachment => ({
  fileName,
  fileUrl: `${FILE_BASE}/${fileName}`,
  fileSize,
  fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
});

export const SEED_NEWS: SeedNews[] = [
  {
    title: "KH100_Xét tốt nghiệp tiến sĩ đợt 2 năm 2025",
    summary: "Kế hoạch xét tốt nghiệp tiến sĩ đợt 2 năm 2025",
    content: "<p>Kế hoạch xét tốt nghiệp tiến sĩ đợt 2 năm học 2024-2025 theo quyết định của Hội đồng Đào tạo.</p>",
    categoryCode: "training",
    departmentCode: "PDT",
    authorName: "Nguyễn Thái Vinh",
    startDate: "12/05/2025",
    isPinned: true,
    attachments: [pdf("KH100_Xet_Tot_Nghiep.pdf", 1048576)],
  },
  {
    title: "Hướng dẫn sinh viên khoá 2025 kích hoạt tài khoản email và hệ thống học tập",
    summary: "Sinh viên khoá mới kích hoạt email trường, tài khoản LMS và cổng đào tạo trước ngày 30/09/2025.",
    content:
      "<p>Phòng Đào tạo hướng dẫn sinh viên khoá 2025 kích hoạt các tài khoản phục vụ học tập.</p>" +
      "<ol><li>Đăng nhập email trường bằng mã sinh viên và mật khẩu được cấp trong giấy báo nhập học.</li>" +
      "<li>Đổi mật khẩu ngay trong lần đăng nhập đầu tiên.</li>" +
      "<li>Đăng nhập Cổng Đào tạo để kiểm tra thông tin cá nhân và lớp hành chính.</li></ol>" +
      "<p>Hạn hoàn thành: <strong>30/09/2025</strong>.</p>",
    categoryCode: "training",
    departmentCode: "PDT",
    authorName: "Phòng Đào tạo",
    startDate: "08/09/2025",
    endDate: "30/09/2025",
    views: 412,
    attachments: [pdf("HD_Kich_Hoat_Tai_Khoan_K2025.pdf", 734003)],
  },
  {
    title: "Thông báo mức học phí năm học 2025-2026",
    summary: "Mức học phí theo tín chỉ áp dụng cho các khoá đang đào tạo trong năm học 2025-2026.",
    content:
      "<p>Nhà trường thông báo mức học phí năm học 2025-2026 áp dụng cho sinh viên hệ đại học chính quy.</p>" +
      "<ul><li>Học phí được tính theo số tín chỉ đăng ký trong từng học kỳ.</li>" +
      "<li>Học phần học lại, học cải thiện tính theo đơn giá tín chỉ của khoá.</li></ul>" +
      "<p>Chi tiết đơn giá từng ngành xem trong tệp đính kèm.</p>",
    categoryCode: "university",
    departmentCode: "PTCKT",
    authorName: "Phòng Tài chính kế toán",
    startDate: "15/09/2025",
    views: 1290,
    attachments: [pdf("QD_Hoc_Phi_2025_2026.pdf", 524288), xlsx("Bang_Don_Gia_Tin_Chi.xlsx", 45056)],
  },
  {
    title: "Kế hoạch thi kết thúc học phần học kỳ 1 năm học 2025-2026",
    summary: "Lịch thi tập trung từ 05/01/2026 đến 18/01/2026, sinh viên xem phòng thi trên Cổng Đào tạo.",
    content:
      "<p>Phòng Đảm bảo chất lượng và khảo thí thông báo kế hoạch thi kết thúc học phần học kỳ 1.</p>" +
      "<ul><li>Thời gian thi: từ <strong>05/01/2026</strong> đến <strong>18/01/2026</strong>.</li>" +
      "<li>Sinh viên mang thẻ sinh viên hoặc căn cước khi vào phòng thi.</li>" +
      "<li>Sinh viên nợ học phí quá hạn sẽ không đủ điều kiện dự thi.</li></ul>",
    categoryCode: "training",
    departmentCode: "PDBCL",
    authorName: "Phòng ĐBCL&KT",
    startDate: "01/12/2025",
    endDate: "18/01/2026",
    views: 865,
    attachments: [pdf("KH_Thi_HK1_2025_2026.pdf", 389120)],
  },
  {
    title: "Chương trình hiến máu tình nguyện \"Giọt hồng mùa đông\" 2025",
    summary: "Sinh viên đăng ký hiến máu tại hội trường tầng 1 nhà A2 ngày 14/12/2025.",
    content:
      "<p>Đoàn Thanh niên phối hợp Phòng Công tác sinh viên tổ chức chương trình hiến máu tình nguyện.</p>" +
      "<p>Thời gian: 7h30 đến 11h30 ngày 14/12/2025. Sinh viên tham gia được cộng điểm rèn luyện theo quy định.</p>",
    categoryCode: "student_activity",
    departmentCode: "PCTSV",
    authorName: "Phòng Công tác sinh viên",
    startDate: "02/12/2025",
    endDate: "14/12/2025",
    views: 238,
  },
  {
    title: "Thông báo nghỉ Tết Nguyên đán Bính Ngọ 2026",
    summary: "Sinh viên nghỉ Tết từ 09/02/2026 đến hết 22/02/2026, đi học lại từ 23/02/2026.",
    content:
      "<p>Nhà trường thông báo lịch nghỉ Tết Nguyên đán Bính Ngọ 2026 đối với sinh viên:</p>" +
      "<ul><li>Nghỉ từ thứ Hai, ngày 09/02/2026 đến hết Chủ nhật, ngày 22/02/2026.</li>" +
      "<li>Đi học trở lại từ thứ Hai, ngày 23/02/2026.</li></ul>",
    categoryCode: "university",
    departmentCode: "PDT",
    authorName: "Ban Giám hiệu",
    startDate: "12/01/2026",
    endDate: "22/02/2026",
    views: 1534,
  },
  {
    title: "Mở đăng ký học phần học kỳ 2 năm học 2025-2026",
    summary: "Sinh viên đăng ký học phần trực tuyến từ 26/01/2026 đến 01/02/2026.",
    content:
      "<p>Phòng Đào tạo mở cổng đăng ký học phần học kỳ 2 năm học 2025-2026.</p>" +
      "<ol><li>Đợt 1 (theo khoá): 26/01/2026 đến 28/01/2026.</li>" +
      "<li>Đợt 2 (tất cả sinh viên): 29/01/2026 đến 01/02/2026.</li></ol>" +
      "<p>Sinh viên kiểm tra học phần tiên quyết và tối đa <strong>25 tín chỉ</strong> mỗi học kỳ.</p>",
    categoryCode: "training",
    departmentCode: "PDT",
    authorName: "Phòng Đào tạo",
    startDate: "15/01/2026",
    endDate: "01/02/2026",
    views: 2047,
    attachments: [pdf("HD_Dang_Ky_Hoc_HK2.pdf", 612352)],
  },
  {
    title: "Kết quả xét học bổng khuyến khích học tập học kỳ 1 năm học 2025-2026",
    summary: "Danh sách sinh viên được nhận học bổng, thời hạn phản hồi đến 20/03/2026.",
    content:
      "<p>Hội đồng xét học bổng công bố danh sách sinh viên đạt học bổng khuyến khích học tập học kỳ 1.</p>" +
      "<p>Sinh viên có thắc mắc gửi phản hồi qua email Phòng Công tác sinh viên trước ngày <strong>20/03/2026</strong>.</p>",
    categoryCode: "student_activity",
    departmentCode: "PCTSV",
    authorName: "Phòng Công tác sinh viên",
    startDate: "06/03/2026",
    endDate: "20/03/2026",
    views: 978,
    attachments: [xlsx("DS_Hoc_Bong_HK1_2025_2026.xlsx", 88064)],
  },
  {
    title: "Thông báo thu học phí học kỳ 2 năm học 2025-2026",
    summary: "Hạn nộp học phí học kỳ 2 là ngày 31/03/2026, nộp qua ngân hàng hoặc ví điện tử.",
    content:
      "<p>Phòng Tài chính kế toán thông báo thu học phí học kỳ 2 năm học 2025-2026.</p>" +
      "<ul><li>Hạn nộp: <strong>31/03/2026</strong>.</li>" +
      "<li>Hình thức: chuyển khoản theo mã sinh viên hoặc thanh toán qua ví điện tử liên kết.</li>" +
      "<li>Sinh viên xem số tiền phải nộp tại mục Tài chính trên Cổng Đào tạo.</li></ul>",
    categoryCode: "university",
    departmentCode: "PTCKT",
    authorName: "Phòng Tài chính kế toán",
    startDate: "10/03/2026",
    endDate: "31/03/2026",
    views: 1721,
  },
  {
    title: "Kêu gọi đăng ký đề tài nghiên cứu khoa học sinh viên năm 2026",
    summary: "Sinh viên nộp đề xuất đề tài theo nhóm tối đa 5 người, hạn nộp 15/04/2026.",
    content:
      "<p>Phòng Khoa học Công nghệ thông báo kế hoạch nghiên cứu khoa học sinh viên năm 2026.</p>" +
      "<ul><li>Mỗi nhóm tối đa 5 sinh viên và có 1 giảng viên hướng dẫn.</li>" +
      "<li>Hồ sơ gồm phiếu đề xuất và thuyết minh đề tài theo mẫu.</li></ul>" +
      "<p>Hạn nộp hồ sơ: <strong>15/04/2026</strong>.</p>",
    categoryCode: "university",
    departmentCode: "PKHCN",
    authorName: "Phòng Khoa học Công nghệ",
    startDate: "18/03/2026",
    endDate: "15/04/2026",
    views: 356,
    attachments: [docx("Mau_De_Xuat_De_Tai_NCKH.docx", 51200), docx("Mau_Thuyet_Minh_De_Tai.docx", 67584)],
  },
  {
    title: "Giải bóng đá sinh viên mở rộng 2026",
    summary: "Các chi đoàn đăng ký đội thi đấu trước ngày 10/04/2026.",
    content:
      "<p>Phòng Công tác sinh viên phối hợp Hội Sinh viên tổ chức giải bóng đá sinh viên mở rộng 2026.</p>" +
      "<p>Mỗi chi đoàn đăng ký tối đa 1 đội, mỗi đội từ 10 đến 15 cầu thủ. Lễ khai mạc dự kiến ngày 18/04/2026.</p>",
    categoryCode: "student_activity",
    departmentCode: "PCTSV",
    authorName: "Hội Sinh viên",
    startDate: "25/03/2026",
    endDate: "10/04/2026",
    views: 504,
  },
  {
    title: "Khảo sát ý kiến người học về hoạt động giảng dạy học kỳ 2",
    summary: "Sinh viên thực hiện khảo sát trực tuyến cho từng học phần trước khi xem điểm.",
    content:
      "<p>Để nâng cao chất lượng giảng dạy, nhà trường tổ chức khảo sát ý kiến người học cho từng học phần.</p>" +
      "<p>Khảo sát mở từ 04/05/2026 đến 24/05/2026. Mọi câu trả lời được ẩn danh.</p>",
    categoryCode: "training",
    departmentCode: "PDBCL",
    authorName: "Phòng ĐBCL&KT",
    startDate: "04/05/2026",
    endDate: "24/05/2026",
    views: 689,
  },
  {
    title: "Thông báo Kế hoạch Tổ chức thi Đánh giá CĐR năng lực ngoại ngữ",
    summary: "Kế hoạch thi chuẩn đầu ra",
    content: "<p>Thông báo kế hoạch tổ chức thi đánh giá chuẩn đầu ra ngoại ngữ nội bộ.</p>",
    categoryCode: "university",
    departmentCode: "PDBCL",
    authorName: "Phòng ĐBCL&KT",
    startDate: "08/06/2026",
    isPinned: true,
  },
  {
    title: "Lịch thi kết thúc học phần học kỳ 2 năm học 2025-2026",
    summary: "Thi tập trung từ 15/06/2026 đến 28/06/2026, xem chi tiết phòng thi trên Cổng Đào tạo.",
    content:
      "<p>Lịch thi kết thúc học phần học kỳ 2 đã được cập nhật trên Cổng Đào tạo.</p>" +
      "<p>Sinh viên kiểm tra kỹ ngày thi, ca thi và phòng thi. Thắc mắc về lịch thi gửi về Phòng ĐBCL&KT trước <strong>10/06/2026</strong>.</p>",
    categoryCode: "training",
    departmentCode: "PDBCL",
    authorName: "Phòng ĐBCL&KT",
    startDate: "01/06/2026",
    endDate: "28/06/2026",
    views: 1388,
    attachments: [pdf("Lich_Thi_HK2_2025_2026.pdf", 458752)],
  },
  {
    title: "Thông báo tổ chức học kỳ hè năm 2026",
    summary: "Sinh viên đăng ký học kỳ hè từ 22/06/2026 đến 28/06/2026, lớp mở khi đủ 20 sinh viên.",
    content:
      "<p>Nhà trường tổ chức học kỳ hè cho sinh viên có nhu cầu học lại, học cải thiện hoặc học vượt.</p>" +
      "<ul><li>Thời gian đăng ký: 22/06/2026 đến 28/06/2026.</li>" +
      "<li>Lớp học phần chỉ mở khi có từ 20 sinh viên đăng ký.</li>" +
      "<li>Thời gian học: 06/07/2026 đến 16/08/2026.</li></ul>",
    categoryCode: "training",
    departmentCode: "PDT",
    authorName: "Phòng Đào tạo",
    startDate: "15/06/2026",
    endDate: "28/06/2026",
    views: 744,
  },
  {
    title: "Chiến dịch tình nguyện Mùa hè xanh 2026",
    summary: "Tuyển 120 tình nguyện viên tham gia chiến dịch tại 3 tỉnh miền núi phía Bắc.",
    content:
      "<p>Đoàn Thanh niên tuyển tình nguyện viên tham gia chiến dịch Mùa hè xanh 2026.</p>" +
      "<p>Thời gian chiến dịch: 15/07/2026 đến 05/08/2026. Sinh viên đăng ký qua đường link trong tệp đính kèm.</p>",
    categoryCode: "student_activity",
    departmentCode: "PCTSV",
    authorName: "Đoàn Thanh niên",
    startDate: "20/06/2026",
    endDate: "05/07/2026",
    views: 621,
    attachments: [pdf("KH_Mua_He_Xanh_2026.pdf", 296960)],
  },
  {
    title: "Hướng dẫn nhập học cho tân sinh viên khoá 2026",
    summary: "Tân sinh viên làm thủ tục nhập học trực tuyến và xác nhận tại trường từ 18/08/2026.",
    content:
      "<p>Chào mừng tân sinh viên khoá 2026. Thủ tục nhập học gồm 2 bước:</p>" +
      "<ol><li>Khai thông tin và nộp hồ sơ trực tuyến trên Cổng Đào tạo.</li>" +
      "<li>Đến trường xác nhận hồ sơ gốc từ 18/08/2026 đến 22/08/2026.</li></ol>",
    categoryCode: "university",
    departmentCode: "PDT",
    authorName: "Phòng Đào tạo",
    startDate: "05/08/2026",
    endDate: "22/08/2026",
    views: 3102,
    attachments: [pdf("HD_Nhap_Hoc_K2026.pdf", 921600), docx("Mau_So_Yeu_Ly_Lich.docx", 40960)],
  },
  {
    title: "Thông báo tuần sinh hoạt công dân đầu khoá năm học 2026-2027",
    summary: "Sinh viên bắt buộc tham gia đủ các buổi sinh hoạt công dân, điểm danh bằng mã QR.",
    content:
      "<p>Tuần sinh hoạt công dân đầu khoá diễn ra từ 31/08/2026 đến 04/09/2026.</p>" +
      "<p>Sinh viên vắng mặt không có lý do sẽ bị trừ điểm rèn luyện học kỳ 1.</p>",
    categoryCode: "student_activity",
    departmentCode: "PCTSV",
    authorName: "Phòng Công tác sinh viên",
    startDate: "24/08/2026",
    endDate: "04/09/2026",
    views: 1876,
  },
  {
    title: "Quy định mới về chuẩn đầu ra tin học áp dụng từ khoá 2026",
    summary: "Sinh viên khoá 2026 cần đạt chứng chỉ ứng dụng CNTT cơ bản trước khi xét tốt nghiệp.",
    content:
      "<p>Từ khoá 2026, chuẩn đầu ra tin học là điều kiện bắt buộc để xét tốt nghiệp.</p>" +
      "<ul><li>Chấp nhận chứng chỉ ứng dụng CNTT cơ bản hoặc chứng chỉ quốc tế tương đương.</li>" +
      "<li>Nhà trường tổ chức thi đánh giá nội bộ 4 đợt mỗi năm.</li></ul>",
    categoryCode: "training",
    departmentCode: "PDBCL",
    authorName: "Phòng ĐBCL&KT",
    startDate: "10/09/2026",
    views: 547,
    attachments: [pdf("QD_Chuan_Dau_Ra_Tin_Hoc.pdf", 348160)],
  },
  {
    title: "Hội thảo khoa học \"Trí tuệ nhân tạo trong giáo dục đại học\"",
    summary: "Hội thảo diễn ra ngày 24/10/2026 tại hội trường lớn, sinh viên đăng ký tham dự miễn phí.",
    content:
      "<p>Phòng Khoa học Công nghệ tổ chức hội thảo về ứng dụng trí tuệ nhân tạo trong dạy và học.</p>" +
      "<p>Sinh viên tham dự được cấp giấy chứng nhận và cộng điểm hoạt động ngoại khoá.</p>",
    categoryCode: "university",
    departmentCode: "PKHCN",
    authorName: "Phòng Khoa học Công nghệ",
    startDate: "01/10/2026",
    endDate: "24/10/2026",
    views: 298,
  },
  {
    title: "Kế hoạch thi giữa kỳ học kỳ 1 năm học 2026-2027",
    summary: "Các học phần thi giữa kỳ trong tuần 9 và tuần 10, giảng viên thông báo hình thức thi trên lớp.",
    content:
      "<p>Thi giữa kỳ học kỳ 1 năm học 2026-2027 tổ chức trong tuần 9 và tuần 10 (02/11/2026 đến 15/11/2026).</p>" +
      "<p>Sinh viên theo dõi thông báo của giảng viên về hình thức và phòng thi.</p>",
    categoryCode: "training",
    departmentCode: "PDBCL",
    authorName: "Phòng ĐBCL&KT",
    startDate: "20/10/2026",
    endDate: "15/11/2026",
    isPinned: true,
    views: 932,
  },
  {
    title: "Giải chạy \"Vì sức khoẻ cộng đồng\" chào mừng ngày Nhà giáo Việt Nam",
    summary: "Sinh viên đăng ký cự ly 5 km hoặc 10 km trước ngày 12/11/2026.",
    content:
      "<p>Giải chạy dành cho cán bộ, giảng viên và sinh viên toàn trường, tổ chức sáng 16/11/2026.</p>" +
      "<p>Sinh viên hoàn thành cự ly được nhận áo kỷ niệm và giấy chứng nhận.</p>",
    categoryCode: "student_activity",
    departmentCode: "PCTSV",
    authorName: "Hội Sinh viên",
    startDate: "28/10/2026",
    endDate: "12/11/2026",
    views: 167,
  },
];
