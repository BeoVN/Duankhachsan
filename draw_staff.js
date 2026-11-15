// ==========================================
// FILE XỬ LÝ HÌNH ẢNH VÀ HOẠT ẢNH NHÂN VIÊN
// ==========================================

const staffImages = {
  baoVe_Nam: new Image(), 
  danKhach_Nam: new Image(), 
  danKhach_Nu: new Image(),
  donPhong_Nam: new Image(), 
  donPhong_Nu: new Image(),
  veSinh_Nam: new Image(), 
  veSinh_Nu: new Image()
};

staffImages.baoVe_Nam.src = 'staff/namnvbaove.png';
staffImages.danKhach_Nam.src = 'staff/namnvdankhach.png';
staffImages.danKhach_Nu.src = 'staff/nunvdankhach.png';
staffImages.donPhong_Nam.src = 'staff/namnvdonphong.png';
staffImages.donPhong_Nu.src = 'staff/nunvdonphong.png';
staffImages.veSinh_Nam.src = 'staff/namnvvesinh.png';
staffImages.veSinh_Nu.src = 'staff/nunvvesinh.png';

function isImageReady(img) {
  return img && img.complete && img.naturalWidth !== 0;
}

// --- BIẾN DẪN KHÁCH ---
let guideGuestState = 'none';
let guidePosX = 480; 
let guidePosY = 80;
let guideTargetRoom = null;
let guidePathHistory = []; 

// --- BIẾN NHÂN VIÊN VỆ SINH (Lộ trình vòng quanh) ---
let janitor1 = { floor: 2, x: 480, y: 80, pathStep: 0, state: 'walking', timer: 0 };
let janitor2 = { floor: 5, x: 480, y: 80, pathStep: 0, state: 'walking', timer: 0 };

// --- BIẾN NHÂN VIÊN DỌN PHÒNG ---
let cleaner1 = { state: 'idle', floor: 0, x: 480, y: 80, targetRoom: null, targetY: 0, targetX: 0, timer: 0, phase: 'go_to_room', roomPos: 'center' };
let cleaner2 = { state: 'idle', floor: 0, x: 480, y: 80, targetRoom: null, targetY: 0, targetX: 0, timer: 0, phase: 'go_to_room', roomPos: 'center' };

// ==========================================
// CÁC HÀM VẼ NHÂN VIÊN
// ==========================================

function drawSecurityGuard() {
  if (isImageReady(staffImages.baoVe_Nam)) {
    ctx.drawImage(staffImages.baoVe_Nam, 440, 450, 80, 80);
    label("Bảo vệ", 480, 545, 12, '#fff', 'center');
  }
}

function drawJanitor() {
  // Chỉ vẽ nhân viên vệ sinh nếu đang ở đúng tầng
  if (currentFloor === janitor1.floor && isImageReady(staffImages.veSinh_Nu)) {
    ctx.drawImage(staffImages.veSinh_Nu, janitor1.x, janitor1.y, 60, 60);
    label("Vệ sinh", janitor1.x + 25, janitor1.y - 10, 10, '#fca5a5', 'center');
  }
  if (currentFloor === janitor2.floor && isImageReady(staffImages.veSinh_Nam)) {
    ctx.drawImage(staffImages.veSinh_Nam, janitor2.x, janitor2.y, 60, 60);
    label("Vệ sinh", janitor2.x + 25, janitor2.y - 10, 10, '#fca5a5', 'center');
  }
}

