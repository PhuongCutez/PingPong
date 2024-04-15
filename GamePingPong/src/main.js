/* 21130488 - Lại Thị Bích Phương*/
const levels = {
    '1': {
        'speed': 8, 'unDefeatBrick': 0, 'mineRate': 0, 'torch': 0, 'row': 2
    }, '2': {
        'speed': 8, 'unDefeatBrick': 10, 'mineRate': 0, 'torch': 0, 'row': 3
    }, '3': {
        'speed': 8, 'unDefeatBrick': 15, 'mineRate': 0.25, 'torch': 0, 'row': 4
    }, '4': {
        'speed': 7, 'unDefeatBrick': 5, 'mineRate': 0.3, 'torch': 3, 'row': 4
    }, '5': {
        'speed': 14, 'unDefeatBrick': 5, 'mineRate': 0.4, 'torch': 5, 'row': 5
    }, '6': {
        'speed': 8, 'unDefeatBrick': 5, 'mineRate': 0.4, 'torch': 5, 'row': 5
    }
}

let currentLevel = 1;
let gameOver = false;
let spiderDirection = 1;
// biến trạng thái để kiểm tra xem trước đó bóng đã va chạm với nhện hay chưa
let isCollisionWithSpider = false;

const canvas = document.getElementById("canvas");
const pen = canvas.getContext("2d");
// nút tạm ngừng
const pause = document.getElementById("pause-button");
//hinh anh
const image = new Image();
image.src = "images/color.jpg";//background
const BRICK_IMG = new Image();
BRICK_IMG.src = "images/captures.jpg";
const CRACKED_IMG = new Image();
CRACKED_IMG.src = "images/crack.jpg";
const heartImage = new Image();
heartImage.src = "images/hearts.png";
const boardImage = new Image();
boardImage.src = "images/board.png";
const mineImage = new Image();
mineImage.src = "images/mine.png";
const torchImage = new Image();
torchImage.src = "images/torch.png";
const spiderImage = new Image();
spiderImage.src = "images/spider.png";


//kich thuoc board
let boardWidth = 90;
const boardHeight = 15;
const boardMarginBottom = 30;
let rightPressed = false;
let leftPressed = false;
//âm thanh
const sounds = {
    ballHitBrick: new Audio("sounds/brick.mp3"),
    ballHitBoard: new Audio("sounds/brick.mp3"),
    gameStart: new Audio("sounds/brick.mp3"),
    gameFinish: new Audio("sounds/game-over.mp3"),
    nextLevel: new Audio("sounds/level-up.mp3"),
    brickCrack: new Audio("sounds/brick_hit.mp3"),
    pauseGameSound: new Audio("sounds/pause.mp3"),
    onLoadSound: new Audio("sounds/game_start.mp3"),
    brokenBallSound: new Audio("sounds/broken-ball.mp3")
};
document.addEventListener("mousemove", mouseHandler);

addEventListener("DOMContentLoaded", onLoadPage);
pause.addEventListener("click", pauseGame);
let game = {
    requestId: null,
    hearts: 1000,
    speed: 10,
    score: 0,
    scoreGain: 5,
    level: 1,
    timeoutId: null,
    paused: false,
    startPrizeScore: 50,
    startPrizeSwitch: "false",
    incrementPrizeSwitch: "false",
    prizeIncr: 50,
    electricTimeout: null
};

const radiusBall = 10;

const board = {
    x: canvas.width / 2 - boardWidth / 2,
    y: canvas.height - boardHeight - boardMarginBottom,
    width: boardWidth,
    height: boardHeight,
};
let brick = {
    row: 5, column: 9, width: 60, height: 20, offsetLeft: 30, offsetTop: 20, marginTop: 40,
};
const ball = {
    x: canvas.width / 2,
    y: board.y - radiusBall,
    radius: radiusBall,
    dx: game.speed * (Math.random() * 2 - 1),
    dy: -game.speed
};


let spiders = [{
    x: 0, y: 250, speed: 5, width: 70, height: 36
}, {
    x: 150, y: 250, speed: 5, width: 70, height: 36
}]

