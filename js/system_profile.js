const USD_VND = 25000; // quy đổi ước tính USD -> VNĐ
// ==========================================
// HỆ THỐNG: Cá nhân - thông tin, thông số & bảng xếp hạng (dữ liệu ảo, từ dễ đến khó)
// ==========================================
const PROF_KEY = 'sunriseHotel_Profile';
let profData = { age: 25, gender: 'Nam', playSec: 0, guests: 0, earned: -1 };
try { Object.assign(profData, JSON.parse(localStorage.getItem(PROF_KEY) || '{}')); } catch (e) {}
// Tổng tiền đã kiếm: chỉ cộng khi tiền tăng, tiêu tiền không làm giảm
let profLastMoney = playerMoney;
setInterval(() => {
  if (!isGameStarted) { profLastMoney = playerMoney; return; }
  if (profData.earned < 0) profData.earned = playerMoney;
  if (playerMoney > profLastMoney) profData.earned += playerMoney - profLastMoney;
  profLastMoney = playerMoney;
}, 500);
// ---- ID người chơi (12 ký tự, tạo 1 lần, lưu trên máy này) ----
(function () {
  try { const d = JSON.parse(localStorage.getItem('sunriseHotel_Identity') || '{}'); if (d.id && d.id.length === 12) { profData.id = d.id; return; } } catch (e) {}
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let id = ''; const r = new Uint8Array(12); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach((_, i) => r[i] = Math.random() * 256);
  for (let i = 0; i < 12; i++) id += A[r[i] % A.length];
  profData.id = id; try { localStorage.setItem('sunriseHotel_Identity', JSON.stringify({ id })); } catch (e) {}
})();
function profSyncMoney() { profLastMoney = playerMoney; }
function profSave() { try { localStorage.setItem(PROF_KEY, JSON.stringify(profData)); } catch (e) {} }
function profAddGuests(n) { profData.guests += (n || 1); profSave(); }
(function () { const a = document.getElementById('inputAge'), g = document.getElementById('inputGender'); if (a) a.value = profData.age; if (g) g.value = profData.gender; })();
document.getElementById('saveProfile').addEventListener('click', () => {
  profData.age = parseInt(document.getElementById('inputAge').value) || profData.age;
  profData.gender = document.getElementById('inputGender').value; profSave();
});
// Tổng thời gian chơi ngoài đời (chỉ tính khi đang chơi, không tạm dừng)
setInterval(() => { if (isGameStarted && !isGamePaused) { profData.playSec++; if (profData.playSec % 10 === 0) profSave(); } }, 1000);

