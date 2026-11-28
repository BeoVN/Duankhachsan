// ==========================================
// GIAO DIỆN: quản lý & tuyển nhân viên (tab Quản lý)
// ==========================================
// ==========================================================
// QUẢN LÝ NHÂN VIÊN (TAB "QUẢN LÝ" TRONG THÔNG TIN NHÂN VIÊN)
// ==========================================================
let staffManageState = { mode: 'list', recruitKey: null, changeOpen: null }; // changeOpen: "key:index"
let staffRecruitPools = {}; // Danh sách ứng viên hiện có cho từng vị trí

const STAFF_FIRST_NAMES = ["Hùng","Tuấn","Lan","Mai","Hoa","Thảo","Hạnh","Trang","Nam","Huy","Dũng","Linh","Phúc","Ngọc","Khoa","Bình","Châu","Đạt","Giang","Hải","Khánh","Loan","Minh","Nhi","Oanh","Phong","Quân","Sơn","Thu","Trinh","Vy","Yến","Long","Tâm","Hiếu","Duyên","Kiên","Thắng","Hương","Tú"];

const staffEsc = (str) => String(str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const staffMoney = (n) => fmtVND(n);
const staffStars = (n) => '<span style="color:#f59e0b; letter-spacing:1px;">' + '★'.repeat(n) + '</span><span style="color:#cbd5e1; letter-spacing:1px;">' + '☆'.repeat(5 - n) + '</span>';
const staffShiftLabel = (s) => s === 'day' ? '☀️ Ca Ngày' : '🌙 Ca Đêm';

// Tạo danh sách ứng viên: chất lượng (sao + tốc độ) càng cao thì lương càng cao, có dao động ngẫu nhiên
function generateCandidates(key, count = 5) {
  const role = STAFF_ROLES[key];
  const qualities = [];
  for (let i = 0; i < count; i++) qualities.push((i + Math.random()) / count);
  qualities.sort(() => Math.random() - 0.5);
  return qualities.map(q => {
    const stars = Math.min(5, Math.max(1, Math.round(1 + q * 4 + (Math.random() - 0.5) * 1.2)));
    let speed = Math.round((60 + q * 90 + (Math.random() - 0.5) * 30) / 5) * 5;
    speed = Math.min(160, Math.max(50, speed));
    const quality = ((stars - 1) / 4 + (speed - 50) / 110) / 2; // 0 -> 1
    const salary = Math.round(role.baseSalary * (0.6 + 0.9 * quality) * (0.85 + Math.random() * 0.3) / 10000) * 10000;
    return {
      name: STAFF_FIRST_NAMES[Math.floor(Math.random() * STAFF_FIRST_NAMES.length)],
      age: 20 + Math.floor(Math.random() * 26),
      stars, speed, salary,
      reqStars: stars // khách sạn phải đạt từng này sao thì họ mới nhận việc
    };
  });
}

// Ứng viên khan hiếm: mỗi vị trí chỉ có 1-3 người, hết thì phải chờ vài ngày trong game (lưu lại, không làm mới được)
const RECRUIT_REFILL_DAYS = 3;
function recruitDay() { return Math.floor(gameTime.getTime() / 86400000); }
function recruitLoad() { try { const d = JSON.parse(localStorage.getItem('sunriseHotel_Recruit') || '{}'); staffRecruitPools = d.pools || {}; staffRecruitRefill = d.refill || {}; } catch (e) {} }
function recruitSave() { try { localStorage.setItem('sunriseHotel_Recruit', JSON.stringify({ pools: staffRecruitPools, refill: staffRecruitRefill })); } catch (e) {} }
let staffRecruitRefill = {};
function recruitEnsure(key) {
  if (!staffRecruitPools[key]) staffRecruitPools[key] = generateCandidates(key, 1 + Math.floor(Math.random() * 3));
  if (staffRecruitPools[key].length === 0) {
    if (staffRecruitRefill[key] === undefined) staffRecruitRefill[key] = recruitDay() + RECRUIT_REFILL_DAYS;
    if (recruitDay() >= staffRecruitRefill[key]) { staffRecruitPools[key] = generateCandidates(key, 1 + Math.floor(Math.random() * 3)); delete staffRecruitRefill[key]; }
  }
  recruitSave();
}
recruitLoad();

function refreshStaffManageTab() {
  const lock = document.getElementById('staffManageLock');
  const content = document.getElementById('staffManageContent');
  if (!lock || !content) return;
  if (!isHotelOwner) { lock.style.display = 'block'; content.style.display = 'none'; return; }
  lock.style.display = 'none';
  content.style.display = 'block';
  renderStaffManage();
}

function staffManageCardHTML(key, i, p) {
  const role = STAFF_ROLES[key];
  let st = { text: 'Hết ca', color: '#ef4444' };
  if (p.status === 'working') st = { text: 'Trong ca', color: '#22c55e' };
  if (p.status === 'leave') st = { text: 'Nghỉ phép', color: '#f59e0b' };
  const btn = (label, fn, bg) => `<button onclick="${fn}" style="flex:1; border:none; border-radius:6px; padding:8px 4px; font-size:12px; font-weight:bold; color:#fff; background:${bg}; cursor:pointer;">${label}</button>`;
  let changeRow = '';
  if (staffManageState.changeOpen === key + ':' + i) {
    const opts = Object.keys(STAFF_ROLES).filter(k => k !== key).map(k => {
      const full = staffList[k].length >= getRoleMax(k);
      return `<button ${full ? 'disabled' : ''} onclick="staffMoveRole('${key}', ${i}, '${k}')" style="border:1px solid #cbd5e1; border-radius:6px; padding:6px 8px; font-size:12px; background:${full ? '#e5e7eb' : '#fff'}; color:${full ? '#9ca3af' : '#1e3a52'}; cursor:${full ? 'not-allowed' : 'pointer'};">${STAFF_ROLES[k].icon} ${STAFF_ROLES[k].name}${full ? ' (đầy)' : ''}</button>`;
    }).join('');
    changeRow = `<div style="margin-top:6px; padding:6px; background:#eff6ff; border-radius:6px;"><div style="font-size:11px; color:#475569; margin-bottom:4px;">Chuyển sang vị trí:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">${opts}</div></div>`;
  }
  return `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px; margin-bottom:8px;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <b style="font-size:14px; color:#1e3a52;">${staffEsc(p.name)} <span style="font-size:12px; font-weight:normal; color:#64748b;">(${p.age} tuổi)</span></b>
      <span style="font-size:11px; font-weight:bold; color:${st.color};">● ${st.text}</span>
    </div>
    <div style="font-size:12px; color:#475569; margin-top:4px; display:grid; grid-template-columns:1fr 1fr; gap:3px 8px;">
      <span>⭐ ${staffStars(p.stars)}${p.rvCount > 0 ? ` <small style="color:#64748b;">${staffAvgRating(p).toFixed(1)} (${p.rvCount} đánh giá)</small>` : ''}</span>
      <span>⚡ Tốc độ: <b>${p.speed}%</b></span>
      <span>🕒 <b>${staffShiftLabel(p.shift)}</b></span>
      <span>${role.icon} <b>${role.name}</b></span>
      <span style="grid-column:1 / 3;">💰 Lương: <b style="color:#b45309;">${staffMoney(p.salary)}/ngày</b></span>
      <span style="grid-column:1 / 3; color:${meetsStaffRequirement(p.reqStars) ? '#64748b' : '#ef4444'};">📋 Yêu cầu khách sạn: ≥ ${p.reqStars}⭐${meetsStaffRequirement(p.reqStars) ? '' : ' · ⚠️ Không hài lòng, có thể xin nghỉ việc'}</span>
    </div>
    <div style="display:flex; gap:6px; margin-top:8px;">
      ${btn('🔄 Đổi ca', `staffChangeShift('${key}', ${i})`, '#3b82f6')}
      ${btn('🔀 Đổi việc', `staffToggleChangeRole('${key}', ${i})`, '#8b5cf6')}
      ${btn('🚪 Nghỉ việc', `staffFire('${key}', ${i})`, '#ef4444')}
    </div>
    ${p.status === 'leave' ? `<div style="margin-top:6px;">${btn('🔔 Gọi đi làm lại', `staffCallBack('${key}', ${i})`, '#22c55e')}</div>` : ''}
    ${changeRow}
  </div>`;
}

function renderStaffManage() {
  const box = document.getElementById('staffManageContent');
  if (!box) return;
  if (staffManageState.mode === 'recruit') { renderStaffRecruit(box); return; }

  let totalStaff = 0, totalSalary = 0;
  Object.keys(STAFF_ROLES).forEach(k => staffList[k].forEach(p => { totalStaff++; totalSalary += p.salary; }));

  let html = `<div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:8px 10px; margin-bottom:10px; font-size:12px; color:#9a3412; display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap;">
    <span>👥 Tổng nhân viên: <b>${totalStaff}</b></span>
    <span>💰 Tổng lương: <b>${staffMoney(totalSalary)}/ngày</b></span>
    <span style="width:100%;">🗓️ Trả lương mỗi ${PAYROLL_INTERVAL_DAYS} ngày · còn <b>${Math.max(0, PAYROLL_INTERVAL_DAYS - staffPayrollDay)}</b> ngày · đang chờ trả: <b>${staffMoney(getStaffOwedTotal())}</b></span>
  </div>`;

  Object.keys(STAFF_ROLES).forEach(key => {
    const role = STAFF_ROLES[key];
    const list = staffList[key];
    const canHire = list.length < getRoleMax(key);
    html += `<div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #cbd5e1; border-left:4px solid ${role.color}; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:6px;">
        <b style="color:#1e3a52; font-size:14px;">${role.icon} ${role.name} <span style="font-size:11px; color:#64748b;">(${list.length}/${getRoleMax(key)})</span></b>
        ${list.length > 0 && canHire ? `<button onclick="staffOpenRecruit('${key}')" style="border:none; border-radius:6px; padding:6px 10px; font-size:12px; font-weight:bold; color:#fff; background:#22c55e; cursor:pointer;">➕ Tuyển thêm</button>` : ''}
      </div>`;
    if (list.length === 0) {
      html += `<div style="text-align:center; padding:8px;">
        <div style="font-size:12px; color:#888; font-style:italic; margin-bottom:8px;">Chưa có nhân viên</div>
        <button onclick="staffOpenRecruit('${key}')" style="border:none; border-radius:8px; padding:10px 16px; font-size:13px; font-weight:bold; color:#fff; background:#22c55e; cursor:pointer;">➕ Tuyển thêm</button>
      </div>`;
    } else {
      html += list.map((p, i) => staffManageCardHTML(key, i, p)).join('');
      if (!canHire) html += `<div style="font-size:11px; color:#94a3b8; text-align:center;">Đã đủ nhân viên cho vị trí này</div>`;
    }
    html += `</div>`;
  });
  box.innerHTML = html;
}

function renderStaffRecruit(box) {
  const key = staffManageState.recruitKey;
  const role = STAFF_ROLES[key];
  recruitEnsure(key);
  const pool = staffRecruitPools[key] || [];
  const slots = getRoleMax(key) - staffList[key].length;
  let html = `<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <button onclick="staffCloseRecruit()" style="border:none; border-radius:6px; padding:8px 10px; font-size:12px; font-weight:bold; color:#fff; background:#64748b; cursor:pointer;">← Quay lại</button>
      <b style="color:#1e3a52; font-size:14px;">${role.icon} Tuyển ${role.name.toLowerCase()}</b>
    </div>
    <div style="font-size:12px; color:#475569; margin-bottom:8px;">Còn trống <b>${slots}</b> chỗ. Lương tính theo ngày, trả gộp mỗi 14 ngày. Ứng viên chỉ nhận việc nếu khách sạn đạt đủ số sao họ yêu cầu. Chất lượng cao thì lương thường cao hơn, nhưng cũng có người lương hợp lý hơn người khác.</div>`;
  if (pool.length === 0) {
    html += `<div style="text-align:center; color:#888; font-style:italic; padding:12px;">Hiện chưa có ứng viên nào. Hãy quay lại sau ${Math.max(1, (staffRecruitRefill[key] || recruitDay()) - recruitDay())} ngày nữa.</div>`;
  } else {
    html += pool.map((c, idx) => { const ok = meetsStaffRequirement(c.reqStars); return `<div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:8px; margin-bottom:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <b style="font-size:14px; color:#1e3a52;">${staffEsc(c.name)} <span style="font-size:12px; font-weight:normal; color:#64748b;">(${c.age} tuổi)</span></b>
        <b style="font-size:13px; color:#b45309;">${staffMoney(c.salary)}/ngày</b>
      </div>
      <div style="font-size:12px; color:#475569; margin-top:4px; display:flex; justify-content:space-between;">
        <span>⭐ ${staffStars(c.stars)}</span>
        <span>⚡ Tốc độ: <b>${c.speed}%</b></span>
      </div>
      <div style="font-size:12px; margin-top:4px; color:${ok ? '#16a34a' : '#ef4444'};">📋 Yêu cầu: khách sạn từ <b>${c.reqStars}⭐</b> ${ok ? '(đã đạt)' : `(chưa đạt, hiện ${hotelRating.toFixed(1)}⭐)`}</div>
      <div style="display:flex; gap:6px; margin-top:8px;">
        <button onclick="staffHire('${key}', ${idx}, 'day')" style="flex:1; border:none; border-radius:6px; padding:8px 4px; font-size:12px; font-weight:bold; color:#fff; background:${ok ? '#f59e0b' : '#9ca3af'}; cursor:pointer;">☀️ Thuê ca Ngày</button>
        <button onclick="staffHire('${key}', ${idx}, 'night')" style="flex:1; border:none; border-radius:6px; padding:8px 4px; font-size:12px; font-weight:bold; color:#fff; background:${ok ? '#3b82f6' : '#9ca3af'}; cursor:pointer;">🌙 Thuê ca Đêm</button>
      </div>
    </div>`; }).join('');
  }
  box.innerHTML = html;
}

function staffAfterChange() {
  syncStaffStatus();
  renderStaffManage();
  renderStaffUI();
  autoSaveGame();
}
function staffOpenRecruit(key) {
  if (!isHotelOwner) return;
  if (staffList[key].length >= getRoleMax(key)) { showUiToast('Vị trí này đã đủ nhân viên!'); return; }
  staffManageState.mode = 'recruit'; staffManageState.recruitKey = key; staffManageState.changeOpen = null;
  recruitEnsure(key);
  renderStaffManage();
}
function staffCloseRecruit() { staffManageState.mode = 'list'; staffManageState.recruitKey = null; renderStaffManage(); }
function staffRefreshCandidates() {
  const key = staffManageState.recruitKey; if (!key) return;
  staffRecruitPools[key] = generateCandidates(key);
  renderStaffManage();
}
function staffHire(key, idx, shift) {
  if (!isHotelOwner) return;
  const cand = (staffRecruitPools[key] || [])[idx]; if (!cand) return;
  if (staffList[key].length >= getRoleMax(key)) { showUiToast('Vị trí này đã đủ nhân viên!'); return; }
  if (!meetsStaffRequirement(cand.reqStars)) {
    showCustomAlert(`Khách sạn của bạn <b>chưa đạt yêu cầu</b>!<br><br><b>${staffEsc(cand.name)}</b> chỉ nhận việc ở khách sạn từ <b>${cand.reqStars}⭐</b> trở lên (hiện tại: ${hotelRating.toFixed(1)}⭐).<br>Hãy nâng sao khách sạn rồi quay lại nhé.`);
    return;
  }
  staffList[key].push({ name: cand.name, age: cand.age, shift, status: 'off_shift', stars: cand.stars, baseStars: cand.stars, rvSum: 0, rvCount: 0, id: newStaffId(), speed: cand.speed, salary: cand.salary, reqStars: cand.reqStars, owed: 0 });
  staffRecruitPools[key].splice(idx, 1);
  if (staffRecruitPools[key].length === 0) staffRecruitRefill[key] = recruitDay() + RECRUIT_REFILL_DAYS;
  recruitSave();
  showUiToast(`Đã tuyển ${cand.name} (${STAFF_ROLES[key].name}, ${shift === 'day' ? 'ca Ngày' : 'ca Đêm'})!`);
  if (staffList[key].length >= getRoleMax(key)) { staffManageState.mode = 'list'; staffManageState.recruitKey = null; }
  staffAfterChange();
}
function staffChangeShift(key, i) {
  const p = staffList[key][i]; if (!p || !isHotelOwner) return;
  p.shift = p.shift === 'day' ? 'night' : 'day';
  if (p.status === 'leave') p.status = 'off_shift';
  showUiToast(`${p.name} chuyển sang ${p.shift === 'day' ? 'ca Ngày' : 'ca Đêm'}`);
  staffAfterChange();
}
function staffToggleChangeRole(key, i) {
  const id = key + ':' + i;
  staffManageState.changeOpen = staffManageState.changeOpen === id ? null : id;
  renderStaffManage();
}
function staffMoveRole(key, i, newKey) {
  const p = staffList[key][i]; if (!p || !isHotelOwner) return;
  if (staffList[newKey].length >= getRoleMax(newKey)) { showUiToast('Vị trí này đã đủ nhân viên!'); return; }
  staffList[key].splice(i, 1);
  // Lương điều chỉnh theo mức lương cơ bản của vị trí mới
  p.salary = Math.round(p.salary * STAFF_ROLES[newKey].baseSalary / STAFF_ROLES[key].baseSalary / 10000) * 10000;
  staffList[newKey].push(p);
  staffManageState.changeOpen = null;
  showUiToast(`${p.name} đã chuyển sang ${STAFF_ROLES[newKey].name}`);
  staffAfterChange();
}
function staffFire(key, i) {
  const p = staffList[key][i]; if (!p || !isHotelOwner) return;
  showCustomAlert(`Bạn có chắc muốn cho <b>${staffEsc(p.name)}</b> (${STAFF_ROLES[key].name}) nghỉ việc không?`, true, () => {
    const idx = staffList[key].indexOf(p); if (idx === -1) return;
    const paid = settleStaffSalary(p);
    staffList[key].splice(idx, 1);
    staffManageState.changeOpen = null;
    showUiToast(`Đã cho ${p.name} nghỉ việc` + (paid > 0 ? ` (đã trả nốt lương ${staffMoney(paid)})` : ''));
    staffAfterChange();
  });
}
function staffCallBack(key, i) {
  const p = staffList[key][i]; if (!p || !isHotelOwner) return;
  p.status = 'off_shift';
  showUiToast(`${p.name} đã quay lại làm việc`);
  staffAfterChange();
}
