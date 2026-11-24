// ==========================================
// GIAO DIỆN: phản hồi đánh giá & câu trả lời của khách
// ==========================================
// Phân tích phản hồi: trả về giọng điệu ('pos' | 'neg' | 'neu') và các ý chính (tags)
const COMMENT_KEYWORDS = {
  pos: {
    apology:  ['xin loi', 'rat tiec', 'lay lam tiec', 'thong cam'],
    thanks:   ['cam on', 'tri an', 'cam kich'],
    comp:     ['tang', 'uu dai', 'giam gia', 'mien phi', 'voucher', 'khuyen mai'],
    promise:  ['khac phuc', 'cai thien', 'rut kinh nghiem', 'tiep thu', 'sua doi', 'phuc vu tot hon', 'lang nghe', 'co gang'],
    welcome:  ['hen gap lai', 'chao don', 'lan sau', 'quy khach', 'mong ban', 'mong anh', 'mong chi', 'mong quy khach', 'xin duoc', 'rat vui', 'hai long'],
    comfort:  ['an ui', 'buon', 'yeu thuong', 'hy vong']
  },
  neg: {
    insult:   ['ngu', 'ngoc', 'dien', 'cam mom', 'cut', 'nhao', 'vo duyen'],
    dismiss:  ['ke ban', 'mac ke', 'khong quan tam', 'tu chiu', 'loi cua ban', 'ai bao', 'khong co loi', 'khong sai', 'khong xin loi', 'khong can xin loi', 'khong thong cam', 'lam qua', 'kho tinh', 'nhieu chuyen', 'rang chiu', 'oan', 'phien qua', 'vo ly'],
    leave:    ['di cho khac', 'dung den']
  }
};
function analyzeCommentDetail(text) {
  const POS_EMOJI = ['❤', '🙏', '😊', '🥰', '😢', '🥺', '🤗'], NEG_EMOJI = ['😡', '🤬', '🖕', '😒', '🙄'];
  let score = 0; const tags = new Set();
  POS_EMOJI.forEach(e => { if (text.includes(e)) { score++; tags.add('emoji'); } });
  NEG_EMOJI.forEach(e => { if (text.includes(e)) { score -= 2; tags.add('dismiss'); } });
  let norm = ' ' + text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const all = [];
  Object.keys(COMMENT_KEYWORDS.neg).forEach(tag => COMMENT_KEYWORDS.neg[tag].forEach(k => all.push({ k, tag, w: -2 })));
  Object.keys(COMMENT_KEYWORDS.pos).forEach(tag => COMMENT_KEYWORDS.pos[tag].forEach(k => all.push({ k, tag, w: 1 })));
  // Ưu tiên cụm dài (vd "không xin lỗi" trước "xin lỗi")
  all.sort((a, b) => (b.k.length - a.k.length) || (a.w - b.w));
  all.forEach(({ k, tag, w }) => {
    const key = ' ' + k + ' ';
    while (norm.includes(key)) { score += w; tags.add(tag); norm = norm.replace(key, ' '); }
  });
  return { tone: score > 0 ? 'pos' : score < 0 ? 'neg' : 'neu', tags: Array.from(tags) };
}
function analyzeComment(text) { return analyzeCommentDetail(text).tone; }

