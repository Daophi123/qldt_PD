# Nhật ký thay đổi (CHANGELOG)

Ghi lại mọi lần thêm, sửa, xoá trong `qldt_web`, kèm ý tưởng và lý do quyết định.
Mục mới nhất nằm trên cùng. Giải thích chi tiết từng phần code nằm ở [GIAITHICHCODE.md](GIAITHICHCODE.md).

Quy ước mỗi mục:

- **Thêm**: tính năng, file, thư viện mới
- **Sửa**: thay đổi hành vi hoặc giao diện đã có
- **Xoá**: những gì bị gỡ bỏ
- **Ý tưởng / quyết định**: vì sao chọn cách này, phương án nào đã cân nhắc và bỏ
- **Việc tiếp theo**: những gì còn dang dở

---

## 2026-11-09 (Phi, trang của Dương): Tra cứu điểm chia hai cột

Phi yêu cầu, Dương đã đồng ý. Claude sửa `GradePage.jsx`, chỉ đổi bố cục, không đổi dữ liệu hay cách tính điểm.

### Sửa
- `pages/GradePage/GradePage.jsx`:
  - Từ màn `lg` (1024px) trở lên chia hai cột: bên trái là khung "Tổng kết toàn khoá" (rộng 280px, đứng yên khi cuộn nhờ `lg:sticky lg:top-4`), bên phải là bảng điểm từng học kỳ.
  - Khung tổng kết: mỗi chỉ số một dòng ngang, tên bên trái, số bên phải (ví dụ "Tín chỉ chương trình ... 44"), các dòng ngăn bằng vạch kẻ mảnh (`divide-y`). Số dùng `tabular-nums` để các chữ số thẳng cột.
  - Màn hẹp hơn vẫn một cột như cũ, tổng kết nằm trên.
  - Lưới thêm `grid-cols-1` (tức `minmax(0,1fr)`). Không có lớp này thì ở màn điện thoại cột duy nhất bị bảng điểm kéo rộng ra 820px, cả trang tràn ngang.
  - Bảng điểm `minWidth` từ 820 xuống 760 để vừa cột phải ở màn 1440px, không hiện thanh cuộn ngang.

### Đã kiểm tra
- Web chạy với API trên bản sao database, đăng nhập `24100001`:
  - 1440x900: tổng kết bên trái, ba học kỳ bên phải, không bảng nào cuộn ngang. Cuộn trang thì khung tổng kết đứng yên ở trên.
  - Khung tổng kết: cả 7 dòng có tên và số nằm cùng một hàng, số canh thẳng mép phải.
  - 1280x800: trang không tràn, bảng điểm cuộn ngang 105px trong khung của nó.
  - 390px: một cột, trang không tràn ngang.
- `oxlint` sạch, `vite build` thành công.
- Ảnh: `test/tra-cuu-diem-1-hai-cot.png`, `test/tra-cuu-diem-2-mobile.png`.

---

## 2026-11-09 (Phi): Đăng ký học, cho đăng ký học cải thiện học phần đã qua

### Sửa
- API `registration.service.ts`: bỏ điều kiện chặn "Bạn đã qua học phần này" trong `getBlockReason`. Học phần đã qua giờ đăng ký được để học cải thiện điểm, vẫn phải qua các kiểm tra còn lại (thời gian, tín chỉ tối đa, trùng lịch, hết chỗ...).
- Web:
  - `registrationText.js`: `getCourseBlock` không còn coi học phần đã qua là bị chặn.
  - `CourseOfferingCard.jsx`: học phần đã qua có nhãn "Học cải thiện" và dòng "Bạn đã qua học phần này. Đăng ký lại để học cải thiện điểm." (chữ xám, không phải chữ đỏ báo lỗi). Bỏ nhãn "Đã qua".
  - `EligibleFilterBox.jsx`: dòng giải thích đổi thành "Ẩn học phần chưa đạt học phần tiên quyết", vì học phần đã qua giờ cũng tính là đủ điều kiện.
  - `registrationText.js`: khoảng ký tự dấu trong `normalizeText` viết lại bằng mã `\u0300-\u036f` thay cho ký tự dấu thật (chạy như nhau, nhưng ký tự dấu thật không nhìn thấy trong trình soạn thảo).

### Ý tưởng / quyết định
- Phi chốt: học phần đã qua vẫn được học cải thiện để lên điểm.
- Lần học cải thiện là một lượt đăng ký mới (một dòng `enrollments` mới, lớp khác của học kỳ khác). Điểm của lần học này do phần Tra cứu điểm của Dương tính (bảng điểm của Dương đã có cột lần học `attempt`). Cách lấy điểm nào khi học cải thiện (điểm cao nhất hay điểm lần sau) cần thống nhất với Dương.

### Đã kiểm tra
- `tsc` của API không lỗi, `oxlint` sạch, `vite build` thành công.
- Web chạy với API trên bản sao database, đăng nhập `24100001`, 2627-HK2: ENG1002 (đã qua) hiện nhãn "Học cải thiện", nút Đăng ký bấm được, đăng ký thành công "Đã đăng ký lớp ENG1002-01, Tiếng Anh 2.". Ô lọc báo 5/7 học phần đủ điều kiện (bản sao này chưa có lớp PHY1001 học kỳ 2 vì database thật chưa chạy lại seed).
- Ảnh: `test/dang-ky-hoc-5-cai-thien.png`.

---

## 2026-11-09 (Phi): Đăng ký học, ô lọc "Chỉ hiện học phần đủ điều kiện"

### Thêm
- `CourseRegistrationPage/EligibleFilterBox.jsx`: ô mới nằm ngay dưới khung "Học phần đã đăng ký", có ô tick "Chỉ hiện học phần đủ điều kiện" và dòng ghi số học phần đủ điều kiện (ví dụ 5/8).
- Học phần **đủ điều kiện** là học phần chưa qua và đã đạt hết học phần tiên quyết (`getCourseBlock` trả về `null`). Lớp hết chỗ hay trùng lịch vẫn hiện, vì đó là chuyện của từng lớp, không phải của học phần.

### Sửa
- `RegisteredPanel.jsx`: nhận thêm `children` để đặt ô lọc giữa khung lớp đã đăng ký và nút "Xem trước thời khoá biểu".
- `CourseRegistrationPage.jsx`: thêm `onlyEligible`, lọc cùng lúc với ô tìm kiếm và bộ lọc "Tất cả / Còn đăng ký được / Đã đăng ký".

### Đã kiểm tra
- Web chạy với API trên bản sao database, đăng nhập `24100001`, học kỳ 2627-HK2: 8 học phần, tick vào còn 5 (ẩn ENG1002 đã qua, INT2004 và INT2005 thiếu tiên quyết). Tick kèm bộ lọc "Đã đăng ký" còn 3. Bỏ tick hiện lại đủ 8.
- 390px: ô tick nằm trên danh sách, vùng bấm cao 65px, không tràn ngang. `oxlint` sạch, `vite build` thành công.
- Ảnh: `test/dang-ky-hoc-4-loc-du-dieu-kien.png`.

---

## 2026-11-09 (Phi): Đăng ký học, Tra cứu kết quả đăng ký, Đổi mật khẩu, ghép Trang chủ

Phi nhờ Claude viết thẳng phần còn lại sau khi Dương xong phần của mình ("hãy code thực hiện nốt phần của tôi"). Code không có chú thích.

### Thêm
- **API Đăng ký học** (`/api/v1/registrations`, cần đăng nhập, chỉ sinh viên có hồ sơ):
  - `GET /registrations?semesterCode=`: học phần và lớp mở trong kỳ, lớp đã đăng ký, tổng tín chỉ, quy định. Bỏ `semesterCode` thì lấy đợt đang mở (nếu không có thì đợt sắp mở gần nhất, sau cùng là đợt vừa kết thúc).
  - `POST /registrations` (`{ classSectionId }`): đăng ký lớp.
  - `DELETE /registrations/:enrollmentId`: huỷ lớp (chuyển trạng thái sang `cancelled`, không xoá dòng).
  - `GET /registrations/history?semesterCode=`: kết quả đăng ký, gồm cả lớp đã huỷ.
  - File: `services/registration.service.ts`, `controllers/registration.controller.ts`, `routes/registration.route.ts`, `validations/registration.validation.ts`, một dòng trong `routes/index.ts`.
