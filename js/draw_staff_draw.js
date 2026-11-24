// ==========================================
// VẼ NHÂN VIÊN: biến trạng thái & hàm vẽ
// ==========================================
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
