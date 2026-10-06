/* ==========================================================================
   AURORA MOBILE — script.js
   --------------------------------------------------------------------------
   Toàn bộ tương tác của website, viết bằng JavaScript thuần (không framework).

   MỤC LỤC
     01. DATA          — dữ liệu sản phẩm, màu sắc, phiên bản, thành viên
     02. UTILITIES     — hàm dùng chung ($, format tiền, debounce, storage...)
     03. TOAST         — hệ thống thông báo góc màn hình
     04. THEME         — Dark / Light mode + localStorage
     05. HEADER        — sticky, hamburger, search panel, live search
     06. SCROLL FX     — reveal, counter, progress bar, pin
     07. PRODUCTS      — render danh sách + filter + search + sort
     08. PRODUCT DETAIL— chọn màu, phiên bản, đổi giá, đổi ảnh
     09. GALLERY       — lightbox xem ảnh lớn
     10. MODAL         — modal dùng chung
     11. VALIDATION    — engine kiểm tra dữ liệu form
     12. CONTACT FORM  — form liên hệ
     13. ORDER FORM    — form đặt hàng + tính tổng tiền realtime
     14. NOTIFY FORM   — form trong modal
     15. MEMBERS       — render danh sách thành viên nhóm
     16. BACK TO TOP   — nút cuộn lên đầu trang
     17. INIT          — khởi động
   ========================================================================== */

'use strict';

/* ==========================================================================
   01. DATA
   ========================================================================== */

/*
  KHOÁ LƯU TRỮ
  -------------------------------------------------------------
  Trang admin ghi dữ liệu đã sửa vào localStorage dưới các khoá này.
  Website đọc lại lúc tải trang, nên thay đổi trong admin áp dụng cho toàn site.
*/
const STORAGE_KEYS = {
  products: 'aurora-products',
  members: 'aurora-members',
  orders: 'aurora-orders',
  contacts: 'aurora-contacts',
  theme: 'aurora-theme',
  admin: 'aurora-admin-session'
};

/* Giá niêm yết = giá bản 256GB. Bản 512GB / 1TB cộng thêm phụ phí. */
const STORAGE_OPTIONS = [
  { id: '256gb', label: '256GB', delta: 0 },
  { id: '512gb', label: '512GB', delta: 2000000 },
  { id: '1tb', label: '1TB', delta: 5000000 }
];

/* Màu sắc giờ nằm trong từng sản phẩm (thuộc tính `colors`),
   vì mỗi hãng có bảng màu riêng. Xem hàm colorsOf() ở phần tiện ích. */

/* Danh mục dùng cho bộ lọc ở products.html */
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'flagship', label: 'Flagship' },
  { id: 'performance', label: 'Performance' },
  { id: 'camera', label: 'Camera' },
  { id: 'budget', label: 'Budget' }
];

/*
  Khẩu hiệu hiển thị trên trang chi tiết sản phẩm
*/
const SLOGANS = {
  'iphone-18-pro-max': 'Đỉnh cao nhiếp ảnh.',
  'galaxy-s26-ultra': 'Sức mạnh Galaxy AI.',
  'xiaomi-17-ultra': 'Ống kính Leica, cảm biến 1 inch.',
  'oppo-find-x9-pro': 'Tele 200MP Hasselblad.',
  'vivo-x300-pro': 'ZEISS APO, chuẩn máy ảnh.',
  'xiaomi-17t-pro': 'Hiệu năng không đánh đổi.',
  'galaxy-a57': 'Bền bỉ cho mọi ngày.',
  'redmi-note-15-pro': 'Phổ thông mà đầy đủ.'
};