- **Trang Đăng ký học** (`/register-online/course-registration`): `CourseRegistrationPage.jsx`, `CourseOfferingCard.jsx`, `RegisteredPanel.jsx`, `registrationText.js`.
  - Bên trái: học phần mở trong kỳ, mỗi học phần một bảng lớp (lịch, phòng, giảng viên, sĩ số, nút Đăng ký / Huỷ). Tìm theo mã hoặc tên (không dấu cũng được), lọc "Còn đăng ký được" / "Đã đăng ký".
  - Bên phải: lớp đã đăng ký, thanh tín chỉ `x / 24`, nhắc còn thiếu bao nhiêu để đủ 14, nút "Xem trước thời khoá biểu" mở Lịch học của đúng học kỳ đó.
  - Huỷ lớp phải xác nhận qua hộp thoại. Kết quả đăng ký / huỷ hiện ở dòng thông báo (`role="status"`).
- **Trang Tra cứu kết quả đăng ký** (`/register-online/registration-of-course`): chọn học kỳ, bảng lớp đã đăng ký và đã huỷ, thời điểm đăng ký / huỷ, tổng tín chỉ.
- **Trang Đổi mật khẩu** (`/change-password`): mật khẩu hiện tại, mật khẩu mới, nhập lại. Đổi xong thì đăng xuất, trang đăng nhập hiện "Đã đổi mật khẩu. Hãy đăng nhập lại bằng mật khẩu mới." (`utils/loginNotice.js`).
- **Trang chủ**: ghép 5 khối. Khối của Phi: `TodayScheduleWidget` (Lịch học hôm nay), `LatestNewsWidget` (Tin tức mới), `TodoWidget` (Việc cần làm: hạn đăng ký học, số tín chỉ còn thiếu), khung chung `WidgetFrame`. Khối của Dương giữ nguyên: `UpcomingExamsWidget`, `GradeSummaryWidget`. Tài khoản quản trị chỉ thấy Tin tức mới.
- Component dùng chung `components/ui/ConfirmDialog.jsx` (hộp thoại xác nhận bằng thẻ `<dialog>`).

### Sửa
- `Button.jsx`: thêm kiểu `danger` (nền đỏ) và `dangerOutline` (viền đỏ). Kiểu cũ giữ nguyên.
- `LoginPage.jsx`: hiện thông báo sau khi đổi mật khẩu.
- `ProtectedRoute.jsx`: không nhớ trang `/change-password` để quay lại sau khi đăng nhập (nếu nhớ thì đăng nhập lại xong sẽ quay về trang Đổi mật khẩu).
- `routes/index.jsx`: 3 trang thật thay `ComingSoonPage`.
- `seeds/core.seed.ts`: thêm lớp `2627-HK2-PHY1001-01` (Thứ 4, tiết 2-4). Lý do: điểm mẫu của Dương cho ENG1002 qua và PHY1001 bị F, nên kịch bản "Học lại" phải dùng PHY1001. Lớp này trùng lịch với `INT2006-01`, để thử luôn trường hợp trùng lịch. Database cũ chỉ cần gọi lại `POST /api/v1/academic/seed` (thêm 1 bản ghi).

### Ý tưởng / quyết định
- **Quy tắc đăng ký** (chưa chốt khi họp, Claude đặt tạm, sửa ở `REGISTRATION_RULES`): tối đa 24 tín chỉ (chặn khi đăng ký), tối thiểu 14 (chỉ nhắc, không chặn vì sinh viên đăng ký từng lớp).
- **Thứ tự kiểm tra khi đăng ký**: ngoài thời gian đăng ký, lớp huỷ / đóng, đã đăng ký lớp này, đã đăng ký lớp khác cùng học phần, đã qua học phần, thiếu tiên quyết, vượt 24 tín chỉ, trùng lịch, hết chỗ. Một hàm `getBlockReason` dùng cho cả hai chỗ: lúc trả danh sách (để web làm mờ nút và ghi lý do) và lúc đăng ký thật (để chặn ở API). Web và API không thể nói khác nhau.
- **Tiên quyết = đã qua**, lấy qua `GradeService.getPassedCourseIds` của Dương, không đọc thẳng bảng điểm. Học phần tiên quyết đang học (chưa có điểm) vẫn bị chặn, web ghi rõ "đang học, chưa có điểm".
- **Học lại**: đã học ở học kỳ đã kết thúc mà không có trong danh sách đã qua.
- **Đăng ký chạy trong transaction**: đếm sĩ số và tạo bản ghi trong cùng một transaction để hai người bấm cùng lúc không vượt sĩ số.
- **Huỷ là đổi trạng thái**, không xoá. Đăng ký lại đúng lớp đó thì bật lại bản ghi cũ (bảng có khoá duy nhất sinh viên + lớp).
- Sau mỗi lần đăng ký / huỷ, trang tải lại toàn bộ danh sách để sĩ số, trùng lịch, tín chỉ luôn khớp với API.

### Đã kiểm tra
- `tsc` của API không lỗi. Web: `oxlint` sạch, `vite build` thành công.
- API chạy trên **bản sao database** (cổng 4099), database thật không bị đổi:
  - 24100001, 2627-HK2: đăng ký INT2006, MAT2002, ENG1003 thành công. PHY1001 bị chặn "Trùng lịch với lớp 2627-HK2-INT2006-01 (Thứ 4, tiết 1-3)". POL1002 "Lớp đã hết chỗ". INT2005 "Chưa đạt học phần tiên quyết INT2001". ENG1002 "Bạn đã qua học phần này". Đăng ký lại cùng lớp "Bạn đã đăng ký lớp này". Lớp học kỳ 1 "Đã hết thời gian đăng ký".
  - Huỷ INT2006 rồi đăng ký PHY1001 được, sau đó INT2006 lại bị trùng lịch với PHY1001. Huỷ lần hai báo "đã được huỷ trước đó". Sinh viên khác huỷ lượt của 24100001 bị 404. Admin bị 404 "không có hồ sơ sinh viên". Thiếu `classSectionId` báo "Chưa chọn lớp học phần".
- Web chạy với API bản sao, đăng nhập thật:
  - Đăng ký học: hộp thoại huỷ mở, Esc đóng, nút "Giữ lại" được focus sẵn. Huỷ và đăng ký hiện đúng thông báo, thanh tín chỉ cập nhật. Tìm "cong nghe" ra INT2006. Ở 390px không tràn ngang, khung lớp đã đăng ký nằm trên.
  - Tra cứu kết quả đăng ký: học kỳ 2 có 4 dòng (1 lớp đã huỷ), học kỳ 1 có 6 dòng, tổng 15 tín chỉ.
  - Đổi mật khẩu: bỏ trống, nhập lại sai, sai mật khẩu hiện tại đều báo dưới đúng ô và focus vào ô lỗi. Đổi thành công thì về trang đăng nhập có thông báo, mật khẩu cũ bị từ chối, mật khẩu mới vào được và về Trang chủ.
  - Trang chủ: sinh viên thấy đủ 5 khối, admin chỉ thấy Tin tức mới. 390px không tràn ngang.
- Ảnh: `test/dang-ky-hoc-1.png`, `dang-ky-hoc-2-huy.png`, `dang-ky-hoc-3-mobile.png`, `ket-qua-dang-ky.png`, `doi-mat-khau-0.png`, `doi-mat-khau-1-loi.png`, `doi-mat-khau-2-dang-nhap-lai.png`, `trang-chu-1.png`, `trang-chu-2-mobile.png`.
- Chưa thử: hai sinh viên cùng bấm vào chỗ cuối cùng của một lớp, chạm mức 24 tín chỉ (dữ liệu mẫu học kỳ 2 chỉ có tối đa 17 tín chỉ đăng ký được).

