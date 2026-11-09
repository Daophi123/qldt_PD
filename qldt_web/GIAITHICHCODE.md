# Giải thích code `qldt_web`

File này giải thích từng phần code: mỗi file làm gì, dữ liệu chạy qua đâu, vì sao viết như vậy.
Nhật ký thay đổi theo ngày nằm ở [CHANGELOG.md](CHANGELOG.md).

Cách dùng:
- Mỗi tính năng là một "Phần". Mỗi phần gồm: hợp đồng API, các bước làm, giải thích từng file, cách kiểm tra, lỗi hay gặp.
- Khi bạn viết xong một file, cập nhật mục "Trạng thái" của file đó và bổ sung giải thích nếu code thực tế khác hướng dẫn.

---

## Tổng quan kiến trúc

### Trách nhiệm từng thư mục trong `src/`

| Thư mục | Chứa gì | Không chứa gì |
|---|---|---|
| `apis/` | Cấu hình axios, mỗi file một nhóm endpoint (`authApi.js`, sau này `newsApi.js`) | Code giao diện, state React |
| `context/` | Context React và Provider dùng chung toàn app (đăng nhập) | Hàm gọi API trực tiếp bằng axios |
| `hooks/` | Hook tự viết, ví dụ `useAuth()` | JSX |
| `components/` | Thành phần giao diện dùng lại: nút, ô nhập, thẻ. Đây là nơi "đóng gói" các bộ class Tailwind lặp lại | Logic gọi API |
| `layouts/` | Khung trang: khung có sidebar sau đăng nhập, khung trống cho trang đăng nhập | Nội dung riêng của từng trang |
| `pages/` | Mỗi màn hình một thư mục: `LoginPage/`, `HomePage/`... | Thành phần dùng ở nhiều trang (đưa sang `components/`) |
| `routes/` | Khai báo đường dẫn, các route bảo vệ | Giao diện |
| `utils/` | Hàm thuần không phụ thuộc React: lưu token, đọc thông báo lỗi, định dạng ngày | Hook, JSX |

### Luồng dữ liệu tổng quát

```
Trang (pages) ──gọi──> useAuth() ──đọc──> AuthProvider (context)
                                              │
                                              └──gọi──> authApi (apis) ──> axiosClient ──> /api/v1/... (qldt_api)
                                                                               │
                                                             tokenStore (utils) gắn "Authorization: Bearer <token>"
```

Quy tắc: trang không gọi axios trực tiếp, context không tự dựng URL. Nhờ vậy khi API đổi, chỉ cần sửa trong `apis/`.

---

## Phần 1: Đăng nhập

Trạng thái: **đang hướng dẫn, bạn tự code**. Mockup tham khảo: `test/01-dang-nhap.png` và `test/mockups/login.html`.

### 1.1 Hợp đồng API (đọc từ `qldt_api/src`)

Gốc API: `http://localhost:4040/api/v1` (cổng lấy từ `PORT` trong `qldt_api/.env`).

| Việc | Method + đường dẫn | Gửi lên | Nhận về (`data`) |
|---|---|---|---|
| Tạo tài khoản mẫu (chỉ ở development) | `POST /auth/seed` | không | `{ seeded, message }` |
| Đăng nhập | `POST /auth/login` | `{ username, password }` | thông tin user + `token` |
| Làm mới phiên | `POST /auth/refresh` | cookie `refreshToken` (trình duyệt tự gửi) | `{ token }` |
| Lấy tài khoản hiện tại | `GET /auth/me` | header `Authorization: Bearer <token>` | thông tin user |
| Đăng xuất | `POST /auth/logout` | cookie `refreshToken` | `null` |
| Đổi mật khẩu | `PUT /auth/password` | `{ oldPassword, newPassword }` + Bearer | `null` |

Mọi phản hồi, kể cả khi lỗi, đều có cùng một vỏ:

```json
{
  "datetime": "2026-10-30T20:15:00+07:00",
  "errorCode": "200",
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "id": "uuid...",
    "username": "24100001",
    "email": null,
    "fullName": "Sinh viên mẫu",
    "role": "student",
    "isActive": true,
    "token": "eyJhbGciOi..."
  }
}
```

Các điểm cần nhớ:
- `data` của đăng nhập trộn **thông tin user và `token` chung một object**. Khi lưu, cần tách `token` ra khỏi user.
- `refreshToken` **không nằm trong JSON**. Backend đặt nó vào cookie `httpOnly`, `sameSite=strict`, `path=/api/v1/auth`. JavaScript không đọc được cookie này, trình duyệt tự gửi kèm khi gọi các đường dẫn bắt đầu bằng `/api/v1/auth`, với điều kiện request bật `withCredentials`.
- Mỗi lần gọi `/auth/refresh` thành công, refresh token cũ bị xoá và cookie được thay bằng token mới (xoay vòng token).
- Access token hết hạn theo `JWT_EXPIRES_IN` (mặc định `1d`).

Lỗi thường gặp từ API (`success: false`, đọc `message` để hiển thị):

| Mã | Khi nào | `message` |
|---|---|---|
| 400 | Thiếu tài khoản hoặc mật khẩu | "Tài khoản không được để trống" / "Mật khẩu không được để trống" |
| 401 | Sai tài khoản hoặc mật khẩu | "Tài khoản hoặc mật khẩu không đúng" |
| 403 | Tài khoản bị khoá | "Tài khoản đã bị khóa" |
| 401 | Token hết hạn hoặc thiếu | "Phiên đăng nhập không hợp lệ hoặc đã hết hạn" / "Bạn chưa đăng nhập" |

Tài khoản mẫu sau khi gọi seed: `admin` / `Admin@123` (quản trị) và `24100001` / `Student@123` (sinh viên).

### 1.2 Thứ tự làm

| Bước | File | Việc |
|---|---|---|
| 0 | `package.json`, `vite.config.js`, `qldt_api/.env` | Chuẩn bị môi trường, cài Tailwind CSS |
| 1 | `src/index.css` | Nạp Tailwind, khai báo theme (màu, font) lấy từ mockup |
| 2 | `src/utils/tokenStore.js` | Giữ access token trong bộ nhớ |
| 3 | `src/utils/getErrorMessage.js` | Rút câu thông báo lỗi dễ hiểu từ lỗi axios |
| 4 | `src/apis/axiosClient.js` | Instance axios dùng chung, gắn token, tự refresh khi bị 401 |
| 5 | `src/apis/authApi.js` | Các hàm gọi `/auth/*` |
| 6 | `src/context/authContext.js`, `src/context/AuthProvider.jsx` | State đăng nhập dùng chung |
| 7 | `src/hooks/useAuth.js` | Lấy state đăng nhập trong component |
| 8 | `src/components/form/TextField.jsx`, `PasswordField.jsx`, `src/components/ui/Button.jsx` | Ô nhập và nút dùng lại |
| 9 | `src/pages/LoginPage/LoginPage.jsx` | Màn đăng nhập, style hoàn toàn bằng class Tailwind |
| 10 | `src/pages/HomePage/HomePage.jsx` | Trang tạm sau đăng nhập để kiểm tra |
| 11 | `src/routes/ProtectedRoute.jsx`, `GuestRoute.jsx`, `index.jsx` | Điều hướng và chặn truy cập |
| 12 | `src/main.jsx` | Ghép Provider và Router |

### 1.3 Bước 0: Chuẩn bị

1. Cài thư viện trong `qldt_web`:
   ```bash
   npm i react-router axios @phosphor-icons/react @fontsource/ibm-plex-sans clsx
   npm i -D tailwindcss @tailwindcss/vite
   ```
   - `tailwindcss` + `@tailwindcss/vite` (v4): Tailwind chạy như một plugin của Vite, **không cần** `tailwind.config.js` hay `postcss.config.js`. Toàn bộ cấu hình viết ngay trong file CSS.
   - `clsx`: ghép class có điều kiện, ví dụ thêm class viền đỏ khi ô nhập có lỗi.
   - `react-router`: điều hướng. Từ v7, mọi thứ import từ `"react-router"`, không cần `react-router-dom`.
   - `axios`: gọi HTTP, có interceptor để gắn token và tự refresh.
   - `@phosphor-icons/react`: bộ icon dùng trong mockup.
   - `@fontsource/ibm-plex-sans`: tự host font, không phụ thuộc Google Fonts.
   - Nên cài thêm extension **Tailwind CSS IntelliSense** cho VS Code để có gợi ý class và xem trước màu.
2. Trong `vite.config.js`:
   - Import `tailwindcss` từ `"@tailwindcss/vite"` và thêm `tailwindcss()` vào mảng `plugins`, cạnh `react()`.
   - Thêm khối `server` với:
     - `port: 3000` để khớp `CORS_ORIGIN=http://localhost:3000` của API.
     - `proxy` cho tiền tố `/api`, trỏ tới `http://localhost:4040`.

   Nhờ proxy, web gọi `/api/v1/auth/login` (cùng origin `localhost:3000`) và Vite chuyển tiếp sang API. Cookie refresh được gắn vào origin của web nên hoạt động tự nhiên.
3. Kiểm tra `qldt_api/.env` có `CORS_ORIGIN=http://localhost:3000` và `NODE_ENV=development`. Chạy API (`npm start` trong `qldt_api`), rồi gọi `POST http://localhost:4040/api/v1/auth/seed` một lần (bằng Postman hoặc curl) để có tài khoản mẫu.
4. Dọn template Vite: xoá nội dung demo trong `App.jsx`, xoá hẳn `App.css` (Tailwind thay thế), xoá toàn bộ CSS cũ của template trong `index.css`, xoá `assets/hero.png`, `react.svg`, `vite.svg` nếu không dùng. Đổi `<html lang="en">` thành `lang="vi"` và `<title>` trong `index.html`.

### 1.4 Bước 1: `src/index.css` (Tailwind v4)

Làm gì, theo thứ tự trong file:
1. Dòng đầu: `@import "tailwindcss";`.
2. Khối `@theme { ... }` khai báo bộ màu và font của dự án, ban đầu lấy từ `:root` trong `test/mockups/shared.css`, sau đó màu nhấn đổi sang xanh navy `#223771` theo trang QLĐT của trường (xem CHANGELOG ngày 2026-10-30). Mỗi biến có tiền tố `--color-` sẽ tự sinh ra các class `bg-*`, `text-*`, `border-*`, `ring-*`...

   | Biến trong `@theme` | Giá trị | Class sinh ra (ví dụ) | Dùng cho |
   |---|---|---|---|
   | `--font-sans` | `"IBM Plex Sans", system-ui, sans-serif` | `font-sans` (mặc định cho cả trang) | Toàn bộ chữ |
   | `--color-canvas` | `#f4f5f9` | `bg-canvas` | Nền trang |
   | `--color-panel` | `#ffffff` | `bg-panel` | Nền form, thẻ, bảng |
   | `--color-rail` | `#e9ecf3` | `bg-rail` | Nền sidebar (dùng ở phần sau) |
   | `--color-ink` | `#161b2b` | `text-ink` | Chữ chính |
   | `--color-muted` | `#525a6e` | `text-muted` | Chữ phụ, nhãn nhỏ |
   | `--color-line` | `#dbdfe9` | `border-line` | Đường kẻ, viền thẻ |
   | `--color-line-strong` | `#c2c8d6` | `border-line-strong` | Viền ô nhập |
   | `--color-accent` | `#223771` | `bg-accent`, `ring-accent/15` | Nút chính, mục đang chọn, viền khi focus |
   | `--color-accent-hover` | `#1a2a58` | `hover:bg-accent-hover` | Nút chính khi rê chuột |
   | `--color-accent-soft` | `#e6ebf7` | `bg-accent-soft` | Nền nhạt của mục đang chọn, khối ghi chú |
   | `--color-danger` | `#b3261e` | `text-danger`, `border-danger` | Lỗi |
   | `--color-danger-soft` | `#fbe9e7` | `bg-danger-soft` | Nền khối báo lỗi chung |

   Đặt tên `ink` thay vì `text` để tránh class lủng củng như `text-text`. Đặt `canvas` thay vì `bg` để tránh `bg-bg`.
