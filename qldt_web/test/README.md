# Mockup giao diện QLDT (hướng 4, đã chốt)

Đây là HTML tĩnh để duyệt thiết kế, chưa phải code React của `qldt_web`.
Mở trực tiếp các file trong `mockups/` bằng trình duyệt; sidebar dùng chung nằm ở `mockups/shell.js`.

## Sidebar trái sau đăng nhập

1. Trang chủ
2. Tin tức
3. Góc học tập: Tra cứu điểm, Chương trình đào tạo, Tiến độ học tập, Điểm rèn luyện
4. Đăng ký trực tuyến: Đăng ký học, Đăng ký thi lại, Đăng ký giấy tờ
5. Thời khóa biểu: Lịch học, Lịch thi
6. Văn bản

Cuối sidebar: Đổi mật khẩu, Đăng xuất. Trên điện thoại sidebar thu vào nút menu.

## Ảnh chụp

| Ảnh | Màn hình | API hiện có |
|---|---|---|
| `01-dang-nhap.png` | Đăng nhập | Có: `POST /auth/login` |
| `02-trang-chu.png` | Trang chủ | Một phần: tin mới lấy từ `GET /news` |
| `03-tin-tuc.png` | Tin tức (danh sách + khung đọc) | Có: `/news`, bình luận, lưu tin |
| `04-goc-hoc-tap__tra-cuu-diem.png` | Tra cứu điểm | Chưa có |
| `05-dang-ky-truc-tuyen__dang-ky-hoc.png` | Đăng ký học | Chưa có |
| `06-thoi-khoa-bieu__lich-hoc.png` | Lịch học dạng tuần | Chưa có |
| `07-thoi-khoa-bieu__lich-thi.png` | Lịch thi | Chưa có |
| `08-van-ban.png` | Văn bản | Chưa có |
| `09-mobile__trang-chu.png` | Trang chủ trên điện thoại | |
| `10-mobile__menu.png` | Menu trên điện thoại | |

Các con số, điểm, lịch học, lịch thi, văn bản đều là dữ liệu mẫu.
Các mục con chưa có trang mẫu: Chương trình đào tạo, Tiến độ học tập, Điểm rèn luyện, Đăng ký thi lại, Đăng ký giấy tờ.
