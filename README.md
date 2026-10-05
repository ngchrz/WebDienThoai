# AURORA MOBILE — Khám phá công nghệ di động

Website giới thiệu điện thoại, xây dựng bằng **HTML5 + CSS3 + JavaScript thuần**.
Không dùng React / Vue / Angular hay bất kỳ framework frontend nào.

**Aurora Mobile** ở đây là tên cửa hàng (bán nhiều hãng: iPhone, Samsung, Xiaomi,
OPPO, vivo, Redmi), không phải tên một hãng điện thoại.

Phong cách: **Premium Technology / Modern Smartphone** — tối giản, nhiều khoảng trắng,
ảnh điện thoại lớn, typography nổi bật, animation mượt, responsive.

---

## 1. Cách chạy

Mở trực tiếp file `index.html` bằng trình duyệt là chạy được.

Nếu muốn chạy qua local server (khuyến nghị, để `localStorage` hoạt động ổn định):

```bash
# Cách 1: Python
python -m http.server 8000
# rồi mở http://localhost:8000

# Cách 2: Node
npx serve .
```

> Lưu ý: website dùng Google Fonts (Sora + Inter). Nếu không có internet,
> trình duyệt sẽ tự dùng font hệ thống và giao diện vẫn hiển thị bình thường.

---

## 2. Cấu trúc project

```text
aurora-mobile/
├── index.html            Trang chủ
├── products.html         Danh sách + lọc + tìm kiếm + sắp xếp
├── product-detail.html   Chi tiết sản phẩm (chọn màu, phiên bản, giá)
├── members.html          Giới thiệu thành viên nhóm  ← YÊU CẦU BẮT BUỘC
├── contact.html          Form liên hệ + kiểm tra dữ liệu  ← YÊU CẦU BẮT BUỘC
├── order.html            Form đặt hàng + tính tổng tiền
├── admin.html            Trang quản trị (dashboard + CRUD)
│
├── css/
│   └── style.css         Toàn bộ CSS (14 nhóm, có mục lục ở đầu file)
│
├── js/
│   ├── script.js         Logic dùng chung (17 nhóm, có mục lục ở đầu file)
│   └── admin.js          Logic riêng của trang quản trị
│
└── images/
    ├── favicon.svg       Icon tab trình duyệt
    ├── hero-phone.png    Ảnh iPhone 18 Pro Max ở hero
    ├── iphone-18-pro-max-*.png    3 màu: xanh / đỏ / đen
    ├── galaxy-s26-ultra-*.png     2 màu: đen / tím
    ├── xiaomi-17-ultra-den.png
    ├── oppo-find-x9-pro-bac.png
    ├── vivo-x300-pro-den.png
    ├── xiaomi-17t-pro-*.png       2 màu: tím / đen
    ├── galaxy-a57-tim.png
    ├── redmi-note-15-pro-*.png    2 màu: trắng / đen
    ├── camera-01.jpg … camera-04.jpg 4 ảnh cho gallery camera
    └── member-01.jpg … member-04.jpg 4 ảnh thành viên
```

### Về ảnh sản phẩm

Ảnh điện thoại là **ảnh sản phẩm thật**, tải từ CDN của nhà bán lẻ và đã xử lý lại:

- Xoá badge quảng cáo in trên ảnh gốc.
- Tách nền trắng thành **nền trong suốt** (flood fill từ mép, nên không ăn vào
  phần trắng bên trong máy) → máy hoà liền vào nền tối của web.
- Cắt sát viền máy, đệm thành hình vuông, thu về 900×900.

Ảnh chỉ dùng cho **mục đích học tập**. Nếu nhóm cần công bố chính thức, hãy thay
bằng ảnh lấy từ trang chính hãng của từng sản phẩm.

---

## 3. Chức năng đã hoàn thành

### Điều hướng & giao diện
| Chức năng | Ghi chú |
|---|---|
| Header sticky | Trong suốt ở đầu trang, cuộn xuống chuyển nền mờ + blur |
| Menu mobile | Hamburger → menu trượt xuống có animation |
| Dark / Light mode | Nút ☀ / ☾, lưu bằng `localStorage`, giữ theme khi reload |
| Back to top | Nút ↑ có vòng tròn tiến trình theo mức cuộn |
| Toast notification | Góc trên phải, tự biến mất sau 4 giây, có thanh đếm thời gian |
| Scroll animation | `IntersectionObserver` cho reveal, counter, progress bar, pin |

