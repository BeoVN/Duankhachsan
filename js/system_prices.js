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

    // 3. Cảnh báo theo mức giá tối đa (phụ thuộc số sao khách sạn)
    const currentVal = parseInt(rawValue) || 0;
    const warnEl = document.getElementById('warn' + this.id.replace('price', ''));
    if (warnEl) showPriceCapWarning(this, warnEl, currentVal);
  });
});
