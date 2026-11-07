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
  <summary>Phiên bản 0.2.8 (Mới nhất)</summary>
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
      <details open>
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


      <details open>
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


      <details open>
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
      <details open>
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