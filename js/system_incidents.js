// ==========================================
// HỆ THỐNG: sự cố khách báo (mất điện, hư máy lạnh...) - Tin nhắn > Khách hàng
// Có 90 giây để sửa. Dễ: bạn lên phòng bấm vào phòng "CẦN SỬA" hoặc gọi nhân viên. Khó: nhân viên báo lại rồi gọi thợ.
// Tiền: chủ khách sạn trả bằng tiền của mình, chưa làm chủ thì trả bằng tiền khách sạn. Có ghi vào Sao kê.
// ==========================================
const INCIDENT_TYPES = [
  { k: 'den', icon: '💡', title: 'Bóng đèn cháy', lvl: 'easy', cost: [30000, 80000], say: r => `Phòng ${r} bóng đèn bị cháy, tối quá. Nhờ khách sạn thay giúp mình nhé!` },
  { k: 'voi', icon: '🚿', title: 'Vòi nước nghẹt', lvl: 'easy', cost: [50000, 120000], say: r => `Vòi nước phòng ${r} yếu và nghẹt, mình không tắm được.` },
  { k: 'wifi', icon: '📶', title: 'Wifi chập chờn', lvl: 'easy', cost: [20000, 50000], say: r => `Wifi phòng ${r} cứ chập chờn, nhờ kiểm tra giúp mình.` },
  { k: 'remote', icon: '📺', title: 'Remote tivi hỏng', lvl: 'easy', cost: [30000, 60000], say: r => `Remote tivi phòng ${r} bấm không ăn, nhờ đổi giúp.` },
  { k: 'lanh', icon: '❄️', title: 'Hư máy lạnh', lvl: 'hard', cost: [600000, 1200000], wait: 60, tech: 'thợ điện lạnh', say: r => `Máy lạnh phòng ${r} không mát, nóng quá! Nhờ khách sạn xử lý gấp.` },
  { k: 'ong', icon: '🔧', title: 'Vỡ ống nước', lvl: 'hard', cost: [700000, 1500000], wait: 75, tech: 'thợ nước', say: r => `Phòng ${r} nước chảy tràn ra sàn từ ống nước, nhờ xử lý gấp!` },
  { k: 'dien', icon: '⚡', title: 'Mất điện', lvl: 'hard', cost: [900000, 1800000], wait: 90, tech: 'thợ điện', say: r => `Phòng ${r} mất điện hoàn toàn, tối om! Nhờ khách sạn xem giúp.` }
];
const INC_KEY = 'sunriseHotel_Incidents';
let customerMsgs = [], incLastHour = 0, incSig = '';
try { const d = JSON.parse(localStorage.getItem(INC_KEY) || '{}'); customerMsgs = (d.msgs || []).map(m => (['pending', 'fixing', 'needTech'].includes(m.status) ? Object.assign(m, { status: 'expired', quiet: true }) : m)); } catch (e) {}
const INC_LIMIT = 90000, INC_STAFF_MS = 20000, INC_TECH_MS = 30000; // 90s để sửa; nhân viên 20s; thợ 30s
function incSave() { try { localStorage.setItem(INC_KEY, JSON.stringify({ msgs: customerMsgs })); } catch (e) {} }
function incFmt(n) { return fmtVND(Math.round(n)); }
function incPay(label, amount) {
  const fund = isHotelOwner ? playerMoney : hotelMoney;
  if (fund < amount) { showUiToast(`Không đủ tiền (cần ${incFmt(amount)})!`); return false; }
  if (isHotelOwner) playerMoney -= amount; else hotelMoney -= amount;
  addExpense(label, amount); updateMoneyUI(); return true;
}
function incRoom(m) { return roomState.find(r => String(r.number) === String(m.room)); }
function incActive(m) { return m.status === 'pending' || m.status === 'fixing' || m.status === 'needTech'; }
function incActiveForRoom(num) { return customerMsgs.find(m => String(m.room) === String(num) && incActive(m)); }
function incSpawn() {
  if (customerMsgs.filter(incActive).length >= 2) return;
  const occ = roomState.filter(r => r.status === 'Có khách' && !incActiveForRoom(r.number)); if (!occ.length) return;
  const room = occ[Math.floor(Math.random() * occ.length)];
  const ty = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
  const g = reviewGuestFromRoom(room);
  const cost = Math.round((ty.cost[0] + Math.random() * (ty.cost[1] - ty.cost[0])) / 10000) * 10000 || ty.cost[0];
  const now = Date.now();
  customerMsgs.push({ id: 'i' + now + Math.floor(Math.random() * 999), k: ty.k, room: room.number, guest: g ? g.name : 'Khách', gi: g || null, text: ty.say(room.number), cost, status: 'pending', t: now, deadline: now + INC_LIMIT, time: gameTime.getHours().toString().padStart(2, '0') + ':' + gameTime.getMinutes().toString().padStart(2, '0') });
  if (customerMsgs.length > 30) customerMsgs.shift();
  incSave(); showUiToast(`📩 Khách phòng ${room.number} báo sự cố! Còn 90 giây để xử lý.`);
}
function incType(m) { return INCIDENT_TYPES.find(t => t.k === m.k); }
function incFind(id, st) { return customerMsgs.find(m => m.id === id && m.status === st); }
// Bạn tự lên phòng (bấm vào phòng trong sơ đồ) để sửa - chỉ sự cố dễ
function incPlayerFix(m) {
  const ty = incType(m);
  if (m.status !== 'pending') { showUiToast('Sự cố này đang có người xử lý.'); return; }
  if (ty.lvl === 'hard') { showUiToast('Sự cố này quá khó, hãy nhờ nhân viên/gọi thợ trong tin nhắn!'); return; }
  if (!incPay(`Vật tư sửa: ${ty.title} (P.${m.room})`, m.cost)) return;
  m.status = 'done'; m.fixer = isHotelOwner ? 'Chủ khách sạn' : 'Lễ tân (bạn)'; incTip(m); incSave(); renderCustomerMsgs(true);
  showToast(`Bạn đã tự tay sửa xong phòng ${m.room}!`);
}
function incAssign(id) {
  const m = incFind(id, 'pending'); if (!m) return; const ty = incType(m);
  const pool = ['veSinh', 'donPhong', 'baoVe'].reduce((a, k) => a.concat(getWorkingStaff(k).map(p => ({ p, k }))), []);
  if (!pool.length) { showUiToast('Hiện không có nhân viên nào đang làm việc!'); return; }
  const w = pool[Math.floor(Math.random() * pool.length)];
  if (ty.lvl === 'easy' && !incPay(`Vật tư sửa: ${ty.title} (P.${m.room})`, m.cost)) return;
  m.status = 'fixing'; m.by = 'staff'; m.fixer = `${w.p.name} (${STAFF_ROLES[w.k].name})`; m.sender = STAFF_ROLES[w.k].name; m.doneAt = Date.now() + INC_STAFF_MS;
  incSave(); renderCustomerMsgs(true); showUiToast(`${w.p.name} đang đi sửa.`);
}
function incCallTech(id) {
  const m = incFind(id, 'needTech'); if (!m) return; const ty = incType(m);
  if (!incPay(`Gọi ${ty.tech}: ${ty.title} (P.${m.room})`, m.cost)) return;
  m.status = 'fixing'; m.by = 'tech'; m.fixer = ty.tech.charAt(0).toUpperCase() + ty.tech.slice(1); m.sender = 'Hệ thống'; m.doneAt = Date.now() + INC_TECH_MS;
  incSave(); renderCustomerMsgs(true); showUiToast(`Đã gọi ${ty.tech}, sẽ tới trong ít phút.`);
}
let incLastTick = Date.now();
function incTick() {
  const nowR = Date.now(), dt = nowR - incLastTick; incLastTick = nowR;
  if (!isGameStarted) return;
  if (isGamePaused) { customerMsgs.forEach(m => { if (incActive(m)) { m.deadline += dt; if (m.doneAt) m.doneAt += dt; } }); return; }
  let changed = false;
  customerMsgs.forEach(m => {
    if (!incActive(m)) return;
    if (m.status === 'fixing') m.deadline += dt; // đang sửa thì dừng đếm ngược
    const room = incRoom(m), left = !room || room.status !== 'Có khách';
    if (nowR >= m.deadline || left) {
      m.status = 'expired'; changed = true;
      addGuestReview(1, { reason: 'Sự cố không được sửa kịp', room: m.room, guest: m.gi || null });
      showUiToast(`😠 Khách phòng ${m.room} ${left ? 'đã rời đi' : 'hết kiên nhẫn'} vì sự cố chưa sửa xong, để lại đánh giá kém!`);
    } else if (m.status === 'fixing' && nowR >= m.doneAt) {
      changed = true;
      if (m.by === 'staff' && incType(m).lvl === 'hard') {
        m.status = 'needTech';
        addInternalMessage(m.sender, `Sự cố "${incType(m).title.toLowerCase()}" ở phòng ${m.room} quá khó, tôi không sửa được. Hãy gọi ${incType(m).tech} giúp!`);
        showUiToast(`${m.fixer} báo: phòng ${m.room} cần gọi thợ!`);
      } else {
        m.status = 'done'; incTip(m);
        addInternalMessage(m.sender || 'Hệ thống', `${m.fixer} đã sửa xong ${incType(m).title.toLowerCase()} ở phòng ${m.room}.`);
      }
    }
  });
  const hk = Math.floor(gameTime.getTime() / 3600000);
  if (hk !== incLastHour) { incLastHour = hk; if (Math.random() < 0.08) incSpawn(); }
  if (changed) incSave();
  renderCustomerMsgs(customerMsgs.some(incActive) || changed);
}
function renderCustomerMsgs(force) {
  const box = document.getElementById('msg-customer'); if (!box) return;
  const sig = customerMsgs.map(m => m.id + m.status).join() + (isHotelOwner ? 'o' : 'n');
  if (!force && sig === incSig) return; incSig = sig;
  if (!customerMsgs.length) { box.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Chưa có tin nhắn từ khách.</div>'; return; }
  const badge = { pending: ['Chờ xử lý', '#d97706', '#fef3c7'], fixing: ['Đang sửa', '#2563eb', '#dbeafe'], needTech: ['Cần gọi thợ', '#9333ea', '#f3e8ff'], done: ['Đã xong', '#16a34a', '#dcfce7'], expired: ['Quá hạn', '#dc2626', '#fee2e2'] };
  const nowR = Date.now();
  box.innerHTML = customerMsgs.slice().reverse().map(m => {
    const ty = incType(m) || INCIDENT_TYPES[0], b = badge[m.status];
    const left = incActive(m) ? ` · còn ${Math.max(0, Math.ceil((m.deadline - nowR) / 1000))}s` : '';
    const bt = (fn, label, bg) => `<button onclick="${fn}('${m.id}')" style="border:none; border-radius:6px; padding:7px 10px; margin:6px 6px 0 0; font-size:12px; font-weight:bold; color:#fff; background:${bg}; cursor:pointer;">${label}</button>`;
    let act = '';
    if (m.status === 'pending') act = bt('incAssign', '👷 Gọi nhân viên', '#3b82f6') + (ty.lvl === 'easy' ? `<div style="font-size:11px; color:#64748b; margin-top:4px;">Hoặc tự lên phòng ${m.room} để sửa (vật tư ${incFmt(m.cost)}).</div>` : '');
    else if (m.status === 'needTech') act = `<div style="font-size:12px; color:#9333ea; margin-top:4px;">${staffEsc(m.fixer)} báo: quá khó, cần gọi ${ty.tech}.</div>` + bt('incCallTech', `📞 Gọi ${ty.tech} (${incFmt(m.cost)})`, '#f59e0b');
    else if (m.status === 'fixing') act = `<div style="font-size:12px; color:#2563eb; margin-top:4px;">${staffEsc(m.fixer)} đang xử lý...</div>`;
    else if (m.status === 'done') act = `<div style="font-size:12px; color:#16a34a; margin-top:4px;">✅ ${staffEsc(m.fixer)} đã sửa xong. Khách: "Cảm ơn khách sạn nhiều!"</div>`;
    else act = `<div style="font-size:12px; color:#dc2626; margin-top:4px;">Khách đã để lại đánh giá kém.</div>`;
    return `<div style="display:flex; gap:10px; padding:10px; border-bottom:1px solid #e0e6ec;">
      <div style="width:38px; height:38px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-size:20px; flex:none;">${ty.icon}</div>
      <div style="flex:1;"><div style="font-weight:900; font-size:13px; color:#1e3a52;">${staffEsc(m.guest)} · P.${m.room} <span style="font-size:11px; padding:1px 6px; border-radius:10px; color:${b[1]}; background:${b[2]};">${b[0]}${left}</span></div>
      <div style="font-size:13px; color:#4a5d6e; margin-top:2px;">${staffEsc(m.text)}</div>${act}</div>
      <div style="font-size:11px; color:#94a3b8;">${m.time}</div></div>`;
  }).join('');
}
setInterval(incTick, 1000);

// ---------- TIỀN TIP (vào túi bạn, ghi trong Sao kê) ----------
function giveTip(amount, reason) {
  amount = Math.round(amount / 1000) * 1000; if (amount <= 0) return;
  playerMoney += amount; updateMoneyUI();
  const n = gameTime;
  receiptHistory.push({ type: 'tip', label: reason, amount, time: `${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')} - ${n.getDate()}/${n.getMonth() + 1}` });
  if (receiptHistory.length > 300) receiptHistory.splice(0, receiptHistory.length - 300);
  if (typeof renderReceipt === 'function') renderReceipt();
  showUiToast(`💝 Khách tip bạn ${fmtVND(amount)}!`);
}
// Khách thanh toán: khách sạn càng nhiều sao càng dễ được tip (10% -> 40%)
function maybeBillTip(bill) {
  if (Math.random() < 0.1 + 0.06 * hotelRating) giveTip(Math.max(10000, bill * (0.03 + Math.random() * 0.05)), 'Tiền tip khi thanh toán');
}
// Sửa sự cố xong: nhanh thì tip nhiều hơn
function incTip(m) {
  if (Math.random() > 0.6) return;
  const fast = Math.max(0, (m.deadline - Date.now()) / INC_LIMIT);
  giveTip(20000 + fast * 60000 * Math.random(), `Tip vì sửa nhanh (P.${m.room})`);
}