const GUEST_CAP = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const GUEST_PICK = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Soạn câu trả lời của khách dựa trên: nội dung đánh giá gốc, ý chính trong phản hồi và kết quả đổi sao
function composeGuestReply(rv, tone, tags, o) {
  const me = rv.groupSize > 1 ? 'nhóm mình' : 'mình';
  const Me = GUEST_CAP(me);
  const happy = rv.origStars >= 4;
  const issue = rv.reason === 'Không còn phòng' ? 'chuyện khách sạn hết phòng'
              : rv.reason ? 'việc phải chờ quá lâu ở sảnh'
              : rv.origStars <= 3 ? 'chuyện phải chờ lâu lúc làm thủ tục'
              : 'mấy điểm nhỏ chưa vừa ý lần trước';
  const Issue = GUEST_CAP(issue);
  const parts = [];

  if (tone === 'pos') {
    const S = {
      comp: happy ? [`Ôi, còn có cả quà tặng nữa à? Khách sạn chu đáo quá, ${me} cảm ơn nhiều!`]
                  : [`Khách sạn còn có lòng gửi ưu đãi nữa, ${me} thật sự bất ngờ và cảm động.`, `Nhận được ưu đãi thế này thì ${me} nguôi giận hẳn về ${issue} rồi.`],
      apology: happy ? [`Có gì đâu bạn, ${me} vốn đã khá hài lòng rồi. Cảm ơn lời nhắn chu đáo này.`]
                     : [`${Issue} đúng là làm ${me} khó chịu, nhưng nhận được lời xin lỗi chân thành thế này ${me} thấy dễ chịu hơn nhiều.`, `Cảm ơn khách sạn đã nhận lỗi, ${me} nguôi giận phần nào về ${issue} rồi.`],
      promise: [`Nghe khách sạn cam kết khắc phục, ${me} yên tâm hơn hẳn.`, `Có cải thiện thật thì lần sau ${me} sẵn lòng quay lại thử.`],
      comfort: [`Cảm ơn bạn đã quan tâm, ${me} thấy được trân trọng hơn rồi.`, `Lời động viên của bạn làm ${me} đỡ buồn hẳn.`],
      welcome: [`Có dịp ${me} sẽ ghé lại ủng hộ khách sạn.`, `Lần sau đi qua đây ${me} chắc chắn sẽ nhớ đến khách sạn.`],
      thanks:  [`${Me} cũng cảm ơn khách sạn đã dành thời gian phản hồi.`, `Cảm ơn bạn đã lắng nghe nhé.`],
      emoji:   [`Cảm ơn bạn, ${me} cảm nhận được sự chân thành đó 😊`]
    };
    const order = ['comp', 'apology', 'promise', 'comfort', 'welcome', 'thanks', 'emoji'];
    const hit = order.filter(t => tags.indexOf(t) !== -1).slice(0, 2);
    if (hit.length === 0) parts.push(happy ? `Cảm ơn bạn, ${me} vẫn thấy khách sạn rất ổn.` : `Cảm ơn lời nhắn của khách sạn, ${me} đã đọc rồi.`);
    else hit.forEach(t => parts.push(GUEST_PICK(S[t])));
    if (rv.recName && happy && Math.random() < 0.5) parts.push(`Cho ${me} gửi lời khen đến bạn lễ tân ${rv.recName} nhé.`);
    if (o.changed) parts.push(`${Me} đã sửa đánh giá từ ${o.oldStars}★ lên ${o.newStars}★ rồi nhé.`);
    else if (rv.stars >= 5) parts.push(`${Me} vẫn giữ nguyên 5★ và sẽ quay lại ủng hộ.`);
    else if (o.alreadyEdited) parts.push(`${Me} đã chỉnh đánh giá trước đó rồi, cảm ơn bạn nhé.`);
  } else if (tone === 'neg') {
    const S = {
      insult:  [`Bạn nói chuyện với khách như vậy sao? Quá thiếu chuyên nghiệp.`, `Không ngờ khách sạn phản hồi bằng lời lẽ như thế, ${me} rất thất vọng.`],
      dismiss: [`Khách góp ý mà bị đối xử thờ ơ như vậy, ${me} thất vọng thật sự.`, `Phản hồi kiểu "không liên quan đến tôi" thì làm sao ${me} yên tâm quay lại được.`, `${Issue} đã đủ tệ rồi, giờ còn bị đáp lại như thế này nữa.`],
      leave:   [`Vâng, vậy ${me} sẽ đi chỗ khác và nhắn bạn bè đừng đến đây.`]
    };
    const order = ['insult', 'leave', 'dismiss'];
    const hit = order.filter(t => tags.indexOf(t) !== -1).slice(0, 2);
    if (hit.length === 0) parts.push(`Cách phản hồi này làm ${me} thất vọng.`);
    else hit.forEach(t => parts.push(GUEST_PICK(S[t])));
    if (o.changed) parts.push(`${Me} hạ đánh giá từ ${o.oldStars}★ xuống ${o.newStars}★.`);
    else if (o.alreadyEdited) parts.push(`${Me} đã chỉnh đánh giá một lần rồi nên giữ nguyên số sao hiện tại.`);
    else if (rv.stars <= 1) parts.push(`${Me} đã cho 1★ rồi, không thể thấp hơn nữa.`);
  } else {
    parts.push(happy ? GUEST_PICK([`Cảm ơn bạn! ${Me} vẫn thấy khách sạn rất ổn.`, `Vâng, ${me} ghi nhận nhé. Chúc khách sạn đông khách!`])
                     : GUEST_PICK([`Cảm ơn bạn đã phản hồi. Hy vọng ${issue} sẽ không lặp lại lần sau.`, `${Me} đã đọc lời nhắn của khách sạn, mong lần sau phục vụ tốt hơn nhé.`, `Vâng, ${me} ghi nhận. Mong khách sạn cải thiện thêm.`]));
  }
  // Chỉ nhắc nguyên văn "chuyện cũ" một lần, các lần sau nói gọn lại cho tự nhiên
  let out = parts.join(' '); let seen = 0;
  const re = new RegExp(issue + '|' + Issue, 'g');
  out = out.replace(re, (m) => (++seen === 1 ? m : (m === Issue ? 'Chuyện đó' : 'chuyện đó')));
  return out;
}

