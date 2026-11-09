// Chương trình đào tạo mẫu. Môn học lấy theo mã trong core.seed.ts của Phi.
// Sinh viên được nối với chương trình qua ngành (majorName) và khoá (cohort) trong bảng students.
const GENERAL = "Giáo dục đại cương";
const FOUNDATION = "Cơ sở ngành";
const MAJOR = "Chuyên ngành";

export const SEED_PROGRAMS = [
  {
    code: "CNTT-K18",
    name: "Đại học chính quy Khoá 18, 4 năm - Công nghệ thông tin",
    majorName: "Công nghệ thông tin",
    cohort: "K18",
    courses: [
      { courseCode: "INT1002", knowledgeBlock: FOUNDATION, semesterNo: 1, isRequired: true },
      { courseCode: "MAT1003", knowledgeBlock: GENERAL, semesterNo: 1, isRequired: true },
      { courseCode: "ENG1002", knowledgeBlock: GENERAL, semesterNo: 1, isRequired: true },
      { courseCode: "PHY1001", knowledgeBlock: GENERAL, semesterNo: 1, isRequired: false },

      { courseCode: "INT2001", knowledgeBlock: FOUNDATION, semesterNo: 2, isRequired: true },
      { courseCode: "INT2002", knowledgeBlock: FOUNDATION, semesterNo: 2, isRequired: true },
      { courseCode: "INT2003", knowledgeBlock: FOUNDATION, semesterNo: 2, isRequired: true },
      { courseCode: "MAT2001", knowledgeBlock: GENERAL, semesterNo: 2, isRequired: true },
      { courseCode: "POL1001", knowledgeBlock: GENERAL, semesterNo: 2, isRequired: true },

      { courseCode: "INT2004", knowledgeBlock: MAJOR, semesterNo: 3, isRequired: true },
      { courseCode: "INT2005", knowledgeBlock: MAJOR, semesterNo: 3, isRequired: true },
      { courseCode: "INT2006", knowledgeBlock: MAJOR, semesterNo: 3, isRequired: true },
      { courseCode: "ENG1003", knowledgeBlock: GENERAL, semesterNo: 3, isRequired: true },
      { courseCode: "MAT2002", knowledgeBlock: FOUNDATION, semesterNo: 3, isRequired: false },
      { courseCode: "POL1002", knowledgeBlock: GENERAL, semesterNo: 3, isRequired: true }
    ]
  }
];
