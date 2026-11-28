// Định dạng tiền: ngàn, triệu, tỷ, ngàn tỷ, triệu tỷ, tỷ tỷ + VNĐ
function fmtVND(v) {
  v = Math.round(Number(v) || 0); const neg = v < 0; if (neg) v = -v;
  const U = [[1e18, 'tỷ tỷ'], [1e15, 'triệu tỷ'], [1e12, 'ngàn tỷ'], [1e9, 'tỷ'], [1e6, 'triệu'], [1e3, 'ngàn']];
  let out = v.toLocaleString('vi-VN') + ' VNĐ';
  for (const [n, name] of U) if (v >= n) { out = (v / n).toLocaleString('vi-VN', { maximumFractionDigits: 3 }) + ' ' + name + ' VNĐ'; break; }
  return (neg ? '-' : '') + out;
}
// ==========================================
// LÕI GAME: biến toàn cục & danh sách nhân viên
// ==========================================
// ==========================================
// 1. KHAI BÁO BIẾN TOÀN CỤC
// ==========================================
const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d');
const scene = document.getElementById('scene');
const toast = document.getElementById('toast');
const computerBtn = document.getElementById('computerBtn');
const keysBtn = document.getElementById('keysBtn');
const navBtns = document.querySelectorAll('.nav-btn');

let currentFloor = 1;
let selectedRoom = 1;
let toastTimer;
let chatStep = 0;
let guestStayHours = 0;
let currentBillData = null;
let cashGivenAmount = 0;
let hotelMoney = 0;
let playerMoney = 0; 
let totalRevenue = 0;
let occupiedRooms = 0;
let hotelName = "Sunrise Hotel";
let customPrices = {
  "Phòng Đơn": { hour: 100000, night: 700000, day: 500000 },
  "Phòng Đôi": { hour: 200000, night: 1100000, day: 700000 },
  "Phòng VIP": { hour: 250000, night: 1300000, day: 900000 },
  "Phòng Lãng Mạn": { hour: 300000, night: 1500000, day: 950000 },
  "Phòng Tổng Thống": { hour: 500000, night: 2000000, day: 1500000 }
};
let activeVouchers = []; // Lưu mã giảm giá

const ROOM_PRICES = {
  "Phòng Đơn": { hour: 100000, night: 700000, day: 500000 },
  "Phòng Đôi": { hour: 200000, night: 1100000, day: 700000 },
  "Phòng VIP": { hour: 250000, night: 1300000, day: 900000 },
  "Phòng Lãng Mạn": { hour: 300000, night: 1500000, day: 950000 },
  "Phòng Tổng Thống": { hour: 500000, night: 2000000, day: 1500000 }
};
let isHotelOwner = false;
let dailyGuestCount = 0; 
let selectedRentType = 'hour'; 
const COMMISSION_RATE = 0.4; 
let currentGuest = null; 
let internalMessages = []; // Mảng lưu tin nhắn nội bộ 
// Danh sách nhân viên (Để quản lý trạng thái làm việc)
let staffList = {
  leTan: [],
  baoVe: [
    { name: "Hùng", age: 35, shift: 'day', status: 'working' },
    { name: "Tuấn", age: 28, shift: 'night', status: 'off_shift' }
  ],
  veSinh: [
    { name: "Lan", age: 28, shift: 'day', status: 'working' },
    { name: "Mai", age: 32, shift: 'night', status: 'leave' },
    { name: "Hoa", age: 40, shift: 'day', status: 'working' },
    { name: "Thảo", age: 24, shift: 'night', status: 'off_shift' }
  ],
  donPhong: [
    { name: "Hoa", age: 40, shift: 'day', status: 'working' },
    { name: "Thảo", age: 24, shift: 'night', status: 'working' },
    { name: "Hạnh", age: 30, shift: 'day', status: 'off_shift' },
    { name: "Trang", age: 26, shift: 'night', status: 'off_shift' }
  ],
  danKhach: [
    { name: "Nam", age: 22, shift: 'day', status: 'working' },
    { name: "Huy", age: 25, shift: 'night', status: 'off_shift' }
  ]
};
