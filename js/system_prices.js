// ==========================================
// HỆ THỐNG: định dạng ô nhập giá
// ==========================================
// --- XỬ LÝ ĐỊNH DẠNG GIÁ VÀ CẢNH BÁO ---
document.querySelectorAll('.price-input').forEach(input => {
  // 1. Điền sẵn giá trị cũ (có dấu chấm)
  const originalVal = parseInt(input.getAttribute('data-original'));
  input.value = originalVal.toLocaleString('vi-VN');

  // 2. Xử lý khi gõ
  input.addEventListener('input', function(e) {
    // Xóa mọi ký tự không phải số
    let rawValue = this.value.replace(/\D/g, '');
    
    // Nếu xóa hết -> Trả về giá gốc
    if (rawValue === '') {
      this.value = originalVal.toLocaleString('vi-VN');
    } else {
      // Định dạng lại có dấu chấm
      this.value = parseInt(rawValue).toLocaleString('vi-VN');
    }

    // 3. Kiểm tra cảnh báo (Giá gấp 2 lần -> Hơi mắc, gấp 3 lần -> Quá mắc)
const currentVal = parseInt(rawValue) || 0;
const warnId = 'warn' + this.id.replace('price', '');
const warnEl = document.getElementById(warnId);

if (warnEl) {
  if (currentVal >= originalVal * 3) {
    warnEl.style.display = 'block';
    warnEl.style.color = '#ef4444'; // Đỏ (Quá mắc)
    warnEl.innerHTML = '⚠️ Giá này quá mắc!';
  } else if (currentVal >= originalVal * 2) {
    warnEl.style.display = 'block';
    warnEl.style.color = '#f59e0b'; // Cam (Hơi mắc)
    warnEl.innerHTML = '⚠️ Giá này hơi mắc so với giá gốc';
  } else {
    warnEl.style.display = 'none';
  }
}
  });
});
