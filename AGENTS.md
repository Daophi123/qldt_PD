# Hướng dẫn cho AI làm việc trong `qldt_PD`

Dự án đồ án "Cổng Đào tạo": web quản lý đào tạo cho sinh viên đại học. Nhóm có 2 người là **Phi** và **Dương**. Giao diện, thông báo lỗi và tài liệu đều viết bằng **tiếng Việt**.

File này dành cho mọi công cụ AI. `CLAUDE.md` nạp lại đúng file này.

## 1. Việc phải làm trước tiên

1. **Hỏi người dùng là Phi hay Dương** nếu họ chưa nói. Mỗi người phụ trách tính năng khác nhau và muốn AI làm việc theo cách khác nhau (mục 8).
2. **Đọc `PHANCHIA.md`** ở thư mục gốc để biết:
   - Tính năng và bảng nào thuộc người đang làm.
   - File nào cả hai cùng sửa.
   - Bước 0 đã xong chưa. Ô `[x]` là đã xong, ô `[ ]` là chưa.
3. **Đọc code hiện có của cùng loại trước khi viết mới.** Ví dụ làm API cho một tính năng thì đọc `qldt_api/src/*/news.*` trước. Làm trang web thì đọc `qldt_web/src/pages/LoginPage/` và `qldt_web/src/layouts/AppLayout/`.

## 2. Quy tắc phân quyền (bắt buộc)

- **Chỉ sửa tính năng, bảng và file của người đang làm** theo `PHANCHIA.md`.
  - Cần sửa phần của người kia thì dừng lại, nói rõ cần sửa gì và vì sao, để người dùng tự trao đổi.
- **Các bảng dùng chung** (`students`, `semesters`, `courses`, `class_sections`, `class_sessions`, `enrollments`):
  - Nếu chúng **chưa tồn tại** vì Bước 0 chưa xong, **không tự tạo**. Báo người dùng là phải xong Bước 0 trước.
  - Nếu cần thêm hoặc đổi cột, đề xuất thành một PR riêng để người kia duyệt. Không gộp chung vào PR tính năng.
- **Dương lấy điểm qua hàm.** Đăng ký học (của Phi) chỉ lấy danh sách học phần đã qua bằng hàm `getPassedCourseIds(studentId)` trong `qldt_api/src/services/grade.service.ts`. Hàm này do Dương viết. Không đọc thẳng bảng điểm.
- **File cả hai cùng sửa** (danh sách ở mục 4 của `PHANCHIA.md`): chỉ thêm phần của mình, không sắp xếp lại hay định dạng lại phần của người kia.

## 3. Cấu trúc và cách chạy

```
qldt_PD/
├── PHANCHIA.md      phân chia công việc
├── qldt_api/        Express 5 + TypeScript + Sequelize + SQLite, cổng 4040
└── qldt_web/        React 19 + Vite + Tailwind CSS v4 + react-router, cổng 3000
    ├── CHANGELOG.md     nhật ký thay đổi (ghi cả API lẫn web)
    ├── GIAITHICHCODE.md giải thích code theo từng tính năng
    └── test/            mockup HTML (test/mockups/) và ảnh chụp giao diện
```

| Việc | `qldt_api` | `qldt_web` |
|---|---|---|
| Lần đầu | `npm install`, chép `.env.example` thành `.env` rồi điền `JWT_SECRET` và `ENCRYPTION_SECRET_KEY` | `npm install` |
| Chạy | `npm start` (tsx watch) | `npm run dev`. Vite chuyển `/api` sang `http://localhost:4040` |
| Kiểm tra trước khi xong việc | `npm run build` (chạy `tsc`) | `npm run lint` (oxlint) và `npm run build` |
| Dữ liệu mẫu | `POST /api/v1/auth/seed` (chỉ khi `NODE_ENV=development`), sau đó đăng nhập admin và gọi `POST /api/v1/news/seed` | |

- **Tài khoản test** (chỉ có ở môi trường development): sinh viên `24100001` / `Student@123`, quản trị `admin` / `Admin@123`.
- **Kiểm tra trên trình duyệt:** khi sửa giao diện, chạy cả API và web rồi đăng nhập thật. Không giả lập API khi API chạy được.
- **Hệ điều hành:** máy của nhóm chạy Windows. Lệnh shell phải chạy được trên Git Bash hoặc PowerShell.

