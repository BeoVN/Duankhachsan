// ==========================================
// LÕI GAME: cấu hình nhân viên, ca làm, lương
// ==========================================
// --- CẤU HÌNH & HÀM DÙNG CHUNG CHO NHÂN VIÊN ---
const MAX_STAFF_PER_ROLE = 4; // Số nhân viên tối đa mỗi vị trí
const STAFF_ROLES = {
  leTan:    { name: 'Lễ tân',              icon: '💁', color: '#3b82f6', baseSalary: 220000, max: 2 },
  baoVe:    { name: 'Bảo vệ',              icon: '🛡️', color: '#64748b', baseSalary: 200000 },
  veSinh:   { name: 'Nhân viên vệ sinh',   icon: '🧹', color: '#10b981', baseSalary: 150000 },
  donPhong: { name: 'Nhân viên dọn phòng', icon: '🛏️', color: '#8b5cf6', baseSalary: 170000 },
  danKhach: { name: 'Nhân viên dẫn khách', icon: '🚶‍♂️', color: '#f59e0b', baseSalary: 160000 }
};
function getRoleMax(key) { return (STAFF_ROLES[key] && STAFF_ROLES[key].max) || MAX_STAFF_PER_ROLE; }
let _staffIdSeq = 0;
function newStaffId() { return 's' + Date.now().toString(36) + (++_staffIdSeq); }
// Sao của nhân viên = trung bình giữa sao ban đầu (tính như 3 lượt) và các đánh giá khách dành cho họ
function staffAvgRating(p) { return ((p.baseStars || p.stars || 3) * 3 + (p.rvSum || 0)) / (3 + (p.rvCount || 0)); }
function recalcStaffStars(p) { p.stars = Math.min(5, Math.max(1, Math.round(staffAvgRating(p)))); }
// Bổ sung chỉ số (sao, tốc độ %, lương/ngày) cho nhân viên cũ chưa có
function ensureStaffStats() {
  Object.keys(STAFF_ROLES).forEach(key => {
    if (!staffList[key]) staffList[key] = [];
    staffList[key].forEach(p => {
      if (typeof p.stars !== 'number') p.stars = 3;
      if (!p.id) p.id = newStaffId();
      if (typeof p.baseStars !== 'number') p.baseStars = p.stars;
      if (typeof p.rvSum !== 'number') p.rvSum = 0;
      if (typeof p.rvCount !== 'number') p.rvCount = 0;
      if (typeof p.speed !== 'number') p.speed = 100;
      if (typeof p.salary !== 'number') p.salary = STAFF_ROLES[key].baseSalary;
      if (typeof p.owed !== 'number') p.owed = 0;
    });
  });
}
ensureStaffStats();
// Trạng thái làm việc theo ca: Ca Ngày 6h-18h, Ca Đêm 18h-6h (nhân viên nghỉ phép giữ nguyên)
function syncStaffStatus() {
  const h = gameTime.getHours();
  const isDayNow = h >= 6 && h < 18;
  Object.keys(staffList).forEach(key => {
    staffList[key].forEach(p => {
      if (p.status === 'leave') return;
      p.status = ((p.shift === 'day') === isDayNow) ? 'working' : 'off_shift';
    });
  });
}
function getWorkingStaff(key) { return (staffList[key] || []).filter(p => p.status === 'working'); }
// Tốc độ làm việc -> hệ số nhân (100% = 1.0)
function staffSpeedMult(p) { return Math.max(0.3, ((p && p.speed) || 100) / 100); }
// Lương nhân viên: tích lũy mỗi ngày, trả một lần sau mỗi 14 ngày (chỉ khi bạn đã sở hữu khách sạn)
function payStaffSalaries() {
  if (!isHotelOwner) return;
  Object.keys(staffList).forEach(k => staffList[k].forEach(p => { p.owed = (p.owed || 0) + (p.salary || 0); }));
  staffPayrollDay++;
  if (staffPayrollDay >= PAYROLL_INTERVAL_DAYS) runPayroll();
  updateReceiptSummary();
}
function runPayroll() {
  staffPayrollDay = 0;
  const total = getStaffOwedTotal();
  if (total <= 0) return;
  const pay = Math.min(playerMoney, total);
  playerMoney -= pay;
  const ratio = pay / total;
  Object.keys(staffList).forEach(k => staffList[k].forEach(p => { p.owed = Math.round((p.owed || 0) * (1 - ratio)); }));
  updateMoneyUI();
  addExpense(`Lương nhân viên (${PAYROLL_INTERVAL_DAYS} ngày)`, pay);
  if (typeof showUiToast === 'function') {
    showUiToast(pay >= total ? '💸 Đã trả lương nhân viên: -' + pay.toLocaleString('vi-VN') + 'đ'
                              : '⚠️ Không đủ tiền trả lương! Đã trả ' + pay.toLocaleString('vi-VN') + 'đ, còn nợ ' + (total - pay).toLocaleString('vi-VN') + 'đ');
  }
}
// Trả nốt lương còn nợ khi cho nhân viên nghỉ việc
function settleStaffSalary(p) {
  const owed = p.owed || 0;
  if (owed <= 0) return 0;
  const pay = Math.min(playerMoney, owed);
  playerMoney -= pay; p.owed = owed - pay;
  updateMoneyUI();
  addExpense(`Thanh toán lương cho ${p.name}`, pay);
  return pay;
}