### Việc tiếp theo
- Chốt với Dương quy tắc tín chỉ tối thiểu / tối đa và việc có cho đăng ký khi học phần tiên quyết đang học hay không.
- Báo Dương: thêm lớp PHY1001 học kỳ 2 vào `core.seed.ts`, cần gọi lại `POST /api/v1/academic/seed`.
- Chạy `git rm --cached qldt_api/data/dbqldt.sqlite` (file vẫn đang được git theo dõi).

---

## 2026-11-09 (Dương): Khối trang chủ "Lịch thi sắp tới", "Kết quả học tập" và component `SearchInput`, `Select`

### Thêm
- `pages/HomePage/widgets/UpcomingExamsWidget.jsx`: tối đa 3 môn thi từ hôm nay trở đi của học kỳ hiện tại (gọi `examApi.getMySchedule()` không truyền học kỳ). Mỗi dòng: ngày, thứ, giờ, tên môn, phòng và số báo danh (hoặc "Chưa xếp phòng"). Link "Xem tất cả" sang `/schedule/exam`.
- `pages/HomePage/widgets/GradeSummaryWidget.jsx`: điểm TB tích luỹ hệ 4 và hệ 10, tín chỉ tích luỹ / tín chỉ chương trình, tín chỉ đã học (gọi `gradeApi.getMyGrades()`, chỉ dùng `summary`). Link "Xem bảng điểm" sang `/study-corner/grade`.
- Cả hai khối tự lo trạng thái đang tải, lỗi, rỗng; không nhận props. **Chưa ghép vào `HomePage.jsx`**, việc ghép là của Phi.
- `components/form/SearchInput.jsx`: ô tìm kiếm có kính lúp, nhãn ẩn (`sr-only`), `onSubmit` không bắt buộc (gọi khi nhấn Enter).
- `components/form/Select.jsx`: ô chọn có nhãn ẩn, `children` là các `<option>`.
- `components/form/controlClass.js`: chuỗi class chung của hai component trên.
- `pages/ExamSchedulePage/examDate.js`: `getWeekday`, `toSortable`, `getTodaySortable` (tách từ trang Lịch thi để khối trang chủ dùng lại).

### Sửa
- Văn bản, Lịch thi, Chương trình học: thay ô `<input type="search">` và `<select>` tự viết bằng `SearchInput`, `Select`. Hành vi giữ nguyên (Văn bản tìm khi nhấn Enter, Chương trình học lọc ngay khi gõ). Ô có thêm kính lúp và viền sáng khi chọn, giống ô tìm của Tin tức.
- `PHANCHIA.md`: thêm `SearchInput`, `Select` vào dòng "Đã có" của bảng component.

### Ý tưởng / quyết định
- Không sửa `HomePage.jsx` và `NewsFilters.jsx` vì là file của Phi. Phi tự đổi Tin tức sang `SearchInput`, `Select` khi muốn.
- Khối trang chủ gọi lại API đã có, không thêm API mới.
- Admin không có hồ sơ sinh viên nên hai khối hiện lỗi "Tài khoản này không có hồ sơ sinh viên". Đề nghị Phi chỉ hiện hai khối khi `user.role === 'student'`.

### Đã kiểm tra
- `oxlint` sạch, `vite build` thành công.
- Trình duyệt 1280x900, `24100001`: gắn tạm hai khối vào trang Lịch thi để xem (đã gỡ, `HomePage.jsx` không đổi). "Lịch thi sắp tới" hiện 04/01, 06/01, 08/01/2027 đúng phòng và số báo danh. "Kết quả học tập": 3,00 / 7,57 / 9 / 44 / 12, khớp trang Tra cứu điểm.
- Admin: hai khối hiện thông báo lỗi, trang không vỡ.
- Văn bản: tìm "quy chế" + Enter còn 1 dòng (từ 8), lọc "Biểu mẫu" còn 3 dòng. Chương trình học: gõ "INT" còn 7 dòng, nhấn Enter không tải lại trang. Lịch thi: ô chọn học kỳ đủ 3 học kỳ.
- Chưa thử: điện thoại; khối trang chủ khi đã ghép thật vào `HomePage.jsx`.

### Việc tiếp theo
- Phi ghép hai khối vào `HomePage.jsx`.

---

## 2026-11-09 (Dương): Tra cứu điểm (API + web) và hàm `getPassedCourseIds`

### Thêm
- API: bảng `grades` (một dòng điểm cho một lần đăng ký lớp: điểm quá trình, điểm thi).
  - File mới: `models/grade/grade.model.ts`, `seeds/grade.seed.ts`, `services/grade.service.ts`, `controllers/grade.controller.ts`, `routes/grade.route.ts`.
  - **`GradeService.getPassedCourseIds(studentId)`** (cho Đăng ký học của Phi): nhận `students.id`, trả mảng `courses.id` sinh viên đã qua (điểm tổng hệ 10 từ 4,0 trở lên, chỉ tính đăng ký `registered`).
  - `GET /api/v1/grades/my`: bảng điểm của sinh viên đang đăng nhập. Gồm thông tin sinh viên, tổng kết toàn khoá và các học kỳ (mới nhất trước), mỗi học kỳ có danh sách học phần và tổng kết học kỳ.
  - `POST /api/v1/grades/seed` (admin, chỉ development): 4 điểm của `24100001` ở 2526-HK2, PHY1001 bị F.
- Web: `apis/gradeApi.js`, `pages/GradePage/GradePage.jsx`, `GradeDialog.jsx` (cửa sổ chi tiết điểm), `formatScore.js`, trang `/study-corner/grade`.

### Sửa
- `models/index.ts` (thêm `GradeModel.belongsTo(EnrollmentModel)`, `EnrollmentModel.hasOne(GradeModel, as "grade")`), `routes/index.ts`, `routes/index.jsx`: chỉ thêm dòng.

### Ý tưởng / quyết định
- Nội dung theo ảnh trang thật Dương gửi (bảng theo học kỳ, lần học, hệ 10, hệ 4, điểm chữ, đánh giá, chi tiết, tổng kết học kỳ, tổng điểm toàn khoá). Giao diện theo kiểu dự án. Bỏ các tab (học phần nợ, quyết định...) và khung thông tin cá nhân bên trái; thông tin sinh viên đưa lên dòng mô tả, tổng kết toàn khoá đưa lên trên để bảng đủ rộng.
- Chỉ lưu điểm quá trình và điểm thi. Điểm tổng = 30% quá trình + 70% thi (làm tròn 1 chữ số), điểm chữ và hệ 4 tính trong service theo bảng `SCALE`. Đổi cách tính chỉ sửa 1 chỗ.
- Qua môn: điểm tổng từ 4,0 (điểm D).
- Điểm TB học kỳ tính trên các môn có điểm (kể cả trượt). Điểm TB tích luỹ và tín chỉ tích luỹ chỉ tính môn đã qua, cộng dồn đến hết học kỳ đó.
- Học kỳ đang học vẫn hiện, các môn ghi "Chưa có điểm".
- Không thêm dữ liệu vào `enrollments` của Phi, nên điểm mẫu chỉ có một học kỳ, "lần học" đều là 1.
- **Ảnh hưởng tới Phi:** khi Phi gọi `getPassedCourseIds`, PHY1001 của `24100001` sẽ là "chưa qua". Kịch bản điểm mẫu (PHANCHIA Bước 0) cần Phi xác nhận.

### Đã kiểm tra
- `tsc` không lỗi. `oxlint` sạch, `vite build` thành công.
- API thật: seed thêm 4, lần 2 không thêm gì. Điểm tổng 7,7 / 6,3 / 8,7 / 3,3 khớp tính tay. Học kỳ 2526-HK2: TB hệ 10 = 6,50, hệ 4 = 2,25, tích luỹ 9 tín chỉ, TB tích luỹ 7,57 / 3,00. Admin 404, chưa đăng nhập 401, sinh viên gọi seed 403.
- `getPassedCourseIds` chạy thật bằng `tsx` (file thử để ngoài dự án): `24100001` trả 3 học phần ENG1002, INT1002, MAT1003; `24100002` trả 0.
- Trình duyệt 1280x800: đủ 10 cột, 2 học kỳ. Bấm "Chi tiết" PHY1001 ra cửa sổ điểm quá trình 5,0, thi 2,5, tổng 3,3, F, Học lại. Esc đóng được.
- Chưa thử: điện thoại, sinh viên không có học phần nào.

