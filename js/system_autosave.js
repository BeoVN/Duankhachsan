// ==========================================
// HỆ THỐNG: tự động lưu
// ==========================================
setInterval(autoSaveGame, 10000);
window.addEventListener('beforeunload', () => { autoSaveGame(); });
