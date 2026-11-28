// ==========================================
// GIAO DIỆN: khởi tạo (initUI), nút bấm, máy tính lễ tân
// ==========================================
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
    if (typeof pickupWaitingGuestForAutoReception === 'function') pickupWaitingGuestForAutoReception(); // lễ tân nhận ngay khách đang chờ
    if (typeof updateExpandButton === 'function') updateExpandButton(); 
    if (typeof updateOwnerUI === 'function') updateOwnerUI(); 
    resizeAll();
  };
  
  // Hàm tạo khách ngẫu nhiên từ 3 đến 15 giây
function scheduleNextGuest() {
  // Tính toán thời gian ngẫu nhiên (từ 3000ms đến 15000ms)
  const randomTime = Math.floor((Math.random() * (15000 - 3000 + 1) + 3000) * guestFlowMultiplier()); // sao càng cao khách càng đông
  
  setTimeout(() => {
    if (!isGamePaused && document.getElementById('chatBox').style.display !== 'block') {
      spawnGuest();
    }
    scheduleNextGuest(); // Gọi lại hàm để tiếp tục tạo khách tiếp theo
  }, randomTime);
}

// Bắt đầu lên lịch tạo khách
scheduleNextGuest();

// Xuất hiện khách đầu tiên ngay khi vào game (sau 0.5 giây)
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

 // 9. Nút Máy Tính Ở Quầy (Chỉ mở được khi ở Tầng 1)
computerBtn.onclick = () => { 
    if (currentFloor !== 1) return; // Nếu không phải tầng 1 thì không làm gì cả

    document.getElementById('computerTabs').style.display = 'flex'; 
    document.getElementById('guestSummaryBox').style.display = 'none'; 
    document.getElementById('confirmRegisterBtn').style.display = 'none'; 
    document.getElementById('showBillBtn').style.display = 'none'; 
    document.getElementById('closeComputer').style.display = 'block'; 
    
    renderRoomGrid('dash-room-grid'); 
    document.getElementById('computerPanel').classList.add('show'); 
    
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));
    document.querySelector('.tab[data-tab="dashboard"]').classList.add('active');
    document.getElementById('tab-dashboard').classList.add('active');
  };

// 10. Nút Đóng Máy Tính
document.getElementById('closeComputer').onclick = () => { 
  document.getElementById('computerPanel').classList.remove('show'); 
};

 // 11. Chuyển Đổi Giữa Các Tab
document.querySelectorAll('.tab').forEach(t=>{ 
  t.onclick = () => { 
    // 1. Xóa active của tất cả các tab
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); 
    document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active')); 
    
    // 2. Kích hoạt tab được chọn
    t.classList.add('active'); 
    document.getElementById('tab-'+t.dataset.tab).classList.add('active'); 
    
    // 3. Xử lý logic hiển thị nút bấm cho từng tab
    if(t.dataset.tab === 'register') { 
      document.getElementById('confirmRegisterBtn').style.display = 'block';
      document.getElementById('showBillBtn').style.display = 'none'; 
      document.getElementById('closeComputer').style.display = 'none'; 
      if (currentGuest) { document.getElementById('guestSummaryBox').style.display = 'block'; } 
    } 
    else if (t.dataset.tab === 'profiles') {
      document.getElementById('confirmRegisterBtn').style.display = 'none';
      document.getElementById('showBillBtn').style.display = 'none'; 
      document.getElementById('closeComputer').style.display = 'block'; 
      document.getElementById('guestSummaryBox').style.display = 'none'; 
      
      renderGuestProfiles(); // Gọi hàm hiển thị hồ sơ
    }
    else if (t.dataset.tab === 'receipt') {
      document.getElementById('confirmRegisterBtn').style.display = 'none';
      document.getElementById('showBillBtn').style.display = 'none'; 
      document.getElementById('closeComputer').style.display = 'block'; 
      document.getElementById('guestSummaryBox').style.display = 'none'; 
      
      updateReceiptSummary();
      renderReceipt();
    }
    else if (t.dataset.tab === 'social') {
      document.getElementById('confirmRegisterBtn').style.display = 'none';
      document.getElementById('showBillBtn').style.display = 'none';
      document.getElementById('closeComputer').style.display = 'block';
      document.getElementById('guestSummaryBox').style.display = 'none';
      renderSocial();
    }
    else if (t.dataset.tab === 'diary') {
      document.getElementById('confirmRegisterBtn').style.display = 'none';
      document.getElementById('showBillBtn').style.display = 'none'; 
      document.getElementById('closeComputer').style.display = 'block'; 
      document.getElementById('guestSummaryBox').style.display = 'none'; 
      
      renderDiary(); // Gọi hàm hiển thị nhật ký
    }
    else if (t.dataset.tab === 'dashboard') {
      // XỬ LÝ RIÊNG CHO TAB SƠ ĐỒ PHÒNG
      document.getElementById('confirmRegisterBtn').style.display = 'none';
      document.getElementById('showBillBtn').style.display = 'none'; 
      document.getElementById('closeComputer').style.display = 'block'; 
      document.getElementById('guestSummaryBox').style.display = 'none'; 
      
      // Cập nhật lại số lượng khách đang có
      document.getElementById('dash-occupied').innerText = occupiedRooms + ' / 30';
      renderRoomGrid('dash-room-grid'); // Vẽ lại sơ đồ phòng
    }
      else if (t.dataset.tab === 'messages') {
  document.getElementById('confirmRegisterBtn').style.display = 'none';
  document.getElementById('showBillBtn').style.display = 'none'; 
  document.getElementById('closeComputer').style.display = 'block'; 
  document.getElementById('guestSummaryBox').style.display = 'none'; 
  
  renderInternalMessages(); // Gọi hàm hiển thị tin nhắn nội bộ
      }
    else { 
      // CÁC TAB CÒN LẠI (Tin nhắn)
      document.getElementById('confirmRegisterBtn').style.display = 'none';
      document.getElementById('showBillBtn').style.display = 'none'; 
      document.getElementById('closeComputer').style.display = 'block'; 
      document.getElementById('guestSummaryBox').style.display = 'none'; 
    }
  }; 
});
  // XỬ LÝ CHUYỂN ĐỔI TAB NỘI BỘ / KHÁCH HÀNG
