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
