// ==========================================
// LÕI GAME: vẽ cảnh chính & resize
// ==========================================
// ==========================================
// 3. VẼ CẢNH CHÍNH (DRAW)
// ==========================================
function draw(){
  const c = ctx;
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 600);
  skyGrad.addColorStop(0, '#2b4162'); skyGrad.addColorStop(0.6, '#fa9c7a'); skyGrad.addColorStop(1, '#f5d6a8');
  ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, 960, 600);

  box(250, 150, 120, 400, '#1c2a3a'); box(270, 180, 30, 40, '#ffd166'); 
  box(390, 200, 100, 350, '#24364a'); box(410, 230, 20, 20, '#ffd166');
  box(510, 120, 140, 430, '#152233'); box(530, 150, 30, 30, '#ffd166'); 
  box(610, 220, 90, 330, '#24364a'); box(200, 280, 70, 270, '#1c2a3a'); box(720, 260, 70, 290, '#152233');

  if (currentFloor === 0) {
    box(0, 0, 960, 600, '#334155'); 
    for (let i = 100; i < 900; i += 100) {
      box(i, 350, 5, 100, '#e2e8f0'); 
      box(i, 50, 5, 100, '#e2e8f0');
    }
    box(150, 370, 80, 50, '#ef4444'); box(160, 360, 60, 20, '#b91c1c');
    box(450, 70, 80, 50, '#3b82f6'); box(460, 60, 60, 20, '#1d4ed8');
    label("TẦNG HẦM - BÃI ĐỖ XE", 480, 300, 20, '#94a3b8', 'center');
    drawSecurityGuard(); 
  } 
  else if (currentFloor === 1) { 
    box(0, 0, 200, 600, '#f0f4f8'); box(760, 0, 200, 600, '#f0f4f8'); 
    box(0, 460, 200, 20, '#d1dbe5'); box(760, 460, 200, 20, '#d1dbe5'); 
    box(200, 0, 15, 480, '#b0bec5'); box(745, 0, 15, 480, '#b0bec5');
    box(200, 0, 560, 15, '#b0bec5'); box(470, 0, 20, 480, '#b0bec5');
    box(200, 240, 560, 15, '#b0bec5');
    box(455, 220, 6, 50, '#e0e0e0'); box(499, 220, 6, 50, '#e0e0e0');
    box(0, 480, 960, 120, '#d2e3ec');
    box(30, 410, 140, 50, '#6c7a89'); box(40, 390, 120, 20, '#8a9bb0'); box(50, 400, 100, 10, '#5a6675');
    box(840, 410, 40, 50, '#8b6b4a'); box(830, 360, 60, 50, '#2d6a4f'); box(840, 330, 40, 30, '#40916c');
    box(0, 500, 960, 100, '#6b4c3a'); box(0, 480, 960, 20, '#a67c52');
    box(640, 350, 180, 120, '#2c3e50'); box(650, 360, 160, 95, '#ecf0f1');
    box(650, 360, 160, 20, '#34495e');
    label('HOTEL OS', 730, 375, 12, '#ecf0f1', 'center'); label('Sẵn sàng', 730, 400, 11, '#2c3e50', 'center');
    box(710, 470, 40, 10, '#2c3e50'); box(680, 478, 100, 10, '#1a252f');
    
    box(640, 495, 180, 45, '#1f2937'); box(645, 500, 170, 35, '#374151'); box(725, 510, 10, 15, '#fbbf24'); box(692, 528, 76, 5, '#111827'); 

    box(560, 440, 50, 50, '#fff'); box(565, 445, 15, 15, '#000'); box(590, 445, 15, 15, '#000'); box(565, 470, 15, 15, '#000'); 
    box(585, 465, 5, 5, '#000'); box(595, 475, 5, 5, '#000'); box(575, 480, 5, 5, '#000'); box(585, 485, 5, 5, '#000'); box(595, 465, 5, 5, '#000'); box(575, 465, 5, 5, '#000');
    label('QR', 585, 498, 8, '#000', 'center');
    
    box(380, 505, 200, 40, '#4a2e14'); box(380, 500, 200, 8, '#6e4723');
    for(let i=0; i<6; i++){ const kx = 390 + i*30; box(kx, 513, 24, 24, '#f4ebd9'); box(kx+8, 516, 8, 12, '#e5c07b'); label(String(101+i), kx+12, 531, 9, '#4a2e14', 'center'); }
    label('QUẦY LỄ TÂN', 480, 585, 18, '#e8d5b5', 'center');
    
    drawGuest(); 
   
    if (currentGuest && guestPatienceEndTime > 0) {
      const timeLeft = guestPatienceEndTime - Date.now();
      if (timeLeft > 0) {
        const total = guestMaxPatience; const ratio = timeLeft / total; const cx = 250; const cy = 250; const radius = 35;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * ratio));
        let color = '#22c55e'; let icon = '😁';
        if (ratio <= 0.5) { color = '#f59e0b'; icon = '🙂'; } 
        if (ratio <= 0.2) { color = '#ef4444'; icon = '😡'; } 
        ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.stroke();
        ctx.font = '45px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icon, cx, cy);
      }
    }
  } else {
    box(0, 0, 960, 600, '#94a3b8'); box(360, 0, 240, 600, '#991b1b'); box(370, 0, 220, 600, '#b91c1c'); 
    const roomW = 250; const roomH = 150; const startY = 70; const gap = 15;
    let currentType = "";
    if(currentFloor === 2) currentType = "Phòng Đơn";
    else if(currentFloor === 3) currentType = "Phòng Đôi";
    else if(currentFloor === 4) currentType = "Phòng VIP";
    else if(currentFloor === 5) currentType = "Phòng Lãng Mạn";
    else if(currentFloor === 6) currentType = "Phòng Tổng Thống";

    function drawRoomTopDown(x, y, roomNumber, isLeft) {
      const currentRoom = roomState.find(r => r.number === roomNumber);
      let bgColor = '#f1f5f9';
      if (currentRoom.status === 'Có khách') bgColor = '#dcfce7';
      if (currentRoom.status === 'Cần dọn') bgColor = '#fef08a';
      
      box(x, y, roomW, roomH, bgColor);
      c.strokeStyle = '#475569'; c.lineWidth = 6; c.strokeRect(x, y, roomW, roomH);
      const doorW = 40; const doorY = y + roomH/2 - doorW/2;
      const doorX = isLeft ? x + roomW - 3 : x - 3;
      box(doorX, doorY, 6, doorW, '#ffdc7a');

      if (currentType === "Phòng Đơn") {
        box(x + 20, y + 20, 60, 80, '#cbd5e1'); box(x + 20, y + 20, 60, 20, '#94a3b8'); box(x + roomW - 80, y + 20, 60, 30, '#78350f');
      } else if (currentType === "Phòng Đôi") {
        box(x + 20, y + 20, 100, 100, '#cbd5e1'); box(x + 20, y + 20, 100, 25, '#94a3b8'); box(x + roomW - 80, y + 20, 60, 30, '#78350f');
      } else if (currentType === "Phòng VIP") {
        box(x + 20, y + 20, 120, 110, '#e2e8f0'); box(x + 20, y + 20, 120, 30, '#94a3b8'); box(x + 160, y + 90, 60, 40, '#475569');
      } else if (currentType === "Phòng Lãng Mạn") {
        c.fillStyle = '#fbcfe8'; c.beginPath(); c.arc(x + 60, y + 60, 40, 0, Math.PI * 2); c.fill();
        box(x + 40, y + 30, 40, 20, '#f472b6'); 
        c.fillStyle = '#ef4444'; c.beginPath(); c.arc(x + 160, y + 70, 15, Math.PI, 0); c.arc(x + 190, y + 70, 15, Math.PI, 0); c.lineTo(x + 175, y + 110); c.fill();
      } else if (currentType === "Phòng Tổng Thống") {
        box(x + 20, y + 20, 130, 110, '#e2e8f0'); box(x + 20, y + 20, 130, 30, '#94a3b8');
        box(x + 170, y + 20, 60, 40, '#334155'); box(x + 170, y + 90, 60, 30, '#78350f');
        c.fillStyle = '#fbbf24'; c.beginPath(); c.arc(x + 85, y + 90, 15, 0, Math.PI * 2); c.fill();
      }

      if (currentRoom.status === 'Có khách' && currentRoom.guests && currentRoom.guests.length > 0) {
        
        const num = currentRoom.guests.length; const pX = currentRoom.guestPos; 

        if (pX === 'bed') {
          if (num === 1) { drawGuestInRoom(x + 60, y + 60, currentRoom.guests[0]); }
          else if (num === 2) { drawGuestInRoom(x + 50, y + 60, currentRoom.guests[0]); drawGuestInRoom(x + 80, y + 60, currentRoom.guests[1]); }
          else if (num === 3) { drawGuestInRoom(x + 40, y + 50, currentRoom.guests[0]); drawGuestInRoom(x + 80, y + 50, currentRoom.guests[1]); drawGuestInRoom(x + 60, y + 80, currentRoom.guests[2]); }
          else if (num === 4) { drawGuestInRoom(x + 40, y + 50, currentRoom.guests[0]); drawGuestInRoom(x + 80, y + 50, currentRoom.guests[1]); drawGuestInRoom(x + 40, y + 80, currentRoom.guests[2]); drawGuestInRoom(x + 80, y + 80, currentRoom.guests[3]); }
        } else if (pX === 'desk') {
          if (num === 1) { drawGuestInRoom(x + roomW - 50, y + 40, currentRoom.guests[0]); }
          else if (num === 2) { drawGuestInRoom(x + roomW - 50, y + 40, currentRoom.guests[0]); drawGuestInRoom(x + roomW - 70, y + 70, currentRoom.guests[1]); }
          else if (num === 3) { drawGuestInRoom(x + roomW - 40, y + 40, currentRoom.guests[0]); drawGuestInRoom(x + roomW - 70, y + 40, currentRoom.guests[1]); drawGuestInRoom(x + roomW - 55, y + 70, currentRoom.guests[2]); }
          else if (num === 4) { drawGuestInRoom(x + roomW - 30, y + 40, currentRoom.guests[0]); drawGuestInRoom(x + roomW - 60, y + 40, currentRoom.guests[1]); drawGuestInRoom(x + roomW - 40, y + 70, currentRoom.guests[2]); drawGuestInRoom(x + roomW - 70, y + 70, currentRoom.guests[3]); }
        } else if (pX === 'left') {
          if (num === 1) { drawGuestInRoom(x + 80, y + roomH/2, currentRoom.guests[0]); }
        } else if (pX === 'right') {
          if (num === 1) { drawGuestInRoom(x + roomW - 80, y + roomH/2, currentRoom.guests[0]); }
        } else {
          if (num === 1) { drawGuestInRoom(x + roomW/2, y + roomH/2, currentRoom.guests[0]); }
          else if (num === 2) { drawGuestInRoom(x + roomW/2 - 30, y + roomH/2, currentRoom.guests[0]); drawGuestInRoom(x + roomW/2 + 30, y + roomH/2, currentRoom.guests[1]); }
          else if (num === 3) { drawGuestInRoom(x + roomW/2, y + roomH/2 - 30, currentRoom.guests[0]); drawGuestInRoom(x + roomW/2 - 30, y + roomH/2 + 20, currentRoom.guests[1]); drawGuestInRoom(x + roomW/2 + 30, y + roomH/2 + 20, currentRoom.guests[2]); }
          else if (num === 4) { drawGuestInRoom(x + roomW/2 - 30, y + roomH/2 - 20, currentRoom.guests[0]); drawGuestInRoom(x + roomW/2 + 30, y + roomH/2 - 20, currentRoom.guests[1]); drawGuestInRoom(x + roomW/2 - 30, y + roomH/2 + 20, currentRoom.guests[2]); drawGuestInRoom(x + roomW/2 + 30, y + roomH/2 + 20, currentRoom.guests[3]); }
        }
      }

      if (currentRoom.status === 'Có khách' && currentRoom.checkOutTime > 0) {
        const timeLeft = currentRoom.checkOutTime - Date.now(); 
        const totalTime = currentRoom.stayHours * 75 * 1000; 
        let progress = 1 - (timeLeft / totalTime); 
        if (progress < 0) progress = 0; if (progress > 1) progress = 1;
        box(x + 20, y + roomH - 35, roomW - 40, 15, '#cbd5e1'); box(x + 20, y + roomH - 35, (roomW - 40) * progress, 15, '#22c55e');
        const secondsLeft = Math.ceil(timeLeft / 1000);
        if (secondsLeft > 0) { let timeDisplay = secondsLeft > 60 ? Math.ceil(secondsLeft/60) + "p" : secondsLeft + "s"; label(timeDisplay, x + roomW/2, y + roomH - 22, 12, '#1e293b', 'center'); }
      }

      label(roomNumber.toString(), x + 15, y + roomH - 15, 16, '#1e293b', 'left');
      label(currentType, x + roomW - 15, y + roomH - 15, 10, '#64748b', 'right');

    if (typeof incActiveForRoom === 'function') { const im = incActiveForRoom(roomNumber); if (im) {
      const fx = im.status === 'fixing';
      label(fx ? 'ĐANG SỬA' : 'CẦN SỬA', x + roomW/2, y + 30, 14, fx ? '#3b82f6' : '#ef4444', 'center');
      const ratio = Math.max(0, Math.min(1, (im.deadline - Date.now()) / INC_LIMIT)), cx = x + roomW/2, cy = y + 75;
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.strokeStyle = fx ? '#3b82f6' : (ratio <= 0.2 ? '#ef4444' : (ratio <= 0.5 ? '#f59e0b' : '#22c55e')); ctx.lineWidth = 5; ctx.stroke();
      label(Math.ceil(ratio * INC_LIMIT / 1000) + 's', cx, cy + 4, 12, '#1e293b', 'center');
      if (im.status === 'needTech') {
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x + 8, y + 102, roomW - 16, 20);
        label('📞 Gọi thợ', cx, y + 116, 12, '#ffffff', 'center');
      }
    } }

    // HIỂN THỊ TRẠNG THÁI DỌN DẸP (CÓ VÒNG TRÒN ĐẾM NGƯỢC)
if (currentRoom.status === 'Cần dọn') {
  
  // Xác định xem nhân viên có đang dọn phòng này không
  const isCleaningNow = (typeof cleaner1 !== 'undefined' && cleaner1.targetRoom === roomNumber && cleaner1.state === 'cleaning') || 
                        (typeof cleaner2 !== 'undefined' && cleaner2.targetRoom === roomNumber && cleaner2.state === 'cleaning');
  
  let timeLeft = 0;
  let maxTime = 1;

  if (isCleaningNow) {
    timeLeft = cleaningProgressTimer * 1000; // Thời gian dọn 10s
    maxTime = 10000;
    label("ĐANG DỌN", x + roomW/2, y + 30, 14, '#3b82f6', 'center');
  } else {
    timeLeft = cleaningEndTime - Date.now(); // Thời gian chờ khách dọn (60s)
    maxTime = cleaningMaxTime;
    label("CẦN DỌN", x + roomW/2, y + 30, 14, '#ef4444', 'center');
  }

  if (timeLeft > 0) {
    const secondsLeft = Math.ceil(timeLeft / 1000);
    
    // 1. Vẽ vòng tròn đếm ngược
    const cx = x + roomW / 2;
    const cy = y + 75; 
    const radius = 20;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    const ratio = timeLeft / maxTime;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * ratio));
    
    let color = '#22c55e'; 
    if (isCleaningNow) color = '#3b82f6'; 
    if (ratio <= 0.5) color = '#f59e0b'; 
    if (ratio <= 0.2) color = '#ef4444'; 

    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Vẽ số giây
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(secondsLeft + 's', cx, cy);
  }
}
    }

    for(let i=0; i<3; i++){ drawRoomTopDown(360 - roomW - 30, startY + i * (roomH + gap), (currentFloor * 100) + i + 1, true); }
    for(let i=0; i<3; i++){ drawRoomTopDown(360 + 240 + 30, startY + i * (roomH + gap), (currentFloor * 100) + 4 + i, false); }

    box(440, 5, 80, 50, '#cbd5e1'); box(445, 10, 70, 40, '#94a3b8');
    drawJanitor(); 
    drawRoomCleaners(currentFloor, roomState); 
    drawGuide(currentFloor); 
    label("THANG MÁY", 480, 35, 10, '#1e293b', 'center');
    label("HÀNH LANG", 480, 320, 18, '#fca5a5', 'center'); label(`TẦNG ${currentFloor}`, 480, 350, 22, '#ffffff', 'center');
  }
}

