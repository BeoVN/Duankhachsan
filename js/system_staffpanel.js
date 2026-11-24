// ==========================================
// HỆ THỐNG: bảng thông tin nhân viên & giao diện chủ khách sạn
// ==========================================
document.querySelectorAll('#expand-inside button')[1].onclick = () => { 
  const currentName = document.getElementById('inputName') ? document.getElementById('inputName').value : "Minh"; 
  const currentAge = document.getElementById('inputAge') ? document.getElementById('inputAge').value : "25"; 
  const recNameEl = document.getElementById('staffReceptionistName'); if (recNameEl) recNameEl.innerText = currentName; 
  const recAgeEl = document.getElementById('staffReceptionistAge'); if (recAgeEl) recAgeEl.innerText = currentAge; 
  
  renderStaffUI(); // <--- THÊM DÒNG NÀY ĐỂ VẼ LẠI GIAO DIỆN NHÂN VIÊN
  staffManageState.mode = 'list'; staffManageState.changeOpen = null; refreshStaffManageTab();
  
  document.getElementById('staffPanel').classList.add('show'); 
};
document.getElementById('closeStaffBtn').onclick = () => { document.getElementById('staffPanel').classList.remove('show'); };
document.querySelectorAll('.staff-tab').forEach(tab => { tab.onclick = () => { document.querySelectorAll('.staff-tab').forEach(t => { t.classList.remove('active'); t.classList.add('secondary'); }); tab.classList.add('active'); tab.classList.remove('secondary'); document.querySelectorAll('.staff-content').forEach(c => c.style.display = 'none'); const targetId = 'staff-info-' + tab.dataset.staff; document.getElementById(targetId).style.display = 'block'; if (tab.dataset.staff === 'manage') refreshStaffManageTab(); else renderStaffUI(); }; });

function updateOwnerUI() {
  const hotelManageTab = document.querySelector('.hotel-info-tab[data-info="manage"]'); if (hotelManageTab) { if (isHotelOwner) { hotelManageTab.innerHTML = "Quản lý (Đã mở)"; hotelManageTab.style.background = '#22c55e'; hotelManageTab.style.boxShadow = '0 4px 0 #166534'; } else { hotelManageTab.innerHTML = "Quản lý"; hotelManageTab.style.background = ''; hotelManageTab.style.boxShadow = ''; } }
  const staffManageTab = document.querySelector('.staff-tab[data-staff="manage"]'); if (staffManageTab) { if (isHotelOwner) { staffManageTab.innerHTML = "Quản lý (Đã mở)"; staffManageTab.style.background = '#22c55e'; staffManageTab.style.boxShadow = '0 4px 0 #166534'; } else { staffManageTab.innerHTML = "Quản lý"; staffManageTab.style.background = ''; staffManageTab.style.boxShadow = ''; } }
  if (typeof refreshStaffManageTab === 'function') refreshStaffManageTab();
  if (typeof updateReceiptSummary === 'function') updateReceiptSummary();
  const buyBtn = document.getElementById('buyHotelBtn'); if (buyBtn && isHotelOwner) { buyBtn.innerHTML = '<b>👑 Bạn đã sở hữu khách sạn</b><br><span style="font-size:12px; font-weight:normal; opacity:0.9;">Quản lý mọi hoạt động của Sunrise Hotel.</span>'; buyBtn.style.background = 'linear-gradient(135deg, #fbbf24, #d97706)'; buyBtn.style.boxShadow = '0 4px 0 #92400e'; buyBtn.style.color = '#fff'; buyBtn.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)'; buyBtn.style.cursor = 'default'; buyBtn.style.pointerEvents = 'none'; }
}