document.querySelectorAll('.msg-tab').forEach(tab => {
  tab.onclick = () => {
    // Đổi màu nút
    document.querySelectorAll('.msg-tab').forEach(t => {
      t.classList.remove('active');
      t.classList.add('secondary');
    });
    tab.classList.add('active');
    tab.classList.remove('secondary');

    // Ẩn/Hiện nội dung
    document.querySelectorAll('.msg-content').forEach(c => c.style.display = 'none');
    const targetId = 'msg-' + tab.dataset.msg;
    document.getElementById(targetId).style.display = 'block';
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
  keysBtn.onclick = () => { 
    if (currentFloor !== 1) return; // Nếu không phải tầng 1 thì không làm gì cả
    renderRoomGrid('rooms'); 
    document.getElementById('keyPanel').classList.add('show'); 
  };
  document.getElementById('closeKey').onclick = () => document.getElementById('keyPanel').classList.remove('show');
  
  document.querySelectorAll('.rent-type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.rent-type-btn').forEach(b => { b.style.background = '#fff'; b.style.borderColor = '#ccc'; b.style.fontWeight = 'normal'; });
      btn.style.background = '#ffe29a'; btn.style.borderColor = '#bd792e'; btn.style.fontWeight = 'bold'; selectedRentType = btn.dataset.type; updateRentPriceDisplay();
    };
  });

  function updateRentPriceDisplay() {
    if (!currentGuest) return; const prices = customPrices[currentGuest.reqType]; if (!prices) return;
    let price = prices[selectedRentType]; let multiplier = 1, discount = 0; const size = currentGuest.guests.length;
    if (size === 2) { multiplier = 2; discount = 0.1; } else if (size === 3) { multiplier = 3; discount = 0.2; } else if (size === 4) { multiplier = 4; discount = 0.3; }
    price = price * multiplier * (1 - discount); const rpEl = document.getElementById('rentPriceDisplay'); if (rpEl) rpEl.innerText = fmtVND(price);
  }

  // 15. Nút Nhận Phòng
  document.getElementById('takeKey').onclick = () => { 
    const roomIndex = selectedRoom - 1; const room = roomState[roomIndex];
    if (!currentBillData) { showToast("Vui lòng thanh toán trước khi nhận phòng!"); return; }
    if (`Phòng ${room.number}` !== currentBillData.room) { showToast(`Khách đã thanh toán ${currentBillData.room}. Vui lòng chọn đúng phòng!`); return; }
    if (room.status === 'Có khách') { showToast('Phòng này đang có khách rồi!'); return; }
    if (room.status === 'Cần dọn') { showToast('Phòng này đang cần dọn dẹp!'); return; }

   room.status = 'Có khách'; 
room.guests = null; 
room.stayHours = currentGuest.stayHours; 
room.guestPos = 'center';
room.reviewStars = currentGuest.moodStars || 5; // Số sao khách sẽ đánh giá khi trả phòng
room.reviewGuest = reviewGuestInfo(currentGuest.guests[0], currentGuest.guests.length); room.reviewRecId = ''; room.reviewRecName = '';
room.checkOutTime = Date.now() + (currentGuest.stayHours * 75 * 1000); // <--- THÊM DÒNG NÀY
    room.checkOutTime = Date.now() + (currentGuest.stayHours * 75 * 1000); occupiedRooms++;
    const checkInDiv = document.getElementById('diaryCheckIn'); if (checkInDiv.innerHTML.includes('Chưa có dữ liệu')) checkInDiv.innerHTML = '';
    const logTimeStr = `${gameTime.getHours().toString().padStart(2, '0')}:${gameTime.getMinutes().toString().padStart(2, '0')} - ${gameTime.getDate()}/${gameTime.getMonth() + 1}`;
    diaryHistory.in.push({ room: room.number, time: logTimeStr });
renderDiary(); // Cập nhật ngay nếu đang mở tab
    // LƯU HỒ SƠ KHÁCH HÀNG
const checkInDate = `${gameTime.getDate().toString().padStart(2, '0')}/${(gameTime.getMonth()+1).toString().padStart(2, '0')}/${gameTime.getFullYear()}`;
const roomProfile = {
  date: checkInDate,
  room: room.number,
  guests: currentGuest.guests
};
guestProfiles.push(roomProfile);
    document.getElementById('keyPanel').classList.remove('show'); document.getElementById('computerPanel').classList.remove('show'); 
    document.getElementById('regRoom').value = ''; document.getElementById('regTimeIn').value = ''; document.getElementById('regTimeOut').value = '';
    document.getElementById('takeKey').disabled = true; document.getElementById('takeKey').style.opacity = '0.5';

    draw(); 
showToast(`Đã nhận phòng ${room.number} thành công!`);

const targetRoomNumber = room.number;
const guestGroupToGuide = currentGuest.guests; 

// BẮT ĐẦU HỘI THOẠI
document.getElementById('chatBox').style.display = 'block';
addChatMessage("Lễ tân", `Dạ đây là chìa khóa phòng ${room.number}.`, '#e67e22', 'right');

setTimeout(() => {
  if (typeof guideGuestState === 'undefined' || guideGuestState === 'none') {
    // TRƯỜNG HỢP NHÂN VIÊN RẢNH
    addChatMessage("Nhân viên dẫn khách", `Vâng, tôi sẽ đưa quý khách lên phòng ${room.number} ngay ạ.`, '#1e3a52', 'left');
    
    guideGuestState = 'to_room'; 
    guidePosX = 480; 
    guidePosY = 40; 
    guideTargetRoom = targetRoomNumber; 
    window.tempGuestsForDrawing = guestGroupToGuide; 
    guidePathHistory = []; 
    
    currentGuest = null;
    currentBillData = null;
    
    // CHỜ ĐÚNG 3 GIÂY ĐỂ ĐỌC HẾT HỘI THOẠI RỒI MỚI ĐÓNG
    setTimeout(() => {
      document.getElementById('chatBox').style.display = 'none';
      document.getElementById('keyPanel').classList.remove('show'); 
      document.getElementById('computerPanel').classList.remove('show'); 
      draw(); 
    }, 3000);
    
  } else {
    // TRƯỜNG HỢP NHÂN VIÊN BẬN
    addChatMessage("Lễ tân", `Dẫn khách hiện đang bận. Vui lòng chờ dẫn khách để được đưa lên phòng ạ.`, '#e67e22', 'right');
    
    // LƯU KHÁCH VÀO HÀNG ĐỢI (Không xóa khách)
    pendingGuestForGuide = { room: targetRoomNumber, guests: guestGroupToGuide };
    
    currentGuest = null; 
    currentBillData = null;
    document.getElementById('keyPanel').classList.remove('show'); 
    document.getElementById('computerPanel').classList.remove('show'); 
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
