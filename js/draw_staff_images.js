// ==========================================
// HÌNH ẢNH NHÂN VIÊN
// ==========================================
// ==========================================
// FILE XỬ LÝ HÌNH ẢNH VÀ HOẠT ẢNH NHÂN VIÊN
// ==========================================

const staffImages = {
  baoVe_Nam: new Image(), 
  danKhach_Nam: new Image(), 
  danKhach_Nu: new Image(),
  donPhong_Nam: new Image(), 
  donPhong_Nu: new Image(),
  veSinh_Nam: new Image(), 
  veSinh_Nu: new Image()
};

staffImages.baoVe_Nam.src = 'staff/namnvbaove.png';
staffImages.danKhach_Nam.src = 'staff/namnvdankhach.png';
staffImages.danKhach_Nu.src = 'staff/nunvdankhach.png';
staffImages.donPhong_Nam.src = 'staff/namnvdonphong.png';
staffImages.donPhong_Nu.src = 'staff/nunvdonphong.png';
staffImages.veSinh_Nam.src = 'staff/namnvvesinh.png';
staffImages.veSinh_Nu.src = 'staff/nunvvesinh.png';

function isImageReady(img) {
  return img && img.complete && img.naturalWidth !== 0;
}
