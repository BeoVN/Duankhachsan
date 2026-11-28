// ==========================================
// HỆ THỐNG: bảng Mở rộng, mua khách sạn, thông tin khách sạn
// ==========================================
document.getElementById('menuLoadSaveBtn').onclick = () => { document.getElementById('settingsPanel').classList.add('show'); const dataSection = document.getElementById('settingsPanel').querySelector('.window'); if (dataSection) { dataSection.scrollTop = dataSection.scrollHeight; } };

function updateExpandButton() {
  const btn = document.getElementById('btnExpand'); const icon = document.getElementById('btnExpandIcon'); const text = document.getElementById('btnExpandText'); if (!btn || !icon || !text) return; 
  if (playerLevel >= 5) { btn.style.opacity = '1'; btn.style.cursor = 'pointer'; icon.innerText = '🏢'; text.innerText = 'Mở rộng'; text.style.fontSize = '13px'; text.style.fontWeight = 'bold'; } 
  else { btn.style.opacity = '0.6'; btn.style.cursor = 'not-allowed'; icon.innerText = '🔒'; text.innerText = 'Yêu cầu Lv.5'; text.style.fontSize = '10px'; text.style.fontWeight = 'normal'; }
}

document.getElementById('btnExpand').onclick = () => { if (playerLevel < 5) { showUiToast("Tính năng này sẽ mở khóa ở Cấp độ 5!"); return; } isGamePaused = true; pauseStartTime = Date.now(); document.getElementById('expandPanel').classList.add('show'); };
document.getElementById('closeExpandBtn').onclick = () => { document.getElementById('expandPanel').classList.remove('show'); if (isGamePaused) { isGamePaused = false; const pausedDuration = Date.now() - pauseStartTime; if (guestPatienceEndTime > 0) guestPatienceEndTime += pausedDuration; roomState.forEach(room => { if (room.status === 'Có khách' && room.checkOutTime > 0) room.checkOutTime += pausedDuration; }); if (cleaningRoomNumber !== null) cleaningEndTime += pausedDuration; pauseStartTime = 0; } };

document.querySelectorAll('.expand-tab').forEach(tab => { tab.onclick = () => { document.querySelectorAll('.expand-tab').forEach(t => { t.classList.remove('active'); t.classList.add('secondary'); }); tab.classList.add('active'); tab.classList.remove('secondary'); document.querySelectorAll('.expand-content').forEach(c => c.style.display = 'none'); const targetId = 'expand-' + tab.dataset.expand; document.getElementById(targetId).style.display = 'block'; }; });

document.getElementById('buyHotelBtn').onclick = () => { if (isHotelOwner) { showUiToast("Bạn đã là chủ sở hữu của Sunrise Hotel rồi!"); return; } document.getElementById('buyPanelMyMoney').innerText = fmtVND(playerMoney); document.getElementById('buyPanelError').style.display = 'none'; document.getElementById('buyHotelPanel').classList.add('show'); };
document.getElementById('cancelBuyBtn').onclick = () => { document.getElementById('buyHotelPanel').classList.remove('show'); };

document.getElementById('confirmBuyBtn').onclick = () => {
  const PRICE = 1300000000;
  if (playerMoney >= PRICE) { playerMoney -= PRICE; isHotelOwner = true; updateMoneyUI(); autoSaveGame(); updateOwnerUI(); document.getElementById('buyHotelPanel').classList.remove('show'); document.getElementById('expandPanel').classList.remove('show'); showCustomAlert(`<div style="text-align:center;"><div style="font-size:50px; margin-bottom:10px;">🎉</div><h3 style="color:#d97706; font-size:18px; margin-bottom:10px;">CHÚC MỪNG ÔNG CHỦ!</h3><p style="font-size:14px; color:#1e3a52; font-weight:bold;">Bạn đã chính thức trở thành chủ sở hữu của <b>Sunrise Hotel</b>.</p><p style="font-size:13px; color:#2c6e9e; margin-top:5px; font-weight:bold;">Các tính năng <b>Quản lý</b> đã được mở khóa!</p></div>`); } 
  else { document.getElementById('buyPanelError').style.display = 'block'; }
};

