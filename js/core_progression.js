// ==========================================
// LÕI GAME: SAO KHÁCH SẠN → lượng khách, giá phòng tối đa, yêu cầu của nhân viên
// ==========================================
// Khách sạn bắt đầu ở 3 sao. Sao = trung bình đánh giá của khách, có tính thêm
// RATING_PRIOR_WEIGHT lượt "đánh giá khởi đầu" 3 sao để sao không nhảy quá mạnh khi mới có vài đánh giá.
const STARTING_RATING = 3.0;
const RATING_PRIOR_WEIGHT = 5;

function recalcHotelRating() {
  hotelRating = (reviewSum + STARTING_RATING * RATING_PRIOR_WEIGHT) / (reviewCount + RATING_PRIOR_WEIGHT);
}
// Sao làm tròn 1 chữ số (dùng để so sánh với các yêu cầu)
function hotelRatingRounded() { return Math.round(hotelRating * 10) / 10; }

// ---------- 1. LƯỢNG KHÁCH THEO SAO ----------
// Hệ số nhân thời gian chờ giữa 2 khách: 1★ = x2.2 (ít khách) | 3★ = x1.0 | 5★ = x0.55 (rất đông)
function guestFlowMultiplier() {
  const r = Math.min(5, Math.max(1, hotelRating));
  return r <= 3 ? 2.2 - 0.6 * (r - 1) : 1.0 - 0.225 * (r - 3);
}
function guestFlowLabel() {
  const pct = Math.round(100 / guestFlowMultiplier());
  const name = pct < 60 ? 'Rất ít' : pct < 90 ? 'Ít' : pct <= 110 ? 'Bình thường' : pct <= 160 ? 'Đông' : 'Rất đông';
  return `${name} (${pct}% so với mức 3⭐)`;
}

// ---------- 2. GIÁ PHÒNG TỐI ĐA THEO SAO ----------
// Giá tối đa = giá gốc x (1 + 0.25 x (sao - 1)):  1★ = x1.0 | 3★ = x1.5 | 5★ = x2.0
function priceCapMultiplier() { return 1 + 0.25 * (Math.min(5, Math.max(1, hotelRating)) - 1); }
function priceRoomNameFromKey(key) { return Object.keys(PRICE_KEYS).find(n => PRICE_KEYS[n] === key); }
function getPriceCap(roomName, type) {
  const base = ROOM_PRICES[roomName] && ROOM_PRICES[roomName][type];
  if (!base) return Infinity;
  return Math.floor(base * priceCapMultiplier() / 1000) * 1000;
}
// Sao khách sạn cần có để đặt được mức giá này
function ratingNeededForPrice(roomName, type, price) {
  const base = ROOM_PRICES[roomName][type];
  return 1 + (price / base - 1) / 0.25;
}
const PRICE_TYPE_LABEL = { hour: 'theo giờ', night: 'qua đêm', day: 'dài hạn' };

// Kiểm tra bảng giá mới, trả về câu báo lỗi đầu tiên (hoặc '' nếu hợp lệ)
function validatePriceCaps(newPrices) {
  for (const name of Object.keys(newPrices)) {
    for (const type of ['hour', 'night', 'day']) {
      const price = newPrices[name][type], cap = getPriceCap(name, type);
      if (price > cap) {
        const need = ratingNeededForPrice(name, type, price);
        const needText = need > 5 ? 'vượt cả giá trần của khách sạn 5⭐' : `cần khách sạn đạt ≥ ${(Math.ceil(need * 10) / 10).toFixed(1)}⭐`;
        return `${name} (${PRICE_TYPE_LABEL[type]}): ${fmtVND(price)} vượt mức tối đa ${fmtVND(cap)} của khách sạn ${hotelRating.toFixed(1)}⭐ (${needText}).`;
      }
    }
  }
  return '';
}
// Sao giảm -> giá nào vượt mức tối đa mới thì tự hạ xuống mức tối đa
function enforcePriceCaps() {
  let changed = 0;
  Object.keys(customPrices).forEach(name => {
    ['hour', 'night', 'day'].forEach(type => {
      const cap = getPriceCap(name, type);
      if (customPrices[name] && customPrices[name][type] > cap) { customPrices[name][type] = cap; changed++; }
    });
  });
  if (changed > 0) {
    if (typeof refreshHotelInfoPrices === 'function') refreshHotelInfoPrices();
    if (typeof fillPriceInputs === 'function') fillPriceInputs();
    if (typeof showUiToast === 'function') showUiToast(`⚠️ Sao khách sạn còn ${hotelRating.toFixed(1)}⭐: ${changed} mức giá vượt mức tối đa đã được hạ xuống.`);
    if (typeof autoSaveGame === 'function') autoSaveGame();
  }
  return changed;
}
// Dòng gợi ý mức giá tối đa ở tab Quản lý
function updatePriceCapInfo() {
  const el = document.getElementById('priceCapInfo'); if (!el) return;
  const mult = priceCapMultiplier();
  const example = getPriceCap('Phòng Đơn', 'hour');
  const next = Math.min(5, Math.floor(hotelRating) + 1);
  const nextMult = 1 + 0.25 * (next - 1);
  el.innerHTML = `📈 Khách sạn <b>${hotelRating.toFixed(1)}⭐</b>: giá phòng tối đa <b>x${mult.toFixed(2)}</b> giá gốc (VD: Phòng Đơn theo giờ tối đa <b>${fmtVND(example)}</b>).` +
    (hotelRating < 5 ? ` Đạt <b>${next}⭐</b> thì tối đa x${nextMult.toFixed(2)}.` : ' Đã đạt mức tối đa cao nhất.');
}
// Cảnh báo ngay khi gõ giá (ô nhập giá)
function showPriceCapWarning(input, warnEl, val) {
  const m = /^price(\w+)_(hour|night|day)$/.exec(input.id); if (!m) return;
  const name = priceRoomNameFromKey(m[1]); if (!name) return;
  const cap = getPriceCap(name, m[2]);
  if (val > cap) {
    const need = ratingNeededForPrice(name, m[2], val);
    warnEl.style.display = 'block'; warnEl.style.color = '#ef4444';
    warnEl.innerHTML = `⚠️ Vượt mức tối đa ${fmtVND(cap)} (${need > 5 ? 'vượt giá trần 5⭐' : 'cần khách sạn ≥ ' + (Math.ceil(need * 10) / 10).toFixed(1) + '⭐'})`;
  } else if (val >= cap * 0.9) {
    warnEl.style.display = 'block'; warnEl.style.color = '#f59e0b';
    warnEl.innerHTML = `Gần mức giá tối đa (${fmtVND(cap)})`;
  } else {
    warnEl.style.display = 'none';
  }
}

