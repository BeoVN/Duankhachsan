// ==========================================================
// CHỦ ĐỀ GIAO DIỆN: nạp sớm để màn loading & menu cũng đổi màu theo chủ đề
// ==========================================================
(function () {
  const P = (n, sw, o) => Object.assign({ n, sw }, o);
  const THEMES = {
    dark:  { n: '🌙 Tối', sw: '#20364c' },
    light: P('☀️ Sáng', '#eaf1f7', { bg: '#e9eff5', hud: '#ffffff', box: '#e3ebf3', bd: '#b7c8d8', tx: '#1e3a52', acc: '#b45309', nav: '#4f657a', act: '#2c6e9e', actb: '#1e5a85', actt: '#fff', sc: '#d9e4ee', win: '#f6f8fb', wbd: '#8fa8bf', cw: '#eef3f8', btn: '#2c6e9e', btnsh: '#1e4e73', sec: '#6b8299', secsh: '#475d72', tab: '#d3e0ea', tabtx: '#1e3a52', tabact: '#2c6e9e', room: '#ffffff' }),
    sage:  P('🌿 Xanh lá dịu', '#2f4a3f', { bg: '#1d2e27', hud: '#2a4237', box: '#223a30', bd: '#4a6b5c', tx: '#eef5ee', acc: '#f2d98a', nav: '#a9c2b4', act: '#4f8a6b', actb: '#bfe3cc', actt: '#fff', sc: '#17231e', win: '#e4eee4', wbd: '#5f8571', cw: '#dde9df', btn: '#4f8a6b', btnsh: '#33614a', sec: '#6f8f80', secsh: '#4a665a', tab: '#c8dccd', tabtx: '#25443a', tabact: '#3f7a5b', room: '#f4faf4' }),
    ocean: P('🌊 Xanh biển', '#1f4a5c', { bg: '#12303f', hud: '#1c4457', box: '#16394a', bd: '#3f7088', tx: '#eaf6fb', acc: '#ffe08a', nav: '#9cc3d3', act: '#2f86a6', actb: '#bfe6f3', actt: '#fff', sc: '#0d2430', win: '#dcebf2', wbd: '#4f87a0', cw: '#d3e6ef', btn: '#2f86a6', btnsh: '#1f607a', sec: '#5f8799', secsh: '#3f6273', tab: '#bcd8e5', tabtx: '#17415a', tabact: '#2a7a99', room: '#f1f8fb' }),
    warm:  P('☕ Cà phê ấm', '#4a3a31', { bg: '#2f2520', hud: '#4a3a31', box: '#3b2e27', bd: '#7a6254', tx: '#f7efe6', acc: '#ffcf8a', nav: '#cdb7a5', act: '#b9783f', actb: '#ffd9a8', actt: '#fff', sc: '#241c18', win: '#efe4d5', wbd: '#8a6a52', cw: '#eadfce', btn: '#b9783f', btnsh: '#82532a', sec: '#8d7260', secsh: '#5f4a3d', tab: '#dcc9b3', tabtx: '#4a3524', tabact: '#a8683a', room: '#fbf4ea' }),
    lav:   P('💜 Tím dịu', '#e9e4f5', { bg: '#ece8f6', hud: '#ffffff', box: '#e1dbf0', bd: '#bdb2dc', tx: '#3a3358', acc: '#7a4fb8', nav: '#6a5f94', act: '#7a68c4', actb: '#5a48a4', actt: '#fff', sc: '#ddd6ee', win: '#f1eef9', wbd: '#9e90cc', cw: '#ebe7f6', btn: '#7a68c4', btnsh: '#54458f', sec: '#8f84b8', secsh: '#665c8c', tab: '#d9d1ee', tabtx: '#3a3358', tabact: '#6d5bb8', room: '#fbf9ff' })
  };
  var TKEY = 'sunriseHotel_Theme', theme = localStorage.getItem(TKEY) || 'dark'; if (!THEMES[theme]) theme = 'dark';
  function applyTheme() {
    let st = document.getElementById('themeStyle'); if (!st) { st = document.createElement('style'); st.id = 'themeStyle'; document.head.appendChild(st); }
    const T = THEMES[theme];
    st.textContent = !T.bg ? '' : `#mainMenu,#loadingScreen{background:linear-gradient(135deg,${T.bg},${T.hud},${T.bg})!important}
.game-title{color:${T.acc}!important;text-shadow:0 4px 15px rgba(0,0,0,.18)!important}
.game-subtitle,#loadingText{color:${T.nav}!important}
.btn-main{background:${T.btn}!important;box-shadow:0 6px 0 ${T.btnsh}!important}
.btn-sub{background:${T.sec}!important;border-color:${T.bd}!important;color:#fff!important}
#loadingBottom>div:first-child{background:${T.box}!important}
#loadingBar{background:${T.act}!important}
#menuPlayerInfo{background:${T.box}!important;border-color:${T.bd}!important;color:${T.tx}!important}
#menuPlayerInfo b,#menuLoadSaveBtn{color:${T.acc}!important}
html,body,#game{background:${T.bg}!important}
.hud{background:${T.hud}!important;border-bottom-color:${T.bd}!important}
.brand,#hudName,.hud-bottom,.version,#hudExp{color:${T.tx}!important}
.money-box,.rating-box{background:${T.box}!important;border-color:${T.bd}!important;color:${T.tx}!important}
.money-box b,.rating-box b,#hudLv{color:${T.acc}!important}
.bottom{background:${T.hud}!important;border-top-color:${T.bd}!important}
.nav-btn{background:${T.box}!important;border-color:${T.bd}!important;color:${T.nav}!important}
.nav-btn.active{background:${T.act}!important;border-color:${T.actb}!important;color:${T.actt}!important}
#scene{background:${T.sc}!important}
.window{background:${T.win}!important;border-color:${T.wbd}!important}
.panel-actions{background:${T.win}!important}
#computerPanel .window{background:${T.cw}!important;border-color:${T.wbd}!important}
button.btn-base:not([style*="background"]),#fullscreen{background:${T.btn}!important;box-shadow:0 4px 0 ${T.btnsh}!important}
button.secondary:not([style*="background"]),.elev-btn{background:${T.sec}!important;box-shadow:0 4px 0 ${T.secsh}!important}
.tab{background:${T.tab}!important;color:${T.tabtx}!important}
.tab.active{background:${T.tabact}!important;color:#fff!important}
.msg .avatar{background:${T.tabact}!important}
.room{background:${T.room}!important;border-color:${T.wbd}!important}
.room.selected{background:${T.btn}!important;color:#fff!important}`;
  }
  window.HotelTheme = { THEMES: THEMES, get: function () { return theme; }, apply: applyTheme, set: function (k) { if (!THEMES[k]) return; theme = k; try { localStorage.setItem(TKEY, k); } catch (e) {} applyTheme(); } };
  applyTheme();
})();

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
    'js/core_loop.js', 'js/core_reviews.js', 'js/core_progression.js', 'js/core_money.js', 'js/core_messages.js', 'js/core_events.js',
    // Phòng & lễ tân tự động
    'js/rooms_chat.js', 'js/rooms_billing.js', 'js/rooms_auto_core.js', 'js/rooms_auto_steps.js',
    // Giao diện
    'js/ui_init.js', 'js/ui_records.js', 'js/ui_staff_info.js', 'js/ui_staff_manage.js',
    'js/ui_reviews.js', 'js/ui_review_replies.js',
    // Hệ thống
    'js/system_prices.js', 'js/system_save.js', 'js/system_expand.js', 'js/system_staffpanel.js',
    'js/system_manage.js', 'js/system_vouchers.js', 'js/system_social.js', 'js/system_incidents.js', 'js/system_profile.js', 'js/system_music.js', 'js/system_cloud.js', 'js/system_autosave.js', 'js/system_settings.js',
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
    'tryStartAutoReception', 'addGuestReview', 'renderReviewPanel', 'refreshHotelInfoPrices', 'showUiToast',
    'recalcHotelRating', 'guestFlowMultiplier', 'enforcePriceCaps', 'validatePriceCaps', 'checkStaffResignations', 'meetsStaffRequirement'];
  var REQUIRED_VARS = ['staffList', 'roomState', 'customPrices', 'gameTime', 'staffImages', 'imgNam8', 'GAME_MINUTES_PER_SECOND'];
  var REQUIRED_ELEMENTS = ['view', 'mainMenu', 'startBtn', 'chatBox', 'reviewPanel', 'hotelInfoPanel', 'staffPanel', 'settingsPanel'];

  var LOAD_TIMEOUT_MS = 60000;
  var BUILD = Date.now(); // chống dùng nhầm file cũ trong bộ nhớ đệm của trình duyệt

  function $(id) { return document.getElementById(id); }
  var bar = $('loadingBar'), text = $('loadingText'), screen = $('loadingScreen'), startBtn = $('startBtn');
  // Màn loading: hiện tiêu đề game ở giữa, thanh tải dời xuống dưới, không hiện tên file
  (function () {
    var h = screen && screen.querySelector('h2'); if (!h || !bar) return;
    h.className = 'game-title'; h.style.cssText = ''; h.innerHTML = 'KHÁCH SẠN<br>CỦA TÔI';
    var wrap = document.createElement('div'); wrap.id = 'loadingBottom';
    wrap.style.cssText = 'position:absolute; left:0; right:0; bottom:12vh; display:flex; flex-direction:column; align-items:center;';
    var barWrap = bar.parentNode; barWrap.style.width = '220px'; barWrap.parentNode.insertBefore(wrap, barWrap); wrap.appendChild(barWrap); wrap.appendChild(text);
  })();
  var total = SCRIPTS.length + IMAGES.length + 2; // +2: kiểm tra & khởi động
  var done = 0, finished = false;
  var runtimeErrors = [], failedScripts = [], failedImages = [];

  function setProgress(label) {
    var pct = Math.min(100, Math.round(done / total * 100));
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = pct + '%';
  }
  function step(label) { done++; setProgress(label); }
  function shortName(p) { return p.split('/').pop(); }

  // ----- HIỂN THỊ LỖI -----
  function fail(title, lines) {
    if (finished) return;
    finished = true;
    var box = $('loadingError');
    if (screen) { screen.style.opacity = '1'; screen.style.display = 'flex'; }
    var h = screen && screen.querySelector('h2'); if (h) { h.textContent = '⚠️ ' + title; h.style.fontSize = '24px'; }
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