function onLoadPage(e) {
    pauseAllSounds();
    resetGame();
    createBricks();
    resetBoard();
    paint();
    pen.font = "50px ArcadeClassic";
    pen.fillStyle = "#d91c4e";
    pen.fillText("START GAME", canvas.width / 2 - 120, canvas.height / 2);
}

function pauseGame(e) {
    //thay đổi giá tri
    game.paused = game.paused === false ? true : false;
    pause.innerText = pause.innerText === "Resume" ? "Pause" : "Resume";
    pauseAllSounds();
    sounds.pauseGameSound.play();
    loop();
}

function resetGame() {
    game.hearts = 3;
    game.requestId = null;
    game.score = 0;
    game.level = currentLevel;
    game.paused = false;
    pause.innerText = "Pause";
    game.startPrizeSwitch = false;
    game.incrementPrizeSwitch = false;
    game.prizeIncr = 10;
    gameOver = false;
    // game.electricTimeout = null;
}

let bricks = [];
//tạo ra viên gạch
//status = 1: gạch bị nứt
// status = 2: gạch có thể phá vỡ
// status = 3: gạch ko thể phá vỡ
function createBricks() {
    // tao tat ca cach gach la gach so 2
    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
                y: r * (brick.offsetTop + brick.height) + brick.offsetTop + brick.marginTop,
                status: 2,
            };
        }
    }
    // tao gach khong the pha vo
    let unDefeatBricks = levels[`${game.level}`].unDefeatBrick;
    // so gach khong the pha vo da tao
    let createdUnDefeatBricks = 0;

    while (unDefeatBricks > 0 && createdUnDefeatBricks <= unDefeatBricks) {
        // vi tri cua gach khong the pha huy la ngau nhien
        let c = Math.floor(Math.random() * brick.column);
        let r = Math.floor(Math.random() * brick.row);

        bricks[r][c] = {
            x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
            y: r * (brick.offsetTop + brick.height) + brick.offsetTop + brick.marginTop,
            status: 3,
        };

        // tang so luong gach khong the pha huy da tao
        createdUnDefeatBricks++;
    }
    // tao duoc
    let torches = levels[`${game.level}`].torch;

    let createdTorches = 0;

    while (torches > 0 && createdTorches <= torches) {
        // vi tri cua gach khong the pha huy la ngau nhien
        let c = Math.floor(Math.random() * brick.column);
        let r = Math.floor(Math.random() * brick.row);

        // lo random vao cac o gach thi bo qua
        if (bricks[r][c].status === 3) continue;

        bricks[r][c] = {
            x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
            y: r * (brick.offsetTop + brick.height) + brick.offsetTop + brick.marginTop,
            status: 4,
        };

        // tang so luong duoc
        createdTorches++;
    }

}