/*
  DANH SÁCH SẢN PHẨM MẶC ĐỊNH
  -------------------------------------------------------------
  Đây là dữ liệu gốc. Trang admin có thể sửa và lưu đè vào localStorage.
    id         : dùng cho URL product-detail.html?id=...
    img        : ảnh đại diện (mặc định lấy màu đầu tiên)
    colors     : các phiên bản màu, mỗi màu có ảnh riêng
    categories : các nhóm để bộ lọc hoạt động
    featured   : điểm ưu tiên khi sắp xếp "Featured"
  Giá và thông số là mức tham khảo tại thị trường Việt Nam.
*/
const DEFAULT_PRODUCTS = [
  {
    id: 'iphone-18-pro-max',
    name: 'iPhone 18 Pro Max',
    tagline: 'Flagship · Camera',
    desc: 'Chip A20 Pro 2nm, camera Fusion 48MP khẩu độ biến thiên và màn hình ProMotion 6.9 inch.',
    price: 41990000,
    oldPrice: 44990000,
    badge: 'Mới',
    badgeHot: true,
    img: 'images/iphone-18-pro-max-xanh.png',
    colors: [
      { id: 'xanh', label: 'Xanh', dot: '#b9c9e4', img: 'images/iphone-18-pro-max-xanh.png' },
      { id: 'do', label: 'Đỏ', dot: '#7b2b3a', img: 'images/iphone-18-pro-max-do.png' },
      { id: 'den', label: 'Đen', dot: '#2b2b30', img: 'images/iphone-18-pro-max-den.png' }
    ],
    categories: ['flagship', 'camera'],
    featured: 10,
    specs: {
      display: '6.9" ProMotion 120Hz',
      camera: '48MP Fusion · 4K120',
      battery: '5000 mAh · 40W'
    },
    detail: {
      'Màn hình': '6.9 inch Super Retina XDR OLED, ProMotion 120Hz',
      'Chip xử lý': 'Apple A20 Pro (2nm)',
      'RAM / Bộ nhớ': '12GB RAM · 256GB / 512GB / 1TB / 2TB',
      'Camera sau': '48MP Fusion (khẩu độ biến thiên) + 48MP Ultra Wide + 48MP Tele 5x',
      'Camera trước': '18MP Center Stage',
      'Pin & Sạc': 'Khoảng 5000 mAh · sạc nhanh 40W · MagSafe',
      'Kết nối': '5G · Wi-Fi 7 · Bluetooth 6 · NFC · USB-C 3.2',
      'Kháng nước': 'IP68',
      'Kích thước': '163.4 × 77.6 × 8.8 mm · khoảng 227 g'
    }
  },
  {
    id: 'galaxy-s26-ultra',
    name: 'Samsung Galaxy S26 Ultra',
    tagline: 'Flagship · Camera',
    desc: 'Snapdragon 8 Elite Gen 5, camera 200MP, màn hình chống nhìn trộm và bút S Pen.',
    price: 35990000,
    oldPrice: 38990000,
    badge: 'Galaxy AI',
    badgeHot: false,
    img: 'images/galaxy-s26-ultra-den.png',
    colors: [
      { id: 'den', label: 'Đen', dot: '#3a3d42', img: 'images/galaxy-s26-ultra-den.png' },
      { id: 'tim', label: 'Tím', dot: '#8f86b8', img: 'images/galaxy-s26-ultra-tim.png' }
    ],
    categories: ['flagship', 'camera', 'performance'],
    featured: 9,
    specs: {
      display: '6.9" AMOLED 120Hz',
      camera: '200MP + 50MP + 50MP',
      battery: '5000 mAh · 45W'
    },
    detail: {
      'Màn hình': '6.9 inch Dynamic AMOLED 2X, 120Hz, chống nhìn trộm',
      'Chip xử lý': 'Snapdragon 8 Elite Gen 5 (4.74GHz)',
      'RAM / Bộ nhớ': '12GB RAM · 256GB / 512GB / 1TB',
      'Camera sau': '200MP chính OIS + 50MP Ultra Wide + 50MP Tele 5x + 10MP Tele 3x',
      'Camera trước': '12MP',
      'Pin & Sạc': '5000 mAh · sạc nhanh 45W · sạc không dây 15W',
      'Kết nối': '5G · Wi-Fi 7 · Bluetooth 6 · NFC · UWB',
      'Kháng nước': 'IP68',
      'Kích thước': '163.6 × 78.1 × 8.2 mm · 218 g · kèm S Pen'
    }
  },
  {
    id: 'xiaomi-17-ultra',
    name: 'Xiaomi 17 Ultra',
    tagline: 'Camera · Flagship',
    desc: 'Cảm biến chính 1 inch hợp tác Leica, tele tiềm vọng và sạc nhanh 100W.',
    price: 39990000,
    oldPrice: 42990000,
    badge: 'Leica',
    badgeHot: false,
    img: 'images/xiaomi-17-ultra-den.png',
    colors: [
      { id: 'den', label: 'Đen', dot: '#33363b', img: 'images/xiaomi-17-ultra-den.png' }
    ],
    categories: ['flagship', 'camera'],
    featured: 8,
    specs: {
      display: '6.8" AMOLED 120Hz',
      camera: '50MP 1 inch Leica',
      battery: '6000 mAh · 100W'
    },
    detail: {
      'Màn hình': '6.8 inch AMOLED LTPO, 120Hz, 1.5K',
      'Chip xử lý': 'Snapdragon 8 Elite Gen 5',
      'RAM / Bộ nhớ': '16GB RAM · 512GB / 1TB',
      'Camera sau': '50MP chính cảm biến 1 inch Leica + 200MP Tele tiềm vọng + 50MP Ultra Wide',
      'Camera trước': '32MP',
      'Pin & Sạc': '6000 mAh · sạc nhanh 100W · sạc không dây 50W',
      'Kết nối': '5G · Wi-Fi 7 · Bluetooth 6 · NFC · IR',
      'Kháng nước': 'IP68',
      'Kích thước': '161.3 × 75.3 × 8.6 mm · 226 g'
    }
  },
  {
    id: 'oppo-find-x9-pro',
    name: 'OPPO Find X9 Pro',
    tagline: 'Camera · Flagship',
    desc: 'Tele tiềm vọng 200MP Hasselblad, viên pin lớn và sạc nhanh SUPERVOOC.',
    price: 31000000,
    oldPrice: 33990000,
    badge: null,
    badgeHot: false,
    img: 'images/oppo-find-x9-pro-bac.png',
    colors: [
      { id: 'bac', label: 'Bạc', dot: '#d8d9dd', img: 'images/oppo-find-x9-pro-bac.png' }
    ],
    categories: ['flagship', 'camera'],
    featured: 7,
    specs: {
      display: '6.78" AMOLED 120Hz',
      camera: '200MP Hasselblad',
      battery: '7500 mAh · 80W'
    },
    detail: {
      'Màn hình': '6.78 inch AMOLED LTPO, 120Hz, 1.5K',
      'Chip xử lý': 'MediaTek Dimensity 9500',
      'RAM / Bộ nhớ': '16GB RAM · 512GB',
      'Camera sau': '50MP chính OIS + 200MP Tele tiềm vọng Hasselblad + 50MP Ultra Wide',
      'Camera trước': '32MP',
      'Pin & Sạc': '7500 mAh · SUPERVOOC 80W · sạc không dây 50W',
      'Kết nối': '5G · Wi-Fi 7 · Bluetooth 6 · NFC',
      'Kháng nước': 'IP68 / IP69',
      'Kích thước': '161.5 × 76.5 × 8.3 mm · 224 g'
    }
  },
  {
    id: 'vivo-x300-pro',
    name: 'vivo X300 Pro',
    tagline: 'Camera · Hiệu năng',
    desc: 'Tele 200MP ZEISS APO, chip xử lý hình ảnh VS1 và hệ điều hành OriginOS.',
    price: 29990000,
    oldPrice: 32490000,
    badge: 'ZEISS',
    badgeHot: false,
    img: 'images/vivo-x300-pro-den.png',
    colors: [
      { id: 'den', label: 'Đen', dot: '#2f3236', img: 'images/vivo-x300-pro-den.png' }
    ],
    categories: ['flagship', 'camera', 'performance'],
    featured: 6,
    specs: {
      display: '6.78" AMOLED 120Hz',
      camera: '200MP ZEISS APO',
      battery: '6500 mAh · 90W'
    },
    detail: {
      'Màn hình': '6.78 inch AMOLED LTPO, 120Hz, 1.5K',
      'Chip xử lý': 'MediaTek Dimensity 9500 · chip hình ảnh VS1',
      'RAM / Bộ nhớ': '16GB RAM · 512GB',
      'Camera sau': '50MP chính OIS + 200MP Tele ZEISS APO + 50MP Ultra Wide',
      'Camera trước': '50MP',
      'Pin & Sạc': '6500 mAh · sạc nhanh 90W · sạc không dây 40W',
      'Kết nối': '5G · Wi-Fi 7 · Bluetooth 6 · NFC · IR',
      'Kháng nước': 'IP68 / IP69',
      'Kích thước': '161.9 × 75.5 × 8.0 mm · 226 g'
    }
  },
  {
    id: 'xiaomi-17t-pro',
    name: 'Xiaomi 17T Pro',
    tagline: 'Hiệu năng',
    desc: 'Màn hình 144Hz, pin 6000 mAh và sạc nhanh 100W trong tầm giá dễ chịu.',
    price: 23990000,
    oldPrice: 25990000,
    badge: 'Bán chạy',
    badgeHot: true,
    img: 'images/xiaomi-17t-pro-tim.png',
    colors: [
      { id: 'tim', label: 'Tím', dot: '#9d8fb5', img: 'images/xiaomi-17t-pro-tim.png' },
      { id: 'den', label: 'Đen', dot: '#35383d', img: 'images/xiaomi-17t-pro-den.png' }
    ],
    categories: ['performance'],
    featured: 5,
    specs: {
      display: '6.83" AMOLED 144Hz',
      camera: '50MP + 50MP Tele',
      battery: '6000 mAh · 100W'
    },
    detail: {
      'Màn hình': '6.83 inch AMOLED, 144Hz, 1.5K',
      'Chip xử lý': 'MediaTek Dimensity 9400+',
      'RAM / Bộ nhớ': '12GB RAM · 256GB / 512GB / 1TB',
      'Camera sau': '50MP chính OIS + 50MP Tele 2x + 12MP Ultra Wide',
      'Camera trước': '20MP',
      'Pin & Sạc': '6000 mAh · sạc nhanh 100W',
      'Kết nối': '5G · Wi-Fi 7 · Bluetooth 6 · NFC · IR',
      'Kháng nước': 'IP68',
      'Kích thước': '163.2 × 77.9 × 8.1 mm · 210 g'
    }
  },
  {
    id: 'galaxy-a57',
    name: 'Samsung Galaxy A57',
    tagline: 'Tầm trung',
    desc: 'Màn hình AMOLED 120Hz, camera chống rung OIS và cam kết cập nhật dài lâu.',
    price: 10490000,
    oldPrice: 11990000,
    badge: null,
    badgeHot: false,
    img: 'images/galaxy-a57-tim.png',
    colors: [
      { id: 'tim', label: 'Tím', dot: '#b6a8d6', img: 'images/galaxy-a57-tim.png' }
    ],
    categories: ['budget'],
    featured: 4,
    specs: {
      display: '6.7" AMOLED 120Hz',
      camera: '50MP OIS + 12MP',
      battery: '5000 mAh · 45W'
    },
    detail: {
      'Màn hình': '6.7 inch Super AMOLED, 120Hz, Full HD+',
      'Chip xử lý': 'Exynos 1580',
      'RAM / Bộ nhớ': '8GB RAM · 128GB / 256GB',
      'Camera sau': '50MP chính OIS + 12MP Ultra Wide + 5MP Macro',
      'Camera trước': '12MP',
      'Pin & Sạc': '5000 mAh · sạc nhanh 45W',
      'Kết nối': '5G · Wi-Fi 6 · Bluetooth 5.4 · NFC',
      'Kháng nước': 'IP67',
      'Kích thước': '158.2 × 76.4 × 7.4 mm · 198 g'
    }
  },
  {
    id: 'redmi-note-15-pro',
    name: 'Redmi Note 15 Pro 5G',
    tagline: 'Phổ thông',
    desc: 'Camera 200MP, màn hình AMOLED 120Hz và pin lớn trong phân khúc phổ thông.',
    price: 8990000,
    oldPrice: 10490000,
    badge: 'Giá tốt',
    badgeHot: true,
    img: 'images/redmi-note-15-pro-trang.png',
    colors: [
      { id: 'trang', label: 'Trắng', dot: '#e2ded6', img: 'images/redmi-note-15-pro-trang.png' },
      { id: 'den', label: 'Đen', dot: '#33363a', img: 'images/redmi-note-15-pro-den.png' }
    ],
    categories: ['budget', 'performance'],
    featured: 3,
    specs: {
      display: '6.83" AMOLED 120Hz',
      camera: '200MP OIS + 8MP',
      battery: '6500 mAh · 45W'
    },
    detail: {
      'Màn hình': '6.83 inch AMOLED, 120Hz, 1.5K',
      'Chip xử lý': 'Snapdragon 7s Gen 4',
      'RAM / Bộ nhớ': '12GB RAM · 256GB / 512GB',
      'Camera sau': '200MP chính OIS + 8MP Ultra Wide + 2MP Macro',
      'Camera trước': '20MP',
      'Pin & Sạc': '6500 mAh · sạc nhanh 45W',
      'Kết nối': '5G · Wi-Fi 6 · Bluetooth 5.4 · NFC · IR',
      'Kháng nước': 'IP68',
      'Kích thước': '163.3 × 78.0 × 8.2 mm · 210 g'
    }
  }
];

