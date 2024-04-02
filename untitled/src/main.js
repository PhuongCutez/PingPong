const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
//tọa độ x,y
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;// hướng di chuyển
let dy = -3;
brick_img.src = "captures.jpg";
const brick_img = new Image();
const interval = setInterval(draw, 10);
const ballRadius = 10;//bán kính của quả bóng
const paddleHeight = 10; // chiều cao của thanh hứng bóng
const paddleWidth = 75; // chiều rộng
let paddleX = (canvas.width - paddleWidth) / 2; //vị trí
//nút điều khiển
let rightPressed = false;
let leftPressed = false;
const brickRowCount = 3;// số lượng hàng
const brickColumnCount = 12; // cột
const brickWidth = 60; // chiều rộng viên gạch
const brickHeight = 20; // chiều cao
const brickPadding = 20; // khoảng cách giữa các viên gạch
// phần bù trên cùng và bên trái để không bắt đầu bị vẽ ngay từ mép của Canvas.
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
let score = 0; // điểm số
let lives = 3; // thêm mạng sống
//mảng chứa các viên gạch
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status:1}; //set trạng thái
    }
}
//xử lý nhấn nút bàn phím
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// xử lý điều khiển chuột
document.addEventListener("mousemove", mouseMoveHandler, false);
// khi nhấn phím
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}
// khi không nhấn
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}
// điều khiển bằng cách duy chuyển chuột
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}
//vẽ quả bóng
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}
// vẽ thanh hứng bóng
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#7ddbda";
    ctx.fill();
    ctx.closePath();
}
// tạo hàm vẽ gạch
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                // vị trí x,y mỗi lần lặp
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.drawImage(brick_img, brickX, brickY, brickWidth, brickHeight);
                // ctx.fillStyle = "#1095DD";
                // ctx.fill();
                ctx.closePath();
            }
        }
    }
}
// kiểm tra va chạm
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) { //status = 1: viên gạch chưa bị va chạm
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {//Nếu tâm của quả bóng nằm trong tọa độ của một trong những viên gạch sẽ thay đổi hướng của quả bóng.
                    dy = -dy;
                    b.status = 0; //bóng va chạm với viên gạch
                    score++;
                    if(score === brickColumnCount*brickRowCount) {
                        alert('YOU WIN, CONGRATULATIONS!!!');
                        document.location.reload();
                        clearInterval(interval);
                    }
                }
            }
        }
    }
}
// tạo cập nhật điểm số
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#a8325c";
    ctx.fillText(`Score: ${score}`, 8, 20);
}
// vẽ mạng sống
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#a8325c";
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function draw() {//chuyển động quả bóng
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();
    //xử lý quả bóng nảy lên từ phía trên, dưới
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) { //nếu quả bòng chạm vào mái chèo -->
            dy = -dy;//bậc ngược ra
        } else {//game over
            lives--;
            if (!lives) {
                alert("GAME OVER");
                document.location.reload();
                clearInterval(interval); // Needed for Chrome to end game
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }
    // xử lý quả bóng nảy ra bên trái và bên phải
    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    // ktra nút nào sẽ được nhấn và di chuyển thanh hứng bóng
    // xử lý ko để thanh hứng bóng biến mất khỏi mép khung khi nhấn 2 phím quá lâu
    if (rightPressed) {
        paddleX = Math.min(paddleX + 4, canvas.width - paddleWidth);
    } else if (leftPressed) {
        paddleX = Math.max(paddleX - 4, 0);
    }
    x += dx;
    y += dy;

}


// function startGame() {
//     const interval = setInterval(draw, 5); //hàm draw sẽ thực hiện sau 10 milliseconds
// }
//
// document.getElementById("runButton").addEventListener("click", function () {
//     startGame();
//     this.disabled = true;
//
// });