3. Khối `@layer base { ... }` cho phần tử gốc: `body` dùng `bg-canvas text-ink font-sans text-sm antialiased` (viết bằng `@apply` ở đây là hợp lý vì chỉ có một chỗ), `::selection` dùng nền `accent-soft`, và bật số đều cột bằng `font-variant-numeric: tabular-nums` cho bảng điểm, lịch thi sau này.
4. Ở đầu `main.jsx`, import font: các file `400.css`, `500.css`, `600.css` của `@fontsource/ibm-plex-sans`, sau đó import `./index.css`.

Vì sao dùng `@theme` thay vì màu có sẵn như `blue-700`:
- Màu đã duyệt ở mockup được đặt tên theo **vai trò** (`accent`, `muted`, `danger`). Muốn đổi màu nhấn chỉ cần sửa một dòng, không phải tìm và thay `blue-700` ở hàng trăm chỗ.
- Bảng màu có sẵn của Tailwind không có đúng các mã màu trong mockup.

Nguyên tắc dùng Tailwind trong dự án:
- Viết class trực tiếp trên JSX. **Không** dồn mọi thứ vào `@apply` trong CSS, vì như vậy mất lợi thế của Tailwind. Muốn dùng lại một bộ class thì tạo **component** (`Button`, `TextField`), không tạo class CSS.
- Class phải viết **đầy đủ dưới dạng chuỗi tĩnh**. Tailwind quét mã nguồn để sinh CSS, nên `` `bg-${color}` `` sẽ không được sinh ra. Nếu cần chọn theo biến, hãy dùng một object ánh xạ, ví dụ `{ primary: "bg-accent text-white", default: "bg-panel border border-line" }`.
- Responsive theo hướng mobile trước: class không tiền tố áp dụng cho điện thoại, `lg:` áp dụng từ 1024px trở lên.

Bảng đổi từ CSS của mockup sang class Tailwind, để bạn đối chiếu khi viết:

| Trong mockup (`shared.css`) | Gợi ý class Tailwind |
|---|---|
| `.f input` (ô nhập) | `h-[42px] w-full rounded-lg border border-line-strong bg-panel px-3 text-[15px] outline-none focus:border-accent focus:ring-3 focus:ring-accent/15` |
| `.f--err input` | thêm `border-danger focus:border-danger focus:ring-danger/15` |
| `.f__err` (dòng lỗi) | `flex items-center gap-1.5 text-[13px] text-danger` |
| `.btn--primary` | `inline-flex h-[42px] items-center justify-center gap-1.5 rounded-lg bg-accent px-4 font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50` |
| `.login` (bố cục 2 cột) | `grid min-h-dvh lg:grid-cols-[minmax(0,520px)_1fr]` |
| `.login__form` | `flex flex-col bg-panel px-5 py-8 lg:border-r lg:border-line lg:px-16 lg:py-14` |

### 1.5 Bước 2: `src/utils/tokenStore.js`

Làm gì: một module JavaScript thường (không phải hook) giữ một biến token ở cấp module, export 3 hàm `getToken()`, `setToken(token)`, `clearToken()`.

Vì sao không để token trong state React:
- Interceptor của axios chạy **bên ngoài** cây component nên không gọi được `useContext`. Nó cần một chỗ đọc token đồng bộ.
- `AuthProvider` vẫn giữ `user` trong state để giao diện tự render lại. Còn token là chi tiết kỹ thuật, giao diện không cần biết.

Vì sao không dùng `localStorage`: xem mục "Ý tưởng / quyết định" trong CHANGELOG. Hệ quả là tải lại trang sẽ mất token, và bước 6 xử lý việc này bằng refresh.

### 1.6 Bước 3: `src/utils/getErrorMessage.js`

Làm gì: hàm nhận một lỗi bất kỳ và trả về một câu tiếng Việt.
- Có phản hồi từ server: dùng `error.response.data.message`.
- Không có phản hồi (API chưa chạy, mất mạng): trả câu kiểu "Không kết nối được máy chủ. Kiểm tra mạng hoặc thử lại sau."
- Trường hợp còn lại: một câu mặc định.

Vì sao: giữ đúng câu lỗi mà backend đã viết sẵn bằng tiếng Việt, và mọi màn hình xử lý lỗi theo cùng một cách.

### 1.7 Bước 4: `src/apis/axiosClient.js`

Làm gì:
1. Tạo instance bằng `axios.create` với `baseURL: "/api/v1"` và `withCredentials: true`.
2. **Interceptor request**: nếu `getToken()` có giá trị thì gắn header `Authorization: Bearer <token>`.
3. **Interceptor response, nhánh lỗi**: khi gặp 401 thì:
   - Bỏ qua nếu chính request đó là `/auth/login` hoặc `/auth/refresh` (tránh vòng lặp vô hạn).
   - Bỏ qua nếu request đã được thử lại một lần (đánh dấu bằng một cờ trên `config`, ví dụ `config._retry = true`).
   - Còn lại: gọi refresh qua **hàm dùng chung có gộp lệnh gọi** (xem bên dưới), lưu token mới bằng `setToken`, gắn lại header và gửi lại request gốc.
   - Nếu refresh thất bại: `clearToken()`, báo cho `AuthProvider` rằng phiên đã hết (đăng ký callback hoặc phát một sự kiện), rồi trả lỗi ra ngoài.
4. Export thêm hàm `refreshAccessToken()` dùng chung. Hàm này giữ một biến `refreshPromise` ở cấp module:
   - Nếu `refreshPromise` đang có giá trị thì trả lại chính promise đó.
   - Nếu chưa có thì tạo mới bằng cách gọi `POST /auth/refresh`, và khi xong (thành công hay thất bại) thì đặt lại `refreshPromise = null`.

Vì sao phải gộp: refresh token chỉ dùng được một lần. Hai request cùng bị 401, hoặc `StrictMode` chạy effect hai lần, sẽ sinh ra hai lệnh refresh song song. Lệnh thứ hai dùng token đã bị xoá nên nhận 401 và người dùng bị đăng xuất vô cớ.

### 1.8 Bước 5: `src/apis/authApi.js`

Làm gì: export object `authApi` gồm các hàm nhỏ, mỗi hàm gọi `axiosClient` và **trả về `response.data.data`**, tức phần dữ liệu thật:
- `login({ username, password })`
- `refresh()`: gọi `refreshAccessToken()` ở bước 4 thay vì tự gọi lại `/auth/refresh`
- `getMe()`
- `logout()`
- `changePassword({ oldPassword, newPassword })` (chuẩn bị sẵn cho mục Đổi mật khẩu)

Vì sao bóc `data.data` ngay tại đây: các tầng phía trên chỉ làm việc với dữ liệu, không cần biết vỏ `{ datetime, errorCode, success, message }`.

### 1.9 Bước 6: `src/context/authContext.js` và `src/context/AuthProvider.jsx`

`authContext.js`: chỉ chứa `createContext(null)` và export context đó.

`AuthProvider.jsx` quản lý:
- State `user` (object hoặc `null`).
- State `status` gồm 3 giá trị: `"checking"` (đang khôi phục phiên), `"authenticated"`, `"guest"`.
- Hàm `login(username, password)`: gọi `authApi.login`, tách `token` ra khỏi data (`const { token, ...user } = data`), `setToken(token)`, `setUser(user)`, `setStatus("authenticated")`. Không bắt lỗi ở đây mà để trang đăng nhập bắt và hiển thị.
- Hàm `logout()`: gọi `authApi.logout()` trong `try/finally`. Dù API lỗi, trong `finally` vẫn `clearToken()`, `setUser(null)`, `setStatus("guest")`.
- `useEffect` chạy một lần khi app mở để khôi phục phiên: gọi `authApi.refresh()` rồi `setToken`, sau đó `authApi.getMe()` rồi `setUser`, cuối cùng `setStatus("authenticated")`. Nếu lỗi thì `setStatus("guest")`.
- Đăng ký callback "phiên hết hạn" với `axiosClient` (bước 4) để tự chuyển về `"guest"` khi refresh thất bại giữa chừng.
- Giá trị truyền xuống: `{ user, status, login, logout }`. Bọc bằng `useMemo` để các component con không render lại thừa.

Vì sao cần `status` thay vì chỉ kiểm tra `user`: lúc mới tải trang, `user` là `null` nhưng có thể người dùng vẫn đang đăng nhập (chưa refresh xong). Nếu chỉ dựa vào `user`, `ProtectedRoute` sẽ đá người dùng về trang đăng nhập trong tích tắc rồi mới quay lại.

Vì sao tách 2 file: rule `react/only-export-components` trong `.oxlintrc.json`.

### 1.10 Bước 7: `src/hooks/useAuth.js`

Làm gì: gọi `useContext(AuthContext)`. Nếu kết quả là `null` thì `throw new Error("useAuth phải dùng bên trong AuthProvider")`.

Vì sao: component chỉ cần `const { user, login } = useAuth()`, không phải import context. Câu lỗi rõ ràng giúp phát hiện ngay khi quên bọc Provider.

### 1.11 Bước 8: các thành phần form

`components/form/TextField.jsx`, nhận props: `id`, `label`, `error`, `hint` và phần còn lại (`...inputProps`) truyền thẳng vào `<input>`.
- `<label htmlFor={id}>` luôn hiển thị phía trên ô nhập, không dùng placeholder thay cho label.
- Khi có `error`: thêm `aria-invalid="true"` và `aria-describedby` trỏ tới đoạn lỗi có `id` riêng, đặt đoạn lỗi ngay dưới ô nhập.

`components/form/PasswordField.jsx`: dựa trên `TextField`, thêm nút icon (`Eye` / `EyeSlash` của Phosphor) để chuyển `type` giữa `password` và `text`. Nút cần có `aria-label` ("Hiện mật khẩu" / "Ẩn mật khẩu") và `type="button"` để không vô tình submit form.

`components/ui/Button.jsx`: nhận `variant` (`"primary"` hoặc mặc định) và `loading`. Khi `loading` thì `disabled` và đổi chữ, ví dụ "Đang đăng nhập...".

