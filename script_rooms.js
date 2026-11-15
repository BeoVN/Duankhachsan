function renderRoomGrid(containerId) {
  const el = document.getElementById(containerId); if (!el) return; el.innerHTML = '';
  const floors = [ { floor: 2, name: "Tầng 2 - Phòng Đơn" }, { floor: 3, name: "Tầng 3 - Phòng Đôi" }, { floor: 4, name: "Tầng 4 - Phòng VIP" }, { floor: 5, name: "Tầng 5 - Phòng Lãng Mạn" }, { floor: 6, name: "Tầng 6 - Phòng Tổng Thống" } ];
  floors.forEach(f => {
    const title = document.createElement('div'); title.style.cssText = "font-weight:900; color:#1e3a52; font-size:14px; margin: 12px 0 6px 0; width:100%; text-align:left; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;"; title.innerText = f.name; el.appendChild(title);
    const gridContainer = document.createElement('div'); gridContainer.style.cssText = "display:grid; grid-template-columns:repeat(6, 1fr); gap:5px; width: 100%; margin-bottom: 10px;";
    const floorRooms = roomState.filter(r => Math.floor(r.number / 100) === f.floor);
    floorRooms.forEach((r) => {
      const i = roomState.indexOf(r); const b = document.createElement('button');
      let isMatch = false; if (containerId === 'rooms' && currentBillData && `Phòng ${r.number}` === currentBillData.room && r.status === 'Trống') { isMatch = true; }
      b.className = 'room' + (isMatch ? ' match-req' : '');
      if (containerId === 'rooms' && selectedRoom === i + 1) { b.style.background = '#ffe29a'; b.style.borderColor = '#bd792e'; b.style.boxShadow = 'none'; b.style.animation = 'none'; }
      let statusColor = r.status === 'Có khách' ? '#ef4444' : '#7b6b58';
      b.innerHTML = `${r.number}<small style="color:${statusColor}">${r.status}</small>`;
      b.onclick = () => {
        if (containerId === 'rooms') {
          if (r.status === 'Cần dọn') { r.status = 'Trống'; renderRoomGrid('rooms'); showToast(`Đã dọn dẹp phòng ${r.number}!`); draw(); } 
          else { selectedRoom = i + 1; renderRoomGrid('rooms'); }
        } else { showToast(`Phòng ${r.number} đang ${r.status.toLowerCase()}`); }
      };
      gridContainer.appendChild(b);
    });
    el.appendChild(gridContainer);
  });
}

function handleRoomClick(roomNum) {
  const room = roomState.find(r => r.number === roomNum); 
  if (!room) return;
  if (room.status === 'Cần dọn') { 
    room.status = 'Trống'; cleaningRoomNumber = null; cleaningEndTime = 0; updateRating(0.1); 
    showToast(`Bạn đã tự tay dọn sạch phòng ${room.number}! (+0.1 Sao)`);
    if (typeof cleanerState !== 'undefined' && cleanerState !== 'none' && cleanerTargetRoom === room.number) { cleanerState = 'none'; cleanerTargetRoom = null; }
    draw();
  } else if (room.status === 'Có khách') { showToast(`Phòng ${room.number} đang có khách. Không thể dọn!`); } 
  else { showToast(`Phòng ${room.number} đang trống.`); }
}

function startConversation() {
  // Nếu hộp chat đang mở (đang nói chuyện) thì không cho khách mới vào
  if (document.getElementById('chatBox').style.display === 'block') return;
  
  if (!currentGuest || guestPatienceEndTime === 0 || currentFloor !== 1) { document.getElementById('chatBox').style.display = 'none'; return; }
  const btn = document.getElementById('chatActionBtn');
  btn.style.display = 'block'; btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Chào khách"; 
  document.getElementById('takeKey').disabled = true; document.getElementById('takeKey').style.opacity = '0.5';
  chatStep = 1; document.getElementById('chatBox').style.display = 'block';
  let titleName = "";
  if (currentGuest.guests.length === 1) { titleName = getPronoun(currentGuest.guests[0]); titleName = titleName.charAt(0).toUpperCase() + titleName.slice(1); } 
  else if (currentGuest.guests.length === 2) { titleName = getPronoun(currentGuest.guests[0]) + " và " + getPronoun(currentGuest.guests[1]); titleName = titleName.charAt(0).toUpperCase() + titleName.slice(1); } 
  else { titleName = `Nhóm ${currentGuest.guests.length} người`; }
  document.getElementById('chatGuestName').innerText = titleName;
  let senderName = currentGuest.guests.length === 1 ? "Khách" : "Người đại diện";
  document.getElementById('chatHistory').innerHTML = '';
  addChatMessage(senderName, "Xin chào!", '#1e3a52', 'left');
  document.getElementById('chatActionBtn').style.display = 'block';
  document.getElementById('chatActionBtn').innerText = "Chào khách";
  document.getElementById('openComputerFromChatBtn').style.display = 'none'; 
}

