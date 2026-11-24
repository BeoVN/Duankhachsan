// ==========================================
// GIAO DIỆN: hồ sơ khách & nhật ký
// ==========================================
function renderGuestProfiles() {
  const list = document.getElementById('profiles-list');
  list.innerHTML = '';
  
  if (guestProfiles.length === 0) {
    list.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Chưa có hồ sơ khách hàng nào.</div>';
    return;
  }

  // SẮP XẾP MẢNG THEO THỜI GIAN MỚI NHẤT LÊN ĐẦU
guestProfiles.sort((a, b) => {
  const dateA = new Date(a.date.split('/').reverse().join('-')); 
  const dateB = new Date(b.date.split('/').reverse().join('-'));
  return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
});

// Nhóm hồ sơ theo ngày
const groupedByDate = {};
  guestProfiles.forEach(profile => {
    if (!groupedByDate[profile.date]) groupedByDate[profile.date] = [];
    groupedByDate[profile.date].push(profile);
  });

  // Duyệt qua từng ngày
  for (const date in groupedByDate) {
    // Tiêu đề ngày
    const dateHeader = document.createElement('div');
    dateHeader.style.cssText = "font-weight:bold; background:#d1dbe5; padding:5px 10px; border-radius:5px; margin: 10px 0 5px 0; color:#1e3a52;";
    dateHeader.innerText = `📅 Ngày: ${date}`;
    list.appendChild(dateHeader);

    // Duyệt qua từng phòng trong ngày đó
    groupedByDate[date].forEach(profile => {
      const roomDiv = document.createElement('div');
      roomDiv.style.cssText = "margin-bottom:10px; padding:10px; border:1px solid #cbd5e1; border-radius:5px; background:#fff;";
      
      let roomHtml = `<div style="font-weight:bold; color:#2c6e9e; margin-bottom:5px; border-bottom:1px dashed #ccc; padding-bottom:3px;">🚪 Phòng ${profile.room}</div>`;
      
      profile.guests.forEach((g, index) => {
        roomHtml += `
          <div style="font-size:13px; margin-bottom:5px; padding-left:10px;">
            <b>Người ${index + 1}:</b> ${g.name}<br>
            <span style="color:#555;">- Tuổi: ${g.age} | CCCD: ${g.idCard}</span>
          </div>
        `;
      });
      
      roomDiv.innerHTML = roomHtml;
      list.appendChild(roomDiv);
    });
  }
}

function renderDiary() {
  const inDiv = document.getElementById('diaryCheckIn');
  const outDiv = document.getElementById('diaryCheckOut');
  if (!inDiv || !outDiv) return;
  
  inDiv.innerHTML = '';
  outDiv.innerHTML = '';
  
  if (diaryHistory.in.length === 0 && diaryHistory.out.length === 0) {
    inDiv.innerHTML = '<div style="color:#888; text-align:center; padding:10px;">Chưa có dữ liệu</div>';
    outDiv.innerHTML = '<div style="color:#888; text-align:center; padding:10px;">Chưa có dữ liệu</div>';
    return;
  }
  
  diaryHistory.in.slice().reverse().forEach(item => {
    inDiv.insertAdjacentHTML('beforeend', `<div style="padding:5px; border-bottom:1px dashed #ccc;"><b>Phòng ${item.room}</b> - ${item.time}</div>`);
  });
  
  diaryHistory.out.slice().reverse().forEach(item => {
    outDiv.insertAdjacentHTML('beforeend', `<div style="padding:5px; border-bottom:1px dashed #ccc;"><b>Phòng ${item.room}</b> - ${item.time}</div>`);
  });
}
