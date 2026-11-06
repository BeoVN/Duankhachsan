// Khai báo tất cả hình ảnh
const imgNam8 = new Image(); imgNam8.src = 'art/nam8bth1.png';
const imgNam18 = new Image(); imgNam18.src = 'art/nam18bth1.png';
const imgNam28 = new Image(); imgNam28.src = 'art/nam28bth.png';
const imgNam38 = new Image(); imgNam38.src = 'art/nam38bth.png';

const imgNu8 = new Image(); imgNu8.src = 'art/nu8bth.png';
const imgNu18 = new Image(); imgNu18.src = 'art/nu18bth.png';
const imgNu28 = new Image(); imgNu28.src = 'art/nu28bth.png';
const imgNu38 = new Image(); imgNu38.src = 'art/nu38bth.png';

// Hàm chọn ảnh dựa vào giới tính và độ tuổi
// Hàm chọn ảnh dựa vào giới tính và độ tuổi
function getGuestImage(person) {
  const age = person.age || 20; 
  
  if (person.isMale) {
    if (age >= 6 && age <= 13) return imgNam8;
    if (age >= 14 && age <= 23) return imgNam18;
    if (age >= 24 && age <= 33) return imgNam28;
    return imgNam38; // Từ 34 tuổi trở lên
  } else {
    if (age >= 6 && age <= 13) return imgNu8;
    if (age >= 14 && age <= 23) return imgNu18;
    if (age >= 24 && age <= 33) return imgNu28;
    return imgNu38; // Từ 34 tuổi trở lên
  }
}

// Hàm vẽ khách ở quầy (Không viền, kích thước vuông vức)
function drawGuestAtReception(x, y, person) {
  const imgToDraw = getGuestImage(person);
  
  const imgWidth = 200; 
  const imgHeight = 200; // Sửa thành 100 để ảnh không bị méo
  
  ctx.drawImage(imgToDraw, x - (imgWidth / 2) - 30, y - 140, imgWidth, imgHeight);
}

// Hàm vẽ khách trong phòng (Kích thước nhỏ)
function drawGuestInRoom(cx, cy, person) {
  const imgToDraw = getGuestImage(person);
  
  const imgWidth = 60; 
  const imgHeight = 60;
  
  ctx.drawImage(imgToDraw, cx - (imgWidth / 2), cy - (imgHeight / 2), imgWidth, imgHeight);
}