/* Ảnh gallery cho section CAMERA (thay bằng ảnh thật của nhóm nếu muốn) */
const GALLERY = [
  { src: 'images/camera-01.jpg', title: 'Golden Hour', meta: 'Ultra Wide · 50MP' },
  { src: 'images/camera-02.jpg', title: 'City Nights', meta: 'Night Mode · 200MP' },
  { src: 'images/camera-03.jpg', title: 'Portrait', meta: 'Telephoto 3x · 64MP' },
  { src: 'images/camera-04.jpg', title: 'Macro Detail', meta: 'Macro · 200MP' }
];

/*
  DANH SÁCH THÀNH VIÊN MẶC ĐỊNH
  -------------------------------------------------------------
  Nhóm chỉ cần sửa/thêm object trong mảng này để đổi thông tin thật.
  Trang admin cũng có thể sửa trực tiếp trên giao diện.
*/
const DEFAULT_MEMBERS = [
  {
    code: '25002665',
    name: 'Mông Đại Lâm',
    role: 'Trưởng nhóm · Thiết kế giao diện',
    hobbies: ['Công nghệ', 'Nhiếp ảnh', 'Âm nhạc'],
    photo: 'images/member-01.jpg',
    bio: 'Phụ trách định hướng thiết kế và dựng toàn bộ giao diện Aurora Mobile. Mê ảnh film và luôn thử nghiệm những layout mới.'
  },
  {
    code: '25002453',
    name: 'Lê Đào Trường Giang',
    role: 'Lập trình JavaScript',
    hobbies: ['Lập trình', 'Đọc sách', 'Du lịch'],
    photo: 'images/member-02.jpg',
    bio: 'Viết logic cho bộ lọc, tìm kiếm, giỏ hàng và toàn bộ phần kiểm tra dữ liệu form. Thích code sạch và UI mượt.'
  }
];

/* ==========================================================================
   02. UTILITIES
   ========================================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.prototype.slice.call(ctx.querySelectorAll(sel));

/** Định dạng tiền Việt Nam: 24990000 -> "24.990.000đ" */
function formatVND(value) {
  return Number(value).toLocaleString('vi-VN') + 'đ';
}

/** Chặn hàm chạy liên tục khi người dùng gõ phím */
function debounce(fn, wait) {
  let timer = null;
  return function () {
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(null, args);
    }, wait);
  };
}

/** localStorage an toàn (một số trình duyệt chặn khi mở file://) */
const store = {
  get: function (key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set: function (key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* bỏ qua nếu không lưu được */
    }
  },
  remove: function (key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      /* bỏ qua nếu không xoá được */
    }
  }
};

const getProduct = (id) => PRODUCTS.filter((p) => p.id === id)[0] || null;
const getStorage = (id) => STORAGE_OPTIONS.filter((s) => s.id === id)[0] || STORAGE_OPTIONS[0];

/** Danh sách màu của một sản phẩm. Nếu sản phẩm chưa khai báo màu nào
    thì trả về một màu mặc định để giao diện vẫn hoạt động. */
function colorsOf(product) {
  if (product && product.colors && product.colors.length) return product.colors;
  return [{
    id: 'mac-dinh',
    label: 'Mặc định',
    dot: '#8d98ac',
    img: product ? product.img : ''
  }];
}

/** Lấy một màu của sản phẩm theo id; không khớp thì lấy màu đầu tiên */
function getColor(product, id) {
  const list = colorsOf(product);
  return list.filter((c) => c.id === id)[0] || list[0];
}

/** Ảnh hiển thị của sản phẩm theo màu đang chọn */
function imageFor(product, colorId) {
  if (!product) return '';
  return getColor(product, colorId).img || product.img;
}

/** Tính giá bán = giá gốc + phụ phí phiên bản */
function priceFor(product, storageId) {
  if (!product) return 0;
  return product.price + getStorage(storageId).delta;
}

/** Lấy tham số trên URL: ?id=aurora-x1&color=ocean */
function queryParam(name, fallback) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  return value === null || value === '' ? fallback : value;
}

/* ---------------------- Đọc / ghi dữ liệu localStorage ------------------ */

/**
 * Đọc một mảng JSON đã lưu; nếu trống hoặc hỏng thì dùng dữ liệu mặc định.
 * Luôn trả về BẢN SAO của dữ liệu mặc định, nhờ vậy việc sửa/xoá trong trang
 * admin không làm hỏng mảng gốc DEFAULT_PRODUCTS / DEFAULT_MEMBERS.
 */
function readList(key, fallback) {
  const raw = store.get(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) {
      /* dữ liệu hỏng → rơi xuống dùng bản gốc */
    }
  }
  return JSON.parse(JSON.stringify(fallback));
}

/** Ghi một mảng xuống localStorage */
function saveList(key, list) {
  store.set(key, JSON.stringify(list));
}

/** Sinh id duy nhất cho sản phẩm / thành viên mới */
function createId(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Đọc dữ liệu đang dùng: ưu tiên bản đã sửa trong admin, không có thì lấy gốc */
let PRODUCTS = readList(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
let MEMBERS = readList(STORAGE_KEYS.members, DEFAULT_MEMBERS);

/* ==========================================================================
   03. TOAST — thông báo nhỏ ở góc màn hình
   ========================================================================== */
const TOAST_ICONS = {
  success:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  error:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  info:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 16v-5M12 8v.01"/><circle cx="12" cy="12" r="9"/></svg>'
};

/**
 * Hiển thị toast.
 * @param {string} message  Nội dung chính
 * @param {string} type     'success' | 'error' | 'info'
 * @param {string} [title]  Dòng tiêu đề nhỏ (tuỳ chọn)
 * @param {number} [duration] Thời gian hiển thị (ms)
 */
function showToast(message, type, title, duration) {
  const stack = $('#toastStack');
  if (!stack) return;

  type = type || 'success';
  duration = duration || 4000;

  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
  el.setAttribute('role', 'status');

  const icon = document.createElement('span');
  icon.className = 'toast__icon';
  icon.innerHTML = TOAST_ICONS[type] || TOAST_ICONS.info;

  const body = document.createElement('div');
  if (title) {
    const t = document.createElement('div');
    t.className = 'toast__title';
    t.textContent = title;
    body.appendChild(t);
  }
  const p = document.createElement('div');
  p.className = 'toast__text';
  p.textContent = message;
  body.appendChild(p);

  const bar = document.createElement('span');
  bar.className = 'toast__bar';
  bar.style.animationDuration = duration + 'ms';

  el.appendChild(icon);
  el.appendChild(body);
  el.appendChild(bar);
  stack.appendChild(el);

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    el.classList.add('is-out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 340);
  }

  el.addEventListener('click', close);
  setTimeout(close, duration);
}

/* ==========================================================================
   04. THEME — Dark / Light mode
   ========================================================================== */
const THEME_KEY = 'aurora-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const btn = $('#themeToggle');
  if (btn) {
    const label = theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#05070c' : '#f4f6fa');
}

function initTheme() {
  const saved = store.get(THEME_KEY);
  const prefersLight =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(saved === 'light' || saved === 'dark' ? saved : prefersLight ? 'light' : 'dark');

  const btn = $('#themeToggle');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const next =
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set(THEME_KEY, next);
  });
}

/* ==========================================================================
   05. HEADER — sticky, mobile menu, thanh tìm kiếm
   ========================================================================== */
function initHeader() {
  const header = $('#siteHeader');
  const toggle = $('#navToggle');
  const searchToggle = $('#searchToggle');
  const searchClose = $('#searchClose');
  const searchInput = $('#globalSearch');
  const searchResults = $('#searchResults');

  /* --- 5.1 Header đổi nền khi cuộn --- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- 5.2 Menu hamburger (mobile) --- */
  function closeNav() {
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  $$('#primaryNav a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* --- 5.3 Thanh tìm kiếm toàn cục --- */
  function openSearch() {
    if (!header) return;
    header.classList.add('is-search-open');
    if (searchInput) {
      searchInput.focus();
      if (!searchInput.value) renderSearchResults('');
    }
  }

  function closeSearch() {
    if (!header) return;
    header.classList.remove('is-search-open');
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      if (header.classList.contains('is-search-open')) closeSearch();
      else openSearch();
    });
  }
  if (searchClose) searchClose.addEventListener('click', closeSearch);

  function renderSearchResults(keyword) {
    if (!searchResults) return;
    const q = normalize(keyword);

    if (!q) {
      const hot = PRODUCTS.slice()
        .sort(function (a, b) { return b.featured - a.featured; })
        .slice(0, 3);
      searchResults.innerHTML =
        '<p class="search-results__hint">Gợi ý cho bạn</p>' + hot.map(searchRow).join('');
      return;
    }

    const found = PRODUCTS.filter(function (p) {
      return (
        normalize(p.name).indexOf(q) > -1 ||
        normalize(p.tagline).indexOf(q) > -1 ||
        normalize(p.categories.join(' ')).indexOf(q) > -1
      );
    });

    if (!found.length) {
      searchResults.innerHTML =
        '<p class="search-results__hint">Không tìm thấy sản phẩm nào khớp với “' +
        escapeHTML(keyword) + '”.</p>';
      return;
    }

    searchResults.innerHTML =
      found.map(searchRow).join('') +
      '<a class="search-result" href="products.html?q=' +
      encodeURIComponent(keyword) +
      '"><span class="search-result__price">Xem tất cả kết quả →</span></a>';
  }

  function searchRow(p) {
    return (
      '<a class="search-result" href="product-detail.html?id=' + p.id + '">' +
      '<img src="' + p.img + '" alt="' + escapeHTML(p.name) + '" loading="lazy">' +
      '<span class="search-result__text">' +
      '<strong>' + escapeHTML(p.name) + '</strong>' +
      '<span class="search-result__tagline">' + escapeHTML(p.tagline) + '</span>' +
      '</span>' +
      '<span class="search-result__price">' + formatVND(p.price) + '</span>' +
      '</a>'
    );
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce(function () {
      renderSearchResults(searchInput.value);
    }, 160));

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const first = $('.search-result', searchResults);
        if (first && first.getAttribute('href')) window.location.href = first.getAttribute('href');
      }
    });
  }

  /* --- 5.4 Đóng menu / tìm kiếm bằng phím ESC --- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeNav();
    closeSearch();
  });

  /* --- 5.5 Click ra ngoài thì đóng thanh tìm kiếm --- */
  document.addEventListener('click', function (e) {
    if (!header) return;
    if (!header.classList.contains('is-search-open')) return;
    if (header.contains(e.target)) return;
    closeSearch();
  });
}