Cách dùng Tailwind trong 3 component này:
- Giữ class gốc trong một hằng chuỗi. Dùng `clsx` để thêm class theo điều kiện, ví dụ `clsx(baseInput, error && errorInput, className)`.
- Nhận thêm prop `className` và ghép vào cuối, để nơi dùng có thể chỉnh nhẹ (ví dụ `w-full`) mà không phải sửa component.
- `Button` chọn class theo `variant` bằng một object ánh xạ (xem nguyên tắc ở mục 1.4), không ghép chuỗi động.
- Lấy class gợi ý từ bảng đối chiếu ở mục 1.4.

### 1.12 Bước 9: `src/pages/LoginPage/LoginPage.jsx`

Bố cục: cột trái là form (logo, tiêu đề "Đăng nhập", 2 ô nhập, nút). Cột phải là ảnh khuôn viên trường `src/assets/image.png` phủ kín cột. Trước đây cột phải là khối "Lần đầu đăng nhập" như trong mockup, đã bỏ ngày 2026-10-30. Trên điện thoại chỉ có một cột form, từ `lg:` (1024px) trở lên mới chia 2 cột. Trang này không cần file CSS riêng: mọi style đều là class Tailwind trên JSX.

Cách đưa ảnh vào cột phải:
- `import campusImage from '../../assets/image.png'`: Vite xử lý file ảnh khi build (thêm mã băm vào tên file để trình duyệt cache) và trả về đường dẫn dạng chuỗi để dùng trong `src`. Ảnh đặt trong `src/assets` thì phải import như vậy. Ảnh đặt trong `public/` thì mới gọi thẳng bằng `/ten-anh.png`.
- Thẻ bọc `relative hidden bg-accent lg:block`: ẩn trên điện thoại để form hiện ngay, không bắt sinh viên kéo qua một tấm ảnh lớn. `bg-accent` là màu nền navy hiện ra trong lúc ảnh đang tải.
- Ảnh `absolute inset-0 size-full object-cover`: phủ kín cột, tự cắt bớt phần thừa mà không bị méo. Ảnh dùng `absolute` nên không làm cột cao thêm: chiều cao cột theo cột form (`min-h-dvh`).
- `object-[68%_center]`: khi cột hẹp hơn tỉ lệ ảnh, phần bị cắt sẽ lệch sang trái, giữ lại nhóm sinh viên ở giữa bên phải ảnh.
- `alt=""`: ảnh chỉ để trang trí, không mang thông tin. Alt rỗng giúp trình đọc màn hình bỏ qua ảnh thay vì đọc một câu mô tả thừa.

State cục bộ:
- `values`: `{ username, password }`
- `errors`: `{ username?, password? }`, lỗi theo từng ô
- `formError`: lỗi chung từ server, ví dụ sai mật khẩu
- `submitting`: boolean

Luồng `onSubmit`:
1. `event.preventDefault()`.
2. Kiểm tra phía client với cùng câu chữ của backend: tài khoản rỗng (sau khi `trim`) thì "Tài khoản không được để trống", mật khẩu rỗng thì "Mật khẩu không được để trống". Có lỗi thì đặt `errors`, focus vào ô lỗi đầu tiên rồi dừng.
3. `setSubmitting(true)`, gọi `await login(username.trim(), password)` từ `useAuth()`.
4. Thành công: điều hướng tới trang người dùng định vào trước đó (`location.state?.from`), nếu không có thì về `/`. Dùng `navigate(..., { replace: true })` để nút Back không quay lại trang đăng nhập.
5. Thất bại: `setFormError(getErrorMessage(err))`. Với lỗi 401 nên xoá ô mật khẩu và focus lại ô đó.
6. Trong `finally`: `setSubmitting(false)`.

Vì sao kiểm tra cả ở client dù server đã kiểm tra: phản hồi tức thì, không tốn một lượt gọi mạng. Server vẫn là chốt cuối cùng.

Chi tiết nên có:
- `autoComplete="username"` cho ô tài khoản và `autoComplete="current-password"` cho ô mật khẩu, để trình duyệt gợi ý mật khẩu đã lưu.
- Vùng lỗi chung đặt `role="alert"` để trình đọc màn hình đọc lên.
- Gõ lại vào ô nào thì xoá lỗi của ô đó.

### 1.13 Bước 10: `src/pages/HomePage/HomePage.jsx` (tạm)

Hiển thị "Xin chào {user.fullName}", vai trò `user.role`, và một nút Đăng xuất gọi `logout()`. Mục đích là kiểm tra trọn vòng đăng nhập, tải lại trang và đăng xuất. Sau này trang này được thay bằng Trang chủ thật nằm trong layout có sidebar.

### 1.14 Bước 11: `src/routes/`

`ProtectedRoute.jsx`, dùng làm element cha bọc các route cần đăng nhập:
- `status === "checking"`: hiện màn chờ đơn giản (khung xương hoặc dòng "Đang kiểm tra phiên đăng nhập").
- `status === "guest"`: `<Navigate to="/dang-nhap" replace state={{ from: location }} />`.
- `"authenticated"`: `<Outlet />`.

`GuestRoute.jsx` làm ngược lại: đã đăng nhập thì chuyển về `/`. Dùng cho trang đăng nhập.

`index.jsx`: tạo router bằng `createBrowserRouter` với:
- `/dang-nhap`: `GuestRoute` bọc `LoginPage`
- `/`: `ProtectedRoute` bọc `HomePage` (sau này là `MainLayout` có sidebar, bên trong mới là các trang)
- `*`: trang 404 đơn giản

Export router để `main.jsx` dùng. Lưu ý rule `only-export-components`: file này chỉ export router (một hằng số, được rule cho phép nhờ `allowConstantExport`).

### 1.15 Bước 12: `src/main.jsx`

Thứ tự bọc: `StrictMode` > `AuthProvider` > `RouterProvider router={router}`. Import font và `index.css` ở đầu file. Có thể xoá `App.jsx` vì router đã thay vai trò của nó.

Vì sao `AuthProvider` nằm ngoài router: state đăng nhập phải tồn tại trước khi router quyết định cho vào trang nào. Hệ quả là trong `AuthProvider` không dùng được `useNavigate`. Việc điều hướng do các route và trang đảm nhận, đúng với nguyên tắc tách trách nhiệm.

### 1.16 Kiểm tra sau khi code

- [ ] Bỏ trống cả 2 ô rồi bấm Đăng nhập: hiện lỗi dưới từng ô, không có request nào trong tab Network.
- [ ] Sai mật khẩu: hiện "Tài khoản hoặc mật khẩu không đúng", nút bật lại, ô mật khẩu được xoá.
- [ ] Tắt API rồi đăng nhập: hiện câu lỗi kết nối, trang không trắng.
- [ ] Đăng nhập `24100001` / `Student@123`: chuyển về `/`, thấy "Sinh viên mẫu".
- [ ] Tab Application > Cookies: có `refreshToken`, cột HttpOnly được đánh dấu.
- [ ] Tải lại trang (F5): vẫn đăng nhập. Tab Network chỉ có **một** request `refresh`, kể cả khi bật StrictMode.
- [ ] Đang ở trang đăng nhập mà đã đăng nhập rồi: tự chuyển về `/`.
- [ ] Gõ thẳng `/` khi chưa đăng nhập: về `/dang-nhap`. Đăng nhập xong quay lại đúng trang đã định vào.
- [ ] Đăng xuất: về trang đăng nhập, cookie bị xoá. Tải lại trang vẫn ở trạng thái chưa đăng nhập.
- [ ] `npm run lint` không có cảnh báo.

### 1.17 Lỗi hay gặp

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| Lỗi CORS trong console | Gọi thẳng `http://localhost:4040` thay vì `/api/...` qua proxy, hoặc `CORS_ORIGIN` không khớp cổng web |
| Tải lại trang là mất đăng nhập | Thiếu `withCredentials: true`, hoặc proxy chưa cấu hình nên cookie không được gửi |
| F5 lúc được lúc không, có 2 request refresh | Chưa gộp lệnh refresh (bước 4) và StrictMode chạy effect hai lần |
| Vòng lặp request vô hạn khi token hết hạn | Interceptor thử refresh cho chính `/auth/refresh`, hoặc thiếu cờ `_retry` |
| `user.token` xuất hiện trong state | Quên tách `token` khỏi data của API đăng nhập |
| Bị đá về trang đăng nhập rồi quay lại ngay | `ProtectedRoute` không xử lý trạng thái `"checking"` |
| oxlint cảnh báo `only-export-components` | Một file `.jsx` export cả component lẫn context, hook hoặc hằng số không phải component |
| Class Tailwind không có tác dụng gì | Thiếu `tailwindcss()` trong `plugins` của Vite, hoặc `main.jsx` chưa import `index.css` |
| `bg-accent` không ra màu | Biến trong `@theme` thiếu tiền tố `--color-`, hoặc gõ sai tên |
| Class ghép bằng biến không ăn | Viết dạng `` `text-${tone}` ``. Tailwind không sinh được, cần viết đủ tên class |
| Hai class xung đột (ví dụ `border-line` và `border-danger`) cho kết quả khó đoán | Thứ tự trong `className` không quyết định thắng thua. Chỉ thêm class lỗi và **bỏ** class thường khi có lỗi (dùng `clsx` với điều kiện ngược nhau) |
| `does not provide an export named 'default'` | Có `import x from './file'` nhưng file đó thiếu `export default x` |
| F5 khi đã đăng nhập thì spinner quay mãi | Khôi phục phiên xong chỉ `setUser` mà quên `setStatus('authenticated')` |
| Bấm Đăng xuất vẫn ở trang chủ | `resetSession()` đặt trong `catch` nên chỉ chạy khi API lỗi. Phải đặt trong `finally` |
| Chưa đăng nhập mà vào `/tin-tuc` thì ra trang 404 | `<Navigate to="login">` thiếu dấu `/`, nên đường dẫn tương đối thành `/tin-tuc/login` |
| Để trống ô tài khoản mà form vẫn gửi lên API | Gán lỗi vào sai khoá (`errors.message` thay vì `errors.username`) |

### 1.18 Giải thích code thực tế

Đây là code bạn tự gõ, được rà lại ngày 2026-10-30. Cấu trúc và cách làm khớp với hướng dẫn. Lần rà này tìm ra 5 lỗi và đã sửa (xem bảng 1.17 và CHANGELOG):

