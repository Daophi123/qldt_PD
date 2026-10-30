// Khung dùng chung cho mọi trang sau đăng nhập: thanh trên + sidebar trái.
// Trang khai báo <body data-page="..."> để đánh dấu mục đang mở.
// Thêm ?menu=open vào URL để xem trạng thái menu trên điện thoại.
(() => {
const NAV = [
  { id: "trang-chu", label: "Trang chủ", icon: "house", href: "trang-chu.html" },
  { id: "tin-tuc", label: "Tin tức", icon: "newspaper", href: "tin-tuc.html", count: 6 },
  { id: "goc-hoc-tap", label: "Góc học tập", icon: "books", children: [
    { id: "tra-cuu-diem", label: "Tra cứu điểm", href: "tra-cuu-diem.html" },
    { id: "chuong-trinh-dao-tao", label: "Chương trình đào tạo" },
    { id: "tien-do-hoc-tap", label: "Tiến độ học tập" },
    { id: "diem-ren-luyen", label: "Điểm rèn luyện" },
  ] },
  { id: "dang-ky-truc-tuyen", label: "Đăng ký trực tuyến", icon: "note-pencil", children: [
    { id: "dang-ky-hoc", label: "Đăng ký học", href: "dang-ky-hoc.html" },
    { id: "dang-ky-thi-lai", label: "Đăng ký thi lại" },
    { id: "dang-ky-giay-to", label: "Đăng ký giấy tờ" },
  ] },
  { id: "thoi-khoa-bieu", label: "Thời khóa biểu", icon: "calendar-blank", children: [
    { id: "lich-hoc", label: "Lịch học", href: "lich-hoc.html" },
    { id: "lich-thi", label: "Lịch thi", href: "lich-thi.html" },
  ] },
  { id: "van-ban", label: "Văn bản", icon: "files", href: "van-ban.html" },
];

const currentPage = document.body.dataset.page;
const hrefOf = (item) => item.href || "#";

function renderNav() {
  return NAV.map((item) => {
    if (!item.children) {
      const current = item.id === currentPage ? ' aria-current="page"' : "";
      const count = item.count ? `<span class="nav__count">${item.count}</span>` : "";
      return `<li class="nav__item"><a href="${hrefOf(item)}"${current}><i class="ph ph-${item.icon}"></i>${item.label}${count}</a></li>`;
    }
    const hasCurrent = item.children.some((c) => c.id === currentPage);
    const subs = item.children.map((c) =>
      `<li><a href="${hrefOf(c)}"${c.id === currentPage ? ' aria-current="page"' : ""}>${c.label}</a></li>`).join("");
    return `<li class="nav__item${hasCurrent ? " has-current" : ""}" data-open="true">
      <button type="button" aria-expanded="true"><i class="ph ph-${item.icon}"></i>${item.label}<i class="ph ph-caret-right chev"></i></button>
      <ul class="sub">${subs}</ul></li>`;
  }).join("");
}

document.getElementById("top").outerHTML = `
<header class="top">
  <button class="btn btn--icon burger" aria-label="Mở menu"><i class="ph ph-list"></i></button>
  <a class="logo" href="trang-chu.html"><span class="logo__m"><i class="ph-bold ph-student"></i></span>Cổng Đào tạo</a>
  <label class="cmd"><i class="ph ph-magnifying-glass"></i><input placeholder="Tìm tin tức, văn bản, học phần" aria-label="Tìm kiếm"><span class="kbd">Ctrl K</span></label>
  <div class="top__right">
    <div class="who">Sinh viên mẫu<small>MSSV 24100001</small></div>
    <span class="ava" aria-hidden="true">SV</span>
  </div>
</header>`;

document.getElementById("side").outerHTML = `
<nav class="side" aria-label="Điều hướng chính">
  <ul class="nav">${renderNav()}</ul>
  <div class="side__foot">
    <a href="#"><i class="ph ph-key"></i>Đổi mật khẩu</a>
    <a href="#"><i class="ph ph-sign-out"></i>Đăng xuất</a>
  </div>
</nav>
<div class="scrim"></div>`;

document.querySelectorAll(".nav__item > button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const li = btn.parentElement;
    const open = li.dataset.open !== "true";
    li.dataset.open = String(open);
    btn.setAttribute("aria-expanded", String(open));
  });
});
document.querySelector(".burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));
document.querySelector(".scrim").addEventListener("click", () => document.body.classList.remove("menu-open"));
if (new URLSearchParams(location.search).get("menu") === "open") document.body.classList.add("menu-open");
})();
