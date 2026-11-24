// ==========================================
// LÕI GAME: tạo khách & vẽ khách ở quầy
// ==========================================
// ==========================================
// 2. TẠO KHÁCH & VẼ KHÁCH Ở QUẦY
// ==========================================
function spawnGuest() {
  if (currentGuest || pendingGuestForGuide) return; 
  const allRooms = [
    { type: "Phòng Đơn", floor: 2 }, { type: "Phòng Đôi", floor: 3 }, { type: "Phòng VIP", floor: 4 },
    { type: "Phòng Lãng Mạn", floor: 5 }, { type: "Phòng Tổng Thống", floor: 6 }
  ];

  const groupSize = Math.floor(Math.random() * 4) + 1; 
  let validRooms = [];
  if (groupSize === 1) validRooms = allRooms.filter(r => r.type !== "Phòng Lãng Mạn");
  else if (groupSize === 2) validRooms = allRooms.filter(r => r.type !== "Phòng Đơn");
  else validRooms = allRooms.filter(r => r.type !== "Phòng Đơn" && r.type !== "Phòng Đôi");

  let req = validRooms[Math.floor(Math.random() * validRooms.length)];
  
  const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
  const middleNames = ["Văn", "Thị", "Hữu", "Ngọc", "Minh", "Thanh", "Đức", "Xuân", "Thu", "Hồng", "Quang", "Tuấn", "Khánh", "Bảo", "Gia", "Hoàng"];
  const maleNames = ["Anh", "Bình", "Cường", "Dũng", "Hải", "Hùng", "Khánh", "Long", "Nam", "Phong", "Sơn", "Tùng", "Trung", "Hiếu", "Kiên", "Lâm", "Mạnh", "Nghĩa", "Phát", "Quân", "Tài", "Thắng", "Thiện", "Toàn", "Vinh", "Vũ", "Huy", "Hoàng", "Khang", "Bảo"];
  const femaleNames = ["Anh", "Hoa", "Lan", "Linh", "Mai", "Nga", "Ngọc", "Nhung", "Oanh", "Thảo", "Trang", "Yến", "Hà", "Hạnh", "Hiền", "Hương", "Ly", "My", "Nhi", "Phượng", "Quyên", "Thư", "Trâm", "Vân", "Vy", "Xuân", "Diệp", "Giang", "Hân"];

  const createPerson = (isMale, forcedAge = null) => {
    const ho = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dem = middleNames[Math.floor(Math.random() * middleNames.length)];
    const ten = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const fullName = `${ho} ${dem} ${ten}`;
    const age = forcedAge !== null ? forcedAge : Math.floor(Math.random() * 42) + 18;
    const idCard = "0" + Math.floor(Math.random() * 90000000000 + 10000000000);
    return { name: fullName, isMale: isMale, age: age, idCard: idCard };
  };

  let guestsList = [];
  if (groupSize === 1) {
    guestsList.push(createPerson(Math.random() > 0.5));
  } else {
    guestsList.push(createPerson(Math.random() > 0.5)); 
    for (let i = 1; i < groupSize; i++) {
      if (Math.random() > 0.5) {
        const childAge = Math.floor(Math.random() * 12) + 6; 
        guestsList.push(createPerson(Math.random() > 0.5, childAge));
      } else {
        guestsList.push(createPerson(Math.random() > 0.5));
      }
    }
  }

  const displayName = guestsList.map(g => g.name).join(" & ");
  currentGuest = { guests: guestsList, reqType: req.type, reqFloor: req.floor, rentType: 'hour', displayName: displayName };
  dailyGuestCount += guestsList.length; 
  guestPatienceEndTime = Date.now() + guestMaxPatience;
  
  draw(); 
  
  // Có lễ tân đang trong ca -> lễ tân tự động làm thủ tục cho khách
  if (typeof tryStartAutoReception === 'function' && tryStartAutoReception()) return;
  
  setTimeout(() => { 
    if (currentGuest) {
      if (currentFloor === 1) {
        startConversation(); 
      } else {
        toast.textContent = "Có khách đang đợi ở quầy! Vui lòng về Sảnh chính.";
        toast.style.display = 'block';
        clearTimeout(toastTimer); 
      }
    } 
  }, 500);
}

function drawGuest() {
  if (!currentGuest || currentFloor !== 1) return;
  const g = currentGuest;
  const baseX = 200; 
  const gy = 420;    
  const numGuests = g.guests.length;
  
  if (numGuests === 1) {
    drawGuestAtReception(baseX + 50, gy, g.guests[0]);
  } else if (numGuests === 2) {
    drawGuestAtReception(baseX - 20, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 110, gy, g.guests[1]); 
  } else if (numGuests === 3) {
    drawGuestAtReception(baseX - 60, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 60, gy, g.guests[1]); 
    drawGuestAtReception(baseX + 180, gy, g.guests[2]); 
  } else if (numGuests === 4) {
    drawGuestAtReception(baseX - 80, gy, g.guests[0]); 
    drawGuestAtReception(baseX + 20, gy, g.guests[1]); 
    drawGuestAtReception(baseX + 120, gy, g.guests[2]); 
    drawGuestAtReception(baseX + 220, gy, g.guests[3]); 
  }
}
