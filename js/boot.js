// ==========================================
// KHỞI ĐỘNG GAME
// Được bộ nạp (loader.js) gọi sau khi TẤT CẢ file mã nguồn và hình ảnh đã tải xong
// ==========================================
function bootGame() {
  isGamePaused = false;
  isGameStarted = false;
  initUI();
  updateMenuInfo();
  resizeAll();
}
