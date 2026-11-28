// ==========================================
// LỄ TÂN TỰ ĐỘNG: nhận phòng & kịch bản hội thoại
// ==========================================
function autoApplyCheckIn(room, bill) {
  const g = autoRec.guest;
  // Thanh toán (giống finishPayment)
  const finalPrice = bill.total;
  const commission = finalPrice * getCommissionRate();
  hotelMoney += finalPrice - commission;
  playerMoney += commission;
  totalRevenue += finalPrice;
  maybeBillTip(finalPrice); profAddGuests(g.guests.length);
  addExp(Math.floor(finalPrice / 10000));
  // Tâm trạng khách ở sảnh quyết định số sao khách đánh giá khi trả phòng (lễ tân ít sao đôi khi làm khách phật ý)
  let mood = getGuestMoodStars();
  if (mood > 3 && Math.random() < (5 - autoRec.rec.stars) * 0.05) mood--;
  guestPatienceEndTime = 0;
  const now = gameTime;
  receiptHistory.push({ room: String(room.number), time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`, price: finalPrice, commission, owner: isHotelOwner });
  // Nhận phòng (giống takeKey)
  room.status = 'Có khách';
  room.reviewStars = mood;
  room.reviewGuest = reviewGuestInfo(g.guests[0], g.guests.length); room.reviewRecId = autoRec.rec.id; room.reviewRecName = autoRec.rec.name;
  room.guests = null;
  room.stayHours = g.stayHours;
  room.guestPos = 'center';
  room.checkOutTime = Date.now() + (g.stayHours * 75 * 1000);
  occupiedRooms++;
  const logTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`;
  diaryHistory.in.push({ room: room.number, time: logTimeStr });
  const checkInDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  guestProfiles.push({ date: checkInDate, room: room.number, guests: g.guests });
  updateMoneyUI();
  renderReceipt();
  renderDiary();
  draw();
}

function buildAutoSteps() {
  const R = autoRec, g = R.guest, rec = R.rec;
  const multi = g.guests.length > 1;
  const gp = autoGuestPronoun(g.guests[0], rec.age);
  const my = autoCap(autoMyPronoun(gp));
  const replyPro = multi ? 'Chúng tôi' : autoCap(gp);
  const fmt = (n) => fmtVND(n);

  const leaveStep = (recLine) => ({ d: 1500, fn: () => {
    autoSay('rec', recLine);
    R.steps.splice(R.idx, R.steps.length - R.idx, { d: 1200, fn: () => {
      autoSay('guest', multi ? 'Vậy chúng tôi xin phép đi nơi khác, cảm ơn.' : 'Vậy tôi xin phép đi nơi khác, cảm ơn.');
      addGuestReview(1, { reason: 'Không còn phòng', guest: reviewGuestInfo(g.guests[0], g.guests.length), recId: rec.id, recName: rec.name });
      currentGuest = null; guestPatienceEndTime = 0; draw();
      R.handedOff = true;
      return 'end';
    } });
  } });

  R.steps = [
    { d: 1200, fn: () => autoSay('guest', 'Xin chào!') },
    { d: 1500, fn: () => autoSay('rec', `Chào ${gp}, ${my.toLowerCase()} có thể giúp gì cho bạn?`) },
    { d: 1300, fn: () => autoSay('guest', `${replyPro} muốn thuê 1 ${g.reqType}.`) },
    { d: 1500, fn: () => autoSay('rec', multi ? 'Vậy mọi người định ở trong bao lâu?' : `Vậy ${gp} định ở trong bao lâu?`) },
    { d: 1500, fn: () => {
      const rand = Math.random(); const hour = gameTime.getHours();
      const canStayOvernight = (hour >= 18 && hour < 24);
      let reply, rentType, hours = 0;
      if (rand < 0.4) { hours = Math.floor(Math.random() * 10) + 2; reply = multi ? `Chúng tôi ở khoảng ${hours} tiếng thôi.` : `Tôi ở khoảng ${hours} tiếng thôi.`; rentType = 'hour'; }
      else if (rand < 0.7 && canStayOvernight) { hours = (24 - hour) + 7; if (hours <= 0) hours = 12; reply = multi ? 'Chúng tôi sẽ ở qua đêm, sáng mai 7h chúng tôi đi.' : 'Tôi sẽ ở qua đêm, sáng mai 7h tôi đi.'; rentType = 'night'; }
      else { const days = Math.floor(Math.random() * 3) + 1; hours = days * 24; reply = multi ? `Chúng tôi ở dài hạn khoảng ${days} ngày.` : `Tôi ở dài hạn khoảng ${days} ngày.`; rentType = 'day'; }
      g.rentType = rentType; g.stayHours = hours; guestStayHours = hours;
      autoSay('guest', reply);
    } },
    { d: 1500, fn: () => autoSay('rec', multi ? `Cho ${my.toLowerCase()} xin Căn cước công dân của mọi người ạ.` : `Vui lòng cho ${my.toLowerCase()} xin Căn cước công dân của ${gp}.`) },
    { d: 1500, fn: () => {
      g.guests.forEach(p => { p.idCard = p.age >= 18 ? ('0' + Math.floor(Math.random() * 90000000000 + 10000000000)) : 'Chưa có'; });
      autoSay('guest', multi ? `Tất cả đều ở đây, chúng tôi có ${g.guests.length} người.` : 'Đây là CCCD của tôi.');
      const now = new Date(gameTime);
      let outTime;
      if (g.rentType === 'night') { outTime = new Date(now); outTime.setDate(outTime.getDate() + 1); outTime.setHours(7, 0, 0, 0); }
      else { outTime = new Date(now.getTime() + g.stayHours * 60 * 60000); }
      const p2 = (n) => n.toString().padStart(2, '0');
      g.timeIn = `${p2(now.getHours())}:${p2(now.getMinutes())} - ${now.getDate()}/${now.getMonth() + 1}`;
      g.timeOut = `${p2(outTime.getHours())}:${p2(outTime.getMinutes())} - ${outTime.getDate()}/${outTime.getMonth() + 1}`;
    } },
    ...(getGuestVoucher(g) ? [
      { d: 1400, fn: () => autoSay('guest', `Tôi có mã giảm giá ${g.voucher.code} (giảm ${g.voucher.discount}%), áp dụng giúp nhé!`) },
      { d: 1300, fn: () => autoSay('rec', `Dạ, ${my.toLowerCase()} đã áp dụng mã ${g.voucher.code} rồi ạ.`) }
    ] : []),
    { d: 1600, fn: () => {
      const room = roomState.find(r => Math.floor(r.number / 100) === g.reqFloor && r.status === 'Trống');
      if (!room) {
        R.steps.splice(R.idx, R.steps.length - R.idx, leaveStep(`Dạ rất tiếc, hiện ${g.reqType} đã hết phòng rồi ạ. Mong ${gp} thông cảm.`));
        return;
      }
      R.room = room;
      const size = g.guests.length;
      const mult = size; const disc = size === 2 ? 0.1 : size === 3 ? 0.2 : size === 4 ? 0.3 : 0;
      const prices = customPrices[g.reqType];
      let basePrice = prices[g.rentType] * mult * (1 - disc);
      const gv = getGuestVoucher(g);
      if (gv) basePrice = basePrice * (1 - gv.discount / 100);
      const vat = basePrice * 0.1;
      R.bill = { basePrice, vat, total: basePrice + vat };
      autoSay('rec', `Dạ còn Phòng ${room.number} ạ. Tổng tiền (đã gồm VAT 10%) là ${fmt(R.bill.total)}${gv ? ` (đã áp mã ${gv.code} -${gv.discount}%)` : ''}.`);
    } },
    { d: 1500, fn: () => autoSay('rec', `Dạ ${gp} muốn thanh toán bằng tiền mặt hay quét mã QR ạ?`) },
    { d: 1500, fn: () => {
      R.isCash = Math.random() > 0.5;
      autoSay('guest', R.isCash ? `${replyPro} thanh toán bằng tiền mặt.` : `${replyPro} quét mã QR.`);
    } },
    { d: 1500, fn: () => autoSay('rec', R.isCash ? 'Dạ em đã nhận đủ tiền và thối lại ạ, cảm ơn quý khách.' : 'Đã nhận được thanh toán qua mã QR, cảm ơn quý khách.') },
    { d: 1600, fn: () => {
      let room = R.room;
      if (!room || room.status !== 'Trống') room = roomState.find(r => Math.floor(r.number / 100) === g.reqFloor && r.status === 'Trống');
      if (!room) {
        R.steps.splice(R.idx, R.steps.length - R.idx, leaveStep('Dạ xin lỗi, phòng vừa có người nhận mất rồi ạ. Em xin lỗi vì sự bất tiện này.'));
        return;
      }
      autoApplyCheckIn(room, R.bill);
      R.room = room; R.handedOff = true;
      autoSay('rec', `Dạ đây là chìa khóa phòng ${room.number}.`);
    } },
    { d: 2200, fn: () => {
      const n = R.room.number;
      if (typeof guideGuestState === 'undefined' || guideGuestState === 'none') {
        autoSay('guide', `Vâng, tôi sẽ đưa quý khách lên phòng ${n} ngay ạ.`);
        guideGuestState = 'to_room';
        guidePosX = 480; guidePosY = 40;
        guideTargetRoom = n;
        window.tempGuestsForDrawing = g.guests;
        guidePathHistory = [];
      } else {
        autoSay('rec', 'Dẫn khách hiện đang bận. Vui lòng chờ dẫn khách để được đưa lên phòng ạ.');
        pendingGuestForGuide = { room: n, guests: g.guests };
      }
      currentGuest = null; currentBillData = null; guestPatienceEndTime = 0;
      draw();
    } },
    { d: 100, fn: () => 'end' }
  ];
}

// Lễ tân vào ca (hoặc vừa mở game) mà có khách đang đứng chờ -> lễ tân nhận khách ngay
function pickupWaitingGuestForAutoReception() {
  if (!currentGuest || isAutoReceptionRunning() || currentGuest.manualEngaged) return;
  if (!isGameStarted || isGamePaused) return;
  if (!getActiveReceptionist()) return;
  tryStartAutoReception();
}
