// ==========================================
// 1. KHAI BÁO BIẾN TOÀN CỤC
// ==========================================
const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d');
const scene = document.getElementById('scene');
const toast = document.getElementById('toast');
const computerBtn = document.getElementById('computerBtn');
const keysBtn = document.getElementById('keysBtn');
const navBtns = document.querySelectorAll('.nav-btn');

let currentFloor = 1;
let selectedRoom = 1;
let toastTimer;
let chatStep = 0;
let guestStayHours = 0;
let currentBillData = null;

let hotelMoney = 500000;
let playerMoney = 0; 
let totalRevenue = 0;
let occupiedRooms = 0;

const ROOM_PRICES = {
  "Phòng Đơn": { hour: 100000, night: 700000, day: 500000 },
  "Phòng Đôi": { hour: 200000, night: 1100000, day: 700000 },
  "Phòng VIP": { hour: 250000, night: 1300000, day: 900000 },
  "Phòng Lãng Mạn": { hour: 300000, night: 1500000, day: 950000 },
  "Phòng Tổng Thống": { hour: 500000, night: 2000000, day: 1500000 }
};

let selectedRentType = 'hour'; 
const COMMISSION_RATE = 0.4; 
let currentGuest = null; 
let registeredGuests = []; 

const roomState = Array.from({length:30},(_,i)=> {
  let floor = Math.floor(i / 6) + 2; 
  let roomNum = floor * 100 + (i % 6) + 1;
  return { number: roomNum, status: 'Trống', checkOutTime: 0, guestPos: 'center' };
});

function box(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(x,y,w,h); }
function label(t,x,y,size=18,color='#26384a',align='left'){ ctx.fillStyle=color; ctx.font=`bold ${size}px system-ui`; ctx.textAlign=align; ctx.fillText(t,x,y); }
function showToast(t){ toast.textContent = t; toast.style.display = 'block'; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.style.display = 'none', 2500); }

function updateMoneyUI() {
  document.getElementById('money').innerText = hotelMoney.toLocaleString('vi-VN') + 'đ';
  document.getElementById('dash-occupied').innerText = occupiedRooms + ' / 30';
  document.getElementById('dash-revenue').innerText = totalRevenue.toLocaleString('vi-VN') + 'đ';
}
updateMoneyUI();

// ==========================================
// 2. TẠO KHÁCH
// ==========================================
function spawnGuest() {
  if (currentGuest) return; 
  const allRooms = [
    { type: "Phòng Đơn", floor: 2 }, { type: "Phòng Đôi", floor: 3 }, { type: "Phòng VIP", floor: 4 },
    { type: "Phòng Lãng Mạn", floor: 5 }, { type: "Phòng Tổng Thống", floor: 6 }
  ];
  const isCouple = Math.random() > 0.5;
  let req = isCouple ? allRooms.slice(1)[Math.floor(Math.random() * 4)] : allRooms[Math.floor(Math.random() * 5)];
  
  const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
  const maleNames = ["Anh", "Bình", "Cường", "Dũng", "Hải", "Hùng", "Khánh", "Long", "Nam", "Phong"];
  const femaleNames = ["Anh", "Hoa", "Lan", "Linh", "Mai", "Nga", "Ngọc", "Nhung", "Oanh", "Thảo"];
  
  const createPerson = (isMale) => {
    const ho = lastNames[Math.floor(Math.random() * lastNames.length)];
    const ten = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    return { name: ho + " " + ten, isMale: isMale };
  };

  let guestsList = isCouple ? [createPerson(true), createPerson(false)] : [createPerson(Math.random() > 0.5)];
  const displayName = guestsList.length > 1 ? `${guestsList[0].name} & ${guestsList[1].name}` : guestsList[0].name;

  currentGuest = { guests: guestsList, reqType: req.type, reqFloor: req.floor, rentType: 'hour', displayName: displayName };
  draw(); 
  
  setTimeout(() => { if (currentGuest) startConversation(); }, 500);
}
function drawGuest() {
  if (!currentGuest || currentFloor !== 1) return;
  const g = currentGuest;
  const baseX = 200; const gy = 420; 
  
  if (g.guests.length === 1) { 
    drawGuestAtReception(baseX + 50, gy, g.guests[0]); 
  } 
  else { 
    drawGuestAtReception(baseX - 20, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 110, gy, g.guests[1]); 
  }
}