document.querySelectorAll('#expand-inside button')[0].onclick = () => { 
  document.getElementById('infoRating').innerText = ratingText(); 
  document.getElementById('infoTraffic').innerText = (dailyGuestCount * 3) + " khách/ngày"; 
  
  // CẬP NHẬT BẢNG GIÁ TỪ CUSTOM PRICES
  const formatPrice = (p) => fmtVND(p);
  
  document.getElementById('infoPriceDon_hour').innerText = formatPrice(customPrices["Phòng Đơn"].hour) + '/h';
  document.getElementById('infoPriceDon_night').innerText = formatPrice(customPrices["Phòng Đơn"].night) + '/đêm';
  document.getElementById('infoPriceDon_day').innerText = formatPrice(customPrices["Phòng Đơn"].day) + '/ngày';

  document.getElementById('infoPriceDoi_hour').innerText = formatPrice(customPrices["Phòng Đôi"].hour) + '/h';
  document.getElementById('infoPriceDoi_night').innerText = formatPrice(customPrices["Phòng Đôi"].night) + '/đêm';
  document.getElementById('infoPriceDoi_day').innerText = formatPrice(customPrices["Phòng Đôi"].day) + '/ngày';

  document.getElementById('infoPriceVip_hour').innerText = formatPrice(customPrices["Phòng VIP"].hour) + '/h';
  document.getElementById('infoPriceVip_night').innerText = formatPrice(customPrices["Phòng VIP"].night) + '/đêm';
  document.getElementById('infoPriceVip_day').innerText = formatPrice(customPrices["Phòng VIP"].day) + '/ngày';

  document.getElementById('infoPriceLangMan_hour').innerText = formatPrice(customPrices["Phòng Lãng Mạn"].hour) + '/h';
  document.getElementById('infoPriceLangMan_night').innerText = formatPrice(customPrices["Phòng Lãng Mạn"].night) + '/đêm';
  document.getElementById('infoPriceLangMan_day').innerText = formatPrice(customPrices["Phòng Lãng Mạn"].day) + '/ngày';

  document.getElementById('infoPriceTongThong_hour').innerText = formatPrice(customPrices["Phòng Tổng Thống"].hour) + '/h';
  document.getElementById('infoPriceTongThong_night').innerText = formatPrice(customPrices["Phòng Tổng Thống"].night) + '/đêm';
  document.getElementById('infoPriceTongThong_day').innerText = formatPrice(customPrices["Phòng Tổng Thống"].day) + '/ngày';

  // CẬP NHẬT MÃ GIẢM GIÁ ĐANG CÓ
  renderInfoVouchers();
  
  // MỞ BẢNG THÔNG TIN VÀ ĐẢM BẢO CHỌN ĐÚNG TAB
  document.getElementById('hotelInfoPanel').classList.add('show'); 
  
  // Reset về tab Thông tin
  document.querySelectorAll('.hotel-info-tab').forEach(t => { t.classList.remove('active'); t.classList.add('secondary'); });
  document.querySelector('.hotel-info-tab[data-info="info"]').classList.add('active');
  document.querySelector('.hotel-info-tab[data-info="info"]').classList.remove('secondary');
  
  document.querySelectorAll('.hotel-info-content').forEach(c => c.style.display = 'none');
  document.getElementById('hotel-info-info').style.display = 'block';
};

document.getElementById('closeHotelInfoBtn').onclick = () => { document.getElementById('hotelInfoPanel').classList.remove('show'); };


// --- CẬP NHẬT BẢNG GIÁ NIÊM YẾT (TAB THÔNG TIN) & Ô NHẬP (TAB QUẢN LÝ) ---
const PRICE_KEYS = { "Phòng Đơn": "Don", "Phòng Đôi": "Doi", "Phòng VIP": "Vip", "Phòng Lãng Mạn": "LangMan", "Phòng Tổng Thống": "TongThong" };
function refreshHotelInfoPrices() {
  const fmt = (p) => fmtVND(p);
  Object.keys(PRICE_KEYS).forEach(name => {
    const k = PRICE_KEYS[name], p = customPrices[name]; if (!p) return;
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
    set('infoPrice' + k + '_hour', fmt(p.hour) + '/h');
    set('infoPrice' + k + '_night', fmt(p.night) + '/đêm');
    set('infoPrice' + k + '_day', fmt(p.day) + '/ngày');
  });
}
function fillPriceInputs() {
  if (typeof updatePriceCapInfo === 'function') updatePriceCapInfo();
  Object.keys(PRICE_KEYS).forEach(name => {
    const k = PRICE_KEYS[name], p = customPrices[name]; if (!p) return;
    ['hour', 'night', 'day'].forEach(t => {
      const el = document.getElementById('price' + k + '_' + t);
      if (el) el.value = p[t].toLocaleString('vi-VN');
    });
  });
}
document.querySelectorAll('.hotel-info-tab').forEach(tab => { 
  tab.onclick = () => { 
    // Đổi màu nút Tab
    document.querySelectorAll('.hotel-info-tab').forEach(t => { 
      t.classList.remove('active'); 
      t.classList.add('secondary'); 
    }); 
    tab.classList.add('active'); 
    tab.classList.remove('secondary'); 
    
    // Ẩn tất cả nội dung
    document.querySelectorAll('.hotel-info-content').forEach(c => c.style.display = 'none'); 
    
    // Hiển thị nội dung tab được chọn
    const targetId = 'hotel-info-' + tab.dataset.info; 
    document.getElementById(targetId).style.display = 'block'; 
    
    if (tab.dataset.info === 'info') { refreshHotelInfoPrices(); renderInfoVouchers(); }

    // CHƯA MUA -> HIỆN Ổ KHÓA, ẨN PHẦN NHẬP LIỆU
    if (tab.dataset.info === 'manage' && !isHotelOwner) {
      const mi = document.getElementById('manageInputs');
      const ml = document.getElementById('manageLock');
      if (mi) mi.style.display = 'none';
      if (ml) ml.style.display = 'flex';
    }

    // XỬ LÝ RIÊNG CHO TAB QUẢN LÝ (KHI ĐÃ MUA)
    if (tab.dataset.info === 'manage' && isHotelOwner) {
      // Đã mua -> Hiện phần nhập liệu, ẩn ổ khóa
      const manageInputs = document.getElementById('manageInputs');
      const manageLock = document.getElementById('manageLock');
      
      fillPriceInputs();
      setDefaultVoucherDates();
      renderVouchers();
      if (manageInputs) manageInputs.style.display = 'flex';
      if (manageLock) manageLock.style.display = 'none';
      
      // Điền tên cũ vào placeholder
      const inputHotelName = document.getElementById('inputHotelName');
      if (inputHotelName) {
        inputHotelName.value = ''; 
        inputHotelName.placeholder = hotelName; 
      }
    }
  }; 
});
