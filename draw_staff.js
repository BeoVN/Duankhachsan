// ==========================================
// FILE XỬ LÝ HÌNH ẢNH VÀ HOẠT ẢNH NHÂN VIÊN
// ==========================================

// 1. Khai báo hình ảnh
const staffImages = {
  baoVe_Nam: new Image(), 
  danKhach_Nam: new Image(), 
  danKhach_Nu: new Image(),
  donPhong_Nam: new Image(), 
  donPhong_Nu: new Image(),
  veSinh_Nam: new Image(), 
  veSinh_Nu: new Image()
};

// Đường dẫn ảnh (Vì thư mục staff nằm ngang hàng với file html)
staffImages.baoVe_Nam.src = 'staff/namnvbaove.png';
staffImages.danKhach_Nam.src = 'staff/namnvdankhach.png';
staffImages.danKhach_Nu.src = 'staff/nunvdankhach.png';
staffImages.donPhong_Nam.src = 'staff/namnvdonphong.png';
staffImages.donPhong_Nu.src = 'staff/nunvdonphong.png';
staffImages.veSinh_Nam.src = 'staff/namnvvesinh.png';
staffImages.veSinh_Nu.src = 'staff/nunvvesinh.png';

// 2. Khai báo trạng thái hoạt động
let veSinhPosX = 400; 
let veSinhDirection = 1; 
let guideGuestState = 'none';
let guidePosX = 480; 
let guidePosY = 450;
let guestPosX = 480;
let guestPosY = 50;
let guidePathHistory = []; // Lưu lại đường đi của dẫn khách
let guideTargetRoom = null;
let cleanerPosX = 480;
let cleanerPosY = 50;
let cleanerState = 'none'; // Trạng thái: 'none', 'walking', 'cleaning'
let cleanerTargetRoom = null;
let cleanerTimer = 0; // Đếm ngược 10 giây
let cleanerWaitTimer = 0; // Thời gian chờ trước khi nhân viên xuất hiện

// ==========================================
// CÁC HÀM VẼ NHÂN VIÊN (Dùng chung biến ctx từ script.js)
// ==========================================
function isImageReady(img) {
  return img && img.complete && img.naturalWidth !== 0;
}
// Vẽ bảo vệ ở tầng hầm
function drawSecurityGuard() {
  if (staffImages.baoVe_Nam.complete) {
    ctx.drawImage(staffImages.baoVe_Nam, 440, 450, 80, 80);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText("Bảo vệ", 480, 545);
  }
}

// Vẽ nhân viên vệ sinh đi lại ở hành lang
function drawJanitor() {
  if (staffImages.veSinh_Nu.complete) {
    ctx.drawImage(staffImages.veSinh_Nu, veSinhPosX, 400, 50, 50);
    
    // Vẽ tên
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText("Vệ sinh", veSinhPosX + 25, 390);
  }
}

// Vẽ nhân viên dọn phòng (chỉ vẽ ở phòng đang cần dọn)
function drawRoomCleaners(currentFloor, roomState) {
  roomState.forEach(room => {
    if (room.status === 'Cần dọn' && Math.floor(room.number / 100) === currentFloor) {
      const roomIdx = roomState.indexOf(room);
      const roomRow = roomIdx % 3; 
      const isLeft = (roomIdx % 6) < 3;
      
      const roomX = isLeft ? (360 - 250 - 30) : (360 + 240 + 30);
      const roomY = 70 + roomRow * (150 + 15);
      
      if (staffImages.donPhong_Nu.complete) {
        ctx.drawImage(staffImages.donPhong_Nu, roomX + 100, roomY + 50, 50, 50);
      }
    }
  });
}

// Vẽ nhân viên dẫn khách (ở sảnh hoặc trên hành lang)
function drawGuide(currentFloor) {
  if (currentFloor >= 2 && guideGuestState === 'to_room') {
    
    // VẼ NHÂN VIÊN
    if (isImageReady(staffImages.danKhach_Nam)) {
      ctx.drawImage(staffImages.danKhach_Nam, guidePosX, guidePosY, 60, 60);
      label("Dẫn khách", guidePosX + 30, guidePosY - 10, 12, '#fff', 'center');
    }

    // VẼ KHÁCH ĐI THEO SAU (Bám đuôi theo trục Y và X)
    if (window.tempGuestsForDrawing && window.tempGuestsForDrawing.length > 0) {
      const guests = window.tempGuestsForDrawing;
      const size = 50;
      const spacing = 45; // Khoảng cách giữa các khách

      for (let i = 0; i < guests.length; i++) {
        // Tính toán vị trí của khách dựa trên vị trí hiện tại của nhân viên
        let guestX = guidePosX;
        let guestY = guidePosY - (i + 1) * spacing;

        // Nếu nhân viên đã rẽ ngang, khách cũng phải đi lệch theo
        if (guidePosY >= (130 + (roomState.findIndex(r => r.number === guideTargetRoom) % 3) * 165) - 5) {
           // Khách đã xuống tới hàng phòng, bắt đầu đi ngang theo nhân viên
           guestX = guidePosX - (i + 1) * spacing;
           guestY = guidePosY;
        }

        // Vẽ khách
        ctx.drawImage(getGuestImage(guests[i]), guestX, guestY, size, size);
      }
    }
  }
// VẼ NHÂN VIÊN DỌN PHÒNG
if (currentFloor >= 2 && (cleanerState === 'walking' || cleanerState === 'cleaning')) {
  if (isImageReady(staffImages.donPhong_Nu)) { 
    ctx.drawImage(staffImages.donPhong_Nu, cleanerPosX, cleanerPosY, 50, 50);
    
    if (cleanerState === 'cleaning') {
      label("Đang dọn...", cleanerPosX + 25, cleanerPosY - 10, 12, '#10b981', 'center');
    } else {
      label("Dọn phòng", cleanerPosX + 25, cleanerPosY - 10, 12, '#10b981', 'center');
    }
  }
}
}

