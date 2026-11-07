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
let cashGivenAmount = 0;
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
let MY_AGE = 25;

// Hàm xác định danh xưng của khách dựa vào tuổi và giới tính
function getPronoun(person) {
  const age = person.age || 20;
  if (person.isMale) {
    if (age < MY_AGE) return "em";
    if (age < MY_AGE + 18) return "anh";
    if (age < MY_AGE + 36) return "chú";
    return "ông";
  } else {
    if (age < MY_AGE) return "em";
    if (age < MY_AGE + 18) return "chị";
    if (age < MY_AGE + 36) return "cô";
    return "bà";
  }
}

// Hàm xác định Lễ tân nên xưng hô thế nào với khách
function getMyPronoun(guestPronoun) {
  if (guestPronoun === "em") {
    const myGender = document.getElementById('inputGender') ? document.getElementById('inputGender').value : "Nam";
    return myGender === "Nữ" ? "chị" : "anh";
  }
  else if (guestPronoun === "anh" || guestPronoun === "chị") {
    return "em";
  }
  else if (guestPronoun === "chú" || guestPronoun === "cô") {
    return "con";
  }
  else if (guestPronoun === "ông" || guestPronoun === "bà") {
    return "cháu";
  }
  return "tôi"; 
}

const roomState = Array.from({length:30},(_,i)=> {
  let floor = Math.floor(i / 6) + 2; 
  let roomNum = floor * 100 + (i % 6) + 1;
  return { number: roomNum, status: 'Trống', checkOutTime: 0, guestPos: 'center' };
});

// Các hàm tiện ích
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
// 2. TẠO KHÁCH & VẼ KHÁCH Ở QUẦY
// ==========================================
function spawnGuest() {
  if (currentGuest) return; 
 const allRooms = [
  { type: "Phòng Đơn", floor: 2 }, { type: "Phòng Đôi", floor: 3 }, { type: "Phòng VIP", floor: 4 },
  { type: "Phòng Lãng Mạn", floor: 5 }, { type: "Phòng Tổng Thống", floor: 6 }
];

// 1. Random số người: 1, 2, 3, hoặc 4 người
const groupSize = Math.floor(Math.random() * 4) + 1; 

// 2. Lọc danh sách phòng hợp lệ dựa trên số lượng người
let validRooms = [];
if (groupSize === 1) {
  // 1 người: Thuê được tất cả các phòng (trừ phòng Lãng Mạn)
  validRooms = allRooms.filter(r => r.type !== "Phòng Lãng Mạn");
} else if (groupSize === 2) {
  // 2 người: Không thuê phòng Đơn, nhưng được thuê phòng Lãng Mạn
  validRooms = allRooms.filter(r => r.type !== "Phòng Đơn");
} else {
  // 3-4 người: Không thuê phòng Đơn và phòng Đôi
  validRooms = allRooms.filter(r => r.type !== "Phòng Đơn" && r.type !== "Phòng Đôi");
}

// Chọn ngẫu nhiên 1 phòng trong danh sách hợp lệ
let req = validRooms[Math.floor(Math.random() * validRooms.length)];
  
// 1. Kho Họ
const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];

// 2. Kho Tên đệm (Dùng chung cho cả nam và nữ)
const middleNames = ["Văn", "Thị", "Hữu", "Ngọc", "Minh", "Thanh", "Đức", "Xuân", "Thu", "Hồng", "Quang", "Tuấn", "Khánh", "Bảo", "Gia", "Hoàng"];

// 3. Kho Tên chính
const maleNames = ["Anh", "Bình", "Cường", "Dũng", "Hải", "Hùng", "Khánh", "Long", "Nam", "Phong", "Sơn", "Tùng", "Trung", "Hiếu", "Kiên", "Lâm", "Mạnh", "Nghĩa", "Phát", "Quân", "Tài", "Thắng", "Thiện", "Toàn", "Vinh", "Vũ", "Huy", "Hoàng", "Khang", "Bảo"];
const femaleNames = ["Anh", "Hoa", "Lan", "Linh", "Mai", "Nga", "Ngọc", "Nhung", "Oanh", "Thảo", "Trang", "Yến", "Hà", "Hạnh", "Hiền", "Hương", "Ly", "My", "Nhi", "Phượng", "Quyên", "Thư", "Trâm", "Vân", "Vy", "Xuân", "Diệp", "Giang", "Hân"];

const createPerson = (isMale, forcedAge = null) => {
  const ho = lastNames[Math.floor(Math.random() * lastNames.length)];
  const dem = middleNames[Math.floor(Math.random() * middleNames.length)];
  const ten = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
  
  // 4. Ghép Họ + Tên đệm + Tên chính
  const fullName = `${ho} ${dem} ${ten}`;
  
  const age = forcedAge !== null ? forcedAge : Math.floor(Math.random() * 42) + 18;
  const idCard = "0" + Math.floor(Math.random() * 90000000000 + 10000000000);
  
  // Trả về tên đầy đủ
  return { name: fullName, isMale: isMale, age: age, idCard: idCard };
};

  let guestsList = [];
  
  if (groupSize === 1) {
    guestsList.push(createPerson(Math.random() > 0.5));
  } else {
    guestsList.push(createPerson(Math.random() > 0.5)); 
    for (let i = 1; i < groupSize; i++) {
      if (Math.random() > 0.5) {
        const childAge = Math.floor(Math.random() * 12) + 6; 
        guestsList.push(createPerson(Math.random() > 0.5, childAge));
      } else {
        guestsList.push(createPerson(Math.random() > 0.5));
      }
    }
  }

  const displayName = guestsList.map(g => g.name).join(" & ");

  currentGuest = { guests: guestsList, reqType: req.type, reqFloor: req.floor, rentType: 'hour', displayName: displayName };
  draw(); 
  
  setTimeout(() => { if (currentGuest) startConversation(); }, 500);
}