// ==========================================
// 3. VẼ CẢNH CHÍNH
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

  if (currentFloor === 1) {
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
    box(380, 440, 200, 40, '#4a2e14'); box(380, 435, 200, 8, '#6e4723');
    for(let i=0; i<6; i++){
      const kx = 390 + i*30;
      box(kx, 448, 24, 24, '#f4ebd9'); box(kx+8, 451, 8, 12, '#e5c07b');
      label(String(101+i), kx+12, 466, 9, '#4a2e14', 'center');
    }
    label('QUẦY LỄ TÂN', 480, 540, 18, '#e8d5b5', 'center');
    drawGuest(); 
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

      if (currentRoom.status === 'Có khách' && currentRoom.guests) {
        const isCouple = currentRoom.guests.length > 1; 
        const pX = currentRoom.guestPos;
        if (pX === 'bed') {
          if (isCouple) { drawGuestInRoom(x + 50, y + 60, currentRoom.guests[0]); drawGuestInRoom(x + 80, y + 60, currentRoom.guests[1]); } else { drawGuestInRoom(x + 60, y + 60, currentRoom.guests[0]); }
        } else if (pX === 'desk') {
          if (isCouple) { drawGuestInRoom(x + roomW - 50, y + 40, currentRoom.guests[0]); drawGuestInRoom(x + roomW - 70, y + 70, currentRoom.guests[1]); } else { drawGuestInRoom(x + roomW - 50, y + 40, currentRoom.guests[0]); }
        } else {
          if (isCouple) { drawGuestInRoom(x + roomW/2 - 20, y + roomH/2, currentRoom.guests[0]); drawGuestInRoom(x + roomW/2 + 20, y + roomH/2, currentRoom.guests[1]); } else { drawGuestInRoom(x + roomW/2, y + roomH/2, currentRoom.guests[0]); }
        }
      }

      if (currentRoom.status === 'Có khách' && currentRoom.checkOutTime > 0) {
        const timeLeft = currentRoom.checkOutTime - Date.now(); 
        const totalTime = currentRoom.stayHours * 12 * 1000; 
        let progress = 1 - (timeLeft / totalTime); 
        if (progress < 0) progress = 0; if (progress > 1) progress = 1;
        box(x + 20, y + roomH - 35, roomW - 40, 15, '#cbd5e1'); box(x + 20, y + roomH - 35, (roomW - 40) * progress, 15, '#22c55e');
        const secondsLeft = Math.ceil(timeLeft / 1000);
        if (secondsLeft > 0) { let timeDisplay = secondsLeft > 60 ? Math.ceil(secondsLeft/60) + "p" : secondsLeft + "s"; label(timeDisplay, x + roomW/2, y + roomH - 22, 12, '#1e293b', 'center'); }
      }

      label(roomNumber.toString(), x + 15, y + roomH - 15, 16, '#1e293b', 'left');
      label(currentType, x + roomW - 15, y + roomH - 15, 10, '#64748b', 'right');
    }

    for(let i=0; i<3; i++){ drawRoomTopDown(360 - roomW - 30, startY + i * (roomH + gap), (currentFloor * 100) + i + 1, true); }
    for(let i=0; i<3; i++){ drawRoomTopDown(360 + 240 + 30, startY + i * (roomH + gap), (currentFloor * 100) + 4 + i, false); }

    box(440, 5, 80, 50, '#cbd5e1'); box(445, 10, 70, 40, '#94a3b8');
    label("THANG MÁY", 480, 35, 10, '#1e293b', 'center');
    label("HÀNH LANG", 480, 320, 18, '#fca5a5', 'center'); label(`TẦNG ${currentFloor}`, 480, 350, 22, '#ffffff', 'center');
  }
}
// ==========================================
// 4. CĂN CHỈNH MÀN HÌNH & RENDER PHÒNG
// ==========================================
function resizeAll(){
  const rect = scene.getBoundingClientRect(); const aw = rect.width, ah = rect.height; const ar = 960 / 600; let w, h;
  if(aw/ah > ar){ h = ah; w = h * ar; } else { w = aw; h = w / ar; }
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; canvas.style.left = (aw - w) / 2 + 'px'; canvas.style.top = ((ah - h) / 2 - 50) + 'px';
  const sx = w/960, sy = h/600; const ox = (aw - w) / 2, oy = (ah - h) / 2;
  if(computerBtn) { computerBtn.style.left = ox + 640*sx + 'px'; computerBtn.style.top = oy + 230*sy + 'px'; computerBtn.style.width = 180*sx + 'px'; computerBtn.style.height = 120*sy + 'px'; }
  if(keysBtn) { keysBtn.style.left = ox + 380*sx + 'px'; keysBtn.style.top = oy + 315*sy + 'px'; keysBtn.style.width = 200*sx + 'px'; keysBtn.style.height = 40*sy + 'px'; }
  draw();
}

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
  const room = roomState.find(r => r.number === roomNum); if (!room) return;
  if (room.status === 'Cần dọn') { room.status = 'Trống'; showToast(`Đã dọn dẹp phòng ${room.number}!`); draw(); } 
  else if (room.status === 'Có khách') { showToast(`Phòng ${room.number} đang có khách. Không thể dọn!`); } 
  else { showToast(`Phòng ${room.number} đang trống.`); }
}

