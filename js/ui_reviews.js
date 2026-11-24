// ==========================================
// GIAO DIỆN: bảng đánh giá khách hàng
// ==========================================
// ==========================================================
// BẢNG ĐÁNH GIÁ KHÁCH HÀNG (bấm vào số sao trên màn hình)
// ==========================================================
function openReviewPanel() {
  document.getElementById('reviewPanel').classList.add('show');
  renderReviewPanel();
}
function closeReviewPanel() { document.getElementById('reviewPanel').classList.remove('show'); }
(function bindReviewPanel() {
  const box = document.getElementById('ratingBox'); if (box) box.onclick = openReviewPanel;
  const btn = document.getElementById('closeReviewPanel'); if (btn) btn.onclick = closeReviewPanel;
})();

function updateReviewSummary() {
  const el = document.getElementById('reviewSummary'); if (!el) return;
  el.innerHTML = `<span style="font-size:26px; font-weight:900; color:#e67e22;">${hotelRating.toFixed(1)}</span> ⭐ &nbsp;·&nbsp; ${reviewCount} lượt đánh giá`;
}

function reviewAvatarSrc(rv) {
  try { return getGuestImage({ age: rv.age, isMale: rv.isMale }).src; } catch (e) { return ''; }
}

function reviewCardHTML(rv) {
  const bubble = (c) => c.from === 'player'
    ? `<div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:5px 8px; margin:4px 0 4px 24px; font-size:12px;"><b style="color:#c2410c;">Khách sạn:</b> ${staffEsc(c.text)}</div>`
    : `<div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:5px 8px; margin:4px 24px 4px 0; font-size:12px;"><b style="color:#1d4ed8;">${staffEsc(rv.name)}:</b> ${staffEsc(c.text)}</div>`;
  let recLine = '';
  if (rv.recName) {
    const p = (staffList.leTan || []).find(x => x.id === rv.recId);
    recLine = `<div style="font-size:11px; color:#64748b; margin-top:4px;">💁 Lễ tân phục vụ: <b>${staffEsc(rv.recName)}</b>${p ? ` (⭐ ${staffAvgRating(p).toFixed(1)})` : ''}</div>`;
  }
  const editedLine = rv.edited && rv.stars !== rv.origStars
    ? `<div style="font-size:11px; color:${rv.stars > rv.origStars ? '#16a34a' : '#ef4444'}; margin-top:4px;">✏️ Khách đã sửa đánh giá: ${rv.origStars}★ → ${rv.stars}★</div>` : '';
  const reactBtn = (type, icon, n) => `<button onclick="reviewReact('${rv.id}','${type}')" style="border:1px solid ${rv.myReaction === type ? '#3b82f6' : '#cbd5e1'}; background:${rv.myReaction === type ? '#dbeafe' : '#fff'}; border-radius:14px; padding:4px 10px; font-size:12px; cursor:pointer;">${icon} ${n}</button>`;
  return `<div id="rv-${rv.id}" style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px; margin-bottom:10px;">
    <div style="display:flex; gap:10px; align-items:center;">
      <img src="${reviewAvatarSrc(rv)}" alt="" style="width:46px; height:46px; border-radius:50%; object-fit:cover; object-position:top center; background:#e2e8f0; border:2px solid #cbd5e1; flex-shrink:0;">
      <div style="flex:1; min-width:0;">
        <b style="color:#1e3a52; font-size:14px;">${staffEsc(rv.name)}</b> <span style="font-size:11px; color:#64748b;">(${rv.age} tuổi)</span>
        <div style="font-size:11px; color:#64748b;">${rv.groupSize > 1 ? `👥 Đại diện nhóm ${rv.groupSize} người` : '👤 Khách lẻ'}</div>
        <div style="font-size:12px;">${staffStars(rv.stars)} <span style="color:#94a3b8;">· ${rv.room ? 'Phòng ' + rv.room : 'Không ở lại'} · ${rv.time}</span></div>
      </div>
    </div>
    <div style="margin-top:8px; font-size:13px; color:#253548; line-height:1.45;">${staffEsc(rv.text)}</div>
    ${recLine}${editedLine}
    <div style="display:flex; gap:8px; margin-top:8px;">${reactBtn('like', '👍', rv.likes)}${reactBtn('dislike', '👎', rv.dislikes)}<span style="margin-left:auto; font-size:12px; color:#64748b; align-self:center;">💬 ${rv.comments.length}</span></div>
    ${rv.comments.length ? `<div style="margin-top:6px;">${rv.comments.map(bubble).join('')}</div>` : ''}
    ${rv.pending ? `<div style="margin:4px 24px 4px 0; font-size:12px; color:#1d4ed8; font-style:italic;">⏳ ${staffEsc(rv.name)} đang soạn trả lời (khoảng ${REVIEW_REPLY_DELAY_MIN} phút trong game)...</div>` : ''}
    <div style="display:flex; gap:6px; margin-top:8px;">
      <input id="rvc-${rv.id}" type="text" maxlength="160" placeholder="${rv.pending ? 'Khách đang soạn trả lời...' : 'Viết phản hồi cho khách...'}" ${rv.pending ? 'disabled' : ''} onkeydown="if(event.key==='Enter')reviewSendComment('${rv.id}')" style="flex:1; min-width:0; border:1px solid #cbd5e1; border-radius:8px; padding:8px; font-size:13px;">
      <button onclick="reviewSendComment('${rv.id}')" style="border:none; border-radius:8px; padding:8px 12px; font-size:13px; font-weight:bold; color:#fff; background:#d28a43; cursor:pointer;">Gửi</button>
    </div>
  </div>`;
}

function renderReviewPanel() {
  updateReviewSummary();
  const list = document.getElementById('reviewList'); if (!list) return;
  if (guestReviews.length === 0) {
    list.innerHTML = '<div style="text-align:center; color:#94a3b8; font-style:italic; padding:20px;">Chưa có đánh giá nào. Khách sẽ để lại đánh giá khi trả phòng.</div>';
    return;
  }
  list.innerHTML = guestReviews.slice().reverse().map(reviewCardHTML).join('');
}

// Chỉ vẽ lại 1 thẻ, giữ nguyên nội dung đang gõ ở ô phản hồi
function refreshReviewCard(id) {
  const rv = guestReviews.find(r => r.id === id); const el = document.getElementById('rv-' + id);
  if (!rv || !el) return;
  const input = document.getElementById('rvc-' + id); const typed = input ? input.value : '';
  el.outerHTML = reviewCardHTML(rv);
  const input2 = document.getElementById('rvc-' + id); if (input2 && typed) input2.value = typed;
}

function reviewReact(id, type) {
  const rv = guestReviews.find(r => r.id === id); if (!rv) return;
  if (rv.myReaction === type) { rv[type === 'like' ? 'likes' : 'dislikes']--; rv.myReaction = ''; }
  else {
    if (rv.myReaction) rv[rv.myReaction === 'like' ? 'likes' : 'dislikes']--;
    rv[type === 'like' ? 'likes' : 'dislikes']++; rv.myReaction = type;
  }
  refreshReviewCard(id); autoSaveGame();
}