//ve cac loai gach
function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status === 3) {
                pen.beginPath();
                pen.fillStyle = "#ebd1d5";
                pen.lineWidth = "2";
                pen.rect(b.x, b.y, brick.width, brick.height);
                pen.fill();
            } else if (b.status === 2) {
                //gạch có thể phá vỡ
                pen.drawImage(BRICK_IMG, b.x, b.y, brick.width, brick.height);
            } else if (b.status === 1) {
                // gạch bị nứt
                pen.drawImage(CRACKED_IMG, b.x, b.y, brick.width, brick.height);
            } else if (b.status === 4) {
                pen.drawImage(torchImage, b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

function drawBall() {
    pen.beginPath();
    pen.fillStyle = "#f0657c";
    pen.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    pen.fill();
    pen.closePath();
}

function resetBoard() {
    board.x = canvas.width / 2 - boardWidth / 2;
    board.y = canvas.height - boardHeight - boardMarginBottom;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = board.y - radiusBall;
    ball.dx = game.speed * (Math.random() * 2 - 1);
    ball.dy = -game.speed;
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

//ktra va chạm với tường
function ballWall() { //xử lý va chạm bên trên
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        ball.y = ball.radius;
    }
    if (ball.x - ball.radius < 0) { // bên trái
        ball.dx = -ball.dx;
        ball.x = ball.radius;
    }
    if (ball.x + ball.radius * 2 > canvas.width) { //phải
        ball.dx = -ball.dx;
        ball.x = canvas.width - 2 * ball.radius;
    }
    if (ball.y > canvas.height) {//rơi xuống dưới
        game.hearts--;
        resetBoard();
        resetBall();
    }
}

//ktra va chạm quả bóng với thanh trượt
function ballBoard() {
    if (ball.y + ball.radius >= board.y && ball.y - ball.radius <= board.y + board.height && ball.x + ball.radius >= board.x && ball.x - ball.radius <= board.x + board.width) {
        let collisionPoint = ball.x - (board.x + board.width / 2); // điểm va chạm
        collisionPoint = collisionPoint / (board.width / 2); // giá trị (-1 0 1)
        let angle = (collisionPoint * Math.PI) / 3; // góc va chạm

        //phát âm thanh khi bóng đi xuống phía dưới thanh hứng
        if (ball.dy > 0) {
            sounds.ballHitBoard.play();
        }

        ball.dx = game.speed * Math.sin(angle);
        ball.dy = -game.speed * Math.cos(angle);
    }
}

// thông tin phần thưởng
let imageLoot = {
    imageX: 0, imageY: 0, prize: "",
};

//random phần thưởng
let lootArray = [];

function randomPrize() {
    let prizeOptions = ["heart", "board"];

    let prizeIndex = 0;
    let randomPrize = '';

    if (game.level >= 3) {
        prizeOptions.push("mine");
        let mineRate = levels[`${game.level}`].mineRate;

        prizeIndex = Math.floor(Math.random() * prizeOptions.length + mineRate) >= 3 ? 2.9 : Math.floor(Math.random() * prizeOptions.length + mineRate);

        randomPrize = prizeOptions[prizeIndex];
    } else {
        prizeIndex = Math.floor(Math.random() * prizeOptions.length);

        randomPrize = prizeOptions[prizeIndex];
    }
    //
    // console.log('random prize: ', randomPrize)
    // console.log('prize options: ', prizeOptions)

    return randomPrize;
    //
    // 0 1 2
    // 0 - 0.99
    // 1 - 1.99
    // 2 - 2.99
    //
    // 3 * 0.67 = 1.82 + 0.25 = 2.07 = 2
}

//vẽ các phần thưởng
function drawLoot() {
    lootArray.forEach((obj) => {
        if (obj.prize === "heart") {
            pen.drawImage(heartImage, obj.imageX, obj.imageY, 30, 30);
            return;
        }
        if (obj.prize === "mine") {
            pen.drawImage(mineImage, obj.imageX, obj.imageY, 30, 30);
        } else {
            pen.drawImage(boardImage, obj.imageX, obj.imageY, 50, 50);
        }
    });
}

// di chuyển
function moveLoot() {
    lootArray.forEach((obj) => {
        if (obj.imageY + 1 > canvas.height) {
            lootArray.splice(lootArray.indexOf(obj), 1);
            // lootArray.splice(index, 1);
        } else {
            obj.imageY++;
        }
    });
}

// kiem tra dieu kien co du de nhan thuong khong
function incrementTrackerSwitch() {
    if (game.score === game.startPrizeScore) {
        return true;
    } else return (game.score - game.startPrizeScore) % game.prizeIncr === 0;
}

// xử lý va chạm giữa bóng và cách viên gach
function ballBrickCollision() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status > 0) { // chưa vỡ
                if (ball.x + ball.radius >= b.x && ball.x - ball.radius <= b.x + brick.width && ball.y + ball.radius >= b.y && ball.y - ball.radius <= b.y + brick.height) {
                    // bong se duy chuyen nguoc lai
                    ball.dy = -ball.dy;
                    if (b.status <= 2) {
                        b.status--;
                        // brick.brickHits++;
                        game.score += game.scoreGain;
                        updateLocalStorageScore(game.score);

                        //khi bắt đầu nhận thưởng
                        if (game.score === game.startPrizeScore && game.startPrizeSwitch === false) {
                            game.startPrizeSwitch = true; // bật phần thưởng
                        }
                    }

                    // sounds
                    if (b.status === 0) {
                        sounds.brickCrack.play();
                    } else {
                        sounds.ballHitBrick.play();
                    }

                    //kiểm tra startPrizeSwitch
                    if (b.status !== 3) {
                        if (game.startPrizeSwitch === true) {
                            let incrementTracker = incrementTrackerSwitch();

                            if (incrementTracker) {
                                game.incrementPrizeSwitch = true;
                                //1)tạo phần thưởng mới
                                let imageLoot = {};
                                imageLoot.prize = randomPrize();
                                // console.log(imageLoot.prize);
                                imageLoot.imageX = b.x;
                                imageLoot.imageY = b.y;
                                lootArray.push(imageLoot);
                            } else {
                                game.incrementPrizeSwitch = false;
                                console.log("no prize");
                            }
                        }
                    }

                    if (b.status === 4) {
                        game.hearts--;
                        sounds.brokenBallSound.play();
                        b.status = 0;
                        setTimeout(() => {
                            resetBoard();
                            resetBall();
                        }, 2000)

                    }
                }
            }
        }
    }
}

