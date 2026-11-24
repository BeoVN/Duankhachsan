// ==========================================
// HỆ THỐNG: cài đặt, lưu & tải game
// ==========================================
// ==========================================
// HỆ THỐNG CÀI ĐẶT, LƯU TẢI
// ==========================================
const bgmAudio = new Audio('art/bgm.mp3'); bgmAudio.loop = true; let isBGMPlaying = false;

// Hàm hiển thị Toast cho Cài đặt/Mở rộng
function showUiToast(t) {
  const uiToast = document.getElementById('uiToast');
  if (!uiToast) return;
  
  uiToast.textContent = t; 
  uiToast.style.display = 'block'; 
  
  if (window.uiToastTimer) clearTimeout(window.uiToastTimer);
  window.uiToastTimer = setTimeout(() => { 
    uiToast.style.display = 'none'; 
  }, 2500);
}



function getGameData() { 
  return { 
    hotelMoney, playerMoney, totalRevenue, playerLevel, playerExp, maxExp, hotelRating, roomState,
    guestProfiles, receiptHistory, diaryHistory, internalMessages: internalMessages
  }; 
}

function createDailyBackup() { payStaffSalaries(); dailyGuestCount = 0; const backupData = { date: `${gameTime.getDate()}/${gameTime.getMonth() + 1}/${gameTime.getFullYear()}`, data: { hotelMoney, playerMoney, totalRevenue, playerLevel, playerExp, maxExp, hotelRating, roomState: JSON.parse(JSON.stringify(roomState)) } }; dailyBackups.push(backupData); if (dailyBackups.length > 3) dailyBackups.shift(); localStorage.setItem('sunriseHotel_DailyBackups', JSON.stringify(dailyBackups)); }
const savedBackups = localStorage.getItem('sunriseHotel_DailyBackups'); if (savedBackups) { dailyBackups = JSON.parse(savedBackups); }

function showCustomAlert(message, isConfirm = false, onConfirm = null) {
  document.getElementById('alertTitle').innerText = isConfirm ? "Xác nhận" : "Thông báo"; document.getElementById('alertMessage').innerHTML = message; const btnGroup = document.getElementById('alertBtnGroup');
  if (isConfirm) { btnGroup.innerHTML = `<button class="btn-base secondary" id="alertCancelBtn" style="flex:1; margin-right:5px; padding:10px;">Hủy</button><button class="btn-base" id="alertConfirmBtn" style="flex:1; padding:10px; background:#ef4444; box-shadow:0 4px 0 #991b1b;">Đồng ý</button>`; document.getElementById('alertCancelBtn').onclick = () => { document.getElementById('customAlertPanel').classList.remove('show'); }; document.getElementById('alertConfirmBtn').onclick = () => { document.getElementById('customAlertPanel').classList.remove('show'); if (onConfirm) onConfirm(); }; } 
  else { btnGroup.innerHTML = `<button class="btn-base" id="alertOkBtn" style="width:100%; padding:10px;">Đóng</button>`; document.getElementById('alertOkBtn').onclick = () => { document.getElementById('customAlertPanel').classList.remove('show'); }; }
  document.getElementById('customAlertPanel').classList.add('show');
}

function showCustomPrompt(title, message, defaultValue, onConfirm) {
  document.getElementById('promptInput').value = defaultValue; document.querySelector('#customPromptPanel h2').innerText = title; document.querySelector('#customPromptPanel p').innerText = message; document.getElementById('customPromptPanel').classList.add('show');
  document.getElementById('promptOkBtn').onclick = () => { document.getElementById('promptInput').select(); document.execCommand('copy'); showUiToast("Đã copy mã Code vào bộ nhớ tạm!"); document.getElementById('customPromptPanel').classList.remove('show'); if (onConfirm) onConfirm(); };
  document.getElementById('promptCancelBtn').onclick = () => { document.getElementById('customPromptPanel').classList.remove('show'); };
}

function autoSaveGame() {
  if (!isGameStarted) return; 
  try {
    const currentName = document.getElementById('inputName') ? document.getElementById('inputName').value : "Minh";
    const data = { 
      guestProfiles: guestProfiles,
      receiptHistory: receiptHistory,
      diaryHistory: diaryHistory,
      messagesHistory: messagesHistory,
      playerName: currentName,
      hotelName: hotelName, 
      hotelMoney, 
      playerMoney, 
      totalRevenue, 
      playerLevel, 
      playerExp, 
      maxExp, 
      hotelRating, 
      roomState, 
      gameTime: gameTime.getTime(), 
      isHotelOwner, 
      customPrices, 
      activeVouchers,
      staffList,
      reviewSum, reviewCount, guestReviews, totalExpenses, staffPayrollDay,
      receiptHistory: receiptHistory.slice(-150),
      internalMessages: internalMessages,
      saveTimestamp: Date.now() // LƯU THỜI ĐIỂM THỰC TẾ LÚC LƯU GAME
    };
    localStorage.setItem('sunriseHotel_AutoSave', JSON.stringify(data)); 
  } catch (e) { console.log("Lỗi khi lưu Auto-Save:", e); }
}

