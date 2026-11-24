// ==========================================
// LÕI GAME: tin nhắn nội bộ
// ==========================================
// Hàm thêm tin nhắn nội bộ
function addInternalMessage(sender, text) {
  internalMessages.push({
    sender: sender,
    text: text,
    time: `${gameTime.getHours().toString().padStart(2, '0')}:${gameTime.getMinutes().toString().padStart(2, '0')}`
  });
  
  // Nếu đang mở tab Tin nhắn -> Cập nhật ngay
  if (document.getElementById('msg-internal').style.display === 'block') {
    renderInternalMessages();
  }
}

// Hàm hiển thị tin nhắn nội bộ
function renderInternalMessages() {
  const container = document.getElementById('msg-internal');
  container.innerHTML = '';
  
  if (internalMessages.length === 0) {
    container.innerHTML = '<div style="text-align:center; color:#888; padding:20px;">Chưa có tin nhắn nội bộ nào.</div>';
    return;
  }
  
  internalMessages.slice().reverse().forEach(msg => {
    // XÁC ĐỊNH ẢNH ĐẠI DIỆN DỰA VÀO NGƯỜI GỬI
    let avatarSrc = '';
    if (msg.sender.includes("dọn phòng")) {
      avatarSrc = 'staff/nunvdonphong.png'; 
    } else if (msg.sender.includes("dẫn khách")) {
      avatarSrc = 'staff/namnvdankhach.png'; 
    } else if (msg.sender.includes("Quản lý")) {
      avatarSrc = 'staff/namnvbaove.png'; 
    } else {
      avatarSrc = 'staff/nunvvesinh.png'; 
    }

    // HTML CHUẨN ĐỂ AVATAR TRÒN VÀ CẮT GỌN ẢNH
    container.insertAdjacentHTML('beforeend', `
      <div style="display:flex; gap:12px; padding:12px; border-bottom:1px solid #e0e6ec; align-items:flex-start;">
        
        <!-- Khung Avatar -->
        <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; flex:none; background:#e2e8f0; display:flex; justify-content:center; align-items:center; border:2px solid #cbd5e1;">
          <img src="${avatarSrc}" style="width:100%; height:100%; object-fit:cover; object-position:center 20%;" alt="Avatar">
        </div>
        
        <!-- Nội dung tin nhắn -->
        <div style="flex:1;">
          <div style="font-weight:900; font-size:13px; color:#1e3a52; margin-bottom:3px;">${msg.sender}</div>
          <div style="font-size:13px; color:#4a5d6e; line-height:1.4;">${msg.text}</div>
        </div>
        
        <!-- Thời gian -->
        <div style="font-size:11px; color:#94a3b8; white-space:nowrap; margin-top:2px;">${msg.time}</div>
        
      </div>
    `);
  });
}
