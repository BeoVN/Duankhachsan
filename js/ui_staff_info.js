// ==========================================
// GIAO DIỆN: thông tin nhân viên (tab Thông tin)
// ==========================================
function renderStaffUI() {
  const container = document.getElementById('staff-info-info');
  if (!container) return;

  // Hàm phụ để tạo thẻ cho từng nhân viên
  const createStaffCard = (p) => {
    let statusColor = '#ef4444'; // Mặc định đỏ (hết ca)
    let statusText = 'Hết ca';
    if (p.status === 'working') { statusColor = '#22c55e'; statusText = 'Trong ca'; }
    if (p.status === 'leave') { statusColor = '#f59e0b'; statusText = 'Nghỉ phép'; }
    if (p.status === 'quitting') { statusColor = '#ef4444'; statusText = 'Sắp nghỉ'; }
    
    return `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; margin-bottom:5px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="font-size:12px; color:#1e3a52;">${p.name}</b>
          <span style="font-size:10px; color:#64748b;">${p.age} tuổi · ⭐${p.rvCount > 0 ? staffAvgRating(p).toFixed(1) : p.stars}</span>
        </div>
        <div style="font-size:11px; font-weight:bold; color:${statusColor}; margin-top:2px;">
          ● ${statusText}
        </div>
      </div>
    `;
  };

  // Hàm render nhóm nhân viên theo ca (Chia 2 cột)
  const renderGroup = (title, key, color, icon) => {
    const staff = staffList[key];
    
    // Nếu chưa có ai
    if (!staff || staff.length === 0) {
      return `
        <div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #cbd5e1; border-left:4px solid ${color}; margin-bottom:10px;">
          <b style="color:#1e3a52; display:block; margin-bottom:5px;">${icon} ${title} <span style="font-size:11px; color:#64748b;">(0/${getRoleMax(key)})</span></b>
          <div style="font-size:12px; color:#888; text-align:center; font-style:italic;">Chưa có nhân viên</div>
        </div>
      `;
    }

    const dayShift = staff.filter(p => p.shift === 'day').map(createStaffCard).join('');
    const nightShift = staff.filter(p => p.shift === 'night').map(createStaffCard).join('');

    return `
      <div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #cbd5e1; border-left:4px solid ${color}; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <b style="color:#1e3a52; font-size:14px;">${icon} ${title}</b>
          <span style="background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:bold;">${staff.length}/${getRoleMax(key)}</span>
        </div>
        
        <!-- Chia làm 2 cột: Ca Ngày và Ca Đêm -->
        <div style="display:flex; gap:10px;">
          <!-- Cột Ca Ngày -->
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:bold; color:#f59e0b; margin-bottom:5px; border-bottom:1px dashed #f59e0b; padding-bottom:2px;">☀️ Ca Ngày</div>
            ${dayShift || '<div style="font-size:11px; color:#aaa; font-style:italic;">Trống</div>'}
          </div>
          
          <!-- Cột Ca Đêm -->
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:bold; color:#3b82f6; margin-bottom:5px; border-bottom:1px dashed #3b82f6; padding-bottom:2px;">🌙 Ca Đêm</div>
            ${nightShift || '<div style="font-size:11px; color:#aaa; font-style:italic;">Trống</div>'}
          </div>
        </div>
      </div>
    `;
  };

  // Lắp ghép toàn bộ giao diện
  const ownerName = isHotelOwner ? ((document.getElementById('inputName') && document.getElementById('inputName').value) || 'Minh') + ' (Bạn)' : 'Ông Đạt';
  const ownerAge = isHotelOwner ? MY_AGE : 50;

  // Chưa mua khách sạn: bạn là lễ tân. Đã mua: bạn là chủ, lễ tân là 2 vị trí để thuê
  let html = isHotelOwner ? '' : `
    <div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #cbd5e1; border-left:4px solid #3b82f6; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <b style="color:#1e3a52; font-size:14px;">💁‍♂️ Lễ tân (Tôi)</b>
        <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:bold;">1/2</span>
      </div>
      <div style="display:flex; align-items:center; gap:10px; background:#f8fafc; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
        <b id="staffReceptionistName" style="font-size:13px; color:#1e3a52;">Minh</b>
        <span id="staffReceptionistAge" style="font-size:11px; color:#64748b;">(25 tuổi)</span>
        <span style="font-size:11px; font-weight:bold; color:#22c55e; margin-left:auto;">● Hành chính</span>
      </div>
    </div>
  `;

  if (isHotelOwner) html += renderGroup('Lễ tân', 'leTan', '#3b82f6', '💁');
  html += renderGroup('Bảo vệ', 'baoVe', '#64748b', '🛡️');
  html += renderGroup('Nhân viên vệ sinh', 'veSinh', '#10b981', '🧹');
  html += renderGroup('Nhân viên dọn phòng', 'donPhong', '#8b5cf6', '🛏️');
  html += renderGroup('Nhân viên dẫn khách', 'danKhach', '#f59e0b', '🚶‍♂️');

  // Quản lý & Chủ khách sạn (Dạng thẻ riêng)
  html += `
    <div style="display:flex; gap:10px; margin-top:10px;">
      <div style="flex:1; background:#fff; padding:10px; border-radius:8px; border:1px solid #cbd5e1; border-left:4px solid #ef4444;">
        <b style="color:#1e3a52; font-size:13px;">👔 Quản lý</b>
        <div style="font-size:12px; color:#475569; margin-top:5px;">
          <b>Trưởng phòng Nam</b> (45t)<br>
          <b style="color:#22c55e;">● Đang trong ca</b>
        </div>
      </div>
      <div style="flex:1; background:#fff; padding:10px; border-radius:8px; border:1px solid #cbd5e1; border-left:4px solid #eab308;">
        <b style="color:#1e3a52; font-size:13px;">👑 Chủ khách sạn</b>
        <div style="font-size:12px; color:#475569; margin-top:5px;">
          <b>${staffEsc(ownerName)}</b> (${ownerAge}t)<br>
          <b style="color:#22c55e;">● Đang trong ca</b>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
