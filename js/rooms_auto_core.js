// ==========================================
// LỄ TÂN TỰ ĐỘNG: bộ máy chạy các bước
// ==========================================
// =====================================================
// LỄ TÂN TỰ ĐỘNG
// Khi đã mua khách sạn và có lễ tân đang trong ca, lễ tân tự làm thủ tục cho khách.
// Hội thoại diễn ra ở sảnh chính; nếu bạn ở tầng khác thì vẫn xử lý ngầm.
// =====================================================
let autoRec = null;

function getActiveReceptionist() {
  if (!isHotelOwner) return null;
  const working = getWorkingStaff('leTan');
  if (!working.length) return null;
  return working.slice().sort((a, b) => b.speed - a.speed)[0]; // người nhanh nhất đảm nhận
}
function isAutoReceptionRunning() { return !!autoRec && !autoRec.done; }

function autoCap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function autoGuestPronoun(person, recAge) {
  const age = person.age || 20;
  if (person.isMale) {
    if (age < recAge) return 'em';
    if (age < recAge + 18) return 'anh';
    if (age < recAge + 36) return 'chú';
    return 'ông';
  }
  if (age < recAge) return 'em';
  if (age < recAge + 18) return 'chị';
  if (age < recAge + 36) return 'cô';
  return 'bà';
}
function autoMyPronoun(gp) {
  if (gp === 'em') return 'tôi';
  if (gp === 'anh' || gp === 'chị') return 'em';
  if (gp === 'chú' || gp === 'cô') return 'con';
  return 'cháu';
}

function renderAutoChat() {
  if (!autoRec) return;
  const g = autoRec.guest;
  let title;
  if (g.guests.length === 1) title = autoCap(autoGuestPronoun(g.guests[0], autoRec.rec.age));
  else if (g.guests.length === 2) title = autoCap(autoGuestPronoun(g.guests[0], autoRec.rec.age) + ' và ' + autoGuestPronoun(g.guests[1], autoRec.rec.age));
  else title = `Nhóm ${g.guests.length} người`;
  document.getElementById('chatGuestName').innerText = title;
  document.getElementById('chatHistory').innerHTML = '';
  autoRec.log.forEach(l => addChatMessage(l.sender, l.text, l.color, l.align));
  document.getElementById('chatActionBtn').style.display = 'none';
  document.getElementById('openComputerFromChatBtn').style.display = 'none';
  document.getElementById('chatBox').style.display = 'block';
  autoRec.chatOn = true;
}

function autoSay(who, text) {
  const single = autoRec.guest.guests.length === 1;
  let line;
  if (who === 'rec') line = { sender: `Lễ tân ${autoRec.rec.name}`, text, color: '#e67e22', align: 'right' };
  else if (who === 'guide') line = { sender: 'Nhân viên dẫn khách', text, color: '#1e3a52', align: 'left' };
  else line = { sender: single ? 'Khách' : 'Người đại diện', text, color: '#1e3a52', align: 'left' };
  autoRec.log.push(line);
  const box = document.getElementById('chatBox');
  if (currentFloor !== 1) { box.style.display = 'none'; autoRec.chatOn = false; return; }
  if (autoRec.chatOn && box.style.display === 'block') addChatMessage(line.sender, line.text, line.color, line.align);
  else renderAutoChat();
}

function autoFinish() {
  if (!autoRec) return;
  clearTimeout(autoRec.timer);
  autoRec.done = true;
  autoRec = null;
  setTimeout(() => { if (!autoRec) document.getElementById('chatBox').style.display = 'none'; }, 400);
}

function runAutoStep() {
  if (!autoRec) return;
  if (!autoRec.handedOff && currentGuest !== autoRec.guest) { autoFinish(); return; } // khách đã bỏ đi
  if (isGamePaused) { autoRec.timer = setTimeout(runAutoStep, 500); return; }
  const st = autoRec.steps[autoRec.idx++];
  if (!st) { autoFinish(); return; }
  const R = autoRec;
  const result = st.fn();
  if (result === 'end') { autoFinish(); return; }
  if (!autoRec || autoRec !== R) return;
  autoRec.timer = setTimeout(runAutoStep, Math.round(st.d / autoRec.speed));
}

function tryStartAutoReception() {
  const rec = getActiveReceptionist();
  if (!rec || !currentGuest || currentGuest.manualEngaged) return false;
  if (autoRec) clearTimeout(autoRec.timer);
  // Nếu hộp chat thủ công đang chờ (khách mới chào) thì dọn đi để lễ tân tiếp
  document.getElementById('chatBox').style.display = 'none';
  document.getElementById('chatActionBtn').style.display = 'none';
  document.getElementById('openComputerFromChatBtn').style.display = 'none';
  autoRec = { guest: currentGuest, rec, log: [], idx: 0, steps: [], chatOn: false, done: false, handedOff: false, timer: 0, speed: staffSpeedMult(rec) };
  buildAutoSteps();
  autoRec.timer = setTimeout(runAutoStep, Math.round(1000 / autoRec.speed));
  return true;
}