// ==========================================
// 5. HỆ THỐNG HỘI THOẠI
// ==========================================
function startConversation() {
  const btn = document.getElementById('chatActionBtn');
  btn.style.display = 'block'; btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Chào khách"; 
  document.getElementById('takeKey').disabled = true; document.getElementById('takeKey').style.opacity = '0.5';
  if (!currentGuest) return;
  chatStep = 1;
  document.getElementById('chatBox').style.display = 'block';
  document.getElementById('chatGuestName').innerText = currentGuest.displayName;
  document.getElementById('chatHistory').innerHTML = '';
  addChatMessage(currentGuest.displayName, "Xin chào!", '#1e3a52', 'left');
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

  if (chatStep === 1) {
    addChatMessage("Lễ tân", "Xin chào, tôi có thể giúp gì cho bạn?", '#e67e22', 'right');
    setTimeout(() => {
      addChatMessage(currentGuest.displayName, `Tôi muốn thuê 1 ${currentGuest.reqType}.`, '#1e3a52', 'left');
      btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Hỏi thời gian"; chatStep = 2;
    }, 500); 
  } 
  else if (chatStep === 2) {
    addChatMessage("Lễ tân", "Vậy bạn dự định ở trong bao lâu?", '#e67e22', 'right');
    setTimeout(() => {
      const rand = Math.random(); let guestReply = ""; let rentType = ""; let hoursToStay = 0;
      const currentGameHour = gameTime.getHours();
      const canStayOvernight = (currentGameHour >= 18 && currentGameHour < 24);

      if (rand < 0.4) {
        hoursToStay = Math.floor(Math.random() * 10) + 2; guestReply = `Tôi ở khoảng ${hoursToStay} tiếng thôi.`; rentType = 'hour'; 
      } else if (rand < 0.7 && canStayOvernight) {
        if (currentGameHour >= 18) { hoursToStay = (24 - currentGameHour) + 7; }
        if (hoursToStay <= 0) hoursToStay = 12; 
        guestReply = `Tôi sẽ ở qua đêm, sáng mai 7h tôi đi.`; rentType = 'night'; 
      } else {
        const days = Math.floor(Math.random() * 3) + 1; hoursToStay = days * 24;
        guestReply = `Tôi ở dài hạn khoảng ${days} ngày.`; rentType = 'day'; 
      }
      
      currentGuest.rentType = rentType; currentGuest.stayHours = hoursToStay; guestStayHours = hoursToStay;
      addChatMessage(currentGuest.displayName, guestReply, '#1e3a52', 'left');
      btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Xin CCCD & Tuổi"; chatStep = 3;
    }, 500); 
  } 
  else if (chatStep === 3) {
    addChatMessage("Lễ tân", "Vui lòng cho tôi xin số Căn cước công dân và số tuổi của bạn.", '#e67e22', 'right');
    setTimeout(() => {
      const idCard = "0" + Math.floor(Math.random() * 90000000000 + 10000000000);
   const age = Math.floor(Math.random() * 55) + 6; // Random từ 6 đến 60 tuổi
      currentGuest.idCard = idCard; currentGuest.age = age;
      addChatMessage(currentGuest.displayName, `CCCD của tôi là: ${idCard}, năm nay tôi ${age} tuổi.`, '#1e3a52', 'left');

      const now = new Date(gameTime); 
      const timeInStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`;
      let outTime;
      if (currentGuest.rentType === 'night') {
        outTime = new Date(now); outTime.setDate(outTime.getDate() + 1); outTime.setHours(7, 0, 0, 0); 
      } else {
        outTime = new Date(now.getTime() + (currentGuest.stayHours * 60 * 60000)); 
      }
      const timeOutStr = `${outTime.getHours().toString().padStart(2, '0')}:${outTime.getMinutes().toString().padStart(2, '0')} - ${outTime.getDate()}/${outTime.getMonth() + 1}`;
      
      currentGuest.timeIn = timeInStr; currentGuest.timeOut = timeOutStr; currentGuest.outTimeObj = outTime;

      document.getElementById('guestSaidName').innerText = currentGuest.displayName;
      document.getElementById('guestSaidReq').innerText = currentGuest.reqType + ` (${currentGuest.rentType === 'hour' ? 'Theo giờ' : currentGuest.rentType === 'night' ? 'Qua đêm' : 'Dài hạn'})`;
      document.getElementById('guestSaidTime').innerText = currentGuest.stayHours + " giờ";
      document.getElementById('guestSaidId').innerText = currentGuest.idCard;

      const availableRoom = roomState.find(r => Math.floor(r.number / 100) === currentGuest.reqFloor && r.status === 'Trống');
      document.getElementById('regRoom').value = availableRoom ? `Phòng ${availableRoom.number}` : "Hết phòng!";
      document.getElementById('regName').value = currentGuest.displayName;
      document.getElementById('regAge').value = currentGuest.age;
      document.getElementById('regId').value = currentGuest.idCard;
      document.getElementById('regPeople').value = currentGuest.guests.length;
      document.getElementById('regTimeIn').value = currentGuest.timeIn;
      document.getElementById('regTimeOut').value = currentGuest.timeOut;
      
      btn.style.display = 'none';
      document.getElementById('openComputerFromChatBtn').style.display = 'block';
      document.getElementById('openComputerFromChatBtn').innerText = "💻 Mở Đăng ký trong Máy tính";
    }, 500); 
  }
}

function generateBill() {
  if (!currentGuest) return;
  const name = document.getElementById('regName').value;
  const roomBooked = document.getElementById('regRoom').value;
  const prices = ROOM_PRICES[currentGuest.reqType];
  let basePrice = prices[currentGuest.rentType];
  if (currentGuest.guests.length > 1) { basePrice = basePrice * 2 * 0.7; }
  const vat = basePrice * 0.1; const total = basePrice + vat;

  currentBillData = { name: name, room: roomBooked, basePrice: basePrice, vat: vat, total: total };

  document.getElementById('billName').innerText = name;
  document.getElementById('billRoom').innerText = roomBooked;
  document.getElementById('billIn').innerText = currentGuest.timeIn;
  document.getElementById('billOut').innerText = currentGuest.timeOut;
  document.getElementById('billPrice').innerText = basePrice.toLocaleString('vi-VN') + 'đ';
  document.getElementById('billVat').innerText = vat.toLocaleString('vi-VN') + 'đ';
  document.getElementById('billTotal').innerText = total.toLocaleString('vi-VN') + 'đ';

  document.getElementById('billPanel').classList.add('show');
}
// ==========================================
// 6. KHỞI TẠO GIAO DIỆN & CÁC SỰ KIỆN
// ==========================================
function initUI() {
  // Bộ đếm 5 giây đổi vị trí khách
setInterval(() => {
  let changed = false; 
  const positions = ['bed', 'desk', 'center']; 
  roomState.forEach(room => { 
    if (room.status === 'Có khách') { 
      room.guestPos = positions[Math.floor(Math.random() * positions.length)]; 
      changed = true; 
    } 
  });
  if (changed && currentFloor !== 1) { draw(); }
}, 5000); 
  // Sự kiện chạm vào phòng để dọn dẹp ở Hành lang
canvas.addEventListener('click', (e) => {
  if (currentFloor === 1) return; // Không xử lý nếu đang ở Sảnh

  const rect = canvas.getBoundingClientRect(); 
  const scaleX = 960 / rect.width; 
  const scaleY = 600 / rect.height;
  const clickX = (e.clientX - rect.left) * scaleX; 
  const clickY = (e.clientY - rect.top) * scaleY;

  const roomW = 250; const roomH = 150; const startY = 70; const gap = 15;
  
  for(let i=0; i<3; i++){
    // Phòng bên trái
    let x = 360 - roomW - 30; 
    let y = startY + i * (roomH + gap);
    if (clickX >= x && clickX <= x + roomW && clickY >= y && clickY <= y + roomH) { 
      handleRoomClick((currentFloor * 100) + i + 1); return; 
    }
    // Phòng bên phải
    x = 360 + 240 + 30; 
    y = startY + i * (roomH + gap);
    if (clickX >= x && clickX <= x + roomW && clickY >= y && clickY <= y + roomH) { 
      handleRoomClick((currentFloor * 100) + 4 + i); return; 
    }
  }
});
  // 1. Nút Bắt đầu
  document.getElementById('startBtn').onclick = () => { 
    const menu = document.getElementById('mainMenu'); 
    if (menu) menu.remove(); 
    resizeAll(); 
  };
  
  setInterval(spawnGuest, 15000); 
  setTimeout(spawnGuest, 500); 
  
  // 2. Nút trong hội thoại
  document.getElementById('chatActionBtn').onclick = handleChatAction;
  
  // 3. Nút Mở Máy Tính Từ Hội Thoại
  document.getElementById('openComputerFromChatBtn').onclick = () => {
    document.getElementById('computerTabs').style.display = 'none'; 
    document.getElementById('guestSummaryBox').style.display = 'block'; 
    document.getElementById('confirmRegisterBtn').style.display = 'block'; 
    document.getElementById('showBillBtn').style.display = 'none'; 
    document.getElementById('closeComputer').style.display = 'none'; 
    
    document.getElementById('chatBox').style.display = 'none'; 
    document.getElementById('openComputerFromChatBtn').style.display = 'none'; 
    document.getElementById('computerPanel').classList.add('show'); 
    
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));
    document.querySelector('.tab[data-tab="register"]').classList.add('active');
    document.getElementById('tab-register').classList.add('active');
  };

  // 4. Nút Đối Chiếu
  document.getElementById('confirmRegisterBtn').onclick = () => {
    const name = document.getElementById('regName').value;
    const roomBooked = document.getElementById('regRoom').value;
    if (!name || !roomBooked || roomBooked === "Chưa xếp" || roomBooked === "Hết phòng!") {
      showToast("Thông tin chưa chính xác hoặc đã hết phòng. Vui lòng sửa lại!"); return;
    }
    showToast("Đối chiếu thành công! Vui lòng bấm Xem Hóa Đơn.");
    document.getElementById('showBillBtn').style.display = 'block'; 
    document.getElementById('confirmRegisterBtn').style.display = 'none'; 
  };

  // 5. Nút Xem Bill
  document.getElementById('showBillBtn').onclick = generateBill;

  // 6. Nút Thanh Toán Bill
  document.getElementById('payBillBtn').onclick = () => {
    if (!currentBillData) return;
    const commission = currentBillData.basePrice * COMMISSION_RATE;
    const hotelKeep = currentBillData.basePrice - commission;
    hotelMoney += hotelKeep; playerMoney += commission; totalRevenue += currentBillData.basePrice;
    updateMoneyUI();
    document.getElementById('billPanel').classList.remove('show');
    
    setTimeout(() => {
      document.getElementById('keyPanel').classList.add('show');
      document.getElementById('rentOptions').style.display = 'none'; 
      const roomNumMatch = currentBillData.room.match(/\d+/);
      if (roomNumMatch) {
        const roomNum = parseInt(roomNumMatch[0]);
        const roomIndex = roomState.findIndex(r => r.number === roomNum);
        if (roomIndex !== -1) { selectedRoom = roomIndex + 1; }
      }
      renderRoomGrid('rooms');
      const takeKeyBtn = document.getElementById('takeKey');
      takeKeyBtn.disabled = false;
      takeKeyBtn.style.opacity = '1'; 
      showToast(`Đã thanh toán ${currentBillData.total.toLocaleString('vi-VN')}đ. Hãy lấy chìa khóa phòng ${currentBillData.room}!`);
    }, 200);
  };

  // 7. Nút Máy Tính Ở Quầy
  computerBtn.onclick = () => { 
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

  // 8. Nút Đóng Máy Tính
  document.getElementById('closeComputer').onclick = () => {
    document.getElementById('computerPanel').classList.remove('show');
  };

  // 9. Chuyển Đổi Giữa Các Tab
  document.querySelectorAll('.tab').forEach(t=>{ 
    t.onclick = () => { 
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); 
      document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active')); 
      t.classList.add('active'); 
      document.getElementById('tab-'+t.dataset.tab).classList.add('active'); 
      
      if(t.dataset.tab === 'register') {
        document.getElementById('confirmRegisterBtn').style.display = 'block';
        document.getElementById('showBillBtn').style.display = 'none'; 
        document.getElementById('closeComputer').style.display = 'none'; 
        if (currentGuest) { document.getElementById('guestSummaryBox').style.display = 'block'; }
      } else {
        document.getElementById('confirmRegisterBtn').style.display = 'none';
        document.getElementById('showBillBtn').style.display = 'none'; 
        document.getElementById('closeComputer').style.display = 'block'; 
        document.getElementById('guestSummaryBox').style.display = 'none'; 
      }
    }; 
  });

  // 10. Các sự kiện khác
  document.getElementById('openCalendarBtn').onclick = () => { currentMonth = gameTime.getMonth(); currentYear = gameTime.getFullYear(); renderCalendar(); document.getElementById('calendarPanel').classList.add('show'); };
  document.getElementById('closeCalendar').onclick = () => document.getElementById('calendarPanel').classList.remove('show');
  document.getElementById('closeGuide').onclick = () => document.getElementById('guidePanel').classList.remove('show');
  
  document.getElementById('guideBtn').onclick = () => { 
    document.getElementById('panelTitle').innerText = "📖 HƯỚNG DẪN CHƠI"; 
    document.getElementById('panelContent').innerHTML = `<ul><li><b>Đón khách:</b> Đợi khách đến, hội thoại tự động mở.</li><li><b>Máy tính:</b> Đối chiếu thông tin và xuất Bill.</li></ul>`; 
    document.getElementById('guidePanel').classList.add('show'); 
  };
  
  document.getElementById('updateBtn').onclick = showChangelog;

  // 11. Kệ Chìa Khóa
  keysBtn.onclick = () => { renderRoomGrid('rooms'); document.getElementById('keyPanel').classList.add('show'); };
  document.getElementById('closeKey').onclick = () => document.getElementById('keyPanel').classList.remove('show');
  
  document.querySelectorAll('.rent-type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.rent-type-btn').forEach(b => { b.style.background = '#fff'; b.style.borderColor = '#ccc'; b.style.fontWeight = 'normal'; });
      btn.style.background = '#ffe29a'; btn.style.borderColor = '#bd792e'; btn.style.fontWeight = 'bold'; 
      selectedRentType = btn.dataset.type; 
      updateRentPriceDisplay();
    };
  });

  function updateRentPriceDisplay() {
    if (!currentGuest) return;
    const prices = ROOM_PRICES[currentGuest.reqType];
    if (!prices) return;
    let price = prices[selectedRentType];
    if (currentGuest.guests.length > 1) { price = price * 2 * 0.7; }
    document.getElementById('rentPriceDisplay').innerText = price.toLocaleString('vi-VN') + 'đ';
  }

  // 12. Nút Nhận Phòng
  document.getElementById('takeKey').onclick = () => { 
    const roomIndex = selectedRoom - 1;
    const room = roomState[roomIndex];
    
    if (!currentBillData) { showToast("Vui lòng làm thủ tục và thanh toán trên Máy tính trước!"); return; }
    if (`Phòng ${room.number}` !== currentBillData.room) { showToast(`Khách đã thanh toán ${currentBillData.room}. Vui lòng chọn đúng phòng!`); return; }
    if (room.status === 'Có khách') { showToast('Phòng này đang có khách rồi!'); return; }
    if (room.status === 'Cần dọn') { showToast('Phòng này đang cần dọn dẹp!'); return; }

    const prices = ROOM_PRICES[currentGuest.reqType];
    let finalPrice = prices[selectedRentType];
    if (currentGuest.guests.length > 1) { finalPrice = finalPrice * 2 * 0.7; }

    const commission = finalPrice * COMMISSION_RATE;
    const hotelKeep = finalPrice - commission;
    
    room.status = 'Có khách';
    room.guests = currentGuest.guests;
    room.stayHours = currentGuest.stayHours;
    room.guestPos = 'center';
    
    const stayTimeInSeconds = currentGuest.stayHours * 12;
    room.checkOutTime = Date.now() + (stayTimeInSeconds * 1000); 
    
    hotelMoney += hotelKeep; 
    playerMoney += commission;
    totalRevenue += finalPrice; 
    occupiedRooms++;
    updateMoneyUI();
    
    const list = document.getElementById('receipt-list');
    if (list.innerHTML.includes('Chưa có giao dịch')) list.innerHTML = ''; 
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    list.insertAdjacentHTML('afterbegin', `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc; font-size:12px;"><div><b>Phòng ${room.number}</b><br><span style="color:#888">${timeStr}</span></div><div style="text-align:right;"><div style="color:#2c6e9e;">KS thu: ${finalPrice.toLocaleString('vi-VN')}đ</div><div style="color:#e67e22;">Hoa hồng: +${commission.toLocaleString('vi-VN')}đ</div></div></div>`);
    document.getElementById('bill-total').innerText = totalRevenue.toLocaleString('vi-VN') + 'đ';
    document.getElementById('bill-comm').innerText = playerMoney.toLocaleString('vi-VN') + 'đ';

    const checkInDiv = document.getElementById('diaryCheckIn');
    if (checkInDiv.innerHTML.includes('Chưa có dữ liệu')) checkInDiv.innerHTML = '';
    const logTimeStr = `${gameTime.getHours().toString().padStart(2, '0')}:${gameTime.getMinutes().toString().padStart(2, '0')} - ${gameTime.getDate()}/${gameTime.getMonth() + 1}`;
    checkInDiv.insertAdjacentHTML('afterbegin', `<div style="padding:5px; border-bottom:1px dashed #ccc;"><b>Phòng ${room.number}</b> - ${logTimeStr}</div>`);

    document.getElementById('keyPanel').classList.remove('show'); 
    document.getElementById('rentOptions').style.display = 'none';
    document.getElementById('computerPanel').classList.remove('show'); 
    
    currentGuest = null; 
    currentBillData = null;

    document.getElementById('regName').value = '';
    document.getElementById('regId').value = '';
    document.getElementById('regAge').value = '';
    document.getElementById('regRoom').value = '';
    document.getElementById('regTimeIn').value = '';
    document.getElementById('regTimeOut').value = '';
    
    document.getElementById('takeKey').disabled = true;
    document.getElementById('takeKey').style.opacity = '0.5';

    draw(); 
    showToast(`Đã nhận phòng ${room.number} thành công!`);
  };

  // 13. Thanh Điều Hướng Dưới Cùng
  navBtns.forEach(btn => {
    btn.onclick = () => {
      navBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
      if (btn.id === 'btnLobby') { currentFloor = 1; draw(); }
      else if (btn.id === 'btnElevator') { 
        document.querySelectorAll('.elev-btn[data-floor]').forEach(eb => {
          const tag = eb.querySelector('.current-tag');
          if(tag) tag.style.display = (parseInt(eb.dataset.floor) === currentFloor) ? 'inline-block' : 'none';
        });
        document.getElementById('elevatorPanel').classList.add('show'); 
      }
      else if (btn.id === 'btnProfile') { 
        document.getElementById('computerPanel').classList.remove('show');
        document.getElementById('keyPanel').classList.remove('show');
        document.getElementById('billPanel').classList.remove('show');
        document.getElementById('elevatorPanel').classList.remove('show');
        document.getElementById('profilePanel').classList.add('show'); 
      }
    };
  });

  // 14. Thang Máy
  document.getElementById('closeElevator').onclick = () => document.getElementById('elevatorPanel').classList.remove('show');
  document.querySelectorAll('.elev-btn[data-floor]').forEach(btn => {
    btn.onclick = () => {
      currentFloor = parseInt(btn.dataset.floor);
      document.getElementById('elevatorPanel').classList.remove('show');
      if (currentFloor === 1) { navBtns.forEach(b => b.classList.remove('active')); document.getElementById('btnLobby').classList.add('active'); }
      draw(); 
    };
  });

  // 15. Cá Nhân
  document.getElementById('closeProfile').onclick = () => document.getElementById('profilePanel').classList.remove('show');
  document.getElementById('saveProfile').onclick = () => {
    const newName = document.getElementById('inputName').value;
    if(newName.trim() !== "") { document.getElementById('hudName').innerHTML = '👤 ' + newName; showToast("Đã lưu!"); }
    document.getElementById('profilePanel').classList.remove('show');
  };
}

// ==========================================
// 7. HỆ THỐNG THỜI GIAN, LỊCH VÀ VÒNG LẶP
// ==========================================
let gameTime = new Date(2024, 0, 1, 0, 0, 0); 
let currentMonth = gameTime.getMonth();
let currentYear = gameTime.getFullYear();

function updateClockUI() {
  const h = gameTime.getHours().toString().padStart(2, '0');
  const m = gameTime.getMinutes().toString().padStart(2, '0');
  document.getElementById('clockTime').innerText = `${h}h${m}p`;
  
  const hour = gameTime.getHours();
  const shiftElement = document.getElementById('clockShift');
  if (hour >= 6 && hour < 18) {
    shiftElement.innerText = "☀️ Ca Ngày"; shiftElement.style.color = "#d28a43"; 
  } else {
    shiftElement.innerText = "🌙 Ca Đêm"; shiftElement.style.color = "#2c6e9e"; 
  }
  
  const d = gameTime.getDate().toString().padStart(2, '0');
  const mo = (gameTime.getMonth() + 1).toString().padStart(2, '0');
  const y = gameTime.getFullYear();
  document.getElementById('gameDate').innerText = `${d}/${mo}/${y}`;
}

setInterval(() => { gameTime.setMinutes(gameTime.getMinutes() + 5); updateClockUI(); }, 1000);

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  document.getElementById('calendarTitle').innerText = `📅 ${monthNames[currentMonth]} ${currentYear}`;

  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  days.forEach((d, index) => {
    const el = document.createElement('div'); el.className = 'cal-day header';
    if (index === 5 || index === 6) el.classList.add('cal-holiday');
    el.innerText = d; grid.appendChild(el);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let emptySlots = firstDay === 0 ? 6 : firstDay - 1; 
  for (let i = 0; i < emptySlots; i++) {
    const el = document.createElement('div'); el.className = 'cal-day empty'; grid.appendChild(el);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const el = document.createElement('div'); el.className = 'cal-day'; el.innerText = i;
    const dayOfWeek = new Date(currentYear, currentMonth, i).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) el.classList.add('cal-holiday');
    if (i === gameTime.getDate() && currentMonth === gameTime.getMonth() && currentYear === gameTime.getFullYear()) {
      el.classList.add('today'); el.style.color = 'white';
    }
    grid.appendChild(el);
  }
}

setInterval(() => {
  let needsRedraw = false;
  const now = Date.now();
  roomState.forEach(room => {
    if (room.status === 'Có khách' && room.checkOutTime > 0 && now >= room.checkOutTime) {
      room.status = 'Cần dọn'; room.checkOutTime = 0; occupiedRooms--;
      updateMoneyUI(); 
      
      const checkOutDiv = document.getElementById('diaryCheckOut');
      if (checkOutDiv.innerHTML.includes('Chưa có dữ liệu')) checkOutDiv.innerHTML = '';
      const timeStr = `${gameTime.getHours().toString().padStart(2, '0')}:${gameTime.getMinutes().toString().padStart(2, '0')} - ${gameTime.getDate()}/${gameTime.getMonth() + 1}`;
      checkOutDiv.insertAdjacentHTML('afterbegin', `<div style="padding:5px; border-bottom:1px dashed #ccc;"><b>Phòng ${room.number}</b> - ${timeStr}</div>`);
      
      showToast(`Phòng ${room.number} đã trả phòng. Cần dọn dẹp!`); 
      needsRedraw = true;
    } else if (room.status === 'Có khách') { 
      needsRedraw = true; 
    }
  });
  if (needsRedraw && currentFloor !== 1) { draw(); }
}, 1000);

updateClockUI();
window.addEventListener('DOMContentLoaded', () => { initUI(); resizeAll(); });
window.addEventListener('resize', resizeAll);
window.addEventListener('orientationchange', () => setTimeout(resizeAll, 200));