// ==========================================
// HỆ THỐNG ÂM THANH: trình phát nhạc (playlist, chuyển bài, tua, lặp/ngẫu nhiên) + chuông khách đến + tiếng tách + chủ đề giao diện
// Nhạc nằm trong thư mục soundtrack/. Nhạc tải lên được lưu trong trình duyệt (IndexedDB).
// ==========================================
(function () {
  const KEY = 'sunriseHotel_Audio';
  let cfg = { on: true, bgm: 0.5, sfx: 0.5, cur: 'nhacnen', mode: 'all' };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };
  const BUILTIN = [{ id: 'nhacnen', name: 'Nhạc nền chính', src: 'soundtrack/nhacnen.mp3' }, { id: 'noel', name: 'Nhạc Giáng sinh', src: 'soundtrack/nhacnennoel.mp3' }];
  let uploads = [], urls = {}, ctx = null, sfxGain = null;
  const audio = new Audio(); audio.preload = 'auto';
  const list = () => BUILTIN.concat(uploads);
  const idx = () => Math.max(0, list().findIndex(t => t.id === cfg.cur));
  const srcOf = t => t.src || (urls[t.id] || (urls[t.id] = URL.createObjectURL(t.blob)));
  const $ = id => document.getElementById(id);
  const fmt = s => { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  // ---------- phát nhạc ----------
  let loadToken = 0, blobCache = {}, dragging = false, userGesture = false;
  // Tải trọn file thành blob để tua không bị đứng; lỗi thì phát trực tiếp từ đường dẫn
  function srcFor(t, cb) {
    if (t.blob) return cb(srcOf(t)); if (blobCache[t.id]) return cb(blobCache[t.id]);
    fetch(t.src).then(r => { if (!r.ok) throw 0; return r.blob(); }).then(b => { cb(blobCache[t.id] = URL.createObjectURL(b)); }).catch(() => cb(t.src));
  }
  function load(t, play) {
    cfg.cur = t.id; save(); const my = ++loadToken; render();
    srcFor(t, url => { if (my !== loadToken) return; audio.src = url; audio.loop = cfg.mode === 'one'; audio.volume = cfg.bgm; if (play || (userGesture && cfg.on)) audio.play().catch(() => {}); });
  }
  function go(d) {
    const L = list(); let i;
    if (cfg.mode === 'shuffle' && L.length > 1) { do { i = Math.floor(Math.random() * L.length); } while (i === idx()); } else i = (idx() + d + L.length) % L.length;
    cfg.on = true; save(); load(L[i], true);
  }
  function toggle() { if (audio.paused) { cfg.on = true; audio.play().catch(() => showUiToast('Không phát được nhạc, thử lại nhé!')); } else { cfg.on = false; audio.pause(); } save(); render(); }
  audio.onended = () => { if (cfg.mode !== 'one') go(1); };
  audio.onerror = () => showUiToast('⚠️ Không mở được file: ' + (list()[idx()] || {}).name + ' (kiểm tra thư mục soundtrack)');
  audio.onplay = audio.onpause = () => render();
  audio.ontimeupdate = () => { const s = $('mpSeek'); if (s && audio.duration && !dragging) { s.value = audio.currentTime / audio.duration * 1000; $('mpCur').textContent = fmt(audio.currentTime); $('mpDur').textContent = fmt(audio.duration); } };

  // ---------- nhạc tải lên (IndexedDB) ----------
  function db(cb) { const rq = indexedDB.open('sunriseHotelAudio', 1); rq.onupgradeneeded = () => rq.result.createObjectStore('f'); rq.onsuccess = () => cb(rq.result); rq.onerror = () => cb(null); }
  function loadUploads(done) {
    try { db(d => { if (!d) return done(); const out = [], c = d.transaction('f').objectStore('f').openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { const v = cur.value; out.push({ id: 'u' + cur.key, key: cur.key, name: (v && v.name) || 'Nhạc của tôi', blob: (v && v.blob) || v }); cur.continue(); } else { uploads = out; done(); } };
      c.onerror = () => done(); }); } catch (e) { done(); }
  }
  function addFiles(files) {
    const ok = [...files].filter(f => { if (f.size > 50 * 1024 * 1024) { showUiToast(f.name + ' quá nặng (tối đa 50MB)'); return false; } return true; }); if (!ok.length) return;
    db(d => { if (!d) { showUiToast('Trình duyệt không lưu được file!'); return; } const tx = d.transaction('f', 'readwrite'), st = tx.objectStore('f');
      ok.forEach((f, i) => st.put({ name: f.name, blob: f }, 'u' + Date.now() + i)); tx.oncomplete = () => loadUploads(() => { render(); showUiToast('➕ Đã thêm ' + ok.length + ' bài vào playlist'); }); });
  }
  function removeUpload(t) {
    db(d => { if (!d) return; const tx = d.transaction('f', 'readwrite'); tx.objectStore('f').delete(t.key); tx.oncomplete = () => { const wasCur = cfg.cur === t.id; loadUploads(() => { if (wasCur) load(BUILTIN[0], !audio.paused); else render(); }); }; });
  }

  // ---------- giao diện trình phát ----------
  const MODES = { all: ['🔁', 'Lặp playlist'], one: ['🔂', 'Lặp 1 bài'], shuffle: ['🔀', 'Ngẫu nhiên'] };
  function render() {
    if (!$('mpList')) return;
    const L = list(), cur = L[idx()];
    $('mpTitle').textContent = '🎵 ' + (cur ? cur.name : '—'); $('mpPlay').textContent = audio.paused ? '▶' : '⏸'; $('mpMode').textContent = MODES[cfg.mode][0];
    $('mpList').innerHTML = L.map((t, i) => `<div data-i="${i}" style="display:flex; align-items:center; gap:6px; padding:6px 8px; border-radius:8px; margin-top:3px; cursor:pointer; background:${t.id === cfg.cur ? '#fde9c9' : '#f1f5f9'}; font-size:12px; color:#1e3a52; font-weight:${t.id === cfg.cur ? 900 : 600};"><span style="width:16px;">${t.id === cfg.cur ? (audio.paused ? '⏸' : '▶') : (i + 1)}</span><span style="flex:1; word-break:break-word;">${t.name.replace(/</g, '&lt;')}</span>${t.blob ? `<span data-del="${i}" style="padding:0 6px; color:#dc2626; font-weight:900;">✕</span>` : ''}</div>`).join('');
    $('mpList').querySelectorAll('[data-i]').forEach(r => r.onclick = e => {
      const i = +r.dataset.i; if (e.target.dataset.del !== undefined) { removeUpload(list()[+e.target.dataset.del]); return; }
      if (list()[i].id === cfg.cur) { toggle(); return; } cfg.on = true; save(); load(list()[i], true);
    });
  }
  function buildUI() {
    const sfx = $('sfxVolume'); if (!sfx) return;
    const box = sfx.closest('div[style*="background:#fff"]') || sfx.parentElement.parentElement;
    const oldUp = $('bgmFile'); if (oldUp) { const w = oldUp.closest('div[style*="border-top"]'); if (w) w.remove(); } // bỏ giao diện tải nhạc cũ
    const rb = 'border:none; border-radius:50%; width:38px; height:38px; font-size:16px; background:#e2e8f0; color:#1e3a52; cursor:pointer;';
    box.insertAdjacentHTML('beforeend', `<div style="margin-top:10px; border-top:1px dashed #cbd5e1; padding-top:8px;">
      <div id="mpTitle" style="font-weight:900; font-size:13px; color:#1e3a52; text-align:center; word-break:break-word;">—</div>
      <div style="display:flex; align-items:center; gap:6px; margin:8px 0;"><span id="mpCur" style="font-size:11px; color:#64748b; width:34px;">0:00</span><input type="range" id="mpSeek" min="0" max="1000" value="0" style="flex:1;"><span id="mpDur" style="font-size:11px; color:#64748b; width:34px; text-align:right;">0:00</span></div>
      <div style="display:flex; justify-content:center; align-items:center; gap:10px;">
        <button id="mpMode" style="${rb}">🔁</button><button id="mpPrev" style="${rb}">⏮</button><button id="mpPlay" style="${rb} width:46px; height:46px; background:#d28a43; color:#fff;">▶</button><button id="mpNext" style="${rb}">⏭</button><button id="mpAdd" style="${rb}">➕</button></div>
      <div id="mpList" style="max-height:150px; overflow-y:auto; margin-top:8px;"></div>
      <input type="file" id="mpFile" accept="audio/*" multiple style="display:none;"></div>`);
    if (!$('themeBox')) box.insertAdjacentHTML('afterend', `<div id="themeBox" style="background:#fff; padding:10px; border-radius:8px; border:1px solid #cbd5e1;"><h3 style="font-size:14px; margin:0 0 10px 0; color:#2c6e9e;">Giao diện</h3><div id="themeList" style="display:flex; flex-wrap:wrap; gap:8px;"></div></div>`);
    $('mpPlay').onclick = toggle; $('mpNext').onclick = () => go(1); $('mpPrev').onclick = () => go(-1);
    $('mpMode').onclick = () => { cfg.mode = cfg.mode === 'all' ? 'one' : cfg.mode === 'one' ? 'shuffle' : 'all'; audio.loop = cfg.mode === 'one'; save(); render(); showUiToast(MODES[cfg.mode][0] + ' ' + MODES[cfg.mode][1]); };
    $('mpAdd').onclick = () => $('mpFile').click(); $('mpFile').onchange = e => { addFiles(e.target.files); e.target.value = ''; };
    $('mpSeek').oninput = e => { dragging = true; if (audio.duration) $('mpCur').textContent = fmt(e.target.value / 1000 * audio.duration); };
    $('mpSeek').onchange = e => { // tua khi thả tay, rồi tiếp tục phát nếu đang phát
      const was = !audio.paused; dragging = false;
      if (audio.duration) { audio.currentTime = e.target.value / 1000 * audio.duration; if (was || cfg.on) audio.play().catch(() => {}); }
    };
    const bv = $('bgmVolume'), sv = $('sfxVolume');
    if (bv) { bv.value = cfg.bgm * 100; bv.addEventListener('input', e => { cfg.bgm = e.target.value / 100; save(); audio.volume = cfg.bgm; }); }
    if (sv) { sv.value = cfg.sfx * 100; sv.addEventListener('input', e => { cfg.sfx = e.target.value / 100; save(); applySfx(); window.sfxChime(); }); }
    render(); renderThemes();
  }

  // ---------- hiệu ứng: tiếng tách + chuông khách đến ----------
  function applySfx() { if (sfxGain) sfxGain.gain.value = cfg.sfx * 1.2; }
  function initCtx() { if (ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); sfxGain = ctx.createGain(); sfxGain.connect(ctx.destination); applySfx(); }
  window.sfxClick = function () {
    if (!ctx || cfg.sfx <= 0) return; const t = ctx.currentTime;
    const len = 0.02, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 3200; g.gain.value = 0.6; s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t);
    const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.setValueAtTime(1900, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
    og.gain.setValueAtTime(0.25, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.035); o.connect(og); og.connect(sfxGain); o.start(t); o.stop(t + 0.05);
  };
  window.sfxChime = function () { if (cfg.sfx <= 0) return; const a = new Audio('soundtrack/chuongbam.mp3'); a.volume = Math.min(1, cfg.sfx); a.play().catch(() => {}); };
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('button, .nav-btn, .tab, .btn-base')) window.sfxClick(); }, true);
  if (typeof spawnGuest === 'function') {
    const _sp = spawnGuest;
    spawnGuest = function () { const had = currentGuest || pendingGuestForGuide; const r = _sp.apply(this, arguments); if (!had && (currentGuest || pendingGuestForGuide)) window.sfxChime(); return r; };
  }

  const THEMES = HotelTheme.THEMES, applyTheme = () => HotelTheme.apply();
  function renderThemes() {
    const l = document.getElementById('themeList'); if (!l) return; const cur = HotelTheme.get();
    l.innerHTML = Object.keys(THEMES).map(k => `<button data-th="${k}" style="display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:20px; background:#f8fafc; font-size:12px; font-weight:bold; color:#1e3a52; cursor:pointer; border:${k === cur ? '2px solid #d28a43' : '1px solid #cbd5e1'};"><span style="width:16px; height:16px; border-radius:50%; background:${THEMES[k].sw}; border:1px solid #94a3b8;"></span>${THEMES[k].n}</button>`).join('');
    l.querySelectorAll('button').forEach(b => b.onclick = () => { HotelTheme.set(b.dataset.th); renderThemes(); });
  }
  applyTheme();

  // ---------- khởi động ----------
  applyTheme();
  loadUploads(() => { const t = list()[idx()]; load(t, cfg.on); buildUI(); });
  // Trình duyệt chỉ cho phát âm thanh sau lần chạm đầu tiên
  // Chrome chỉ tính là "đã tương tác" ở click/touchend/keydown (pointerdown/touchstart KHÔNG đủ) -> dùng đúng các sự kiện này, phát được mới gỡ
  const EVS = ['click', 'touchend', 'pointerup', 'keydown'];
  const first = () => {
    userGesture = true; initCtx(); if (ctx && ctx.state === 'suspended') ctx.resume();
    if (!cfg.on) { EVS.forEach(ev => document.removeEventListener(ev, first, true)); return; }
    if (!audio.src) return; // nhạc chưa tải xong: lần chạm sau (hoặc lúc tải xong) sẽ phát
    audio.play().then(() => EVS.forEach(ev => document.removeEventListener(ev, first, true))).catch(() => {});
  };
  EVS.forEach(ev => document.addEventListener(ev, first, true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); else if (cfg.on) audio.play().catch(() => {}); });
})();