- **`AuthProvider.jsx`, phần khôi phục phiên:** lỗi nằm ở **trạng thái**, không nằm ở dữ liệu. Sau khi gọi `refresh()` rồi `getMe()`, cần cập nhật cả hai: `user` để biết là ai, và `status` để `ProtectedRoute` biết đã kiểm tra xong. Thiếu `status` thì app đứng mãi ở `'checking'`.
- **`AuthProvider.jsx`, hàm `logout`:** `try / catch / finally`. `catch` rỗng để nuốt lỗi API, vì mạng hỏng thì người dùng vẫn phải đăng xuất được. `finally` chạy trong mọi trường hợp, nên `resetSession()` đặt ở đó.
- **`ProtectedRoute.jsx`:** đường dẫn trong `Navigate` hay `Link` không có `/` ở đầu được tính **tương đối** so với route hiện tại. Đường dẫn chuyển tới trang cố định như `/login` luôn phải viết tuyệt đối.
- **`FullPageLoader.jsx`:** khai báo prop `message` nhưng không in ra. Vì vậy `role="status"` rỗng, trình đọc màn hình không có gì để đọc. Lint cũng báo cảnh báo "biến không dùng".
- **`LoginPage.jsx`, hàm `validate`:** tên khoá lỗi phải trùng với tên ô (`username`, `password`), vì `TextField` đọc lỗi qua `errors.username`.

Thay đổi nhỏ khác:
- `getErrorMessage.js`: câu báo lỗi có thêm hướng xử lý cho người dùng.
- `index.html`: tiêu đề tab đổi thành "Cổng Đào tạo".

Điểm còn có thể làm gọn: file thì dùng dấu chấm phẩy, file thì không, nháy đơn và nháy kép cũng lẫn lộn. Code vẫn chạy, chỉ là đọc không đồng đều.

---

## Phần 2: Khung giao diện sau đăng nhập

Trạng thái: bạn đã tự gõ xong, được rà lại ngày 2026-10-31. Lint sạch, build được, chạy thử đúng với API thật.

### 2.1 Cấu trúc route

```
ProtectedRoute          kiểm tra đăng nhập (checking / guest / authenticated)
└─ AppLayout            Topbar + Sidebar + <Outlet />
   ├─ /                 HomePage
   └─ các đường dẫn     ComingSoonPage (tạm, cho tới khi có trang thật)
      lấy từ NAV_LINKS
```

Một route không có `path` mà chỉ có `element` được gọi là **route bố cục**. Nó không thêm gì vào URL, chỉ bọc giao diện quanh các route con. Ở đây có hai route bố cục lồng nhau: `ProtectedRoute` lo việc đăng nhập, `AppLayout` lo phần khung. Trang con không cần biết hai việc đó.

### 2.2 Từng file

| File | Làm gì |
|---|---|
| `routes/navigation.js` | Nơi duy nhất khai báo menu. `NAV_ITEMS` có cấu trúc cây (nhóm và mục con) để vẽ sidebar. `NAV_LINKS` là danh sách phẳng để sinh route và tìm tiêu đề trang. `findNavLink(pathname)` tìm mục ứng với URL hiện tại |
| `utils/userDisplay.js` | Hàm thuần: `getInitials` lấy chữ đầu của họ và tên làm avatar, `getUserSubtitle` hiện MSSV với sinh viên hoặc tên vai trò với người khác |
| `components/ui/Logo.jsx` | Logo dùng chung |
| `components/ui/PageHeader.jsx` | Breadcrumb (nhóm > trang), `h1`, mô tả. Trang nào cũng dùng để tiêu đề thống nhất |
| `layouts/AppLayout/AppLayout.jsx` | Lưới 2 cột từ `lg`. Giữ state `menuOpen` cho điện thoại, nhấn Esc để đóng, có lớp nền tối, link "Bỏ qua tới nội dung chính" và `<Outlet />` |
| `layouts/AppLayout/Topbar.jsx` | Nút mở menu (chỉ hiện trên điện thoại), logo, tên và MSSV, avatar |
| `layouts/AppLayout/Sidebar.jsx` | `NavItem` (mục đơn), `NavGroup` (nhóm thu gọn được), cuối sidebar có Đổi mật khẩu và Đăng xuất |
| `pages/ComingSoonPage/` | Trang tạm, đọc tiêu đề từ `findNavLink` |
| `routes/index.jsx` | Sinh route cho mọi mục trong menu bằng `NAV_LINKS.map(...)` |

### 2.3 Các kỹ thuật chính

- **`NavLink`** tự thêm `aria-current="page"` và truyền `isActive` vào hàm `className` và `children`. Mục Trang chủ cần `end`, nếu không thì `/` khớp với mọi đường dẫn và mục Trang chủ luôn sáng.
- **Nhóm đang chứa trang hiện tại** được xác định bằng `pathname.startsWith(item.basePath)`, nên mọi mục con của một nhóm phải nằm dưới cùng `basePath`.
- **`useId()`** tạo id duy nhất để nối nút nhóm với danh sách con (`aria-controls`). Nhờ vậy không phải tự đặt id bằng tay.
- **Sidebar trên điện thoại:**
  - Là ngăn kéo `fixed` và đi ra ngoài màn hình bằng `-translate-x-full`. Kèm `invisible` để link bị giấu không nhận phím Tab.
  - `transition-[translate,visibility]`: Tailwind v4 dùng thuộc tính CSS `translate` chứ không phải `transform`.
  - Từ `lg` trở lên thì đổi sang `lg:sticky lg:translate-x-0 lg:visible`.
- **Đóng menu khi chuyển trang:** truyền `onNavigate={closeMenu}` vào `onClick` của từng `NavLink`. Không dùng `useEffect` theo dõi `pathname`, vì effect chạy sau khi đã vẽ xong, gây thêm một lần render và menu nháy.
- **Esc:** chỉ gắn `keydown` khi menu đang mở, và gỡ ra trong hàm dọn dẹp của `useEffect`.
- **Vùng bấm:** mục menu cao 44px trên điện thoại (`h-11`) và 36px trên máy tính (`lg:h-9`).
- **Thang khoảng cách của Tailwind v4** nhận mọi bội số của 0.25rem, nên `h-13` (52px), `mb-4.5` (18px) và `ml-4.75` (19px) đều hợp lệ, không cần viết `h-[52px]`. Bản của bạn dùng cách này, gọn hơn hướng dẫn.

### 2.4 Code thực tế khác hướng dẫn

- **Đường dẫn bằng tiếng Anh** (`/news`, `/study-corner/check-grade`...), cho thống nhất với `/login`.
- **Menu ít mục hơn mockup:** bỏ Tiến độ học tập, Điểm rèn luyện, Đăng ký thi lại, Đăng ký giấy tờ. Mockup trong `test/` vẫn còn các mục này.
- **`path: 'login'`** viết không có `/`. Vẫn đúng, vì route cha không có path nên đường dẫn này được tính từ gốc.
- **Logo ghi "Cổng đào tạo"**, trong khi tiêu đề tab và trang đăng nhập ghi "Cổng Đào tạo".

### 2.5 Kiểm tra đã chạy (2026-10-31, API thật, tài khoản `24100001`)

- Đăng nhập thì vào `/` và hiện "Xin chào, Sinh viên mẫu".
- Bấm lần lượt 9 link trong sidebar: link nào cũng mở đúng trang và mục tương ứng được tô sáng.
- F5 ở `/study-corner/check-grade` vẫn giữ trang, breadcrumb hiện "Góc học tập > Tra cứu điểm".
- Thu và mở nhóm: `aria-expanded` đổi đúng, các mục con ẩn và hiện theo.
- Điện thoại (390px): menu đóng sẵn. Mở menu rồi đóng được bằng Esc và bằng cách bấm nền tối. Bấm một mục thì chuyển trang và menu tự đóng.
- Đăng xuất thì về `/login`. Vào lại `/news` sau khi đăng xuất thì bị chuyển về `/login`.
- Ảnh chụp: `test/khung-1-home.png` đến `test/khung-4-mobile-menu.png`.

---

## Phần 3: Tin tức

Code mẫu đã đưa trong chat; Phi tự gõ. Các file: `apis/newsApi.js`, `hooks/useAsync.js`, `utils/format.js`, `components/ui/{LoadingState,EmptyState,ErrorState,StatusBadge}.jsx`, `pages/NewsPage/{NewsPage,NewsFilters,NewsList,NewsPlaceholder,NewsReader,NewsComments}.jsx`, route lồng `/news` > `index` + `:newsId`.

### 3.1 Rà code lần 1 (2026-11-01)

Kiểm tra: so với bản đã chạy thử với API thật, `oxlint` (2 cảnh báo), `vite build` (thành công: build không phát hiện được biến chưa import nằm ngoài JSX).

| File:dòng | Lỗi | Hậu quả | Cách sửa |
|---|---|---|---|
| `NewsReader.jsx:7` | Thiếu `Link` trong import `react-router` | Mở tin bất kỳ: `Link is not defined`, trang trắng | Thêm `Link` vào import |
| `NewsReader.jsx` (đầu file) | Thiếu `import { formatFileSize, formatNumber } from '../../utils/format'` | `formatNumber is not defined` | Thêm dòng import |
| `NewsReader.jsx:106` | `facts.map(fact => { <div/> })`: ngoặc nhọn mà không `return` | 4 ô Đơn vị, Hiệu lực, Đến hết, Lượt xem trống | Đổi `{ }` thành `( )` |
| `newsApi.js` | `'/new/categories'` | API 404, không có tab chuyên mục | `'/news/categories'` |
| `newsApi.js` | `'news/departments'` thiếu `/` | Vẫn chạy (axios tự nối `/`), nhưng không đồng bộ | `'/news/departments'` |
| `NewsPage.jsx:17` | `params.departmentId;` | Không gửi bộ lọc đơn vị lên API | `params.departmentId = departmentId` |
| `NewsFilters.jsx:32` | `<option value={departmentId}>` | Mọi lựa chọn mang cùng giá trị, không chọn được đơn vị | `value={department.id}` |
| `NewsPage.jsx:78` | Thiếu `keyword={keyword}` khi gọi `NewsFilters` | `useState(undefined)`: cảnh báo uncontrolled → controlled, ô tìm bị xoá chữ sau khi tìm | Truyền thêm `keyword={keyword}` |
| `NewsComments.jsx:60` | `<p id="comment-error">` thiếu `{error}` | Chỉ hiện icon đỏ, không có chữ | Thêm `{error}` sau icon |
| `NewsComments.jsx:~88` | Thiếu `<p className="mt-0.5 break-words whitespace-pre-line">{comment.content}</p>` | Chỉ thấy tên và giờ, không thấy nội dung bình luận | Thêm dòng đó dưới thẻ `<p>` tên |
| `NewsList.jsx:15` | `if (loading)` thay vì `if (!data)` | Mỗi lần đổi bộ lọc danh sách bị xoá trắng; `opacity-60`/`aria-busy` phía dưới không bao giờ dùng tới | `if (!data)` |
| `NewsList.jsx:42` | Thiếu `<span>` bọc tên chuyên mục + lượt xem | Không hiện chuyên mục | Bọc lại như code mẫu |

Không phải lỗi: `scrollbar-none` (Tailwind 4.3 có sẵn, sinh `scrollbar-width:none`), `path: 'news'` không có `/` (vẫn đúng vì route cha không có path), đổi tên `err` thành `error` trong `catch` (chỉ che biến state trong khối `catch`, vẫn đúng), `iosString` (tên biến gõ nhầm, vẫn chạy). `MAX_LENGTH = 100`: API không giới hạn, 100 ký tự hơi ngắn cho bình luận.