/** Bỏ dấu tiếng Việt để tìm kiếm dễ hơn: "Điện thoại" -> "dien thoai" */
function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/** Chống chèn HTML khi in dữ liệu người dùng ra giao diện */
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ==========================================================================
   06. SCROLL EFFECTS — reveal, counter, progress bar, pin
   ========================================================================== */

/** Hiệu ứng xuất hiện dần khi cuộn tới */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach(function (el) { io.observe(el); });
}

/** Đếm số chạy từ 0 → giá trị thật khi section xuất hiện */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  function run(el) {
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = parseInt(el.getAttribute('data-duration') || '1500', 10);
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo cho cảm giác "chạy chậm dần" tự nhiên
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (el) {
      el.textContent = parseFloat(el.getAttribute('data-count')).toFixed(
        parseInt(el.getAttribute('data-decimals') || '0', 10)
      );
    });
    return;
  }

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(function (el) { io.observe(el); });
}

/** Thanh tiến trình hiệu năng chạy khi cuộn tới */
function initBars() {
  const bars = $$('.bar');
  if (!bars.length) return;

  function activate(el) {
    const value = el.getAttribute('data-bar') || '0';
    el.style.setProperty('--val', value + '%');
    el.classList.add('is-active');

    const valEl = $('.bar__val', el);
    if (!valEl) return;
    const target = parseFloat(value) || 0;
    const start = performance.now();
    const duration = 1500;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      valEl.textContent = Math.round(target * eased) + '%';
      if (progress < 1) requestAnimationFrame(tick);
      else valEl.textContent = target + '%';
    }
    requestAnimationFrame(tick);
  }

  if (!('IntersectionObserver' in window)) {
    bars.forEach(activate);
    return;
  }

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        activate(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach(function (el) { io.observe(el); });
}

/** Mô phỏng sạc pin: 0% → 25% → 50% → 75% → 100% */
function initBattery() {
  const wrap = $('#battery');
  if (!wrap) return;

  const fill = $('#batteryFill');
  const pct = $('#batteryPct');
  const steps = $$('.battery__steps li');
  const sequence = [0, 25, 50, 75, 100];
  let started = false;

  function play() {
    if (started) return;
    started = true;

    sequence.forEach(function (value, index) {
      setTimeout(function () {
        if (fill) fill.style.width = value + '%';
        if (pct) pct.textContent = value + '%';
        steps.forEach(function (li, i) {
          li.classList.toggle('is-on', i < index);
        });
      }, index * 620);
    });
  }

  if (!('IntersectionObserver' in window)) {
    play();
    return;
  }

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) play();
      });
    },
    { threshold: 0.45 }
  );
  io.observe(wrap);
}

/* ==========================================================================
   07. PRODUCTS — render + filter + search + sort
   ========================================================================== */
function initProductsPage() {
  const grid = $('#productGrid');
  if (!grid) return;

  const chipsWrap = $('#filterChips');
  const searchInput = $('#productSearch');
  const sortSelect = $('#productSort');
  const countEl = $('#resultCount');

  /* Trạng thái bộ lọc hiện tại */
  const state = {
    category: queryParam('cat', 'all'),
    keyword: queryParam('q', ''),
    sort: 'featured'
  };

  if (searchInput && state.keyword) searchInput.value = state.keyword;

  /* --- 7.1 Dựng nút lọc --- */
  if (chipsWrap) {
    chipsWrap.innerHTML = CATEGORIES.map(function (c) {
      return (
        '<button type="button" class="chip' +
        (c.id === state.category ? ' is-active' : '') +
        '" data-category="' + c.id + '">' + c.label + '</button>'
      );
    }).join('');

    chipsWrap.addEventListener('click', function (e) {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      state.category = btn.getAttribute('data-category');
      $$('.chip', chipsWrap).forEach(function (c) {
        c.classList.toggle('is-active', c === btn);
      });
      render();
    });
  }

  /* --- 7.2 Ô tìm kiếm --- */
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function () {
      state.keyword = searchInput.value;
      render();
    }, 180));
  }

  /* --- 7.3 Sắp xếp --- */
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sort = sortSelect.value;
      render();
    });
  }

  /* --- 7.4 Lọc + sắp xếp + render --- */
  function getList() {
    const q = normalize(state.keyword);

    let list = PRODUCTS.filter(function (p) {
      const matchCat = state.category === 'all' || p.categories.indexOf(state.category) > -1;
      const matchKey =
        !q ||
        normalize(p.name).indexOf(q) > -1 ||
        normalize(p.tagline).indexOf(q) > -1 ||
        normalize(p.desc).indexOf(q) > -1;
      return matchCat && matchKey;
    });

    list = list.slice().sort(function (a, b) {
      switch (state.sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'vi');
        default:
          return b.featured - a.featured;
      }
    });

    return list;
  }

  function render() {
    const list = getList();

    if (!list.length) {
      grid.innerHTML =
        '<div class="p-empty">' +
        '<strong>Không tìm thấy sản phẩm phù hợp</strong>' +
        '<span>Hãy thử từ khoá khác hoặc chọn lại danh mục.</span>' +
        '</div>';
    } else {
      grid.innerHTML = list.map(productCard).join('');
    }

    if (countEl) {
      countEl.innerHTML =
        'Hiển thị <b>' + list.length + '</b> / ' + PRODUCTS.length + ' sản phẩm' +
        (state.category !== 'all'
          ? ' · danh mục <b>' +
          (CATEGORIES.filter(function (c) { return c.id === state.category; })[0] || {}).label +
          '</b>'
          : '');
    }

    /* Cập nhật URL để có thể chia sẻ / tải lại vẫn giữ bộ lọc */
    const params = new URLSearchParams();
    if (state.category !== 'all') params.set('cat', state.category);
    if (state.keyword.trim()) params.set('q', state.keyword.trim());
    const qs = params.toString();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
    }
  }

  render();
}

/** Template 1 card sản phẩm */
function productCard(p, index) {
  const badge = p.badge
    ? '<span class="p-badge' + (p.badgeHot ? ' p-badge--hot' : '') + '">' + escapeHTML(p.badge) + '</span>'
    : '';

  return (
    '<a class="p-card d-' + ((index % 6) + 1) + '" href="product-detail.html?id=' + p.id + '">' +
    '<div class="p-card__media">' +
    badge +
    '<img src="' + p.img + '" alt="Điện thoại ' + escapeHTML(p.name) + '" loading="lazy">' +
    '</div>' +
    '<div class="p-card__body">' +
    '<span class="p-card__cat">' + escapeHTML(p.tagline) + '</span>' +
    '<h3 class="p-card__name">' + escapeHTML(p.name) + '</h3>' +
    '<p class="p-card__desc">' + escapeHTML(p.desc) + '</p>' +
    '<ul class="p-card__specs">' +
    '<li>' + escapeHTML(p.specs.display) + '</li>' +
    '<li>' + escapeHTML(p.specs.camera) + '</li>' +
    '<li>' + escapeHTML(p.specs.battery) + '</li>' +
    '</ul>' +
    '<div class="p-card__foot">' +
    '<div class="p-card__price">' + formatVND(p.price) + '<small>Từ · 256GB</small></div>' +
    '<span class="p-card__go" aria-hidden="true">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
    '</span>' +
    '</div>' +
    '</div>' +
    '</a>'
  );
}