function loadAutoSave() {
  const autoSaved = localStorage.getItem('sunriseHotel_AutoSave'); 
  if (!autoSaved) return; 
  try { 
    const data = JSON.parse(autoSaved); 
    
    // Khôi phục thông tin cơ bản
    if (data.playerName) { 
      document.getElementById('inputName').value = data.playerName; 
      document.getElementById('hudName').innerHTML = '👤 ' + data.playerName; 
    } 
  if (data.hotelName) { 
  hotelName = data.hotelName; 
  document.getElementById('hudHotelName').innerText = hotelName.toUpperCase();
  const infoHotelNameEl = document.getElementById('infoHotelName');
  if (infoHotelNameEl) infoHotelNameEl.innerText = hotelName.toUpperCase();
}
    if (data.guestProfiles !== undefined) guestProfiles = data.guestProfiles;
    if (data.receiptHistory !== undefined) receiptHistory = data.receiptHistory;
    if (data.diaryHistory !== undefined) diaryHistory = data.diaryHistory;
    if (data.messagesHistory !== undefined) messagesHistory = data.messagesHistory;
    if (data.isHotelOwner !== undefined) isHotelOwner = data.isHotelOwner; 
    if (data.hotelMoney !== undefined) hotelMoney = data.hotelMoney; 
    if (data.playerMoney !== undefined) playerMoney = data.playerMoney; 
    if (data.totalRevenue !== undefined) totalRevenue = data.totalRevenue; 
    if (data.playerLevel !== undefined) playerLevel = data.playerLevel; 
    if (data.playerExp !== undefined) playerExp = data.playerExp; 
    if (data.maxExp !== undefined) maxExp = data.maxExp; 
    if (data.hotelRating !== undefined) hotelRating = data.hotelRating; 
    if (data.gameTime !== undefined) { gameTime = new Date(data.gameTime); } 
    if (data.internalMessages !== undefined) internalMessages = data.internalMessages;
    if (data.hotelName) hotelName = data.hotelName; 
    if (data.customPrices) customPrices = data.customPrices; 
    if (data.activeVouchers) activeVouchers = data.activeVouchers;
    if (data.staffList) { staffList = data.staffList; }
    if (data.reviewCount !== undefined) { reviewSum = data.reviewSum || 0; reviewCount = data.reviewCount || 0; guestReviews = data.guestReviews || []; fixAnonymousReviews(); if (reviewCount > 0) hotelRating = reviewSum / reviewCount; }
    if (data.totalExpenses !== undefined) totalExpenses = data.totalExpenses;
    if (data.staffPayrollDay !== undefined) staffPayrollDay = data.staffPayrollDay;
    if (Array.isArray(data.receiptHistory)) receiptHistory = data.receiptHistory;
    ensureStaffStats(); syncStaffStatus();
    
    // TÍNH TOÁN BÙ THỜI GIAN PHÒNG
if (data.roomState && data.roomState.length > 0) { 
  const timePassed = data.saveTimestamp ? (Date.now() - data.saveTimestamp) : 0;
  
  data.roomState.forEach((savedRoom, idx) => { 
    if (roomState[idx]) { 
      roomState[idx] = savedRoom; 
      
      if (roomState[idx].status === 'Có khách' && roomState[idx].checkOutTime > 0) {
        // Cập nhật lại thời gian trả phòng theo thời gian thực tế đã trôi qua
        roomState[idx].checkOutTime = roomState[idx].checkOutTime - timePassed;
        
        // Nếu đã quá thời gian trả phòng
        if (Date.now() >= roomState[idx].checkOutTime) {
          roomState[idx].status = 'Cần dọn';
          roomState[idx].checkOutTime = 0;
          addGuestReview(roomState[idx].reviewStars || 5, { room: roomState[idx].number, guest: reviewGuestFromRoom(roomState[idx]), recId: roomState[idx].reviewRecId, recName: roomState[idx].reviewRecName }); roomState[idx].reviewStars = 0; roomState[idx].reviewGuest = null; roomState[idx].reviewRecId = ''; roomState[idx].reviewRecName = '';
          // Khởi tạo lại thời gian chờ dọn (60s)
          cleaningRoomNumber = roomState[idx].number;
          cleaningEndTime = Date.now() + cleaningMaxTime;
        }
      }
    } 
  }); 
}  
    updateReceiptSummary();
    document.getElementById('dash-occupied').innerText = occupiedRooms + ' / 30';
    updateMoneyUI(); 
    document.getElementById('hudLv').innerText = `Lv.${playerLevel}`; 
    document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`; 
    document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`; 
    document.getElementById('rating').innerText = hotelRating.toFixed(1); 
    updateClockUI(); 
    draw(); 
    showUiToast("Đã tải lại tiến trình đang chơi!"); 
  } catch (e) { console.log("Lỗi khi khôi phục Auto-Save:", e); }
}

function updateMenuInfo() {
  const autoSaved = localStorage.getItem('sunriseHotel_AutoSave');
  if (autoSaved) { try { const data = JSON.parse(autoSaved); document.getElementById('menuPlayerName').innerText = data.playerName || "Minh"; document.getElementById('menuPlayerLv').innerText = data.playerLevel || 1; if (data.gameTime !== undefined) { const d = new Date(data.gameTime); document.getElementById('menuPlayerTime').innerText = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; document.getElementById('menuPlayerDate').innerText = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`; } else { document.getElementById('menuPlayerTime').innerText = "00:00"; document.getElementById('menuPlayerDate').innerText = "01/01/2024"; } } catch (e) { console.log("Lỗi đọc file save ở Menu:", e); } } 
  else { document.getElementById('menuPlayerLv').innerText = "1"; document.getElementById('menuPlayerTime').innerText = "00:00"; document.getElementById('menuPlayerDate').innerText = "01/01/2024"; }
}

updateMenuInfo();
