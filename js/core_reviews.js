// ==========================================
// LÕI GAME: hệ thống đánh giá của khách
// ==========================================
// --- HỆ THỐNG ĐÁNH GIÁ CỦA KHÁCH ---
// Sao của khách sạn = trung bình các đánh giá khách để lại khi trả phòng.
// Khách còn vui ở sảnh: 5 sao | bình thường: 4 sao | tức giận: 3 sao | bỏ đi: 1 sao
function getGuestMoodStars() {
  if (!(guestPatienceEndTime > 0)) return 5;
  const ratio = (guestPatienceEndTime - Date.now()) / guestMaxPatience;
  if (ratio > 0.5) return 5;   // 😁 đang vui
  if (ratio > 0.2) return 4;   // 🙂 bình thường
  return 3;                    // 😡 tức giận
}
function ratingText() {
  return hotelRating.toFixed(1) + ' ⭐' + (reviewCount > 0 ? ` (${reviewCount} đánh giá)` : '');
}
function refreshRatingUI() {
  const el = document.getElementById('rating');
  if (el) el.innerText = hotelRating.toFixed(1);
  const info = document.getElementById('infoRating');
  if (info) info.innerText = ratingText();
  if (typeof updateReviewSummary === 'function') updateReviewSummary();
}
function reviewGuestInfo(p, size) { return p ? { name: p.name, age: p.age, isMale: p.isMale, size: size || 1 } : null; }
// Khách đại diện của phòng (dùng khi dữ liệu cũ chưa lưu sẵn thông tin khách)
function reviewGuestFromRoom(room) {
  if (room.reviewGuest) return room.reviewGuest;
  if (room.guests && room.guests.length) return reviewGuestInfo(room.guests[0], room.guests.length);
  return null;
}
// Tạo danh tính khách ngẫu nhiên (chỉ dùng khi không còn dữ liệu khách thật)
function randomGuestIdentity() {
  const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ"];
  const dem = ["Văn", "Thị", "Hữu", "Ngọc", "Minh", "Thanh", "Đức", "Xuân", "Quang", "Gia"];
  const nam = ["Anh", "Bình", "Cường", "Dũng", "Hải", "Hùng", "Long", "Nam", "Phong", "Sơn", "Tùng", "Quân"];
  const nu = ["Hoa", "Lan", "Linh", "Mai", "Nga", "Ngọc", "Nhung", "Thảo", "Trang", "Yến", "Hà", "Vy"];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const isMale = Math.random() > 0.5;
  return { name: `${pick(ho)} ${pick(dem)} ${pick(isMale ? nam : nu)}`, age: 20 + Math.floor(Math.random() * 40), isMale, size: 1 };
}
// Các đánh giá cũ ghi "Khách ẩn danh" được gán lại khách thật
function fixAnonymousReviews() {
  guestReviews.forEach(rv => {
    if (rv.name === 'Khách ẩn danh') { const g = randomGuestIdentity(); rv.name = g.name; rv.age = g.age; rv.isMale = g.isMale; }
    if (!rv.groupSize) rv.groupSize = 1;
  });
}
const REVIEW_TEXTS = {
  5: ["Thủ tục nhận phòng nhanh gọn, nhân viên thân thiện. Phòng sạch sẽ, mình rất hài lòng!", "Dịch vụ tuyệt vời, được đón tiếp rất chu đáo. Chắc chắn sẽ quay lại!", "Khách sạn đẹp, phục vụ nhiệt tình. Cho 5 sao không cần suy nghĩ!", "Check-in chỉ vài phút, mọi thứ đều ổn. Rất đáng tiền!"],
  4: ["Phòng ổn, nhân viên lịch sự. Thủ tục hơi lâu một chút nhưng nhìn chung hài lòng.", "Khách sạn sạch sẽ, phục vụ khá tốt. Nếu nhanh hơn chút nữa thì hoàn hảo.", "Trải nghiệm tốt, có vài điểm nhỏ cần cải thiện. Sẽ cân nhắc quay lại."],
  3: ["Phải chờ khá lâu mới được phục vụ, hơi bực mình. Phòng thì tạm được.", "Chờ đợi ở sảnh quá lâu, thái độ phục vụ chưa nhiệt tình. Cần cải thiện.", "Dịch vụ trung bình, thủ tục chậm. Mong khách sạn khắc phục."],
  2: ["Chờ lâu, phục vụ chưa tốt. Hơi thất vọng.", "Trải nghiệm không như kỳ vọng, mong khách sạn cải thiện nhiều hơn."],
  1: ["Chờ quá lâu nên mình bỏ đi luôn. Phục vụ quá chậm!", "Đứng ở sảnh mãi không ai phục vụ xong. Rất thất vọng, không bao giờ quay lại.", "Thái độ phục vụ tệ, mất thời gian vô ích."]
};
function makeReviewText(stars, info) {
  if (info.reason === 'Không còn phòng') return 'Đến nơi mới biết khách sạn đã hết phòng, mất công đi cả quãng đường. Rất tiếc, 1 sao.';
  const pool = REVIEW_TEXTS[stars] || REVIEW_TEXTS[4];
  let text = pool[Math.floor(Math.random() * pool.length)];
  if (info.recName && stars >= 4 && Math.random() < 0.5) text += ` Bạn lễ tân ${info.recName} làm việc rất tốt.`;
  if (info.recName && stars <= 3 && Math.random() < 0.5) text += ` Lễ tân ${info.recName} xử lý hơi chậm.`;
  return text;
}
function addGuestReview(stars, info = {}) {
  reviewSum += stars;
  reviewCount++;
  hotelRating = reviewSum / reviewCount;
  const now = gameTime;
  const g = info.guest || randomGuestIdentity();
  const rv = {
    id: 'r' + Date.now().toString(36) + Math.floor(Math.random() * 10000),
    stars, origStars: stars,
    room: info.room || '', reason: info.reason || '',
    name: g.name, age: g.age, isMale: g.isMale, groupSize: g.size || 1,
    text: makeReviewText(stars, info),
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`,
    recId: info.recId || '', recName: info.recName || '',
    likes: stars >= 4 ? 2 + Math.floor(Math.random() * 11) : Math.floor(Math.random() * 4),
    dislikes: stars <= 3 ? 2 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 3),
    myReaction: '', comments: [], edited: false
  };
  guestReviews.push(rv);
  if (guestReviews.length > 40) guestReviews.shift();
  // Lễ tân phục vụ khách cũng được tính sao
  if (rv.recId) {
    const p = (staffList.leTan || []).find(x => x.id === rv.recId);
    if (p) { p.rvSum = (p.rvSum || 0) + stars; p.rvCount = (p.rvCount || 0) + 1; recalcStaffStars(p); }
  }
  refreshRatingUI();
  const who = info.room ? `Khách phòng ${info.room}` : 'Một khách';
  addInternalMessage('Đánh giá', `${who} đánh giá ${stars}⭐${info.reason ? ' (' + info.reason + ')' : ''}. Điểm trung bình: ${hotelRating.toFixed(1)}⭐`);
}
// Khách sửa lại số sao sau khi đọc phản hồi của chủ khách sạn
function adjustReviewStars(rv, newStars) {
  const delta = newStars - rv.stars;
  if (delta === 0) return;
  rv.stars = newStars;
  reviewSum += delta;
  if (reviewCount > 0) hotelRating = reviewSum / reviewCount;
  if (rv.recId) {
    const p = (staffList.leTan || []).find(x => x.id === rv.recId);
    if (p) { p.rvSum = (p.rvSum || 0) + delta; recalcStaffStars(p); }
  }
  refreshRatingUI();
}
// Giữ lại cho tương thích: sao không còn cộng/trừ trực tiếp nữa
function updateRating() { refreshRatingUI(); }
