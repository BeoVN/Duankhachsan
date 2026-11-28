// ==========================================
// HỆ THỐNG TÀI KHOẢN ĐÁM MÂY (Firebase Firestore, gọi qua REST)
// - Tự đẩy dữ liệu game lên theo ID người chơi
// - Khôi phục bằng ID ở thiết bị mới
// - Khóa thiết bị: mỗi ID chỉ chơi 1 thiết bị, thiết bị cũ bị thông báo khi có máy khác lấy ID
// ==========================================
(function () {
  const PROJECT = 'databaseplayer-7de75', API_KEY = 'AIzaSyDgxqbl8z4S5ld5Wo5xREGxlJb-1AqIf30';
  const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/players/`;
  const SYNC_MS = 90000;
  const dev = (() => { let d = localStorage.getItem('sunriseHotel_Device'); if (!d) { d = Math.random().toString(36).slice(2) + Date.now().toString(36); try { localStorage.setItem('sunriseHotel_Device', d); } catch (e) {} } return d; })();
  let locked = false, busy = false, lastOk = 0, status = 'Chưa đồng bộ', started = false;
  const $ = id => document.getElementById(id);
  const url = (id, q) => BASE + id + '?key=' + API_KEY + (q || '');

  async function getDoc(id) {
    const r = await fetch(url(id)); if (r.status === 404) return null; if (!r.ok) throw new Error('HTTP ' + r.status);
    const f = (await r.json()).fields || {};
    const num = v => v ? (v.integerValue !== undefined ? +v.integerValue : v.doubleValue !== undefined ? +v.doubleValue : null) : null;
    return { money: num(f.money), level: num(f.level), data: (f.data || {}).stringValue || '', extra: (f.extra || {}).stringValue || '', device: (f.device || {}).stringValue || '', updated: +((f.updated || {}).integerValue || 0) };
  }
  async function putDoc(id, o) {
    const mask = ['data', 'extra', 'device', 'updated'].map(x => '&updateMask.fieldPaths=' + x).join('');
    const body = { fields: { data: { stringValue: o.data }, extra: { stringValue: o.extra }, device: { stringValue: o.device }, updated: { integerValue: String(o.updated) } } };
    const r = await fetch(url(id, mask), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  }
  function localData() { try { autoSaveGame(); } catch (e) {} return { data: localStorage.getItem('sunriseHotel_AutoSave') || '', extra: localStorage.getItem('sunriseHotel_Profile') || '' }; }
  function paint() {
    const el = $('cloudStatus'); if (!el) return;
    el.textContent = '☁️ ' + (lastOk ? 'Đã đồng bộ lúc ' + new Date(lastOk).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : status);
    el.style.color = status === 'ok' || lastOk ? '#16a34a' : '#b45309';
  }
  async function sync() {
    if (locked || busy || !isGameStarted) return; busy = true;
    try {
      const id = profData.id, cur = await getDoc(id);
      if (cur && cur.device && cur.device !== dev) { showLock(id, cur); return; }
      if (cur && (cur.money !== null || cur.level !== null)) await applyAdmin(id, cur); // admin sửa trực tiếp trên database
      const d = localData(); if (!d.data) return;
      if (d.data.length > 900000) { status = 'Dữ liệu quá lớn để đồng bộ'; return; }
      await putDoc(id, { data: d.data, extra: d.extra, device: dev, updated: Date.now() }); lastOk = Date.now(); status = 'ok';
    } catch (e) { status = 'Không kết nối được máy chủ'; } finally { busy = false; paint(); }
  }
  // Admin sửa trên Firestore: thêm trường  money (số)  và/hoặc  level (số)  vào tài liệu players/<ID>. Game áp dụng 1 lần rồi tự xóa 2 trường này.
  async function applyAdmin(id, cur) {
    if (cur.money !== null && cur.money >= 0) playerMoney = Math.floor(cur.money);
    if (cur.level !== null && cur.level >= 1) { playerLevel = Math.floor(cur.level); playerExp = 0; maxExp = 100; for (let i = 1; i < playerLevel; i++) maxExp = Math.floor(maxExp * 1.5); }
    try { profSyncMoney(); } catch (e) {} updateMoneyUI(); addExp(0);
    await fetch(url(id, '&updateMask.fieldPaths=money&updateMask.fieldPaths=level'), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: {} }) }); // xóa 2 trường
    showUiToast('🛠️ Dữ liệu vừa được cập nhật từ máy chủ');
  }
  async function applyCloud(id, cur) { // lấy dữ liệu đám mây về máy này và nhận quyền dùng ID
    await putDoc(id, { data: cur.data, extra: cur.extra, device: dev, updated: Date.now() });
    localStorage.setItem('sunriseHotel_AutoSave', cur.data); if (cur.extra) localStorage.setItem('sunriseHotel_Profile', cur.extra);
    localStorage.setItem('sunriseHotel_Identity', JSON.stringify({ id })); try { const nm = (JSON.parse(cur.data) || {}).playerName; if (nm) localStorage.setItem('sunriseHotel_NameClaim', JSON.stringify({ key: nameKey(nm), name: nm })); } catch (e) {}
    isGameStarted = false; location.reload();
  }
  function showLock(id, cur) {
    locked = true; if ($('cloudLock')) return;
    const o = document.createElement('div'); o.id = 'cloudLock';
    o.style.cssText = 'position:fixed; inset:0; z-index:99999; background:rgba(8,15,26,.94); display:flex; align-items:center; justify-content:center; padding:20px;';
    o.innerHTML = `<div style="background:#e8dfce; color:#253548; border:5px solid #71523d; border-radius:14px; padding:18px; max-width:340px; text-align:center;">
      <div style="font-size:34px;">🔒</div><h3 style="margin:6px 0;">Tài khoản đang dùng ở thiết bị khác</h3>
      <div style="font-size:13px; line-height:1.5; margin-bottom:14px;">ID này vừa được một thiết bị khác đăng nhập (${new Date(cur.updated).toLocaleString('vi-VN')}). Mỗi ID chỉ chơi được trên 1 thiết bị.</div>
      <button id="lockPull" class="btn-base" style="width:100%; margin-bottom:8px;">📥 Tải dữ liệu mới nhất về máy này</button>
      <button id="lockKeep" class="btn-base secondary" style="width:100%;">📤 Giữ dữ liệu máy này (đẩy máy kia ra)</button></div>`;
    document.body.appendChild(o);
    $('lockPull').onclick = () => applyCloud(id, cur).catch(() => showUiToast('Lỗi mạng, thử lại!'));
    $('lockKeep').onclick = async () => { try { const d = localData(); await putDoc(id, { data: d.data, extra: d.extra, device: dev, updated: Date.now() }); locked = false; o.remove(); lastOk = Date.now(); paint(); showUiToast('Đã nhận lại tài khoản trên máy này.'); } catch (e) { showUiToast('Lỗi mạng, thử lại!'); } };
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function confirmCard(title, rows, ok) { // bảng xem trước với 2 nút Xác nhận / Hủy
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed; inset:0; z-index:99998; background:rgba(8,15,26,.8); display:flex; align-items:center; justify-content:center; padding:20px;';
    o.innerHTML = `<div style="background:#e8dfce; color:#253548; border:5px solid #71523d; border-radius:14px; padding:16px; width:min(340px,100%);">
      <h3 style="margin:0 0 10px; text-align:center;">${title}</h3>
      ${rows.map(r => `<div style="display:flex; justify-content:space-between; gap:10px; padding:6px 0; border-bottom:1px dashed #b9a98f; font-size:13px;"><b>${r[0]}</b><span style="text-align:right; word-break:break-word;">${esc(r[1])}</span></div>`).join('')}
      <div style="display:flex; gap:8px; margin-top:14px;"><button class="btn-base secondary" id="ccNo" style="flex:1;">❌ Hủy</button><button class="btn-base" id="ccYes" style="flex:1;">✅ Xác nhận</button></div></div>`;
    document.body.appendChild(o);
    o.querySelector('#ccNo').onclick = () => o.remove(); o.querySelector('#ccYes').onclick = () => { o.remove(); ok(); };
  }
  async function restore(raw) {
    const id = String(raw || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (id.length !== 12) { showUiToast('ID gồm 12 ký tự!'); return; }
    try {
      const cur = await getDoc(id); if (!cur || !cur.data) { showUiToast('Không tìm thấy ID này!'); return; }
      let d = {}; try { d = JSON.parse(cur.data) || {}; } catch (e) {}
      confirmCard('Khôi phục dữ liệu', [['🆔 ID', id.replace(/(.{4})(?=.)/g, '$1-')], ['👤 Tên', d.playerName || '—'], ['💰 Tiền', fmtVND(d.playerMoney || 0)], ['⭐ Level', 'Lv.' + (d.playerLevel || 1)]], () => applyCloud(id, cur).catch(() => showUiToast('Lỗi mạng, thử lại!')));
    } catch (e) { showUiToast('Không kết nối được máy chủ!'); }
  }
  // ---------- KHÔI PHỤC 3 NGÀY GẦN NHẤT (game lưu 1 lần mỗi khi sang 0h) ----------
  function restoreBackup(b) {
    const d = b.data; hotelMoney = d.hotelMoney; playerMoney = d.playerMoney; totalRevenue = d.totalRevenue; playerLevel = d.playerLevel; playerExp = d.playerExp; maxExp = d.maxExp;
    recalcHotelRating(); roomState = JSON.parse(JSON.stringify(d.roomState)); try { profSyncMoney(); } catch (e) {}
    updateMoneyUI(); $('hudLv').innerText = 'Lv.' + playerLevel; $('hudExp').innerText = playerExp + '/' + maxExp; $('expFill').style.width = (playerExp / maxExp * 100) + '%'; $('rating').innerText = hotelRating.toFixed(1);
    draw(); $('settingsPanel').classList.remove('show'); showToast('Đã khôi phục dữ liệu ngày ' + b.date + '!'); sync();
  }
  let bkSig = '';
  function renderBackups() {
    const l = $('bkList'); if (!l) return; const sig = JSON.stringify(dailyBackups.map(b => b.date)); if (sig === bkSig) return; bkSig = sig;
    const arr = dailyBackups.slice(-3).reverse(); // mới nhất trước
    l.innerHTML = [0, 1, 2].map(i => { const b = arr[i]; return b ? `<div data-i="${i}" style="flex:1; min-width:0; padding:8px 4px; border-radius:8px; background:#f1f5f9; border:1px solid #cbd5e1; text-align:center; cursor:pointer; font-size:11px; color:#1e3a52;"><div style="font-weight:900;">📅 ${b.date}</div><div style="margin-top:3px;">💰 ${fmtVND(b.data.playerMoney)}</div><div>⭐ Lv.${b.data.playerLevel}</div></div>` : `<div style="flex:1; padding:8px 4px; border-radius:8px; background:#f8fafc; border:1px dashed #cbd5e1; text-align:center; font-size:11px; color:#94a3b8;">Chưa có</div>`; }).join('');
    l.querySelectorAll('[data-i]').forEach(el => el.onclick = () => { const b = arr[+el.dataset.i]; confirmCard('Khôi phục ngày ' + b.date, [['📅 Ngày trong game', b.date], ['💰 Tiền', fmtVND(b.data.playerMoney)], ['⭐ Level', 'Lv.' + b.data.playerLevel]], () => restoreBackup(b)); });
  }
  // ---------- TÊN KHÔNG TRÙNG (bộ sưu tập names trên Firestore) ----------
  const NAMES = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/names/`;
  const nameKey = n => { let k = String(n).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/\s+/g, ' ').trim().replace(/[\/]/g, '_'); if (k.startsWith('__') || k === '.' || k === '..') k = 'n' + k; return k; };
  const nameUrl = k => NAMES + encodeURIComponent(k) + '?key=' + API_KEY;
  const getClaimObj = () => { try { return JSON.parse(localStorage.getItem('sunriseHotel_NameClaim') || '{}') || {}; } catch (e) { return {}; } };
  const getClaim = () => getClaimObj().key || '', getClaimName = () => getClaimObj().name || '';
  const setClaim = (k, n) => { try { localStorage.setItem('sunriseHotel_NameClaim', JSON.stringify({ key: k, name: n })); } catch (e) {} };
  async function claimName(n) { // 'ok' | 'taken' | 'error'
    const k = nameKey(n), id = profData.id;
    try {
      const r = await fetch(nameUrl(k));
      if (r.ok) { const f = ((await r.json()).fields || {}); return (f.owner || {}).stringValue === id ? 'ok' : 'taken'; }
      if (r.status !== 404) return 'error';
      const w = await fetch(nameUrl(k) + '&updateMask.fieldPaths=owner', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { owner: { stringValue: id } } }) });
      return w.ok ? 'ok' : (w.status === 403 ? 'taken' : 'error');
    } catch (e) { return 'error'; }
  }
  const releaseName = k => { if (k) fetch(nameUrl(k), { method: 'DELETE' }).catch(() => {}); };
  function showName(n) {
    const a = $('inputName'), h = $('hudName'), m = $('menuPlayerName'); if (a) a.value = n; if (h) h.innerHTML = '👤 ' + n; if (m) m.innerText = n;
    document.querySelectorAll('[id="staffReceptionistName"]').forEach(x => x.innerText = n);
  }
  async function ensureName() { // lần đầu: tên mặc định player#0000 không trùng; người chơi cũ giữ tên nếu chưa ai dùng
    if (nameBusy) return; nameBusy = true;
    try {
      let cur = ''; try { cur = (JSON.parse(localStorage.getItem('sunriseHotel_AutoSave') || '{}') || {}).playerName || ''; } catch (e) {}
      const claimed = getClaim(), cn = getClaimName(), shown = ($('inputName') || {}).value || '';
      if (claimed && cn) { if (!shown || shown === 'Minh') showName(cn); return; }
      if (claimed && !cn) { if (cur && cur !== 'Minh') { setClaim(claimed, cur); return; } releaseName(claimed); localStorage.removeItem('sunriseHotel_NameClaim'); }
      if (cur && cur !== 'Minh' && (await claimName(cur)) === 'ok') { setClaim(nameKey(cur), cur); return; }
      for (let i = 0; i < 12; i++) {
        const n = 'player#' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'); showName(n);
        const r = await claimName(n);
        if (r === 'ok') { setClaim(nameKey(n), n); return; } if (r === 'error') return;
      }
    } finally { nameBusy = false; }
  }
  let nameBusy = false, pass = false;
  document.addEventListener('click', async e => { // đổi tên ở Cá nhân: kiểm tra trùng trên máy chủ
    if (e.target.id !== 'saveProfile') return; if (pass) { pass = false; return; }
    e.stopPropagation(); const btn = e.target, n = ($('inputName').value || '').replace(/\s+/g, ' ').trim();
    if (!n) { showUiToast('Tên không được để trống!'); return; } if (n.length > 40) { showUiToast('Tên tối đa 40 ký tự!'); return; }
    const r = await claimName(n);
    if (r === 'taken') { showUiToast('Tên này đã có người dùng, hãy chọn tên khác!'); return; }
    if (r === 'error') { showUiToast('Không kết nối được máy chủ, chưa đổi được tên!'); return; }
    const old = getClaim(), nk = nameKey(n); if (old && old !== nk) releaseName(old); setClaim(nk, n);
    $('inputName').value = n; pass = true; btn.click();
  }, true);

  // ---------- XÓA TÀI KHOẢN ----------
  function deleteAccount() {
    const o = document.createElement('div');
    o.style.cssText = 'position:fixed; inset:0; z-index:99998; background:rgba(8,15,26,.88); display:flex; align-items:center; justify-content:center; padding:20px;';
    o.innerHTML = `<div style="background:#e8dfce; color:#253548; border:5px solid #b91c1c; border-radius:16px; padding:18px; width:min(340px,100%); text-align:center;">
      <div style="font-size:46px; line-height:1;">⚠️</div><h3 style="margin:6px 0 10px; color:#b91c1c;">Xóa tài khoản</h3>
      <div style="font-size:13px; line-height:1.6; text-align:left; background:#fff; border-radius:10px; padding:10px 12px;">Việc này sẽ <b>xóa vĩnh viễn</b>:<br>• Toàn bộ dữ liệu game trên máy và trên máy chủ<br>• Tên người chơi và ID hiện tại<br>Sau đó bạn chơi lại từ đầu với <b>ID mới</b>.<br><b style="color:#b91c1c;">Không thể hoàn tác.</b></div>
      <div style="font-size:12px; margin:12px 0 6px;">Gõ <b style="color:#b91c1c;">XOA</b> để xác nhận:</div>
      <input id="delInput" class="input-field" maxlength="3" autocomplete="off" style="text-align:center; font-weight:900; letter-spacing:4px; font-size:18px; text-transform:uppercase;">
      <div id="delMsg" style="font-size:12px; min-height:16px; margin-top:6px; color:#b91c1c; font-weight:bold;"></div>
      <div style="display:flex; gap:8px; margin-top:8px;"><button class="btn-base secondary" id="delNo" style="flex:1;">Hủy</button><button class="btn-base" id="delYes" disabled style="flex:1; background:#ef4444; box-shadow:0 4px 0 #991b1b; opacity:.45;">🗑️ Xóa</button></div></div>`;
    document.body.appendChild(o);
    const inp = o.querySelector('#delInput'), yes = o.querySelector('#delYes'), msg = o.querySelector('#delMsg');
    inp.oninput = () => { const ok = inp.value.trim().toUpperCase() === 'XOA'; yes.disabled = !ok; yes.style.opacity = ok ? 1 : .45; };
    o.querySelector('#delNo').onclick = () => o.remove();
    yes.onclick = async () => {
      yes.disabled = true; inp.disabled = true; msg.style.color = '#475569'; msg.textContent = '⏳ Đang xóa dữ liệu...';
      try {
        const r = await fetch(url(profData.id), { method: 'DELETE' }); if (!r.ok) throw new Error('HTTP ' + r.status);
        const k = getClaim(); if (k) await fetch(nameUrl(k), { method: 'DELETE' });
      } catch (e) { msg.style.color = '#b91c1c'; msg.textContent = '⚠️ Không kết nối được máy chủ, chưa xóa được. Thử lại nhé!'; yes.disabled = false; inp.disabled = false; return; }
      ['sunriseHotel_AutoSave', 'sunriseHotel_DailyBackups', 'sunriseHotel_Profile', 'sunriseHotel_Identity', 'sunriseHotel_Incidents', 'sunriseHotel_Recruit', 'sunriseHotel_NameClaim'].forEach(k => localStorage.removeItem(k));
      isGameStarted = false; locked = true; msg.style.color = '#16a34a'; msg.textContent = '✅ Đã xóa tài khoản. Đang bắt đầu lại...'; setTimeout(() => location.reload(), 900);
    };
  }

  // ---------- GIAO DIỆN Cài đặt > Dữ liệu game ----------
  (function ui() {
    const sb = $('saveGameBtn'); if (!sb || $('acctBox')) return;
    ['saveGameBtn', 'resetGameBtn', 'restore3DaysBtn'].forEach(i => { const el = $(i); if (el) el.style.display = 'none'; }); // bỏ sao lưu Code, chơi lại, nút 3 ngày cũ
    const lc = $('loadCodeInput'); if (lc && lc.parentElement) lc.parentElement.style.display = 'none';
    sb.insertAdjacentHTML('beforebegin', `<div id="acctBox" style="display:flex; flex-direction:column; gap:8px;">
      <div style="font-size:13px; font-weight:bold; color:#475569;">🆔 ID của bạn</div>
      <input id="myIdBox" class="input-field" readonly style="text-align:center; font-weight:900; letter-spacing:2px; color:#2c6e9e; font-size:16px;">
      <button id="copyIdBtn" class="btn-base secondary" style="padding:8px; font-size:13px;">📋 Sao chép</button>
      <div id="cloudStatus" style="font-size:11px; text-align:center; color:#b45309;"></div>
      <input id="restoreIdInput" class="input-field" placeholder="Nhập hoặc dán ID cần khôi phục" maxlength="20" style="font-size:14px;">
      <button id="restoreIdBtn" class="btn-base secondary" style="padding:8px; font-size:13px;">☁️ Khôi phục từ ID</button>
      <div style="font-size:13px; font-weight:bold; color:#475569; margin-top:4px;">⏱️ Khôi phục 3 ngày gần nhất</div>
      <div id="bkList" style="display:flex; gap:6px;"></div>
      <button id="deleteAcctBtn" class="btn-base" style="padding:8px; font-size:13px; background:#ef4444; box-shadow:0 2px 0 #991b1b;">🗑️ Xóa tài khoản</button></div>`);
    $('myIdBox').value = profData.id.replace(/(.{4})(?=.)/g, '$1-');
    $('copyIdBtn').onclick = () => { try { navigator.clipboard.writeText($('myIdBox').value); showUiToast('Đã sao chép ID!'); } catch (e) { showUiToast('Không sao chép được, hãy ghi lại ID!'); } }; // sao chép kèm dấu gạch ngang
    $('restoreIdBtn').onclick = () => restore($('restoreIdInput').value);
    let lastPaste = ''; $('restoreIdInput').addEventListener('input', e => { const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(); if (v.length === 12 && v !== lastPaste) { lastPaste = v; restore(v); } else if (v.length < 12) lastPaste = ''; });
    $('deleteAcctBtn').onclick = deleteAccount; paint(); renderBackups();
  })();
  setInterval(() => { const p = $('settingsPanel'); if (p && p.classList.contains('show')) renderBackups(); }, 1000);
  ensureName(); setInterval(ensureName, 10000);
  // ---------- CẬP NHẬT TỨC THÌ: kiểm tra database mỗi 5 giây khi đang chơi (admin sửa money/level là áp dụng ngay) ----------
  let adminSig = '', polling = false;
  async function poll() {
    if (!isGameStarted || locked || busy || polling || document.hidden) return; polling = true;
    try {
      const id = profData.id, cur = await getDoc(id); if (!cur) return;
      if (cur.device && cur.device !== dev) { showLock(id, cur); return; }
      const sig = cur.money === null && cur.level === null ? '' : cur.money + '|' + cur.level;
      if (!sig) { adminSig = ''; return; } if (sig === adminSig) return; adminSig = sig;
      await applyAdmin(id, cur); sync();
    } catch (e) {} finally { polling = false; }
  }
  setInterval(poll, 5000);
  setInterval(() => { if (isGameStarted && !started) { started = true; sync(); } }, 2000);
  setInterval(sync, SYNC_MS);
  document.addEventListener('visibilitychange', () => { if (document.hidden) sync(); });
})();
