// ==========================================
// LÕI GAME: trạng thái game, xưng hô, phòng, tiền
// ==========================================
let staffShiftState = {}; // Theo dõi trạng thái ca làm việc của nhân viên
let guestProfiles = []; // Lưu Hồ sơ khách
let receiptHistory = []; // Lưu Sao kê
let diaryHistory = { in: [], out: [] }; // Lưu Nhật ký
let messagesHistory = []; // Lưu Tin nhắn
let pendingGuestForGuide = null;
let registeredGuests = []; 
let MY_AGE = 25;
let isGameStarted = false;
let isGamePaused = false;
let pauseStartTime = 0;
let playerLevel = 1;
let playerExp = 0;
let maxExp = 100; 
let hotelRating = 3.0; // = điểm trung bình các đánh giá của khách
let reviewSum = 0;      // Tổng số sao đã nhận
let reviewCount = 0;    // Số lượt đánh giá
let guestReviews = []; // Các đánh giá chi tiết của khách (hiển thị ở bảng Đánh giá khách hàng)
let totalExpenses = 0;  // Tổng các khoản chi (sao kê)
let staffPayrollDay = 0; // Số ngày đã qua kể từ kỳ trả lương gần nhất
const PAYROLL_INTERVAL_DAYS = 14; // Trả lương nhân viên mỗi 14 ngày
let dailyBackups = [];
let lastBackupDay = 1; 
let guestPatienceEndTime = 0;
let guestMaxPatience = 90000; 
let cleaningRoomNumber = null;
let cleaningEndTime = 0;
let cleaningProgressTimer = 0; // <--- THÊM BIẾN NÀY
let cleaningMaxTime = 60000; 
let gameTime = new Date(2024, 0, 1, 0, 0, 0); 
let currentMonth = gameTime.getMonth();
let currentYear = gameTime.getFullYear();

function getPronoun(person) {
  const age = person.age || 20;
  if (person.isMale) {
    if (age < MY_AGE) return "em";
    if (age < MY_AGE + 18) return "anh";
    if (age < MY_AGE + 36) return "chú";
    return "ông";
  } else {
    if (age < MY_AGE) return "em";
    if (age < MY_AGE + 18) return "chị";
    if (age < MY_AGE + 36) return "cô";
    return "bà";
  }
}

function getMyPronoun(guestPronoun) {
  if (guestPronoun === "em") {
    const myGender = document.getElementById('inputGender') ? document.getElementById('inputGender').value : "Nam";
    return myGender === "Nữ" ? "chị" : "anh";
  }
  else if (guestPronoun === "anh" || guestPronoun === "chị") return "em";
  else if (guestPronoun === "chú" || guestPronoun === "cô") return "con";
  else if (guestPronoun === "ông" || guestPronoun === "bà") return "cháu";
  return "tôi"; 
}

const roomState = Array.from({length:30},(_,i)=> {
  let floor = Math.floor(i / 6) + 2; 
  let roomNum = floor * 100 + (i % 6) + 1;
  return { number: roomNum, status: 'Trống', checkOutTime: 0, guestPos: 'center' };
});

function box(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(x,y,w,h); }
function label(t,x,y,size=18,color='#26384a',align='left'){ ctx.fillStyle=color; ctx.font=`bold ${size}px system-ui`; ctx.textAlign=align; ctx.fillText(t,x,y); }
function showToast(t){ toast.textContent = t; toast.style.display = 'block'; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.style.display = 'none', 2500); }
// Hàm hiển thị Toast cho Cài đặt/Mở rộng (Nằm phía trên nút bấm)

function updateMoneyUI() {
  document.getElementById('money').innerText = fmtVND(playerMoney);
  document.getElementById('dash-occupied').innerText = occupiedRooms + ' / 30';
  
}
updateMoneyUI();
