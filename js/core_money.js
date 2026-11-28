// ==========================================
// LÕI GAME: tiền & sao kê
// ==========================================
// --- TIỀN & SAO KÊ ---
function getCommissionRate() { return isHotelOwner ? 1 : COMMISSION_RATE; } // Chủ khách sạn nhận 100%
function addExpense(label, amount) {
  if (amount <= 0) return;
  totalExpenses += amount;
  const now = gameTime;
  receiptHistory.push({ type: 'expense', label, amount, time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}` });
  if (receiptHistory.length > 300) receiptHistory.splice(0, receiptHistory.length - 300);
  updateReceiptSummary();
  if (typeof renderReceipt === 'function') renderReceipt();
}
function getStaffOwedTotal() {
  let t = 0;
  Object.keys(staffList).forEach(k => staffList[k].forEach(p => { t += (p.owed || 0); }));
  return t;
}
function updateReceiptSummary() {
  const A = document.getElementById('bill-total'), B = document.getElementById('bill-comm');
  const LA = document.getElementById('billLabelA'), LB = document.getElementById('billLabelB');
  const ex = document.getElementById('bill-extra');
  if (!A || !B) return;
  const fmt = (n) => fmtVND(Math.round(n));
  if (isHotelOwner) {
    if (LA) LA.innerText = 'Tiền khách sạn:';
    if (LB) LB.innerText = 'Các khoản chi:';
    A.innerText = fmt(playerMoney);
    B.innerText = fmt(totalExpenses);
    if (B.style) B.style.color = '#ef4444';
    if (ex) {
      ex.style.display = 'flex';
      ex.innerHTML = `<span>Doanh thu: <span style="color:#2c6e9e;">${fmt(totalRevenue)}</span></span><span>Lương chờ trả: <span style="color:#d97706;">${fmt(getStaffOwedTotal())}</span> <span style="font-weight:normal; color:#64748b;">(còn ${Math.max(0, PAYROLL_INTERVAL_DAYS - staffPayrollDay)} ngày)</span></span>`;
    }
  } else {
    if (LA) LA.innerText = 'Khách sạn thu:';
    if (LB) LB.innerText = 'Bạn nhận (40%):';
    A.innerText = fmt(totalRevenue);
    B.innerText = fmt(playerMoney);
    if (B.style) B.style.color = '#e67e22';
    if (ex) ex.style.display = 'none';
  }
}