### 3.2 Sau khi sửa (2026-11-01)

Mọi lỗi trong bảng 3.1 đã được sửa. Phi tự sửa phần lớn; Claude sửa nốt `'/news/departments'`, import `formatFileSize`, và `<span>` chứa tên chuyên mục ở `NewsList.jsx`.

Bài học:
- **`vite build` thành công không có nghĩa là không thiếu import.** Build không báo lỗi khi dùng một biến chưa import mà biến đó không nằm trong JSX, ví dụ `formatNumber(...)`. `oxlint` chỉ bắt được biến thiếu trong JSX (`jsx-no-undef`, như `<Link>`).
- **Arrow function có `{ }` phải có `return`.** Viết `map(x => ( <div/> ))` thì trả về JSX luôn. Viết `map(x => { <div/> })` thì trả về `undefined`.
- **`value` của `<option>` phải lấy từ phần tử đang lặp** (`department.id`), không lấy từ state (`departmentId`).

### 3.3 API: mỗi tài khoản chỉ tính 1 lượt xem (2026-11-02)

**Trước đây:** mỗi lần gọi `GET /news/:id` đều cộng 1 vào `views`. F5 nhiều lần hoặc `StrictMode` gọi 2 lần đều làm lượt xem tăng.

**Bây giờ:** có thêm bảng `news_views` ghi lại tài khoản nào đã xem tin nào.

```
GET /news/:id  (đã đăng nhập)
  └─ NewsService.getNewsById(id, req.user.id)
       ├─ findNewsDetail(id)                 404 nếu không có hoặc tin đã ẩn
       ├─ recordView(id, userId)
       │    ├─ NewsViewModel.create(...)     tạo được  → true  (lần đầu xem)
       │    └─ UniqueConstraintError         đã có dòng → false (đã xem rồi)
       └─ true thì news.increment("views")
```

- **Chỉ mục duy nhất `(news_id, user_id)`** khai báo trong `indexes` của model. Vì có `underscored: true`, tên cột phải viết dạng `news_id`.
- **Vì sao không dùng `findOrCreate` hoặc "tìm rồi mới tạo":** hai request đến cùng lúc đều thấy chưa có dòng nào, nên đều cộng. Để database chặn bằng chỉ mục duy nhất là cách chắc chắn nhất.
- **Các lỗi khác vẫn được ném ra** (`throw e`), chỉ riêng lỗi trùng mới bị bỏ qua.
- **Cột `views` vẫn giữ** để danh sách tin không phải đếm bảng `news_views` mỗi lần tải. Nếu sau này muốn tính lại từ đầu thì đặt `views` bằng số dòng `news_views` của từng tin.
- **Web không phải sửa gì:** API vẫn trả về `views` như cũ.

---

## Phần 4: Component dùng chung

### 4.1 `components/ui/DataTable.jsx` (2026-11-02)

Bảng dữ liệu dùng cho mọi trang có hàng và cột. Trang chỉ khai báo cột và truyền dữ liệu.

```jsx
<DataTable
  caption="Danh sách văn bản"
  columns={[
    { key: 'code', header: 'Số hiệu', nowrap: true, className: 'text-muted' },
    { key: 'title', header: 'Tên văn bản', className: 'min-w-56' },
    { key: 'department', header: 'Đơn vị', render: row => row.department.name },
    { key: 'credits', header: 'Tín chỉ', align: 'right' },
  ]}
  rows={items}
  busy={loading}
  empty={{ title: 'Chưa có văn bản nào' }}
/>
```

| Prop | Ý nghĩa |
|---|---|
| `columns` | Mỗi cột: `key` (tên trường, cũng là key của cột), `header`, `render(row, index)` nếu cần hiển thị riêng, `align` (`left`, `center`, `right`), `nowrap`, `className` |
| `rows`, `rowKey` | Dữ liệu và trường làm key của dòng (mặc định `'id'`, hoặc truyền hàm) |
| `caption` | Tên bảng cho trình đọc màn hình (ẩn bằng `sr-only`) |
| `minWidth` | Mặc định 640px. Hẹp hơn thì cuộn ngang. Bảng ít cột truyền `0` |
| `busy` | Đang tải lại: giữ dữ liệu cũ, làm mờ, thêm `aria-busy` |
| `footer` | Các thẻ `<tr>` của dòng tổng, nằm trong `<tfoot>` |
| `empty` | Props cho `EmptyState` khi `rows` rỗng |

Các kỹ thuật chính:
- **`getCellValue`:** cột có `render` thì gọi `render(row, index)`, không thì đọc `row[column.key]`. Nhờ vậy cột đơn giản chỉ cần khai báo `key`.
- **`alignClass` ghi đủ tên class**, vì Tailwind không sinh CSS cho tên class ghép chuỗi như `` `text-${align}` ``.
- **`tabular-nums` cho cột căn phải:** các chữ số rộng bằng nhau nên số ở các dòng thẳng hàng.
- **Khung `relative overflow-x-auto`:** cuộn ngang trong khung. `relative` giữ `caption` `sr-only` (position absolute) ở bên trong, nếu không cả trang sẽ cuộn thêm (lỗi đã gặp ở trang Tin tức, mục 3).
- **`th scope="col"`:** trình đọc màn hình đọc tên cột kèm từng ô.
- **Phần nào bảng không lo:** đang tải lần đầu, lỗi, phân trang. Trang tự dùng `LoadingState`, `ErrorState`.

Kiểm tra: xem mục 2026-11-02 "Component bảng dùng chung `DataTable`" trong `CHANGELOG.md`.

---

## Phần 5: Bước 0, các bảng đào tạo dùng chung (Phi và Dương)

Theo bản đề xuất đã chốt với Dương. Claude viết thẳng vào `qldt_api` theo yêu cầu của Phi, code không có chú thích.

### 5.1 Bảng

| Bảng (model) | Cột | Ràng buộc |
|---|---|---|
| `students` (`StudentModel`) | `userId`, `studentCode`, `className`, `majorName`, `cohort` | `userId`, `studentCode` duy nhất. Họ tên lấy từ `users.fullName` |
| `semesters` (`SemesterModel`) | `code`, `name`, `academicYear`, `startDate`, `endDate`, `registrationStart`, `registrationEnd` | `code` duy nhất, ngày dạng `DD/MM/YYYY` |
| `courses` (`CourseModel`) | `code`, `name`, `credits` | `code` duy nhất |
| `course_prerequisites` (`CoursePrerequisiteModel`) | `courseId`, `prerequisiteCourseId` | Cặp duy nhất. Bảng mới, thêm vào so với `PHANCHIA.md` |
| `class_sections` (`ClassSectionModel`) | `code`, `courseId`, `semesterId`, `lecturerName`, `capacity`, `status` | `code` duy nhất. `status`: `open`, `closed`, `cancelled` (`CLASS_SECTION_STATUS`) |
| `class_sessions` (`ClassSessionModel`) | `classSectionId`, `dayOfWeek` (2 đến 8, 8 là Chủ nhật), `startPeriod`, `endPeriod`, `room` | |
| `enrollments` (`EnrollmentModel`) | `studentId`, `classSectionId`, `status`, `registeredAt` | Cặp (sinh viên, lớp) duy nhất. `status`: `registered`, `cancelled` (`ENROLLMENT_STATUS`) |

Đây là quy tắc chung của cả hai người. Lượt đăng ký có `status: "cancelled"` không được hiện ở lịch học và lịch thi, và không được tính điểm. Khi viết code thì dùng hằng số `ENROLLMENT_STATUS`, không gõ tay chuỗi.

### 5.2 Quan hệ (`models/index.ts`)

- `UserModel` có một `StudentModel` (`as: "student"`). Ngược lại, `StudentModel` thuộc về `UserModel` (`as: "user"`).
- `CourseModel.belongsToMany(CourseModel, { through: CoursePrerequisiteModel, as: "prerequisites" })`: lấy danh sách môn tiên quyết bằng `include: [{ model: CourseModel, as: "prerequisites" }]`.
- Học phần và học kỳ có nhiều lớp. Lớp có nhiều buổi học (`as: "sessions"`) và nhiều lượt đăng ký (`as: "enrollments"`). Sinh viên có nhiều lượt đăng ký.
- **Khi lọc theo học kỳ ở include lồng bên trong**, phải thêm `required: true` cho include của lớp. Nếu không, lượt đăng ký thuộc học kỳ khác vẫn được trả về với `classSection` bằng `null`.

### 5.3 Dữ liệu mẫu

- Dữ liệu nằm ở `seeds/core.seed.ts`, phần ghi vào database là `AcademicService.seedInitialData()`.
- Gọi bằng `POST /api/v1/academic/seed`: chỉ admin, chỉ khi `NODE_ENV=development`.
- Mọi bản ghi tìm theo mã trước khi tạo, nên gọi nhiều lần không bị trùng. Buổi học không có mã riêng, nên chỉ được tạo khi lớp của nó vừa được tạo.

Kịch bản cho sinh viên `24100001`:
- **2526-HK2 (đã học xong):** INT1002, MAT1003, ENG1002, PHY1001. Điểm do Dương seed, ENG1002 bị F.
- **2627-HK1 (đang học):** INT2001 (2 buổi một tuần), INT2002, INT2003, MAT2001, POL1001. Có thêm lớp `2627-HK1-INT2003-02` đã huỷ đăng ký.
- **2627-HK2 (mở đăng ký từ 01/11/2026 đến 30/11/2026):** 8 lớp.
  - INT2005 cần qua INT2001 (đang học), ENG1003 cần qua ENG1002 (bị F).
  - MAT2002 trùng giờ với `INT2004-01`.
  - POL1002 hết chỗ: sĩ số 2, đã có 2 sinh viên phụ `24100002` và `24100003` đăng ký (mật khẩu `Student@123`).

### 5.4 Kiểm tra

Đã chạy trên bản sao database:
- `tsc` không lỗi.
- API khởi động thì tự tạo đủ 7 bảng.
- Seed: lần 1 thêm 56 bản ghi, lần 2 không thêm gì. Sinh viên gọi seed thì bị 403.
- Lịch 2627-HK1 của `24100001` có đúng 5 lớp, không có lớp đã huỷ.
- Môn tiên quyết của ENG1003 là ENG1002.
- Đăng ký trùng cùng một lớp bị chặn (`SequelizeUniqueConstraintError`).

## Phần 6: Lịch học

Trang `/schedule/class`: sinh viên xem các lớp đang học trong một học kỳ, theo tuần hoặc theo danh sách. Dùng các bảng của Bước 0 (Phần 5).

### 6.1 API cần dùng

| API | Trả về |
|---|---|
| `GET /api/v1/academic/semesters` | `{ items, currentCode }`. `items` xếp theo mã giảm dần, `currentCode` là học kỳ đang diễn ra |
| `GET /api/v1/schedules/class?semesterCode=` | `{ semester, totalCredits, items }`. Bỏ `semesterCode` thì lấy học kỳ hiện tại |