/* ==========================================================================
   08. PRODUCT DETAIL — chọn màu, phiên bản, đổi giá, đổi ảnh
   ========================================================================== */
function initProductDetail() {
  const root = $('#productDetail');
  if (!root) return;

  const product = getProduct(queryParam('id', 'aurora-x1-pro')) || PRODUCTS[1];

  /* Trạng thái lựa chọn hiện tại */
  const colorList = colorsOf(product);
  const selected = {
    color: getColor(product, queryParam('color', colorList[0].id)).id,
    storage: getStorage(queryParam('storage', '512gb')).id,
    qty: 1
  };

  /* --- 8.1 Đổ dữ liệu tĩnh --- */
  document.title = product.name + ' — AURORA MOBILE';

  const el = {
    breadcrumb: $('#pdBreadcrumb'),
    eyebrow: $('#pdEyebrow'),
    name: $('#pdName'),
    tagline: $('#pdTagline'),
    price: $('#pdPrice'),
    oldPrice: $('#pdOldPrice'),
    save: $('#pdSave'),
    img: $('#pdImage'),
    colors: $('#pdColors'),
    storages: $('#pdStorages'),
    colorLabel: $('#pdColorLabel'),
    storageLabel: $('#pdStorageLabel'),
    specBody: $('#pdSpecBody'),
    thumbs: $('#pdThumbs'),
    orderBtn: $('#pdOrderBtn'),
    related: $('#pdRelated')
  };

  if (el.breadcrumb) el.breadcrumb.textContent = product.name;
  if (el.eyebrow) el.eyebrow.textContent = product.tagline;
  if (el.name) el.name.textContent = product.name.toUpperCase();
  if (el.tagline) el.tagline.textContent = SLOGANS[product.id] || product.tagline;

  /* --- 8.2 Bảng thông số --- */
  if (el.specBody) {
    el.specBody.innerHTML = Object.keys(product.detail)
      .map(function (key) {
        return '<tr><th scope="row">' + escapeHTML(key) + '</th><td>' + escapeHTML(product.detail[key]) + '</td></tr>';
      })
      .join('');
  }

  /* --- 8.3 Nút chọn màu (theo đúng bảng màu của sản phẩm) --- */
  if (el.colors) {
    el.colors.innerHTML = colorList.map(function (c) {
      return (
        '<label class="swatch">' +
        '<input type="radio" name="pd-color" value="' + c.id + '">' +
        '<span class="swatch__dot" data-dot="' + c.dot + '"></span>' +
        '<span>' + escapeHTML(c.label) + '</span>' +
        '</label>'
      );
    }).join('');

    /* Gán màu cho chấm tròn bằng JS (không viết style trực tiếp trong HTML) */
    $$('.swatch__dot', el.colors).forEach(function (dot) {
      dot.style.setProperty('--dot', dot.getAttribute('data-dot'));
    });

    el.colors.addEventListener('change', function (e) {
      if (e.target.name !== 'pd-color') return;
      selected.color = e.target.value;
      updateImage(true);
      updateThumbs();
      updatePrice();
    });
  }

  /* --- 8.4 Nút chọn phiên bản --- */
  if (el.storages) {
    el.storages.innerHTML = STORAGE_OPTIONS.map(function (s) {
      return (
        '<label class="storage-opt">' +
        '<input type="radio" name="pd-storage" value="' + s.id + '">' +
        '<b>' + s.label + '</b>' +
        '<small>' + (s.delta === 0 ? 'Giá gốc' : '+' + formatVND(s.delta)) + '</small>' +
        '</label>'
      );
    }).join('');

    el.storages.addEventListener('change', function (e) {
      if (e.target.name !== 'pd-storage') return;
      selected.storage = e.target.value;
      updatePrice();
    });
  }

  /* --- 8.5 Ảnh thumbnail theo màu --- */
  if (el.thumbs) {
    el.thumbs.innerHTML = colorList.map(function (c) {
      return (
        '<button type="button" data-color="' + c.id + '" aria-label="Xem màu ' + escapeHTML(c.label) + '">' +
        '<img src="' + c.img + '" alt="' + escapeHTML(c.label) + '">' +
        '</button>'
      );
    }).join('');

    el.thumbs.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-color]');
      if (!btn) return;
      selected.color = btn.getAttribute('data-color');
      const radio = $('input[name="pd-color"][value="' + selected.color + '"]', el.colors);
      if (radio) radio.checked = true;
      updateImage(true);
      updateThumbs();
      updatePrice();
    });
  }

  function updateThumbs() {
    if (!el.thumbs) return;
    $$('button[data-color]', el.thumbs).forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-color') === selected.color);
    });
  }

  /** Đổi ảnh chính; có hiệu ứng mờ dần khi đổi màu */
  function updateImage(animate) {
    if (!el.img) return;
    const src = imageFor(product, selected.color);
    const stage = el.img.closest('.p-detail__stage');

    if (!animate) {
      el.img.src = src;
      return;
    }
    if (stage) stage.classList.add('is-swapping');
    setTimeout(function () {
      el.img.src = src;
      if (stage) stage.classList.remove('is-swapping');
    }, 220);
  }

  /** Cập nhật giá theo phiên bản đang chọn */
  function updatePrice() {
    const price = priceFor(product, selected.storage);

    if (el.price) el.price.textContent = formatVND(price);
    if (el.oldPrice) {
      const old = product.oldPrice + getStorage(selected.storage).delta;
      el.oldPrice.textContent = formatVND(old);
      el.oldPrice.style.display = old > price ? '' : 'none';
    }
    if (el.save) {
      const old = product.oldPrice + getStorage(selected.storage).delta;
      const diff = old - price;
      if (diff > 0) {
        el.save.textContent = 'Tiết kiệm ' + formatVND(diff);
        el.save.style.display = '';
      } else {
        el.save.style.display = 'none';
      }
    }
    if (el.colorLabel) el.colorLabel.textContent = getColor(product, selected.color).label;
    if (el.storageLabel) el.storageLabel.textContent = getStorage(selected.storage).label;
    if (el.orderBtn) {
      el.orderBtn.setAttribute(
        'href',
        'order.html?id=' + product.id + '&storage=' + selected.storage + '&color=' + selected.color
      );
    }
  }

  /* --- 8.6 Sản phẩm liên quan --- */
  if (el.related) {
    const related = PRODUCTS.filter(function (p) { return p.id !== product.id; }).slice(0, 3);
    el.related.innerHTML = related.map(productCard).join('');
  }

  /* --- 8.7 Khởi tạo trạng thái ban đầu --- */
  const colorRadio = $('input[name="pd-color"][value="' + selected.color + '"]', el.colors);
  if (colorRadio) colorRadio.checked = true;
  const storageRadio = $('input[name="pd-storage"][value="' + selected.storage + '"]', el.storages);
  if (storageRadio) storageRadio.checked = true;

  updateImage(false);
  updateThumbs();
  updatePrice();
}

/* ==========================================================================
   09. GALLERY + LIGHTBOX
   ========================================================================== */
function initGallery() {
  const wrap = $('#gallery');
  if (!wrap) return;

  /* --- 9.1 Dựng lưới ảnh --- */
  wrap.innerHTML = GALLERY.map(function (item, index) {
    return (
      '<figure class="gallery__item" data-index="' + index + '" tabindex="0" role="button" ' +
      'aria-label="Xem ảnh lớn: ' + escapeHTML(item.title) + '">' +
      '<img src="' + item.src + '" alt="' + escapeHTML(item.title) + '" loading="lazy">' +
      '<figcaption class="gallery__cap">' +
      '<span>' + escapeHTML(item.title) + '</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg>' +
      '</figcaption>' +
      '</figure>'
    );
  }).join('');

  const lightbox = $('#lightbox');
  const lbImg = $('#lightboxImg');
  const lbTitle = $('#lightboxTitle');
  const lbMeta = $('#lightboxMeta');
  const lbCount = $('#lightboxCount');
  if (!lightbox) return;

  let current = 0;

  function paint() {
    const item = GALLERY[current];
    lbImg.src = item.src;
    lbImg.alt = item.title;
    lbTitle.textContent = item.title;
    lbMeta.textContent = item.meta;
    lbCount.textContent = current + 1 + ' / ' + GALLERY.length;
  }

  function open(index) {
    current = index;
    paint();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    const closeBtn = $('.lightbox__close', lightbox);
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  function step(delta) {
    current = (current + delta + GALLERY.length) % GALLERY.length;
    paint();
  }

  wrap.addEventListener('click', function (e) {
    const fig = e.target.closest('.gallery__item');
    if (fig) open(parseInt(fig.getAttribute('data-index'), 10));
  });

  wrap.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const fig = e.target.closest('.gallery__item');
    if (!fig) return;
    e.preventDefault();
    open(parseInt(fig.getAttribute('data-index'), 10));
  });

  const prev = $('.lightbox__nav--prev', lightbox);
  const next = $('.lightbox__nav--next', lightbox);
  const closeBtn = $('.lightbox__close', lightbox);

  if (prev) prev.addEventListener('click', function () { step(-1); });
  if (next) next.addEventListener('click', function () { step(1); });
  if (closeBtn) closeBtn.addEventListener('click', close);

  /* Click ra vùng nền tối để đóng */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  /* Bàn phím: ESC đóng, ← → chuyển ảnh */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