function drawGuest() {
  if (!currentGuest || currentFloor !== 1) return;
  const g = currentGuest;
  const baseX = 200; 
  const gy = 420;    
  
  const numGuests = g.guests.length;
  
  if (numGuests === 1) {
    drawGuestAtReception(baseX + 50, gy, g.guests[0]);
  } 
  else if (numGuests === 2) {
    drawGuestAtReception(baseX - 20, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 110, gy, g.guests[1]); 
  }
  else if (numGuests === 3) {
    drawGuestAtReception(baseX - 60, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 60, gy, g.guests[1]); 
    drawGuestAtReception(baseX + 180, gy, g.guests[2]); 
  }
  else if (numGuests === 4) {
    drawGuestAtReception(baseX - 80, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 20, gy, g.guests[1]); 
    drawGuestAtReception(baseX + 120, gy, g.guests[2]); 
    drawGuestAtReception(baseX + 220, gy, g.guests[3]); 
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
// Vẽ Két thu ngân to, rõ nét (Dưới máy tính)
box(640, 495, 180, 45, '#1f2937'); // Thân két màu đen xám
box(645, 500, 170, 35, '#374151'); // Ngăn kéo két
box(725, 510, 10, 15, '#fbbf24'); // Tay nắm màu vàng
box(692, 528, 76, 5, '#111827'); // Đế két



// Vẽ mã QR (Bên phải, chi tiết hơn)
box(560, 440, 50, 50, '#fff'); // Nền trắng
box(565, 445, 15, 15, '#000'); // Góc trên trái
box(590, 445, 15, 15, '#000'); // Góc trên phải
box(565, 470, 15, 15, '#000'); // Góc dưới trái
// Các chấm nhỏ mô phỏng mã QR
box(585, 465, 5, 5, '#000'); box(595, 475, 5, 5, '#000'); box(575, 480, 5, 5, '#000');
box(585, 485, 5, 5, '#000'); box(595, 465, 5, 5, '#000'); box(575, 465, 5, 5, '#000');
label('QR', 585, 498, 8, '#000', 'center');
    // Kệ chìa khóa
    box(380, 505, 200, 40, '#4a2e14'); 
    box(380, 500, 200, 8, '#6e4723');
    for(let i=0; i<6; i++){
      const kx = 390 + i*30;
      box(kx, 513, 24, 24, '#f4ebd9'); 
      box(kx+8, 516, 8, 12, '#e5c07b');
      label(String(101+i), kx+12, 531, 9, '#4a2e14', 'center');
    }
    label('QUẦY LỄ TÂN', 480, 585, 18, '#e8d5b5', 'center');
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
        const num = currentRoom.guests.length; 
        const pX = currentRoom.guestPos; 

        if (pX === 'bed') {
          if (num === 1) { drawGuestInRoom(x + 60, y + 60, currentRoom.guests[0]); }
          else if (num === 2) { drawGuestInRoom(x + 50, y + 60, currentRoom.guests[0]); drawGuestInRoom(x + 80, y + 60, currentRoom.guests[1]); }
          else if (num === 3) { 
            drawGuestInRoom(x + 40, y + 50, currentRoom.guests[0]); 
            drawGuestInRoom(x + 80, y + 50, currentRoom.guests[1]); 
            drawGuestInRoom(x + 60, y + 80, currentRoom.guests[2]); 
          }
          else if (num === 4) { 
            drawGuestInRoom(x + 40, y + 50, currentRoom.guests[0]); 
            drawGuestInRoom(x + 80, y + 50, currentRoom.guests[1]); 
            drawGuestInRoom(x + 40, y + 80, currentRoom.guests[2]); 
            drawGuestInRoom(x + 80, y + 80, currentRoom.guests[3]); 
          }
        } 
        else if (pX === 'desk') {
          if (num === 1) { drawGuestInRoom(x + roomW - 50, y + 40, currentRoom.guests[0]); }
          else if (num === 2) { drawGuestInRoom(x + roomW - 50, y + 40, currentRoom.guests[0]); drawGuestInRoom(x + roomW - 70, y + 70, currentRoom.guests[1]); }
          else if (num === 3) { drawGuestInRoom(x + roomW - 40, y + 40, currentRoom.guests[0]); drawGuestInRoom(x + roomW - 70, y + 40, currentRoom.guests[1]); drawGuestInRoom(x + roomW - 55, y + 70, currentRoom.guests[2]); }
          else if (num === 4) { drawGuestInRoom(x + roomW - 30, y + 40, currentRoom.guests[0]); drawGuestInRoom(x + roomW - 60, y + 40, currentRoom.guests[1]); drawGuestInRoom(x + roomW - 40, y + 70, currentRoom.guests[2]); drawGuestInRoom(x + roomW - 70, y + 70, currentRoom.guests[3]); }
        } 
        else {
          if (num === 1) { drawGuestInRoom(x + roomW/2, y + roomH/2, currentRoom.guests[0]); }
          else if (num === 2) { drawGuestInRoom(x + roomW/2 - 30, y + roomH/2, currentRoom.guests[0]); drawGuestInRoom(x + roomW/2 + 30, y + roomH/2, currentRoom.guests[1]); }
          else if (num === 3) { 
            drawGuestInRoom(x + roomW/2, y + roomH/2 - 30, currentRoom.guests[0]); 
            drawGuestInRoom(x + roomW/2 - 30, y + roomH/2 + 20, currentRoom.guests[1]); 
            drawGuestInRoom(x + roomW/2 + 30, y + roomH/2 + 20, currentRoom.guests[2]); 
          }
          else if (num === 4) { 
            drawGuestInRoom(x + roomW/2 - 30, y + roomH/2 - 20, currentRoom.guests[0]); 
            drawGuestInRoom(x + roomW/2 + 30, y + roomH/2 - 20, currentRoom.guests[1]); 
            drawGuestInRoom(x + roomW/2 - 30, y + roomH/2 + 20, currentRoom.guests[2]); 
            drawGuestInRoom(x + roomW/2 + 30, y + roomH/2 + 20, currentRoom.guests[3]); 
          }
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

function resizeAll(){
  const rect = scene.getBoundingClientRect(); const aw = rect.width, ah = rect.height; const ar = 960 / 600; let w, h;
  if(aw/ah > ar){ h = ah; w = h * ar; } else { w = aw; h = w / ar; }
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; canvas.style.left = (aw - w) / 2 + 'px'; canvas.style.top = ((ah - h) / 2 - 50) + 'px';
  const sx = w/960, sy = h/600; const ox = (aw - w) / 2, oy = (ah - h) / 2;
  if(computerBtn) { computerBtn.style.left = ox + 640*sx + 'px'; computerBtn.style.top = oy + 230*sy + 'px'; computerBtn.style.width = 180*sx + 'px'; computerBtn.style.height = 120*sy + 'px'; }
  if(keysBtn) { keysBtn.style.left = ox + 380*sx + 'px'; keysBtn.style.top = oy + 375*sy + 'px'; keysBtn.style.width = 200*sx + 'px'; keysBtn.style.height = 40*sy + 'px'; }
// Căn vị trí Két sắt (đặt dưới máy tính)
// Căn vị trí Két sắt
// Căn vị trí Két sắt khớp với hình vẽ
// Căn vị trí Két sắt (Rộng bằng màn hình máy tính)
const cashDrawerBtn = document.getElementById('cashDrawerBtn');
if(cashDrawerBtn) {
  cashDrawerBtn.style.left = ox + 640*sx + 'px'; // Dời sang phải cho khớp màn hình
  cashDrawerBtn.style.top = oy + 370*sy + 'px';  // Dời lên trên quầy gỗ
  cashDrawerBtn.style.width = 180*sx + 'px';     // Rộng bằng màn hình máy tính (180)
  cashDrawerBtn.style.height = 50*sy + 'px';     // Chiều cao vừa phải
  // Viền đỏ nhấp nháy để bạn dễ thấy
  cashDrawerBtn.style.border = '2px dashed #ef4444'; 
  cashDrawerBtn.style.borderRadius = '6px';
}

// Căn vị trí nút QR
const qrBtn = document.getElementById('qrBtn');
if(qrBtn) {
  qrBtn.style.left = ox + 560*sx + 'px'; 
  qrBtn.style.top = oy + 320*sy + 'px'; 
  qrBtn.style.width = 50*sx + 'px'; 
  qrBtn.style.height = 50*sy + 'px';
 qrBtn.style.border = '2px dashed #ef4444'; 
  qrBtn.style.borderRadius = '6px';
}
  draw();
}
// ==========================================
// 4. RENDER PHÒNG & HỆ THỐNG HỘI THOẠI
// ==========================================
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

function startConversation() {
  const btn = document.getElementById('chatActionBtn');
  btn.style.display = 'block'; btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Chào khách"; 
  document.getElementById('takeKey').disabled = true; document.getElementById('takeKey').style.opacity = '0.5';
  if (!currentGuest) return;
  chatStep = 1;
  document.getElementById('chatBox').style.display = 'block';
  
  let titleName = "";
  if (currentGuest.guests.length === 1) {
    titleName = getPronoun(currentGuest.guests[0]); 
    titleName = titleName.charAt(0).toUpperCase() + titleName.slice(1);
  } else if (currentGuest.guests.length === 2) {
    titleName = getPronoun(currentGuest.guests[0]) + " và " + getPronoun(currentGuest.guests[1]);
    titleName = titleName.charAt(0).toUpperCase() + titleName.slice(1);
  } else {
    titleName = `Nhóm ${currentGuest.guests.length} người`;
  }
  
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
  let myPronoun = getMyPronoun(guestPronoun);
  myPronoun = myPronoun.charAt(0).toUpperCase() + myPronoun.slice(1);
  
  if (chatStep === 1) {
    addChatMessage("Lễ tân", `Chào ${guestPronoun}, ${myPronoun} có thể giúp gì cho bạn?`, '#e67e22', 'right');
    setTimeout(() => {
      let senderName = currentGuest.guests.length === 1 ? "Khách" : "Người đại diện";
      
      let replyPronoun = "Chúng tôi";
      if (currentGuest.guests.length === 1) {
        replyPronoun = guestPronoun.charAt(0).toUpperCase() + guestPronoun.slice(1);
      }

      addChatMessage(senderName, `${replyPronoun} muốn thuê 1 ${currentGuest.reqType}.`, '#1e3a52', 'left');
      btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Hỏi thời gian"; chatStep = 2;
    }, 500); 
  } 
  else if (chatStep === 2) {
    if (currentGuest.guests.length === 1) {
      addChatMessage("Lễ tân", `Vậy ${guestPronoun} định ở trong bao lâu?`, '#e67e22', 'right');
    } else {
      addChatMessage("Lễ tân", `Vậy mọi người định ở trong bao lâu?`, '#e67e22', 'right');
    }
    setTimeout(() => {
      const rand = Math.random(); let guestReply = ""; let rentType = ""; let hoursToStay = 0;
      const currentGameHour = gameTime.getHours();
      const canStayOvernight = (currentGameHour >= 18 && currentGameHour < 24);

      if (rand < 0.4) {
        hoursToStay = Math.floor(Math.random() * 10) + 2; 
        guestReply = currentGuest.guests.length > 1 ? `Chúng tôi ở khoảng ${hoursToStay} tiếng thôi.` : `Tôi ở khoảng ${hoursToStay} tiếng thôi.`; 
        rentType = 'hour'; 
      } else if (rand < 0.7 && canStayOvernight) {
        if (currentGameHour >= 18) { hoursToStay = (24 - currentGameHour) + 7; }
        if (hoursToStay <= 0) hoursToStay = 12; 
        guestReply = currentGuest.guests.length > 1 ? `Chúng tôi sẽ ở qua đêm, sáng mai 7h chúng tôi đi.` : `Tôi sẽ ở qua đêm, sáng mai 7h tôi đi.`; 
        rentType = 'night'; 
      } else {
        const days = Math.floor(Math.random() * 3) + 1; hoursToStay = days * 24;
        guestReply = currentGuest.guests.length > 1 ? `Chúng tôi ở dài hạn khoảng ${days} ngày.` : `Tôi ở dài hạn khoảng ${days} ngày.`; 
        rentType = 'day'; 
      }
      
      currentGuest.rentType = rentType; currentGuest.stayHours = hoursToStay; guestStayHours = hoursToStay;
      
      let senderName = currentGuest.guests.length === 1 ? "Khách" : "Người đại diện";
      addChatMessage(senderName, guestReply, '#1e3a52', 'left');
      
      btn.disabled = false; btn.style.opacity = '1'; btn.innerText = "Xin CCCD"; chatStep = 3;
    }, 500); 
  } 
  else if (chatStep === 3) {
    if (currentGuest.guests.length === 1) {
      addChatMessage("Lễ tân", `Vui lòng cho ${myPronoun.toLowerCase()} xin Căn cước công dân của ${guestPronoun}.`, '#e67e22', 'right');
    } else {
      addChatMessage("Lễ tân", `Cho ${myPronoun.toLowerCase()} xin Căn cước công dân của mọi người ạ.`, '#e67e22', 'right');
    }
    
    setTimeout(() => {
      currentGuest.guests.forEach((g) => {
        if (g.age >= 18) {
          g.idCard = "0" + Math.floor(Math.random() * 90000000000 + 10000000000);
        } else {
          g.idCard = "Chưa có";
        }
      });

      let replyText = "";
      if (currentGuest.guests.length === 1) {
         replyText = `Đây là CCCD của tôi.`;
      } else {
         replyText = `Tất cả đều ở đây, chúng tôi có ${currentGuest.guests.length} người.`;
      }
      
      let senderName = currentGuest.guests.length === 1 ? "Khách" : "Người đại diện";
      addChatMessage(senderName, replyText, '#1e3a52', 'left');

      document.querySelectorAll('.guest-form').forEach(f => f.style.display = 'none');
      const currentForm = document.getElementById('form-' + currentGuest.guests.length);
      if(currentForm) currentForm.style.display = 'flex';

      const cccdDetails = document.getElementById('cccdDetails');
      if(cccdDetails) {
        cccdDetails.innerHTML = '';
        currentGuest.guests.forEach((g, index) => {
          cccdDetails.innerHTML += `<div style="border-bottom:1px dashed #ccc; padding-bottom:3px;">
            <b>Người ${index + 1}:</b> ${g.name} - ${g.age} tuổi - CCCD: ${g.idCard}
          </div>`;
        });
      }

      currentGuest.guests.forEach((g, index) => {
        const p = index + 1;
        const size = currentGuest.guests.length;
        const nameEl = document.getElementById(`f${size}_p${p}_name`);
        const ageEl = document.getElementById(`f${size}_p${p}_age`);
        const idEl = document.getElementById(`f${size}_p${p}_id`);
        if(nameEl && ageEl && idEl) {
          nameEl.value = g.name;
          ageEl.value = g.age;
          idEl.value = g.idCard === "Chưa có" ? "" : g.idCard;
          
          if (g.age < 18) { idEl.disabled = true; idEl.placeholder = "Dưới 18 tuổi"; }
          else { idEl.disabled = false; idEl.placeholder = "Nhập CCCD..."; }
        }
      });

      const now = new Date(gameTime); 
      const timeInStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`;
      let outTime;
      if (currentGuest.rentType === 'night') {
        outTime = new Date(now); outTime.setDate(outTime.getDate() + 1); outTime.setHours(7, 0, 0, 0); 
      } else {
        outTime = new Date(now.getTime() + (currentGuest.stayHours * 60 * 60000)); 
      }
      currentGuest.timeIn = timeInStr;
      currentGuest.timeOut = `${outTime.getHours().toString().padStart(2, '0')}:${outTime.getMinutes().toString().padStart(2, '0')} - ${outTime.getDate()}/${outTime.getMonth() + 1}`;
      
      const availableRoom = roomState.find(r => Math.floor(r.number / 100) === currentGuest.reqFloor && r.status === 'Trống');
      const regRoomEl = document.getElementById('regRoom');
      if(regRoomEl) {
        regRoomEl.value = availableRoom ? `Phòng ${availableRoom.number}` : "Hết phòng!";
      }

      const regTimeInEl = document.getElementById('regTimeIn');
      if(regTimeInEl) regTimeInEl.value = currentGuest.timeIn;

      const regTimeOutEl = document.getElementById('regTimeOut');
      if(regTimeOutEl) regTimeOutEl.value = currentGuest.timeOut;
      
      btn.style.display = 'none';
      document.getElementById('openComputerFromChatBtn').style.display = 'block';
      document.getElementById('openComputerFromChatBtn').innerText = "💻 Mở Đăng ký trong Máy tính";
    }, 500); 
  }
}

function generateBill() {
  if (!currentGuest) return;
  const size = currentGuest.guests.length;
  const leaderName = document.getElementById(`f${size}_p1_name`).value;
  const roomBooked = document.getElementById('regRoom').value;

  const prices = ROOM_PRICES[currentGuest.reqType];
  let basePrice = prices[currentGuest.rentType];
  
  // 1. Tính toán giảm giá theo số người
  let multiplier = 1;
  let discount = 0;
  if (size === 2) { multiplier = 2; discount = 0.1; }
  else if (size === 3) { multiplier = 3; discount = 0.2; }
  else if (size === 4) { multiplier = 4; discount = 0.3; }
  
  basePrice = basePrice * multiplier * (1 - discount);
  
  const vat = basePrice * 0.1; 
  const total = basePrice + vat;

  // Lưu lại dữ liệu
  currentBillData = {
    name: leaderName, room: roomBooked, inTime: currentGuest.timeIn, outTime: currentGuest.timeOut,
    basePrice: basePrice, vat: vat, total: total, rentType: currentGuest.rentType
  };

  // 2. Điền thông tin lên Bill
  document.getElementById('billRoom').innerText = roomBooked;
  
  // Điền Loại phòng, Số người, Hình thức thuê
  document.getElementById('billType').innerText = currentGuest.reqType;
  document.getElementById('billPeople').innerText = size + " người";
  
  const rentNames = { hour: "Theo giờ", night: "Qua đêm", day: "Dài hạn" };
  document.getElementById('billRentType').innerText = rentNames[currentGuest.rentType];

  document.getElementById('billIn').innerText = currentGuest.timeIn;
  document.getElementById('billOut').innerText = currentGuest.timeOut;
  
  // 3. Ghi chi tiết cách tính tiền (Giá gốc x Số người - Giảm giá)
  let calcText = `(${prices[currentGuest.rentType].toLocaleString('vi-VN')} x ${multiplier}`;
  if (discount > 0) {
    calcText += ` - ${discount * 100}%`;
  }
  calcText += `)`;
  document.getElementById('billCalcDetail').innerText = calcText;

  document.getElementById('billPrice').innerText = basePrice.toLocaleString('vi-VN') + 'đ';
  document.getElementById('billVat').innerText = vat.toLocaleString('vi-VN') + 'đ';
  document.getElementById('billTotal').innerText = total.toLocaleString('vi-VN') + 'đ';

  document.getElementById('billPanel').classList.add('show');
}
// ==========================================
// 5. KHỞI TẠO GIAO DIỆN & CÁC SỰ KIỆN
// ==========================================
function initUI() {
  // 1. Bộ đếm 5 giây đổi vị trí khách
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

  // 2. Sự kiện chạm vào phòng để dọn dẹp ở Hành lang
  canvas.addEventListener('click', (e) => {
    if (currentFloor === 1) return; 

    const rect = canvas.getBoundingClientRect(); 
    const scaleX = 960 / rect.width; 
    const scaleY = 600 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX; 
    const clickY = (e.clientY - rect.top) * scaleY;

    const roomW = 250; const roomH = 150; const startY = 70; const gap = 15;
    
    for(let i=0; i<3; i++){
      let x = 360 - roomW - 30; 
      let y = startY + i * (roomH + gap);
      if (clickX >= x && clickX <= x + roomW && clickY >= y && clickY <= y + roomH) { 
        handleRoomClick((currentFloor * 100) + i + 1); return; 
      }
      x = 360 + 240 + 30; 
      y = startY + i * (roomH + gap);
      if (clickX >= x && clickX <= x + roomW && clickY >= y && clickY <= y + roomH) { 
        handleRoomClick((currentFloor * 100) + 4 + i); return; 
      }
    }
  });

  // 3. Nút Bắt đầu
  document.getElementById('startBtn').onclick = () => { 
    const menu = document.getElementById('mainMenu'); 
    if (menu) menu.remove(); 
    resizeAll(); 
  };
  
  setInterval(spawnGuest, 15000); 
  setTimeout(spawnGuest, 500); 
  
  // 4. Nút trong hội thoại
  document.getElementById('chatActionBtn').onclick = handleChatAction;
  
  // 5. Nút Mở Máy Tính Từ Hội Thoại
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

  // 6. Nút Đối Chiếu
  document.getElementById('confirmRegisterBtn').onclick = () => {
    const size = currentGuest ? currentGuest.guests.length : 1;
    let isValid = true;

    currentGuest.guests.forEach((g, index) => {
      const p = index + 1;
      const nameVal = document.getElementById(`f${size}_p${p}_name`).value;
      const ageVal = document.getElementById(`f${size}_p${p}_age`).value;
      
      if (!nameVal || !ageVal) { isValid = false; }
    });

    if (!isValid) {
      showToast("Vui lòng kiểm tra lại Tên và Tuổi của tất cả khách!"); 
      return;
    }
    
    showToast("Đối chiếu thành công! Vui lòng bấm Xem Hóa Đơn.");
    document.getElementById('showBillBtn').style.display = 'block'; 
    document.getElementById('confirmRegisterBtn').style.display = 'none'; 
  };

  // 7. Nút Xem Bill
  document.getElementById('showBillBtn').onclick = generateBill;

// 8. Nút In Hóa Đơn & Đưa Khách (Trong Bill)
document.getElementById('payBillBtn').onclick = () => {
  if (!currentBillData) return;
  
  // 1. Đóng Bill và Máy tính
  document.getElementById('billPanel').classList.remove('show');
  document.getElementById('computerPanel').classList.remove('show'); 
  
  // 2. Mở lại khung chat
  document.getElementById('chatBox').style.display = 'block';
  document.getElementById('chatActionBtn').style.display = 'none'; 
  
  let guestPronoun = getPronoun(currentGuest.guests[0]);
  let repPronoun = currentGuest.guests.length > 1 ? "Chúng tôi" : (guestPronoun.charAt(0).toUpperCase() + guestPronoun.slice(1));
  
  addChatMessage("Lễ tân", `Dạ ${guestPronoun} cầm hóa đơn giúp em ạ.`, '#e67e22', 'right');
  
  setTimeout(() => {
    addChatMessage("Người đại diện", `${repPronoun} cảm ơn.`, '#1e3a52', 'left');
    
    // 3. Hỏi thanh toán
    setTimeout(() => {
      addChatMessage("Lễ tân", `Dạ ${guestPronoun} muốn thanh toán bằng tiền mặt hay quét mã QR ạ?`, '#e67e22', 'right');
      
      setTimeout(() => {
        const isCash = Math.random() > 0.5; 
        if (isCash) {
          addChatMessage("Người đại diện", `${repPronoun} thanh toán bằng tiền mặt.`, '#1e3a52', 'left');
          document.getElementById('cashDrawerBtn').style.display = 'block'; 
          showToast("Hãy chạm vào Két sắt để thu tiền!");
        } else {
          addChatMessage("Người đại diện", `${repPronoun} quét mã QR.`, '#1e3a52', 'left');
          document.getElementById('qrBtn').style.display = 'block'; 
          showToast("Hãy chạm vào mã QR trên quầy để khách quét!");
        }
      }, 1000);
    }, 1000);
  }, 1000);
};

  document.getElementById('chatHistory').insertAdjacentHTML('beforeend', choiceHtml);
  
  // Xử lý khi chọn Tiền mặt
  document.getElementById('chooseCash').onclick = () => {
    addChatMessage("Người đại diện", "Tôi trả tiền mặt.", '#1e3a52', 'left');
    document.getElementById('paymentChoices').remove(); // Xóa 2 nút
    
    // Hiện nút bấm tiền mặt trên quầy
    document.getElementById('cashBtn').style.display = 'block'; 
    showToast("Hãy chạm vào xấp tiền trên quầy để thu tiền!");
  };

  // Xử lý khi chọn Quét mã
  document.getElementById('chooseQR').onclick = () => {
    addChatMessage("Người đại diện", "Tôi quét mã QR.", '#1e3a52', 'left');
    document.getElementById('paymentChoices').remove(); // Xóa 2 nút
    
    // Hiện nút bấm QR trên quầy
    document.getElementById('qrBtn').style.display = 'block'; 
    showToast("Hãy chạm vào mã QR trên quầy để khách quét!");
  };
};


  // 9. Nút Máy Tính Ở Quầy
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

  // 10. Nút Đóng Máy Tính
  document.getElementById('closeComputer').onclick = () => {
    document.getElementById('computerPanel').classList.remove('show');
  };

  // 11. Chuyển Đổi Giữa Các Tab
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
// --- LOGIC KÉT TÍNH TIỀN ---
document.getElementById('cashDrawerBtn').onclick = () => {
  document.getElementById('cashDrawerBtn').style.display = 'none';
  document.getElementById('chatBox').style.display = 'none';
  
  const total = currentBillData.total;
  
  // Tự động tính tiền khách đưa (vừa đủ hoặc dư)
  let given = total;
  const rand = Math.random();
  if (rand < 0.4) given = total;
  else if (rand < 0.7) given = Math.ceil(total / 10000) * 10000;
  else given = Math.ceil(total / 100000) * 100000;
  if (given < total) given = total;
  
  window.currentChangeNeeded = given - total; // Số tiền cần thối
  window.currentChangeGiven = 0; // Số tiền đã bấm để thối

  document.getElementById('cashTotal').innerText = total.toLocaleString('vi-VN') + 'đ';
  document.getElementById('cashGiven').innerText = given.toLocaleString('vi-VN') + 'đ';
  document.getElementById('cashChange').innerText = '0đ';
  
  const confirmBtn = document.getElementById('confirmCashBtn');
  const missingEl = document.getElementById('cashMissing');
  missingEl.style.display = 'block';
  
  // NẾU KHÁCH ĐƯA VỪA ĐỦ HOẶC DƯ (Không cần bấm thối tiền)
  if (window.currentChangeNeeded === 0) {
    missingEl.innerText = `Còn thiếu: 0đ`;
    missingEl.style.color = '#4ade80';
    confirmBtn.style.background = '#22c55e';
    confirmBtn.style.boxShadow = '0 4px 0 #166534';
    confirmBtn.style.pointerEvents = 'auto';
    confirmBtn.innerText = "Thanh toán";
  } else {
    missingEl.innerText = `Còn thiếu: ${window.currentChangeNeeded.toLocaleString('vi-VN')}đ`;
    missingEl.style.color = '#ef4444';
    confirmBtn.style.background = '#ccc';
    confirmBtn.style.boxShadow = '0 4px 0 #999';
    confirmBtn.style.pointerEvents = 'none';
    confirmBtn.innerText = "Chưa đủ tiền";
  }

  document.getElementById('cashierPanel').classList.add('show');
};

// Bấm nút mệnh giá để THỐI TIỀN
document.querySelectorAll('.money-btn').forEach(btn => {
  btn.onclick = () => {
    const val = parseInt(btn.dataset.value);
    window.currentChangeGiven += val; 
    
    document.getElementById('cashChange').innerText = window.currentChangeGiven.toLocaleString('vi-VN') + 'đ';
    
    const difference = window.currentChangeNeeded - window.currentChangeGiven; 
    const confirmBtn = document.getElementById('confirmCashBtn');
    const missingEl = document.getElementById('cashMissing');
    
    // LUÔN HIỂN THỊ
    missingEl.style.display = 'block'; 
    
    if (difference > 0) {
      missingEl.innerText = `Còn thiếu: ${difference.toLocaleString('vi-VN')}đ`;
      missingEl.style.color = '#ef4444';
      
      confirmBtn.style.background = '#ccc';
      confirmBtn.style.boxShadow = '0 4px 0 #999';
      confirmBtn.style.pointerEvents = 'none';
      confirmBtn.innerText = "Chưa đủ tiền";
    } else {
      missingEl.innerText = `Còn thiếu: 0đ`;
      missingEl.style.color = '#4ade80';
      
      confirmBtn.style.background = '#22c55e';
      confirmBtn.style.boxShadow = '0 4px 0 #166534';
      confirmBtn.style.pointerEvents = 'auto';
      confirmBtn.innerText = "Thanh toán";
    }
  };
});

// Nút Làm mới
document.getElementById('resetCashBtn').onclick = () => {
  window.currentChangeGiven = 0;
  document.getElementById('cashChange').innerText = '0đ';
  
  const missingEl = document.getElementById('cashMissing');
  const confirmBtn = document.getElementById('confirmCashBtn');
  missingEl.style.display = 'block';
  
  if (window.currentChangeNeeded === 0) {
    missingEl.innerText = `Còn thiếu: 0đ`;
    missingEl.style.color = '#4ade80';
    confirmBtn.style.background = '#22c55e';
    confirmBtn.style.boxShadow = '0 4px 0 #166534';
    confirmBtn.style.pointerEvents = 'auto';
    confirmBtn.innerText = "Thanh toán";
  } else {
    missingEl.innerText = `Còn thiếu: ${window.currentChangeNeeded.toLocaleString('vi-VN')}đ`;
    missingEl.style.color = '#ef4444';
    confirmBtn.style.background = '#ccc';
    confirmBtn.style.boxShadow = '0 4px 0 #999';
    confirmBtn.style.pointerEvents = 'none';
    confirmBtn.innerText = "Chưa đủ tiền";
  }
};

// Nút thanh toán
document.getElementById('confirmCashBtn').onclick = () => {
  document.getElementById('cashierPanel').classList.remove('show');
  document.getElementById('chatBox').style.display = 'block';
  addChatMessage("Lễ tân", "Cảm ơn bạn, tôi đã nhận đủ tiền và thối lại.", '#e67e22', 'right');
  
  // Âm thầm lưu sao kê và mở kệ chìa khóa
  setTimeout(() => {
    finishPayment(); 
  }, 500);
};
// Xử lý khi chạm vào mã QR trên quầy
document.getElementById('qrBtn').onclick = () => {
  document.getElementById('qrBtn').style.display = 'none'; 
  addChatMessage("Lễ tân", "Đã nhận được thanh toán qua mã QR.", '#e67e22', 'right');
  showToast("Đang xử lý thanh toán...");
  
  setTimeout(() => {
    finishPayment(); // Gọi hàm thanh toán
  }, 1000);
};
// --- KẾT THÚC LOGIC KÉT TÍNH TIỀN ---
  // 12. Các sự kiện khác (Lịch, Hướng dẫn, Cập nhật)
  document.getElementById('openCalendarBtn').onclick = () => { currentMonth = gameTime.getMonth(); currentYear = gameTime.getFullYear(); renderCalendar(); document.getElementById('calendarPanel').classList.add('show'); };
  document.getElementById('closeCalendar').onclick = () => document.getElementById('calendarPanel').classList.remove('show');
  document.getElementById('closeGuide').onclick = () => document.getElementById('guidePanel').classList.remove('show');
  
  document.getElementById('guideBtn').onclick = () => { 
    document.getElementById('panelTitle').innerText = "📖 HƯỚNG DẪN CHƠI"; 
    document.getElementById('panelContent').innerHTML = `<ul><li><b>Đón khách:</b> Đợi khách đến, hội thoại tự động mở.</li><li><b>Máy tính:</b> Đối chiếu thông tin và xuất Bill.</li></ul>`; 
    document.getElementById('guidePanel').classList.add('show'); 
  };
  
  document.getElementById('updateBtn').onclick = showChangelog;

  // 13. Kệ Chìa Khóa
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
    let multiplier = 1, discount = 0;
    const size = currentGuest.guests.length;
    if (size === 2) { multiplier = 2; discount = 0.1; }
    else if (size === 3) { multiplier = 3; discount = 0.2; }
    else if (size === 4) { multiplier = 4; discount = 0.3; }
    price = price * multiplier * (1 - discount);
    document.getElementById('rentPriceDisplay').innerText = price.toLocaleString('vi-VN') + 'đ';
  }

 // 14. Nút Nhận Phòng
document.getElementById('takeKey').onclick = () => { 
  const roomIndex = selectedRoom - 1;
  const room = roomState[roomIndex];
  
  // Kiểm tra an toàn
  if (!currentBillData) { showToast("Vui lòng thanh toán trước khi nhận phòng!"); return; }
  if (`Phòng ${room.number}` !== currentBillData.room) { showToast(`Khách đã thanh toán ${currentBillData.room}. Vui lòng chọn đúng phòng!`); return; }
  if (room.status === 'Có khách') { showToast('Phòng này đang có khách rồi!'); return; }
  if (room.status === 'Cần dọn') { showToast('Phòng này đang cần dọn dẹp!'); return; }

  // Thiết lập phòng
  room.status = 'Có khách';
  room.guests = currentGuest.guests;
  room.stayHours = currentGuest.stayHours;
  room.guestPos = 'center';
  room.checkOutTime = Date.now() + (currentGuest.stayHours * 12 * 1000); 
  occupiedRooms++;
  
  // Ghi nhật ký
  const checkInDiv = document.getElementById('diaryCheckIn');
  if (checkInDiv.innerHTML.includes('Chưa có dữ liệu')) checkInDiv.innerHTML = '';
  const logTimeStr = `${gameTime.getHours().toString().padStart(2, '0')}:${gameTime.getMinutes().toString().padStart(2, '0')} - ${gameTime.getDate()}/${gameTime.getMonth() + 1}`;
  checkInDiv.insertAdjacentHTML('afterbegin', `<div style="padding:5px; border-bottom:1px dashed #ccc;"><b>Phòng ${room.number}</b> - ${logTimeStr}</div>`);

  // Đóng kệ chìa khóa và reset mọi thứ
  document.getElementById('keyPanel').classList.remove('show'); 
  document.getElementById('computerPanel').classList.remove('show'); 
  
  currentGuest = null; 
  currentBillData = null;

  document.getElementById('regRoom').value = '';
  document.getElementById('regTimeIn').value = '';
  document.getElementById('regTimeOut').value = '';
  
  // Khóa lại nút chờ khách tiếp theo
  document.getElementById('takeKey').disabled = true;
  document.getElementById('takeKey').style.opacity = '0.5';

  draw(); 
 showToast(`Đã nhận phòng ${room.number} thành công!`);
// Tự động ẩn khung hội thoại sau 1 giây
setTimeout(() => {
  document.getElementById('chatBox').style.display = 'none';
}, 1000);
};

  // 15. Thanh Điều Hướng Dưới Cùng
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

  // 16. Thang Máy
  document.getElementById('closeElevator').onclick = () => document.getElementById('elevatorPanel').classList.remove('show');
  document.querySelectorAll('.elev-btn[data-floor]').forEach(btn => {
    btn.onclick = () => {
      currentFloor = parseInt(btn.dataset.floor);
      document.getElementById('elevatorPanel').classList.remove('show');
      if (currentFloor === 1) { navBtns.forEach(b => b.classList.remove('active')); document.getElementById('btnLobby').classList.add('active'); }
      draw(); 
    };
  });

  // 17. Cá Nhân
  document.getElementById('closeProfile').onclick = () => document.getElementById('profilePanel').classList.remove('show');
  document.getElementById('saveProfile').onclick = () => {
    const newName = document.getElementById('inputName').value;
    const newAge = document.getElementById('inputAge').value;
    const newGender = document.getElementById('inputGender').value;
    
    if(newName.trim() !== "") { 
      document.getElementById('hudName').innerHTML = '👤 ' + newName; 
      MY_AGE = parseInt(newAge);
      showToast(`Đã lưu: ${newName} (${newAge} tuổi) - Giới tính: ${newGender}`); 
    }
    document.getElementById('profilePanel').classList.remove('show');
  };


// ==========================================
// 6. HỆ THỐNG THỜI GIAN, LỊCH VÀ VÒNG LẶP
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
function finishPayment() {
  if (!currentGuest || !currentBillData) return;

  // Lấy chính xác số tiền Thành tiền (đã gồm VAT) từ Bill
  const finalPrice = currentBillData.total;
  
  // Tính hoa hồng (40%) và tiền khách sạn giữ lại
  const commission = finalPrice * COMMISSION_RATE;
  const hotelKeep = finalPrice - commission;
  
  // Cộng tiền vào ví
  hotelMoney += hotelKeep; 
  playerMoney += commission;
  totalRevenue += finalPrice; 
  updateMoneyUI();
  
  // Ghi vào Sao kê
  const list = document.getElementById('receipt-list');
  if (list.innerHTML.includes('Chưa có giao dịch')) list.innerHTML = ''; 
  const now = gameTime;
  const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  list.insertAdjacentHTML('afterbegin', `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc; font-size:12px;"><div><b>Phòng ${currentBillData.room.replace('Phòng ', '')}</b><br><span style="color:#888">${timeStr}</span></div><div style="text-align:right;"><div style="color:#2c6e9e;">KS thu: ${finalPrice.toLocaleString('vi-VN')}đ</div><div style="color:#e67e22;">Hoa hồng: +${commission.toLocaleString('vi-VN')}đ</div></div></div>`);
  
  document.getElementById('bill-total').innerText = totalRevenue.toLocaleString('vi-VN') + 'đ';
  document.getElementById('bill-comm').innerText = playerMoney.toLocaleString('vi-VN') + 'đ';

  // Đóng máy tính, mở kệ chìa khóa
  document.getElementById('computerPanel').classList.remove('show'); 
  document.getElementById('keyPanel').classList.add('show');
  renderRoomGrid('rooms');
  
  // Mở khóa nút nhận phòng
  document.getElementById('takeKey').disabled = false;
  document.getElementById('takeKey').style.opacity = '1';

  showToast("Thanh toán thành công! Hãy chọn phòng trên Kệ chìa khóa.");
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