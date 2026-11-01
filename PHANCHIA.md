# Phân chia công việc: Phi và Dương

Dự án gồm hai thư mục: `qldt_api` (Express, Sequelize, SQLite) và `qldt_web` (React, Vite, Tailwind CSS v4).

Nguyên tắc chia: **mỗi tính năng do một người làm trọn cả API lẫn giao diện web.** Các tính năng dùng chung dữ liệu được giao cho cùng một người, để mỗi người chủ yếu làm trên các bảng của mình.

Đã xong trước khi chia (Phi): đăng nhập (API + web), API tin tức, khung giao diện sau đăng nhập (sidebar, thanh trên cùng, trang tạm "Chức năng đang được xây dựng").

---

## 1. Bước 0: hai người làm chung

Làm xong và gộp vào `main` thành **một PR riêng** trước khi ai bắt đầu tính năng của mình.

- [ ] **Các bảng dùng chung** (tên cột cụ thể chốt khi họp):

  | Bảng | Nội dung chính |
  |---|---|
  | `students` | Thông tin sinh viên: liên kết `users`, MSSV, họ tên, ngành, khoá |
  | `semesters` | Học kỳ: tên, năm học, ngày bắt đầu, ngày kết thúc |
  | `courses` | Học phần: mã, tên, số tín chỉ |
  | `class_sections` | Lớp học phần: học phần, học kỳ, mã lớp, giảng viên, sĩ số tối đa |
  | `class_sessions` | Buổi học của lớp: thứ, tiết bắt đầu, tiết kết thúc, phòng |
  | `enrollments` | Sinh viên đăng ký lớp học phần: sinh viên, lớp, trạng thái, thời điểm đăng ký |

- [ ] **Trạng thái của `enrollments`:** chốt danh sách trạng thái (ví dụ `registered`, `cancelled`, `completed`) và nghĩa của từng trạng thái. Chẳng hạn: lớp đã huỷ thì không hiện trong lịch học và lịch thi, không tính điểm. Cả hai người lọc dữ liệu theo cùng quy tắc này.
- [ ] **Hàm đọc điểm dùng chung** `getPassedCourseIds(studentId)`: nhận mã sinh viên, trả về danh sách học phần sinh viên đã qua.
  - Dương viết hàm, đặt trong `qldt_api/src/services/grade.service.ts`. Lúc đầu có thể chỉ trả về dữ liệu mẫu, sau đó mới đọc bảng điểm thật.
  - Phi gọi hàm này trong Đăng ký học để kiểm tra học phần tiên quyết và đánh dấu "Học lại". **Không đọc thẳng bảng điểm**, để Dương đổi cách lưu điểm mà Đăng ký học không phải sửa.
- [ ] **Kịch bản dữ liệu mẫu chung:** sinh viên `24100001` học những lớp nào ở học kỳ trước và học kỳ này, có điểm môn nào, thi môn gì, ở đâu. Cả hai viết file seed theo đúng kịch bản này.
- [ ] **File seed:** mỗi phần một file, ví dụ `seeds/core.seed.ts` (Bước 0), `seeds/grade.seed.ts` (Dương). Chạy theo thứ tự cố định, `core` chạy trước.
  - Tìm bản ghi bằng **mã cố định** (mã học phần, mã lớp, MSSV), không dùng id tự tăng. Nếu dựa vào id thì chỉ cần đổi thứ tự chạy là dữ liệu lệch nhau.
- [ ] **Lệnh `npm run db:reset`** trong `qldt_api`: xoá file database, tạo lại bảng và chạy toàn bộ seed.
  - Lý do: `sequelize.sync()` đang dùng chỉ tạo bảng chưa có, **không thêm cột vào bảng đã có**. Khi một người thêm cột, người kia lấy code mới về sẽ gặp lỗi `no such column`.
  - Quy ước: PR nào đổi bảng thì ghi rõ trong mô tả "cần chạy `npm run db:reset`".