function addChatMessage(sender, text, color, align) {
  const history = document.getElementById('chatHistory');
  const msg = document.createElement('div');
  msg.style.cssText = `text-align: ${align}; color: ${color}; font-weight: bold;`;
  msg.innerHTML = `<span style="font-size:11px; font-weight:normal; color:#888;">${sender}:</span> ${text}`;
  history.appendChild(msg); history.scrollTop = history.scrollHeight; 
}

function handleChatAction() {
  const btn = document.getElementById('chatActionBtn');
  btn.disabled = true; btn.innerText = "Vui lòng chờ..."; btn.style.opacity = '0.7';
  const leader = currentGuest.guests[0];
  let guestPronoun = getPronoun(leader); 
  let myPronoun = getMyPronoun(guestPronoun); myPronoun = myPronoun.charAt(0).toUpperCase() + myPronoun.slice(1);
  
  if (chatStep === 1) {
    addChatMessage("Lễ tân", `Chào ${guestPronoun}, ${myPronoun} có thể giúp gì cho bạn?`, '#e67e22', 'right');
    setTimeout(() => {
      let senderName = currentGuest.guests.length === 1 ? "Khách" : "Người đại diện";
      let replyPronoun = "Chúng tôi";
      if (currentGuest.guests.length === 1) replyPronoun = guestPronoun.charAt(0).toUpperCase() + guestPronoun.slice(1);
      addChatMessage(senderName, `${replyPronoun} muốn thuê 1 ${currentGuest.reqType}.`, '#1e3a52', 'left');
      btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Hỏi thời gian"; chatStep = 2;
    }, 500); 
  } 
  else if (chatStep === 2) {
    if (currentGuest.guests.length === 1) addChatMessage("Lễ tân", `Vậy ${guestPronoun} định ở trong bao lâu?`, '#e67e22', 'right');
    else addChatMessage("Lễ tân", `Vậy mọi người định ở trong bao lâu?`, '#e67e22', 'right');
    setTimeout(() => {
      const rand = Math.random(); let guestReply = ""; let rentType = ""; let hoursToStay = 0;
      const currentGameHour = gameTime.getHours();
      const canStayOvernight = (currentGameHour >= 18 && currentGameHour < 24);
      if (rand < 0.4) { hoursToStay = Math.floor(Math.random() * 10) + 2; guestReply = currentGuest.guests.length > 1 ? `Chúng tôi ở khoảng ${hoursToStay} tiếng thôi.` : `Tôi ở khoảng ${hoursToStay} tiếng thôi.`; rentType = 'hour'; } 
      else if (rand < 0.7 && canStayOvernight) { if (currentGameHour >= 18) { hoursToStay = (24 - currentGameHour) + 7; } if (hoursToStay <= 0) hoursToStay = 12; guestReply = currentGuest.guests.length > 1 ? `Chúng tôi sẽ ở qua đêm, sáng mai 7h chúng tôi đi.` : `Tôi sẽ ở qua đêm, sáng mai 7h tôi đi.`; rentType = 'night'; } 
      else { const days = Math.floor(Math.random() * 3) + 1; hoursToStay = days * 24; guestReply = currentGuest.guests.length > 1 ? `Chúng tôi ở dài hạn khoảng ${days} ngày.` : `Tôi ở dài hạn khoảng ${days} ngày.`; rentType = 'day'; }
      currentGuest.rentType = rentType; currentGuest.stayHours = hoursToStay; guestStayHours = hoursToStay;
      let senderName = currentGuest.guests.length === 1 ? "Khách" : "Người đại diện";
      addChatMessage(senderName, guestReply, '#1e3a52', 'left');
      btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Xin CCCD"; chatStep = 3;
    }, 500); 
  } 
  else if (chatStep === 3) {
    if (currentGuest.guests.length === 1) addChatMessage("Lễ tân", `Vui lòng cho ${myPronoun.toLowerCase()} xin Căn cước công dân của ${guestPronoun}.`, '#e67e22', 'right');
    else addChatMessage("Lễ tân", `Cho ${myPronoun.toLowerCase()} xin Căn cước công dân của mọi người ạ.`, '#e67e22', 'right');
    setTimeout(() => {
      currentGuest.guests.forEach((g) => {
        if (g.age >= 18) { g.idCard = "0" + Math.floor(Math.random() * 90000000000 + 10000000000); } else { g.idCard = "Chưa có"; }
      });
      let replyText = currentGuest.guests.length === 1 ? `Đây là CCCD của tôi.` : `Tất cả đều ở đây, chúng tôi có ${currentGuest.guests.length} người.`;
      let senderName = currentGuest.guests.length === 1 ? "Khách" : "Người đại diện";
      addChatMessage(senderName, replyText, '#1e3a52', 'left');
      document.querySelectorAll('.guest-form').forEach(f => f.style.display = 'none');
      const currentForm = document.getElementById('form-' + currentGuest.guests.length); if(currentForm) currentForm.style.display = 'flex';
      const cccdDetails = document.getElementById('cccdDetails');
      if(cccdDetails) { cccdDetails.innerHTML = ''; currentGuest.guests.forEach((g, index) => { cccdDetails.innerHTML += `<div style="border-bottom:1px dashed #ccc; padding-bottom:3px;"><b>Người ${index + 1}:</b> ${g.name} - ${g.age} tuổi - CCCD: ${g.idCard}</div>`; }); }
      currentGuest.guests.forEach((g, index) => {
        const p = index + 1; const size = currentGuest.guests.length;
        const nameEl = document.getElementById(`f${size}_p${p}_name`); const ageEl = document.getElementById(`f${size}_p${p}_age`); const idEl = document.getElementById(`f${size}_p${p}_id`);
        if(nameEl && ageEl && idEl) { nameEl.value = g.name; ageEl.value = g.age; idEl.value = g.idCard === "Chưa có" ? "" : g.idCard; if (g.age < 18) { idEl.disabled = true; idEl.placeholder = "Dưới 18 tuổi"; } else { idEl.disabled = false; idEl.placeholder = "Nhập CCCD..."; } }
      });
      const now = new Date(gameTime); const timeInStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`;
      let outTime;
      if (currentGuest.rentType === 'night') { outTime = new Date(now); outTime.setDate(outTime.getDate() + 1); outTime.setHours(7, 0, 0, 0); } else { outTime = new Date(now.getTime() + (currentGuest.stayHours * 60 * 60000)); }
      currentGuest.timeIn = timeInStr;
      currentGuest.timeOut = `${outTime.getHours().toString().padStart(2, '0')}:${outTime.getMinutes().toString().padStart(2, '0')} - ${outTime.getDate()}/${outTime.getMonth() + 1}`;
      const availableRoom = roomState.find(r => Math.floor(r.number / 100) === currentGuest.reqFloor && r.status === 'Trống');
      const regRoomEl = document.getElementById('regRoom'); if(regRoomEl) regRoomEl.value = availableRoom ? `Phòng ${availableRoom.number}` : "Hết phòng!";
      const regTimeInEl = document.getElementById('regTimeIn'); if(regTimeInEl) regTimeInEl.value = currentGuest.timeIn;
      const regTimeOutEl = document.getElementById('regTimeOut'); if(regTimeOutEl) regTimeOutEl.value = currentGuest.timeOut;
      btn.style.display = 'none'; document.getElementById('openComputerFromChatBtn').style.display = 'block'; document.getElementById('openComputerFromChatBtn').innerText = "💻 Mở Đăng ký trong Máy tính";
    }, 500); 
  }
}

function generateBill() {
  if (!currentGuest) return;
  const size = currentGuest.guests.length; const leaderName = document.getElementById(`f${size}_p1_name`).value; const roomBooked = document.getElementById('regRoom').value;
  const prices = ROOM_PRICES[currentGuest.reqType]; let basePrice = prices[currentGuest.rentType];
  let multiplier = 1; let discount = 0;
  if (size === 2) { multiplier = 2; discount = 0.1; } else if (size === 3) { multiplier = 3; discount = 0.2; } else if (size === 4) { multiplier = 4; discount = 0.3; }
  basePrice = basePrice * multiplier * (1 - discount); const vat = basePrice * 0.1; const total = basePrice + vat;
  currentBillData = { name: leaderName, room: roomBooked, inTime: currentGuest.timeIn, outTime: currentGuest.timeOut, basePrice: basePrice, vat: vat, total: total, rentType: currentGuest.rentType };
  document.getElementById('billRoom').innerText = roomBooked; document.getElementById('billType').innerText = currentGuest.reqType; document.getElementById('billPeople').innerText = size + " người";
  const rentNames = { hour: "Theo giờ", night: "Qua đêm", day: "Dài hạn" }; document.getElementById('billRentType').innerText = rentNames[currentGuest.rentType];
  document.getElementById('billIn').innerText = currentGuest.timeIn; document.getElementById('billOut').innerText = currentGuest.timeOut;
  let calcText = `(${prices[currentGuest.rentType].toLocaleString('vi-VN')} x ${multiplier}`; if (discount > 0) { calcText += ` - ${discount * 100}%`; } calcText += `)`; document.getElementById('billCalcDetail').innerText = calcText;
  document.getElementById('billPrice').innerText = basePrice.toLocaleString('vi-VN') + 'đ'; document.getElementById('billVat').innerText = vat.toLocaleString('vi-VN') + 'đ'; document.getElementById('billTotal').innerText = total.toLocaleString('vi-VN') + 'đ';
  document.getElementById('billPanel').classList.add('show');
}

function finishPayment() {
  if (!currentGuest || !currentBillData) return;
  
  const finalPrice = currentBillData.total; 
  const commission = finalPrice * COMMISSION_RATE; 
  const hotelKeep = finalPrice - commission;
  
  hotelMoney += hotelKeep; 
  playerMoney += commission; 
  totalRevenue += finalPrice; 
  occupiedRooms++; 
  updateMoneyUI();
  
  const expEarned = Math.floor(finalPrice / 10000); 
  addExp(expEarned); 
  updateRating(0.1);
  
  // LẤY THỜI GIAN VÀ LƯU VÀO MẢNG RECEIPT_HISTORY
  const now = gameTime; 
  const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  receiptHistory.push({
    room: currentBillData.room.replace('Phòng ', ''),
    time: timeStr,
    price: finalPrice,
    commission: commission
  });
  
  // CẬP NHẬT LẠI GIAO DIỆN TAB SAO KÊ
  renderReceipt();
  
  document.getElementById('bill-total').innerText = totalRevenue.toLocaleString('vi-VN') + 'đ'; 
  document.getElementById('bill-comm').innerText = playerMoney.toLocaleString('vi-VN') + 'đ';
  
  document.getElementById('computerPanel').classList.remove('show'); 
  document.getElementById('keyPanel').classList.add('show'); 
  renderRoomGrid('rooms');
  
  document.getElementById('takeKey').disabled = false; 
  document.getElementById('takeKey').style.opacity = '1';
  
  showToast("Thanh toán thành công! Hãy chọn phòng trên Kệ chìa khóa.");
}

function renderReceipt() {
  const list = document.getElementById('receipt-list');
  if (!list) return;
  
  list.innerHTML = '';
  if (receiptHistory.length === 0) {
    list.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Chưa có giao dịch</div>';
    return;
  }
  
  // Dùng slice().reverse() để đảo ngược mảng, giúp giao dịch mới nhất nằm trên cùng
  receiptHistory.slice().reverse().forEach(item => {
    list.insertAdjacentHTML('beforeend', `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc; font-size:12px;"><div><b>Phòng ${item.room}</b><br><span style="color:#888">${item.time}</span></div><div style="text-align:right;"><div style="color:#2c6e9e;">KS thu: ${item.price.toLocaleString('vi-VN')}đ</div><div style="color:#e67e22;">Hoa hồng: +${item.commission.toLocaleString('vi-VN')}đ</div></div></div>`);
  });
}