function drawRoomCleaners(currentFloor, roomState) {
  const drawCleaner = (cleaner, img) => {
    if (cleaner.state === 'walking') {
      // Đang đi trên hành lang
      if (isImageReady(img)) {
        ctx.drawImage(img, cleaner.x, cleaner.y, 50, 50);
        label("Dọn phòng", cleaner.x + 25, cleaner.y - 10, 12, '#10b981', 'center');
      }
    } else if (cleaner.state === 'cleaning') {
      // Đang dọn bên trong phòng
      const roomIdx = roomState.findIndex(r => r.number === cleaner.targetRoom);
      if (roomIdx !== -1) {
        const row = roomIdx % 3; 
        const isLeft = (roomIdx % 6) < 3;
        const roomX = isLeft ? (360 - 250 - 30) : (360 + 240 + 30);
        const roomY = 70 + row * 165;
        
        // Tính vị trí dựa vào roomPos
        let cx = roomX + 125; // Mặc định center
        let cy = roomY + 75;
        if (cleaner.roomPos === 'bed') { cx = roomX + 60; cy = roomY + 60; }
        if (cleaner.roomPos === 'desk') { cx = roomX + 180; cy = roomY + 60; }

        if (isImageReady(img)) {
          ctx.drawImage(img, cx - 25, cy - 25, 50, 50);
          label("Đang dọn...", cx, cy - 35, 12, '#3b82f6', 'center');
        }
      }
    }
  };

  if (currentFloor === cleaner1.floor) drawCleaner(cleaner1, staffImages.donPhong_Nu);
  if (currentFloor === cleaner2.floor) drawCleaner(cleaner2, staffImages.donPhong_Nam);
}

function drawGuide(currentFloor) {
  if (guideGuestState === 'to_room') {
    const targetFloor = Math.floor(guideTargetRoom / 100);
    if (currentFloor === targetFloor) {
      
      const guests = window.tempGuestsForDrawing || [];
      const size = 50;
      
      const roomIdx = roomState.findIndex(r => r.number === guideTargetRoom);
      const isLeft = (roomIdx % 6) < 3;
      const targetY = 130 + (roomIdx % 3) * 165;
      const targetX = isLeft ? 360 : 600;

      const isAtDoor = (guidePosX === targetX && guidePosY === targetY);

      if (guests.length > 0) {
        if (!isAtDoor) {
          const delaySteps = 2; 
          for (let i = 0; i < guests.length; i++) {
            const historyIndex = (i + 1) * delaySteps;
            if (guidePathHistory.length > historyIndex) {
              const pastPos = guidePathHistory[historyIndex];
              ctx.drawImage(getGuestImage(guests[i]), pastPos.x, pastPos.y, size, size);
            }
          }
        } else {
          const baseX = isLeft ? guidePosX + 40 : guidePosX - 40; 
          const baseY = guidePosY;

          for (let i = 0; i < guests.length; i++) {
            let gx = baseX, gy = baseY;
            const img = getGuestImage(guests[i]);

            if (guests.length === 1) { gx = baseX; gy = baseY; }
            else if (guests.length === 2) {
              if (i === 0) { gx = baseX; gy = baseY - 30; } else { gx = baseX; gy = baseY + 30; }
            } else if (guests.length === 3) {
              if (i === 0) { gx = baseX + (isLeft ? -30 : 30); gy = baseY; }
              else if (i === 1) { gx = baseX + (isLeft ? 15 : -15); gy = baseY - 30; }
              else { gx = baseX + (isLeft ? 15 : -15); gy = baseY + 30; }
            } else if (guests.length >= 4) {
              if (i === 0) { gx = baseX + (isLeft ? -30 : 30); gy = baseY - 30; }
              else if (i === 1) { gx = baseX + (isLeft ? 15 : -15); gy = baseY - 30; }
              else if (i === 2) { gx = baseX + (isLeft ? -30 : 30); gy = baseY + 30; }
              else { gx = baseX + (isLeft ? 15 : -15); gy = baseY + 30; }
            }
            ctx.drawImage(img, gx, gy, size, size);
          }
        }
      }

      if (isImageReady(staffImages.danKhach_Nam)) {
        ctx.drawImage(staffImages.danKhach_Nam, guidePosX, guidePosY, 60, 60);
        label("Dẫn khách", guidePosX + 30, guidePosY - 10, 12, '#fff', 'center');
      }
    }
  }
}

