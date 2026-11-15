// ==========================================
// HỆ THỐNG CÀI ĐẶT, LƯU TẢI
// ==========================================
const bgmAudio = new Audio('art/bgm.mp3'); bgmAudio.loop = true; let isBGMPlaying = false;

document.getElementById('btnSettings').onclick = () => { if (document.getElementById('expandPanel').classList.contains('show')) return; isGamePaused = true; pauseStartTime = Date.now(); document.getElementById('settingsPanel').classList.add('show'); };
document.getElementById('closeSettingsBtn').onclick = () => {
  document.getElementById('settingsPanel').classList.remove('show'); if (isGamePaused) { isGamePaused = false; const pausedDuration = Date.now() - pauseStartTime; if (guestPatienceEndTime > 0) guestPatienceEndTime += pausedDuration; roomState.forEach(room => { if (room.status === 'Có khách' && room.checkOutTime > 0) room.checkOutTime += pausedDuration; }); if (cleaningRoomNumber !== null) cleaningEndTime += pausedDuration; pauseStartTime = 0; }
};
document.getElementById('backToMenuBtn').onclick = () => { autoSaveGame(); isGamePaused = true; location.reload(); };
document.getElementById('bgmVolume').oninput = (e) => { const vol = e.target.value / 100; bgmAudio.volume = vol; if (vol > 0 && !isBGMPlaying) { bgmAudio.play().catch(err => console.log(err)); isBGMPlaying = true; } };

function getGameData() { 
  return { 
    hotelMoney, playerMoney, totalRevenue, playerLevel, playerExp, maxExp, hotelRating, roomState,
    guestProfiles: guestProfiles,
    receiptHistory: receiptHistory, // Thêm dòng này
    diaryHistory: diaryHistory      // Thêm dòng này
  }; 
}

function createDailyBackup() { dailyGuestCount = 0; const backupData = { date: `${gameTime.getDate()}/${gameTime.getMonth() + 1}/${gameTime.getFullYear()}`, data: { hotelMoney, playerMoney, totalRevenue, playerLevel, playerExp, maxExp, hotelRating, roomState: JSON.parse(JSON.stringify(roomState)) } }; dailyBackups.push(backupData); if (dailyBackups.length > 3) dailyBackups.shift(); localStorage.setItem('sunriseHotel_DailyBackups', JSON.stringify(dailyBackups)); }
const savedBackups = localStorage.getItem('sunriseHotel_DailyBackups'); if (savedBackups) { dailyBackups = JSON.parse(savedBackups); }

function showCustomAlert(message, isConfirm = false, onConfirm = null) {
  document.getElementById('alertTitle').innerText = isConfirm ? "Xác nhận" : "Thông báo"; document.getElementById('alertMessage').innerHTML = message; const btnGroup = document.getElementById('alertBtnGroup');
  if (isConfirm) { btnGroup.innerHTML = `<button class="btn-base secondary" id="alertCancelBtn" style="flex:1; margin-right:5px; padding:10px;">Hủy</button><button class="btn-base" id="alertConfirmBtn" style="flex:1; padding:10px; background:#ef4444; box-shadow:0 4px 0 #991b1b;">Đồng ý</button>`; document.getElementById('alertCancelBtn').onclick = () => { document.getElementById('customAlertPanel').classList.remove('show'); }; document.getElementById('alertConfirmBtn').onclick = () => { document.getElementById('customAlertPanel').classList.remove('show'); if (onConfirm) onConfirm(); }; } 
  else { btnGroup.innerHTML = `<button class="btn-base" id="alertOkBtn" style="width:100%; padding:10px;">Đóng</button>`; document.getElementById('alertOkBtn').onclick = () => { document.getElementById('customAlertPanel').classList.remove('show'); }; }
  document.getElementById('customAlertPanel').classList.add('show');
}

function showCustomPrompt(title, message, defaultValue, onConfirm) {
  document.getElementById('promptInput').value = defaultValue; document.querySelector('#customPromptPanel h2').innerText = title; document.querySelector('#customPromptPanel p').innerText = message; document.getElementById('customPromptPanel').classList.add('show');
  document.getElementById('promptOkBtn').onclick = () => { document.getElementById('promptInput').select(); document.execCommand('copy'); showToast("Đã copy mã Code vào bộ nhớ tạm!"); document.getElementById('customPromptPanel').classList.remove('show'); if (onConfirm) onConfirm(); };
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
      hotelMoney, playerMoney, totalRevenue, playerLevel, playerExp, maxExp, hotelRating, roomState, 
      gameTime: gameTime.getTime(), 
      isHotelOwner,
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
          // Khởi tạo lại thời gian chờ dọn (60s)
          cleaningRoomNumber = roomState[idx].number;
          cleaningEndTime = Date.now() + cleaningMaxTime;
        }
      }
    } 
  }); 
}  
    
    updateMoneyUI(); 
    document.getElementById('hudLv').innerText = `Lv.${playerLevel}`; 
    document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`; 
    document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`; 
    document.getElementById('rating').innerText = hotelRating.toFixed(1); 
    updateClockUI(); 
    draw(); 
    showToast("Đã tải lại tiến trình đang chơi!"); 
  } catch (e) { console.log("Lỗi khi khôi phục Auto-Save:", e); }
}

