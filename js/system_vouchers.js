// ==========================================
// HỆ THỐNG: mã giảm giá
// ==========================================
// 3. Tạo mã giảm giá
// --- Ngày trong game (định dạng yyyy-mm-dd cho ô chọn ngày) ---
function getGameDateISO() {
  const y = gameTime.getFullYear();
  const m = String(gameTime.getMonth() + 1).padStart(2, '0');
  const d = String(gameTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function formatVoucherDate(iso) {
  const p = (iso || '').split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : (iso || '');
}
// Mặc định ngày bắt đầu/kết thúc = ngày hiện tại trong game (chỉ điền khi người chơi chưa tự chỉnh)
function setDefaultVoucherDates(force = false) {
  const today = getGameDateISO();
  ['voucherStart', 'voucherEnd'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (force || !el.dataset.touched) el.value = today;
  });
}
['voucherStart', 'voucherEnd'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => { el.dataset.touched = '1'; });
});
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function getVoucherStatus(v) {
  const today = getGameDateISO();
  if (today < v.start) return { text: 'Sắp chạy', color: '#d97706', bg: '#fef3c7' };
  if (today > v.end) return { text: 'Hết hạn', color: '#6b7280', bg: '#e5e7eb' };
  return { text: 'Đang chạy', color: '#16a34a', bg: '#dcfce7' };
}
function voucherCardHTML(v, i) {
  const st = getVoucherStatus(v);
  return `<div style="background:#fff; border:1px dashed #fca5a5; border-radius:6px; padding:8px; display:flex; align-items:center; gap:8px;">
    <div style="flex:1; min-width:0;">
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
        <b style="font-size:14px; color:#b91c1c;">🎟️ ${escapeHTML(v.code)}</b>
        <span style="font-size:11px; font-weight:bold; padding:1px 6px; border-radius:10px; color:${st.color}; background:${st.bg};">${st.text}</span>
      </div>
      <div style="font-size:12px; color:#ef4444; margin-top:3px;">Giảm <b>${v.discount}%</b></div>
      <div style="font-size:11px; color:#64748b; margin-top:2px;">📅 ${formatVoucherDate(v.start)} → ${formatVoucherDate(v.end)}</div>
    </div>
    <button onclick="deleteVoucher(${i})" style="border:none; background:#ef4444; color:#fff; font-weight:bold; border-radius:6px; padding:8px 10px; cursor:pointer;">🗑️ Xóa</button>
  </div>`;
}
function renderInfoVouchers() {
  const label = document.getElementById('infoVoucherText');
  const list = document.getElementById('infoVoucherList');
  if (label) {
    const running = activeVouchers.filter(v => getVoucherStatus(v).text === 'Đang chạy').length;
    label.innerText = activeVouchers.length === 0 ? 'Chưa có mã' : `${activeVouchers.length} mã (${running} đang chạy)`;
  }
  if (list) {
    list.innerHTML = activeVouchers.map((v, i) => voucherCardHTML(v, i)).join('');
  }
}
function renderVouchers() {
  const list = document.getElementById('voucherList');
  if (list) {
    list.innerHTML = activeVouchers.length === 0
      ? ''
      : `<div style="display:flex; flex-direction:column; gap:8px;">${activeVouchers.map((v, i) => voucherCardHTML(v, i)).join('')}</div>`;
  }
  renderInfoVouchers();
}
function deleteVoucher(i) {
  const v = activeVouchers[i];
  if (!v) return;
  showCustomAlert(`Bạn có chắc muốn xóa mã <b>${escapeHTML(v.code)}</b> không?`, true, () => {
    activeVouchers.splice(i, 1);
    renderVouchers();
    showUiToast("Đã xóa mã giảm giá!");
    autoSaveGame();
  });
}

document.getElementById('createVoucherBtn').onclick = () => {
  if (!isHotelOwner) return;

  const code = document.getElementById('voucherCode').value.trim().toUpperCase();
  const discount = parseInt(document.getElementById('voucherDiscount').value);
  const start = document.getElementById('voucherStart').value;
  const end = document.getElementById('voucherEnd').value;

  if (!(code && discount && start && end)) { showUiToast("Vui lòng nhập đủ thông tin!"); return; }
  if (discount < 1 || discount > 100) { showUiToast("Giảm giá phải từ 1 đến 100%!"); return; }
  if (end < start) { showUiToast("Ngày kết thúc phải sau ngày bắt đầu!"); return; }
  if (activeVouchers.some(v => v.code === code)) { showUiToast("Mã này đã tồn tại!"); return; }

  activeVouchers.push({ code, discount, start, end });
  renderVouchers();
  document.getElementById('voucherCode').value = '';
  document.getElementById('voucherDiscount').value = '';
  ['voucherStart', 'voucherEnd'].forEach(id => { delete document.getElementById(id).dataset.touched; });
  setDefaultVoucherDates(true);
  showUiToast("Đã tạo mã giảm giá!");
  autoSaveGame();
};
