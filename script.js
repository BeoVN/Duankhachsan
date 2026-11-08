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
let isGameStarted = false;
let isGamePaused = false;
// Hệ thống Level & EXP
let playerLevel = 1;
let playerExp = 0;
let maxExp = 100; // EXP cần để lên cấp 1

// Hệ thống Đánh giá
let hotelRating = 5.0;
// Lưu trữ 3 ngày gần nhất trong game
let dailyBackups = [];
let lastBackupDay = 1; 
// Hệ thống kiên nhẫn
let guestPatienceEndTime = 0;
let guestMaxPatience = 90000; // 1 phút 30 giây = 90,000 ms

let cleaningRoomNumber = null;
let cleaningEndTime = 0;
let cleaningMaxTime = 60000; // 1 phút = 60,000 ms
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

   // ... (đoạn code tạo random tên, phòng ở trên giữ nguyên) ...

  const displayName = guestsList.map(g => g.name).join(" & ");
  currentGuest = { guests: guestsList, reqType: req.type, reqFloor: req.floor, rentType: 'hour', displayName: displayName };

guestPatienceEndTime = Date.now() + guestMaxPatience; // Bắt đầu tính giờ kiên nhẫn 90s

draw(); 
// ...
  
    // SỬA ĐOẠN NÀY:
  setTimeout(() => { 
    if (currentGuest) {
      if (currentFloor === 1) {
        startConversation(); 
      } else {
        // HIỂN THỊ TOAST VÀ KHÔNG TỰ TẮT
        toast.textContent = "Có khách đang đợi ở quầy! Vui lòng về Sảnh chính.";
        toast.style.display = 'block';
        clearTimeout(toastTimer); // Hủy bỏ bộ đếm thời gian tự tắt của toast
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

// VẼ VÒNG TRÒN KIÊN NHẪN CỦA KHÁCH Ở QUẦY
if (currentGuest && guestPatienceEndTime > 0) {
  const timeLeft = guestPatienceEndTime - Date.now();
  if (timeLeft > 0) {
 
    const total = guestMaxPatience;
    const ratio = timeLeft / total;
    
    // Vị trí vòng tròn (ngay trên đầu người đại diện)
    const cx = 250; // Tọa độ X (có thể chỉnh lại theo ý bạn)
    const cy = 250; // Tọa độ Y
    const radius = 35;

    // Vẽ vòng tròn nền (màu xám)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // Vẽ vòng tròn đếm ngược
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * ratio));
    
    // Đổi màu vòng tròn và icon
    let color = '#22c55e'; // Xanh
    let icon = '😁';
    if (ratio <= 0.5) { color = '#f59e0b'; icon = '🙂'; } // Vàng
    if (ratio <= 0.2) { color = '#ef4444'; icon = '😡'; } // Đỏ

    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.stroke();

    // Vẽ icon mặt cười ở giữa
    ctx.font = '45px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, cx, cy);
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

       // VẼ VÒNG TRÒN ĐẾM NGƯỢC DỌN PHÒNG (Nằm trên cùng, đè lên mọi thứ)
  if (currentRoom.status === 'Cần dọn' && cleaningRoomNumber === roomNumber) {
    const timeLeft = cleaningEndTime - Date.now();
    if (timeLeft > 0) {
      const ratio = timeLeft / cleaningMaxTime;
      const cx = x + roomW / 2; // Tâm X của phòng
      const cy = y + roomH / 2; // Tâm Y của phòng
      const radius = 35;

      // 1. Vẽ nền trắng
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();

      // 2. Vẽ vòng cung đếm ngược
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * ratio));
      
      let color = '#22c55e';
      if (ratio <= 0.5) color = '#f59e0b';
      if (ratio <= 0.2) color = '#ef4444';

      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.stroke();

       // 3. Vẽ số giây ở giữa
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(timeLeft / 1000) + 's', cx, cy);

    // THÊM DÒNG NÀY ĐỂ VẼ CHỮ CẦN DỌN
    label("CẦN DỌN", cx, cy + radius + 15, 12, '#ef4444', 'center');
  }
  }
} // ĐÂY LÀ DẤU NGOẶC ĐÓNG HÀM drawRoomTopDown

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
  const room = roomState.find(r => r.number === roomNum); 
  if (!room) return;
  
  if (room.status === 'Cần dọn') { 
    // Nếu đang trong thời gian đếm ngược (cleaningRoomNumber trùng với phòng này)
    if (cleaningRoomNumber === room.number) {
      // DỌN PHÒNG NGAY LẬP TỨC
      room.status = 'Trống';
      cleaningRoomNumber = null;
      cleaningEndTime = 0;
      updateRating(0.1); // Thưởng nhẹ 0.1 sao vì đã dọn kịp
      showToast(`Đã dọn sạch phòng ${room.number}!`);
      draw();
      return;
    }

    // Trường hợp phòng "Cần dọn" nhưng chưa kích hoạt đếm ngược (phòng cũ)
    cleaningRoomNumber = room.number;
    cleaningEndTime = Date.now() + cleaningMaxTime;
    showToast(`Bắt đầu dọn phòng ${room.number} (60s)!`);
    draw(); 
  } 
  else if (room.status === 'Có khách') { 
    showToast(`Phòng ${room.number} đang có khách. Không thể dọn!`); 
  } 
  else { 
    showToast(`Phòng ${room.number} đang trống.`); 
  }
}