function updateMenuInfo() {
  const autoSaved = localStorage.getItem('sunriseHotel_AutoSave');
  if (autoSaved) { try { const data = JSON.parse(autoSaved); document.getElementById('menuPlayerName').innerText = data.playerName || "Minh"; document.getElementById('menuPlayerLv').innerText = data.playerLevel || 1; if (data.gameTime !== undefined) { const d = new Date(data.gameTime); document.getElementById('menuPlayerTime').innerText = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; document.getElementById('menuPlayerDate').innerText = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`; } else { document.getElementById('menuPlayerTime').innerText = "00:00"; document.getElementById('menuPlayerDate').innerText = "01/01/2024"; } } catch (e) { console.log("Lỗi đọc file save ở Menu:", e); } } 
  else { document.getElementById('menuPlayerLv').innerText = "1"; document.getElementById('menuPlayerTime').innerText = "00:00"; document.getElementById('menuPlayerDate').innerText = "01/01/2024"; }
}

updateMenuInfo();

document.getElementById('menuLoadSaveBtn').onclick = () => { document.getElementById('settingsPanel').classList.add('show'); const dataSection = document.getElementById('settingsPanel').querySelector('.window'); if (dataSection) { dataSection.scrollTop = dataSection.scrollHeight; } };

function updateExpandButton() {
  const btn = document.getElementById('btnExpand'); const icon = document.getElementById('btnExpandIcon'); const text = document.getElementById('btnExpandText'); if (!btn || !icon || !text) return; 
  if (playerLevel >= 5) { btn.style.opacity = '1'; btn.style.cursor = 'pointer'; icon.innerText = '🏢'; text.innerText = 'Mở rộng'; text.style.fontSize = '13px'; text.style.fontWeight = 'bold'; } 
  else { btn.style.opacity = '0.6'; btn.style.cursor = 'not-allowed'; icon.innerText = '🔒'; text.innerText = 'Yêu cầu Lv.5'; text.style.fontSize = '10px'; text.style.fontWeight = 'normal'; }
}

document.getElementById('btnExpand').onclick = () => { if (playerLevel < 5) { showToast("Tính năng này sẽ mở khóa ở Cấp độ 5!"); return; } isGamePaused = true; pauseStartTime = Date.now(); document.getElementById('expandPanel').classList.add('show'); };
document.getElementById('closeExpandBtn').onclick = () => { document.getElementById('expandPanel').classList.remove('show'); if (isGamePaused) { isGamePaused = false; const pausedDuration = Date.now() - pauseStartTime; if (guestPatienceEndTime > 0) guestPatienceEndTime += pausedDuration; roomState.forEach(room => { if (room.status === 'Có khách' && room.checkOutTime > 0) room.checkOutTime += pausedDuration; }); if (cleaningRoomNumber !== null) cleaningEndTime += pausedDuration; pauseStartTime = 0; } };

document.querySelectorAll('.expand-tab').forEach(tab => { tab.onclick = () => { document.querySelectorAll('.expand-tab').forEach(t => { t.classList.remove('active'); t.classList.add('secondary'); }); tab.classList.add('active'); tab.classList.remove('secondary'); document.querySelectorAll('.expand-content').forEach(c => c.style.display = 'none'); const targetId = 'expand-' + tab.dataset.expand; document.getElementById(targetId).style.display = 'block'; }; });

document.getElementById('buyHotelBtn').onclick = () => { if (isHotelOwner) { showToast("Bạn đã là chủ sở hữu của Sunrise Hotel rồi!"); return; } document.getElementById('buyPanelMyMoney').innerText = playerMoney.toLocaleString('vi-VN') + 'đ'; document.getElementById('buyPanelError').style.display = 'none'; document.getElementById('buyHotelPanel').classList.add('show'); };
document.getElementById('cancelBuyBtn').onclick = () => { document.getElementById('buyHotelPanel').classList.remove('show'); };

document.getElementById('confirmBuyBtn').onclick = () => {
  const PRICE = 1300000000;
  if (playerMoney >= PRICE) { playerMoney -= PRICE; isHotelOwner = true; updateMoneyUI(); autoSaveGame(); updateOwnerUI(); document.getElementById('buyHotelPanel').classList.remove('show'); document.getElementById('expandPanel').classList.remove('show'); showCustomAlert(`<div style="text-align:center;"><div style="font-size:50px; margin-bottom:10px;">🎉</div><h3 style="color:#d97706; font-size:18px; margin-bottom:10px;">CHÚC MỪNG ÔNG CHỦ!</h3><p style="font-size:14px; color:#1e3a52; font-weight:bold;">Bạn đã chính thức trở thành chủ sở hữu của <b>Sunrise Hotel</b>.</p><p style="font-size:13px; color:#2c6e9e; margin-top:5px; font-weight:bold;">Các tính năng <b>Quản lý</b> đã được mở khóa!</p></div>`); } 
  else { document.getElementById('buyPanelError').style.display = 'block'; }
};

document.querySelectorAll('#expand-inside button')[0].onclick = () => { document.getElementById('infoRating').innerText = hotelRating.toFixed(1) + " ⭐"; document.getElementById('infoTraffic').innerText = (dailyGuestCount * 3) + " khách/ngày"; document.getElementById('hotelInfoPanel').classList.add('show'); };
document.getElementById('closeHotelInfoBtn').onclick = () => { document.getElementById('hotelInfoPanel').classList.remove('show'); };
document.querySelectorAll('.hotel-info-tab').forEach(tab => { tab.onclick = () => { document.querySelectorAll('.hotel-info-tab').forEach(t => { t.classList.remove('active'); t.classList.add('secondary'); }); tab.classList.add('active'); tab.classList.remove('secondary'); document.querySelectorAll('.hotel-info-content').forEach(c => c.style.display = 'none'); const targetId = 'hotel-info-' + tab.dataset.info; document.getElementById(targetId).style.display = 'block'; }; });

document.querySelectorAll('#expand-inside button')[1].onclick = () => { const currentName = document.getElementById('inputName') ? document.getElementById('inputName').value : "Minh"; const currentAge = document.getElementById('inputAge') ? document.getElementById('inputAge').value : "25"; document.getElementById('staffReceptionistName').innerText = currentName; document.getElementById('staffReceptionistAge').innerText = currentAge; document.getElementById('staffPanel').classList.add('show'); };
document.getElementById('closeStaffBtn').onclick = () => { document.getElementById('staffPanel').classList.remove('show'); };
document.querySelectorAll('.staff-tab').forEach(tab => { tab.onclick = () => { document.querySelectorAll('.staff-tab').forEach(t => { t.classList.remove('active'); t.classList.add('secondary'); }); tab.classList.add('active'); tab.classList.remove('secondary'); document.querySelectorAll('.staff-content').forEach(c => c.style.display = 'none'); const targetId = 'staff-info-' + tab.dataset.staff; document.getElementById(targetId).style.display = 'block'; }; });

function updateOwnerUI() {
  const hotelManageTab = document.querySelector('.hotel-info-tab[data-info="manage"]'); if (hotelManageTab) { if (isHotelOwner) { hotelManageTab.innerHTML = "Quản lý (Đã mở)"; hotelManageTab.style.background = '#22c55e'; hotelManageTab.style.boxShadow = '0 4px 0 #166534'; } else { hotelManageTab.innerHTML = "Quản lý"; hotelManageTab.style.background = ''; hotelManageTab.style.boxShadow = ''; } }
  const staffManageTab = document.querySelector('.staff-tab[data-staff="manage"]'); if (staffManageTab) { if (isHotelOwner) { staffManageTab.innerHTML = "Quản lý (Đã mở)"; staffManageTab.style.background = '#22c55e'; staffManageTab.style.boxShadow = '0 4px 0 #166534'; } else { staffManageTab.innerHTML = "Quản lý"; staffManageTab.style.background = ''; staffManageTab.style.boxShadow = ''; } }
  const buyBtn = document.getElementById('buyHotelBtn'); if (buyBtn && isHotelOwner) { buyBtn.innerHTML = '<b>👑 Bạn đã sở hữu khách sạn</b><br><span style="font-size:12px; font-weight:normal; opacity:0.9;">Quản lý mọi hoạt động của Sunrise Hotel.</span>'; buyBtn.style.background = 'linear-gradient(135deg, #fbbf24, #d97706)'; buyBtn.style.boxShadow = '0 4px 0 #92400e'; buyBtn.style.color = '#fff'; buyBtn.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)'; buyBtn.style.cursor = 'default'; buyBtn.style.pointerEvents = 'none'; }
}

setInterval(autoSaveGame, 10000);
window.addEventListener('beforeunload', () => { autoSaveGame(); });