// thuong
function lootBoard() {
    lootArray.forEach((obj) => {
        if (obj.imageY === board.y && (obj.imageX >= board.x && obj.imageX <= (board.x + board.width))) {
            if (obj.prize === "heart") {
                increaseHearts();
                lootArray.splice(lootArray.indexOf(obj), 1);
                return;
            }
            if (obj.prize === "board") {
                increaseBoardWidth();
                lootArray.splice(lootArray.indexOf(obj), 1);
            } else {
                decreaseHearts();
                lootArray.splice(lootArray.indexOf(obj), 1);
            }
        }
    });
}

function increaseHearts() {
    game.hearts++;
}

function decreaseHearts() {
    game.hearts--;
}

function increaseBoardWidth() {
    if (board.width === 90) {
        board.width = 160;
        setTimeout(() => {
            board.width = 90;
        }, 15000);
    }
}

function drawBoard() {
    pen.beginPath();
    pen.fillStyle = "#3c6e71";
    pen.strokeStyle = "#284b63";
    // pen.lineWidth = "2";
    pen.rect(board.x, board.y, board.width, board.height);
    pen.fill();
    pen.stroke();
}

function drawBoardLives(x, y) {
    pen.beginPath();
    pen.fillStyle = "#3c6e71";
    pen.strokeStyle = "#284b63";
    // pen.lineWidth = "2";
    pen.rect(x, y, 45, 10);
    pen.fill();
    pen.stroke();
}

function mouseHandler(e) {
    const mouseMovement = e.clientX - canvas.offsetLeft;

    const insideCanvas = () => mouseMovement - board.width / 2 > 0 && mouseMovement + board.width / 2 < canvas.width;

    if (insideCanvas()) {
        if (game.level === 5) board.x = canvas.width - mouseMovement - board.width / 2; else board.x = mouseMovement - board.width / 2;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
//dung nut trai phai de di chuyen tro choi
// khi nhan phim
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        if (game.level === 5) leftPressed = true; else rightPressed = true;

    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        if (game.level === 5) rightPressed = true; else leftPressed = true;
    }


}

//khi tha phim
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        if (game.level === 5) leftPressed = false; else rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        if (game.level === 5) rightPressed = false
        else leftPressed = false;
    }
}

//toc do di chuyen
if (rightPressed) {
    board.x += 15;
} else if (leftPressed) {
    board.x -= 15;
}

function moveBoard() {
    if (rightPressed) {
        board.x = Math.min(board.x + 15, canvas.width - boardWidth);
    } else if (leftPressed) {
        board.x = Math.max(board.x - 15, 0);
    }
}

function loop() {
    clearTimeout(game.timeoutId);
    if (!game.paused) {
        paint();
        moveBall();
        ballWall();
        ballBoard();
        lootBoard();
        moveLoot();
        moveBoard();

        ballBrickCollision();
        if (game.level === 6) collisionWithSpider();

        //kiểm tra xem cấp độ hoặc trò chơi đã kết thúc chưa, sau đó thoát khỏi animate()
        if (isLevelCompleted() || isGameOver()) return;
        game.requestId = requestAnimationFrame(loop);
    }
}

function paint() {
    pen.drawImage(image, 0, 0);

    if (game.level === 6) drawSpider();

    drawBoard();
    drawBall();
    drawBricks();
    drawScore();
    drawLives();

    moveLoot();
    drawLoot();
}