// Hàm cập nhật chuyển động (Gọi trong setInterval của script.js)
function updateStaffAnimations() {
  let needsRedraw = false;

  // 1. Vệ sinh đi lại
  if (currentFloor >= 2) {
    veSinhPosX += (veSinhDirection * 10);
    if (veSinhPosX > 600) veSinhDirection = -1;
    if (veSinhPosX < 350) veSinhDirection = 1;
    needsRedraw = true;
  }

  // 2. Dẫn khách đi
  if (currentFloor >= 2 && guideGuestState === 'to_room') {
    const roomIdx = roomState.findIndex(r => r.number === guideTargetRoom);
    if (roomIdx !== -1) {
      const row = roomIdx % 3; 
      const isLeft = (roomIdx % 6) < 3; 
      const targetY = 130 + row * 165; 
      const targetX = isLeft ? 360 : 600; 
      const speed = 30; // Tốc độ vừa phải (không quá nhanh để khách theo kịp)

      // NHÂN VIÊN DI CHUYỂN
      if (guidePosY < targetY) {
        guidePosY = Math.min(guidePosY + speed, targetY);
      } else if (guidePosX !== targetX) {
        if (guidePosX < targetX) guidePosX = Math.min(guidePosX + speed, targetX);
        else guidePosX = Math.max(guidePosX - speed, targetX);
      }

      // KIỂM TRA ĐẾN ĐÍCH
      if (guidePosX === targetX && guidePosY === targetY) {
        // Đợi 1 nhịp (khoảng 20 khung hình) để khách bước vào trong phòng
        if (!window.arrivedTime) window.arrivedTime = Date.now();
        if (Date.now() - window.arrivedTime > 2000) { // Đợi 2 giây
          guideGuestState = 'none'; 
          
          const room = roomState[roomIdx];
          if (room && window.tempGuestsForDrawing) {
            room.guests = window.tempGuestsForDrawing;
            room.guestPos = 'center';
          }
          currentGuest = null;
          window.tempGuestsForDrawing = null;
          window.arrivedTime = null; // Reset
          showToast(`Khách đã vào phòng ${guideTargetRoom} an toàn!`);
        }
      }
      needsRedraw = true;
    }
  }
// 3. NHÂN VIÊN DỌN PHÒNG TỰ ĐỘNG
// Nếu có phòng cần dọn VÀ nhân viên đang rảnh
if (cleanerState === 'none' && cleaningRoomNumber !== null) {
  // Nếu chưa bắt đầu đếm ngược thời gian chờ, thì bắt đầu đếm (3 giây)
  if (cleanerWaitTimer === 0) {
    cleanerWaitTimer = 3; 
  }
  
  cleanerWaitTimer--;
  
  // Khi hết thời gian chờ (3 giây), nhân viên mới xuất hiện
  if (cleanerWaitTimer <= 0) {
    cleanerState = 'walking';
    cleanerTargetRoom = cleaningRoomNumber;
    cleanerPosX = 480; // Xuất phát từ thang máy
    cleanerPosY = 50;
    cleanerWaitTimer = 0;
    showToast("Nhân viên dọn phòng đang di chuyển tới...");
  }
  needsRedraw = true; // Cần vẽ lại để cập nhật trạng thái chờ
}

// Nhân viên bắt đầu đi bộ
if (cleanerState === 'walking' && cleanerTargetRoom !== null) {
  const roomIdx = roomState.findIndex(r => r.number === cleanerTargetRoom);
  if (roomIdx !== -1) {
    const row = roomIdx % 3; 
    const isLeft = (roomIdx % 6) < 3; 
    const targetY = 130 + row * 165; 
    const targetX = isLeft ? 360 : 600; 
    const speed = 15; 

    if (cleanerPosY < targetY) {
      cleanerPosY = Math.min(cleanerPosY + speed, targetY);
    } else if (cleanerPosX !== targetX) {
      if (cleanerPosX < targetX) cleanerPosX = Math.min(cleanerPosX + speed, targetX);
      else cleanerPosX = Math.max(cleanerPosX - speed, targetX);
    }

    // Khi tới cửa phòng -> Bắt đầu dọn
    if (cleanerPosX === targetX && cleanerPosY === targetY) {
      cleanerState = 'cleaning';
      cleanerTimer = 10; // 10 giây dọn dẹp
      showToast(`Nhân viên đang dọn phòng ${cleanerTargetRoom} (10s)...`);
    }
  }
  needsRedraw = true;
}

// Nhân viên đang dọn dẹp
if (cleanerState === 'cleaning') {
  cleanerTimer--;
  
  if (cleanerTimer <= 0) {
    const roomToClean = roomState.find(r => r.number === cleanerTargetRoom);
    if (roomToClean && roomToClean.status === 'Cần dọn') { 
      roomToClean.status = 'Trống'; 
      updateRating(0.1); 
      showToast(`Phòng ${cleanerTargetRoom} đã được dọn sạch!`);
    }
    
    // Reset mọi thứ
    cleanerState = 'none';
    cleanerTargetRoom = null;
    cleaningRoomNumber = null; 
    cleaningEndTime = 0;
    cleanerWaitTimer = 0;
  }
  needsRedraw = true;
}
  
  return needsRedraw;
}