### Việc tiếp theo
- Báo Phi hàm `getPassedCourseIds` đã có, để dùng trong Đăng ký học.
- Chương trình học: thêm trạng thái "Đã qua" bằng hàm này.
- Khối "Kết quả học tập" cho Trang chủ.

---

## 2026-11-09 (Dương): Chương trình học (API + web)

### Thêm
- API: bảng `programs` (chương trình đào tạo: mã, tên, ngành, khoá) và `program_courses` (học phần trong chương trình: khối kiến thức, học kỳ dự kiến, bắt buộc hay tự chọn).
  - File mới: `models/program/program.model.ts`, `models/program/programCourse.model.ts`, `seeds/program.seed.ts`, `services/program.service.ts`, `controllers/program.controller.ts`, `routes/program.route.ts`.
  - `GET /api/v1/programs/my`: chương trình của sinh viên đang đăng nhập, tìm theo `majorName` + `cohort` trong `students`. Trả thông tin chương trình, tổng tín chỉ, danh sách khối kiến thức (số học phần, số tín chỉ) và các học phần kèm học phần tiên quyết, học kỳ thực tế.
  - `POST /api/v1/programs/seed` (admin, chỉ development): chương trình `CNTT-K18` gồm 15 học phần của `core.seed.ts`.
- Web: `apis/programApi.js`, `pages/ProgramPage/ProgramPage.jsx` ở `/study-corner/program`. Ô tìm theo mã hoặc tên (lọc ngay trên trình duyệt), bảng 8 cột. Hàng thẻ "Khối kiến thức" phía trên bảng, bấm vào một khối mở cửa sổ (`BlockDialog.jsx`, thẻ `<dialog>`) liệt kê học phần của khối đó: STT, mã, tên, số tín chỉ, học kỳ dự kiến, bắt buộc / tự chọn, nút "Quay lại".

### Sửa
- `models/index.ts`, `routes/index.ts` (API) và `routes/index.jsx` (web): chỉ thêm dòng của Chương trình học.

### Ý tưởng / quyết định
- Nội dung theo ảnh trang thật Dương gửi (STT, mã, tên, khối, tín chỉ, điều kiện, học kỳ dự kiến, học kỳ thực tế, các khối kiến thức). Giao diện theo kiểu dự án. Bỏ LT/TH, tín chỉ học phí, nút chi tiết, nhóm khối lựa chọn.
- Không có validation vì đường dẫn không nhận tham số.
- Tiên quyết đọc từ `course_prerequisites` của Phi qua quan hệ `prerequisites` có sẵn (chỉ đọc).
- "Học kỳ thực tế" lấy từ `enrollments` đã đăng ký (bỏ lớp huỷ). Khi có bảng điểm sẽ phân biệt "đã qua" bằng `getPassedCourseIds`.
- Không có ô chọn chương trình vì mỗi sinh viên chỉ có một chương trình.

### Đã kiểm tra
- `tsc` không lỗi. `oxlint` sạch, `vite build` thành công.
- API thật: seed thêm 15, lần 2 không thêm gì. `24100001` ra 15 học phần, 44 tín chỉ, 3 khối (đại cương 7/20, cơ sở ngành 5/15, chuyên ngành 3/9). Tiên quyết đúng (INT2001 cần INT1002...). Học kỳ 1–2 có học kỳ thực tế, học kỳ 3 chưa học. Admin 404, chưa đăng nhập 401, sinh viên gọi seed 403.
- Trình duyệt 1440x900 và 1280x800: bảng hiện đủ 8 cột, không cuộn ngang. Gõ "tiếng anh" còn 2 học phần.
- Bấm khối "Chuyên ngành" ra 3 học phần, "Giáo dục đại cương" ra 7. Đóng được bằng Esc, nút "Quay lại", nút X và bấm ra vùng tối.
- Sửa sau khi Dương thử: bản đầu đặt khung khối ở cột bên phải, trên màn hình hẹp bảng bị mất cột "Điều kiện" trở đi. Đã chuyển khối lên trên bảng.
- Chưa thử: điện thoại, tìm không ra kết quả.

### Việc tiếp theo
- Thêm cột hoặc trạng thái "Đã qua" khi làm Tra cứu điểm.

---

## 2026-11-09 (Dương): Lịch thi (API + web)

### Thêm
- API: bảng `exams` (lịch thi của một lớp học phần: ngày, giờ bắt đầu, số phút, hình thức) và bảng `exam_rooms` (sinh viên nào thi phòng nào, số báo danh mấy).
  - File mới: `models/exam/exam.model.ts`, `models/exam/examRoom.model.ts`, `seeds/exam.seed.ts`, `validations/exam.validation.ts`, `services/exam.service.ts`, `controllers/exam.controller.ts`, `routes/exam.route.ts`.
  - `GET /api/v1/exams?semesterCode=2627-HK1`: lịch thi của sinh viên đang đăng nhập, chỉ các lớp đã đăng ký (`registered`) và lớp chưa huỷ. Không gửi `semesterCode` thì lấy học kỳ hiện tại. Sắp xếp theo ngày rồi giờ.
  - `POST /api/v1/exams/seed` (admin, chỉ development): 9 lịch thi mẫu cho `24100001` ở 2526-HK2 và 2627-HK1. Môn POL1001 cố ý chưa xếp phòng.
- Web: `apis/examApi.js`, `pages/ExamSchedulePage/ExamSchedulePage.jsx` ở `/schedule/exam`. Ô chọn học kỳ và bảng 7 cột: Ngày thi, Giờ, Học phần, Hình thức, Phòng, Số báo danh, Trạng thái (Đã xếp phòng / Chờ xếp phòng / Đã thi).

### Sửa
- `models/index.ts`, `routes/index.ts` (API) và `routes/index.jsx` (web): chỉ thêm dòng của Lịch thi, không đổi phần của Phi.

### Ý tưởng / quyết định
- Làm đơn giản, chỉ cho máy tính, giống Văn bản. Chưa làm các tab Sắp thi / Đã thi / Thi lại, nút In và Xuất lịch như mockup `test/mockups/lich-thi.html`.
- Một lớp học phần có một lịch thi (`class_section_id` không trùng). Thi lại để sau.
- Danh sách học kỳ dùng `scheduleApi.getSemesters()` của Phi (chỉ đọc), lấy lớp đã đăng ký qua `enrollments` giống Lịch học của Phi.

### Đã kiểm tra
- `npm run build` (API) không lỗi. `oxlint` sạch, `vite build` thành công.
- API thật: seed thêm 9, gọi lần 2 không thêm gì. 2627-HK1 ra 5 môn đúng thứ tự ngày, POL1001 không có phòng. 2526-HK2 ra 4 môn, 2627-HK2 ra 0. Sai mã học kỳ trả 404, chưa đăng nhập 401, sinh viên gọi seed 403.
- Trình duyệt (1440px, tài khoản `24100001`): 3 học kỳ hiện đúng 3 trạng thái (Đã xếp phòng / Chờ xếp phòng, Đã thi, Chưa có lịch thi). Thứ trong tuần đúng (04/01/2027 là Thứ 2).
- Chưa thử: điện thoại, tài khoản admin vào trang.

### Việc tiếp theo
- Dữ liệu cũ: chạy `POST /api/v1/exams/seed` bằng tài khoản admin sau khi đã seed học vụ.
- Sau này: tab thi lại, khối "Lịch thi sắp tới" cho Trang chủ.

---

## 2026-11-09 (Dương): Văn bản (API + web)

### Thêm
- API: bảng `documents` và `document_files`; `GET /api/v1/documents` (lọc theo từ khoá, loại, đơn vị, có chia trang), `POST /api/v1/documents/seed` (admin, 8 văn bản mẫu, cần seed tin tức trước để có đơn vị).
- Web: `apis/documentApi.js`, `pages/DocumentPage/DocumentPage.jsx` ở `/document`: ô tìm, ô chọn loại, ô chọn đơn vị, bảng 6 cột có link tải tệp.