Mỗi phần tử của `items` là một lớp: `enrollmentId`, `classSectionCode`, `courseCode`, `courseName`, `credits`, `lecturerName`, `sessions`. Mỗi buổi trong `sessions` có `dayOfWeek`, `startPeriod`, `endPeriod`, `room`, `startTime`, `endTime`.

### 6.2 Phía API

- `utils/period.util.ts`: giờ bắt đầu của 12 tiết (tiết 1 lúc 06:45, tiết 7 lúc 13:00), mỗi tiết 50 phút. `getPeriodTimeRange(start, end)` đổi tiết thành giờ, ví dụ tiết 1-3 là `06:45` đến `09:25`. Giờ được tính ở API để web và các trang sau (lịch thi, đăng ký học) dùng chung một nguồn.
- `AcademicService`:
  - `pickCurrentSemester`: học kỳ có hôm nay nằm trong khoảng ngày học. Không có thì lấy học kỳ gần nhất đã bắt đầu.
  - `getSemester(code?)`: có mã thì tìm theo mã (không thấy thì 404), không có mã thì lấy học kỳ hiện tại.
- `ScheduleService.getClassSchedule(userId, semesterCode?)`:
  - Tìm hồ sơ sinh viên theo `userId` của tài khoản đang đăng nhập. Tài khoản admin không có hồ sơ nên bị 404.
  - Lấy lượt đăng ký `status: registered`, include lớp (`required: true`, đúng học kỳ, lớp chưa bị huỷ), trong lớp include học phần và buổi học.
  - Kiểu `ClassSectionWithDetail` báo cho TypeScript biết lớp có thêm `course` và `sessions`.
  - **Lưu ý:** `ClassSectionModel` là lớp học phần, `ClassSessionModel` là buổi học. Gõ nhầm hai tên này sẽ gây lỗi `Property 'dayOfWeek' does not exist` hoặc lỗi alias khi chạy.
- Route `routes/schedule.route.ts`: `authenticate`, `validate(getClassScheduleSchema)`, gắn ở `routes.use("/schedules", ...)`.

### 6.3 Phía web

| File | Làm gì |
|---|---|
| `apis/scheduleApi.js` | Hai hàm gọi API ở 6.1, trả về `response.data.data` |
| `utils/schedule.js` | Hàm thuần về ngày: `parseVnDate` đổi `DD/MM/YYYY` thành `Date`, `startOfWeek` lùi về thứ 2, `weeksBetween` đếm số tuần, `timeToMinutes`, `formatSessionTime` |
| `ClassSchedulePage.jsx` | Đọc `semester` và `view` từ URL, gọi API, chọn hiện `WeekView` hay `CourseListView` |
| `WeekView.jsx` | Lịch theo tuần |
| `CourseListView.jsx` | Bảng học phần, dùng `DataTable` (Phần 4) |

**`ClassSchedulePage`:**
- `useSearchParams` giữ học kỳ và kiểu xem trên URL. Chưa có `?semester` thì dùng `currentCode`.
- Gọi lịch học bằng `useAsync` với khoá `semesterCode ?? 'waiting'`: chưa có mã học kỳ thì trả `null`, có mã rồi mới gọi API, nên không gọi thừa một lần.
- Đổi học kỳ thì dữ liệu cũ vẫn hiện, làm mờ (`opacity-60`) cho tới khi có dữ liệu mới.
- Trang không dùng `PageHeader` để dành chỗ cho lịch. Tiêu đề là `<h1 className="sr-only">`, nhãn "Học kỳ" cũng `sr-only`: mắt không thấy nhưng trình đọc màn hình vẫn đọc. Ô chọn và nút kiểu xem cao 44px trên điện thoại, từ `sm` trở lên thu nhỏ còn 36px và 28px.

**`WeekView`:**
- `groupSessionsByDay` gom buổi học theo thứ: `{ 2: [...], 5: [...] }`. Mỗi buổi mang theo `item` (lớp) để lấy tên học phần.
- `today` lấy bằng `useState(() => new Date())`: chỉ tính một lần, vì lint không cho gọi `new Date()` trực tiếp khi render.
- `key={data.semester.code}` ở trang cha: đổi học kỳ thì `WeekView` được tạo lại, tuần đang xem về tuần đầu của học kỳ mới.
- Máy tính: lưới CSS 8 cột (`56px` cột giờ và 7 cột thứ).
  - Hàng đầu là ô góc và 7 ô tiêu đề, dính trên cùng khi lịch cuộn (`sticky top-0`). Hàng sau là cột giờ và 7 cột ngày.
  - **Vừa màn hình:** trang cha cao đúng màn hình (`lg:h-[calc(100dvh-5.75rem)]`), lịch là `flex-1 min-h-0` nên lấy hết chỗ còn lại. Hàng thân lưới là `minmax(455px,1fr)`: giãn theo chỗ trống, nhưng không thấp hơn 35px mỗi giờ. Màn hình thấp quá thì khung lịch (`overflow-auto`) cuộn, trang không cuộn.
  - Vì chiều cao không cố định, buổi học đặt `absolute` với `top` và `height` tính bằng **phần trăm** số phút kể từ `START_HOUR` (`toPercent`). Cột giờ là `flex-col`, mỗi giờ `flex-1`.
  - Vạch kẻ giờ: `linear-gradient` một vạch 1px, lặp lại bằng `backgroundSize: 100% (100/13)%`.
  - Ô buổi học hiện nội dung theo số tiết (3 tiết trở lên: tên, giờ, phòng; 2 tiết: tên và "phòng, giờ"; 1 tiết: tên), để không bị cắt chữ giữa dòng. Đủ thông tin nằm trong `title`.
- Điện thoại (dưới `lg`): danh sách theo ngày, chỉ hiện ngày có buổi học, có nhãn "Hôm nay".
- Ngày nằm ngoài khoảng ngày học thì không hiện buổi nào. Cả tuần nằm ngoài học kỳ thì hiện trạng thái rỗng, có nút về tuần đầu học kỳ.
- **Ghi đè class của `Button`:** `Button` có sẵn `px-4`. Thêm `px-0` không có tác dụng vì Tailwind sinh `px-4` sau `px-0` trong CSS. Dùng `px-0!` (dấu `!` ở cuối là `!important` trong Tailwind v4).

### 6.4 Kiểm tra

Đã chạy API và web thật, đăng nhập `24100001`, xem 2627-HK1:
- Tuần 9 có 6 buổi trên lưới, buổi 06:45 nằm đúng chỗ. Đổi sang Danh sách có 5 lớp, 15 tín chỉ.
- Ở 390px hiện danh sách theo ngày, không tràn ngang.
- Chưa thử: học kỳ không có lớp nào (trạng thái rỗng), tài khoản admin vào trang.

---

## Phần 7: Văn bản (Dương)

### 7.1 API
- `GET /api/v1/documents?page=1&limit=10&keyword=&type=&departmentId=`: cần đăng nhập. `type` là `regulation`, `rule`, `guide` hoặc `form`. Trả `{ items, pagination }`. Mỗi văn bản có `department { id, code, name }` và `files [...]`.
- `POST /api/v1/documents/seed`: admin, chỉ development. Cần seed tin tức trước để có bảng `departments`.

### 7.2 Từng file
| File | Làm gì |
|---|---|
| `models/document/document.model.ts` | Bảng `documents`: số hiệu (không trùng), tên, tóm tắt, loại, đơn vị, ngày ban hành `DD/MM/YYYY`, còn hiệu lực |
| `models/document/documentFile.model.ts` | Bảng `document_files`: tệp của văn bản (tên, link, dung lượng, đuôi) |
| `seeds/document.seed.ts` | 8 văn bản mẫu, đơn vị ghi bằng mã (PDT, PDBCL...) |
| `validations/document.validation.ts` | Kiểm tra `page`, `limit` (tối đa 100), `type` |
| `services/document.service.ts` | Ghép điều kiện lọc, `findAndCountAll`, sắp ngày ban hành mới nhất trước |
| `controllers/document.controller.ts`, `routes/document.route.ts` | Nối đường dẫn `/documents` với service |
| `apis/documentApi.js` | `getList(params)` |
| `pages/DocumentPage/DocumentPage.jsx` | Ô tìm (nhấn Enter), 2 ô chọn, `DataTable` |

### 7.3 Kỹ thuật chính
- Ngày lưu dạng chữ `DD/MM/YYYY`, nên sắp xếp bằng `literal("substr(issued_date, 7, 4) || ...")` để đổi thành `YYYYMMDD` rồi mới so.
- Tìm theo từ khoá: `Op.or` với `Op.like` trên số hiệu và tên.
- Web: chữ đang gõ (`text`) tách khỏi từ khoá đã tìm (`keyword`), để chỉ gọi API khi nhấn Enter. Khoá của `useAsync` là `keyword|type|departmentId`, đổi một cái là tải lại.

### 7.4 Kiểm tra
Seed, mở `/document`, chọn "Biểu mẫu" ra 3 văn bản, tìm "1520" ra 1 văn bản.

---

## Phần 8: Lịch thi (Dương)

### 8.1 API
- `GET /api/v1/exams?semesterCode=2627-HK1`: cần đăng nhập bằng tài khoản có hồ sơ sinh viên. Bỏ `semesterCode` thì lấy học kỳ hiện tại.
  - Trả `{ semester: { code, name, academicYear }, items: [{ id, examDate, startTime, durationMinutes, format, courseCode, courseName, credits, room, seatNumber }] }`.
  - `room` và `seatNumber` là `null` khi chưa xếp phòng.
  - Lỗi: 404 không có hồ sơ sinh viên hoặc sai mã học kỳ, 401 chưa đăng nhập.
- `POST /api/v1/exams/seed`: admin, chỉ development. Cần seed học vụ trước (lớp và sinh viên).

### 8.2 Bảng
| Bảng | Cột | Nối tới |
|---|---|---|
| `exams` (kỳ thi) | `class_section_id` (không trùng), `exam_date`, `start_time`, `duration_minutes`, `format` | `class_sections` |
| `exam_rooms` (xếp phòng thi) | `exam_id`, `student_id`, `room`, `seat_number`. Cặp `exam_id + student_id` không trùng | `exams`, `students` |

### 8.3 Từng file
| File | Làm gì |
|---|---|
| `models/exam/exam.model.ts`, `examRoom.model.ts` | Hai bảng trên |
| `models/index.ts` | `ExamModel.belongsTo(ClassSectionModel)`, `ExamModel.hasMany(ExamRoomModel, as "rooms")` |
| `seeds/exam.seed.ts` | 9 lịch thi cho `24100001`, POL1001 chưa xếp phòng |
| `services/exam.service.ts` | `getExamSchedule(userId, semesterCode)` và `seedInitialData()` |
| `controllers/exam.controller.ts`, `routes/exam.route.ts` | Đường dẫn `/exams` |
| `apis/examApi.js` | `getMySchedule(semesterCode)` |
| `pages/ExamSchedulePage/ExamSchedulePage.jsx` | Ô chọn học kỳ và `DataTable` 7 cột |

