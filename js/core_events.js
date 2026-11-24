// ==========================================
// LÕI GAME: sự kiện cửa sổ
// ==========================================
updateClockUI();
window.addEventListener('resize', resizeAll);
window.addEventListener('orientationchange', () => setTimeout(resizeAll, 200));