function resizeAll(){
  const rect = scene.getBoundingClientRect(); const aw = rect.width, ah = rect.height; const ar = 960 / 600; let w, h;
  if(aw/ah > ar){ h = ah; w = h * ar; } else { w = aw; h = w / ar; }
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; canvas.style.left = (aw - w) / 2 + 'px'; canvas.style.top = ((ah - h) / 2 - 50) + 'px';
  const sx = w/960, sy = h/600; const ox = (aw - w) / 2, oy = (ah - h) / 2;
  if(computerBtn) { computerBtn.style.left = ox + 640*sx + 'px'; computerBtn.style.top = oy + 230*sy + 'px'; computerBtn.style.width = 180*sx + 'px'; computerBtn.style.height = 120*sy + 'px'; }
  if(keysBtn) { keysBtn.style.left = ox + 380*sx + 'px'; keysBtn.style.top = oy + 375*sy + 'px'; keysBtn.style.width = 200*sx + 'px'; keysBtn.style.height = 40*sy + 'px'; }
  
  const cashDrawerBtn = document.getElementById('cashDrawerBtn');
  if(cashDrawerBtn) { cashDrawerBtn.style.left = ox + 640*sx + 'px'; cashDrawerBtn.style.top = oy + 370*sy + 'px'; cashDrawerBtn.style.width = 180*sx + 'px'; cashDrawerBtn.style.height = 50*sy + 'px'; cashDrawerBtn.style.border = '2px dashed #ef4444'; cashDrawerBtn.style.borderRadius = '6px'; }
  const qrBtn = document.getElementById('qrBtn');
  if(qrBtn) { qrBtn.style.left = ox + 560*sx + 'px'; qrBtn.style.top = oy + 320*sy + 'px'; qrBtn.style.width = 50*sx + 'px'; qrBtn.style.height = 50*sy + 'px'; qrBtn.style.border = '2px dashed #ef4444'; qrBtn.style.borderRadius = '6px'; }
  draw();
}