- [ ] **Bỏ `qldt_api/data/dbqldt.sqlite` khỏi git.**
  - `qldt_api/.gitignore` đã có dòng `data/dbqldt.sqlite`, nhưng file này được commit từ trước nên git vẫn theo dõi. Chạy `git rm --cached qldt_api/data/dbqldt.sqlite` một lần rồi commit.
  - Mỗi người tự tạo database trên máy mình bằng `npm run db:reset`.
  - Lý do: đây là file nhị phân nên git không gộp được, và mỗi lần đăng nhập thử là file thay đổi.
- [ ] **Thống nhất cách đặt tên:**
  - Đường dẫn API: `/api/v1/<ten-tinh-nang>`.
  - Đường dẫn web: tiếng Anh, giống `navigation.js` hiện tại.
  - Kiểu trả về giữ như cũ: `{ datetime, errorCode, success, message, data }`.

Sau Bước 0: **các bảng dùng chung không ai tự sửa một mình.** Cần thêm hoặc đổi cột thì mở PR và người kia duyệt.

---

## 2. Bảng phân chia

| | **Phi** | **Dương** |
|---|---|---|
| Tính năng | **Tin tức**: web (API đã có)<br>**Đăng ký học**: API + web<br>**Lịch học**: API + web<br>**Đổi mật khẩu**: web (API đã có)<br>**Trang chủ**: ghép ở cuối | **Văn bản**: API + web<br>**Tra cứu điểm**: API + web<br>**Chương trình đào tạo**: API + web<br>**Lịch thi**: API + web |
| Trang web | `/news`, `/register-online/course-registration`, `/schedule/class`, `/change-password`, `/` | `/document`, `/study-corner/check-grade`, `/study-corner/training-program`, `/schedule/exam` |
| Bảng do mình quản lý | `users`, `refresh_tokens`, các bảng tin tức (`news`, `categories`, `departments`, `attachments`, `comments`, `bookmarks`)<br>**Phụ trách chính** các bảng dùng chung ở Bước 0 | Chương trình đào tạo (`programs`, `program_courses`)<br>Kỳ thi (`exams`, `exam_rooms`, số báo danh)<br>Điểm (`grades`)<br>Văn bản (`documents`, `document_files`) |
| Dùng dữ liệu của người kia | Điểm: **chỉ qua hàm `getPassedCourseIds`** (Đăng ký học: tiên quyết, học lại)<br>Điểm và lịch thi cho khối trang chủ: dùng component khối do Dương viết | Đọc `enrollments`, `class_sections`, `class_sessions`, `courses`, `students`<br>Đọc `departments` (cho Văn bản) |

### Vì sao chia như vậy

- **Đăng ký học và Lịch học cùng một người.**
  - Hai tính năng dùng chung dữ liệu thứ, tiết, phòng trong `class_sessions`.
  - Đăng ký học còn phải kiểm tra trùng lịch.
- **Tra cứu điểm, Chương trình đào tạo và Lịch thi cùng một người.**
  - Cả ba xoay quanh kết quả học tập: học phần nào đã qua, thi gì, điểm bao nhiêu.
  - Tra cứu điểm và Chương trình đào tạo cùng nằm trong nhóm "Góc học tập".
- **Phụ thuộc đi theo hai chiều nhưng được giới hạn:**
  - Dương đọc dữ liệu đăng ký lớp của Phi để biết sinh viên học lớp nào.
  - Phi cần biết sinh viên đã qua học phần nào, nhưng chỉ lấy qua hàm `getPassedCourseIds`.
  - Mỗi người chỉ ghi vào bảng của mình.
- **Văn bản có bảng tệp riêng (`document_files`), không dùng `attachments` của Tin tức.**
  - `attachments` đang gắn cứng với tin tức qua cột `newsId`.
  - Văn bản chỉ đọc bảng `departments` để lấy tên đơn vị ban hành, không sửa model của Tin tức.
- **Khối lượng việc khá cân:**
  - Phi có Đăng ký học là phần khó nhất (ghi dữ liệu, kiểm tra sĩ số, trùng lịch, học phần tiên quyết) và phần web Tin tức khá nhiều việc.
  - Dương có 4 tính năng làm cả API lẫn web, phần lớn là đọc và hiển thị.