## 4. Quy ước code `qldt_api`

Mỗi tính năng gồm các file sau, đặt tên theo tính năng (ví dụ `document`):

| File | Nội dung |
|---|---|
| `src/models/<nhom>/<ten>.model.ts` | `class XModel extends Model` + `XModel.init(...)`. Khoá chính là UUID (`DataTypes.UUID`, `defaultValue: UUIDV4`). Khai báo quan hệ và export trong `src/models/index.ts` |
| `src/validations/<ten>.validation.ts` | Schema zod có dạng `z.object({ body, query, params })`. Thông báo lỗi tiếng Việt |
| `src/services/<ten>.service.ts` | `export class XService` với các hàm `static async`. Chỉ phần này được gọi model |
| `src/controllers/<ten>.controller.ts` | `export class XController`, mỗi hàm bọc trong `catchAsync`. Trả về `res.status(...).json(new ApiResponse(status, "thông báo tiếng Việt", data))` |
| `src/routes/<ten>.route.ts` | `router.use(authenticate)` nếu cần đăng nhập. `authorize("admin")` cho thao tác quản trị. `validate(schema)` trước controller. Thêm một dòng `routes.use("/<ten>", ...)` vào `src/routes/index.ts` |

- **Kiểu trả về luôn là** `{ datetime, errorCode, success, message, data }` (lớp `ApiResponse`). Web đọc `response.data.data`.
- **Báo lỗi:** `throw new ApiError("404", "Không tìm thấy ...")`. Mã trạng thái là **chuỗi**. Middleware lỗi tự trả về đúng định dạng.
- **Lấy người đang đăng nhập:** `req.user` khi kiểu request là `AuthRequest` từ `middlewares/auth.middleware.ts`.
- **Ngày tháng** trong API và database là chuỗi `DD/MM/YYYY`. Dùng `vnDate` (trong validation) và `src/utils/date.util.ts`.
- **Định dạng code:** nháy kép, có dấu chấm phẩy.
- **Database:** SQLite, đường dẫn đặt trong biến `DB_STORAGE` của `.env`.
  - Lúc khởi động, app gọi `sequelize.sync()`. Lệnh này **chỉ tạo bảng chưa có, không thêm cột vào bảng đã có**. Thêm cột thì phải xoá database rồi chạy seed lại (lệnh `npm run db:reset` khi Bước 0 đã làm xong).
  - `data/dbqldt.sqlite` không được commit. Nếu `git status` vẫn báo file này thay đổi thì nó vẫn đang được git theo dõi. Bước 0 sẽ chạy `git rm --cached` để bỏ hẳn.

## 5. Quy ước code `qldt_web`

| Thư mục `src/` | Chứa gì |
|---|---|
| `apis/` | `axiosClient.js` (export mặc định, tự gắn token và tự refresh khi gặp 401). Mỗi tính năng một file `xxxApi.js`, trả về `response.data.data` (xem `authApi.js`). **Trang không gọi axios trực tiếp** |
| `context/`, `hooks/` | Đăng nhập: `useAuth()` trả về `{ user, status, login, logout }` |
| `layouts/AppLayout/` | Khung sau đăng nhập: `Topbar`, `Sidebar`, `<Outlet />` |
| `routes/` | `navigation.js` là nơi duy nhất khai báo menu. `index.jsx` sinh route từ `NAV_LINKS`, mục nào chưa có trang thật thì dùng `ComingSoonPage`. Làm xong trang thì thay `ComingSoonPage` của đúng route đó |
| `pages/<TenTrang>/` | Mỗi màn hình một thư mục. Dùng `PageHeader` cho tiêu đề |
| `components/ui/`, `components/form/` | Thành phần dùng lại. Xem bảng component trong `PHANCHIA.md` trước khi tạo mới, không viết bản thứ hai cho cùng một việc |
| `utils/` | Hàm thuần, ví dụ `getErrorMessage(error)` để lấy thông báo lỗi từ API |

