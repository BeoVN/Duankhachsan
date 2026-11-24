// ==========================================
// HOẠT ẢNH NHÂN VIÊN (chạy ngầm)
// ==========================================
// ==========================================
// HÀM CẬP NHẬT HOẠT ẢNH (LUÔN CHẠY NGẦM)
// ==========================================
function updateStaffAnimations() {
  let needsRedraw = false;

  // Nếu có khách đang chờ dẫn và nhân viên dẫn khách đã rảnh -> bắt đầu dẫn
  if (pendingGuestForGuide && guideGuestState === 'none') {
    guideGuestState = 'to_room';
    guidePosX = 480; guidePosY = 40;
    guideTargetRoom = pendingGuestForGuide.room;
    window.tempGuestsForDrawing = pendingGuestForGuide.guests;
    guidePathHistory = [];
    pendingGuestForGuide = null;
  }

 // 1. NHÂN VIÊN VỆ SINH (Đi vòng quanh chữ O)
[janitor1, janitor2].forEach((janitor, index) => {
    // KIỂM TRA XEM NHÂN VIÊN CÓ ĐANG LÀM VIỆC KHÔNG
    const staffInfo = getWorkingStaff('veSinh')[index]; // người thứ index đang trong ca
    if (!staffInfo) {
      janitor.state = 'in_elevator'; // Ẩn nhân viên khỏi màn hình
      return; 
    }
  
  if (janitor.state === 'walking') {
    const speed = Math.max(5, Math.round(20 * staffSpeedMult(staffInfo)));
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
const roomsNeedCleaning = roomState.filter(r => r.status === 'Cần dọn');
  [cleaner1, cleaner2].forEach((cleaner, index) => {
    const staffInfo = getWorkingStaff('donPhong')[index]; 
    if (!staffInfo) {
      cleaner.state = 'idle'; // Nhân viên nghỉ -> không dọn
      return;
    }
  
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
    const speed = Math.max(5, Math.round(20 * staffSpeedMult(staffInfo)));
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
          addInternalMessage("Nhân viên dọn phòng", `Tôi sẽ dọn phòng ${cleaner.targetRoom}.`); // <--- THÊM DÒNG NÀY
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
  // showToast(`Phòng ${room.number} đã được dọn sạch!`); // <--- XÓA DÒNG NÀY
  addInternalMessage("Nhân viên dọn phòng", `Tôi đã dọn xong phòng ${room.number}.`); // <--- THÊM DÒNG NÀY
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
    // Kiểm tra xem có ai đang làm việc không
    const danKhachStaff = getWorkingStaff('danKhach')[0];
    if (!danKhachStaff) {
      // Nếu không có ai làm, khách tự động biến mất (hoặc giữ trạng thái chờ)
      guideGuestState = 'none'; 
      return;
    }
    const roomIdx = roomState.findIndex(r => r.number === guideTargetRoom);
    if (roomIdx !== -1) {
      const row = roomIdx % 3; 
      const isLeft = (roomIdx % 6) < 3; 
      const targetY = 130 + row * 165; 
      const targetX = isLeft ? 360 : 600; 
      const speed = Math.max(8, Math.round(30 * staffSpeedMult(danKhachStaff))); 

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
            // showToast(`Khách đã vào phòng ${guideTargetRoom} an toàn!`); // <--- XÓA DÒNG NÀY
addInternalMessage("Nhân viên dẫn khách", `Khách đã vào phòng ${guideTargetRoom} an toàn!`); // <--- THÊM DÒNG NÀY
            draw();
          });
        }
      }
    }
  }

 return needsRedraw;
}
