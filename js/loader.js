// ==========================================================
// BỘ NẠP GAME (LOADER)
// - Nạp TẤT CẢ file mã nguồn (đúng thứ tự) và hình ảnh trước khi cho phép chơi
// - Hiện thanh tiến trình thật, báo lỗi rõ ràng nếu thiếu file / file lỗi
// - Chỉ khởi động game và mở nút BẮT ĐẦU khi mọi thứ đã sẵn sàng
//
// Muốn thêm file mới: thêm đường dẫn vào SCRIPTS (đúng thứ tự cần chạy)
// hoặc IMAGES (hình cần tải sẵn) bên dưới.
// ==========================================================
(function () {
  'use strict';

  // ----- DANH SÁCH FILE MÃ NGUỒN (thứ tự nạp = thứ tự chạy) -----
  var SCRIPTS = [
    'js/changelog.js',
    // Hình khách & nhân viên
    'js/draw_guests.js',
    'js/draw_staff_images.js', 'js/draw_staff_draw.js', 'js/draw_staff_anim.js',
    // Lõi game
    'js/core_globals.js', 'js/core_staff.js', 'js/core_state.js', 'js/core_guests.js', 'js/core_draw.js',
    'js/core_loop.js', 'js/core_reviews.js', 'js/core_money.js', 'js/core_messages.js', 'js/core_events.js',
    // Phòng & lễ tân tự động
    'js/rooms_chat.js', 'js/rooms_billing.js', 'js/rooms_auto_core.js', 'js/rooms_auto_steps.js',
    // Giao diện
    'js/ui_init.js', 'js/ui_records.js', 'js/ui_staff_info.js', 'js/ui_staff_manage.js',
    'js/ui_reviews.js', 'js/ui_review_replies.js',
    // Hệ thống
    'js/system_prices.js', 'js/system_save.js', 'js/system_expand.js', 'js/system_staffpanel.js',
    'js/system_manage.js', 'js/system_vouchers.js', 'js/system_autosave.js', 'js/system_settings.js',
    // Khởi động
    'js/boot.js'
  ];

  // ----- DANH SÁCH HÌNH ẢNH CẦN TẢI SẴN -----
  var IMAGES = [
    'art/nam8bth1.png', 'art/nam18bth1.png', 'art/nam28bth.png', 'art/nam38bth.png',
    'art/nu8bth.png', 'art/nu18bth.png', 'art/nu28bth.png', 'art/nu38bth.png',
    'staff/namnvbaove.png', 'staff/namnvdankhach.png', 'staff/nunvdankhach.png',
    'staff/namnvdonphong.png', 'staff/nunvdonphong.png', 'staff/namnvvesinh.png', 'staff/nunvvesinh.png'
  ];

  // ----- KIỂM TRA SAU KHI NẠP: những thứ bắt buộc phải có -----
  var REQUIRED_FUNCTIONS = ['bootGame', 'initUI', 'updateMenuInfo', 'loadAutoSave', 'autoSaveGame', 'spawnGuest', 'draw',
    'resizeAll', 'updateClockUI', 'showChangelog', 'getGuestImage', 'updateStaffAnimations', 'renderStaffUI',
    'tryStartAutoReception', 'addGuestReview', 'renderReviewPanel', 'refreshHotelInfoPrices', 'showUiToast'];
  var REQUIRED_VARS = ['staffList', 'roomState', 'customPrices', 'gameTime', 'staffImages', 'imgNam8', 'GAME_MINUTES_PER_SECOND'];
  var REQUIRED_ELEMENTS = ['view', 'mainMenu', 'startBtn', 'chatBox', 'reviewPanel', 'hotelInfoPanel', 'staffPanel', 'settingsPanel'];

  var LOAD_TIMEOUT_MS = 60000;
  var BUILD = Date.now(); // chống dùng nhầm file cũ trong bộ nhớ đệm của trình duyệt

  function $(id) { return document.getElementById(id); }
  var bar = $('loadingBar'), text = $('loadingText'), screen = $('loadingScreen'), startBtn = $('startBtn');
  var total = SCRIPTS.length + IMAGES.length + 2; // +2: kiểm tra & khởi động
  var done = 0, finished = false;
  var runtimeErrors = [], failedScripts = [], failedImages = [];

  function setProgress(label) {
    var pct = Math.min(100, Math.round(done / total * 100));
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = pct + '% · ' + label;
  }
  function step(label) { done++; setProgress(label); }
  function shortName(p) { return p.split('/').pop(); }

  // ----- HIỂN THỊ LỖI -----
  function fail(title, lines) {
    if (finished) return;
    finished = true;
    var box = $('loadingError');
    if (screen) { screen.style.opacity = '1'; screen.style.display = 'flex'; }
    var h = screen && screen.querySelector('h2'); if (h) h.textContent = '⚠️ ' + title;
    var barWrap = bar && bar.parentNode; if (barWrap) barWrap.style.display = 'none';
    if (text) text.style.display = 'none';
    if (box) {
      box.style.display = 'block';
      var list = $('loadingErrorText');
      if (list) list.innerHTML = lines.map(function (l) { return '<div>• ' + String(l).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>'; }).join('');
      var btn = $('loadingRetryBtn'); if (btn) btn.onclick = function () { location.reload(); };
    }
    if (startBtn) startBtn.disabled = true;
    if (window.console) console.error('[Loader] ' + title, lines);
  }

  // Bắt lỗi chạy trong lúc nạp file (vd: lỗi cú pháp, thiếu biến)
  window.addEventListener('error', function (e) {
    if (finished) return;
    var where = e.filename ? shortName(e.filename.split('?')[0]) + ':' + e.lineno : '';
    runtimeErrors.push((e.message || 'Lỗi không rõ') + (where ? ' (' + where + ')' : ''));
  });

  // ----- NẠP FILE MÃ NGUỒN: tải song song, chạy đúng thứ tự -----
  function loadScripts() {
    return new Promise(function (resolve) {
      var remaining = SCRIPTS.length;
      SCRIPTS.forEach(function (src) {
        var s = document.createElement('script');
        s.async = false; // giữ đúng thứ tự thực thi
        s.onload = function () { step('Đã nạp ' + shortName(src)); if (--remaining === 0) resolve(); };
        s.onerror = function () { failedScripts.push(src); step('Lỗi ' + shortName(src)); if (--remaining === 0) resolve(); };
        s.src = src + '?v=' + BUILD;
        document.head.appendChild(s);
      });
    });
  }

  // ----- TẢI HÌNH ẢNH (thử lại tối đa 3 lần) -----
  var keepAlive = []; // giữ tham chiếu để trình duyệt không bỏ ảnh khỏi bộ nhớ
  function loadImage(src) {
    return new Promise(function (resolve) {
      var tries = 0;
      (function attempt() {
        var img = new Image();
        img.onload = function () {
          var ready = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
          ready.then(function () { keepAlive.push(img); step('Đã tải ' + shortName(src)); resolve(true); });
        };
        img.onerror = function () {
          if (++tries < 3) { setTimeout(attempt, 600); return; }
          failedImages.push(src); step('Thiếu ảnh ' + shortName(src)); resolve(false);
        };
        img.src = src;
      })();
    });
  }
  function loadImages() { return Promise.all(IMAGES.map(loadImage)); }

  // ----- KIỂM TRA SAU KHI NẠP -----
  function selfCheck() {
    var missing = [];
    REQUIRED_FUNCTIONS.forEach(function (n) { if (typeof window[n] !== 'function') missing.push('hàm ' + n + '()'); });
    REQUIRED_VARS.forEach(function (n) {
      try { if (new Function('return typeof ' + n)() === 'undefined') missing.push('biến ' + n); } catch (e) { missing.push('biến ' + n); }
    });
    REQUIRED_ELEMENTS.forEach(function (id) { if (!$(id)) missing.push('phần tử HTML #' + id); });
    return missing;
  }

  // ----- CHẠY -----
  var timeout = setTimeout(function () {
    fail('Tải quá lâu', ['Quá ' + (LOAD_TIMEOUT_MS / 1000) + ' giây vẫn chưa tải xong. Hãy kiểm tra mạng rồi bấm Tải lại.']);
  }, LOAD_TIMEOUT_MS);

  setProgress('Bắt đầu tải...');
  Promise.all([loadScripts(), loadImages()]).then(function () {
    if (finished) return;
    // 1. File mã nguồn phải nạp đủ và chạy không lỗi
    if (failedScripts.length) {
      return fail('Thiếu file mã nguồn', failedScripts.map(function (s) { return 'Không tải được: ' + s; }));
    }
    if (runtimeErrors.length) {
      return fail('Có file bị lỗi khi chạy', runtimeErrors);
    }
    // 2. Kiểm tra đủ thành phần cần thiết
    setProgress('Đang kiểm tra...');
    var missing = selfCheck();
    if (missing.length) return fail('Game chưa nạp đủ thành phần', missing.map(function (m) { return 'Thiếu ' + m; }));
    step('Đã kiểm tra xong');
    // 3. Khởi động game
    setProgress('Đang khởi động...');
    try { window.bootGame(); } catch (e) {
      return fail('Lỗi khi khởi động game', [e && e.message ? e.message : String(e)]);
    }
    if (runtimeErrors.length) return fail('Có lỗi khi khởi động game', runtimeErrors);
    step('Sẵn sàng!');
    finished = true;
    clearTimeout(timeout);
    if (failedImages.length && window.console) console.warn('[Loader] Thiếu hình ảnh (game vẫn chạy):', failedImages);
    // 4. Mở khóa nút BẮT ĐẦU rồi ẩn màn hình tải
    if (startBtn) startBtn.disabled = false;
    setTimeout(function () {
      if (screen) {
        screen.style.opacity = '0';
        setTimeout(function () { screen.style.display = 'none'; }, 500);
      }
    }, 300);
  });
})();