- **Tailwind CSS v4** được cấu hình trong `src/index.css` (`@theme`), không có `tailwind.config.js`.
  - Chỉ dùng màu theo vai trò: `canvas`, `panel`, `rail`, `ink`, `muted`, `line`, `line-strong`, `accent`, `accent-hover`, `accent-soft`, `danger`, `danger-soft`.
  - **Không viết mã màu hex trong component.** Cần màu mới thì bàn với người kia trước.
  - Class phải viết đầy đủ thành chuỗi tĩnh, không ghép kiểu `` `bg-${x}` ``. Ghép class có điều kiện thì dùng `clsx`.
- **react-router v8:** import từ `'react-router'`. Riêng `RouterProvider` import từ `'react-router/dom'`.
- **Icon:** `@phosphor-icons/react`, tên có đuôi `Icon` (ví dụ `HouseIcon`, `WarningCircleIcon`). Icon chỉ để trang trí thì thêm `aria-hidden="true"`.
- **Bảo mật:** access token chỉ giữ trong bộ nhớ (`utils/tokenStore.js`). Refresh token nằm trong cookie `httpOnly`. **Không lưu token vào localStorage.**
- **Truy cập dễ dàng:**
  - Ô nhập luôn có `label`.
  - Lỗi hiện ngay dưới ô nhập và nối với ô qua `aria-describedby`.
  - Nút chỉ có icon thì phải có `aria-label`.
  - Vùng bấm trên điện thoại cao tối thiểu 44px.
  - Mỗi trang có đủ trạng thái đang tải, rỗng và lỗi.
- **Định dạng code:** nháy đơn, không chấm phẩy. Code cũ chưa đều, nên khi sửa file nào thì theo cách viết đang có trong file đó.
- **Giao diện:**
  - Bám theo mockup trong `qldt_web/test/mockups/` và ảnh chụp trong `qldt_web/test/`.
  - Phong cách là ứng dụng làm việc: bảng, danh sách, ít trang trí, font IBM Plex Sans, màu nhấn navy `#223771` chỉ dùng cho hành động chính và mục đang chọn.
  - Mockup có thể có mục mà menu thật đã bỏ. `navigation.js` mới là nguồn đúng.
  - Sử dụng skill impeccable để làm.

## 6. Nhật ký

Mỗi thay đổi về code phải ghi lại, cùng lúc với lần sửa:

- **`qldt_web/CHANGELOG.md`** (ghi cả thay đổi API lẫn web):
  - Mục mới đặt **trên cùng**, tiêu đề dạng `## YYYY-MM-DD (Tên): Nội dung`.
  - Gồm các phần: Thêm / Sửa / Xoá / Ý tưởng và quyết định / Đã kiểm tra / Việc tiếp theo.
- **`qldt_web/GIAITHICHCODE.md`:**
  - Mỗi tính năng một "Phần" riêng.
  - Nội dung: API cần dùng, từng file làm gì, các kỹ thuật chính, cách kiểm tra.
  - Chỉ sửa phần của tính năng đang làm.
- Ghi rõ những gì **đã thực sự chạy thử**. Chưa chạy thì nói là chưa chạy.

## 7. Git

- Nhánh đặt theo người và tính năng: `phi/<tinh-nang>`, `duong/<tinh-nang>`.
- **Không commit, không push, không gộp vào `main` khi người dùng chưa yêu cầu.**
- PR nhỏ: API một PR, giao diện một PR. PR có đổi bảng thì ghi rõ "cần chạy lại seed".
- Không commit file `.env`, database và ảnh chụp tạm.

## 8. Cách làm việc với từng người

### Phi

- Phi đang học React và muốn **tự gõ code**.
  - Mặc định: giải thích, đưa code trong khung chat để Phi gõ lại, rồi rà code sau khi Phi gõ xong.
  - **Chỉ sửa file trực tiếp khi Phi nói rõ**, ví dụ "sửa luôn hộ", "đổi cho tôi".
- Khi Phi chỉ yêu cầu đưa code trong chat thì không ghi nhật ký cho lần đó. Ghi nhật ký khi rà code đã gõ, hoặc khi chính AI sửa file.
- Trước khi đưa code, nếu được thì dựng thử trong một thư mục tạm, không phải trong dự án, để chắc code chạy được.

### Dương

- _(Dương tự điền: muốn AI viết code trực tiếp hay chỉ hướng dẫn, có gì cần lưu ý.)_
- Khi phần này còn trống, **hỏi Dương trước khi sửa file**.