function drawScore() {
    pen.font = "24px ArcadeClassic";
    pen.fillStyle = "rgb(59, 99, 230)";
    //destructure score from game object
    const {score} = game;
    pen.fillText(`Score: ${score}`, canvas.width / 2 - 50, 23);
}

function drawLives() {
    if (game.hearts > 3) {
        console.log("heart > 3")
        console.log("draw lives game hearts: ", game.hearts);
        pen.font = "30px ArcadeClassic";
        pen.fillStyle = "rgb(59, 99, 230)";
        pen.fillText(`${game.hearts}`, canvas.width - 140, 25);

        drawBoardLives(canvas.width - 100, 9);
        return;
    }
    if (game.hearts > 2) {
        drawBoardLives(canvas.width - 150, 9);
    }
    if (game.hearts > 1) {
        drawBoardLives(canvas.width - 100, 9);
    }
    if (game.hearts > 0) {
        drawBoardLives(canvas.width - 50, 9);
    }
    if (game.hearts === 0) {
        pen.drawImage(image, 0, 0);
    }
}

function isGameOver() {
    if (game.hearts === 0) {
        pauseAllSounds();
        sounds.gameFinish.play();
        game.speed = 5;
        drawLives();
        gameOver = true;
    }
    if (gameOver) showGameOver();
    return gameOver;

}

//kiểm tra màn chơi hoàn thành hay chưa
function checkFinished() {
    let levelFinished = true;
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status !== 0 && b.status !== 3) {
                levelFinished = false;
                return levelFinished;
            }
        }
    }
    return levelFinished;
}

function isLevelCompleted() {
    const threshold = checkFinished();

    if (threshold) {
        if (currentLevel <= 5) {
            currentLevel++;
            setLevel(currentLevel);

        }
        return true;
    }
    return false;
}

function setLevel(level) {

    //xoa animationFrame de hien thi thong tin level
    cancelAnimationFrame(game.requestId);
    gameOver = false;

    pauseAllSounds();

    lootArray.splice(0, lootArray.length);

    // brick.brickFinished = true;

    pen.drawImage(image, 0, 0);
    currentLevel = level;
    // hiển thi thong tin level
    initLevel(currentLevel);
    // sounds.nextLevel.play();
    resetGame();
    resetBall();
    resetBoard();
    // resetBricks();

    createBricks();
    game.timeoutId = setTimeout(() => {
        loop();
        sounds.nextLevel.play();
    }, 3000);
}

/**
 * Chuẩn bị cho màn tiếp theo
 */
function initLevel(level) {
    game.level = level;
    game.speed = levels[`${level}`].speed;
    brick.row = levels[`${level}`].row;

// hiển thị thông báo cho cấp độ mới
    pen.font = "50px ArcadeClassic";
    pen.fillStyle = "yellow";
    pen.fillText(`LEVEL ${game.level}!`, canvas.width / 2 - 80, canvas.height / 2);
}

function showGameOver() {
    let highestScore = getHighestScore();

    pen.font = "50px Verdana";
    pen.fillStyle = "#bf1b54";
    pen.fillText("GAME OVER", canvas.width / 2 - 125, canvas.height / 2);
    pen.font = "20px Verdana";
    pen.fillText(`Your score ${game.score}`, canvas.width / 2 - 125, canvas.height / 2 + 60);
    if (highestScore === 0) {
        pen.fillText(`ZERO POINTS !? you still a nobby`, canvas.width / 2 - 125, canvas.height / 2 + 120);
    } else {
        pen.fillText(`Highest score = ${highestScore} `, canvas.width / 2 - 125, canvas.height / 2 + 120);
    }
}

// loop();
function play() {
    // document.removeEventListener("keydown", clickHandler);

    pauseAllSounds();
    sounds.onLoadSound.play();
    clearTimeout(game.timeoutId);
    cancelAnimationFrame(game.requestId);

    sounds.gameStart.play();

    initLevel(currentLevel);
    resetGame();
    resetBall();
    resetBoard();
    createBricks();
    loop();
}

document.addEventListener("keydown", clickHandler);

// click s --> bat dau choi
function clickHandler(e) {
    if (e.key === "s") {
        play();
    }
}


