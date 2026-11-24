// ==========================================
// FILE XỬ LÝ CÀI ĐẶT (CHẠY ĐỘC LẬP)
// ==========================================

(function () {
  // 1. Nút Mở Cài đặt
  const btnSettings = document.getElementById('btnSettings');
  if (btnSettings) {
    btnSettings.onclick = () => { 
      // Nếu đang mở bảng Mở rộng thì không làm gì cả
      const expandPanel = document.getElementById('expandPanel');
      if (expandPanel && expandPanel.classList.contains('show')) return; 
      
      isGamePaused = true; 
      pauseStartTime = Date.now(); 
      
      const settingsPanel = document.getElementById('settingsPanel');
      if (settingsPanel) settingsPanel.classList.add('show'); 
    };
  }

  // 2. Nút Đóng Cài đặt
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  if (closeSettingsBtn) {
    closeSettingsBtn.onclick = () => {
      const settingsPanel = document.getElementById('settingsPanel');
      if (settingsPanel) settingsPanel.classList.remove('show'); 
      
      if (isGamePaused) { 
        isGamePaused = false; 
        const pausedDuration = Date.now() - pauseStartTime; 
        if (guestPatienceEndTime > 0) guestPatienceEndTime += pausedDuration; 
        roomState.forEach(room => { 
          if (room.status === 'Có khách' && room.checkOutTime > 0) room.checkOutTime += pausedDuration; 
        }); 
        if (cleaningRoomNumber !== null) cleaningEndTime += pausedDuration; 
        pauseStartTime = 0; 
      }
    };
  }

  // 3. Nút Về Menu Chính
  const backToMenuBtn = document.getElementById('backToMenuBtn');
  if (backToMenuBtn) {
    backToMenuBtn.onclick = () => { 
      if (typeof autoSaveGame === 'function') autoSaveGame(); 
      isGamePaused = true; 
      location.reload(); 
    };
  }

  // 4. Thanh trượt âm lượng
  const bgmVolume = document.getElementById('bgmVolume');
  if (bgmVolume) {
    bgmVolume.oninput = (e) => { 
      const vol = e.target.value / 100; 
      if (typeof bgmAudio !== 'undefined') {
        bgmAudio.volume = vol; 
        if (vol > 0 && !isBGMPlaying) { 
          bgmAudio.play().catch(err => console.log(err)); 
          isBGMPlaying = true; 
        } 
      }
    };
  }
  // ==========================================
// XỬ LÝ DỮ LIỆU GAME (LƯU/TẢI)
// ==========================================

// 1. Nút Sao lưu
const saveGameBtn = document.getElementById('saveGameBtn');
if (saveGameBtn) {
  saveGameBtn.onclick = () => {
    const data = getGameData();
    const jsonString = JSON.stringify(data);
    const saveCode = btoa(unescape(encodeURIComponent(jsonString))); 
    showCustomPrompt("Sao lưu thành công", "Hãy copy đoạn mã dưới đây và cất giữ ở nơi an toàn:", saveCode);
  };
}

// 2. Nút Khôi phục
const loadGameBtn = document.getElementById('loadGameBtn');
if (loadGameBtn) {
  loadGameBtn.onclick = () => {
    const inputCode = document.getElementById('loadCodeInput').value.trim();
    if (!inputCode) { showToast("Vui lòng dán mã Code vào ô trống!"); return; }

    try {
      const jsonString = decodeURIComponent(escape(atob(inputCode)));
      const data = JSON.parse(jsonString);

      if (data.hotelMoney === undefined || !data.roomState) { throw new Error("Mã Code không hợp lệ!"); }

      hotelMoney = data.hotelMoney;
      playerMoney = data.playerMoney;
      totalRevenue = data.totalRevenue;
      playerLevel = data.playerLevel;
      playerExp = data.playerExp;
      maxExp = data.maxExp;
      hotelRating = data.hotelRating;
      
      data.roomState.forEach((savedRoom, idx) => { roomState[idx] = savedRoom; });

      updateMoneyUI();
      document.getElementById('hudLv').innerText = `Lv.${playerLevel}`;
      document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`;
      document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`;
      document.getElementById('rating').innerText = hotelRating.toFixed(1);
      
      draw();
      document.getElementById('settingsPanel').classList.remove('show');
      showToast("Khôi phục dữ liệu thành công!");
      setTimeout(() => { location.reload(); }, 1000);
    } catch (error) {
      showToast("Lỗi: Mã Code không hợp lệ hoặc đã bị hỏng!");
    }
  };
}

// 3. Nút Khôi phục 3 ngày
const restore3DaysBtn = document.getElementById('restore3DaysBtn');
if (restore3DaysBtn) {
  restore3DaysBtn.onclick = () => {
    if (dailyBackups.length === 0) { showCustomAlert("Chưa có bản sao lưu ngày nào!"); return; }
    const latestBackup = dailyBackups[dailyBackups.length - 1];
    
    showCustomAlert(`Bạn có muốn khôi phục dữ liệu của ngày ${latestBackup.date} không?`, true, () => {
      const data = latestBackup.data;
      hotelMoney = data.hotelMoney;
      playerMoney = data.playerMoney;
      totalRevenue = data.totalRevenue;
      playerLevel = data.playerLevel;
      playerExp = data.playerExp;
      maxExp = data.maxExp;
      hotelRating = data.hotelRating;
      roomState = data.roomState;
      
      updateMoneyUI();
      document.getElementById('hudLv').innerText = `Lv.${playerLevel}`;
      document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`;
      document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`;
      document.getElementById('rating').innerText = hotelRating.toFixed(1);
      
      draw();
      document.getElementById('settingsPanel').classList.remove('show');
      showToast(`Đã khôi phục dữ liệu ngày ${latestBackup.date}!`);
    });
  };
}

// 4. Nút Chơi lại từ đầu
const resetGameBtn = document.getElementById('resetGameBtn');
if (resetGameBtn) {
  resetGameBtn.onclick = () => {
    showCustomAlert("CẢNH BÁO: Toàn bộ dữ liệu sẽ bị xóa sạch. Bạn có chắc không?", true, () => {
      isGameStarted = false; 
      isGamePaused = true;
      localStorage.removeItem('sunriseHotel_AutoSave'); 
      localStorage.removeItem('sunriseHotel_SaveData'); 
      localStorage.removeItem('sunriseHotel_DailyBackups'); 
      dailyBackups = [];
      location.reload();
    });
  };
}

// 5. Nút Khôi phục dữ liệu ở Menu chính
const menuLoadSaveBtn = document.getElementById('menuLoadSaveBtn');
if (menuLoadSaveBtn) {
  menuLoadSaveBtn.onclick = () => { 
    document.getElementById('settingsPanel').classList.add('show'); 
    const dataSection = document.getElementById('settingsPanel').querySelector('.window'); 
    if (dataSection) { dataSection.scrollTop = dataSection.scrollHeight; } 
  };
}
})();