function profFmtMoney(v) { return fmtVND(v); }
function profFmtTime(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h > 0 ? `${h} giờ ${m} phút` : `${m} phút ${Math.floor(sec % 60)} giây`; }
function profRenderInfo() {
  const el = document.getElementById('profStats'); if (!el) return;
  const row = (k, v) => `<div style="display:flex; justify-content:space-between;"><b>${k}</b><span style="color:#2c6e9e; font-weight:900;">${v}</span></div>`;
  el.innerHTML = row('⏱️ Tổng thời gian chơi', profFmtTime(profData.playSec)) + row('💰 Tổng tiền đã kiếm', profFmtMoney(Math.max(profData.earned, playerMoney)))
    + row('🧑‍🤝‍🧑 Tổng khách phục vụ', profData.guests.toLocaleString('vi-VN')) + row('⭐ Level', playerLevel) + row('🏷️ Hệ số phòng tối đa', 'x' + priceCapMultiplier().toFixed(2));
}
// ---- Bảng xếp hạng ảo: top 100 giảm dần theo hàm mũ, người chơi bứt lên từng bước ----
const RANK_CFG = {
  money:  { top: 5e10, low: 3e6,  val: () => Math.max(profData.earned, playerMoney),          fmt: v => profFmtMoney(v) },
  level:  { top: 100,  low: 3,    val: () => playerLevel,          fmt: v => 'Lv ' + Math.round(v) },
  guests: { top: 20000, low: 20,  val: () => profData.guests,      fmt: v => Math.round(v).toLocaleString('vi-VN') + ' khách' },
  bill:   { top: 4.2e11 * USD_VND, low: 1e10 * USD_VND, val: () => Math.max(profData.earned, playerMoney), fmt: v => profFmtMoney(v) },
  time:   { top: 1800000, low: 1800, val: () => profData.playSec,  fmt: v => profFmtTime(v) }
};
const BILLIONAIRES = 'Elon Musk|US|420;Jeff Bezos|US|245;Mark Zuckerberg|US|225;Larry Ellison|US|205;Bernard Arnault|FR|190;Warren Buffett|US|150;Larry Page|US|148;Sergey Brin|US|140;Bill Gates|US|130;Steve Ballmer|US|125;Jensen Huang|US|122;Alice Walton|US|120;Jim Walton|US|118;Rob Walton|US|116;Amancio Ortega|ES|115;Carlos Slim|MX|112;Michael Dell|US|108;Michael Bloomberg|US|105;Mukesh Ambani|IN|100;Françoise Bettencourt Meyers|FR|90;Gautam Adani|IN|85;Julia Koch|US|75;Charles Koch|US|74;Thomas Peterffy|US|72;Jacqueline Mars|US|68;John Mars|US|68;Zhang Yiming|CN|65;David Thomson|CA|62;Zhong Shanshan|CN|60;Changpeng Zhao|AE|58;Jeff Yass|US|57;Stephen Schwarzman|US|56;Ken Griffin|US|55;Eduardo Saverin|SG|52;Ma Huateng|CN|50;Miriam Adelson|US|48;Lei Jun|CN|46;Dieter Schwarz|DE|45;Tadashi Yanai|JP|45;Klaus-Michael Kühne|CH|44;Qin Yinglin|CN|43;Colin Huang|CN|42;Gina Rinehart|AU|40;Masayoshi Son|JP|40;Len Blavatnik|GB|39;Eric Schmidt|US|38;Jack Ma|CN|37;Savitri Jindal|IN|36;Shiv Nadar|IN|35;Gianluigi Aponte|CH|35;Dilip Shanghvi|IN|34;Phil Knight|US|33;Radhakishan Damani|IN|33;Lukas Walton|US|32;Giovanni Ferrero|IT|31;Stefan Persson|SE|30;Iris Fontbona|CL|28;Gerard Wertheimer|FR|28;Alain Wertheimer|FR|28;Germán Larrea|MX|27;Vagit Alekperov|RU|26;Vladimir Potanin|RU|25;Yang Huiyan|CN|24;Alexey Mordashov|RU|24;Andrey Melnichenko|RU|23;Rupert Murdoch|AU|22;Leonid Mikhelson|RU|22;Wang Wei|CN|22;Zeng Yuqun|CN|21;Li Ka-shing|HK|21;David Tepper|US|21;Lee Shau Kee|HK|20;Aliko Dangote|NG|20;Steve Cohen|US|20;Takemitsu Takizaki|JP|20;Ren Zhengfei|CN|19;Nassef Sawiris|EG|19;Prajogo Pangestu|ID|19;Low Tuck Kwong|ID|18;Robert Pera|US|18;Reinhold Würth|DE|18;Susanne Klatten|DE|17;Stefan Quandt|DE|17;Hasso Plattner|DE|17;Lakshmi Mittal|GB|16;Thomas Frist|US|16;Philip Anschutz|US|15;Ray Dalio|US|15;Ronald Perelman|US|14;Mark Mateschitz|AT|14;Lee Jae-yong|KR|13;Jorge Paulo Lemann|BR|13;Patrick Collison|IE|12;John Collison|IE|12;Daniel Ek|SE|12;Jeff Skoll|CA|11;Pierre Omidyar|US|11;Zhou Qunfei|CN|11;Hui Ka Yan|CN|10.5;Phạm Nhật Vượng|VN|10'.split(';').map(x => { const p = x.split('|'); return { name: p[0], cc: p[1], usd: +p[2] }; });
function rankFlag(cc) { return String.fromCodePoint(...[...cc].map(c => 127397 + c.charCodeAt(0))); }
const RANK_FIRST = ['Minh', 'Lan', 'Hùng', 'Mai', 'Tuấn', 'Hoa', 'Nam', 'Thảo', 'Long', 'Linh', 'Phúc', 'Ngọc', 'Khoa', 'Trang', 'Đạt', 'Vy'];
const RANK_LAST = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô'];
function rankFake(cfg, i) { return cfg.top * Math.pow(cfg.low / cfg.top, i / 99); }
function rankName(i, t) { const x = i * 31 + t.length * 7; return RANK_LAST[(x * 7) % 10] + ' ' + RANK_FIRST[(x * 13 + i) % 16] + (i % 5 === 0 ? ' ' + (10 + (x * 3) % 89) : ''); }
const RANK_TITLE = { money: ['💰 Bảng xếp hạng tiền', '#16a34a', '#15803d'], level: ['⭐ Bảng xếp hạng level', '#f59e0b', '#d97706'], guests: ['🧑‍🤝‍🧑 Bảng xếp hạng lượng khách', '#3b82f6', '#1d4ed8'], time: ['⏱️ Bảng xếp hạng thời gian chơi', '#8b5cf6', '#6d28d9'], bill: ['🌍 Top 100 tỉ phú thế giới', '#0f172a', '#1e3a8a'] };
const RANK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
function rankColor(n) { let h = 0; for (const c of String(n)) h = (h * 31 + c.charCodeAt(0)) % 997; return RANK_COLORS[h % RANK_COLORS.length]; }
function rankAvatar(o, size, extra) {
  const badge = o.flag ? `<span style="position:absolute; right:-4px; bottom:-4px; font-size:${Math.round(size * 0.42)}px; line-height:1; background:#fff; border-radius:50%; padding:1px; box-shadow:0 0 2px rgba(0,0,0,.4);">${o.flag}</span>` : '';
  return `<div style="position:relative; flex:none; width:${size}px; height:${size}px; border-radius:50%; background:${rankColor(o.name)}; color:#fff; font-weight:900; font-size:${Math.round(size * 0.45)}px; line-height:1; display:flex; align-items:center; justify-content:center; ${extra || ''}">${ini(o.name)}${badge}</div>`;
}
function ini(n) { return staffEsc(String(n).trim().charAt(0).toUpperCase()); }
// ---- Tên người chơi: tự do, chỉ giới hạn tối đa 40 ký tự ----
(function () { const ni = document.getElementById('inputName'); if (ni) ni.maxLength = 40; })();
// ---- ID nằm trong dữ liệu game (mã Code sao lưu có kèm ID); hiện ở Cài đặt > Dữ liệu game ----
function profSetId(id) { if (/^[A-Z0-9]{12}$/.test(id || '')) { profData.id = id; try { localStorage.setItem('sunriseHotel_Identity', JSON.stringify({ id })); } catch (e) {} } }
function profRenderRank() {
  const t = document.getElementById('rankType').value, cfg = RANK_CFG[t], v = cfg.val();
  const me = (document.getElementById('inputName') || {}).value || 'Bạn';
  let arr;
  if (t === 'bill') arr = BILLIONAIRES.map(b => ({ name: b.name, val: b.usd * 1e9 * USD_VND, flag: rankFlag(b.cc), sub: '$' + b.usd + ' tỷ' })).sort((a, b) => b.val - a.val);
  else arr = Array.from({ length: 100 }, (_, i) => ({ name: rankName(i, t), val: rankFake(cfg, i) }));
  let rank = 1 + arr.filter(o => o.val > v).length, out = rank > 100;
  if (out && t !== 'bill') rank = Math.min(99999, Math.max(101, Math.ceil(99 * Math.log(Math.max(v, 1e-9) / cfg.top) / Math.log(cfg.low / cfg.top)) + 1));
  const rows = arr.map((o, i) => Object.assign({ r: i + 1, me: false }, o));
  if (!out) { rows.splice(rank - 1, 0, { r: rank, name: me, val: v, me: true }); rows.length = 100; rows.forEach((o, i) => o.r = i + 1); }
  const floor = cfg.low / 10, pct = x => Math.max(4, Math.min(100, 100 * Math.log(Math.max(x, floor) / floor) / Math.log(cfg.top / floor)));
  const ini = n => staffEsc(String(n).trim().charAt(0).toUpperCase());
  const T = RANK_TITLE[t];
  const nm = o => staffEsc(o.name) + (o.flag ? ' ' + o.flag : '') + (o.me ? ' (Bạn)' : '');
  const M = { 1: ['🥇', '#fbbf24', '#fffbeb', 92], 2: ['🥈', '#94a3b8', '#f1f5f9', 70], 3: ['🥉', '#d97706', '#fff7ed', 56] };
  const pod = [rows[1], rows[0], rows[2]].map(o => { const m = M[o.r]; return `<div style="flex:1; text-align:center;">
    ${o.r === 1 ? '<div style="font-size:22px; margin-bottom:-4px;">👑</div>' : ''}
    ${rankAvatar(o, o.r === 1 ? 52 : 42, 'margin:0 auto; border:3px solid ' + m[1] + '; box-shadow:0 2px 8px rgba(0,0,0,.25);')}
    <div style="font-size:11px; font-weight:900; color:#1e3a52; margin-top:3px; word-break:break-word;">${nm(o)}</div>
    <div style="font-size:10px; color:#2c6e9e; font-weight:bold;">${cfg.fmt(o.val)}</div>${o.sub ? `<div style="font-size:10px; color:#64748b;">${o.sub}</div>` : ''}
    <div style="height:${m[3]}px; margin-top:4px; background:linear-gradient(180deg,${m[1]},${m[2]}); border-radius:8px 8px 0 0; display:flex; align-items:flex-start; justify-content:center; font-size:26px; padding-top:6px;">${m[0]}</div></div>`; }).join('');
  const list = rows.slice(3).map(o => { const top10 = o.r <= 10, col = o.me ? '#f59e0b' : '#3b82f6'; return `<div style="margin:6px 0; padding:8px 10px; border-radius:10px; background:${o.me ? 'linear-gradient(90deg,#fef3c7,#fffbeb)' : '#fff'}; border:1px solid ${o.me ? '#f59e0b' : '#e2e8f0'}; box-shadow:0 1px 3px rgba(0,0,0,.06);">
    <div style="display:flex; align-items:center; gap:8px;">
      <div style="min-width:30px; height:26px; border-radius:13px; background:${top10 ? '#1e3a52' : '#e2e8f0'}; color:${top10 ? '#fff' : '#64748b'}; font-weight:900; font-size:12px; line-height:26px; text-align:center;">${o.r}</div>
      ${rankAvatar(o, 32)}
      <div style="flex:1; min-width:0;"><div style="font-weight:${o.me ? 900 : 700}; color:#1e3a52; font-size:13px; word-break:break-word;">${nm(o)}</div>${o.sub ? `<div style="font-size:10px; color:#94a3b8;">${o.sub}</div>` : ''}<div style="color:#2c6e9e; font-weight:900; font-size:12px; margin-top:2px;">${cfg.fmt(o.val)}</div></div></div>
    <div style="height:5px; background:#e2e8f0; border-radius:3px; margin-top:6px;"><div style="height:100%; width:${pct(o.val)}%; background:linear-gradient(90deg,${col},${T[1]}); border-radius:3px;"></div></div></div>`; }).join('');
  document.getElementById('rankList').innerHTML = `<div style="background:linear-gradient(135deg,${T[1]},${T[2]}); color:#fff; border-radius:12px; padding:10px 12px; margin-bottom:10px; font-weight:900; font-size:14px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,.2);">${T[0]}${t === 'bill' ? '<div style="font-size:10px; font-weight:normal; opacity:.85;">Tài sản ước tính, quy đổi 1 USD ≈ 25.000 VNĐ</div>' : ''}</div>
    <div style="display:flex; gap:6px; align-items:flex-end; padding:6px 4px 0; background:#f8fafc; border-radius:12px;">${pod}</div>${list}`;
  const need = rank > 1 ? (out ? (t === 'bill' ? arr[99].val : rankFake(cfg, rank - 2)) - v : rows[rank - 2].val - v) : 0;
  const rtxt = out && t === 'bill' ? '100+' : '#' + rank.toLocaleString('vi-VN');
  const goal = out && t === 'bill' ? 'vào top 100 tỉ phú' : 'lên hạng #' + (rank - 1).toLocaleString('vi-VN');
  document.getElementById('rankMe').innerHTML = `<div style="background:linear-gradient(90deg,#fde68a,#fef3c7); border:2px solid #f59e0b; border-radius:12px; padding:8px 10px; display:flex; align-items:center; gap:10px; box-shadow:0 2px 8px rgba(245,158,11,.4);">
    <div style="font-size:20px; font-weight:900; color:#b45309; min-width:46px; text-align:center;">${rtxt}</div>
    <div style="flex:1; min-width:0;"><div style="font-weight:900; color:#1e3a52; font-size:13px;">${staffEsc(me)} (Bạn)${out ? ' · ngoài top 100' : ''}</div>
    <div style="font-size:11px; color:#64748b;">${rank > 1 ? 'Cần thêm ' + cfg.fmt(Math.max(need, 0)) + ' để ' + goal : 'Bạn đang đứng đầu!'}</div></div>
    <div style="font-weight:900; color:#2c6e9e; font-size:12px; text-align:right;">${cfg.fmt(v)}</div></div>`;
}
if (document.getElementById('rankType')) { // chỉ chạy khi index.html đã là bản mới
document.querySelectorAll('.prof-tab').forEach(b => b.onclick = () => {
  document.querySelectorAll('.prof-tab').forEach(x => x.classList.toggle('secondary', x !== b));
  document.getElementById('profTabInfo').style.display = b.dataset.pt === 'info' ? 'block' : 'none';
  document.getElementById('profTabRank').style.display = b.dataset.pt === 'rank' ? 'block' : 'none';
  document.getElementById('saveProfile').style.display = b.dataset.pt === 'rank' ? 'none' : '';
  if (b.dataset.pt === 'rank') profRenderRank(); else profRenderInfo();
});
document.querySelectorAll('.rank-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.rank-btn').forEach(x => x.classList.toggle('secondary', x !== b));
  document.getElementById('rankType').value = b.dataset.rt; profRenderRank();
});
document.getElementById('btnProfile').addEventListener('click', () => { profRenderInfo(); });
setInterval(() => { if (document.getElementById('profilePanel').classList.contains('show') && document.getElementById('profTabInfo').style.display !== 'none') profRenderInfo(); }, 1000);
}