// dừng âm thanh
function pauseAllSounds() {
    sounds.ballHitBrick.currentTime = 0;
    sounds.ballHitBrick.pause();

    sounds.ballHitBoard.currentTime = 0;
    sounds.ballHitBoard.pause();

    sounds.gameStart.currentTime = 0;
    sounds.gameStart.pause();

    sounds.gameFinish.currentTime = 0;
    sounds.gameFinish.pause();

    sounds.nextLevel.currentTime = 0;
    sounds.nextLevel.pause();

    sounds.brickCrack.currentTime = 0;
    sounds.brickCrack.pause();

    sounds.pauseGameSound.currentTime = 0;
    sounds.pauseGameSound.pause();

    sounds.onLoadSound.currentTime = 0;
    sounds.onLoadSound.pause();
}

function updateLocalStorageScore(newScore) {
    let highestScore;
    if (localStorage.getItem("highestScore") === null) {
        highestScore = 0;
    } else {
        highestScore = JSON.parse(localStorage.getItem("highestScore"));
    }
    //ktra newScore có lớn hơn ko
    if (newScore > highestScore) {
        highestScore = newScore;
    }
    localStorage.setItem("highestScore", JSON.stringify(highestScore));
}

function getHighestScore() {
    let currentHighestScore;

    //if no highestScore yet
    if (localStorage.getItem("highestScore") === null) {
        // init highestScore,
        currentHighestScore = 0;
    } else {
        //get the old score to increment on
        currentHighestScore = JSON.parse(localStorage.getItem("highestScore"));
    }
    return currentHighestScore;
}

function drawSpider() {
    spiders.forEach(spider => {
        // Change direction if spider hits the edge
        if (spider.x === 0) {
            spiderDirection = 1;
        } else if (spider.x + spider.width === canvas.width) {
            spiderDirection = -1;
        }
        spider.x += spider.speed * spiderDirection;
        pen.drawImage(spiderImage, spider.x, spider.y, spider.width, spider.height);
    });
}

/**
 * Kiểm tra va chạm giữa bóng và nhện
 */
function collisionWithSpider() {
    // nếu mà trước đó, bóng chưa va chạm với nhện
    // thì kiểm tra hiện tại xem bóng có va chạm với nhện không 
    // cần phải đặt điều kiện này tại vì hàm loop() sẽ gọi lại hàm collisionWithSpider() liên tục 
    // vì loop() là một hàm callback của requestAnimationFrame()
    // nếu không đặt điều kiện này thì sẽ gây ra việc bóng bị trừ mạng liên tục
    // biến trạng thái isCollisionWithSpider sẽ được đặt là false sau khi đặt lại thanh hứng và bóng để đảm bảo mỗi lần va chạm chỉ trừ 1 mạng
    if (!isCollisionWithSpider) {
        console.log('test !isCollisionWithSpider', !isCollisionWithSpider)
        // lặp qua từng con nhện xem bóng có va chạm với nhện nào không
        for (let spider of spiders) {
            if (ball.x >= spider.x && ball.x <= spider.x + spider.width && ball.y >= spider.y && ball.y <= spider.y + spider.height) {
                // nếu hiện tại có va chạm với nhện thì set biến trạng thái isCollisionWithSpider = true
                isCollisionWithSpider = true;
            }

            // nếu mà hiện tại có va chạm thì sẽ trừ mạng đi 1
            // sau đó tiến hành đặt lại board (thanh hứng) và đặt lại bóng
            if (isCollisionWithSpider) {
                game.hearts--;
                console.log('test')

                sounds.brokenBallSound.play();
                resetBoard();
                resetBall();
                // cần set biến trạng thái về false sau khi đã đặt lại bóng và thanh hứng
                // vì nếu không set về false thì sẽ không thể kiểm tra xem bóng đã va chạm với nhện hay chưa
                isCollisionWithSpider = false;
                break;
            }

        }
    }

}

// chon level
const btnNextLvl = document.querySelector('#choose-level');
const lvlInput = document.querySelector('#level-input');
btnNextLvl.addEventListener('click', () => {

    let level = parseInt(lvlInput.value);
    setLevel(level);
    console.log('current level: ', currentLevel);
    console.log('speed: ', game.speed);
})
