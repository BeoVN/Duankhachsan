function initUI() {
  // 1. Bộ đếm 5 giây đổi vị trí khách
  setInterval(() => {
    let changed = false; const positions = ['bed', 'desk', 'center']; 
    roomState.forEach(room => { if (room.status === 'Có khách') { room.guestPos = positions[Math.floor(Math.random() * positions.length)]; changed = true; } });
    if (changed && currentFloor !== 1) { draw(); }
  }, 5000); 

  // 2. Sự kiện chạm vào phòng
  canvas.addEventListener('click', (e) => {
    if (currentFloor === 1 || currentFloor === 0) return; 
    const rect = canvas.getBoundingClientRect(); const scaleX = 960 / rect.width; const scaleY = 600 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX; const clickY = (e.clientY - rect.top) * scaleY;
    const roomW = 250; const roomH = 150; const startY = 70; const gap = 15;
    for(let i=0; i<3; i++){
      let x = 360 - roomW - 30; let y = startY + i * (roomH + gap);
      if (clickX >= x && clickX <= x + roomW && clickY >= y && clickY <= y + roomH) { handleRoomClick((currentFloor * 100) + i + 1); return; }
      x = 360 + 240 + 30; y = startY + i * (roomH + gap);
      if (clickX >= x && clickX <= x + roomW && clickY >= y && clickY <= y + roomH) { handleRoomClick((currentFloor * 100) + 4 + i); return; }
    }
  });

  // 3. Nút Bắt đầu
  document.getElementById('startBtn').onclick = () => { 
    const menu = document.getElementById('mainMenu'); if (menu) menu.remove(); 
    isGameStarted = true; isGamePaused = false; loadAutoSave(); 
    if (typeof updateExpandButton === 'function') updateExpandButton(); 
    if (typeof updateOwnerUI === 'function') updateOwnerUI(); 
    resizeAll();
  };
  
  setInterval(() => { if (isGamePaused) return; spawnGuest(); }, 15000); 
  setTimeout(spawnGuest, 500); 
  
  document.getElementById('chatActionBtn').onclick = handleChatAction;
  
  // 5. Nút Mở Máy Tính Từ Hội Thoại
  document.getElementById('openComputerFromChatBtn').onclick = () => {
    document.getElementById('computerTabs').style.display = 'none'; document.getElementById('guestSummaryBox').style.display = 'block'; document.getElementById('confirmRegisterBtn').style.display = 'block'; document.getElementById('showBillBtn').style.display = 'none'; document.getElementById('closeComputer').style.display = 'none'; 
    document.getElementById('chatBox').style.display = 'none'; document.getElementById('openComputerFromChatBtn').style.display = 'none'; document.getElementById('computerPanel').classList.add('show'); 
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active')); document.querySelector('.tab[data-tab="register"]').classList.add('active'); document.getElementById('tab-register').classList.add('active');
  };

  // 6. Nút Đối Chiếu
  document.getElementById('confirmRegisterBtn').onclick = () => {
    const size = currentGuest ? currentGuest.guests.length : 1; let isValid = true;
    currentGuest.guests.forEach((g, index) => { const p = index + 1; if (!document.getElementById(`f${size}_p${p}_name`).value || !document.getElementById(`f${size}_p${p}_age`).value) { isValid = false; } });
    if (!isValid) { showToast("Vui lòng kiểm tra lại Tên và Tuổi của tất cả khách!"); return; }
    showToast("Đối chiếu thành công! Vui lòng bấm Xem Hóa Đơn."); document.getElementById('showBillBtn').style.display = 'block'; document.getElementById('confirmRegisterBtn').style.display = 'none'; 
  };

  document.getElementById('showBillBtn').onclick = generateBill;

  // 8. Nút In Hóa Đơn & Đưa Khách
  document.getElementById('payBillBtn').onclick = () => {
    if (!currentBillData) return;
    document.getElementById('billPanel').classList.remove('show'); document.getElementById('computerPanel').classList.remove('show'); 
    document.getElementById('chatBox').style.display = 'block'; document.getElementById('chatActionBtn').style.display = 'none'; 
    let guestPronoun = getPronoun(currentGuest.guests[0]); let repPronoun = currentGuest.guests.length > 1 ? "Chúng tôi" : (guestPronoun.charAt(0).toUpperCase() + guestPronoun.slice(1));
    addChatMessage("Lễ tân", `Dạ ${guestPronoun} cầm hóa đơn giúp em ạ.`, '#e67e22', 'right');
    setTimeout(() => {
      addChatMessage("Người đại diện", `${repPronoun} cảm ơn.`, '#1e3a52', 'left');
      setTimeout(() => {
        addChatMessage("Lễ tân", `Dạ ${guestPronoun} muốn thanh toán bằng tiền mặt hay quét mã QR ạ?`, '#e67e22', 'right');
        setTimeout(() => {
          const isCash = Math.random() > 0.5; 
          if (isCash) { addChatMessage("Người đại diện", `${repPronoun} thanh toán bằng tiền mặt.`, '#1e3a52', 'left'); document.getElementById('cashDrawerBtn').style.display = 'block'; showToast("Hãy chạm vào Két sắt để thu tiền!"); } 
          else { addChatMessage("Người đại diện", `${repPronoun} quét mã QR.`, '#1e3a52', 'left'); document.getElementById('qrBtn').style.display = 'block'; showToast("Hãy chạm vào mã QR trên quầy để khách quét!"); }
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // 9. Nút Máy Tính Ở Quầy
  computerBtn.onclick = () => { 
    document.getElementById('computerTabs').style.display = 'flex'; document.getElementById('guestSummaryBox').style.display = 'none'; document.getElementById('confirmRegisterBtn').style.display = 'none'; document.getElementById('showBillBtn').style.display = 'none'; document.getElementById('closeComputer').style.display = 'block'; 
    renderRoomGrid('dash-room-grid'); document.getElementById('computerPanel').classList.add('show'); 
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active')); document.querySelector('.tab[data-tab="dashboard"]').classList.add('active'); document.getElementById('tab-dashboard').classList.add('active');
  };

  document.getElementById('closeComputer').onclick = () => { document.getElementById('computerPanel').classList.remove('show'); };

  // 11. Chuyển Đổi Giữa Các Tab
  document.querySelectorAll('.tab').forEach(t=>{ 
    t.onclick = () => { 
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active')); t.classList.add('active'); document.getElementById('tab-'+t.dataset.tab).classList.add('active'); 
      if(t.dataset.tab === 'register') { document.getElementById('confirmRegisterBtn').style.display = 'block'; document.getElementById('showBillBtn').style.display = 'none'; document.getElementById('closeComputer').style.display = 'none'; if (currentGuest) { document.getElementById('guestSummaryBox').style.display = 'block'; } } 
      else { document.getElementById('confirmRegisterBtn').style.display = 'none'; document.getElementById('showBillBtn').style.display = 'none'; document.getElementById('closeComputer').style.display = 'block'; document.getElementById('guestSummaryBox').style.display = 'none'; }
    }; 
  });

  // 12. Logic Két Tính Tiền
  document.getElementById('cashDrawerBtn').onclick = () => {
    document.getElementById('cashDrawerBtn').style.display = 'none'; document.getElementById('chatBox').style.display = 'none';
    const total = currentBillData.total; let given = total; const rand = Math.random();
    if (rand < 0.4) given = total; else if (rand < 0.7) given = Math.ceil(total / 10000) * 10000; else given = Math.ceil(total / 100000) * 100000;
    if (given < total) given = total;
    window.currentChangeNeeded = given - total; window.currentChangeGiven = 0; 
    document.getElementById('cashTotal').innerText = total.toLocaleString('vi-VN') + 'đ'; document.getElementById('cashGiven').innerText = given.toLocaleString('vi-VN') + 'đ'; document.getElementById('cashChange').innerText = '0đ';
    const confirmBtn = document.getElementById('confirmCashBtn'); const missingEl = document.getElementById('cashMissing'); missingEl.style.display = 'block';
    if (window.currentChangeNeeded === 0) { missingEl.innerText = `Còn thiếu: 0đ`; missingEl.style.color = '#4ade80'; confirmBtn.style.background = '#22c55e'; confirmBtn.style.boxShadow = '0 4px 0 #166534'; confirmBtn.style.pointerEvents = 'auto'; confirmBtn.innerText = "Thanh toán"; } 
    else { missingEl.innerText = `Còn thiếu: ${window.currentChangeNeeded.toLocaleString('vi-VN')}đ`; missingEl.style.color = '#ef4444'; confirmBtn.style.background = '#ccc'; confirmBtn.style.boxShadow = '0 4px 0 #999'; confirmBtn.style.pointerEvents = 'none'; confirmBtn.innerText = "Chưa đủ tiền"; }
    document.getElementById('cashierPanel').classList.add('show');
  };

  document.querySelectorAll('.money-btn').forEach(btn => {
    btn.onclick = () => {
      const val = parseInt(btn.dataset.value); window.currentChangeGiven += val; 
      document.getElementById('cashChange').innerText = window.currentChangeGiven.toLocaleString('vi-VN') + 'đ';
      const difference = window.currentChangeNeeded - window.currentChangeGiven; const confirmBtn = document.getElementById('confirmCashBtn'); const missingEl = document.getElementById('cashMissing'); missingEl.style.display = 'block'; 
      if (difference > 0) { missingEl.innerText = `Còn thiếu: ${difference.toLocaleString('vi-VN')}đ`; missingEl.style.color = '#ef4444'; confirmBtn.style.background = '#ccc'; confirmBtn.style.boxShadow = '0 4px 0 #999'; confirmBtn.style.pointerEvents = 'none'; confirmBtn.innerText = "Chưa đủ tiền"; } 
      else { missingEl.innerText = `Còn thiếu: 0đ`; missingEl.style.color = '#4ade80'; confirmBtn.style.background = '#22c55e'; confirmBtn.style.boxShadow = '0 4px 0 #166534'; confirmBtn.style.pointerEvents = 'auto'; confirmBtn.innerText = "Thanh toán"; }
    };
  });

  document.getElementById('resetCashBtn').onclick = () => {
    window.currentChangeGiven = 0; document.getElementById('cashChange').innerText = '0đ';
    const missingEl = document.getElementById('cashMissing'); const confirmBtn = document.getElementById('confirmCashBtn'); missingEl.style.display = 'block';
    if (window.currentChangeNeeded === 0) { missingEl.innerText = `Còn thiếu: 0đ`; missingEl.style.color = '#4ade80'; confirmBtn.style.background = '#22c55e'; confirmBtn.style.boxShadow = '0 4px 0 #166534'; confirmBtn.style.pointerEvents = 'auto'; confirmBtn.innerText = "Thanh toán"; } 
    else { missingEl.innerText = `Còn thiếu: ${window.currentChangeNeeded.toLocaleString('vi-VN')}đ`; missingEl.style.color = '#ef4444'; confirmBtn.style.background = '#ccc'; confirmBtn.style.boxShadow = '0 4px 0 #999'; confirmBtn.style.pointerEvents = 'none'; confirmBtn.innerText = "Chưa đủ tiền"; }
  };

  document.getElementById('confirmCashBtn').onclick = () => {
    document.getElementById('cashierPanel').classList.remove('show'); document.getElementById('chatBox').style.display = 'block';
    addChatMessage("Lễ tân", "Cảm ơn bạn, tôi đã nhận đủ tiền và thối lại.", '#e67e22', 'right');
    setTimeout(() => { finishPayment(); }, 500);
  };

  document.getElementById('qrBtn').onclick = () => {
    document.getElementById('qrBtn').style.display = 'none'; addChatMessage("Lễ tân", "Đã nhận được thanh toán qua mã QR.", '#e67e22', 'right'); showToast("Đang xử lý thanh toán...");
    setTimeout(() => { finishPayment(); }, 1000);
  };

  // 13. Các sự kiện khác
  document.getElementById('openCalendarBtn').onclick = () => { currentMonth = gameTime.getMonth(); currentYear = gameTime.getFullYear(); renderCalendar(); document.getElementById('calendarPanel').classList.add('show'); };
  document.getElementById('closeCalendar').onclick = () => document.getElementById('calendarPanel').classList.remove('show');
  document.getElementById('closeGuide').onclick = () => document.getElementById('guidePanel').classList.remove('show');
  document.getElementById('guideBtn').onclick = () => { document.getElementById('panelTitle').innerText = "📖 HƯỚNG DẪN CHƠI"; document.getElementById('panelContent').innerHTML = `<ul><li><b>Đón khách:</b> Đợi khách đến, hội thoại tự động mở.</li><li><b>Máy tính:</b> Đối chiếu thông tin và xuất Bill.</li></ul>`; document.getElementById('guidePanel').classList.add('show'); };
  document.getElementById('updateBtn').onclick = showChangelog;

  // 14. Kệ Chìa Khóa
  keysBtn.onclick = () => { renderRoomGrid('rooms'); document.getElementById('keyPanel').classList.add('show'); };
  document.getElementById('closeKey').onclick = () => document.getElementById('keyPanel').classList.remove('show');
  
  document.querySelectorAll('.rent-type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.rent-type-btn').forEach(b => { b.style.background = '#fff'; b.style.borderColor = '#ccc'; b.style.fontWeight = 'normal'; });
      btn.style.background = '#ffe29a'; btn.style.borderColor = '#bd792e'; btn.style.fontWeight = 'bold'; selectedRentType = btn.dataset.type; updateRentPriceDisplay();
    };
  });

  function updateRentPriceDisplay() {
    if (!currentGuest) return; const prices = ROOM_PRICES[currentGuest.reqType]; if (!prices) return;
    let price = prices[selectedRentType]; let multiplier = 1, discount = 0; const size = currentGuest.guests.length;
    if (size === 2) { multiplier = 2; discount = 0.1; } else if (size === 3) { multiplier = 3; discount = 0.2; } else if (size === 4) { multiplier = 4; discount = 0.3; }
    price = price * multiplier * (1 - discount); document.getElementById('rentPriceDisplay').innerText = price.toLocaleString('vi-VN') + 'đ';
  }

  // 15. Nút Nhận Phòng
  document.getElementById('takeKey').onclick = () => { 
    const roomIndex = selectedRoom - 1; const room = roomState[roomIndex];
    if (!currentBillData) { showToast("Vui lòng thanh toán trước khi nhận phòng!"); return; }
    if (`Phòng ${room.number}` !== currentBillData.room) { showToast(`Khách đã thanh toán ${currentBillData.room}. Vui lòng chọn đúng phòng!`); return; }
    if (room.status === 'Có khách') { showToast('Phòng này đang có khách rồi!'); return; }
    if (room.status === 'Cần dọn') { showToast('Phòng này đang cần dọn dẹp!'); return; }

    room.status = 'Có khách'; room.guests = currentGuest.guests; room.stayHours = currentGuest.stayHours; room.guestPos = 'center';
    room.checkOutTime = Date.now() + (currentGuest.stayHours * 12 * 1000); occupiedRooms++;
    const checkInDiv = document.getElementById('diaryCheckIn'); if (checkInDiv.innerHTML.includes('Chưa có dữ liệu')) checkInDiv.innerHTML = '';
    const logTimeStr = `${gameTime.getHours().toString().padStart(2, '0')}:${gameTime.getMinutes().toString().padStart(2, '0')} - ${gameTime.getDate()}/${gameTime.getMonth() + 1}`;
    checkInDiv.insertAdjacentHTML('afterbegin', `<div style="padding:5px; border-bottom:1px dashed #ccc;"><b>Phòng ${room.number}</b> - ${logTimeStr}</div>`);
    document.getElementById('keyPanel').classList.remove('show'); document.getElementById('computerPanel').classList.remove('show'); 
    document.getElementById('regRoom').value = ''; document.getElementById('regTimeIn').value = ''; document.getElementById('regTimeOut').value = '';
    document.getElementById('takeKey').disabled = true; document.getElementById('takeKey').style.opacity = '0.5';

    draw(); showToast(`Đã nhận phòng ${room.number} thành công!`);
    const targetRoomNumber = room.number; const guestGroupToGuide = currentGuest.guests; 
    document.getElementById('chatBox').style.display = 'block';
    addChatMessage("Lễ tân", `Dạ đây là chìa khóa phòng ${room.number}.`, '#e67e22', 'right');

    setTimeout(() => {
      if (typeof guideGuestState === 'undefined' || guideGuestState === 'none') {
        addChatMessage("Nhân viên dẫn khách", `Vâng, tôi sẽ đưa quý khách lên phòng ${room.number} ngay ạ.`, '#1e3a52', 'left');
        guideGuestState = 'to_room'; guidePosX = 480; guidePosY = 80; guideTargetRoom = targetRoomNumber; window.tempGuestsForDrawing = guestGroupToGuide; guidePathHistory = []; 
        currentGuest = null; currentBillData = null;
        setTimeout(() => { document.getElementById('chatBox').style.display = 'none'; document.getElementById('keyPanel').classList.remove('show'); document.getElementById('computerPanel').classList.remove('show'); draw(); }, 2000);
      } else {
        addChatMessage("Lễ tân", `Dẫn khách hiện đang bận. Vui lòng chờ dẫn khách để được đưa lên phòng ạ.`, '#e67e22', 'right');
        pendingGuestForGuide = { room: targetRoomNumber, guests: guestGroupToGuide };
        currentGuest = null; currentBillData = null;
        document.getElementById('keyPanel').classList.remove('show'); document.getElementById('computerPanel').classList.remove('show'); 
      }
    }, 1500);
  };

  // 16. Thanh Điều Hướng Dưới Cùng
  navBtns.forEach(btn => {
    btn.onclick = () => {
      if (btn.id === 'btnExpand') { if (playerLevel < 5) { showToast("Tính năng này sẽ mở khóa ở Cấp độ 5!"); } else { document.getElementById('expandPanel').classList.add('show'); } return; }
      navBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
      if (btn.id === 'btnLobby') { currentFloor = 1; draw(); toast.style.display = 'none'; clearTimeout(toastTimer); if (currentGuest && document.getElementById('chatBox').style.display === 'none') { startConversation(); } }
      else if (btn.id === 'btnElevator') { document.querySelectorAll('.elev-btn[data-floor]').forEach(eb => { const tag = eb.querySelector('.current-tag'); if(tag) tag.style.display = (parseInt(eb.dataset.floor) === currentFloor) ? 'inline-block' : 'none'; }); document.getElementById('elevatorPanel').classList.add('show'); }
      else if (btn.id === 'btnProfile') { document.getElementById('computerPanel').classList.remove('show'); document.getElementById('keyPanel').classList.remove('show'); document.getElementById('billPanel').classList.remove('show'); document.getElementById('elevatorPanel').classList.remove('show'); document.getElementById('profilePanel').classList.add('show'); }
    };
  });

  // 17. Thang Máy
  document.getElementById('closeElevator').onclick = () => document.getElementById('elevatorPanel').classList.remove('show');
  document.querySelectorAll('.elev-btn[data-floor]').forEach(btn => {
    btn.onclick = () => {
      currentFloor = parseInt(btn.dataset.floor); document.getElementById('elevatorPanel').classList.remove('show');
      if (currentFloor === 1) { navBtns.forEach(b => b.classList.remove('active')); document.getElementById('btnLobby').classList.add('active'); toast.style.display = 'none'; clearTimeout(toastTimer); if (currentGuest && document.getElementById('chatBox').style.display === 'none') { startConversation(); } }
      draw(); 
    };
  });

  // 18. Cá Nhân
  document.getElementById('closeProfile').onclick = () => document.getElementById('profilePanel').classList.remove('show');
  document.getElementById('saveProfile').onclick = () => {
    const newName = document.getElementById('inputName').value; const newAge = document.getElementById('inputAge').value; const newGender = document.getElementById('inputGender').value;
    if(newName.trim() !== "") { document.getElementById('hudName').innerHTML = '👤 ' + newName; MY_AGE = parseInt(newAge); showToast(`Đã lưu: ${newName} (${newAge} tuổi) - Giới tính: ${newGender}`); autoSaveGame(); }
    document.getElementById('profilePanel').classList.remove('show');
  };
}

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

function getGameData() { return { hotelMoney, playerMoney, totalRevenue, playerLevel, playerExp, maxExp, hotelRating, roomState }; }
document.getElementById('saveGameBtn').onclick = () => { const data = getGameData(); const jsonString = JSON.stringify(data); const saveCode = btoa(unescape(encodeURIComponent(jsonString))); showCustomPrompt("Sao lưu thành công", "Hãy copy đoạn mã dưới đây và cất giữ ở nơi an toàn:", saveCode); };
document.getElementById('loadGameBtn').onclick = () => { const inputCode = document.getElementById('loadCodeInput').value.trim(); if (!inputCode) { showToast("Vui lòng dán mã Code vào ô trống!"); return; } try { const jsonString = decodeURIComponent(escape(atob(inputCode))); const data = JSON.parse(jsonString); if (data.hotelMoney === undefined || !data.roomState) { throw new Error("Mã Code không hợp lệ!"); } hotelMoney = data.hotelMoney; playerMoney = data.playerMoney; totalRevenue = data.totalRevenue; playerLevel = data.playerLevel; playerExp = data.playerExp; maxExp = data.maxExp; hotelRating = data.hotelRating; data.roomState.forEach((savedRoom, idx) => { roomState[idx] = savedRoom; }); updateMoneyUI(); document.getElementById('hudLv').innerText = `Lv.${playerLevel}`; document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`; document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`; document.getElementById('rating').innerText = hotelRating.toFixed(1); draw(); document.getElementById('settingsPanel').classList.remove('show'); showToast("Khôi phục dữ liệu thành công!"); setTimeout(() => { location.reload(); }, 1000); } catch (error) { showToast("Lỗi: Mã Code không hợp lệ hoặc đã bị hỏng!"); } };

document.getElementById('restore3DaysBtn').onclick = () => { if (dailyBackups.length === 0) { showCustomAlert("Chưa có bản sao lưu ngày nào!"); return; } const latestBackup = dailyBackups[dailyBackups.length - 1]; showCustomAlert(`Bạn có muốn khôi phục dữ liệu của ngày ${latestBackup.date} không?`, true, () => { const data = latestBackup.data; hotelMoney = data.hotelMoney; playerMoney = data.playerMoney; totalRevenue = data.totalRevenue; playerLevel = data.playerLevel; playerExp = data.playerExp; maxExp = data.maxExp; hotelRating = data.hotelRating; roomState = data.roomState; updateMoneyUI(); document.getElementById('hudLv').innerText = `Lv.${playerLevel}`; document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`; document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`; document.getElementById('rating').innerText = hotelRating.toFixed(1); draw(); document.getElementById('settingsPanel').classList.remove('show'); showToast(`Đã khôi phục dữ liệu ngày ${latestBackup.date}!`); }); };
document.getElementById('resetGameBtn').onclick = () => { showCustomAlert("CẢNH BÁO: Toàn bộ dữ liệu sẽ bị xóa sạch. Bạn có chắc không?", true, () => { isGameStarted = false; isGamePaused = true; localStorage.removeItem('sunriseHotel_AutoSave'); localStorage.removeItem('sunriseHotel_SaveData'); localStorage.removeItem('sunriseHotel_DailyBackups'); dailyBackups = []; location.reload(); }); };
window.addEventListener('DOMContentLoaded', () => { bgmAudio.volume = 0.5; document.body.addEventListener('click', () => { if (bgmAudio.volume > 0 && !isBGMPlaying) { bgmAudio.play().catch(()=>{}); isBGMPlaying = true; } }, { once: true }); });

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
  if (!isGameStarted) return; try { const currentName = document.getElementById('inputName') ? document.getElementById('inputName').value : "Minh"; const data = { playerName: currentName, hotelMoney, playerMoney, totalRevenue, playerLevel, playerExp, maxExp, hotelRating, roomState, gameTime: gameTime.getTime(), isHotelOwner }; localStorage.setItem('sunriseHotel_AutoSave', JSON.stringify(data)); } catch (e) { console.log("Lỗi khi lưu Auto-Save:", e); }
}

function loadAutoSave() {
  const autoSaved = localStorage.getItem('sunriseHotel_AutoSave'); if (!autoSaved) return; 
  try { const data = JSON.parse(autoSaved); if (data.playerName) { document.getElementById('inputName').value = data.playerName; document.getElementById('hudName').innerHTML = '👤 ' + data.playerName; } if (data.isHotelOwner !== undefined) isHotelOwner = data.isHotelOwner; if (data.hotelMoney !== undefined) hotelMoney = data.hotelMoney; if (data.playerMoney !== undefined) playerMoney = data.playerMoney; if (data.totalRevenue !== undefined) totalRevenue = data.totalRevenue; if (data.playerLevel !== undefined) playerLevel = data.playerLevel; if (data.playerExp !== undefined) playerExp = data.playerExp; if (data.maxExp !== undefined) maxExp = data.maxExp; if (data.hotelRating !== undefined) hotelRating = data.hotelRating; if (data.gameTime !== undefined) { gameTime = new Date(data.gameTime); } if (data.roomState && data.roomState.length > 0) { data.roomState.forEach((savedRoom, idx) => { if (roomState[idx]) { roomState[idx] = savedRoom; } }); } updateMoneyUI(); document.getElementById('hudLv').innerText = `Lv.${playerLevel}`; document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`; document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`; document.getElementById('rating').innerText = hotelRating.toFixed(1); updateClockUI(); draw(); showToast("Đã tải lại tiến trình đang chơi!"); } catch (e) { console.log("Lỗi khi khôi phục Auto-Save:", e); }
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