---

## 3. Thứ tự làm

```
Bước 0 (cả hai): bảng dùng chung + dữ liệu mẫu + bỏ sqlite khỏi git
        │
        ├── Phi:   Tin tức (web) → Đăng ký học → Lịch học → Đổi mật khẩu
        │
        └── Dương: Văn bản → Tra cứu điểm → Chương trình đào tạo → Lịch thi
        │
Cuối (Phi): ghép trang chủ từ các khối của cả hai
```

- **Mỗi người bắt đầu bằng phần ít phụ thuộc nhất:** Tin tức đã có API, Văn bản không cần bảng dùng chung. Trong lúc đó dữ liệu mẫu của Bước 0 có thời gian hoàn thiện.
- **Đăng ký học làm sớm, ngay sau Tin tức.** Đây là phần khó nhất và có nhiều quy tắc nhất. Để cuối thì dễ trễ hạn, và nếu trong lúc làm phát hiện phải sửa bảng dùng chung thì Dương biết sớm.
- **Đổi mật khẩu để sau cùng:** nhỏ, API đã có, chen vào lúc nào cũng được.

### Trang chủ

Ai làm tính năng nào thì viết luôn **một khối nhỏ cho trang chủ** từ dữ liệu của mình. Mỗi khối là một component riêng, đặt trong `src/pages/HomePage/widgets/`:

| Khối | Người viết |
|---|---|
| Lịch học hôm nay | Phi |
| Tin tức mới | Phi |
| Việc cần làm (hạn đăng ký học, hạn nộp...) | Phi |
| Lịch thi sắp tới | Dương |
| Kết quả học tập (điểm trung bình, tín chỉ tích luỹ) | Dương |

Phi ghép các khối vào `HomePage.jsx` ở cuối.

---

## 4. Các file cả hai cùng sửa

Không tránh được hoàn toàn, nhưng đều là xung đột nhỏ. Gặp xung đột thì **giữ cả hai phần**.

| File | Cách làm |
|---|---|
| `qldt_api/src/routes/index.ts` | Mỗi người thêm một dòng `routes.use(...)` |
| `qldt_api/src/models/index.ts` | Mỗi người thêm import, quan hệ và export của model mình |
| `qldt_web/src/routes/index.jsx` | Thay `ComingSoonPage` của đúng route mình bằng trang thật |
| `qldt_web/src/routes/navigation.js` | Chỉ sửa mục của mình |
| `package.json`, `package-lock.json` (cả hai dự án) | Báo nhau trước khi cài thư viện mới. Gặp xung đột ở file lock thì lấy bản trên `main` rồi chạy lại `npm install` |
| `qldt_web/src/index.css` | Không tự thêm màu. Cần màu mới thì bàn trước |
| `CHANGELOG.md` | Mỗi mục ghi rõ tên người làm, ví dụ `## 2026-11-05 (Dương): Văn bản` |
| `GIAITHICHCODE.md` | Mỗi tính năng một "Phần" riêng, mỗi người chỉ sửa phần của mình |

### Component dùng chung trên web (`qldt_web/src/components/`)

Đã có: `Button`, `TextField`, `PasswordField`, `FullPageLoader`, `Logo`, `PageHeader`.

| Component | Người viết | Dùng ở |
|---|---|---|
| `DataTable` (bảng có tiêu đề cột, dòng trống) | Phi | Tin tức, Đăng ký học, Tra cứu điểm, Lịch thi, Văn bản |
| `StatusBadge` (nhãn trạng thái: đã đăng ký, hết chỗ, học lại...) | Phi | Hầu hết các trang |
| `EmptyState`, `ErrorState`, `LoadingState` | Phi | Mọi trang có gọi API |
| `Select`, `SearchInput` (bộ lọc) | Dương | Văn bản, Tra cứu điểm, Tin tức |

Trước khi viết một component mới, xem người kia đã có chưa. **Không viết hai bản cho cùng một việc.**

---

## 5. Quy trình git