### Trang chủ
Hero toàn màn hình · Designed for Tomorrow (counter 7.5 mm / 189 g) ·
Meet the Aurora Family (4 card bố cục khác nhau) · See the Difference (200MP / 50MP / 64MP + gallery) ·
Pure. Bright. Immersive. (6.8" / 144Hz / 1.5K) · Power Without Compromise (thanh CPU/GPU/AI) ·
Power That Lasts (mô phỏng pin 0 → 100%) · Why Aurora? · dải CTA.

### Danh sách sản phẩm (`products.html`)
- **Filter**: All / Flagship / Performance / Camera / Budget
- **Search**: gõ tới đâu lọc tới đó (bỏ dấu tiếng Việt vẫn tìm được)
- **Sort**: Featured · Price Low → High · Price High → Low · Name A → Z
- Bộ lọc được ghi lên URL → tải lại trang vẫn giữ nguyên

### Chi tiết sản phẩm (`product-detail.html`)
- Chọn **COLOR** (Midnight / Titanium / Ocean Blue / Sky Blue) → **ảnh đổi theo màu**
- Chọn **STORAGE** (256GB / 512GB / 1TB) → **giá tự động thay đổi**
- Bảng thông số kỹ thuật, sản phẩm liên quan
- `ORDER NOW` mang theo lựa chọn sang trang đặt hàng qua URL

### Kiểm tra dữ liệu bằng JavaScript (không dùng `required`)

Cả hai form đều đặt `novalidate` và kiểm tra hoàn toàn bằng JS:

| Trường | Quy tắc |
|---|---|
| Họ tên | Không trống, không chỉ khoảng trắng, ≥ 2 ký tự, không chứa số |
| Email | Đúng định dạng email |
| Số điện thoại | Chỉ nhập số, không chứa chữ, độ dài 10–11 |
| Chủ đề | Bắt buộc chọn |
| Nội dung | Không trống, ≥ 10 ký tự |
| Địa chỉ (đặt hàng) | Không trống, ≥ 5 ký tự |
| Sản phẩm / Phiên bản | Bắt buộc chọn |
| Màu sắc | Bắt buộc chọn (nhóm radio, kiểm tra riêng) |
| Số lượng | ≥ 1 và ≤ 10 |
| Điều khoản | Phải tích |

Khi lỗi: input nhận class `error`, thông báo hiện **ngay dưới input**.
Khi đúng: input nhận class `valid`.
Gửi thành công: hiện toast **“Gửi thông tin thành công!”** / **“Đặt hàng thành công!”** rồi reset form.

### Đặt hàng (`order.html`)
Khung **ORDER SUMMARY** tự động tính lại khi thay đổi sản phẩm / phiên bản / màu / số lượng.
Ví dụ mặc định: `Aurora X1 Pro` · `512GB` · `Titanium` · SL 1 → **24.990.000đ**.

### Trang quản trị (`admin.html`)

**Tài khoản demo:** `admin` / `aurora123`
(Đăng nhập minh hoạ cho bài tập — dữ liệu lưu bằng `localStorage`, không phải bảo mật thật.)

| Khu vực | Chức năng |
|---|---|
| **Dashboard** | 6 thẻ thống kê (sản phẩm, thành viên, đơn hàng, liên hệ, giá trung bình, doanh thu dự kiến) + 4 biểu đồ thanh: sản phẩm theo danh mục, giá theo sản phẩm, đơn hàng theo sản phẩm, liên hệ theo chủ đề |
| **Sản phẩm** | Bảng 8 sản phẩm, tìm kiếm, **thêm / sửa / xoá**, khôi phục dữ liệu gốc |
| **Thành viên** | Bảng thành viên, **thêm / sửa / xoá**, khôi phục dữ liệu gốc |
| **Đơn hàng & liên hệ** | Đọc dữ liệu khách gửi từ form Order và Contact, xoá từng nhóm |

- Mọi thay đổi trong admin **áp dụng ngay cho toàn website** (trang chủ, danh sách, chi tiết, members)
  vì dữ liệu được lưu vào `localStorage` và các trang đọc lại khi tải.
- Form trong admin cũng dùng chính engine kiểm tra dữ liệu của website (họ tên, giá, mã sinh viên…).
- Xoá luôn có hộp thoại xác nhận; có nút **Khôi phục dữ liệu gốc** để quay về mặc định.
- **Đường vào trang quản trị** (có 2 chỗ):
  1. Nút icon hình thanh trượt trên **header** của mọi trang, nằm giữa nút tìm kiếm và nút "Order Now".
  2. Link **"Trang quản trị"** màu xanh ở cột **"Về chúng tôi"** trong footer.

> Lưu ý: vì dữ liệu nằm trong `localStorage` của trình duyệt nên mỗi máy/trình duyệt có
> dữ liệu riêng, và xoá dữ liệu trình duyệt sẽ đưa mọi thứ về mặc định.

---

## 4. Cách sửa nội dung

> **Cách nhanh nhất:** mở `admin.html`, đăng nhập bằng `admin` / `aurora123` rồi thêm/sửa/xoá
> trực tiếp trên giao diện. Thay đổi được lưu vào `localStorage` và hiện ngay trên website.
> Muốn sửa **vĩnh viễn** (để máy khác cũng thấy) thì sửa mảng dữ liệu trong `js/script.js` như dưới đây.

### Đổi thông tin thành viên (quan trọng)
Mở `js/script.js`, tìm mảng **`MEMBERS`** ở đầu file và sửa:

```js
{
  code: '22520001',                 // mã sinh viên
  name: 'Nguyễn Văn A',             // họ tên
  role: 'Trưởng nhóm · Thiết kế giao diện',
  hobbies: ['Công nghệ', 'Nhiếp ảnh', 'Âm nhạc'],
  photo: 'images/member-01.jpg',    // ảnh vuông, đặt trong thư mục images/
  bio: 'Giới thiệu ngắn…'           // hiện khi rê chuột vào ảnh
}
```

Thêm hoặc bớt phần tử trong mảng là số lượng card tự thay đổi theo.

### Thêm / sửa điện thoại
Cũng trong `js/script.js`, sửa mảng **`DEFAULT_PRODUCTS`**:

```js
{
  id: 'iphone-18-pro-max',         // dùng cho URL product-detail.html?id=...
  name: 'iPhone 18 Pro Max',
  tagline: 'Flagship · Camera',    // nhãn danh mục hiển thị trên card
  desc: 'Mô tả ngắn…',
  price: 41990000,                 // giá bản 256GB
  oldPrice: 44990000,              // giá gạch ngang (tuỳ chọn)
  badge: 'Mới',                    // nhãn nhỏ ở góc ảnh (tuỳ chọn)
  img: 'images/iphone-18-pro-max-xanh.png',
  colors: [                        // mỗi máy có bảng màu riêng
    { id: 'xanh', label: 'Xanh', dot: '#b9c9e4', img: 'images/iphone-18-pro-max-xanh.png' },
    { id: 'do',   label: 'Đỏ',   dot: '#7b2b3a', img: 'images/iphone-18-pro-max-do.png' }
  ],
  categories: ['flagship', 'camera'],         // dùng cho bộ lọc
  featured: 10,                    // điểm ưu tiên khi sắp xếp "Featured"
  specs: { display, camera, battery },        // 3 chip nhỏ trên card
  detail: { 'Màn hình': '…', … }              // bảng thông số trang chi tiết
}
```

- Giá bán = `price` + phụ phí phiên bản, khai báo trong mảng **`STORAGE_OPTIONS`**.
- Màu sắc nằm **trong từng sản phẩm** (`colors`), vì mỗi hãng có bảng màu khác nhau.
  `dot` là mã màu hiển thị ở chấm tròn chọn màu.
- Sản phẩm thêm mới từ trang admin sẽ tự có một màu mặc định theo ảnh đã chọn.

### Đổi ảnh
Ghi đè file trong `images/` bằng ảnh khác (giữ nguyên tên file), hoặc sửa đường dẫn
trong `colors[].img`. Ảnh nên là **ảnh vuông đã tách nền (PNG trong suốt)** để hoà
vào nền tối của web.

### Đổi màu thương hiệu
Mở `css/style.css`, nhóm **02. Variables**:

```css
--accent: #00e0ff;    /* màu nhấn chính */
--accent-2: #7b5cff;  /* màu nhấn phụ (dùng cho gradient) */
--accent-3: #ff4d8d;
```

---

## 5. Responsive

| Kích thước | Bố cục |
|---|---|
| Desktop (> 1080px) | 3–4 sản phẩm / hàng, hero 2 cột |
| Tablet (≤ 1080px) | 2 sản phẩm / hàng, các section về 1 cột |
| Mobile (≤ 900px) | Menu hamburger, form 1 cột |
| Mobile nhỏ (≤ 720px) | 1 sản phẩm / hàng, bảng thông số xếp dọc |

Đã kiểm tra không có scrollbar ngang, không tràn màn hình, ảnh không méo ở cả 3 kích thước.

---

## 6. Kiểm thử

Website đã được kiểm tra tự động:

- **180/180** kiểm tra chức năng đạt (jsdom): điều hướng, theme, filter, search, sort,
  chọn màu/phiên bản, tính giá, lightbox, modal, toast, toàn bộ quy tắc validation,
  đăng nhập admin, CRUD sản phẩm & thành viên, khôi phục dữ liệu, và luồng
  "khách gửi form → admin đọc được".
- **0 lỗi console** và **0 lỗi tài nguyên (404)** trên cả 7 trang, ở 3 kích thước màn hình
  (1440×900, 768×1024, 390×844) khi chạy bằng Chromium thật; riêng admin còn kiểm tra cả 4 tab.
- Không có scrollbar ngang, không ảnh nào tràn khỏi khung chứa, không ảnh nào bị bóp méo.
- Không dùng inline CSS — toàn bộ style tập trung trong `css/style.css`.

---

## 7. Ghi chú

- Đây là **dự án học tập**, không phải website thương mại.
  **Aurora Mobile đóng vai trò tên cửa hàng** bán nhiều hãng, không phải tên hãng điện thoại.
  Giá và thông số sản phẩm là mức tham khảo tại thị trường Việt Nam, có thể thay đổi theo thời điểm.
- Ảnh sản phẩm là ảnh thật đã xử lý lại (xoá badge, tách nền) — xem mục 2.
  Ảnh gallery camera và ảnh thành viên vẫn là ảnh minh hoạ, nhóm nên thay bằng ảnh của mình.
- Trang `members.html` có sẵn khung ghi chú hướng dẫn đổi thông tin ngay trên giao diện.
