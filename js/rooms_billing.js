// ==========================================
// PHÒNG & HỘI THOẠI: hóa đơn, thanh toán, sao kê
// ==========================================
function generateBill() {
  if (!currentGuest) return;
  
  const size = currentGuest.guests.length; 
  const leaderName = document.getElementById(`f${size}_p1_name`).value; 
  const roomBooked = document.getElementById('regRoom').value;
  
  // Lấy bảng giá tùy chỉnh
  const prices = customPrices[currentGuest.reqType];
  
  let multiplier = 1; 
  let discount = 0;
  if (size === 2) { multiplier = 2; discount = 0.1; } 
  else if (size === 3) { multiplier = 3; discount = 0.2; } 
  else if (size === 4) { multiplier = 4; discount = 0.3; }
  
  // KHAI BÁO BIẾN basePrice VÀ TÍNH TOÁN
  let basePrice = prices[currentGuest.rentType] * multiplier * (1 - discount); 
  
  const vat = basePrice * 0.1; 
  const total = basePrice + vat;
  
  currentBillData = { 
    name: leaderName, 
    room: roomBooked, 
    inTime: currentGuest.timeIn, 
    outTime: currentGuest.timeOut, 
    basePrice: basePrice, 
    vat: vat, 
    total: total, 
    rentType: currentGuest.rentType 
  };
  
  document.getElementById('billRoom').innerText = roomBooked; 
  document.getElementById('billType').innerText = currentGuest.reqType; 
  document.getElementById('billPeople').innerText = size + " người";
  
  const rentNames = { hour: "Theo giờ", night: "Qua đêm", day: "Dài hạn" }; 
  document.getElementById('billRentType').innerText = rentNames[currentGuest.rentType];
  
  document.getElementById('billIn').innerText = currentGuest.timeIn; 
  document.getElementById('billOut').innerText = currentGuest.timeOut;
  
  let calcText = `(${prices[currentGuest.rentType].toLocaleString('vi-VN')} x ${multiplier}`; 
  if (discount > 0) { calcText += ` - ${discount * 100}%`; } 
  calcText += `)`; 
  document.getElementById('billCalcDetail').innerText = calcText;
  
  document.getElementById('billPrice').innerText = basePrice.toLocaleString('vi-VN') + 'đ'; 
  document.getElementById('billVat').innerText = vat.toLocaleString('vi-VN') + 'đ'; 
  document.getElementById('billTotal').innerText = total.toLocaleString('vi-VN') + 'đ';
  
  document.getElementById('billPanel').classList.add('show');
}

function finishPayment() {
  if (!currentGuest || !currentBillData) return;
  
  const finalPrice = currentBillData.total; 
  const commission = finalPrice * getCommissionRate(); // Chưa mua: 40%. Đã mua khách sạn: 100%
  const hotelKeep = finalPrice - commission;
  
  hotelMoney += hotelKeep; 
  playerMoney += commission; 
  totalRevenue += finalPrice; 
  occupiedRooms++; 
  updateMoneyUI();
  
  const expEarned = Math.floor(finalPrice / 10000); 
  addExp(expEarned); 
  // Ghi nhận tâm trạng khách ở sảnh để khách đánh giá khi trả phòng, rồi dừng đồng hồ kiên nhẫn
  currentGuest.moodStars = getGuestMoodStars();
  guestPatienceEndTime = 0;
  
  // LẤY THỜI GIAN VÀ LƯU VÀO MẢNG RECEIPT_HISTORY
  const now = gameTime; 
  const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  receiptHistory.push({
    room: currentBillData.room.replace('Phòng ', ''),
    time: timeStr,
    price: finalPrice,
    commission: commission,
    owner: isHotelOwner
  });
  
  // CẬP NHẬT LẠI GIAO DIỆN TAB SAO KÊ
  renderReceipt();
  
  updateReceiptSummary();
  
  document.getElementById('computerPanel').classList.remove('show'); 
  document.getElementById('keyPanel').classList.add('show'); 
  renderRoomGrid('rooms');
  
  document.getElementById('takeKey').disabled = false; 
  document.getElementById('takeKey').style.opacity = '1';
  
  showToast("Thanh toán thành công! Hãy chọn phòng trên Kệ chìa khóa.");
}

function renderReceipt() {
  const list = document.getElementById('receipt-list');
  if (!list) return;
  
  list.innerHTML = '';
  if (receiptHistory.length === 0) {
    list.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Chưa có giao dịch</div>';
    return;
  }
  
  // Dùng slice().reverse() để đảo ngược mảng, giúp giao dịch mới nhất nằm trên cùng
  receiptHistory.slice().reverse().forEach(item => {
    if (item.type === 'expense') {
      list.insertAdjacentHTML('beforeend', `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc; font-size:12px;"><div><b>💸 ${item.label}</b><br><span style="color:#888">${item.time}</span></div><div style="text-align:right; color:#ef4444; font-weight:bold;">Chi: -${item.amount.toLocaleString('vi-VN')}đ</div></div>`);
    } else if (item.owner) {
      list.insertAdjacentHTML('beforeend', `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc; font-size:12px;"><div><b>Phòng ${item.room}</b><br><span style="color:#888">${item.time}</span></div><div style="text-align:right; color:#16a34a; font-weight:bold;">Thu: +${item.price.toLocaleString('vi-VN')}đ</div></div>`);
    } else {
      list.insertAdjacentHTML('beforeend', `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ccc; font-size:12px;"><div><b>Phòng ${item.room}</b><br><span style="color:#888">${item.time}</span></div><div style="text-align:right;"><div style="color:#2c6e9e;">KS thu: ${item.price.toLocaleString('vi-VN')}đ</div><div style="color:#e67e22;">Hoa hồng: +${item.commission.toLocaleString('vi-VN')}đ</div></div></div>`);
    }
  });
}