### Sửa
- `routes/index.ts`: đường dẫn API sửa từ `/document` thành `/documents` cho khớp `documentApi.js` (trước đó web báo 404).

### Ý tưởng / quyết định
- Bản đơn giản, chỉ cho máy tính. Web lấy tối đa 100 văn bản, chưa chia trang. Chưa tách `SearchInput`, `Select`.
- Đơn vị ban hành đọc qua `newsApi.getDepartments()` của Phi. Tệp văn bản để bảng riêng, không dùng chung `attachments` của tin tức.

### Đã kiểm tra
- Seed thêm 8 văn bản, danh sách trả đủ 8, mới nhất đứng đầu. Dương mở trang trên trình duyệt thấy đúng.

---

## 2026-11-03 (Phi): Lịch học gọn phần đầu trang

### Sửa
- `ClassSchedulePage.jsx`:
  - Bỏ `PageHeader` (đường dẫn "Thời khóa biểu > Lịch học", tiêu đề "Lịch học", dòng "Học kỳ 1, năm học ... tín chỉ"). Giữ một `<h1 className="sr-only">Lịch học</h1>` cho trình đọc màn hình.
  - Ô chọn học kỳ và nút Tuần / Danh sách nhỏ lại, nằm chung một hàng: ô chọn cao 36px, nút cao 28px, chữ 14px. Nhãn "Học kỳ" chuyển thành `sr-only` (vẫn nối với ô chọn qua `htmlFor`).
  - Trên điện thoại vẫn giữ vùng bấm 44px (ô chọn `h-11`, nút `h-10`), chỉ thu nhỏ từ `sm` trở lên.
  - Đặt lại khung cao đúng màn hình cho kiểu Tuần (`fitScreen`), vì bản trong máy đã mất phần này. Dòng ghi chú giờ tiết ở cuối trang Phi đã tự bỏ, giữ nguyên.
- `WeekView.jsx`: hàng giờ tối thiểu từ 36px xuống 35px (`minmax(455px,1fr)`), để màn hình 1280x720 không phải cuộn lịch.

### Đã kiểm tra
- 1440x900 và 1280x720: trang không cuộn, lịch không cuộn. 390px không tràn ngang.
- `oxlint` sạch, `vite build` thành công. Cập nhật ảnh `test/lich-hoc-1-tuan.png`, `test/lich-hoc-3-mobile.png`.

---

## 2026-11-02 (Phi): Lịch tuần vừa màn hình, không cuộn cả trang

### Sửa
- `ClassSchedulePage.jsx`: ở kiểu Tuần, trên máy tính (`lg`) trang cao đúng màn hình (`lg:h-[calc(100dvh-5.75rem)] lg:-mb-7`, giống trang Tin tức). Phần lịch chiếm chỗ còn lại (`flex-1 min-h-0`). Kiểu Danh sách và điện thoại giữ như cũ.
- `WeekView.jsx`:
  - Bỏ chiều cao cố định 56px mỗi giờ. Lưới giãn theo chỗ trống, vị trí buổi học tính bằng phần trăm.
  - Hàng giờ tối thiểu 36px (`minmax(468px,1fr)` cho 13 giờ). Màn hình thấp hơn thì chỉ khung lịch cuộn, hàng tiêu đề thứ dính trên cùng (`sticky top-0`).
  - Nội dung ô buổi học theo số tiết: 3 tiết trở lên hiện tên, giờ, phòng. 2 tiết hiện tên và một dòng "phòng, giờ". 1 tiết chỉ hiện tên. Di chuột vào ô thấy đủ thông tin (`title`).

### Ý tưởng / quyết định
- Phi muốn không cuộn trang, nếu khó thì cuộn trong lịch. Làm cả hai: đủ cao thì không cuộn gì, không đủ thì chỉ lịch cuộn, trang không cuộn.

### Đã kiểm tra
- 1440x900 và 1920x1080: trang và lịch đều không cuộn. 1280x720: trang không cuộn, lịch cuộn 159px, tiêu đề thứ đứng yên.
- Không ô buổi học nào bị cắt chữ giữa dòng. Kiểu Danh sách không cuộn trang. 390px không tràn ngang.
- `oxlint` sạch, `vite build` thành công. Cập nhật ảnh `test/lich-hoc-1-tuan.png`.

---

## 2026-11-02 (Phi): Trang Lịch học

### Thêm
- Trang `/schedule/class` (menu Thời khóa biểu > Lịch học). Phi tự gõ theo code mẫu, Claude sửa lỗi sau khi rà ("sửa hộ").
  - `src/apis/scheduleApi.js`: `getSemesters()` gọi `GET /academic/semesters`, `getClassSchedule(semesterCode)` gọi `GET /schedules/class`.
  - `src/utils/schedule.js`: hàm thuần cho ngày tháng (`parseVnDate`, `startOfWeek`, `addDays`, `weeksBetween`, `formatDayMonth`...) và nhãn thứ (`DAY_LABELS`, 8 là Chủ nhật).
  - `src/pages/ClassSchedulePage/ClassSchedulePage.jsx`: chọn học kỳ, chuyển kiểu xem Tuần / Danh sách, đủ trạng thái đang tải, lỗi, rỗng.
  - `WeekView.jsx`: lưới tuần theo giờ (06:00 đến 19:00) trên máy tính, danh sách theo ngày trên điện thoại, nút tuần trước / tuần sau / tuần này.
  - `CourseListView.jsx`: bảng học phần dùng `DataTable`, dòng tổng tín chỉ.
- `routes/index.jsx`: thêm `/schedule/class` vào `BUILT_PATHS` và route thật thay `ComingSoonPage`.

### Sửa (sau khi rà code Phi gõ)
- API trả 404 vì route gắn ở `/schedule`, web gọi `/schedules`. Đổi thành `routes.use("/schedules", ...)` trong `qldt_api/src/routes/index.ts`.
- `schedule.service.ts`: include `as: "sessions"` dùng nhầm `ClassSectionModel`, đổi thành `ClassSessionModel`. Sửa chữ "Tài khoảng".
- `ClassSchedulePage.jsx`:
  - Toàn bộ nội dung bị bọc trong `<PageHeader>...</PageHeader>`, mà `PageHeader` không hiện `children`, nên trang chỉ có tiêu đề. Đổi thành `<PageHeader ... />` tự đóng.
  - `semesters.data?.item` thành `items` (ô chọn học kỳ bị rỗng).
  - Nhãn học kỳ: thêm năm học, "(hiện tại)" chỉ gắn cho học kỳ có `code === currentCode`.
  - Thiếu `import { Link }` (trạng thái rỗng sẽ lỗi).
- `WeekView.jsx`:
  - `item.session` thành `item.sessions` (lỗi `item.session is not iterable`, trang trắng).
  - 7 ô tiêu đề thứ bị lồng trong ô góc trái, và thiếu cột giờ. Tách ô góc thành `<div ... />`, thêm cột giờ.
  - Nút mũi tên tuần: `px-0` thua `px-4` của `Button` nên icon bị bóp còn 6px. Đổi thành `px-0!`.
- `CourseListView.jsx`: "Danh sach" thành "Danh sách" trong `caption`.

### Ý tưởng / quyết định
- **Giờ tiết lấy từ API** (`period.util.ts` của Phi: tiết 1 lúc 06:45, tiết 7 lúc 13:00, mỗi tiết 50 phút, nghỉ 5 phút). Lưới tuần bắt đầu từ 06:00 (`START_HOUR = 6`) để buổi 06:45 không bị cắt.
- **Học kỳ và kiểu xem nằm trên URL** (`?semester=2627-HK1&view=list`): tải lại trang hoặc gửi link vẫn giữ nguyên.
- **Tuần mở ra đầu tiên** là tuần hiện tại nếu hôm nay thuộc học kỳ, không thì tuần đầu học kỳ.

### Đã kiểm tra
- Chạy API và web thật, đăng nhập `24100001`:
  - Ô học kỳ có 3 học kỳ, 2627-HK1 có "(hiện tại)". Tuần 9 (02/11 đến 08/11/2026) có 6 buổi, buổi 06:45 nằm đúng vị trí.
  - Kiểu Danh sách có 5 dòng, tổng 15 tín chỉ.
  - Ở 390px là danh sách theo ngày, trang không tràn ngang. Không có lỗi console.
