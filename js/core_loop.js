// ==========================================
// LÕI GAME: đồng hồ, vòng lặp, kinh nghiệm
// ==========================================
// ==========================================
// 4. HỆ THỐNG THỜI GIAN & VÒNG LẶP
// ==========================================
// Tốc độ game: 1 giây ngoài đời = 5 phút trong game (chỉ có MỘT bộ đếm giờ chạy)
const GAME_MINUTES_PER_SECOND = 5;

function updateClockUI() {
  const h = gameTime.getHours().toString().padStart(2, '0');
  const m = gameTime.getMinutes().toString().padStart(2, '0');
  document.getElementById('clockTime').innerText = `${h}h${m}p`;
  const hour = gameTime.getHours(); const shiftElement = document.getElementById('clockShift');
  if (hour >= 6 && hour < 18) { shiftElement.innerText = "☀️ Ca Ngày"; shiftElement.style.color = "#d28a43"; } 
  else { shiftElement.innerText = "🌙 Ca Đêm"; shiftElement.style.color = "#2c6e9e"; }
  const d = gameTime.getDate().toString().padStart(2, '0'); const mo = (gameTime.getMonth() + 1).toString().padStart(2, '0'); const y = gameTime.getFullYear();
  document.getElementById('gameDate').innerText = `${d}/${mo}/${y}`;
  syncStaffStatus();
  // Phản hồi của khách (theo giờ game) và lễ tân nhận khách đang chờ
  if (typeof processReviewReplies === 'function') processReviewReplies();
  if (typeof pickupWaitingGuestForAutoReception === 'function') pickupWaitingGuestForAutoReception();
}

setInterval(() => { 
  if (!isGameStarted || isGamePaused) return; 

  const oldHour = gameTime.getHours();
  gameTime.setMinutes(gameTime.getMinutes() + GAME_MINUTES_PER_SECOND); 
  const newHour = gameTime.getHours();
  updateClockUI(); 
  
  // KIỂM TRA ĐỔI CA
  if (oldHour !== newHour) {
    // 6h sáng: Ca ngày bắt đầu
    if (newHour === 6) {
      addInternalMessage("Hệ thống", "Đã đến 6h sáng. Ca ngày chính thức bắt đầu!");
      addInternalMessage("Nhân viên vệ sinh", "Xin chào đã tới giờ làm việc của tôi rồi.");
      addInternalMessage("Nhân viên dọn phòng", "Xin chào đã tới giờ làm việc của tôi rồi.");
    }
    // 18h tối: Ca đêm bắt đầu
    if (newHour === 18) {
      addInternalMessage("Hệ thống", "Đã đến 6h tối. Ca đêm chính thức bắt đầu!");
      addInternalMessage("Nhân viên vệ sinh", "Tạm biệt mọi người, ngày mai gặp lại.");
      addInternalMessage("Nhân viên dọn phòng", "Tạm biệt mọi người, ngày mai gặp lại.");
    }
  }

  if (gameTime.getDate() !== lastBackupDay) {
    lastBackupDay = gameTime.getDate();
    createDailyBackup();
  }
}, 1000);

