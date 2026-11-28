// ==========================================
// HỆ THỐNG: quản lý khách sạn (tên, bảng giá)
// ==========================================
// --- QUẢN LÝ KHÁCH SẠN (MỞ RỘNG) ---

// 1. Đổi tên khách sạn
document.getElementById('saveHotelNameBtn').onclick = () => {
  if (!isHotelOwner) {
    showUiToast("Bạn cần mua lại khách sạn để thực hiện chức năng này!");
    return;
  }
  
  const newName = document.getElementById('inputHotelName').value.trim();
  
  if (newName !== "") {
    hotelName = newName;
    
    // 1. Cập nhật thanh Header trên cùng
    document.getElementById('hudHotelName').innerText = hotelName.toUpperCase();
    
    // 2. Cập nhật ở bảng Thông tin khách sạn (Tab Thông tin)
    const infoHotelNameEl = document.getElementById('infoHotelName');
    if (infoHotelNameEl) infoHotelNameEl.innerText = hotelName.toUpperCase();

    // Cập nhật lại placeholder và xóa ô nhập
    document.getElementById('inputHotelName').value = ''; 
    document.getElementById('inputHotelName').placeholder = hotelName;
    
    showUiToast("Đã đổi tên khách sạn!");
    autoSaveGame();
  } else {
    showUiToast("Tên khách sạn không được để trống!");
  }
};

// 2. Lưu bảng giá
document.getElementById('savePricesBtn').onclick = () => {
  if (!isHotelOwner) return;
  
  const getVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseInt(el.value.replace(/\./g, '')) || 0;
  };

  const newPrices = {
    "Phòng Đơn": { hour: getVal('priceDon_hour'), night: getVal('priceDon_night'), day: getVal('priceDon_day') },
    "Phòng Đôi": { hour: getVal('priceDoi_hour'), night: getVal('priceDoi_night'), day: getVal('priceDoi_day') },
    "Phòng VIP": { hour: getVal('priceVip_hour'), night: getVal('priceVip_night'), day: getVal('priceVip_day') },
    "Phòng Lãng Mạn": { hour: getVal('priceLangMan_hour'), night: getVal('priceLangMan_night'), day: getVal('priceLangMan_day') },
    "Phòng Tổng Thống": { hour: getVal('priceTongThong_hour'), night: getVal('priceTongThong_night'), day: getVal('priceTongThong_day') }
  };
  // Giá không được vượt mức tối đa theo số sao hiện tại của khách sạn
  const capError = validatePriceCaps(newPrices);
  if (capError) { showCustomAlert('Không thể lưu bảng giá!<br><br>' + capError + '<br><br>Hãy hạ giá xuống hoặc nâng sao khách sạn để được đặt giá cao hơn.'); return; }
  Object.keys(newPrices).forEach(name => { customPrices[name] = newPrices[name]; });

  refreshHotelInfoPrices();
  showUiToast("Đã cập nhật bảng giá mới!");
  autoSaveGame();
};
