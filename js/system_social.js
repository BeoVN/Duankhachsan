// ==========================================
// HỆ THỐNG: mạng xã hội (fanpage) - tim/bình luận/chia sẻ tăng dần theo thời gian trong game
// ==========================================
function socialRand(seed) { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
const SOCIAL_OPEN = {};
const SOCIAL_NAMES = ['Minh Anh', 'Quốc Bảo', 'Thu Hà', 'Đức Huy', 'Ngọc Lan', 'Văn Tài', 'Bích Ngọc', 'Gia Hân', 'Hoàng Nam', 'Thanh Tùng', 'Mỹ Linh', 'Anh Khoa', 'Tuấn Kiệt', 'Phương Thảo'];
const SOCIAL_CM = {
  gen: ['Khách sạn đẹp quá, hôm nào mình ghé thử!', 'Đã ở rồi, phục vụ rất tốt 👍', 'Giá hợp lý ghê, lưu lại để đặt phòng.', 'Cho mình hỏi cuối tuần còn phòng không ạ?', 'Nhân viên dễ thương, phòng sạch sẽ ❤️', 'Mong khách sạn có thêm nhiều ưu đãi nữa!', 'Chia sẻ cho bạn bè biết luôn nè.', 'Lần trước ở đây thấy ổn lắm.'],
  '🎟️ Khuyến mãi': ['Có mã giảm giá rồi, mai đặt liền!', 'Mã này dùng cho phòng nào vậy ạ?', 'Giảm vậy là hời quá 😍', 'Nhớ dùng mã khi đến lễ tân nhé mọi người.'],
  '🎉 Sự kiện': ['Tối nay mình sẽ ghé tham gia!', 'Sự kiện nghe vui quá, có mang bạn bè được không?', 'Đi cùng gia đình được không ạ?', 'Chờ mãi mới có sự kiện 🎶'],
  '📢 Thông báo': ['Cảm ơn khách sạn đã thông báo!', 'Khách sạn càng ngày càng chuyên nghiệp 👏', 'Ủng hộ khách sạn nhé!']
};
function socialPosts() {
  const H = staffEsc(hotelName);
  const T = [
    ['📣 Quảng cáo', `🏨 ${H} - phòng sạch sẽ, nhân viên thân thiện, giá hợp lý. Đặt phòng ngay hôm nay!`],
    ['📣 Quảng cáo', `🛏️ Nghỉ ngơi trọn vẹn tại ${H}. Phòng rộng rãi, yên tĩnh, đầy đủ tiện nghi.`],
    ['🎉 Sự kiện', `🎶 Tối nay ${H} có đêm nhạc acoustic miễn phí tại sảnh. Mời quý khách ghé chơi!`],
    ['🎉 Sự kiện', `🍳 Buổi sáng cuối tuần: buffet sáng ưu đãi cho khách lưu trú tại ${H}.`],
    ['📢 Thông báo', `🧹 ${H} vừa hoàn tất vệ sinh toàn bộ phòng để phục vụ quý khách tốt hơn.`],
    ['📢 Thông báo', `⭐ Cảm ơn quý khách đã tin tưởng ${H}! Hiện khách sạn đạt ${hotelRating.toFixed(1)}⭐ từ ${reviewCount} đánh giá.`],
    ['🎉 Sự kiện', `🎁 Tuần lễ tri ân khách hàng thân thiết tại ${H}, nhiều quà tặng hấp dẫn.`]
  ];
  const posts = [], now = gameTime.getTime();
  const base = new Date(gameTime); base.setHours(0, 0, 0, 0);
  activeVouchers.forEach((v) => {
    if (getVoucherStatus(v).text !== 'Đang chạy') return;
    const p = v.start.split('-'); const t = new Date(+p[0], +p[1] - 1, +p[2], 0, 30).getTime();
    posts.push({ key: 'v' + v.code, tag: '🎟️ Khuyến mãi', text: `Nhập mã <b>${staffEsc(v.code)}</b> giảm ngay <b>${v.discount}%</b> giá phòng! Áp dụng đến ${formatVoucherDate(v.end)}.`, t, seed: t / 3600000 });
  });
  for (let k = 0; k < 6; k++) for (let j = 0; j < 2; j++) {
    const dayMs = base.getTime() - k * 86400000, seed = Math.floor(dayMs / 86400000) * 2 + j;
    const hour = j === 0 ? 8 + Math.floor(socialRand(seed + 3) * 6) : 14 + Math.floor(socialRand(seed + 4) * 8);
    const t = dayMs + hour * 3600000, i = Math.floor(socialRand(seed) * T.length);
    posts.push({ key: 'p' + seed, tag: T[i][0], text: T[i][1], t, seed });
  }
  return posts.filter(p => p.t <= now).sort((a, b) => b.t - a.t);
}
function socialToggle(key) { SOCIAL_OPEN[key] = !SOCIAL_OPEN[key]; renderSocial(); }
function renderSocial() {
  const box = document.getElementById('social-box'); if (!box) return;
  const top = box.scrollTop, H = staffEsc(hotelName), now = gameTime.getTime();
  const fol = 500 + Math.floor(totalRevenue / 20000) + reviewCount * 12;
  let html = `<div style="display:flex; gap:10px; align-items:center; padding:8px 4px 12px; border-bottom:1px solid #e2e8f0;">
    <div style="width:52px; height:52px; border-radius:50%; background:#1e3a52; display:flex; align-items:center; justify-content:center; font-size:28px;">🏨</div>
    <div><div style="font-weight:900; font-size:16px; color:#1e3a52;">${H} <span style="display:inline-block; background:#1877f2; color:#fff; border-radius:50%; width:16px; height:16px; line-height:16px; text-align:center; font-size:11px;">✓</span></div>
    <div style="font-size:12px; color:#64748b;">Khách sạn · ${fol.toLocaleString('vi-VN')} người theo dõi</div></div></div>`;
  html += socialPosts().map(p => {
    const ageH = (now - p.t) / 3600000, gr = 1 - Math.exp(-ageH / 10);
    const likes = Math.floor((20 + socialRand(p.seed) * 200 + fol / 40) * gr);
    const cmTotal = 3 + Math.floor(socialRand(p.seed + 5) * 22), cm = Math.floor(cmTotal * gr);
    const shares = Math.floor(cmTotal / 3 * gr);
    const pool = (SOCIAL_CM[p.tag] || []).concat(SOCIAL_CM.gen);
    let cms = '';
    if (SOCIAL_OPEN[p.key]) {
      for (let c = cm - 1; c >= 0; c--) {
        const nm = SOCIAL_NAMES[Math.floor(socialRand(p.seed + c * 7) * SOCIAL_NAMES.length)], tx = pool[Math.floor(socialRand(p.seed + c * 13 + 1) * pool.length)];
        cms += `<div style="background:#f1f5f9; border-radius:8px; padding:5px 8px; margin-top:5px; font-size:12px;"><b>${nm}</b> ${tx}</div>`;
      }
      if (!cm) cms = '<div style="font-size:12px; color:#94a3b8; margin-top:5px;">Chưa có bình luận.</div>';
    }
    const ago = ageH < 1 ? 'Vừa xong' : ageH < 24 ? Math.floor(ageH) + ' giờ trước' : Math.floor(ageH / 24) + ' ngày trước';
    return `<div style="border:1px solid #e2e8f0; border-radius:10px; padding:10px; margin-top:10px;">
      <div style="font-size:11px; color:#64748b;"><b style="color:#1e3a52;">${H}</b> ✓ · ${ago} · ${p.tag}</div>
      <div style="margin:6px 0; line-height:1.45;">${p.text}</div>
      <div style="font-size:12px; color:#64748b;">👍 ${likes} &nbsp; <span onclick="socialToggle('${p.key}')" style="cursor:pointer; color:#1877f2; font-weight:bold;">💬 ${cm}</span> &nbsp; ↗️ ${shares}</div>${cms}</div>`;
  }).join('');
  box.innerHTML = html; box.scrollTop = top;
}
// Cập nhật theo thời gian thực khi đang mở tab Mạng xã hội
setInterval(() => {
  const t = document.getElementById('tab-social');
  if (isGameStarted && !isGamePaused && t && t.classList.contains('active')) renderSocial();
}, 2000);