// Gọi mỗi khi sao khách sạn thay đổi
function updateRatingEffectsUI() {
  const flow = document.getElementById('infoFlow');
  if (flow) flow.innerText = guestFlowLabel();
  enforcePriceCaps();
  updatePriceCapInfo();
}

// ---------- 3. YÊU CẦU SAO CỦA NHÂN VIÊN ----------
// Ứng viên chỉ nhận việc ở khách sạn có sao >= số sao của họ. Nhân viên đã thuê mà khách sạn tụt dưới mức này
// sẽ báo trước, rồi mỗi ngày có thể xin nghỉ việc.
function meetsStaffRequirement(req) { return hotelRatingRounded() >= (req || 1); }

function resignStaff(key, p) {
  const idx = staffList[key].indexOf(p); if (idx === -1) return;
  settleStaffSalary(p); // trả nốt lương còn nợ
  staffList[key].splice(idx, 1);
  const role = STAFF_ROLES[key].name;
  const msg = `${p.name} (${role}) đã xin nghỉ việc vì chất lượng khách sạn giảm (hiện ${hotelRating.toFixed(1)}⭐, yêu cầu ${p.reqStars}⭐).`;
  addInternalMessage(p.name, `Chất lượng khách sạn không còn như trước nên tôi xin nghỉ việc. Cảm ơn bạn thời gian qua.`);
  if (typeof showUiToast === 'function') showUiToast('🚪 ' + msg);
  if (typeof renderStaffUI === 'function') renderStaffUI();
  if (typeof refreshStaffManageTab === 'function') refreshStaffManageTab();
  if (typeof autoSaveGame === 'function') autoSaveGame();
}

// Chạy mỗi ngày trong game
function checkStaffResignations() {
  if (!isHotelOwner) return;
  const rating = hotelRatingRounded();
  const quitters = [];
  Object.keys(staffList).forEach(key => {
    staffList[key].forEach(p => {
      const req = p.reqStars || 1;
      if (rating >= req) { p.unhappyDays = 0; p.warned = false; return; }
      p.unhappyDays = (p.unhappyDays || 0) + 1;
      if (!p.warned) { // lần đầu: chỉ cảnh báo
        p.warned = true;
        addInternalMessage(p.name, `Khách sạn đang ${rating.toFixed(1)}⭐, thấp hơn mức ${req}⭐ tôi mong đợi. Nếu không cải thiện, tôi có thể xin nghỉ việc.`);
        if (typeof showUiToast === 'function') showUiToast(`⚠️ ${p.name} không hài lòng vì khách sạn chỉ ${rating.toFixed(1)}⭐ (yêu cầu ${req}⭐)`);
        return;
      }
      const chance = Math.min(0.6, 0.08 + 0.2 * (req - rating) + 0.02 * p.unhappyDays);
      if (Math.random() < chance) quitters.push([key, p]);
    });
  });
  quitters.forEach(([key, p]) => resignStaff(key, p));
}