- `oxlint` sạch, `vite build` thành công, `tsc` của API không lỗi.
- Ảnh chụp: `test/lich-hoc-1-tuan.png`, `test/lich-hoc-2-danh-sach.png`, `test/lich-hoc-3-mobile.png`.

### Việc tiếp theo
- Sửa chữ "Không tin thấy học kỳ" thành "Không tìm thấy học kỳ" trong `academic.service.ts`.

---

## 2026-11-02 (Phi): Component bảng dùng chung `DataTable`

### Thêm
- `src/components/ui/DataTable.jsx`: bảng dữ liệu dùng chung cho Văn bản, Tra cứu điểm, Lịch thi (Dương) và Đăng ký học (Phi). Phi tự gõ theo code mẫu.
  - Khai báo cột bằng mảng `columns` (`key`, `header`, `render`, `align`, `nowrap`, `className`).
  - Bảng rỗng thì hiện `EmptyState`. Có `busy` để làm mờ khi đang tải lại, `footer` cho dòng tổng, `caption` cho trình đọc màn hình.

### Ý tưởng / quyết định
- **Bảng chỉ lo hiển thị.** Đang tải lần đầu, báo lỗi và phân trang do trang tự xử lý bằng `LoadingState`, `ErrorState`, giống trang Tin tức.
- **`minWidth` mặc định 640px:** màn hình hẹp thì bảng cuộn ngang trong khung, không bóp cột tới mức mỗi chữ một dòng. Cột chữ dài thêm `className: 'min-w-56'`.
- **Màu dùng token** (`bg-canvas/60`, `border-line`), không chép mã hex `#f8f9fc` từ mockup.

### Đã kiểm tra
- Code Phi gõ giống bản chạy thử (chỉ khác `row =>` so với `(row) =>`). `oxlint` sạch, `vite build` thành công.
- Bản chạy thử dựng trang demo theo mockup `van-ban.html` và `tra-cuu-diem.html`:
  - Có dữ liệu, có dòng tổng, `busy`, rỗng có và không có tiêu đề riêng.
  - Ở 1100px không cuộn ngang. Ở 390px bảng cuộn trong khung, trang không tràn.
- Chưa dùng ở trang thật nào.

### Việc tiếp theo
- Báo Dương đã có `DataTable` và gộp lên `main` để dùng cho Văn bản.

---

## 2026-11-02 (Phi): Sửa lỗi trang Tin tức sau khi rà code

Phi nhờ sửa hộ ("sửa luôn hộ"). Phi đã tự sửa phần lớn trước đó. Claude sửa nốt:
- `newsApi.js`: `'news/departments'` thành `'/news/departments'`.
- `NewsReader.jsx`: thêm `formatFileSize` vào dòng import `../../utils/format` (trước đó chỉ có `formatNumber`, nên tệp đính kèm sẽ lỗi).
- `NewsList.jsx`: bọc tên chuyên mục và lượt xem trong một `<span>`, hiện lại tên chuyên mục.
- `GIAITHICHCODE.md`: trả lại kiểu xuống dòng LF như trên git. Lần ghi trước đã lỡ đổi sang CRLF, khiến git báo đổi cả file.

Kiểm tra: `oxlint` sạch, `vite build` thành công. Chạy thử trên app thật (cổng 3000, API thật, tài khoản `24100001`):
- Có đủ tab chuyên mục.
- Lọc đơn vị giữ được lựa chọn và trả về 2 tin. Tìm "đăng ký" thì ô tìm vẫn giữ chữ.
- 4 ô thông tin tin có giá trị. Tệp đính kèm hiện tên và loại.
- Bình luận trống thì báo lỗi bằng chữ. Bộ đếm hiện `3/1000`.
- Trên điện thoại: hiện nút quay lại, ẩn danh sách, không tràn ngang.

Chưa thử được phần hiện nội dung bình luận, vì DB chưa có bình luận nào và không gửi thật để tránh tạo dữ liệu rác. Ảnh `test/tin-tuc-2-doc-tin.png` được chụp lại.

### Lần rà code trước khi sửa

Phi đã gõ xong 13 file của trang Tin tức, thêm route `/news` và cài `dompurify`. Đã so với bản chạy thử, chạy `oxlint` và `vite build`. Build vẫn thành công, nhưng có các lỗi sau (chi tiết ở `GIAITHICHCODE.md`, mục 3.1):

### Lỗi làm hỏng trang
- `NewsReader.jsx`: thiếu import `Link`, `formatNumber`, `formatFileSize`, nên mở một tin là trang bị lỗi.
- `NewsReader.jsx`: `facts.map(fact => { <div/> })` không trả về gì, nên ô thông tin tin trống.
- `newsApi.js`: gõ `/new/categories` thay vì `/news/categories`, nên không hiện tab chuyên mục.
- `NewsPage.jsx`: viết `params.departmentId;` mà không gán giá trị, nên lọc theo đơn vị không có tác dụng.
- `NewsFilters.jsx`: `value={departmentId}` đặt cho mọi `<option>`, nên chọn đơn vị nào cũng không đổi.
- `NewsPage.jsx`: không truyền `keyword` vào `NewsFilters`, nên ô tìm kiếm bị xoá chữ sau khi tìm và React báo cảnh báo.
- `NewsComments.jsx`: không hiện nội dung bình luận và không hiện chữ báo lỗi.

### Lỗi nhỏ
- `NewsList.jsx`: `if (loading)` khiến danh sách bị xoá trắng mỗi lần đổi bộ lọc. Ngoài ra không hiện tên chuyên mục.
- Chữ sai chính tả "hiện thị". `MAX_LENGTH = 100`.

---

## 2026-11-01 (Phi): Hướng dẫn cho AI ở thư mục gốc

### Thêm
- `../AGENTS.md`: hướng dẫn chung cho mọi công cụ AI. Gồm:
  - Việc phải làm trước tiên: hỏi người dùng là Phi hay Dương, đọc `PHANCHIA.md`, đọc code cùng loại trước khi viết mới.
  - Quy tắc phân quyền.
  - Cấu trúc dự án và cách chạy, tài khoản test.
  - Quy ước code `qldt_api` (model, validation, service, controller, route, `ApiResponse`, `ApiError`, ngày `DD/MM/YYYY`).
  - Quy ước code `qldt_web` (thư mục, token Tailwind, react-router v8, icon Phosphor, token chỉ giữ trong bộ nhớ, truy cập dễ dàng).
  - Cách ghi nhật ký, quy tắc git, cách làm việc với từng người.
- `../CLAUDE.md`: chỉ nạp `@AGENTS.md`, để Claude Code và các công cụ khác dùng chung một nội dung.

### Sửa
- `../PHANCHIA.md`, Bước 0: ghi rõ `qldt_api/.gitignore` đã có `data/dbqldt.sqlite`, chỉ cần chạy `git rm --cached` một lần.

### Ý tưởng / quyết định
- **Viết một file, nạp ở hai nơi.** `AGENTS.md` là nội dung chính, `CLAUDE.md` chỉ nạp lại. Như vậy không có hai bản phải sửa song song.
- **AI phải hỏi đang làm việc với ai.** Hai người có tính năng khác nhau và cách làm khác nhau: Phi muốn tự gõ code, còn phần của Dương để Dương tự điền.
- **Chưa xong Bước 0 thì AI không được tự tạo bảng dùng chung.** Đây là chỗ AI dễ làm sai nhất.

---

## 2026-11-01: Phân chia công việc giữa Phi và Dương

### Thêm
- `../PHANCHIA.md` (thư mục gốc `qldt_PD`):
  - Ai làm tính năng nào (cả API lẫn web).
  - Bước 0 làm chung: các bảng dùng chung, dữ liệu mẫu, bỏ file sqlite khỏi git.
  - Bảng nào thuộc ai.
  - Các file cả hai cùng sửa và cách xử lý xung đột.
  - Component dùng chung, quy trình git, các việc cần chốt khi họp.