setInterval(() => {
  if (isGamePaused) return; 
  
  const now = Date.now();
  
  // GỌI HÀM CẬP NHẬT NHÂN VIÊN
  if (typeof updateStaffAnimations === 'function') {
    updateStaffAnimations(); 
  }

  // KIỂM TRA KHÁCH TRẢ PHÒNG
  roomState.forEach(room => {
    if (room.status === 'Có khách' && room.checkOutTime > 0 && now >= room.checkOutTime) {
      room.status = 'Cần dọn'; 
      room.checkOutTime = 0; 
      occupiedRooms--;
      addGuestReview(room.reviewStars || 5, { room: room.number, guest: reviewGuestFromRoom(room), recId: room.reviewRecId, recName: room.reviewRecName }); // Khách để lại đánh giá khi trả phòng
      room.reviewStars = 0; room.reviewGuest = null; room.reviewRecId = ''; room.reviewRecName = '';
      
      cleaningRoomNumber = room.number;
      cleaningEndTime = Date.now() + cleaningMaxTime;

      updateMoneyUI(); 
      
      const checkOutDiv = document.getElementById('diaryCheckOut');
      if (checkOutDiv.innerHTML.includes('Chưa có dữ liệu')) checkOutDiv.innerHTML = '';
      const timeStr = `${gameTime.getHours().toString().padStart(2, '0')}:${gameTime.getMinutes().toString().padStart(2, '0')} - ${gameTime.getDate()}/${gameTime.getMonth() + 1}`;
      diaryHistory.out.push({ room: room.number, time: timeStr });
      renderDiary(); // Cập nhật ngay nếu đang mở tab
      
      showToast(`Phòng ${room.number} đã trả phòng. Cần dọn dẹp!`); 
    }
  });
  
  // KIỂM TRA KHÁCH CHỜ
  if (currentGuest && guestPatienceEndTime > 0 && now >= guestPatienceEndTime) {
    showToast("Khách đã mất kiên nhẫn và bỏ đi! (đánh giá 1 sao)");
    { const _ar = (typeof autoRec !== 'undefined' && autoRec && !autoRec.done) ? autoRec.rec : null; addGuestReview(1, { reason: 'Rời đi vì chờ quá lâu', guest: reviewGuestInfo(currentGuest.guests[0], currentGuest.guests.length), recId: _ar ? _ar.id : '', recName: _ar ? _ar.name : '' }); } currentGuest = null; guestPatienceEndTime = 0;
    document.getElementById('chatBox').style.display = 'none';
    document.getElementById('cashDrawerBtn').style.display = 'none';
    document.getElementById('qrBtn').style.display = 'none';
  }
// KIỂM TRA PHÒNG QUÁ HẠN DỌN DẸP
if (cleaningRoomNumber !== null) {
  const timeLeft = cleaningEndTime - now;
  const roomToClean = roomState.find(r => r.number === cleaningRoomNumber);
  
  // Quản lý nhắc nhở khi còn 25 giây
  if (timeLeft > 0 && timeLeft <= 25000 && !roomToClean.hasWarned) {
    roomToClean.hasWarned = true; // Đánh dấu đã nhắc nhở để không spam
    addInternalMessage("Quản lý", `Phòng ${cleaningRoomNumber} dọn giùm tôi nhé!`);
  }

  
}
  // === THÊM ĐOẠN KIỂM TRA PHẠT 0.5 SAO VÀO ĐÂY ===
  if (cleaningRoomNumber !== null && now >= cleaningEndTime) {
    const roomToClean = roomState.find(r => r.number === cleaningRoomNumber);
    
    // Nếu phòng vẫn đang "Cần dọn" (chưa có ai dọn)
    if (roomToClean && roomToClean.status === 'Cần dọn') {
      // Phạt trừ 0.5 sao
      showToast(`Hết thời gian! Phòng ${roomToClean.number} tự động dọn.`);
      
      // Tự động dọn sạch phòng
      roomToClean.status = 'Trống';
    }
    
    // Reset biến đếm
    cleaningRoomNumber = null;
    cleaningEndTime = 0;
  }
  // ===============================================

  // LUÔN VẼ LẠI MÀN HÌNH
  draw();
}, 1000);

function addExp(amount) {
  playerExp += amount;
  while (playerExp >= maxExp) {
    playerExp -= maxExp; playerLevel++; maxExp = Math.floor(maxExp * 1.5); 
    setTimeout(() => { showToast(`🎉 CHÚC MỪNG! Bạn đã đạt Level ${playerLevel}!`); }, 500);
  }
  document.getElementById('hudLv').innerText = `Lv.${playerLevel}`;
  document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`;
  document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`;
  if (typeof updateExpandButton === 'function') updateExpandButton();
}