/* ==========================================================================
   10. MODAL dùng chung
   ========================================================================== */
function initModal() {
  const modal = $('#notifyModal');
  if (!modal) return;

  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    const input = $('#n-email', modal);
    if (input) setTimeout(function () { input.focus(); }, 260);
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocused) lastFocused.focus();
  }

  $$('[data-open-modal="notify"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  });

  const closeBtn = $('.modal__close', modal);
  if (closeBtn) closeBtn.addEventListener('click', close);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}

/* ==========================================================================
   11. VALIDATION ENGINE
   --------------------------------------------------------------------------
   Mỗi field = { id, rules: [{ test, msg }] }
   Hàm runRules trả về chuỗi lỗi đầu tiên, hoặc '' nếu hợp lệ.
   ========================================================================== */

/** Các hàm kiểm tra dùng lại nhiều lần */
const checks = {
  notEmpty: function (v) {
    return String(v).trim().length > 0;
  },
  isEmail: function (v) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(v).trim());
  },
  isDigits: function (v) {
    return /^[0-9]+$/.test(String(v).trim());
  }
};

/** Quy tắc cho từng loại dữ liệu — có thể tái sử dụng ở cả 2 form */
const RULES = {
  fullname: [
    { test: checks.notEmpty, msg: 'Vui lòng nhập họ và tên.' },
    { test: function (v) { return String(v).trim().length >= 2; }, msg: 'Họ tên phải có ít nhất 2 ký tự.' },
    {
      test: function (v) { return /^[\p{L}\s.'’-]+$/u.test(String(v).trim()); },
      msg: 'Họ tên không được chứa số hoặc ký tự đặc biệt.'
    }
  ],
  email: [
    { test: checks.notEmpty, msg: 'Vui lòng nhập email.' },
    { test: checks.isEmail, msg: 'Email không hợp lệ.' }
  ],
  phone: [
    { test: checks.notEmpty, msg: 'Vui lòng nhập số điện thoại.' },
    { test: checks.isDigits, msg: 'Số điện thoại chỉ được nhập số, không chứa chữ.' },
    {
      test: function (v) { return String(v).trim().length >= 10 && String(v).trim().length <= 11; },
      msg: 'Số điện thoại phải có 10 đến 11 chữ số.'
    }
  ],
  address: [
    { test: checks.notEmpty, msg: 'Vui lòng nhập địa chỉ nhận hàng.' },
    { test: function (v) { return String(v).trim().length >= 5; }, msg: 'Địa chỉ quá ngắn, vui lòng nhập rõ hơn.' }
  ],
  topic: [
    { test: checks.notEmpty, msg: 'Vui lòng chọn chủ đề liên hệ.' }
  ],
  message: [
    { test: checks.notEmpty, msg: 'Vui lòng nhập nội dung.' },
    { test: function (v) { return String(v).trim().length >= 10; }, msg: 'Nội dung phải có ít nhất 10 ký tự.' }
  ],
  product: [
    { test: checks.notEmpty, msg: 'Vui lòng chọn sản phẩm.' }
  ],
  storage: [
    { test: checks.notEmpty, msg: 'Vui lòng chọn phiên bản bộ nhớ.' }
  ],
  qty: [
    { test: checks.notEmpty, msg: 'Vui lòng nhập số lượng.' },
    { test: checks.isDigits, msg: 'Số lượng chỉ được nhập số.' },
    { test: function (v) { return parseInt(v, 10) >= 1; }, msg: 'Số lượng phải từ 1 trở lên.' },
    { test: function (v) { return parseInt(v, 10) <= 10; }, msg: 'Mỗi đơn hàng tối đa 10 sản phẩm.' }
  ],
  agree: [
    { test: function (v) { return v === true; }, msg: 'Bạn cần đồng ý với điều khoản để tiếp tục.' }
  ]
};

/** Chạy toàn bộ rule của 1 field, trả về message lỗi đầu tiên */
function runRules(value, rules) {
  for (let i = 0; i < rules.length; i++) {
    if (!rules[i].test(value)) return rules[i].msg;
  }
  return '';
}

/**
 * Gán trạng thái cho 1 field:
 *  - input.error  + wrapper .error  → khi có lỗi
 *  - input.valid  + wrapper .valid  → khi hợp lệ
 *  - in thông báo lỗi ngay dưới input
 */
function setFieldState(input, message) {
  if (!input) return !message;

  const field = input.closest('.field') || input.closest('.opt-group');
  const msgEl = field ? field.querySelector('.msg, .group-error') : null;

  input.classList.remove('error', 'valid');

  if (message) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    if (field) {
      field.classList.add('error');
      field.classList.remove('valid');
    }
    if (msgEl) msgEl.textContent = message;
    return false;
  }

  input.classList.add('valid');
  input.removeAttribute('aria-invalid');
  if (field) {
    field.classList.add('valid');
    field.classList.remove('error');
  }
  if (msgEl) msgEl.textContent = '';
  return true;
}

/** Lấy giá trị của input theo loại (checkbox trả boolean, radio trả value) */
function readValue(input) {
  if (!input) return '';
  if (input.type === 'checkbox') return input.checked;
  return input.value;
}

/**
 * Kiểm tra 1 field theo bộ rule.
 * @returns {boolean} true nếu hợp lệ
 */
function validateField(input, rules, options) {
  options = options || {};
  const raw = readValue(input);
  let message = runRules(raw, rules);

  /* Cho phép "im lặng" khi người dùng chưa nhập gì (validate lúc gõ) */
  if (message && options.onlyWhenFilled) {
    const empty = input.type === 'checkbox' ? !input.checked : !String(raw).trim();
    if (empty && input.dataset.touched !== '1') message = '';
  }

  return setFieldState(input, message);
}

/** Kiểm tra toàn bộ form, tự cuộn tới ô lỗi đầu tiên */
function validateForm(fields) {
  let firstBad = null;

  fields.forEach(function (item) {
    const input = $('#' + item.id) || document.querySelector('[name="' + item.id + '"]');
    const ok = validateField(input, item.rules);
    if (!ok && !firstBad) firstBad = input;
  });

  if (firstBad) {
    firstBad.dataset.touched = '1';
    firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { firstBad.focus({ preventScroll: true }); }, 320);
  }

  return !firstBad;
}

/**
 * Gắn sự kiện cho form: validate khi submit + validate realtime sau lần gửi đầu.
 * @param {HTMLFormElement} form
 * @param {Array}  fields   danh sách field cần kiểm tra
 * @param {Function} onSuccess  chạy khi toàn bộ dữ liệu hợp lệ
 * @param {Array}  [groups] danh sách nhóm cần kiểm tra riêng (ví dụ nhóm radio màu sắc)
 *                          mỗi phần tử có dạng { validate: function () { return true/false } }
 */