### Sửa (cùng ngày)
- `PHANCHIA.md`: bổ sung sau khi rà lại các rủi ro.
  - **Sửa chỗ ghi sai:** bản đầu ghi Phi chỉ đọc điểm cho trang chủ. Thực ra Đăng ký học cũng cần điểm, để kiểm tra học phần tiên quyết và đánh dấu "Học lại". Từ nay Phi lấy điểm qua hàm dùng chung `getPassedCourseIds` do Dương viết.
  - **Bước 0 thêm 4 việc:** danh sách trạng thái đăng ký lớp, hàm `getPassedCourseIds`, kịch bản dữ liệu mẫu chung (file seed tìm bản ghi bằng mã cố định), lệnh `npm run db:reset`. Lệnh này cần vì `sequelize.sync()` không thêm cột vào bảng đã có.
  - **Thứ tự của Phi đổi lại:** Tin tức → Đăng ký học → Lịch học → Đổi mật khẩu. Phần khó nhất làm sớm.
  - **Thêm mục 6 "Rủi ro và cách giảm"** (8 rủi ro). Mục "Việc cần chốt khi họp" chuyển thành mục 7 và thêm 3 việc.

### Ý tưởng / quyết định
- Chia theo dữ liệu.
  - Phi: Tin tức, Đổi mật khẩu, Lịch học, Đăng ký học, ghép Trang chủ.
  - Dương: Văn bản, Tra cứu điểm, Chương trình đào tạo, Lịch thi.
- Lịch học đi cùng Đăng ký học vì cùng dùng dữ liệu thứ, tiết, phòng. Lịch thi đi cùng Tra cứu điểm.

---

## 2026-10-31: Phần 2, khung giao diện sau đăng nhập

Bạn tự gõ theo code mẫu, tôi rà lại và chạy thử.

### Thêm
- `src/layouts/AppLayout/`: `AppLayout.jsx` (lưới 2 cột, menu trên điện thoại, Esc để đóng, nền tối, link bỏ qua tới nội dung chính), `Topbar.jsx`, `Sidebar.jsx`.
- `src/routes/navigation.js`: khai báo menu ở một chỗ (`NAV_ITEMS`, `NAV_LINKS`, `findNavLink`).
- `src/utils/userDisplay.js`: tên vai trò, chữ viết tắt cho avatar, dòng phụ dưới tên (MSSV).
- `src/components/ui/Logo.jsx`, `src/components/ui/PageHeader.jsx`.
- `src/pages/ComingSoonPage/`: trang tạm cho các mục chưa có API.
- `src/index.css`: viền `:focus-visible` dùng màu nhấn, cho người dùng bàn phím.

### Sửa
- `src/routes/index.jsx`: route `ProtectedRoute` > `AppLayout` > các trang. Route của các mục trong menu được sinh tự động từ `NAV_LINKS`.
- `src/pages/HomePage/HomePage.jsx`: chỉ còn lời chào. Nút Đăng xuất chuyển xuống cuối sidebar.

### Ý tưởng / quyết định
- **Menu là dữ liệu, không viết thẳng trong JSX.** Thêm, bớt hay đổi tên một mục chỉ sửa `navigation.js`. Sidebar, router và breadcrumb tự cập nhật theo.
- **Mục chưa có API vẫn có trang**, là trang "Chức năng đang được xây dựng", để menu không có link chết.
- **Đóng menu bằng `onClick` trên từng link, không dùng `useEffect` theo dõi URL**, để tránh một lần render thừa.
- **Trên điện thoại, menu đóng dùng `invisible`** để phím Tab không nhảy vào các link đang bị giấu.
- **Đường dẫn bằng tiếng Anh, menu gọn hơn mockup:** đây là lựa chọn của bạn khi gõ.

### Đã kiểm tra
- `npm run lint` sạch. `vite build` được, và các class `h-13`, `top-13`, `mb-4.5`, `ml-4.75`, `scrollbar-thin` đều sinh ra CSS.
- Chạy thử với API thật: đăng nhập, bấm cả 9 link trong sidebar, F5 ở trang con, thu và mở nhóm, menu điện thoại (Esc, bấm nền tối, bấm link), đăng xuất, vào trang cần đăng nhập khi đã đăng xuất. Tất cả đều đúng. Chi tiết ở `GIAITHICHCODE.md` mục 2.5.

### Việc tiếp theo
- Thống nhất tên "Cổng đào tạo" hay "Cổng Đào tạo" (logo đang khác tiêu đề tab và trang đăng nhập).
- `LoginPage` có thể dùng `<Logo />` thay cho khối logo đang viết riêng trong trang.
- Phần 3: trang Tin tức với API `/news`.

---

## 2026-10-30: Sửa lỗi luồng đăng nhập sau khi rà code

### Sửa
- `src/context/AuthProvider.jsx`:
  - Khôi phục phiên thành công thì gọi thêm `setStatus('authenticated')`. Trước đây bấm F5 khi đã đăng nhập thì spinner quay mãi.
  - `logout`: chuyển `resetSession()` từ `catch` sang `finally`. Trước đây đăng xuất thành công mà app vẫn ở trang chủ.
- `src/routes/ProtectedRoute.jsx`: `to="login"` đổi thành `to="/login"`. Đường dẫn tương đối sẽ hỏng khi có route con như `/tin-tuc`.
- `src/components/ui/FullPageLoader.jsx`: in ra `{message}`. Trước đây chỉ có spinner, còn `role="status"` thì rỗng.
- `src/utils/getErrorMessage.js`: câu báo lỗi máy chủ và lỗi mạng có thêm hướng xử lý cho người dùng.
- `index.html`: tiêu đề tab đổi thành "Cổng Đào tạo".
- `GIAITHICHCODE.md`: thêm 5 dòng vào bảng lỗi ở mục 1.17 và viết mục 1.18 "Giải thích code thực tế".

### Đã kiểm tra
- `npm run lint`: không còn cảnh báo nào.
- Chạy thử trên trình duyệt với API thật, tài khoản `24100001`:
  - Chưa đăng nhập mà vào `/` thì bị chuyển về `/login`.
  - Bỏ trống ô tài khoản thì báo lỗi ngay dưới ô.
  - Nhập sai mật khẩu thì hiện thông báo "Tài khoản hoặc mật khẩu không đúng".
  - Nhập đúng mật khẩu thì vào `/`.
  - Bấm F5 vẫn giữ phiên.
  - Bấm Đăng xuất thì về `/login`.
  - Vào lại `/` sau khi đăng xuất thì bị chuyển về `/login`.

---

## 2026-10-30: Trang đăng nhập dùng ảnh khuôn viên thay cho khối "Lần đầu đăng nhập"

### Sửa
- `src/pages/LoginPage/LoginPage.jsx`: cột phải hiện ảnh `src/assets/image.png` phủ kín cột (`object-cover`). Trên điện thoại không hiện ảnh.
- `src/pages/LoginPage/LoginPage.jsx`, hàm `validate`: sửa lỗi gõ nhầm. Code cũ gán lỗi vào `errors.message` thay vì `errors.username`, nên khi để trống ô tài khoản thì form không báo lỗi mà vẫn gửi lên API. Sửa luôn chữ "Tài khoảng" thành "Tài khoản".
- `GIAITHICHCODE.md` mục 1.12: cập nhật mô tả bố cục và giải thích cách đưa ảnh vào.

### Xoá
- Khối "Lần đầu đăng nhập" và mảng `FIRST_LOGIN_GUIDE`.

### Ý tưởng / quyết định
- **Ảnh dùng `alt=""`.** Ảnh chỉ để trang trí nên trình đọc màn hình bỏ qua.
- **Màu `bg-accent` làm nền chờ.** Trong lúc ảnh đang tải, cột phải là màu navy chứ không phải ô trống trắng.
- **`object-[68%_center]` để giữ nhóm sinh viên trong khung.** Ở màn hình 1440px, biển "PHENIKAA UNIVERSITY" bị cắt một phần, vì cột không đủ rộng để chứa cả biển lẫn nhóm sinh viên. Ở màn hình 1920px thì thấy đủ.