- Nhánh `main` luôn chạy được. Không đẩy thẳng lên `main`.
- **Nhánh:** mỗi tính năng một nhánh, đặt tên theo người và tính năng:
  - `phi/lich-hoc`, `phi/dang-ky-hoc`
  - `duong/van-ban`, `duong/tra-cuu-diem`
- **PR:** chia nhỏ, ví dụ API một PR, giao diện một PR. Người kia đọc và duyệt trước khi gộp.
- **Cập nhật nhánh:** mỗi ngày lấy `main` mới về nhánh của mình (`git pull origin main`). Xung đột phát hiện sớm thì nhỏ.
- **Trước khi mở PR**, chạy:
  - `qldt_web`: `npm run lint` và `npm run build`
  - `qldt_api`: `npm run build`
  - Thử lại luồng đăng nhập và tính năng vừa làm.

---

## 6. Rủi ro và cách giảm

| # | Rủi ro | Tránh được? | Cách xử lý |
|---|---|---|---|
| 1 | Đăng ký học (Phi) cần biết điểm (Dương), tức phụ thuộc theo hai chiều | Có | Chỉ đi qua hàm `getPassedCourseIds` đã thống nhất ở Bước 0. Dương viết bản trả dữ liệu mẫu trước để Phi không phải chờ |
| 2 | Một người thêm cột, database của người kia không tự cập nhật và báo lỗi `no such column` | Có | Chạy `npm run db:reset` khi PR có đổi bảng. Về sau nếu muốn chuẩn hơn thì chuyển sang migration (`sequelize-cli` hoặc `umzug`) |
| 3 | Dữ liệu mẫu hai người không khớp nhau (điểm gắn với lớp sinh viên không học) | Có | Một kịch bản dữ liệu chung. File seed tìm bản ghi bằng mã cố định, không dùng id tự tăng |
| 4 | Hiểu khác nhau về trạng thái đăng ký (lớp đã huỷ có hiện, có tính điểm không) | Có | Chốt danh sách trạng thái và nghĩa của từng trạng thái ở Bước 0 |
| 5 | Giao diện hai người làm trông khác nhau | Có | Dùng chung component (mục 4), bám mockup trong `qldt_web/test/`, đọc PR của nhau |
| 6 | Xung đột git ở các file dùng chung (`routes/index.ts`, `models/index.ts`, `routes/index.jsx`, file lock của npm) | Không hẳn | Xung đột nhỏ, giữ cả hai phần là xong. Gộp `main` mỗi ngày để xung đột luôn nhỏ |
| 7 | Phi là nút thắt: giữ bảng dùng chung, ghép trang chủ, lại có Đăng ký học là phần khó nhất | Không hẳn | Dương bắt đầu bằng Văn bản (không phụ thuộc gì). Phi làm Đăng ký học sớm. Việc sửa bảng dùng chung ưu tiên duyệt trong ngày |
| 8 | Mỗi người chỉ hiểu sâu một nửa dự án, trong khi hội đồng có thể hỏi bất kỳ ai | Không hẳn | Đọc PR của nhau thật sự, không duyệt cho có. Mỗi người tự viết phần giải thích cho tính năng của mình trong `GIAITHICHCODE.md` |

---

## 7. Việc cần chốt khi họp

- [ ] Danh sách cột của các bảng dùng chung ở Bước 0
- [ ] Danh sách trạng thái của `enrollments` và nghĩa của từng trạng thái
- [ ] Hàm `getPassedCourseIds`: đầu vào, đầu ra, "đã qua" nghĩa là điểm bao nhiêu trở lên
- [ ] Kịch bản dữ liệu mẫu cho sinh viên `24100001`
- [ ] Cách tính điểm hệ 4, xếp loại học lực (ảnh hưởng Tra cứu điểm, khối Kết quả học tập ở trang chủ, và điều kiện tiên quyết của Đăng ký học)
- [ ] Quy tắc đăng ký học: tín chỉ tối thiểu, tối đa, học phần tiên quyết, thời gian mở cổng, có cho học lại không
- [ ] Ai viết phần nào trong file seed chung
