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
let hotelMoney = 0;
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
let isHotelOwner = false;
let dailyGuestCount = 0; 
let selectedRentType = 'hour'; 
const COMMISSION_RATE = 0.4; 
let currentGuest = null; 
let guestProfiles = []; // Lưu Hồ sơ khách
let receiptHistory = []; // Lưu Sao kê
let diaryHistory = { in: [], out: [] }; // Lưu Nhật ký
let messagesHistory = []; // Lưu Tin nhắn
let pendingGuestForGuide = null;
let registeredGuests = []; 
let MY_AGE = 25;
let isGameStarted = false;
let isGamePaused = false;
let pauseStartTime = 0;
let playerLevel = 1;
let playerExp = 0;
let maxExp = 100; 
let hotelRating = 5.0;
let dailyBackups = [];
let lastBackupDay = 1; 
let guestPatienceEndTime = 0;
let guestMaxPatience = 90000; 
let cleaningRoomNumber = null;
let cleaningEndTime = 0;
let cleaningProgressTimer = 0; // <--- THÊM BIẾN NÀY
let cleaningMaxTime = 60000; 
let gameTime = new Date(2024, 0, 1, 0, 0, 0); 
let currentMonth = gameTime.getMonth();
let currentYear = gameTime.getFullYear();

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

function getMyPronoun(guestPronoun) {
  if (guestPronoun === "em") {
    const myGender = document.getElementById('inputGender') ? document.getElementById('inputGender').value : "Nam";
    return myGender === "Nữ" ? "chị" : "anh";
  }
  else if (guestPronoun === "anh" || guestPronoun === "chị") return "em";
  else if (guestPronoun === "chú" || guestPronoun === "cô") return "con";
  else if (guestPronoun === "ông" || guestPronoun === "bà") return "cháu";
  return "tôi"; 
}

const roomState = Array.from({length:30},(_,i)=> {
  let floor = Math.floor(i / 6) + 2; 
  let roomNum = floor * 100 + (i % 6) + 1;
  return { number: roomNum, status: 'Trống', checkOutTime: 0, guestPos: 'center' };
});

function box(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(x,y,w,h); }
function label(t,x,y,size=18,color='#26384a',align='left'){ ctx.fillStyle=color; ctx.font=`bold ${size}px system-ui`; ctx.textAlign=align; ctx.fillText(t,x,y); }
function showToast(t){ toast.textContent = t; toast.style.display = 'block'; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.style.display = 'none', 2500); }

function updateMoneyUI() {
  document.getElementById('money').innerText = playerMoney.toLocaleString('vi-VN') + 'đ';
  document.getElementById('dash-occupied').innerText = occupiedRooms + ' / 30';
  document.getElementById('dash-revenue').innerText = totalRevenue.toLocaleString('vi-VN') + 'đ';
}
updateMoneyUI();

