/* ==========================================================================
   AURORA MOBILE — admin.js
   --------------------------------------------------------------------------
   Logic riêng cho trang quản trị (admin.html).
   Dùng lại các hàm dùng chung trong js/script.js: $, $$, store, showToast,
   formatVND, RULES, checks, bindForm, setFieldState, escapeHTML, normalize,
   createId, readList, saveList, PRODUCTS, MEMBERS.

   MỤC LỤC
     01. CẤU HÌNH   — tài khoản demo, danh sách ảnh, nhãn danh mục
     02. TIỆN ÍCH    — icon, định dạng ngày, xoá trạng thái form
     03. ĐĂNG NHẬP   — kiểm tra tài khoản, lưu phiên bằng localStorage
     04. TAB         — chuyển giữa các khu vực quản trị
     05. DASHBOARD   — thẻ thống kê + biểu đồ thanh
     06. SẢN PHẨM    — bảng, thêm / sửa / xoá
     07. THÀNH VIÊN  — bảng, thêm / sửa / xoá
     08. HỘP THƯ      — đơn hàng & liên hệ khách đã gửi
     09. MODAL       — mở / đóng / xác nhận
     10. INIT        — khởi động
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     01. CẤU HÌNH
     ======================================================================== */

  /* Tài khoản demo — chỉ mang tính minh hoạ cho bài tập, KHÔNG phải bảo mật thật */
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'aurora123';

  /* Ảnh sản phẩm có sẵn trong thư mục images/ */
  const PRODUCT_IMAGES = [
    'images/iphone-18-pro-max-xanh.png',
    'images/iphone-18-pro-max-do.png',
    'images/iphone-18-pro-max-den.png',
    'images/galaxy-s26-ultra-den.png',
    'images/galaxy-s26-ultra-tim.png',
    'images/xiaomi-17-ultra-den.png',
    'images/oppo-find-x9-pro-bac.png',
    'images/vivo-x300-pro-den.png',
    'images/xiaomi-17t-pro-tim.png',
    'images/xiaomi-17t-pro-den.png',
    'images/galaxy-a57-tim.png',
    'images/redmi-note-15-pro-trang.png',
    'images/redmi-note-15-pro-den.png',
    'images/hero-phone.png'
  ];

  const MEMBER_IMAGES = [
    'images/member-01.jpg',
    'images/member-02.jpg',
    'images/member-03.jpg',
    'images/member-04.jpg'
  ];

  const CATEGORY_IDS = ['flagship', 'performance', 'camera', 'budget'];

  const CATEGORY_LABELS = {
    flagship: 'Flagship',
    performance: 'Performance',
    camera: 'Camera',
    budget: 'Budget'
  };

  const TABS = {
    dashboard: { title: 'Dashboard', sub: 'Tổng quan hệ thống Aurora Mobile' },
    products: { title: 'Sản phẩm', sub: 'Thêm, sửa và xoá điện thoại trong cửa hàng' },
    members: { title: 'Thành viên', sub: 'Quản lý thông tin nhóm thực hiện dự án' },
    inbox: { title: 'Đơn hàng & liên hệ', sub: 'Dữ liệu khách gửi từ form công khai' }
  };

  /* Trạng thái tạm của trang */
  let editingProductId = null;
  let editingMemberIndex = -1;
  let productQuery = '';
  let confirmCallback = null;
  let lastFocused = null;

  /* ========================================================================
     02. TIỆN ÍCH
     ======================================================================== */

  const ICON = {
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/></svg>',
    users:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3.4 3.4 0 010 5.6M18 20c0-2.2-.8-4.2-2.2-5.6"/></svg>',
    bag:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16l-1.2 11a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8L4 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
    mail:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
    coin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.7-.8-1.6-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-.9 0-1.8-.4-2.5-1.2M12 7v10"/></svg>',
    chart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    edit:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10a2.8 2.8 0 10-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>',
    empty:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 11h18M8 3v4M16 3v4"/></svg>'
  };

  /** Định dạng ngày giờ cho hộp thư: 05/10/2026 19:24 */
  function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /** Xoá sạch trạng thái valid / error của một form */
  function clearFormState(form) {
    if (!form) return;
    $$('.field', form).forEach(function (f) { f.classList.remove('valid', 'error'); });
    $$('.opt-group', form).forEach(function (g) { g.classList.remove('has-error'); });
    $$('.input, .select, .textarea', form).forEach(function (i) {
      i.classList.remove('valid', 'error');
      i.removeAttribute('aria-invalid');
      delete i.dataset.touched;
    });
    $$('.msg, .group-error', form).forEach(function (m) { m.textContent = ''; });
  }

  /** Đọc textarea "Tên: Giá trị" thành object cho bảng thông số */
  function parseDetail(text) {
    const out = {};
    String(text || '').split('\n').forEach(function (line) {
      const idx = line.indexOf(':');
      if (idx <= 0) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) out[key] = val;
    });
    return out;
  }

  /** Ngược lại: object -> textarea */
  function stringifyDetail(obj) {
    return Object.keys(obj || {}).map(function (k) { return k + ': ' + obj[k]; }).join('\n');
  }

  /** Tìm index của sản phẩm theo id */
  function productIndex(id) {
    for (let i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return i;
    }
    return -1;
  }

  /* ========================================================================
     03. ĐĂNG NHẬP
     ======================================================================== */
  function isLoggedIn() {
    return store.get(STORAGE_KEYS.admin) === 'ok';
  }

  function showLogin() {
    $('#adminLogin').hidden = false;
    $('#adminShell').hidden = true;
    document.title = 'Admin — AURORA MOBILE';
  }

  function showApp() {
    $('#adminLogin').hidden = true;
    $('#adminShell').hidden = false;
    document.title = 'Dashboard — AURORA MOBILE Admin';
    renderAll();
  }

  function initLogin() {
    const form = $('#loginForm');
    if (!form) return;

    const fields = [
      {
        id: 'l-user',
        rules: [{ test: checks.notEmpty, msg: 'Vui lòng nhập tên đăng nhập.' }]
      },
      {
        id: 'l-pass',
        rules: [{ test: checks.notEmpty, msg: 'Vui lòng nhập mật khẩu.' }]
      }
    ];

    bindForm(form, fields, function () {
      const user = $('#l-user').value.trim();
      const pass = $('#l-pass').value;

      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        store.set(STORAGE_KEYS.admin, 'ok');
        form.reset();
        clearFormState(form);
        showToast('Chào mừng quản trị viên quay lại!', 'success', '✓ Đăng nhập thành công');
        showApp();
        return;
      }

      showToast('Tên đăng nhập hoặc mật khẩu không đúng.', 'error', '✕ Đăng nhập thất bại');
      setFieldState($('#l-pass'), 'Tên đăng nhập hoặc mật khẩu không đúng.');
      $('#l-pass').select();
    });

    const logout = $('#logoutBtn');
    if (logout) {
      logout.addEventListener('click', function () {
        store.remove(STORAGE_KEYS.admin);
        clearFormState(form);
        showToast('Bạn đã đăng xuất khỏi trang quản trị.', 'info', 'Đã đăng xuất');
        showLogin();
      });
    }
  }

  /* ========================================================================
     04. TAB
     ======================================================================== */
  function switchTab(name) {
    if (!TABS[name]) return;

    $$('#adminNav button').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === name);
    });

    $$('[data-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== name;
    });

    const title = $('#adminTitle');
    const sub = $('#adminSub');
    if (title) title.textContent = TABS[name].title;
    if (sub) sub.textContent = TABS[name].sub;

    document.title = TABS[name].title + ' — AURORA MOBILE Admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initTabs() {
    const nav = $('#adminNav');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-tab]');
      if (btn) switchTab(btn.getAttribute('data-tab'));
    });
  }

  /* ========================================================================
     05. DASHBOARD
     ======================================================================== */
  function statCard(icon, label, value) {
    return (
      '<article class="stat-card">' +
      '<span class="stat-card__icon">' + icon + '</span>' +
      '<b>' + value + '</b>' +
      '<span class="stat-card__label">' + label + '</span>' +
      '</article>'
    );
  }

  /** Vẽ biểu đồ thanh thuần CSS. format: hàm định dạng giá trị hiển thị */
  function renderChart(selector, rows, format, emptyText) {
    const el = $(selector);
    if (!el) return;

    if (!rows.length) {
      el.innerHTML = '<p class="field__hint">' + (emptyText || 'Chưa có dữ liệu') + '</p>';
      return;
    }

    const max = Math.max.apply(null, rows.map(function (r) { return r.value; })) || 1;

    el.innerHTML = rows.map(function (r) {
      const pct = Math.max(2, Math.round((r.value / max) * 100));
      return (
        '<div class="chart__row">' +
        '<span class="chart__label" title="' + escapeHTML(r.label) + '">' + escapeHTML(r.label) + '</span>' +
        '<span class="chart__track"><span class="chart__bar" data-w="' + pct + '%"></span></span>' +
        '<span class="chart__val">' + (format ? format(r.value) : r.value) + '</span>' +
        '</div>'
      );
    }).join('');

    /* Chạy animation lớn dần của thanh */
    requestAnimationFrame(function () {
      $$('.chart__bar', el).forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-w');
      });
    });
  }

  function renderDashboard() {
    const orders = readList(STORAGE_KEYS.orders, []);
    const contacts = readList(STORAGE_KEYS.contacts, []);

    const revenue = orders.reduce(function (s, o) { return s + (Number(o.total) || 0); }, 0);
    const avg = PRODUCTS.length
      ? Math.round(PRODUCTS.reduce(function (s, p) { return s + (Number(p.price) || 0); }, 0) / PRODUCTS.length)
      : 0;

    const grid = $('#statGrid');
    if (grid) {
      grid.innerHTML =
        statCard(ICON.phone, 'Sản phẩm', PRODUCTS.length) +
        statCard(ICON.users, 'Thành viên', MEMBERS.length) +
        statCard(ICON.bag, 'Đơn hàng đã nhận', orders.length) +
        statCard(ICON.mail, 'Liên hệ đã nhận', contacts.length) +
        statCard(ICON.coin, 'Giá trung bình', formatVND(avg)) +
        statCard(ICON.chart, 'Doanh thu dự kiến', formatVND(revenue));
    }

    /* Sản phẩm theo danh mục */
    renderChart('#chartCategory', CATEGORY_IDS.map(function (id) {
      return {
        label: CATEGORY_LABELS[id],
        value: PRODUCTS.filter(function (p) {
          return (p.categories || []).indexOf(id) > -1;
        }).length
      };
    }), null, 'Chưa có sản phẩm');

    /* Giá niêm yết theo sản phẩm */
    renderChart('#chartPrice', PRODUCTS.map(function (p) {
      return { label: p.name, value: Number(p.price) || 0 };
    }), formatVND, 'Chưa có sản phẩm');

    /* Đơn hàng theo sản phẩm */
    const byProduct = {};
    orders.forEach(function (o) {
      const key = o.productName || 'Khác';
      byProduct[key] = (byProduct[key] || 0) + (Number(o.qty) || 1);
    });
    renderChart('#chartOrders', Object.keys(byProduct).map(function (k) {
      return { label: k, value: byProduct[k] };
    }), function (v) { return v + ' máy'; }, 'Chưa có đơn hàng nào');

    /* Liên hệ theo chủ đề */
    const byTopic = {};
    contacts.forEach(function (c) {
      const key = c.topicLabel || c.topic || 'Khác';
      byTopic[key] = (byTopic[key] || 0) + 1;
    });
    renderChart('#chartTopics', Object.keys(byTopic).map(function (k) {
      return { label: k, value: byTopic[k] };
    }), function (v) { return v + ' liên hệ'; }, 'Chưa có liên hệ nào');
  }

  /* ========================================================================
     06. SẢN PHẨM
     ======================================================================== */
  function emptyRow(colspan, title, text) {
    return (
      '<tr><td colspan="' + colspan + '">' +
      '<div class="empty-state">' + ICON.empty +
      '<strong>' + escapeHTML(title) + '</strong>' +
      '<span>' + escapeHTML(text) + '</span>' +
      '</div></td></tr>'
    );
  }

  function renderProducts() {
    const tbody = $('#productRows');
    if (!tbody) return;

    const q = normalize(productQuery);
    const list = PRODUCTS.filter(function (p) {
      if (!q) return true;
      return normalize(p.name).indexOf(q) > -1 ||
        normalize((p.categories || []).join(' ')).indexOf(q) > -1 ||
        normalize(p.tagline || '').indexOf(q) > -1;
    });

    if (!list.length) {
      tbody.innerHTML = emptyRow(6, 'Không có sản phẩm nào', 'Thử từ khoá khác hoặc thêm sản phẩm mới.');
    } else {
      tbody.innerHTML = list.map(function (p) {
        const cats = (p.categories || []).map(function (c) {
          return '<span class="tag">' + escapeHTML(CATEGORY_LABELS[c] || c) + '</span>';
        }).join('');

        return (
          '<tr>' +
          '<td><img src="' + p.img + '" alt="' + escapeHTML(p.name) + '" loading="lazy"></td>' +
          '<td>' +
          '<span class="data-table__name">' + escapeHTML(p.name) + '</span>' +
          '<span class="data-table__meta">' + escapeHTML(p.tagline || '') + '</span>' +
          '</td>' +
          '<td>' + (cats || '—') + '</td>' +
          '<td>' + formatVND(p.price) + '</td>' +
          '<td>' + (p.badge ? '<span class="tag tag--accent">' + escapeHTML(p.badge) + '</span>' : '—') + '</td>' +
          '<td><div class="data-table__actions">' +
          '<button class="row-btn" type="button" data-edit="' + p.id + '" aria-label="Sửa ' + escapeHTML(p.name) + '">' + ICON.edit + '</button>' +
          '<button class="row-btn row-btn--danger" type="button" data-delete="' + p.id + '" aria-label="Xoá ' + escapeHTML(p.name) + '">' + ICON.trash + '</button>' +
          '</div></td>' +
          '</tr>'
        );
      }).join('');
    }

    const count = $('#productCount');
    if (count) count.textContent = 'Hiển thị ' + list.length + ' / ' + PRODUCTS.length + ' sản phẩm';

    const nav = $('#navCountProducts');
    if (nav) nav.textContent = PRODUCTS.length;
  }

  function openProductModal(id) {
    const form = $('#productForm');
    if (!form) return;

    clearFormState(form);
    form.reset();

    editingProductId = id || null;
    const p = id ? getProduct(id) : null;

    $('#productModalTitle').textContent = p ? 'Sửa sản phẩm: ' + p.name : 'Thêm sản phẩm';
    $('#productSubmitBtn').textContent = p ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm';

    /* Danh sách ảnh có sẵn (kèm ảnh riêng của sản phẩm nếu nằm ngoài danh sách) */
    const images = PRODUCT_IMAGES.slice();
    if (p && p.img && images.indexOf(p.img) === -1) images.push(p.img);
    $('#p-img').innerHTML = images.map(function (src) {
      return '<option value="' + src + '">' + src.replace('images/', '') + '</option>';
    }).join('');

    /* Nhóm danh mục dạng checkbox */
    $('#p-categories').innerHTML = CATEGORY_IDS.map(function (c) {
      return (
        '<label class="check-chip">' +
        '<input type="checkbox" name="p-cat" value="' + c + '">' +
        CATEGORY_LABELS[c] +
        '</label>'
      );
    }).join('');

    if (p) {
      $('#p-name').value = p.name || '';
      $('#p-tagline').value = p.tagline || '';
      $('#p-desc').value = p.desc || '';
      $('#p-price').value = p.price || '';
      $('#p-oldPrice').value = p.oldPrice || '';
      $('#p-badge').value = p.badge || '';
      $('#p-featured').value = p.featured || 0;
      $('#p-img').value = p.img || images[0];
      $('#p-display').value = (p.specs || {}).display || '';
      $('#p-camera').value = (p.specs || {}).camera || '';
      $('#p-battery').value = (p.specs || {}).battery || '';
      $('#p-detail').value = stringifyDetail(p.detail);

      $$('input[name="p-cat"]', $('#p-categories')).forEach(function (cb) {
        cb.checked = (p.categories || []).indexOf(cb.value) > -1;
      });
    }

    openModal('#productModal');
  }

  function initProductForm() {
    const form = $('#productForm');
    if (!form) return;

    const fields = [
      {
        id: 'p-name',
        rules: [
          { test: checks.notEmpty, msg: 'Vui lòng nhập tên sản phẩm.' },
          { test: function (v) { return String(v).trim().length >= 2; }, msg: 'Tên sản phẩm phải có ít nhất 2 ký tự.' }
        ]
      },
      { id: 'p-tagline', rules: [{ test: checks.notEmpty, msg: 'Vui lòng nhập nhãn danh mục.' }] },
      {
        id: 'p-desc',
        rules: [
          { test: checks.notEmpty, msg: 'Vui lòng nhập mô tả.' },
          { test: function (v) { return String(v).trim().length >= 10; }, msg: 'Mô tả phải có ít nhất 10 ký tự.' }
        ]
      },
      {
        id: 'p-price',
        rules: [
          { test: checks.notEmpty, msg: 'Vui lòng nhập giá.' },
          { test: checks.isDigits, msg: 'Giá chỉ được nhập số, không có dấu chấm hay chữ.' },
          { test: function (v) { return parseInt(v, 10) >= 1000000; }, msg: 'Giá tối thiểu 1.000.000đ.' }
        ]
      },
      {
        id: 'p-oldPrice',
        rules: [{ test: function (v) { return !String(v).trim() || checks.isDigits(v); }, msg: 'Giá gạch ngang chỉ được nhập số.' }]
      },
      {
        id: 'p-featured',
        rules: [{ test: function (v) { return !String(v).trim() || checks.isDigits(v); }, msg: 'Điểm ưu tiên chỉ được nhập số.' }]
      },
      { id: 'p-img', rules: [{ test: checks.notEmpty, msg: 'Vui lòng chọn ảnh sản phẩm.' }] },
      { id: 'p-display', rules: [{ test: checks.notEmpty, msg: 'Vui lòng nhập thông số màn hình.' }] },
      { id: 'p-camera', rules: [{ test: checks.notEmpty, msg: 'Vui lòng nhập thông số camera.' }] },
      { id: 'p-battery', rules: [{ test: checks.notEmpty, msg: 'Vui lòng nhập thông số pin.' }] }
    ];

    /* Danh mục là checkbox group nên kiểm tra riêng */
    const categoryGroup = {
      validate: function () {
        const group = $('#p-catGroup');
        const checked = $$('input[name="p-cat"]:checked');
        if (checked.length) {
          if (group) group.classList.remove('has-error');
          return true;
        }
        if (group) {
          group.classList.add('has-error');
          const err = $('.group-error', group);
          if (err) err.textContent = 'Vui lòng chọn ít nhất một danh mục.';
        }
        return false;
      }
    };

    /* Bỏ cảnh báo ngay khi người dùng tích một danh mục */
    const catWrap = $('#p-categories');
    if (catWrap) {
      catWrap.addEventListener('change', function () {
        if ($$('input[name="p-cat"]:checked').length) {
          const group = $('#p-catGroup');
          if (group) group.classList.remove('has-error');
        }
      });
    }

    bindForm(form, fields, function () {
      const data = {
        name: $('#p-name').value.trim(),
        tagline: $('#p-tagline').value.trim(),
        desc: $('#p-desc').value.trim(),
        price: parseInt($('#p-price').value, 10),
        oldPrice: $('#p-oldPrice').value.trim() ? parseInt($('#p-oldPrice').value, 10) : 0,
        badge: $('#p-badge').value.trim() || null,
        badgeHot: false,
        featured: $('#p-featured').value.trim() ? parseInt($('#p-featured').value, 10) : 0,
        img: $('#p-img').value,
        categories: $$('input[name="p-cat"]:checked').map(function (cb) { return cb.value; }),
        specs: {
          display: $('#p-display').value.trim(),
          camera: $('#p-camera').value.trim(),
          battery: $('#p-battery').value.trim()
        },
        detail: parseDetail($('#p-detail').value)
      };

      if (editingProductId) {
        const idx = productIndex(editingProductId);
        if (idx > -1) {
          const prev = PRODUCTS[idx];
          /* Ảnh đại diện đổi (hoặc máy chưa có bảng màu) thì đặt lại về 1 màu
             theo ảnh mới; nếu không thì giữ nguyên bảng màu nhiều phiên bản. */
          if (!prev.colors || !prev.colors.length || prev.colors[0].img !== data.img) {
            data.colors = [{ id: 'mac-dinh', label: 'Mặc định', dot: '#8d98ac', img: data.img }];
          }
          data.id = editingProductId;
          PRODUCTS[idx] = Object.assign({}, prev, data);
        }
        showToast('Đã cập nhật "' + data.name + '".', 'success', '✓ Lưu thành công');
      } else {
        data.id = createId('sp');
        data.colors = [{ id: 'mac-dinh', label: 'Mặc định', dot: '#8d98ac', img: data.img }];
        PRODUCTS.unshift(data);
        showToast('Đã thêm "' + data.name + '" vào danh sách.', 'success', '✓ Thêm thành công');
      }

      saveList(STORAGE_KEYS.products, PRODUCTS);
      editingProductId = null;
      closeModal('#productModal');
      clearFormState(form);
      renderAll();
    }, [categoryGroup]);
  }

  /* ========================================================================
     07. THÀNH VIÊN
     ======================================================================== */
  function renderMembers() {
    const tbody = $('#memberRows');
    if (!tbody) return;

    if (!MEMBERS.length) {
      tbody.innerHTML = emptyRow(6, 'Chưa có thành viên nào', 'Bấm "Thêm thành viên" để tạo hồ sơ đầu tiên.');
    } else {
      tbody.innerHTML = MEMBERS.map(function (m, i) {
        const hobbies = (m.hobbies || []).map(function (h) {
          return '<span class="tag">' + escapeHTML(h) + '</span>';
        }).join('');

        return (
          '<tr>' +
          '<td><img src="' + m.photo + '" alt="' + escapeHTML(m.name) + '" loading="lazy"></td>' +
          '<td><span class="data-table__name">' + escapeHTML(m.code) + '</span></td>' +
          '<td><span class="data-table__name">' + escapeHTML(m.name) + '</span></td>' +
          '<td>' + escapeHTML(m.role) + '</td>' +
          '<td>' + (hobbies || '—') + '</td>' +
          '<td><div class="data-table__actions">' +
          '<button class="row-btn" type="button" data-edit-member="' + i + '" aria-label="Sửa ' + escapeHTML(m.name) + '">' + ICON.edit + '</button>' +
          '<button class="row-btn row-btn--danger" type="button" data-delete-member="' + i + '" aria-label="Xoá ' + escapeHTML(m.name) + '">' + ICON.trash + '</button>' +
          '</div></td>' +
          '</tr>'
        );
      }).join('');
    }

    const nav = $('#navCountMembers');
    if (nav) nav.textContent = MEMBERS.length;
  }

  function openMemberModal(index) {
    const form = $('#memberForm');
    if (!form) return;

    clearFormState(form);
    form.reset();

    editingMemberIndex = typeof index === 'number' ? index : -1;
    const m = editingMemberIndex > -1 ? MEMBERS[editingMemberIndex] : null;

    $('#memberModalTitle').textContent = m ? 'Sửa thành viên: ' + m.name : 'Thêm thành viên';
    $('#memberSubmitBtn').textContent = m ? 'Cập nhật thành viên' : 'Thêm thành viên';

    const photos = MEMBER_IMAGES.slice();
    if (m && m.photo && photos.indexOf(m.photo) === -1) photos.push(m.photo);
    $('#m-photo').innerHTML = photos.map(function (src) {
      return '<option value="' + src + '">' + src.replace('images/', '') + '</option>';
    }).join('');

    if (m) {
      $('#m-code').value = m.code || '';
      $('#m-name').value = m.name || '';
      $('#m-role').value = m.role || '';
      $('#m-hobbies').value = (m.hobbies || []).join(', ');
      $('#m-photo').value = m.photo || photos[0];
      $('#m-bio').value = m.bio || '';
    }

    openModal('#memberModal');
  }

  function initMemberForm() {
    const form = $('#memberForm');
    if (!form) return;

    const fields = [
      {
        id: 'm-code',
        rules: [
          { test: checks.notEmpty, msg: 'Vui lòng nhập mã sinh viên.' },
          { test: checks.isDigits, msg: 'Mã sinh viên chỉ được nhập số.' },
          { test: function (v) { return String(v).trim().length >= 4; }, msg: 'Mã sinh viên phải có ít nhất 4 chữ số.' }
        ]
      },
      {
        id: 'm-name',
        rules: [
          { test: checks.notEmpty, msg: 'Vui lòng nhập họ và tên.' },
          { test: function (v) { return String(v).trim().length >= 2; }, msg: 'Họ tên phải có ít nhất 2 ký tự.' }
        ]
      },
      { id: 'm-role', rules: [{ test: checks.notEmpty, msg: 'Vui lòng nhập vai trò.' }] },
      {
        id: 'm-hobbies',
        rules: [
          { test: checks.notEmpty, msg: 'Vui lòng nhập sở thích.' },
          { test: function (v) { return String(v).indexOf(',') > -1; }, msg: 'Nhập ít nhất 2 sở thích, cách nhau bằng dấu phẩy.' }
        ]
      },
      { id: 'm-photo', rules: [{ test: checks.notEmpty, msg: 'Vui lòng chọn ảnh.' }] },
      {
        id: 'm-bio',
        rules: [
          { test: checks.notEmpty, msg: 'Vui lòng nhập giới thiệu ngắn.' },
          { test: function (v) { return String(v).trim().length >= 20; }, msg: 'Giới thiệu phải có ít nhất 20 ký tự.' }
        ]
      }
    ];

    bindForm(form, fields, function () {
      const data = {
        code: $('#m-code').value.trim(),
        name: $('#m-name').value.trim(),
        role: $('#m-role').value.trim(),
        hobbies: $('#m-hobbies').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        photo: $('#m-photo').value,
        bio: $('#m-bio').value.trim()
      };

      if (editingMemberIndex > -1) {
        MEMBERS[editingMemberIndex] = Object.assign({}, MEMBERS[editingMemberIndex], data);
        showToast('Đã cập nhật thông tin "' + data.name + '".', 'success', '✓ Lưu thành công');
      } else {
        MEMBERS.push(data);
        showToast('Đã thêm thành viên "' + data.name + '".', 'success', '✓ Thêm thành công');
      }

      saveList(STORAGE_KEYS.members, MEMBERS);
      editingMemberIndex = -1;
      closeModal('#memberModal');
      clearFormState(form);
      renderAll();
    });
  }

  /* ========================================================================
     08. HỘP THƯ — đơn hàng & liên hệ
     ======================================================================== */
  function orderItem(o) {
    return (
      '<article class="inbox-item">' +
      '<div class="inbox-item__head">' +
      '<span class="inbox-item__name">' + escapeHTML(o.productName || '—') + '</span>' +
      (o.code ? '<span class="tag tag--accent">' + escapeHTML(o.code) + '</span>' : '') +
      '<span class="inbox-item__time">' + formatDateTime(o.createdAt) + '</span>' +
      '</div>' +
      '<div class="inbox-item__meta">' +
      '<span>' + escapeHTML(o.name || '') + '</span>' +
      '<span>' + escapeHTML(o.phone || '') + '</span>' +
      '<span>' + escapeHTML(o.email || '') + '</span>' +
      '</div>' +
      '<div class="inbox-item__body">' +
      '<dl>' +
      '<dt>Phiên bản</dt><dd>' + escapeHTML(o.storage || '—') + ' · ' + escapeHTML(o.color || '—') + '</dd>' +
      '<dt>Số lượng</dt><dd>' + (Number(o.qty) || 1) + '</dd>' +
      '<dt>Đơn giá</dt><dd>' + formatVND(Number(o.unitPrice) || 0) + '</dd>' +
      '<dt>Địa chỉ</dt><dd>' + escapeHTML(o.address || '—') + '</dd>' +
      (o.note ? '<dt>Ghi chú</dt><dd>' + escapeHTML(o.note) + '</dd>' : '') +
      '</dl>' +
      '<p class="mt-xs">Tổng tiền: <span class="inbox-item__total">' +
      formatVND(Number(o.total) || 0) + '</span></p>' +
      '</div>' +
      '</article>'
    );
  }

  function contactItem(c) {
    return (
      '<article class="inbox-item">' +
      '<div class="inbox-item__head">' +
      '<span class="inbox-item__name">' + escapeHTML(c.name || '—') + '</span>' +
      (c.topicLabel ? '<span class="tag">' + escapeHTML(c.topicLabel) + '</span>' : '') +
      '<span class="inbox-item__time">' + formatDateTime(c.createdAt) + '</span>' +
      '</div>' +
      '<div class="inbox-item__meta">' +
      '<span>' + escapeHTML(c.email || '') + '</span>' +
      '<span>' + escapeHTML(c.phone || '') + '</span>' +
      '</div>' +
      '<div class="inbox-item__body">' + escapeHTML(c.message || '') + '</div>' +
      '</article>'
    );
  }

  function renderInbox() {
    const orders = readList(STORAGE_KEYS.orders, []);
    const contacts = readList(STORAGE_KEYS.contacts, []);

    const orderCount = $('#orderCount');
    if (orderCount) orderCount.textContent = orders.length + ' đơn';

    const contactCount = $('#contactCount');
    if (contactCount) contactCount.textContent = contacts.length + ' liên hệ';

    const nav = $('#navCountInbox');
    if (nav) nav.textContent = orders.length + contacts.length;

    const orderList = $('#orderList');
    if (orderList) {
      orderList.innerHTML = orders.length
        ? orders.map(orderItem).join('')
        : '<div class="empty-state">' + ICON.empty +
        '<strong>Chưa có đơn hàng</strong>' +
        '<span>Đơn sẽ xuất hiện ở đây sau khi khách gửi form ở trang Order.</span></div>';
    }

    const contactList = $('#contactList');
    if (contactList) {
      contactList.innerHTML = contacts.length
        ? contacts.map(contactItem).join('')
        : '<div class="empty-state">' + ICON.empty +
        '<strong>Chưa có liên hệ</strong>' +
        '<span>Liên hệ sẽ xuất hiện ở đây sau khi khách gửi form ở trang Contact.</span></div>';
    }
  }

  /* ========================================================================
     09. MODAL
     ======================================================================== */
  function openModal(selector) {
    const modal = $(selector);
    if (!modal) return;

    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');

    const first = modal.querySelector('.modal__dialog form input, .modal__dialog form select, .modal__dialog form textarea');
    if (first) setTimeout(function () { first.focus(); }, 260);
  }

  function closeModal(selector) {
    const modal = typeof selector === 'string' ? $(selector) : selector;
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    /* Chỉ mở khoá scroll khi không còn modal nào đang mở */
    if (!$('.modal.is-open')) document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function initModalDismiss() {
    /* Nút có data-close-modal */
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-close-modal]');
      if (!btn) return;
      const modal = btn.closest('.modal');
      if (modal) closeModal(modal);
    });

    /* Bấm ra vùng nền tối */
    $$('.modal').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(modal);
      });
    });

    /* Phím ESC */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      const open = $$('.modal.is-open');
      if (open.length) closeModal(open[open.length - 1]);
    });
  }

  function askConfirm(title, text, onYes) {
    $('#confirmTitle').textContent = title;
    $('#confirmText').textContent = text;
    confirmCallback = onYes;
    openModal('#confirmModal');
  }

  function initConfirm() {
    const yes = $('#confirmYes');
    if (!yes) return;
    yes.addEventListener('click', function () {
      const cb = confirmCallback;
      confirmCallback = null;
      closeModal('#confirmModal');
      if (typeof cb === 'function') cb();
    });
  }

  /* ========================================================================
     10. HÀNH ĐỘNG DỮ LIỆU + KHỞI ĐỘNG
     ======================================================================== */
  function initDataActions() {
    /* --- Tìm kiếm sản phẩm --- */
    const search = $('#adminProductSearch');
    if (search) {
      search.addEventListener('input', debounce(function () {
        productQuery = search.value;
        renderProducts();
      }, 180));
    }

    /* --- Nút thêm --- */
    const addProduct = $('#addProduct');
    if (addProduct) addProduct.addEventListener('click', function () { openProductModal(null); });

    const addMember = $('#addMember');
    if (addMember) addMember.addEventListener('click', function () { openMemberModal(null); });

    /* --- Sửa / xoá sản phẩm --- */
    const productRows = $('#productRows');
    if (productRows) {
      productRows.addEventListener('click', function (e) {
        const edit = e.target.closest('[data-edit]');
        if (edit) { openProductModal(edit.getAttribute('data-edit')); return; }

        const del = e.target.closest('[data-delete]');
        if (!del) return;
        const id = del.getAttribute('data-delete');
        const p = getProduct(id);
        if (!p) return;

        askConfirm(
          'Xoá sản phẩm?',
          'Sản phẩm "' + p.name + '" sẽ bị xoá khỏi danh sách hiển thị trên website.',
          function () {
            PRODUCTS = PRODUCTS.filter(function (x) { return x.id !== id; });
            saveList(STORAGE_KEYS.products, PRODUCTS);
            showToast('Đã xoá "' + p.name + '".', 'success', '✓ Đã xoá');
            renderAll();
          }
        );
      });
    }

    /* --- Sửa / xoá thành viên --- */
    const memberRows = $('#memberRows');
    if (memberRows) {
      memberRows.addEventListener('click', function (e) {
        const edit = e.target.closest('[data-edit-member]');
        if (edit) { openMemberModal(parseInt(edit.getAttribute('data-edit-member'), 10)); return; }

        const del = e.target.closest('[data-delete-member]');
        if (!del) return;
        const index = parseInt(del.getAttribute('data-delete-member'), 10);
        const m = MEMBERS[index];
        if (!m) return;

        askConfirm(
          'Xoá thành viên?',
          '"' + m.name + '" sẽ bị xoá khỏi trang giới thiệu thành viên.',
          function () {
            MEMBERS.splice(index, 1);
            saveList(STORAGE_KEYS.members, MEMBERS);
            showToast('Đã xoá "' + m.name + '".', 'success', '✓ Đã xoá');
            renderAll();
          }
        );
      });
    }

    /* --- Khôi phục dữ liệu gốc --- */
    const resetProducts = $('#resetProducts');
    if (resetProducts) {
      resetProducts.addEventListener('click', function () {
        askConfirm(
          'Khôi phục dữ liệu gốc?',
          'Mọi thay đổi về sản phẩm sẽ mất và quay về danh sách mặc định trong js/script.js.',
          function () {
            store.remove(STORAGE_KEYS.products);
            PRODUCTS = readList(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
            showToast('Danh sách sản phẩm đã về mặc định.', 'info', 'Đã khôi phục');
            renderAll();
          }
        );
      });
    }

    const resetMembers = $('#resetMembers');
    if (resetMembers) {
      resetMembers.addEventListener('click', function () {
        askConfirm(
          'Khôi phục dữ liệu gốc?',
          'Mọi thay đổi về thành viên sẽ mất và quay về danh sách mặc định trong js/script.js.',
          function () {
            store.remove(STORAGE_KEYS.members);
            MEMBERS = readList(STORAGE_KEYS.members, DEFAULT_MEMBERS);
            showToast('Danh sách thành viên đã về mặc định.', 'info', 'Đã khôi phục');
            renderAll();
          }
        );
      });
    }

    /* --- Xoá hộp thư --- */
    const clearOrders = $('#clearOrders');
    if (clearOrders) {
      clearOrders.addEventListener('click', function () {
        if (!readList(STORAGE_KEYS.orders, []).length) {
          showToast('Chưa có đơn hàng nào để xoá.', 'info', 'Không có dữ liệu');
          return;
        }
        askConfirm('Xoá tất cả đơn hàng?', 'Toàn bộ đơn hàng đã nhận sẽ bị xoá khỏi trình duyệt này.', function () {
          store.remove(STORAGE_KEYS.orders);
          showToast('Đã xoá toàn bộ đơn hàng.', 'success', '✓ Đã xoá');
          renderAll();
        });
      });
    }

    const clearContacts = $('#clearContacts');
    if (clearContacts) {
      clearContacts.addEventListener('click', function () {
        if (!readList(STORAGE_KEYS.contacts, []).length) {
          showToast('Chưa có liên hệ nào để xoá.', 'info', 'Không có dữ liệu');
          return;
        }
        askConfirm('Xoá tất cả liên hệ?', 'Toàn bộ liên hệ đã nhận sẽ bị xoá khỏi trình duyệt này.', function () {
          store.remove(STORAGE_KEYS.contacts);
          showToast('Đã xoá toàn bộ liên hệ.', 'success', '✓ Đã xoá');
          renderAll();
        });
      });
    }
  }

  /** Vẽ lại toàn bộ khu vực quản trị */
  function renderAll() {
    renderDashboard();
    renderProducts();
    renderMembers();
    renderInbox();
  }

  function init() {
    /* Chỉ chạy trên trang admin */
    if (!$('#adminLogin')) return;

    initLogin();
    initTabs();
    initProductForm();
    initMemberForm();
    initModalDismiss();
    initConfirm();
    initDataActions();

    if (isLoggedIn()) showApp();
    else showLogin();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
