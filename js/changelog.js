// File này chứa toàn bộ Lịch sử cập nhật của game.
// Bạn có thể thoải mái chỉnh sửa, thêm bớt ở đây mà không sợ ảnh hưởng đến code chính.

function showChangelog() {
  document.getElementById('panelTitle').innerText = "🔄 LỊCH SỬ CẬP NHẬT";
  document.getElementById('panelContent').innerHTML = `
    <div style="font-size:13px; color:#253548; line-height:1.6;">
      <style>
        details { margin-bottom: 10px; background: #fff; border-radius: 8px; padding: 10px; border: 1px solid #d1dbe5; }
        summary { font-weight: 900; color: #1e3a52; cursor: pointer; outline: none; font-size: 14px; }
        summary::-webkit-details-marker { display: none; }
        summary::before { content: '▶ '; color: #2c6e9e; font-size: 12px; }
        details[open] summary::before { content: '▼ '; }
        details ul { margin: 8px 0 0 0; padding-left: 20px; }
        details li { margin-bottom: 4px; }
      </style>

      <!-- PHIÊN BẢN MỚI NHẤT -->

<details open>
  <summary>Phiên bản 0.4.4 (Mới nhất)</summary>
  <div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic;">📅 Cập nhật: 28/11/2026 - 8h00</div>
  <ul>
    <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Tài khoản:</b> Mỗi người chơi có ID riêng (xem ở Cài đặt). Dữ liệu tự lưu trên mạng, nhập ID ở máy khác để chơi tiếp, mỗi ID chỉ chơi được trên 1 thiết bị. Tên không được trùng với người khác (tên mặc định là player#0000, tối đa 40 ký tự). Có nút Xóa tài khoản để chơi lại từ đầu.</li>
    <li>✅ <b>Khôi phục:</b> Cài đặt có 3 ô khôi phục 3 ngày gần nhất (lưu mỗi khi sang 0h trong game), hiển thị ngày, tiền và level. Không còn sao lưu bằng mã Code.</li>
    <li>✅ <b>Sự cố trong khách sạn:</b> Khách có thể nhắn tin báo mất điện, hư máy lạnh, vỡ ống nước, bóng đèn, wifi... Bạn có 90 giây để xử lý. Việc dễ thì tự bấm vào phòng "CẦN SỬA" hoặc gọi nhân viên. Việc khó thì nhân viên sẽ báo để bạn gọi thợ. Tiền sửa trừ vào tiền khách sạn (hoặc tiền của chủ). Không sửa kịp hoặc khách đã rời đi thì bị đánh giá 1 sao.</li>
    <li>✅ <b>Tiền tip:</b> Khách có thể tip khi thanh toán và khi bạn sửa sự cố nhanh. Khách sạn càng nhiều sao càng dễ được tip.</li>
    <li>✅ <b>Mã giảm giá:</b> Khách có thể dùng mã giảm giá đang chạy, họ sẽ nhắc mã với lễ tân và hóa đơn được giảm theo phần trăm.</li>
    <li>✅ <b>Mạng xã hội:</b> Máy tính có thêm trang giống fanpage của khách sạn với các bài quảng cáo, sự kiện, thông báo. Lượt tim, bình luận, chia sẻ tăng dần theo thời gian và bạn có thể bấm xem bình luận.</li>
    <li>✅ <b>Tuyển nhân viên:</b> Mỗi vị trí chỉ có 1-3 ứng viên. Tuyển hết thì phải chờ 3 ngày trong game mới có người mới.</li>
    <li>✅ <b>Cá nhân và xếp hạng:</b> Điền thông tin cá nhân và xem thông số (thời gian chơi, tổng tiền đã kiếm, khách phục vụ, level, hệ số phòng tối đa). Bảng xếp hạng gồm tiền, level, lượng khách, thời gian chơi và Top 100 tỉ phú thế giới. Hạng của bạn luôn hiện ở dưới cùng.</li>
    <li>✅ <b>Nhạc và âm thanh:</b> Có trình phát nhạc trong Cài đặt (danh sách bài, chuyển bài, tua, lặp, ngẫu nhiên, thêm nhạc của bạn). Có tiếng chuông khi khách đến và tiếng tách khi bấm nút.</li>
    <li>✅ <b>Giao diện:</b> Chọn 1 trong 6 chủ đề màu (Tối, Sáng, Xanh lá dịu, Xanh biển, Cà phê ấm, Tím dịu), đổi cả màn hình tải và menu. Màn hình tải mới hiện tên game, thanh tải ở dưới.</li>
    <li>✅ <b>Thời gian và tiền:</b> 1 ngày trong game bằng 30 phút ngoài đời, đồng hồ chạy từng phút. Tiền hiển thị theo ngàn, triệu, tỷ... kèm VNĐ. Ván mới bắt đầu với 0 VNĐ và Lv.1.</li>
    <li>✅ <b>Sửa lỗi:</b> Số sao khách sạn không còn hiện sai 5 sao khi mở bảng đánh giá. Bỏ dòng "Lễ tân phục vụ" trong đánh giá.</li>
  </ul>
</details>

<details>
  <summary>Phiên bản 0.4.0</summary>
  <div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic;">📅 Cập nhật: 24/11/2026</div>
  <ul>
    <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Thông tin khách sạn - Quản lý:</b> Khi chưa mua lại khách sạn, tab Quản lý hiện ổ khóa giống bên Thông tin nhân viên. Bổ sung đủ ô chỉnh giá cho cả 5 loại phòng (Đơn, Đôi, VIP, Lãng Mạn, Tổng Thống). Lưu xong thì bảng giá niêm yết ở tab Thông tin cập nhật ngay, giá được lưu lại khi tải game và áp dụng khi tính hóa đơn.</li>
    <li>✅ <b>Mã giảm giá:</b> Ngày bắt đầu và kết thúc mặc định là ngày hiện tại trong game, bấm vào để chỉnh. Có kiểm tra phần trăm giảm, ngày hợp lệ và mã trùng. Tab Thông tin hiển thị chi tiết từng mã (tên mã, % giảm, thời gian áp dụng, trạng thái Đang chạy / Sắp chạy / Hết hạn) kèm nút Xóa mã bất cứ lúc nào.</li>
    <li>✅ <b>Quản lý nhân viên:</b> Tab Quản lý của Thông tin nhân viên hiển thị tên, tuổi, số sao, tốc độ làm việc, ca làm, vị trí, lương và trạng thái. Có thể Đổi ca, Đổi việc (sang vị trí còn chỗ), cho Nghỉ việc (có xác nhận) hoặc gọi nhân viên nghỉ phép đi làm lại. Mỗi vị trí tối đa 4 người (Lễ tân tối đa 2).</li>
    <li>✅ <b>Tuyển dụng:</b> Vị trí chưa có nhân viên có nút Tuyển thêm. Danh sách ứng viên có mức lương, tốc độ và số sao khác nhau (chất lượng cao thì lương thường cao hơn), có thể chọn thuê ca Ngày hoặc ca Đêm và làm mới danh sách.</li>
    <li>✅ <b>Ca làm &amp; tốc độ nhân viên:</b> Ca Ngày làm từ 6h đến 18h, ca Đêm từ 18h đến 6h theo giờ trong game. Tốc độ làm việc quyết định tốc độ di chuyển của nhân viên vệ sinh, dọn phòng và dẫn khách. Danh sách nhân viên được lưu cùng game.</li>
    <li>✅ <b>Ông chủ &amp; Lễ tân:</b> Sau khi mua lại khách sạn, bạn trở thành Chủ khách sạn. Vị trí Lễ tân có 2 chỗ để thuê.</li>
    <li>✅ <b>Lễ tân tự động:</b> Lễ tân đang trong ca tự làm thủ tục cho khách (chào hỏi, loại phòng, thời gian ở, CCCD, báo giá, thanh toán, đưa chìa khóa, gọi nhân viên dẫn khách). Ở Sảnh chính bạn thấy họ tự nói chuyện với khách. Khi mới mở game hoặc khi lễ tân vào ca mà đang có khách chờ thì lễ tân nhận khách ngay. Khi chưa có lễ tân nào trong ca, bạn vẫn tự đón khách như cũ.</li>
    <li>✅ <b>Tài chính của chủ khách sạn:</b> Bạn nhận 100% doanh thu. Tab Sao kê đổi thành Tiền khách sạn và Các khoản chi, hiển thị cả khoản thu và khoản chi. Lương nhân viên được tích lũy mỗi ngày và trả một lần sau mỗi 14 ngày.</li>
    <li>✅ <b>Hệ thống sao mới:</b> Sao khách sạn là trung bình cộng các đánh giá của khách. Khách làm xong thủ tục ở sảnh: đang vui 5 sao, bình thường 4 sao, tức giận 3 sao, bỏ đi vì chờ lâu hoặc hết phòng 1 sao. Đánh giá được ghi khi khách trả phòng.</li>
    <li>✅ <b>Bảng Đánh giá khách hàng:</b> Bấm vào số sao trên màn hình để xem. Mỗi đánh giá có avatar và tên của khách đại diện, số sao, nội dung, nút Like / Dislike và ô phản hồi. Phản hồi an ủi, xin lỗi khiến khách cảm ơn và tăng sao, phản hồi thô lỗ khiến khách giảm sao (mỗi đánh giá sửa được một lần). Khách trả lời sau 5 phút trong game, nội dung câu trả lời phụ thuộc vào lý do đánh giá và ý trong phản hồi của bạn.</li>
    <li>✅ <b>Sao cho nhân viên lễ tân:</b> Mỗi đánh giá lưu lễ tân đã phục vụ. Sao của lễ tân là trung bình giữa sao ban đầu và các đánh giá của khách (hiện trong thẻ nhân viên), và đổi theo khi khách sửa đánh giá.</li>
    <li>✅ <b>Sao khởi đầu &amp; lượng khách:</b> Khách sạn bắt đầu ở 3 sao (sao = trung bình đánh giá, tính thêm vài lượt đánh giá khởi đầu 3 sao nên không nhảy quá mạnh). Sao càng cao thì khách đến càng đông: 1 sao khoảng 45%, 3 sao 100%, 5 sao khoảng 180% so với mức bình thường. Thông tin khách sạn hiển thị mức lượng khách hiện tại.</li>
    <li>✅ <b>Giá phòng tối đa theo sao:</b> Giá tối đa = giá gốc x (1 + 0.25 x (sao - 1)), tức 1 sao x1.0, 3 sao x1.5, 5 sao x2.0. Tab Quản lý hiển thị mức tối đa hiện tại, cảnh báo ngay khi gõ giá vượt mức và không cho lưu nếu vượt (báo cần bao nhiêu sao). Khi sao giảm, giá vượt mức tối đa mới sẽ tự hạ xuống.</li>
    <li>✅ <b>Yêu cầu sao của nhân viên:</b> Mỗi ứng viên yêu cầu khách sạn đạt số sao tương ứng với số sao của họ. Chưa đạt thì hiện thông báo chưa đạt yêu cầu và không thuê được. Nhân viên đã thuê mà khách sạn tụt dưới mức yêu cầu sẽ báo không hài lòng trước, sau đó mỗi ngày có thể xin nghỉ việc (được trả nốt lương còn nợ).</li>
    <li>✅ <b>Tốc độ game:</b> Sửa lỗi có 2 bộ đếm giờ chạy cùng lúc khiến 1 giây ngoài đời bằng 10 phút trong game. Giờ chỉ còn một bộ đếm: 1 giây ngoài đời = 5 phút trong game (khớp với thời gian khách ở phòng). Khách trả lời phản hồi sau 5 phút trong game, tức khoảng 1 giây ngoài đời.</li>
    <li>✅ <b>Màn hình tải mới:</b> Tải thật toàn bộ file và hình ảnh với thanh tiến trình thật, kiểm tra đủ thành phần rồi mới khởi động game và mở nút BẮT ĐẦU. Nếu thiếu file hoặc file bị lỗi, game báo rõ tên file và có nút Tải lại thay vì chạy lỗi.</li>
    <li>✅ <b>Chia nhỏ mã nguồn:</b> Các file script lớn được chia thành khoảng 30 file nhỏ theo chức năng trong thư mục js/ (core_, rooms_, ui_, system_, draw_), dễ sửa chữa và bảo trì hơn.</li>
    <li>✅ <b>Sửa lỗi:</b> Sửa lỗi khách bị kẹt không sinh thêm khi nhân viên dẫn khách đang bận. Sửa lỗi báo lỗi khi tính giá thuê theo loại. Sửa lỗi không mở được bảng nhân viên sau khi mua khách sạn. Đánh giá không còn ghi "Khách ẩn danh".</li>
  </ul>
</details>
<details>
  <summary>Phiên bản 0.3.8</summary>
  <div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic;">📅 Cập nhật: 23:30 - 15/11/2026</div>
  <ul>
    <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Hệ thống Hồ sơ Khách hàng:</b> Thêm tab Hồ sơ trong Máy tính. Tự động lưu trữ và phân loại lịch sử lưu trú theo từng ngày (Ngày mới nhất nằm trên cùng). Hiển thị chi tiết Tên, Tuổi, CCCD của từng khách trong phòng.</li>
    <li>✅ <b>Lưu trữ Toàn diện:</b> Tất cả dữ liệu của các tab (Sao kê, Nhật ký, Hồ sơ) đều được lưu vào bộ nhớ (Auto-save). Không còn bị mất dữ liệu khi tải lại trang hay thoát game.</li>
    <li>✅ <b>Nâng cấp Nhân viên Dọn phòng:</b> Hỗ trợ 2 nhân viên cùng lúc. Tự động chia việc thông minh, không bao giờ nhận trùng phòng. Có khả năng đi vào bên trong phòng và thay đổi vị trí dọn dẹp (giường, bàn, giữa phòng) mỗi 2 giây.</li>
    <li>✅ <b>Lộ trình Nhân viên Vệ sinh:</b> 2 nhân viên vệ sinh di chuyển theo lộ trình chữ O (từ thang máy đi vòng quanh hành lang) và tự động vào thang máy đổi tầng ngẫu nhiên.</li>
    <li>✅ <b>Hoạt ảnh Dẫn khách hoàn thiện:</b> Khách đi theo hiệu ứng Snake mượt mà. Khi đến cửa, khách tự động xếp thành đội hình (Tam giác/Vuông) và biến mất ngay lập tức khi thông báo "Khách đã vào phòng" xuất hiện.</li>
    <li>✅ <b>Tối ưu & Sửa lỗi:</b> Chặn mở Máy tính/Kệ chìa khóa khi không ở Sảnh chính. Sửa lỗi đồng hồ đếm ngược dọn phòng bị reset. Sửa lỗi thời gian phòng bị nhảy khi tải lại game. Tinh chỉnh tọa độ nhân viên và khách đứng chuẩn xác.</li>
    <li>✅ <b>Tối ưu hóa code:</b> Tách nhỏ file (modular hóa) giúp dễ quản lý và bảo trì, thêm thuộc tính nạp file an toàn.</li>
  </ul>
</details>
<details>
  <summary>Phiên bản 0.3.6 </summary>
  <div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic;">📅 Cập nhật: 00:00 - 12/11/2026</div>
  <ul>
    <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Hệ thống Mở rộng Quy mô:</b> Thêm bảng Mở rộng (Yêu cầu Lv.5). Bao gồm 2 tab: Bên trong (Thông tin khách sạn, Thông tin nhân viên, Mua lại khách sạn) và Bên ngoài (Đang cập nhật). Tự động tạm dừng game khi mở bảng.</li>
    <li>✅ <b>Thông tin Khách sạn:</b> Xem chi tiết Tên, Địa chỉ, Số phòng, Đánh giá, Lưu lượng khách (24h), Bảng giá chi tiết 5 loại phòng và Ưu đãi đoàn đông. Tab Quản lý bị khóa cho đến khi mua lại khách sạn.</li>
    <li>✅ <b>Thông tin Nhân viên:</b> Danh sách 7 chức vụ (Lễ tân, Bảo vệ, Vệ sinh, Dọn phòng, Dẫn khách, Quản lý, Chủ khách sạn). Hiển thị Tên, Tuổi, Số lượng và Trạng thái (🟢 Đang làm việc / 🔴 Đang nghỉ).</li>
    <li>✅ <b>Mua lại Khách sạn:</b> Tính năng mua lại Sunrise Hotel với giá 1 tỷ 300 triệu. Mở khóa toàn bộ tính năng Quản lý và thay đổi giao diện nút Mua thành "Bạn đã sở hữu khách sạn" màu vàng hoàng gia.</li>
    <li>✅ <b>Hoạt ảnh Nhân viên:</b> Nhân viên Bảo vệ đứng ở Tầng hầm. Nhân viên Vệ sinh đi lại dọc hành lang. Nhân viên Dọn phòng tự động đi từ thang máy đến phòng cần dọn (chờ 3s, dọn 10s).</li>
    <li>✅ <b>Dẫn khách lên phòng:</b> Khách sau khi nhận phòng sẽ được nhân viên dẫn khách đưa lên đúng tầng. Khách đi nối đuôi phía sau nhân viên theo đội hình (1, 2, 3, 4 người), di chuyển mượt mà từ thang máy đến cửa phòng.</li>
    <li>✅ <b>Tối ưu hóa:</b> Sửa lỗi tạm dừng game bị bù thời gian sai, lỗi thời gian nhảy vọt khi mở bảng Mở rộng. Thanh thời gian trong phòng giữ nguyên vị trí khi tạm dừng. Tăng tốc độ xử lý và cập nhật Toast thông báo.</li>
  </ul>
</details>
<details>
  <summary>Phiên bản 0.3.3 </summary>
  <div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic;">📅 Cập nhật: 23:00 - 08/11/2026</div>
  <ul>
    <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Hệ thống Cài đặt & Âm thanh:</b> Thêm nút Cài đặt (⚙️). Cho phép tùy chỉnh âm lượng Nhạc nền (BGM) và Hiệu ứng (SFX). Tự động tạm dừng toàn bộ game (đồng hồ, khách, đếm ngược) khi mở Cài đặt.</li>
    <li>✅ <b>Hệ thống Level & Đánh giá:</b> Thêm thanh kinh nghiệm (EXP) và cấp độ (Level). Tích lũy EXP khi đón khách để thăng cấp. Khách bỏ đi hoặc dọn phòng trễ sẽ bị trừ điểm đánh giá (Rating).</li>
    <li>✅ <b>Hệ thống Kiên nhẫn:</b> Khách ở quầy có vòng tròn đếm ngược 90s (Mặt cười 😁 -> 🙂 -> 😡). Hết giờ khách bỏ đi và trừ 1 sao.</li>
    <li>✅ <b>Dọn phòng khẩn cấp:</b> Phòng khách trả sẽ có vòng tròn đếm ngược 60s. Chạm vào để dọn ngay (được +0.1 sao). Nếu để hết 60s, phòng tự động dọn nhưng bị trừ 0.2 sao.</li>
    <li>✅ <b>Lưu & Khôi phục nâng cao:</b> Tự động lưu (Auto-save) sau mỗi 10 giây và khi tắt tab. Hệ thống Sao lưu/Khôi phục bằng Mã Code (Base64) cho phép chuyển dữ liệu sang máy khác. Hỗ trợ khôi phục 3 ngày gần nhất trong game.</li>
    <li>✅ <b>Menu chính nâng cấp:</b> Hiển thị thông tin người chơi (Tên, Lv, Giờ, Ngày) ngay tại Menu. Thêm nút "Khôi phục dữ liệu" nhanh.</li>
    <li>✅ <b>Nút Mở rộng:</b> Thêm nút chức năng mới ở thanh điều hướng, tự động khóa (Yêu cầu Lv.5) và mở khóa khi đạt đủ cấp độ.</li>
    <li>✅ <b>Tối ưu hóa:</b> Sửa lỗi hiển thị thời gian, đồng bộ giờ game vào Sao kê, tự động tải lại trang khi khôi phục dữ liệu, và thay thế các hộp thoại mặc định bằng giao diện thông báo đẹp mắt.</li>
  </ul>
</details>
<details>
  <summary>Phiên bản 0.2.8</summary>
  <div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic;">📅 Cập nhật: 01:30 - 08/11/2026</div>
  <ul>
    <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Hệ thống thu tiền mặt và mã qr:</b> Thêm Két sắt dưới màn hình máy tính. Hỗ trợ 9 mệnh giá tiền (từ 1k đến 500k) để tính toán tiền thối cho khách.</li>
    <li>✅ <b>Logic thối tiền thông minh:</b> Khách có thể đưa vừa đủ hoặc dư tiền. Hệ thống hiển thị rõ "Còn thiếu" và tự động mở khóa nút "Thanh toán" ngay khi số tiền thối bằng 0.</li>
    <li>✅ <b>Luồng thanh toán chuẩn xác:</b> Quy trình chặt chẽ: Hội thoại -> Đăng ký -> Đối chiếu -> Xuất Bill -> Đưa khách -> Thanh toán (Tiền mặt/QR) -> Nhận phòng.</li>
    <li>✅ <b>Sửa lỗi Sao kê:</b> Số tiền trong tab Sao kê đã khớp 100% với Thành tiền trên Hóa đơn (bao gồm VAT). Thời gian ghi nhận cũng đã chuyển sang dùng giờ trong game.</li>
    <li>✅ <b>Tối ưu giao diện Nhận phòng:</b> Đã xóa bỏ mục chọn hình thức thuê thừa thãi trong Kệ chìa khóa. Nút "Nhận phòng" tự động mở khóa sau khi thanh toán thành công.</li>
    <li>✅ <b>Xưng hô tự động:</b> Sửa lỗi khách đi theo đoàn tự động xưng "Chúng tôi", khách đi lẻ xưng "Anh/Chị/Em" chuẩn xác theo ngữ cảnh.</li>
    <li>✅ <b>Hiệu ứng & Trải nghiệm:</b> Khung hội thoại tự động đóng sau 1 giây khi nhận phòng xong. Khung thông báo (Toast) luôn hiển thị trên cùng (không bị che khuất).</li>
  </ul>
</details>
      <details>
  <summary>Phiên bản 0.2.6 </summary>
  <div style="font-size: 11px; color: #888; margin-bottom: 8px; font-style: italic;">📅 Cập nhật: 20:00 - 05/11/2026</div>
  <ul>
  <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Quản lý đoàn khách:</b> Hỗ trợ đoàn từ 1 đến 4 người, có cả người lớn và trẻ em (tự động khóa ô CCCD nếu dưới 18 tuổi).</li>
    <li>✅ <b>Giao diện Đăng ký mới:</b> Tự động hiển thị form tương ứng (1, 2, 3, 4 người) với đầy đủ thông tin Tên - Tuổi - CCCD.</li>
    <li>✅ <b>Hình ảnh chân thực:</b> Khách hàng hiển thị bằng hình ảnh chân dung, tự động thay đổi kích thước và vị trí theo số lượng người.</li>
    <li>✅ <b>Hoạt động trong phòng:</b> Khách có thể nằm chung giường, quây quần ở bàn làm việc hoặc ngồi trò chuyện giữa phòng.</li>
    <li>✅ <b>Bảng giá mới:</b> Áp dụng chiết khấu cho đoàn đông (2 người giảm 10%, 3 người giảm 20%, 4 người giảm 30%).</li>
    <li>✅ <b>Hóa đơn tối giản:</b> Lược bỏ tên khách hàng trên Bill, chỉ hiển thị thông tin phòng và chi phí.</li>
  </ul>
</details>


      <details>
  <summary>Phiên bản 0.2.5</summary>
  <ul>
  <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Quy trình Check-in chuyên nghiệp:</b> Khách tự động hỏi đáp, thu thập Tên, CCCD, Tuổi và thời gian lưu trú.</li>
    <li>✅ <b>Thời gian thực tế:</b> Khách thuê qua đêm (chỉ từ 18h-23h) sẽ tự động trả phòng lúc 7h sáng hôm sau.</li>
    <li>✅ <b>Tính tiền tự động:</b> Tự động áp dụng giá theo giờ/ngày/qua đêm, giảm 30% cho khách đi đôi, cộng 10% VAT.</li>
    <li>✅ <b>Hóa đơn (Bill) chi tiết:</b> Xuất hóa đơn rõ ràng trước khi thanh toán.</li>
    <li>✅ <b>Nhật ký hoạt động:</b> Tab Nhật ký ghi lại chính xác thời gian nhận và trả phòng của từng phòng.</li>
    <li>✅ <b>Giao diện Máy tính thông minh:</b> Tự động ẩn/hiện thanh Tab và Khung "Khách đã nói" tùy theo ngữ cảnh (Đăng ký hay xem Sơ đồ).</li>
    <li>✅ <b>Tối ưu hóa:</b> Sửa lỗi văng khung, lỗi nút bấm và tự động reset form sau khi nhận phòng thành công.</li>
  </ul>
</details>


      <details>
  <summary>Phiên bản 0.2.2 </summary>
  <ul>
  <li><b>Tất cả được tóm tắt bởi A.I</b></li>
    <li>✅ <b>Quy trình Check-in mới:</b> Khách tự động bắt đầu hội thoại, hỏi tên, CCCD, số tuổi và thời gian lưu trú.</li>
    <li>✅ <b>Giao diện Máy tính:</b> Chia làm 2 cột (bên trái tóm tắt khách nói, bên phải là form đăng ký).</li>
    <li>✅ <b>Tự động điền phòng:</b> Hệ thống tự quét và điền số phòng trống phù hợp với yêu cầu của khách.</li>
    <li>✅ <b>Hóa đơn chi tiết:</b> Xuất Bill có đầy đủ Tiền phòng, Thuế VAT 10%, và Thành tiền.</li>
    <li>✅ <b>Thanh toán & Nhận phòng:</b> Thanh toán xong tự động mở Kệ chìa khóa, ô phòng trên Bill tự động phát sáng.</li>
    <li>✅ <b>Thời gian thực tế:</b> Khách ở đúng số giờ đã thỏa thuận (1 giây thực = 5 phút game).</li>
    <li>✅ <b>Chống spam:</b> Nút hội thoại tự động khóa và hiện chữ "Vui lòng chờ..." khi khách đang suy nghĩ.</li>
    <li>✅ <b>Tối ưu hóa:</b> Tự động reset form đăng ký, đóng các bảng khi nhận phòng xong để đón khách mới.</li>
  </ul>
</details>
      <details>
        <summary>Phiên bản 0.2.0 </summary>
        <ul>
        <li><b>Tất cả được tóm tắt bởi A.I</b></li>
          <li>✅ <b>Hệ thống khách hàng:</b> Khách đơn và khách đôi (2 người).</li>
          <li>✅ <b>Đa dạng ngoại hình:</b> Khách có màu da, kiểu tóc và màu áo ngẫu nhiên.</li>
          <li>✅ <b>Tên tiếng Việt:</b> Kho tên phong phú (Họ, tên đệm, tên chính).</li>
          <li>✅ <b>Hội thoại thông minh:</b> Khách đi 1 mình xưng "tôi", đi 2 người xưng "chúng tôi".</li>
          <li>✅ <b>Yêu cầu phòng:</b> Khách đơn chọn mọi phòng, khách đôi không chọn phòng đơn.</li>
          <li>✅ <b>Gói cước:</b> Chọn thuê theo giờ, qua đêm, hoặc dài hạn. Giá tự động áp dụng.</li>
          <li>✅ <b>Giá 2 người:</b> Tự động nhân 2 và giảm 30%.</li>
          <li>✅ <b>Đăng ký khách:</b> Nhập thông tin khách ở tab Đăng ký trên Máy tính.</li>
          <li>✅ <b>Hiệu ứng phát sáng:</b> Phòng đúng yêu cầu của khách sẽ phát sáng xanh.</li>
          <li>✅ <b>Chu kỳ lưu trú:</b> Khách ở 30 giây, có thanh đếm ngược thời gian trả phòng.</li>
          <li>✅ <b>Trạng thái phòng:</b> Trống (Trắng) -> Có khách (Xanh lá) -> Cần dọn (Vàng).</li>
          <li>✅ <b>Chuyển động:</b> Khách trong phòng tự động đổi vị trí sau mỗi 5 giây.</li>
          <li>✅ <b>Dọn phòng:</b> Bấm vào phòng "Cần dọn" để dọn dẹp và đón khách mới.</li>
          <li>✅ <b>Hệ thống thời gian:</b> Đồng hồ chạy, lịch vạn niên, ngày lễ tô đỏ.</li>
        </ul>
      </details>

      <!-- CÁC PHIÊN BẢN CŨ -->
      <details>
        <summary>Phiên bản 0.1.4</summary>
        <ul>
        <li><b>Tất cả được tóm tắt bởi A.I</b></li>
          <li>✅ Cập nhật giao diện Menu chính (thêm Hướng dẫn, Cập nhật).</li>
          <li>✅ Thanh Header hiển thị thông tin: Tên, Level, Tiền VNĐ, Đánh giá 5 sao.</li>
          <li>✅ Thêm tab <b>Sao kê</b> vào Máy tính để xem lịch sử giao dịch.</li>
          <li>✅ Tính năng nhận phòng: Khách sạn thu 100%, người chơi nhận 40% hoa hồng.</li>
          <li>✅ Sơ đồ 30 phòng chia 6 cột (từ Tầng 2 đến Tầng 6).</li>
        </ul>
      </details>

      <details>
        <summary>Phiên bản 0.1.3</summary>
        <ul>
        <li><b>Tất cả được tóm tắt bởi A.I</b></li>
          <li>✅ Hoàn thiện Giao diện chính (Menu, Header).</li>
          <li>✅ Thêm hệ thống Thang máy (Sảnh, 5 tầng phòng).</li>
          <li>✅ Thêm bảng Thông tin cá nhân (có thể đổi tên).</li>
          <li>✅ Vẽ sơ đồ hành lang từ trên xuống cho từng loại phòng.</li>
        </ul>
      </details>

      <details>
        <summary>Phiên bản 0.1.2</summary>
        <ul>
        <li><b>Tất cả được tóm tắt bởi A.I</b></li>
          <li>✅ Chia file thành 3 phần (HTML, CSS, JS) để dễ quản lý.</li>
          <li>✅ Sửa lỗi giao diện bị kéo dài.</li>
          <li>✅ Cập nhật lại bức tường trắng và cửa kính nhìn ra thành phố.</li>
        </ul>
      </details>

      <details>
        <summary>Phiên bản 0.1.1 (Bản khởi đầu)</summary>
        <ul>
        <li><b>Tất cả được tóm tắt bởi A.I</b></li>
          <li>✅ Tạo dựng khung game cơ bản.</li>
          <li>✅ Vẽ cảnh Sảnh chính và Quầy lễ tân đơn giản.</li>
          <li>✅ Thêm nút tương tác cơ bản (Máy tính, Kệ chìa khóa).</li>
          <li>✅ Tạo tủ chìa khóa hiển thị danh sách 30 phòng.</li>
        </ul>
      </details>
    </div>
  `;
  document.getElementById('guidePanel').classList.add('show');
}