function bindForm(form, fields, onSuccess, groups) {
  if (!form) return;

  let submitted = false;

  fields.forEach(function (item) {
    const input = $('#' + item.id) || form.querySelector('[name="' + item.id + '"]');
    if (!input) return;

    const events = input.tagName === 'SELECT' || input.type === 'checkbox' ? ['change'] : ['input', 'blur'];

    events.forEach(function (evt) {
      input.addEventListener(evt, function () {
        /* Chỉ báo lỗi realtime khi: đã từng bấm gửi, hoặc ô đó đang có lỗi */
        const field = input.closest('.field');
        const wasError = input.classList.contains('error') || (field && field.classList.contains('error'));
        if (!submitted && !wasError && evt !== 'blur') return;
        if (!submitted && !wasError && evt === 'blur' && !String(readValue(input)).trim()) return;

        input.dataset.touched = '1';
        validateField(input, item.rules);
      });
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitted = true;

    fields.forEach(function (item) {
      const input = $('#' + item.id) || form.querySelector('[name="' + item.id + '"]');
      if (input) input.dataset.touched = '1';
    });

    /* Kiểm tra tất cả các field thường */
    const fieldsOk = validateForm(fields);

    /* Kiểm tra thêm các nhóm riêng (radio màu sắc...).
       Cố tình KHÔNG short-circuit để mọi lỗi đều được hiển thị cùng lúc. */
    let groupsOk = true;
    (groups || []).forEach(function (group) {
      if (!group.validate()) groupsOk = false;
    });

    if (!fieldsOk || !groupsOk) {
      showToast('Vui lòng kiểm tra lại các ô được đánh dấu đỏ.', 'error', '✕ Chưa thể gửi');
      return;
    }

    onSuccess(form);
  });
}

/* ==========================================================================
   12. CONTACT FORM
   ========================================================================== */
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const fields = [
    { id: 'c-name', rules: RULES.fullname },
    { id: 'c-email', rules: RULES.email },
    { id: 'c-phone', rules: RULES.phone },
    { id: 'c-topic', rules: RULES.topic },
    { id: 'c-message', rules: RULES.message },
    { id: 'c-agree', rules: RULES.agree }
  ];

  /* Bộ đếm ký tự cho textarea nội dung */
  const message = $('#c-message');
  const counter = $('#c-message-count');
  if (message && counter) {
    const update = function () {
      counter.textContent = message.value.trim().length + ' / 10 ký tự tối thiểu';
    };
    message.addEventListener('input', update);
    update();
  }

  bindForm(form, fields, function () {
    /* Lưu bài gửi vào localStorage để trang admin đọc được */
    const topicSelect = $('#c-topic');
    const contacts = readList(STORAGE_KEYS.contacts, []);
    contacts.unshift({
      id: createId('lh'),
      name: $('#c-name').value.trim(),
      email: $('#c-email').value.trim(),
      phone: $('#c-phone').value.trim(),
      topic: topicSelect.value,
      topicLabel: topicSelect.options[topicSelect.selectedIndex]
        ? topicSelect.options[topicSelect.selectedIndex].text
        : topicSelect.value,
      message: $('#c-message').value.trim(),
      createdAt: new Date().toISOString()
    });
    saveList(STORAGE_KEYS.contacts, contacts);

    showToast('Gửi thông tin thành công! Chúng tôi sẽ phản hồi trong 24 giờ.', 'success', '✓ Đã gửi liên hệ');

    /* Reset form và xoá hết trạng thái valid/error */
    form.reset();
    $$('.field', form).forEach(function (f) {
      f.classList.remove('valid', 'error');
    });
    $$('.input, .select, .textarea', form).forEach(function (i) {
      i.classList.remove('valid', 'error');
      i.removeAttribute('aria-invalid');
      delete i.dataset.touched;
    });
    $$('.msg', form).forEach(function (m) { m.textContent = ''; });
    if (counter) counter.textContent = '0 / 10 ký tự tối thiểu';
  });
}

/* ==========================================================================
   13. ORDER FORM — chọn sản phẩm + tính tổng tiền realtime
   ========================================================================== */
function initOrderForm() {
  const form = $('#orderForm');
  if (!form) return;

  const el = {
    product: $('#o-product'),
    storage: $('#o-storage'),
    colorWrap: $('#o-colors'),
    qty: $('#o-qty'),
    minus: $('#o-qty-minus'),
    plus: $('#o-qty-plus'),
    note: $('#o-note'),
    noteCount: $('#o-note-count'),
    /* Khối ORDER SUMMARY */
    sumImg: $('#sumImage'),
    sumName: $('#sumName'),
    sumVariant: $('#sumVariant'),
    sumQty: $('#sumQty'),
    sumUnit: $('#sumUnit'),
    sumSubtotal: $('#sumSubtotal'),
    sumShip: $('#sumShip'),
    sumTotal: $('#sumTotal')
  };

  /* --- 13.1 Đổ danh sách sản phẩm --- */
  if (el.product) {
    el.product.innerHTML =
      '<option value="">— Chọn sản phẩm —</option>' +
      PRODUCTS.map(function (p) {
        return '<option value="' + p.id + '">' + escapeHTML(p.name) + ' — ' + formatVND(p.price) + '</option>';
      }).join('');
  }

  /* --- 13.2 Đổ danh sách phiên bản --- */
  if (el.storage) {
    el.storage.innerHTML =
      '<option value="">— Chọn phiên bản —</option>' +
      STORAGE_OPTIONS.map(function (s) {
        return (
          '<option value="' + s.id + '">' + s.label +
          (s.delta ? ' (+' + formatVND(s.delta) + ')' : '') + '</option>'
        );
      }).join('');
  }

  /* --- 13.3 Nút chọn màu: phụ thuộc vào sản phẩm đang chọn --- */
  function renderOrderColors(preferred) {
    if (!el.colorWrap) return;

    const product = currentProduct();
    if (!product) {
      el.colorWrap.innerHTML = '<p class="field__hint">Chọn sản phẩm trước để xem các màu có sẵn.</p>';
      return;
    }

    const list = colorsOf(product);
    el.colorWrap.innerHTML = list.map(function (c) {
      return (
        '<label class="swatch">' +
        '<input type="radio" name="o-color" value="' + c.id + '"' +
        (c.id === preferred ? ' checked' : '') + '>' +
        '<span class="swatch__dot" data-dot="' + c.dot + '"></span>' +
        '<span>' + escapeHTML(c.label) + '</span>' +
        '</label>'
      );
    }).join('');

    $$('.swatch__dot', el.colorWrap).forEach(function (dot) {
      dot.style.setProperty('--dot', dot.getAttribute('data-dot'));
    });
  }

  /* --- 13.4 Điền sẵn dữ liệu từ URL (khi bấm ORDER NOW ở trang chi tiết) --- */
  const preProduct = getProduct(queryParam('id', ''));
  if (preProduct && el.product) el.product.value = preProduct.id;
  if (el.storage) el.storage.value = queryParam('storage', '') ? getStorage(queryParam('storage', '')).id : '';

  renderOrderColors(preProduct ? queryParam('color', '') : '');
  if (el.qty) el.qty.value = '1';

  /* --- 13.5 Hàm tính toán lại ORDER SUMMARY --- */
  function currentProduct() {
    return getProduct(el.product ? el.product.value : '');
  }
  function currentColor() {
    const checked = el.colorWrap ? $('input[name="o-color"]:checked', el.colorWrap) : null;
    return checked ? getColor(currentProduct(), checked.value) : null;
  }
  function currentQty() {
    const n = parseInt(el.qty ? el.qty.value : '1', 10);
    return isNaN(n) || n < 1 ? 1 : n;
  }

  function recalc() {
    const product = currentProduct();
    const color = currentColor();
    const storage = el.storage && el.storage.value ? getStorage(el.storage.value) : null;
    const qty = currentQty();

    /* Khối tóm tắt tạm thời khi chưa chọn đủ */
    if (el.sumName) el.sumName.textContent = product ? product.name : 'Chưa chọn sản phẩm';

    const variantParts = [];
    if (storage) variantParts.push(storage.label);
    if (color) variantParts.push(color.label);
    if (el.sumVariant) {
      el.sumVariant.textContent = variantParts.length ? variantParts.join(' · ') : 'Chưa chọn phiên bản';
    }

    if (el.sumQty) el.sumQty.textContent = String(qty);

    /* Ảnh + giá */
    if (el.sumImg) {
      const thumb = el.sumImg.closest('.summary__thumb');
      const fallback = product ? colorsOf(product)[0].img : 'images/iphone-18-pro-max-xanh.png';
      const src = product ? imageFor(product, color ? color.id : colorsOf(product)[0].id) : fallback;
      if (el.sumImg.getAttribute('src') !== src) {
        if (thumb) thumb.classList.add('is-swapping');
        setTimeout(function () {
          el.sumImg.src = src;
          if (thumb) thumb.classList.remove('is-swapping');
        }, 180);
      }
    }

    const unit = product ? priceFor(product, storage ? storage.id : '256gb') : 0;
    const subtotal = unit * qty;

    if (el.sumUnit) el.sumUnit.textContent = product ? formatVND(unit) : '—';
    if (el.sumSubtotal) el.sumSubtotal.textContent = product ? formatVND(subtotal) : '—';
    if (el.sumShip) el.sumShip.textContent = product ? 'Miễn phí' : '—';
    if (el.sumTotal) el.sumTotal.textContent = product ? formatVND(subtotal) : '0đ';
  }

  /* --- 13.6 Lắng nghe thay đổi để tính lại tiền --- */
  if (el.product) {
    el.product.addEventListener('change', function () {
      /* Đổi máy thì nạp lại đúng bảng màu của máy đó */
      renderOrderColors('');
      recalc();
    });
  }
  if (el.storage) el.storage.addEventListener('change', recalc);
  if (el.colorWrap) el.colorWrap.addEventListener('change', recalc);

  /* Bộ chọn số lượng */
  if (el.qty) el.qty.addEventListener('input', recalc);
  if (el.minus) {
    el.minus.addEventListener('click', function () {
      const next = Math.max(1, currentQty() - 1);
      if (el.qty) el.qty.value = next;
      recalc();
    });
  }
  if (el.plus) {
    el.plus.addEventListener('click', function () {
      const next = Math.min(10, currentQty() + 1);
      if (el.qty) el.qty.value = next;
      recalc();
    });
  }

  /* Bộ đếm ký tự ghi chú */
  if (el.note && el.noteCount) {
    el.note.addEventListener('input', function () {
      el.noteCount.textContent = el.note.value.length + ' / 300';
    });
  }

  /* --- 13.7 Validation form đặt hàng --- */
  const fields = [
    { id: 'o-name', rules: RULES.fullname },
    { id: 'o-email', rules: RULES.email },
    { id: 'o-phone', rules: RULES.phone },
    { id: 'o-address', rules: RULES.address },
    { id: 'o-product', rules: RULES.product },
    { id: 'o-storage', rules: RULES.storage },
    { id: 'o-qty', rules: RULES.qty }
  ];

  /* Màu sắc là nhóm radio nên phải kiểm tra riêng, không dùng chung engine của input */
  const colorGroupCheck = {
    validate: function () {
      const group = $('#o-colorGroup');
      if (currentColor()) {
        if (group) group.classList.remove('has-error');
        return true;
      }
      if (group) {
        group.classList.add('has-error');
        const err = $('.group-error', group);
        if (err) err.textContent = 'Vui lòng chọn màu sắc.';
        group.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
  };

  bindForm(form, fields, function () {
    const color = currentColor();
    const product = currentProduct();
    const storage = getStorage(el.storage.value);
    const qty = currentQty();
    const unit = priceFor(product, storage.id);

    /* Lưu đơn hàng vào localStorage để trang admin đọc được */
    const orders = readList(STORAGE_KEYS.orders, []);
    orders.unshift({
      id: createId('dh'),
      code: 'AM' + String(Date.now()).slice(-6),
      name: $('#o-name').value.trim(),
      email: $('#o-email').value.trim(),
      phone: $('#o-phone').value.trim(),
      address: $('#o-address').value.trim(),
      productId: product.id,
      productName: product.name,
      storage: storage.label,
      color: color.label,
      qty: qty,
      unitPrice: unit,
      total: unit * qty,
      note: $('#o-note').value.trim(),
      createdAt: new Date().toISOString()
    });
    saveList(STORAGE_KEYS.orders, orders);

    showToast(
      'Đặt hàng thành công! ' + product.name + ' · ' + storage.label +
      ' · ' + color.label + ' · SL ' + qty + '.',
      'success',
      '✓ Đơn hàng đã được ghi nhận'
    );

    /* Reset form + toàn bộ trạng thái */
    form.reset();
    if (el.qty) el.qty.value = '1';
    $$('.field', form).forEach(function (f) { f.classList.remove('valid', 'error'); });
    $$('.input, .select, .textarea', form).forEach(function (i) {
      i.classList.remove('valid', 'error');
      i.removeAttribute('aria-invalid');
      delete i.dataset.touched;
    });
    $$('.msg', form).forEach(function (m) { m.textContent = ''; });
    const cg = $('#o-colorGroup');
    if (cg) cg.classList.remove('has-error');
    if (el.noteCount) el.noteCount.textContent = '0 / 300';
    recalc();
  }, [colorGroupCheck]);

  /* Xoá lỗi nhóm màu ngay khi người dùng chọn */
  if (el.colorWrap) {
    el.colorWrap.addEventListener('change', function () {
      const group = $('#o-colorGroup');
      if (group) group.classList.remove('has-error');
    });
  }

  recalc();
}

/* ==========================================================================
   14. NOTIFY FORM (trong modal)
   ========================================================================== */
function initNotifyForm() {
  const form = $('#notifyForm');
  if (!form) return;

  const fields = [{ id: 'n-email', rules: RULES.email }];

  bindForm(form, fields, function () {
    showToast('Bạn sẽ là một trong những người đầu tiên nhận thông tin ra mắt.', 'success', '✓ Đã đăng ký nhận tin');
    form.reset();
    $$('.field', form).forEach(function (f) { f.classList.remove('valid', 'error'); });
    $$('.input', form).forEach(function (i) {
      i.classList.remove('valid', 'error');
      delete i.dataset.touched;
    });
    $$('.msg', form).forEach(function (m) { m.textContent = ''; });

    const modal = $('#notifyModal');
    if (modal) {
      modal.classList.remove('is-open');
      document.body.classList.remove('is-locked');
    }
  });
}

/* ==========================================================================
   15. MEMBERS — render danh sách thành viên từ mảng MEMBERS
   --------------------------------------------------------------------------
   Muốn đổi thông tin nhóm: chỉ cần sửa mảng MEMBERS ở phần 01. DATA.
   ========================================================================== */
function initMembers() {
  const grid = $('#teamGrid');
  if (!grid) return;

  const hintIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';

  grid.innerHTML = MEMBERS.map(function (m, index) {
    const tags = m.hobbies
      .map(function (h) { return '<span>' + escapeHTML(h) + '</span>'; })
      .join('');

    return (
      '<article class="member" data-reveal="up" data-delay="' + ((index % 4) + 1) + '">' +
      '<div class="member__photo">' +
      '<img src="' + m.photo + '" alt="Ảnh thành viên ' + escapeHTML(m.name) + '" loading="lazy" width="800" height="800">' +
      '<div class="member__overlay"><p>' + escapeHTML(m.bio) + '</p></div>' +
      '</div>' +
      '<div class="member__body">' +
      '<span class="member__code">Mã SV: ' + escapeHTML(m.code) + '</span>' +
      '<h3 class="member__name">' + escapeHTML(m.name) + '</h3>' +
      '<dl>' +
      '<div class="member__row"><dt>Vai trò</dt><dd>' + escapeHTML(m.role) + '</dd></div>' +
      '<div class="member__row"><dt>Sở thích</dt><dd><span class="member__tags">' + tags + '</span></dd></div>' +
      '</dl>' +
      '<p class="member__hint">' + hintIcon + ' Rê chuột vào ảnh để xem giới thiệu</p>' +
      '</div>' +
      '</article>'
    );
  }).join('');
}

/* ==========================================================================
   15b. FAMILY — 4 sản phẩm nổi bật ở trang chủ
   --------------------------------------------------------------------------
   Render từ mảng PRODUCTS nên khi admin sửa dữ liệu, trang chủ cũng đổi theo.
   ========================================================================== */
function initFamily() {
  const wrap = $('#familyGrid');
  if (!wrap) return;

  const picks = PRODUCTS.slice()
    .sort(function (a, b) { return (b.featured || 0) - (a.featured || 0); })
    .slice(0, 4);

  /* Bố cục so le: card lớn → card dọc → card dọc → card lớn đảo chiều */
  const layout = [
    'family__item--wide',
    'family__item--narrow',
    'family__item--narrow',
    'family__item--wide family__item--reverse'
  ];

  const arrow =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  wrap.innerHTML = picks.map(function (p, i) {
    const color = colorsOf(p)[0];
    return (
      '<article class="family__item ' + layout[i] + '" data-reveal="up" data-delay="' + ((i % 2) + 1) + '">' +
      '<div class="family__copy">' +
      '<span class="family__index">0' + (i + 1) + '</span>' +
      '<h3 class="family__name">' + escapeHTML(p.name) + '</h3>' +
      '<p class="family__tag">' + escapeHTML(p.tagline) + '</p>' +
      '<p class="family__desc">' + escapeHTML(p.desc) + '</p>' +
      '<p class="family__price">' + formatVND(p.price) + ' <small>· từ</small></p>' +
      '<a class="family__cta" href="product-detail.html?id=' + p.id + '">Explore ' + arrow + '</a>' +
      '</div>' +
      '<div class="family__media">' +
      '<img src="' + color.img + '" alt="' + escapeHTML(p.name) + '" loading="lazy">' +
      '</div>' +
      '</article>'
    );
  }).join('');
}

/* ==========================================================================
   16. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = $('#toTop');
  if (!btn) return;

  const ring = $('.to-top__ring .bar', btn);

  function onScroll() {
    const y = window.scrollY;
    btn.classList.toggle('is-visible', y > 560);

    /* Vòng tròn tiến trình quanh nút */
    if (ring) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(y / max, 1) : 0;
      const circumference = 163.4;
      ring.style.strokeDashoffset = String(circumference * (1 - ratio));
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   17. INIT — khởi động toàn bộ
   ========================================================================== */
function initScrollSpyAnchors() {
  /* Cuộn mượt cho các link dạng #anchor ở trang hiện tại */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  /* --- Nhóm 1: render nội dung động (phải chạy TRƯỚC khi gắn scroll reveal) --- */
  initTheme();
  initHeader();
  initProductsPage();
  initProductDetail();
  initFamily();
  initMembers();
  initGallery();

  /* --- Nhóm 2: hiệu ứng & tương tác --- */
  initReveal();
  initCounters();
  initBars();
  initBattery();
  initModal();
  initContactForm();
  initOrderForm();
  initNotifyForm();
  initBackToTop();
  initScrollSpyAnchors();
});