### 8.4 Kỹ thuật chính
- Service đi 3 bước: tìm sinh viên theo `userId`, lấy các lớp đã đăng ký trong học kỳ (giống Lịch học của Phi: bỏ đăng ký huỷ và lớp huỷ), rồi lấy `exams` của các lớp đó.
- Lấy phòng thi của riêng sinh viên này bằng `include` `rooms` có `where: { studentId }` và `required: false`. `required: false` để môn chưa xếp phòng vẫn hiện ra (giống LEFT JOIN).
- Sắp xếp: đổi ngày sang `YYYY-MM-DD` bằng `toISODate` rồi nối giờ, so sánh như chữ.
- Web: học kỳ đang chọn là `pickedCode || semesters.data?.currentCode`. Chưa chọn thì dùng học kỳ hiện tại. Thứ trong tuần tính bằng `new Date(năm, tháng - 1, ngày).getDay()`. Trạng thái "Đã thi" so ngày thi với hôm nay.

### 8.5 Kiểm tra (2026-11-09, API và web thật, `24100001`)
- 2627-HK1: 5 môn, 4 "Đã xếp phòng", POL1001 "Chờ xếp phòng".
- 2526-HK2: 4 môn "Đã thi". 2627-HK2: "Chưa có lịch thi".
- Sai mã học kỳ 404, chưa đăng nhập 401, sinh viên gọi seed 403.
- Chưa thử: điện thoại.

---

## Phần 9: Chương trình học (Dương)

### 9.1 API
- `GET /api/v1/programs/my`: cần đăng nhập bằng tài khoản có hồ sơ sinh viên.
  - Trả `{ program: { code, name, majorName, cohort }, totalCredits, blocks: [{ name, courseCount, credits }], items: [{ id, courseCode, courseName, credits, knowledgeBlock, isRequired, semesterNo, prerequisites: [{ code, name }], actualSemester }] }`.
  - `actualSemester` là chữ như "Học kỳ 2, 2025-2026", hoặc `null` khi chưa đăng ký học.
  - Lỗi 404: không có hồ sơ sinh viên, hoặc chưa có chương trình cho ngành và khoá đó.
- `POST /api/v1/programs/seed`: admin, chỉ development. Cần seed học vụ trước.

### 9.2 Bảng
| Bảng | Cột | Nối tới |
|---|---|---|
| `programs` | `code` (không trùng), `name`, `major_name`, `cohort`. Cặp ngành + khoá không trùng | `students` qua ngành + khoá (không có khoá ngoại) |
| `program_courses` | `program_id`, `course_id`, `knowledge_block`, `semester_no`, `is_required`. Cặp chương trình + học phần không trùng | `programs`, `courses` |

### 9.3 Kỹ thuật chính
- Tìm chương trình theo `majorName` và `cohort` của sinh viên, nên không phải thêm cột vào bảng `students` dùng chung.
- `include` lồng: `ProgramCourse → course → prerequisites` (quan hệ nhiều-nhiều của Phi). `through: { attributes: [] }` để không trả các cột của bảng trung gian.
- Học kỳ thực tế: lấy các đăng ký `registered` của sinh viên kèm lớp và học kỳ, cho vào `Map` có khoá là `courseId`.
- Khối kiến thức: duyệt danh sách học phần, cộng dồn số học phần và tín chỉ cho từng khối.
- Web: tìm kiếm lọc ngay trên mảng đã tải (`filter` + `includes`), không gọi lại API. Các khối kiến thức là hàng thẻ phía trên bảng (`grid-cols-[repeat(auto-fill,minmax(220px,1fr))]`), để bảng dùng hết chiều ngang.
- Cửa sổ chi tiết khối (`BlockDialog.jsx`): dùng thẻ `<dialog>` của trình duyệt. `showModal()` trong `useEffect` khi cửa sổ vừa hiện. Trình duyệt tự lo phím Esc, che nền (`backdrop:bg-ink/40`), giữ con trỏ bàn phím trong cửa sổ. Sự kiện `onClose` báo trang đặt `openBlock` về `null`. Bấm ra vùng tối: `event.target === dialogRef.current`. Cần `m-auto` vì Tailwind xoá lề mặc định của `<dialog>`.

### 9.4 Kiểm tra (2026-11-09, API và web thật, `24100001`)
- 15 học phần, 44 tín chỉ, 3 khối. Gõ "tiếng anh" còn 2 dòng.
- Admin 404, chưa đăng nhập 401, sinh viên gọi seed 403.
- Chưa thử: điện thoại.

---

## Phần 10: Tra cứu điểm (Dương)

### 10.1 API
- `GET /api/v1/grades/my`: cần đăng nhập bằng tài khoản có hồ sơ sinh viên.
  - Trả `{ student: { studentCode, fullName, className, majorName }, summary: { programCredits, attemptedCredits, earnedCredits, gpa10, gpa4, cumulativeGpa10, cumulativeGpa4 }, semesters: [{ code, name, academicYear, items, summary }] }`.
  - Mỗi `items[]`: `{ id, classSectionCode, lecturerName, courseCode, courseName, credits, attempt, processScore, examScore, score10, score4, letter, passed }`. Chưa có điểm thì các trường điểm và `passed` là `null`.
  - `semesters[].summary`: `{ credits, gpa10, gpa4, earnedCredits, cumulativeGpa10, cumulativeGpa4 }`.
- `POST /api/v1/grades/seed`: admin, chỉ development. Cần seed học vụ trước.

### 10.2 Hàm dùng chung cho Phi
```ts
import { GradeService } from "./grade.service";
const passedCourseIds = await GradeService.getPassedCourseIds(student.id); // string[] courses.id
```
- Qua môn khi điểm tổng hệ 10 ≥ 4,0. Chỉ tính đăng ký `registered`. Môn học nhiều lần, có một lần qua là tính qua.
- Đăng ký học không đọc thẳng bảng `grades`, để sau này đổi cách lưu điểm thì chỉ sửa hàm này.

### 10.3 Bảng `grades`
| Cột | Ý nghĩa |
|---|---|
| `enrollment_id` (không trùng) | Nối tới `enrollments`: điểm của một lần sinh viên học một lớp |
| `process_score` | Điểm quá trình hệ 10 |
| `exam_score` | Điểm thi hệ 10 |

Điểm tổng, hệ 4, điểm chữ không lưu mà tính khi đọc.

### 10.4 Kỹ thuật chính
- `getTotalScore`: `Math.round(quáTrình * 3 + thi * 7) / 10`. Nhân 3 và 7 trước rồi chia 10 để tránh sai số làm tròn của số thực (7,65 lưu trong máy là 7,6499...).
- `SCALE` sắp từ cao xuống thấp, `find` lấy mức đầu tiên thoả `score10 >= min`.
- `average(list)`: trung bình có trọng số theo tín chỉ, làm tròn 2 chữ số.
- Duyệt các lần đăng ký theo học kỳ cũ đến mới. `attemptByCourse` (Map) đếm lần học. `passedByCourse` (Map) giữ lần qua mới nhất của mỗi môn để tính tích luỹ.
- Web: `GradeDialog.jsx` làm giống `BlockDialog.jsx` (thẻ `<dialog>`, `showModal()`). `formatScore` đổi số sang dạng Việt Nam (7,7), `null` thành "-". Đặt trong thư mục trang vì `utils/format.js` là file của Phi.

### 10.5 Kiểm tra (2026-11-09, `24100001`)
- 2 học kỳ: 2627-HK1 "Chưa có điểm", 2526-HK2 có 4 điểm, PHY1001 "Học lại".
- Tổng kết toàn khoá: 44 tín chỉ chương trình, 12 đã học, 9 tích luỹ, TB 6,50 / 2,25, tích luỹ 7,57 / 3,00.
- `getPassedCourseIds`: 3 học phần.

---

### 10.6 Bố cục hai cột (Phi sửa, Dương đồng ý, 2026-11-09)

- Lưới `grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]`: cột trái là "Tổng kết toàn khoá" (`lg:sticky lg:top-4`), cột phải là danh sách học kỳ.
- `grid-cols-1` quan trọng ở màn điện thoại: lưới không khai báo cột thì cột tự rộng theo nội dung, bảng điểm `minWidth` lớn sẽ kéo cả trang tràn ngang. `grid-cols-1` là `minmax(0,1fr)` nên cột không vượt quá màn hình, bảng tự cuộn trong khung.
- Bảng điểm `minWidth={760}` để vừa cột phải ở màn 1440px.
- Khung tổng kết là danh sách `dl` dạng dòng: mỗi `div` là `flex justify-between` (tên `dt` bên trái, số `dd` bên phải), các dòng ngăn bằng `divide-y divide-line`.

## Phần 11: Khối trang chủ và component bộ lọc (Dương)

### 11.1 Khối trang chủ (`pages/HomePage/widgets/`)
Phi ghép vào `HomePage.jsx`, ví dụ:
```jsx
import { UpcomingExamsWidget } from './widgets/UpcomingExamsWidget'
import { GradeSummaryWidget } from './widgets/GradeSummaryWidget'

{user.role === 'student' && (
  <div className="grid grid-cols-2 gap-4">
    <UpcomingExamsWidget />
    <GradeSummaryWidget />
  </div>
)}
```
| File | Làm gì | API |
|---|---|---|
| `UpcomingExamsWidget.jsx` | Tối đa 3 môn thi từ hôm nay trở đi | `GET /exams` (không truyền học kỳ = học kỳ hiện tại) |
| `GradeSummaryWidget.jsx` | TB tích luỹ hệ 4, hệ 10, tín chỉ tích luỹ, tín chỉ đã học | `GET /grades/my`, chỉ dùng `summary` |

- Mỗi khối là một `<section>` có tiêu đề và link sang trang đầy đủ, tự có trạng thái đang tải, lỗi, rỗng. Không nhận props.
- Lọc "từ hôm nay": đổi ngày `DD/MM/YYYY` thành `YYYYMMDD` (`toSortable`) rồi so sánh chuỗi. API đã sắp xếp theo ngày nên chỉ cần `slice(0, 3)`.
- Hàm ngày nằm ở `pages/ExamSchedulePage/examDate.js`, dùng chung với trang Lịch thi.

### 11.2 `SearchInput` và `Select` (`components/form/`)
```jsx
<SearchInput id="document-keyword" label="Tìm theo số hiệu..." value={text}
  onChange={event => setText(event.target.value)} onSubmit={handleSearch} className="w-80" />

<Select id="document-type" label="Loại văn bản" value={type} onChange={event => setType(event.target.value)}>
  <option value="">Mọi loại văn bản</option>
</Select>
```
- `id`, `label` bắt buộc. Nhãn có class `sr-only`: không hiện trên màn hình nhưng trình đọc màn hình vẫn đọc, và nối với ô qua `htmlFor`.
- `...inputProps` / `...selectProps`: các thuộc tính còn lại truyền thẳng vào thẻ gốc, nên dùng như `<input>`, `<select>` bình thường.
- `SearchInput` luôn bọc trong `<form role="search">` và chặn tải lại trang khi nhấn Enter. Có `onSubmit` thì gọi, không có thì thôi.
- Class chung nằm ở `controlClass.js`. Đang dùng ở Văn bản, Lịch thi, Chương trình học.