// ==========================================
// HÀM CẬP NHẬT HOẠT ẢNH (LUÔN CHẠY NGẦM)
// ==========================================
function updateStaffAnimations() {
  let needsRedraw = false;

 // 1. NHÂN VIÊN VỆ SINH (Đi vòng quanh chữ O)
[janitor1, janitor2].forEach(janitor => {
  if (janitor.state === 'walking') {
    const speed = 20;
    // Lộ trình: Thang máy(480,80) -> x01(360,130) -> x03(360,460) -> x06(600,460) -> x04(600,130) -> Thang máy(480,80)
    const path = [
      { x: 360, y: 130 }, 
      { x: 360, y: 460 }, 
      { x: 540, y: 460 }, 
      { x: 540, y: 130 }, 
      { x: 480, y: 80 }
    ];

    if (janitor.pathStep < path.length) {
      const target = path[janitor.pathStep];
      if (janitor.x !== target.x) {
        if (janitor.x < target.x) janitor.x = Math.min(janitor.x + speed, target.x);
        else janitor.x = Math.max(janitor.x - speed, target.x);
      } else if (janitor.y !== target.y) {
        if (janitor.y < target.y) janitor.y = Math.min(janitor.y + speed, target.y);
        else janitor.y = Math.max(janitor.y - speed, target.y);
      } else {
        janitor.pathStep++;
      }
    } else {
      janitor.state = 'in_elevator';
      janitor.timer = 3; 
    }
  } else if (janitor.state === 'in_elevator') {
    janitor.timer--;
    if (janitor.timer <= 0) {
      janitor.floor = Math.floor(Math.random() * 5) + 2; 
      janitor.x = 480; janitor.y = 80; janitor.pathStep = 0;
      janitor.state = 'walking';
    }
  }
});

// 2. NHÂN VIÊN DỌN PHÒNG
[cleaner1, cleaner2].forEach((cleaner, index) => {
  
  // Nếu đang rảnh, tìm phòng mới
  if (cleaner.state === 'idle') {
    const availableRooms = roomState.filter(r => {
      // Chỉ lấy phòng đang cần dọn
      if (r.status !== 'Cần dọn') return false;
      
      // Kiểm tra thời gian thực: Không lấy phòng mà nhân viên kia đang nhắm tới
      const otherCleaner = index === 0 ? cleaner2 : cleaner1;
      if (otherCleaner.targetRoom === r.number && otherCleaner.state !== 'idle') return false;
      
      return true;
    });

    let roomToClean = null;
    if (availableRooms.length > 0) {
      // Ưu tiên phòng cùng tầng
      const sameFloorRoom = availableRooms.find(r => Math.floor(r.number / 100) === cleaner.floor);
      roomToClean = sameFloorRoom ? sameFloorRoom : availableRooms[0];
    }

    if (roomToClean) {
      cleaner.state = 'walking';
      cleaner.phase = 'go_to_room';
      cleaner.targetRoom = roomToClean.number;
      cleaner.floor = Math.floor(roomToClean.number / 100);
      cleaner.x = 480; cleaner.y = 80;
      
      const rIdx = roomState.findIndex(r => r.number === roomToClean.number);
      const row = rIdx % 3;
      const isLeft = (rIdx % 6) < 3;
      cleaner.targetY = 130 + row * 165;
      cleaner.targetX = isLeft ? 320 : 580; 
    }
  }

  // Di chuyển
  if (cleaner.state === 'walking') {
    const speed = 20;
    if (cleaner.phase === 'go_to_room') {
      if (cleaner.y < cleaner.targetY) {
        cleaner.y = Math.min(cleaner.y + speed, cleaner.targetY);
      } else if (cleaner.x !== cleaner.targetX) {
        if (cleaner.x < cleaner.targetX) cleaner.x = Math.min(cleaner.x + speed, cleaner.targetX);
        else cleaner.x = Math.max(cleaner.x - speed, cleaner.targetX);
      } else {
        // ĐÃ TỚI CỬA PHÒNG -> KIỂM TRA LẠI TRẠNG THÁI PHÒNG
        const room = roomState.find(r => r.number === cleaner.targetRoom);
        
        if (room && room.status === 'Cần dọn') {
          cleaner.state = 'cleaning';
          cleaningProgressTimer = 10; 
        } else {
          // PHÒNG ĐÃ SẠCH (Do người khác dọn) -> QUAY VỀ THANG MÁY
          cleaner.state = 'walking';
          cleaner.phase = 'return_to_elevator';
        }
      }
    } else if (cleaner.phase === 'return_to_elevator') {
      if (cleaner.x !== 480) {
        if (cleaner.x < 480) cleaner.x = Math.min(cleaner.x + speed, 480);
        else cleaner.x = Math.max(cleaner.x - speed, 480);
      } else if (cleaner.y > 80) {
        cleaner.y = Math.max(cleaner.y - speed, 80);
      } else {
        cleaner.state = 'idle';
        cleaner.targetRoom = null; 
      }
    }
  }
  
  // Đang dọn
  if (cleaner.state === 'cleaning') {
    cleaningProgressTimer--; 
    
    // Mỗi 2 giây đổi vị trí trong phòng
    if (cleaningProgressTimer % 2 === 0 && cleaningProgressTimer > 0) {
      const positions = ['bed', 'desk', 'center'];
      cleaner.roomPos = positions[Math.floor(Math.random() * positions.length)];
    }

    if (cleaningProgressTimer <= 0) {
      const room = roomState.find(r => r.number === cleaner.targetRoom);
      if (room) { 
        room.status = 'Trống'; 
        updateRating(0.1); 
        showToast(`Phòng ${room.number} đã được dọn sạch!`); 
      }
      
      const justCleanedRoom = cleaner.targetRoom;
      cleaner.targetRoom = null; 
      cleaner.roomPos = 'center'; 
      
      // Tìm phòng khác cùng tầng
      const nextRooms = roomState.filter(r => 
        r.status === 'Cần dọn' && 
        Math.floor(r.number / 100) === cleaner.floor && 
        r.number !== justCleanedRoom
      );

      if (nextRooms.length > 0) {
        const nextRoom = nextRooms[0];
        cleaner.targetRoom = nextRoom.number;
        const rIdx = roomState.findIndex(r => r.number === nextRoom.number);
        const row = rIdx % 3;
        const isLeft = (rIdx % 6) < 3;
        cleaner.targetY = 130 + row * 165;
        cleaner.targetX = isLeft ? 320 : 580;
        cleaner.state = 'walking';
        cleaner.phase = 'go_to_room';
      } else {
        cleaner.state = 'walking';
        cleaner.phase = 'return_to_elevator';
      }
    }
  }
}); // <--- ĐÂY LÀ DẤU NGOẶC ĐÓNG CỦA forEach (Đảm bảo bạn có dấu này)
 

  // 3. DẪN KHÁCH (Giữ nguyên)
  if (guideGuestState === 'to_room') {
    const roomIdx = roomState.findIndex(r => r.number === guideTargetRoom);
    if (roomIdx !== -1) {
      const row = roomIdx % 3; 
      const isLeft = (roomIdx % 6) < 3; 
      const targetY = 130 + row * 165; 
      const targetX = isLeft ? 360 : 600; 
      const speed = 30; 

      if (guidePosY < targetY) guidePosY = Math.min(guidePosY + speed, targetY);
      else if (guidePosX !== targetX) {
        if (guidePosX < targetX) guidePosX = Math.min(guidePosX + speed, targetX);
        else guidePosX = Math.max(guidePosX - speed, targetX);
      }

      guidePathHistory.unshift({ x: guidePosX, y: guidePosY });
      if (guidePathHistory.length > 300) guidePathHistory.pop();

      if (guidePosX === targetX && guidePosY === targetY) {
        if (!window.guideArrivedTime) window.guideArrivedTime = Date.now();
        if (Date.now() - window.guideArrivedTime > 1500) {
          guideGuestState = 'none'; 
          const room = roomState[roomIdx];
          if (room && window.tempGuestsForDrawing) {
            room.guests = window.tempGuestsForDrawing;
            room.guestPos = isLeft ? 'right' : 'left';
          }
          window.tempGuestsForDrawing = null;
          guidePathHistory = []; 
          window.guideArrivedTime = null;
          requestAnimationFrame(() => {
            showToast(`Khách đã vào phòng ${guideTargetRoom} an toàn!`);
            draw();
          });
        }
      }
    }
  }

 return needsRedraw;
}