### Việc tiếp theo
- Ảnh hiện là PNG 812 KB nhưng chỉ rộng 972px. Trên màn hình 1920px ảnh bị phóng to nên hơi mờ, và dung lượng nặng cho trang đầu tiên. Nên xin bản gốc độ phân giải cao hơn (khoảng 1600–2000px) và lưu dạng WebP hoặc JPG (khoảng 150–250 KB).
- Mockup `test/mockups/login.html` vẫn là bản cũ có khối "Lần đầu đăng nhập".

---

## 2026-10-30: Đổi màu chủ đạo sang xanh navy theo trang QLĐT của trường

### Sửa
- `src/index.css`, khối `@theme`: màu nhấn đổi từ xanh mòng két sang xanh navy `#223771`. Đây là màu nền và màu nút "Đăng nhập" của https://qldtbeta.phenikaa-uni.edu.vn/, đo bằng `getComputedStyle` trên trang thật.
  - `--color-accent`: `#0d6b63` → `#223771`
  - `--color-accent-hover`: `#09564f` → `#1a2a58`
  - `--color-accent-soft`: `#e2f1ee` → `#e6ebf7`
- Các màu trung tính chuyển từ xám ngả xanh lá sang xám ngả navy, độ sáng giữ như cũ:
  `canvas #f4f5f9`, `rail #e9ecf3`, `ink #161b2b`, `muted #525a6e`, `line #dbdfe9`, `line-strong #c2c8d6`.
- Mockup `test/mockups/shared.css`: đổi cùng bộ màu, kể cả các màu viết cứng (nền hover, thanh tiến độ, ô lịch, bóng đổ). Màu `info` chuyển sang xanh lơ `#0b6a7a`, để ô lịch học loại thứ hai không lẫn với ô màu navy.
- Chụp lại toàn bộ 10 ảnh trong `test/`.
- `GIAITHICHCODE.md` mục 1.4: cập nhật bảng màu.
- Trong cùng ngày có thử xanh nước biển `#1559a3`, sau đó thay bằng navy để khớp với trang của trường.

### Ý tưởng / quyết định
- **Lấy đúng màu của trang thật, không chọn đại một màu xanh.** Sinh viên đã quen màu navy của hệ thống cũ, nên giữ màu đó giúp họ nhận ra đây là trang của trường. Chỉ lấy màu, không chép bố cục, ảnh nền hay logo.
- **Màu hover đậm hơn màu gốc (`#1a2a58`) chứ không sáng hơn.** Trong code, `accent-hover` còn được dùng làm màu chữ trên nền `accent-soft` (mục đang chọn, ghi chú). Màu đậm hơn giữ đúng vai trò "nhấn mạnh hơn" đó.
- **Độ tương phản:** chữ trắng trên nút đạt 11.3:1, chữ phụ trên nền trang 6.3:1, chữ trên nền `accent-soft` 11.6:1. Tất cả vượt chuẩn WCAG AA.
- **Đổi luôn sắc của màu trung tính.** Nền ngả xanh lá đặt cạnh nút navy sẽ trông lệch tông.
- `danger`, `ok`, `warn` giữ nguyên.
- Không phải sửa component nào, vì mọi nơi đều dùng tên vai trò (`bg-accent`, `text-muted`...).

---

## [Đang làm] Phần 1: Đăng nhập

Người làm: bạn tự code theo hướng dẫn ở [GIAITHICHCODE.md, Phần 1](GIAITHICHCODE.md#phần-1-đăng-nhập).

### Kế hoạch
- Cài Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`) cùng `clsx`, `react-router`, `axios`, `@phosphor-icons/react`, `@fontsource/ibm-plex-sans`.
- Cấu hình Vite: thêm plugin `tailwindcss()`, chạy cổng 3000 và proxy `/api` sang `http://localhost:4040` để cookie `refreshToken` hoạt động như cùng một origin.
- `src/index.css`: `@import "tailwindcss"` và khai báo bộ màu, font của mockup trong `@theme`.
- Tạo lớp gọi API (`src/apis`), nơi giữ access token trong bộ nhớ (`src/utils/tokenStore.js`), `AuthProvider` (`src/context`), hook `useAuth` (`src/hooks`).
- Tạo router với `ProtectedRoute` và `GuestRoute` (`src/routes`), trang `LoginPage` theo mockup `test/01-dang-nhap.png`.
- Khi tải lại trang: gọi `POST /auth/refresh` rồi `GET /auth/me` để khôi phục phiên.

### Ý tưởng / quyết định
- **Dùng Tailwind CSS v4 qua plugin Vite.** Không cần `tailwind.config.js` hay PostCSS, mọi cấu hình nằm trong `index.css`. Màu được đặt theo vai trò (`accent`, `muted`, `danger`, `line`...) và lấy đúng mã màu từ mockup, để giao diện thật khớp với bản đã duyệt và muốn đổi màu chỉ cần sửa một chỗ.
- **Bộ class lặp lại được đóng gói thành component (`Button`, `TextField`), không dùng `@apply`.** Như vậy vẫn giữ được ưu điểm của Tailwind là nhìn JSX là biết giao diện, và tránh tạo ra một tầng CSS thứ hai.
- **Access token chỉ giữ trong bộ nhớ, không dùng localStorage.** localStorage đọc được bằng JavaScript nên lộ token nếu trang dính XSS. Backend đã có refresh token trong cookie `httpOnly`, nên mỗi lần tải lại trang chỉ cần gọi refresh để lấy access token mới.
- **Dùng proxy của Vite thay vì gọi thẳng `localhost:4040`.** Cookie refresh có `path=/api/v1/auth` và `sameSite=strict`. Khi đi qua proxy, trình duyệt coi API là cùng origin với web nên không phải xử lý CORS lúc phát triển.
- **Gộp các lần gọi refresh đồng thời thành một.** Backend xoay vòng refresh token: mỗi lần refresh sẽ xoá token cũ. Ở chế độ dev, `React.StrictMode` chạy effect hai lần. Nếu không gộp, lần gọi thứ hai dùng token đã bị xoá và người dùng bị đăng xuất ngay.
- **Tách `authContext.js` và `AuthProvider.jsx`.** Rule `react/only-export-components` của oxlint cảnh báo khi một file `.jsx` vừa export component vừa export thứ khác, và Fast Refresh khi đó sẽ tải lại cả trang.

---

## 2026-10-30: Chốt thiết kế giao diện

### Thêm
- Mockup HTML tĩnh và ảnh chụp trong `test/` (hướng 4, phong cách "impeccable", chế độ Operate):
  đăng nhập, trang chủ, tin tức, tra cứu điểm, đăng ký học, lịch học, lịch thi, văn bản, giao diện điện thoại.
- Sidebar trái sau đăng nhập theo thứ tự: Trang chủ, Tin tức, Góc học tập (Tra cứu điểm, Chương trình đào tạo, Tiến độ học tập, Điểm rèn luyện), Đăng ký trực tuyến (Đăng ký học, Đăng ký thi lại, Đăng ký giấy tờ), Thời khóa biểu (Lịch học, Lịch thi), Văn bản. Cuối sidebar là Đổi mật khẩu và Đăng xuất.

### Xoá
- Bốn hướng thiết kế không được chọn (01, 02, 03, 05).

### Sửa
- `.gitignore`: thêm `test/` và gỡ các file trong `test/` khỏi index (file vẫn còn trên máy).

### Ý tưởng / quyết định
- Chọn bố cục kiểu ứng dụng làm việc: sidebar cố định, nội dung dạng bảng và danh sách, một họ chữ IBM Plex Sans, màu nhấn xanh mòng két `#0d6b63` chỉ dùng cho hành động chính và mục đang chọn.
- Ngoài đăng nhập và tin tức, các màn còn lại chưa có API trong `qldt_api`. Mockup dùng dữ liệu mẫu.

---

## 2026-10 (trước đó): Khởi tạo dự án

### Thêm
- Dự án React 19 + Vite, lint bằng oxlint (commit `d5e0f06`).
- Các thư mục trống trong `src/`: `apis`, `components`, `context`, `hooks`, `layouts`, `pages`, `routes`, `utils`.