### 11.3 Kiểm tra (2026-11-09)
- Xem mục CHANGELOG cùng ngày. Hai khối được thử bằng cách gắn tạm vào trang Lịch thi, chưa thử trên `HomePage.jsx` thật.

## Phần 12: Đăng ký học và Tra cứu kết quả đăng ký (Phi)

Claude viết thẳng theo yêu cầu của Phi, code không có chú thích.

### 12.1 API

| API | Làm gì |
|---|---|
| `GET /api/v1/registrations?semesterCode=` | `{ semester, rules, registeredCredits, registered, courses }`. `semester.status` là `open`, `upcoming` hoặc `closed` |
| `POST /api/v1/registrations` | Body `{ classSectionId }`. Trả về lớp vừa đăng ký và tổng tín chỉ mới. Bị chặn thì trả 409 kèm lý do |
| `DELETE /api/v1/registrations/:enrollmentId` | Huỷ lớp. Chỉ huỷ được lượt của chính mình, khi cổng đang mở |
| `GET /api/v1/registrations/history?semesterCode=` | `{ semester, totalCredits, items }`, mỗi dòng có `status`, `registeredAt`, `cancelledAt` |

Mỗi học phần trong `courses` có `isPassed`, `isRetake`, `prerequisites` (mỗi môn có `status`: `passed`, `studying`, `missing`), `registeredClassSectionCode` và `classSections`. Mỗi lớp có `registeredCount`, `capacity`, `isRegistered`, `enrollmentId`, `isFull`, `conflictWith`, `blockReason`, `sessions`.

### 12.2 `services/registration.service.ts`

- **Chọn học kỳ đăng ký** (`pickRegistrationSemester`): đợt đang mở, nếu không có thì đợt sắp mở gần nhất, sau cùng là đợt vừa kết thúc. Trạng thái đợt tính từ `registrationStart`, `registrationEnd` (chuỗi `DD/MM/YYYY` đổi sang `YYYY-MM-DD` để so sánh).
- **Lịch sử học** (`getStudyHistory`):
  - `passedIds`: lấy từ `GradeService.getPassedCourseIds` của Dương. Đây là chỗ duy nhất Đăng ký học dùng tới điểm.
  - Các lớp đã đăng ký ở học kỳ khác: học kỳ đã kết thúc mà chưa qua thì là **học lại** (`retakeIds`), học kỳ chưa kết thúc thì là **đang học** (`studyingIds`).
- **`getBlockReason(section, context, registeredCount)`** trả về lý do không đăng ký được, hoặc `null`. Kiểm tra theo thứ tự: thời gian đăng ký, trạng thái lớp, đã đăng ký lớp này, đã có lớp khác cùng học phần, thiếu tiên quyết, vượt `maxCredits`, trùng lịch, hết chỗ. Hàm này dùng cho cả danh sách (`getOverview`) lẫn lúc đăng ký (`register`), nên nút trên web và kết quả API luôn khớp nhau.
- **Trùng lịch** (`isOverlap`): cùng thứ và hai khoảng tiết giao nhau (`a.start <= b.end && b.start <= a.end`).
- **`register`** chạy trong `sequelize.transaction`: đọc lại các lớp đã đăng ký, đếm sĩ số, kiểm tra, rồi tạo bản ghi. Nếu sinh viên từng huỷ đúng lớp này thì cập nhật bản ghi cũ về `registered` (bảng `enrollments` có khoá duy nhất sinh viên + lớp, không tạo được dòng thứ hai).
- **`cancel`** đổi `status` sang `cancelled`, không xoá, để trang Tra cứu kết quả đăng ký còn hiện lớp đã huỷ. Thời điểm huỷ lấy từ `updatedAt`.
- **Học cải thiện**: học phần đã qua (`isPassed`) không bị chặn, sinh viên đăng ký lại để học cải thiện điểm. Web gắn nhãn "Học cải thiện". Mỗi lần học là một dòng `enrollments` riêng, điểm do phần của Dương tính.
- **Quy định** nằm ở `REGISTRATION_RULES = { minCredits: 14, maxCredits: 24 }`. Tối đa thì chặn, tối thiểu chỉ nhắc trên giao diện.

### 12.3 Phía web

| File | Làm gì |
|---|---|
| `apis/registrationApi.js` | 4 hàm gọi API ở 12.1 |
| `CourseRegistrationPage.jsx` | Gọi API, giữ ô tìm, bộ lọc, lớp đang xử lý (`pendingId`), thông báo, lớp đang chờ xác nhận huỷ |
| `CourseOfferingCard.jsx` | Một học phần: tiêu đề, nhãn trạng thái, bảng lớp (`DataTable`) |
| `RegisteredPanel.jsx` | Khung bên phải: tổng tín chỉ, thanh tiến độ, danh sách lớp đã đăng ký |
| `EligibleFilterBox.jsx` | Ô tick "Chỉ hiện học phần đủ điều kiện" dưới khung lớp đã đăng ký (truyền vào `RegisteredPanel` qua `children`) |
| `registrationText.js` | Hàm thuần: rút gọn mã lớp (`2627-HK2-INT2004-01` thành `INT2004-01`), chữ thứ / tiết, bỏ dấu để tìm kiếm, lý do bị chặn ở cấp học phần |
| `RegistrationResultPage.jsx` | Trang Tra cứu kết quả đăng ký |
| `components/ui/ConfirmDialog.jsx` | Hộp thoại xác nhận dùng chung |

- **Nút trên mỗi lớp**: đã đăng ký thì "Huỷ" (viền đỏ). Chưa đăng ký mà `blockReason` có giá trị thì nút mờ, chữ là "Hết chỗ", "Trùng lịch" hoặc "Đăng ký". Lý do ghi bằng chữ đỏ dưới lịch học và nối với nút bằng `aria-describedby`. Lý do chung của cả học phần (thiếu tiên quyết) ghi một lần ở tiêu đề học phần, không lặp lại ở từng lớp.
- **Sau khi đăng ký / huỷ** gọi `overview.reload()`. `useAsync` giữ dữ liệu cũ trong lúc tải lại, các nút bị khoá (`busy`) để không bấm hai lần.
- **Lọc học phần đủ điều kiện**: tick ô thì chỉ giữ học phần có `getCourseBlock(course) === null` (đủ học phần tiên quyết; học phần đã qua vẫn tính là đủ vì được học cải thiện). Điều kiện này cộng với ô tìm kiếm và bộ lọc thả xuống, cả ba cùng phải thoả. Số "x/y học phần đủ điều kiện" tính trên toàn bộ học phần, không phụ thuộc ô tìm.
- **Tìm kiếm không dấu**: `normalizeText` dùng `normalize('NFD')` rồi bỏ dấu, đổi `đ` thành `d`, nên gõ "cong nghe" vẫn ra "Công nghệ phần mềm".
- **`ConfirmDialog`** dùng thẻ `<dialog>` và `showModal()`: trình duyệt tự giữ focus trong hộp thoại, Esc để đóng, focus về lại nút đã mở. Không gọi `dialog.close()` trong cleanup của `useEffect`, vì ở StrictMode effect chạy hai lần, lần đóng đó bắn sự kiện `close` làm hộp thoại tắt ngay khi vừa mở.
- **Điện thoại**: khung lớp đã đăng ký lên trên (`order-first`), bảng lớp cuộn ngang trong khung, nút X cao 44px.

### 12.4 Kiểm tra

Xem mục CHANGELOG ngày 2026-11-09 (Phi). Đã chạy trên bản sao database, gồm đủ các trường hợp bị chặn, huỷ rồi đăng ký lại, và quyền của sinh viên khác / admin.

## Phần 13: Đổi mật khẩu (Phi)

- API đã có từ trước: `PUT /api/v1/auth/password` (`oldPassword`, `newPassword`). API xoá mọi refresh token của tài khoản, nên sau khi đổi, mọi thiết bị (kể cả máy đang dùng) phải đăng nhập lại.
- `ChangePasswordPage.jsx`:
  - Ba ô `PasswordField`. Kiểm tra trên trình duyệt giống API: không trống, ít nhất 8 ký tự, khác mật khẩu cũ, nhập lại phải khớp. Lỗi hiện dưới ô, focus vào ô lỗi đầu tiên.
  - API báo "Mật khẩu cũ không đúng" thì xoá ô mật khẩu hiện tại và báo ngay dưới ô đó. Lỗi khác hiện ở khung đỏ trên form.
  - Thành công: `setLoginNotice(...)` rồi `logout()`. `ProtectedRoute` chuyển về `/login`.
- `utils/loginNotice.js`: biến trong module giữ một câu thông báo cho trang đăng nhập. Không dùng `state` của `navigate` vì `ProtectedRoute` tự chuyển trang và ghi đè `state`. `LoginPage` đọc bằng `useState(() => peekLoginNotice())` rồi xoá trong `useEffect`. Không đọc-và-xoá trong `useState` vì StrictMode gọi hàm khởi tạo hai lần, lần thứ hai sẽ mất thông báo.
- `ProtectedRoute.jsx`: `NO_RETURN_PATHS = ['/change-password']`. Trang này không được lưu vào `from`, nên đăng nhập lại xong về Trang chủ.

## Phần 14: Ghép Trang chủ (Phi)

- `HomePage.jsx`: tiêu đề "Xin chào, tên", dòng ngày hôm nay (`Intl.DateTimeFormat` tiếng Việt, viết hoa chữ đầu thứ). Máy tính màn rộng (`xl`) chia hai cột: trái là Lịch học hôm nay và Tin tức mới, phải là Việc cần làm, Lịch thi sắp tới, Kết quả học tập. Màn hẹp xếp một cột. Tài khoản không phải sinh viên chỉ có Tin tức mới (các khối kia cần hồ sơ sinh viên).
- `widgets/WidgetFrame.jsx`: khung chung (tiêu đề, liên kết "Xem ..."), cùng kiểu với khối của Dương.
- `TodayScheduleWidget`: dùng lại `GET /schedules/class` (học kỳ hiện tại). Đổi ngày hôm nay sang `dayOfWeek` (Chủ nhật là 8), chỉ lấy khi hôm nay nằm trong khoảng ngày học. Nhãn "Đã qua / Đang học / Sắp tới" so giờ hiện tại với `startTime`, `endTime`.
- `LatestNewsWidget`: `GET /news?page=1&limit=5`, mỗi tin là một liên kết tới `/news/:id`, có biểu tượng ghim và chuyên mục.
- `TodoWidget`: dùng `GET /registrations`. Đợt đăng ký đang mở thì nhắc hạn cuối, số ngày còn lại, số tín chỉ đã chọn và còn thiếu (chữ đỏ nếu chưa đủ 14). Đợt sắp mở thì nhắc ngày mở. Không có đợt nào thì hiện "Không có việc cần làm".
- Kiểm tra: đăng nhập `24100001` thấy đủ 5 khối, `admin` chỉ thấy Tin tức mới. 390px không tràn ngang.