function startConversation() {
  if (!currentGuest || guestPatienceEndTime === 0) return; // Nếu không có khách hoặc khách đã bỏ đi thì thôi
  // ... (phần còn lại giữ nguyên)
  // NẾU KHÔNG PHẢI Ở TẦNG 1 THÌ KHÔNG BẬT CHAT
  if (currentFloor !== 1) {
    document.getElementById('chatBox').style.display = 'none';
    document.getElementById('cashDrawerBtn').style.display = 'none';
    document.getElementById('qrBtn').style.display = 'none';
    return; 
  }

  const btn = document.getElementById('chatActionBtn');
  // ... (phần còn lại của hàm giữ nguyên) ...
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
  
  isGameStarted = true; 
  isGamePaused = false; 
  loadAutoSave(); 
  updateExpandButton(); // <--- THÊM DÒNG NÀY
  resizeAll(); 
};
  
  setInterval(() => {
  if (isGamePaused) return; // Đang tạm dừng thì không đón khách mới
  spawnGuest();
}, 15000); 
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
// Tắt hội thoại ngay lập tức
document.getElementById('chatBox').style.display = 'none';
};

 // 15. Thanh Điều Hướng Dưới Cùng
navBtns.forEach(btn => {
  btn.onclick = () => {
    // Nếu bấm vào nút Mở rộng
    if (btn.id === 'btnExpand') {
      if (playerLevel < 5) {
        showToast("Tính năng này sẽ mở khóa ở Cấp độ 5!");
      } else {
        showToast("Chức năng đang được phát triển!");
        // Sau này bạn có thể mở bảng Mở rộng ở đây
      }
      return; // Dừng lại, không chạy các lệnh đổi màu nút bên dưới
    }

    navBtns.forEach(b => b.classList.remove('active')); 
    btn.classList.add('active');
    
   if (btn.id === 'btnLobby') { 
  currentFloor = 1; 
  draw(); 
  
  // TẮT TOAST KHI VỀ SẢNH CHÍNH
  toast.style.display = 'none'; 
  clearTimeout(toastTimer);

  if (currentGuest) {
    startConversation();
  }
   }
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
    if (currentFloor === 1) { 
      navBtns.forEach(b => b.classList.remove('active')); 
      document.getElementById('btnLobby').classList.add('active'); 
      
      // TẮT TOAST KHI THANG MÁY VỀ TẦNG 1
      toast.style.display = 'none';
      clearTimeout(toastTimer);

      if (currentGuest) {
        startConversation();
      }
    }
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

setInterval(() => { 
  // Chỉ chạy khi đã bấm Bắt đầu và không mở bảng Cài đặt
  if (!isGameStarted || isGamePaused) return; 

  gameTime.setMinutes(gameTime.getMinutes() + 5); 
  updateClockUI(); 
  
  if (gameTime.getDate() !== lastBackupDay) {
    lastBackupDay = gameTime.getDate();
    createDailyBackup();
  }
}, 1000);

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
occupiedRooms++;
updateMoneyUI();

// CỘNG EXP: Cứ 10.000đ doanh thu = 1 EXP (Bạn có thể sửa số 10000)
const expEarned = Math.floor(finalPrice / 10000); 
addExp(expEarned); 
// Hồi phục đánh giá nhẹ mỗi khi đón khách thành công (tăng 0.1 sao)
updateRating(0.1);
  
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
  if (isGamePaused) return; // Đang tạm dừng thì ngừng đếm ngược
  
  let needsRedraw = false;
  const now = Date.now();
  // ... (phần còn lại giữ nguyên) ...
  roomState.forEach(room => {
    if (room.status === 'Có khách' && room.checkOutTime > 0 && now >= room.checkOutTime) {
  room.status = 'Cần dọn'; 
  room.checkOutTime = 0; 
  occupiedRooms--;
  
  // THÊM 2 DÒNG NÀY ĐỂ TỰ ĐỘNG ĐẾM NGƯỢC KHI KHÁCH ĐI
  cleaningRoomNumber = room.number;
  cleaningEndTime = Date.now() + cleaningMaxTime;

  updateMoneyUI(); 
  // ... (code cũ giữ nguyên) ...
      
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
  
  if (currentFloor === 1 && currentGuest && guestPatienceEndTime > 0) {
    needsRedraw = true; 
  }

  if (needsRedraw) { draw(); }
}, 1000);

// Hàm cộng EXP và xử lý lên cấp
function addExp(amount) {
  playerExp += amount;
  
  while (playerExp >= maxExp) {
    playerExp -= maxExp;
    playerLevel++;
    maxExp = Math.floor(maxExp * 1.5); 
    
    setTimeout(() => {
      showToast(`🎉 CHÚC MỪNG! Bạn đã đạt Level ${playerLevel}!`);
    }, 500);
  }
  
  document.getElementById('hudLv').innerText = `Lv.${playerLevel}`;
  document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`;
  document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`;
  
  // THÊM DÒNG NÀY ĐỂ TỰ ĐỘNG CẬP NHẬT NÚT MỞ RỘNG
  updateExpandButton();
}

// Hàm cập nhật điểm đánh giá (Rating)
function updateRating(amount) {
  hotelRating += amount;
  if (hotelRating > 5.0) hotelRating = 5.0;
  if (hotelRating < 1.0) hotelRating = 1.0; // Thấp nhất là 1 sao
  
  document.getElementById('rating').innerText = hotelRating.toFixed(1);
}
// Vòng lặp kiểm tra thời gian liên tục (chạy mỗi 1 giây)
setInterval(() => {
  // 1. Kiểm tra kiên nhẫn của khách ở quầy
  if (currentGuest && guestPatienceEndTime > 0 && Date.now() >= guestPatienceEndTime) {
    // Hết kiên nhẫn
    showToast("Khách đã mất kiên nhẫn và bỏ đi! (-1 Sao)");
    updateRating(-1.0);
    
    currentGuest = null;
    guestPatienceEndTime = 0;
    document.getElementById('chatBox').style.display = 'none';
    document.getElementById('cashDrawerBtn').style.display = 'none';
    document.getElementById('qrBtn').style.display = 'none';
    draw();
  }

 // KIỂM TRA HẾT THỜI GIAN DỌN PHÒNG
if (cleaningRoomNumber !== null && now >= cleaningEndTime) {
  const roomToClean = roomState.find(r => r.number === cleaningRoomNumber);
  if (roomToClean) {
    roomToClean.status = 'Trống'; // Tự động dọn
  }
  updateRating(-0.2); // Trừ 0.2 sao vì dọn trễ
  showToast(`Hết thời gian! Phòng ${cleaningRoomNumber} đã được tự động dọn. (-0.2 Sao)`);
  
  cleaningRoomNumber = null;
  cleaningEndTime = 0;
  needsRedraw = true; // Để vẽ lại màn hình
}
}, 1000); // Cứ mỗi 1 giây kiểm tra một lần
// ==========================================
// HỆ THỐNG CÀI ĐẶT & ÂM THANH
// ==========================================
// Tạo đối tượng âm thanh (Bạn cần có file nhạc thật trong thư mục dự án để phát)
const bgmAudio = new Audio('art/bgm.mp3'); // Thay bằng tên file nhạc nền của bạn
bgmAudio.loop = true;
let isBGMPlaying = false;

// Nút Mở Cài đặt
let pauseStartTime = 0;

document.getElementById('btnSettings').onclick = () => {
  isGamePaused = true; 
  pauseStartTime = Date.now(); // Ghi nhớ lúc bắt đầu tạm dừng
  document.getElementById('settingsPanel').classList.add('show');
};

document.getElementById('closeSettingsBtn').onclick = () => {
  isGamePaused = false; 
  document.getElementById('settingsPanel').classList.remove('show');
  
  // Cộng bù thời gian cho khách đang đợi
  const pausedDuration = Date.now() - pauseStartTime;
  if (guestPatienceEndTime > 0) {
    guestPatienceEndTime += pausedDuration;
  }
  
  // Cộng bù thời gian cho các phòng đang có khách
  roomState.forEach(room => {
    if (room.status === 'Có khách' && room.checkOutTime > 0) {
      room.checkOutTime += pausedDuration;
    }
  });

  // Cộng bù thời gian dọn phòng
  if (cleaningRoomNumber !== null) {
    cleaningEndTime += pausedDuration;
  }
};

// Nút Về Menu Chính (Tự động lưu và thoát)
document.getElementById('backToMenuBtn').onclick = () => {
  autoSaveGame(); // Lưu game
  isGamePaused = true; // Dừng mọi hoạt động (đồng hồ, khách, v.v...)
  location.reload(); // Tải lại trang
};

// Tùy chỉnh âm lượng
document.getElementById('bgmVolume').oninput = (e) => {
  const vol = e.target.value / 100;
  bgmAudio.volume = vol;
  
  // Nếu kéo âm lượng > 0 và nhạc chưa phát thì tự động phát
  if (vol > 0 && !isBGMPlaying) {
    bgmAudio.play().catch(err => console.log("Trình duyệt chặn tự động phát nhạc:", err));
    isBGMPlaying = true;
  }
};

document.getElementById('sfxVolume').oninput = (e) => {
  // Code xử lý âm thanh SFX (nếu bạn có sử dụng)
  // console.log("SFX Volume: " + e.target.value);
};

// --- HỆ THỐNG LƯU / TẢI BẰNG MÃ CODE ---

// Hàm tạo đối tượng chứa toàn bộ dữ liệu game
function getGameData() {
  return {
    hotelMoney: hotelMoney,
    playerMoney: playerMoney,
    totalRevenue: totalRevenue,
    playerLevel: playerLevel,
    playerExp: playerExp,
    maxExp: maxExp,
    hotelRating: hotelRating,
    roomState: roomState
  };
}

// 1. Nút Sao Lưu (Tạo mã Code)
document.getElementById('saveGameBtn').onclick = () => {
  const data = getGameData();
  const jsonString = JSON.stringify(data);
  const saveCode = btoa(unescape(encodeURIComponent(jsonString))); 
  
  showCustomPrompt("Sao lưu thành công", "Hãy copy đoạn mã dưới đây và cất giữ ở nơi an toàn:", saveCode);
};

// 2. Nút Khôi Phục (Từ mã Code)
document.getElementById('loadGameBtn').onclick = () => {
  const inputCode = document.getElementById('loadCodeInput').value.trim();
  
  if (!inputCode) {
    showToast("Vui lòng dán mã Code vào ô trống!");
    return;
  }

  try {
    // Giải mã Base64 thành chuỗi JSON
    const jsonString = decodeURIComponent(escape(atob(inputCode)));
    const data = JSON.parse(jsonString);

    // Kiểm tra xem dữ liệu có hợp lệ không
    if (data.hotelMoney === undefined || !data.roomState) {
      throw new Error("Mã Code không hợp lệ!");
    }

    // Khôi phục biến
    hotelMoney = data.hotelMoney;
    playerMoney = data.playerMoney;
    totalRevenue = data.totalRevenue;
    playerLevel = data.playerLevel;
    playerExp = data.playerExp;
    maxExp = data.maxExp;
    hotelRating = data.hotelRating;
    
    // Khôi phục mảng phòng
    data.roomState.forEach((savedRoom, idx) => {
      roomState[idx] = savedRoom;
    });

    // Cập nhật giao diện
    updateMoneyUI();
    document.getElementById('hudLv').innerText = `Lv.${playerLevel}`;
    document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`;
    document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`;
    document.getElementById('rating').innerText = hotelRating.toFixed(1);
    
    draw();
    document.getElementById('settingsPanel').classList.remove('show');
    showToast("Khôi phục dữ liệu thành công!");
setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (error) {
    showToast("Lỗi: Mã Code không hợp lệ hoặc đã bị hỏng!");
    console.error(error);
  }
};

document.getElementById('restore3DaysBtn').onclick = () => {
  if (dailyBackups.length === 0) {
    showCustomAlert("Chưa có bản sao lưu ngày nào!");
    return;
  }
  
  // Lấy bản lưu gần nhất (cuối mảng)
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
// Nút Chơi lại từ đầu
document.getElementById('resetGameBtn').onclick = () => {
  showCustomAlert("CẢNH BÁO: Toàn bộ dữ liệu (Tiền, Cấp độ, Đánh giá) sẽ bị xóa sạch. Bạn có chắc không?", true, () => {
    
    // 1. Dừng mọi hoạt động tự động lưu
    isGameStarted = false; 
    isGamePaused = true;

    // 2. Xóa toàn bộ dữ liệu trong bộ nhớ trình duyệt
    localStorage.removeItem('sunriseHotel_AutoSave'); // Xóa file lưu tự động
    localStorage.removeItem('sunriseHotel_SaveData'); // Xóa file lưu thủ công (nếu có)
    localStorage.removeItem('sunriseHotel_DailyBackups'); // Xóa file lưu 3 ngày
    
    // 3. Xóa các biến trong bộ nhớ tạm để chắc chắn
    dailyBackups = [];
    
    // 4. Tải lại trang
    location.reload();
  });
};

// Bật nhạc nền (nếu có file)
window.addEventListener('DOMContentLoaded', () => {
  bgmAudio.volume = 0.5; // Mặc định 50%
  // Trình duyệt yêu cầu người dùng phải tương tác mới cho phát nhạc
  document.body.addEventListener('click', () => {
    if (bgmAudio.volume > 0 && !isBGMPlaying) {
      bgmAudio.play().catch(()=>{});
      isBGMPlaying = true;
    }
  }, { once: true }); // Chỉ chạy 1 lần
});
// Hàm tự động sao lưu khi sang ngày mới
function createDailyBackup() {
  const backupData = {
    date: `${gameTime.getDate()}/${gameTime.getMonth() + 1}/${gameTime.getFullYear()}`,
    data: {
      hotelMoney: hotelMoney,
      playerMoney: playerMoney,
      totalRevenue: totalRevenue,
      playerLevel: playerLevel,
      playerExp: playerExp,
      maxExp: maxExp,
      hotelRating: hotelRating,
      roomState: JSON.parse(JSON.stringify(roomState)) // Copy sâu mảng phòng
    }
  };

  dailyBackups.push(backupData);

  // Nếu có nhiều hơn 3 bản, xóa bản cũ nhất (ở đầu mảng)
  if (dailyBackups.length > 3) {
    dailyBackups.shift();
  }
  
  // Lưu vào bộ nhớ trình duyệt để không mất khi F5
  localStorage.setItem('sunriseHotel_DailyBackups', JSON.stringify(dailyBackups));
}

// Tải lại các bản sao lưu đã lưu trước đó (nếu có)
const savedBackups = localStorage.getItem('sunriseHotel_DailyBackups');
if (savedBackups) {
  dailyBackups = JSON.parse(savedBackups);
}
// ==========================================
// HỆ THỐNG THÔNG BÁO TÙY CHỈNH (CUSTOM UI)
// ==========================================

function showCustomAlert(message, isConfirm = false, onConfirm = null) {
  document.getElementById('alertTitle').innerText = isConfirm ? "Xác nhận" : "Thông báo";
  document.getElementById('alertMessage').innerHTML = message;
  
  const btnGroup = document.getElementById('alertBtnGroup');
  
  if (isConfirm) {
    // Nếu là bảng xác nhận (có 2 nút Hủy / Đồng ý)
    btnGroup.innerHTML = `
      <button class="btn-base secondary" id="alertCancelBtn" style="flex:1; margin-right:5px; padding:10px;">Hủy</button>
      <button class="btn-base" id="alertConfirmBtn" style="flex:1; padding:10px; background:#ef4444; box-shadow:0 4px 0 #991b1b;">Đồng ý</button>
    `;
    document.getElementById('alertCancelBtn').onclick = () => {
      document.getElementById('customAlertPanel').classList.remove('show');
    };
    document.getElementById('alertConfirmBtn').onclick = () => {
      document.getElementById('customAlertPanel').classList.remove('show');
      if (onConfirm) onConfirm();
    };
  } else {
    // Nếu chỉ là thông báo (1 nút OK)
    btnGroup.innerHTML = `<button class="btn-base" id="alertOkBtn" style="width:100%; padding:10px;">Đóng</button>`;
    document.getElementById('alertOkBtn').onclick = () => {
      document.getElementById('customAlertPanel').classList.remove('show');
    };
  }
  
  document.getElementById('customAlertPanel').classList.add('show');
}

function showCustomPrompt(title, message, defaultValue, onConfirm) {
  document.getElementById('promptInput').value = defaultValue;
  document.querySelector('#customPromptPanel h2').innerText = title;
  document.querySelector('#customPromptPanel p').innerText = message;
  
  document.getElementById('customPromptPanel').classList.add('show');
  
  // Nút Copy Mã
  document.getElementById('promptOkBtn').onclick = () => {
    document.getElementById('promptInput').select();
    document.execCommand('copy'); // Tự động copy vào bộ nhớ tạm
    showToast("Đã copy mã Code vào bộ nhớ tạm!");
    document.getElementById('customPromptPanel').classList.remove('show');
    if (onConfirm) onConfirm();
  };
  
  // Nút Đóng
  document.getElementById('promptCancelBtn').onclick = () => {
    document.getElementById('customPromptPanel').classList.remove('show');
  };
}
  // Hàm tự động lưu vào máy
function autoSaveGame() {
  if (!isGameStarted) return; 

  try {
    const data = {
      hotelMoney: hotelMoney,
      playerMoney: playerMoney,
      totalRevenue: totalRevenue,
      playerLevel: playerLevel,
      playerExp: playerExp,
      maxExp: maxExp,
      hotelRating: hotelRating,
      roomState: roomState,
      gameTime: gameTime.getTime() // LƯU THỜI GIAN GAME (dạng số mili-giây)
    };
    localStorage.setItem('sunriseHotel_AutoSave', JSON.stringify(data));
  } catch (e) {
    console.log("Lỗi khi lưu Auto-Save:", e);
  }
}

// Hàm tự động tải lại khi mở game
function loadAutoSave() {
  const autoSaved = localStorage.getItem('sunriseHotel_AutoSave');
  if (!autoSaved) return; 

  try {
    const data = JSON.parse(autoSaved);
    
    if (data.hotelMoney !== undefined) hotelMoney = data.hotelMoney;
    if (data.playerMoney !== undefined) playerMoney = data.playerMoney;
    if (data.totalRevenue !== undefined) totalRevenue = data.totalRevenue;
    if (data.playerLevel !== undefined) playerLevel = data.playerLevel;
    if (data.playerExp !== undefined) playerExp = data.playerExp;
    if (data.maxExp !== undefined) maxExp = data.maxExp;
    if (data.hotelRating !== undefined) hotelRating = data.hotelRating;
    
    // KHÔI PHỤC THỜI GIAN GAME
    if (data.gameTime !== undefined) {
      gameTime = new Date(data.gameTime); // Chuyển từ số về đối tượng Date
    }

    if (data.roomState && data.roomState.length > 0) {
      data.roomState.forEach((savedRoom, idx) => {
        if (roomState[idx]) {
          roomState[idx] = savedRoom;
        }
      });
    }
    
    updateMoneyUI();
    document.getElementById('hudLv').innerText = `Lv.${playerLevel}`;
    document.getElementById('hudExp').innerText = `${playerExp}/${maxExp}`;
    document.getElementById('expFill').style.width = `${(playerExp / maxExp) * 100}%`;
    document.getElementById('rating').innerText = hotelRating.toFixed(1);
    
    updateClockUI(); // Cập nhật lại đồng hồ hiển thị đúng giờ vừa load
    draw();
    
    showToast("Đã tải lại tiến trình đang chơi!");
  } catch (e) {
    console.log("Lỗi khi khôi phục Auto-Save:", e);
  }
}
// ==========================================
// HIỂN THỊ THÔNG TIN Ở MENU CHÍNH
// ==========================================
// Hàm này sẽ chạy khi ở Menu chính để lấy dữ liệu Auto-Save hiển thị ra
// Hàm này sẽ chạy khi ở Menu chính để lấy dữ liệu Auto-Save hiển thị ra
function updateMenuInfo() {
  const autoSaved = localStorage.getItem('sunriseHotel_AutoSave');
  
  if (autoSaved) {
    try {
      const data = JSON.parse(autoSaved);
      
      // Hiển thị Tên và Level
      document.getElementById('menuPlayerName').innerText = "Minh"; // Tên mặc định
      document.getElementById('menuPlayerLv').innerText = data.playerLevel || 1;
      
      // Hiển thị Giờ và Ngày
      if (data.gameTime !== undefined) {
        const d = new Date(data.gameTime); // Lấy thời gian từ file lưu
        document.getElementById('menuPlayerTime').innerText = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        document.getElementById('menuPlayerDate').innerText = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      } else {
        // Nếu file lưu cũ chưa có thời gian, hiển thị mặc định
        document.getElementById('menuPlayerTime').innerText = "00:00";
        document.getElementById('menuPlayerDate').innerText = "01/01/2024";
      }
      
    } catch (e) {
      console.log("Lỗi đọc file save ở Menu:", e);
    }
  } else {
    // Nếu chưa từng chơi, hiển thị thông số mặc định
    document.getElementById('menuPlayerLv').innerText = "1";
    document.getElementById('menuPlayerTime').innerText = "00:00";
    document.getElementById('menuPlayerDate').innerText = "01/01/2024";
  }
}

// Gọi hàm này ngay khi web tải xong (lúc đang ở Menu chính)
updateMenuInfo();

// Xử lý sự kiện bấm vào nút "Khôi phục dữ liệu?"
document.getElementById('menuLoadSaveBtn').onclick = () => {
  // Mở bảng Cài đặt
  document.getElementById('settingsPanel').classList.add('show');
  
  // (Tuỳ chọn) Cuộn xuống phần dữ liệu game
  const dataSection = document.getElementById('settingsPanel').querySelector('.window');
  if (dataSection) {
    dataSection.scrollTop = dataSection.scrollHeight;
  }
};
// ==========================================
// KIỂM TRA LEVEL ĐỂ MỞ KHÓA NÚT
// ==========================================
function updateExpandButton() {
  const btn = document.getElementById('btnExpand');
  const icon = document.getElementById('btnExpandIcon');
  const text = document.getElementById('btnExpandText');

  if (!btn || !icon || !text) return; // Tránh lỗi nếu không tìm thấy nút

  if (playerLevel >= 5) {
    // Đã đủ Lv.5 -> Mở khóa
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    icon.innerText = '🏢'; // Đổi icon (bạn có thể đổi thành icon khác tùy thích)
    text.innerText = 'Mở rộng';
    text.style.fontSize = '13px'; // Chữ to lại cho bằng các nút khác
    text.style.fontWeight = 'bold';
  } else {
    // Chưa đủ Lv.5 -> Khóa
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    icon.innerText = '🔒';
    text.innerText = 'Yêu cầu Lv.5';
    text.style.fontSize = '10px';
    text.style.fontWeight = 'normal';
  }
}
  
  
  // Tự động lưu mỗi 10 giây
setInterval(autoSaveGame, 10000);

// Lưu ngay khi tắt trang
window.addEventListener('beforeunload', () => {
  autoSaveGame();
});
updateClockUI();
window.addEventListener('DOMContentLoaded', () => { 
  isGamePaused = false; 
  isGameStarted = false; 
  initUI(); 
  updateMenuInfo(); // <--- GỌI HÀM HIỂN THỊ THÔNG TIN MENU Ở ĐÂY
  resizeAll(); 
});
window.addEventListener('resize', resizeAll);
window.addEventListener('orientationchange', () => setTimeout(resizeAll, 200));