// Khách trả lời sau 5 phút trong game (tính theo đồng hồ game, tạm dừng game thì khách cũng chờ)
const REVIEW_REPLY_DELAY_MIN = 5;
function reviewSendComment(id) {
  const rv = guestReviews.find(r => r.id === id); if (!rv) return;
  if (rv.pending) { showUiToast(`${rv.name} đang soạn trả lời, hãy đợi một chút nhé!`); return; }
  const input = document.getElementById('rvc-' + id); const text = input ? input.value.trim() : '';
  if (!text) { showUiToast('Hãy nhập nội dung phản hồi!'); return; }
  rv.comments.push({ from: 'player', text });
  const a = analyzeCommentDetail(text);
  rv.pending = { dueAt: gameTime.getTime() + REVIEW_REPLY_DELAY_MIN * 60000, tone: a.tone, tags: a.tags };
  if (input) input.value = '';
  refreshReviewCard(id); autoSaveGame();
}

function processReviewReplies() {
  if (typeof gameTime === 'undefined') return;
  const now = gameTime.getTime();
  guestReviews.forEach(rv => {
    if (!rv.pending || now < rv.pending.dueAt) return;
    const { tone, tags } = rv.pending; rv.pending = null;
    const oldStars = rv.stars; let newStars = rv.stars; const alreadyEdited = rv.edited;
    if (tone === 'pos' && !rv.edited && rv.stars < 5) { newStars = Math.min(5, rv.stars + (rv.stars <= 2 ? 2 : 1)); rv.edited = true; }
    else if (tone === 'neg' && !rv.edited && rv.stars > 1) { newStars = Math.max(1, rv.stars - 1); rv.edited = true; }
    const changed = newStars !== oldStars;
    rv.comments.push({ from: 'guest', text: composeGuestReply(rv, tone, tags, { oldStars, newStars, changed, alreadyEdited }) });
    if (changed) {
      adjustReviewStars(rv, newStars);
      showUiToast(newStars > oldStars ? `😊 ${rv.name} đã tăng lên ${newStars} sao!` : `😠 ${rv.name} đã giảm xuống ${newStars} sao!`);
    } else showUiToast(`💬 ${rv.name} đã trả lời phản hồi của bạn`);
    refreshReviewCard(rv.id); autoSaveGame();
  });
}
