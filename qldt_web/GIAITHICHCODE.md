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