// ==========================================
// 2. TẠO KHÁCH & VẼ KHÁCH Ở QUẦY
// ==========================================
function spawnGuest() {
  if (currentGuest || pendingGuestForGuide) return; 
  const allRooms = [
    { type: "Phòng Đơn", floor: 2 }, { type: "Phòng Đôi", floor: 3 }, { type: "Phòng VIP", floor: 4 },
    { type: "Phòng Lãng Mạn", floor: 5 }, { type: "Phòng Tổng Thống", floor: 6 }
  ];

  const groupSize = Math.floor(Math.random() * 4) + 1; 
  let validRooms = [];
  if (groupSize === 1) validRooms = allRooms.filter(r => r.type !== "Phòng Lãng Mạn");
  else if (groupSize === 2) validRooms = allRooms.filter(r => r.type !== "Phòng Đơn");
  else validRooms = allRooms.filter(r => r.type !== "Phòng Đơn" && r.type !== "Phòng Đôi");

  let req = validRooms[Math.floor(Math.random() * validRooms.length)];
  
  const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
  const middleNames = ["Văn", "Thị", "Hữu", "Ngọc", "Minh", "Thanh", "Đức", "Xuân", "Thu", "Hồng", "Quang", "Tuấn", "Khánh", "Bảo", "Gia", "Hoàng"];
  const maleNames = ["Anh", "Bình", "Cường", "Dũng", "Hải", "Hùng", "Khánh", "Long", "Nam", "Phong", "Sơn", "Tùng", "Trung", "Hiếu", "Kiên", "Lâm", "Mạnh", "Nghĩa", "Phát", "Quân", "Tài", "Thắng", "Thiện", "Toàn", "Vinh", "Vũ", "Huy", "Hoàng", "Khang", "Bảo"];
  const femaleNames = ["Anh", "Hoa", "Lan", "Linh", "Mai", "Nga", "Ngọc", "Nhung", "Oanh", "Thảo", "Trang", "Yến", "Hà", "Hạnh", "Hiền", "Hương", "Ly", "My", "Nhi", "Phượng", "Quyên", "Thư", "Trâm", "Vân", "Vy", "Xuân", "Diệp", "Giang", "Hân"];

  const createPerson = (isMale, forcedAge = null) => {
    const ho = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dem = middleNames[Math.floor(Math.random() * middleNames.length)];
    const ten = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const fullName = `${ho} ${dem} ${ten}`;
    const age = forcedAge !== null ? forcedAge : Math.floor(Math.random() * 42) + 18;
    const idCard = "0" + Math.floor(Math.random() * 90000000000 + 10000000000);
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
  dailyGuestCount += guestsList.length; 
  guestPatienceEndTime = Date.now() + guestMaxPatience;
  
  draw(); 
  
  setTimeout(() => { 
    if (currentGuest) {
      if (currentFloor === 1) {
        startConversation(); 
      } else {
        toast.textContent = "Có khách đang đợi ở quầy! Vui lòng về Sảnh chính.";
        toast.style.display = 'block';
        clearTimeout(toastTimer); 
      }
    } 
  }, 500);
}

function drawGuest() {
  if (!currentGuest || currentFloor !== 1) return;
  const g = currentGuest;
  const baseX = 200; 
  const gy = 420;    
  const numGuests = g.guests.length;
  
  if (numGuests === 1) {
    drawGuestAtReception(baseX + 50, gy, g.guests[0]);
  } else if (numGuests === 2) {
    drawGuestAtReception(baseX - 20, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 110, gy, g.guests[1]); 
  } else if (numGuests === 3) {
    drawGuestAtReception(baseX - 60, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 60, gy, g.guests[1]); 
    drawGuestAtReception(baseX + 180, gy, g.guests[2]); 
  } else if (numGuests === 4) {
    drawGuestAtReception(baseX - 80, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 20, gy, g.guests[1]); 
    drawGuestAtReception(baseX + 120, gy, g.guests[2]); 
    drawGuestAtReception(baseX + 220, gy, g.guests[3]); 
  }
}

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
        const totalTime = currentRoom.stayHours * 12 * 1000; 
        let progress = 1 - (timeLeft / totalTime); 
        if (progress < 0) progress = 0; if (progress > 1) progress = 1;
        box(x + 20, y + roomH - 35, roomW - 40, 15, '#cbd5e1'); box(x + 20, y + roomH - 35, (roomW - 40) * progress, 15, '#22c55e');
        const secondsLeft = Math.ceil(timeLeft / 1000);
        if (secondsLeft > 0) { let timeDisplay = secondsLeft > 60 ? Math.ceil(secondsLeft/60) + "p" : secondsLeft + "s"; label(timeDisplay, x + roomW/2, y + roomH - 22, 12, '#1e293b', 'center'); }
      }

      label(roomNumber.toString(), x + 15, y + roomH - 15, 16, '#1e293b', 'left');
      label(currentType, x + roomW - 15, y + roomH - 15, 10, '#64748b', 'right');

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

// ==========================================
// 4. HỆ THỐNG THỜI GIAN & VÒNG LẶP
// ==========================================
function updateClockUI() {
  const h = gameTime.getHours().toString().padStart(2, '0');
  const m = gameTime.getMinutes().toString().padStart(2, '0');
  document.getElementById('clockTime').innerText = `${h}h${m}p`;
  const hour = gameTime.getHours(); const shiftElement = document.getElementById('clockShift');
  if (hour >= 6 && hour < 18) { shiftElement.innerText = "☀️ Ca Ngày"; shiftElement.style.color = "#d28a43"; } 
  else { shiftElement.innerText = "🌙 Ca Đêm"; shiftElement.style.color = "#2c6e9e"; }
  const d = gameTime.getDate().toString().padStart(2, '0'); const mo = (gameTime.getMonth() + 1).toString().padStart(2, '0'); const y = gameTime.getFullYear();
  document.getElementById('gameDate').innerText = `${d}/${mo}/${y}`;
}

setInterval(() => { 
  if (!isGameStarted || isGamePaused) return; 
  gameTime.setMinutes(gameTime.getMinutes() + 5); updateClockUI(); 
  if (gameTime.getDate() !== lastBackupDay) { lastBackupDay = gameTime.getDate(); createDailyBackup(); }
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
    showToast("Khách đã mất kiên nhẫn và bỏ đi! (-1 Sao)");
    updateRating(-1.0); currentGuest = null; guestPatienceEndTime = 0;
    document.getElementById('chatBox').style.display = 'none';
    document.getElementById('cashDrawerBtn').style.display = 'none';
    document.getElementById('qrBtn').style.display = 'none';
  }

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

function updateRating(amount) {
  hotelRating += amount;
  if (hotelRating > 5.0) hotelRating = 5.0;
  if (hotelRating < 1.0) hotelRating = 1.0; 
  document.getElementById('rating').innerText = hotelRating.toFixed(1);
}

updateClockUI();
window.addEventListener('DOMContentLoaded', () => { 
  // Đợi 0.5 giây để chắc chắn tất cả các file (draw_staff, script_rooms...) đã tải xong
  setTimeout(() => {
    isGamePaused = false; 
    isGameStarted = false; 
    if (typeof initUI === 'function') initUI(); 
    if (typeof updateMenuInfo === 'function') updateMenuInfo(); 
    resizeAll(); 
  }, 500);
});
window.addEventListener('resize', resizeAll);
window.addEventListener('orientationchange', () => setTimeout(resizeAll, 200));