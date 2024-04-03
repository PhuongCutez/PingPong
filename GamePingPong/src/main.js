//21130488 - Lại Thị Bich Phượng
const levels = {
    '1': {
        'speed': 10,
        'unDefeatBrick': 0,
        'mineRate': 0,
    },
    '2': {
        'speed': 11,
        'unDefeatBrick': 3,
        'mineRate': 0,
    },
    '3': {
        'speed': 6,
        'unDefeatBrick': 4,
        'mineRate': 0.25,
    },
    '4': {
        'speed': 13,
        'unDefeatBrick': 5,
        'mineRate': 0.3,
    },
    '5': {
        'speed': 14,
        'unDefeatBrick': 5,
        'mineRate': 0.4,
    }
}

let currentLevel = 1;
let gameOver = false;
let gameComplete = false;

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
const mineImage = new Image()
mineImage.src = "images/mine.png";
//kich thuoc board
let boardWidth = 90;
const boardHeight = 15;
const boardMarginBottom = 30;
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
};
canvas.addEventListener("mousemove", mouseHandler);
addEventListener("DOMContentLoaded", onLoadPage);
pause.addEventListener("click", pauseGame);
let game = {
    requestId: null,
    hearts: 3,
    speed: 10,
    score: 0,
    scoreGain: 5,
    level: 1,
    timeoutId: null,
    paused: false,

    startPrizeScore: 10,
    startPrizeSwitch: "false",
    incrementPrizeSwitch: "false",
    prizeIncr: 50,
};
const radiusBall = 10;

const board = {
    x: canvas.width / 2 - boardWidth / 2,
    y: canvas.height - boardHeight - boardMarginBottom,
    width: boardWidth,
    height: boardHeight,
};
let brick = {
    row: 4,
    column: 9,
    brickFinished: false,
    brickHits: 0, //Số lượng va chạm tối đa có thể chịu được cho mỗi viên gạch
    width: 60,
    height: 20,
    offsetLeft: 30,
    offsetTop: 20,
    marginTop: 40,
};
const ball = {
    x: canvas.width / 2,
    y: board.y - radiusBall,
    radius: radiusBall,
    dx: game.speed * (Math.random() * 2 - 1),
    dy: -game.speed
};

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
    game.startPrizeSwitch = "false";
    game.incrementPrizeSwitch = "false";
    game.prizeIncr = 10;
    gameOver = false;
}

function resetBricks() {
    brick.brickFinished = false;
    brick.brickHits = 0;
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
                y:
                    r * (brick.offsetTop + brick.height) +
                    brick.offsetTop + brick.marginTop,
                status: 2,
            };
        }
    }

    // tao gach khong the pha vo
    let unDefeatBricks = levels[`${game.level}`].unDefeatBrick;

    // so gach khong the pha vo da tao
    let createdUnDefeatBricks = 0;

    while (createdUnDefeatBricks <= unDefeatBricks) {
        // vi tri cua gach khong the pha huy la ngau nhien
        let c = Math.floor(Math.random() * brick.column);
        let r = Math.floor(Math.random() * brick.row);

        bricks[r][c] = {
            x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
            y: r * (brick.offsetTop + brick.height) +
                brick.offsetTop +
                brick.marginTop,
            status: 3,
        };

        // tang so luong gach khong the pha huy da tao
        createdUnDefeatBricks++;
    }
}

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
    if (
        ball.y + ball.radius >= board.y &&
        ball.y - ball.radius <= board.y + board.height &&
        ball.x + ball.radius >= board.x &&
        ball.x - ball.radius <= board.x + board.width
    ) {
        let collisionPoint = ball.x - (board.x + board.width / 2); //điểm va chạm
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
    imageX: 0,
    imageY: 0,
    prize: "",
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

        prizeIndex = Math.floor(Math.random() * prizeOptions.length + mineRate) > 3 ? 2.99 : Math.floor(Math.random() * prizeOptions.length + mineRate);

        randomPrize =
            prizeOptions[prizeIndex];
    } else {
        prizeIndex = Math.floor(Math.random() * prizeOptions.length);

        randomPrize =
            prizeOptions[prizeIndex];
    }

    console.log('random prize: ', randomPrize)
    console.log('prize options: ', prizeOptions)

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
            pen.drawImage(heartImage, obj.imageX, obj.imageY, 20, 20);
        }
        if (obj.prize == "mine") {
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

//kiem tra dieu kien co du de nhan thuong khong
function incrementTrackerSwitch() {
    if (game.score === game.startPrizeScore) {
        return true;
    } else if ((game.score - game.startPrizeScore) % game.prizeIncr === 0) {
        return true;
    } else {
        return false;
    }
}

//xử lý va chạm giữa bóng và cách viên gach
function ballBrickCollision() {
    //in update
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status > 0) { // chưa vỡ
                if (
                    ball.x + ball.radius >= b.x &&
                    ball.x - ball.radius <= b.x + brick.width &&
                    ball.y + ball.radius >= b.y &&
                    ball.y - ball.radius <= b.y + brick.height
                ) {
                    // nếu gạch và bóng chạm nhau
                    ball.dy = -ball.dy;
                    if (b.status <= 2) {
                        b.status--;
                        brick.brickHits++;
                        game.score += game.scoreGain;
                        updateLocalStorageScore(game.score);

                        //khi bắt đầu nhận thưởng
                        if (
                            game.score === game.startPrizeScore &&
                            game.startPrizeSwitch === "false"
                        ) {
                            game.startPrizeSwitch = "true"; // bật phần thưởng
                        }
                    }
                    // sounds
                    if (b.status === 0) {
                        sounds.brickCrack.play();
                    } else {
                        sounds.ballHitBrick.play();
                    }

                    //kiểm tra startPrizeSwitch

                    if (b.status != 3) {
                        if (game.startPrizeSwitch === "true") {
                            let incrementTracker = incrementTrackerSwitch();

                            if (incrementTracker) {
                                game.incrementPrizeSwitch = "true";
                                //1)tạo phần thưởng mới
                                let imageLoot = {};
                                imageLoot.prize = randomPrize();
                                // console.log(imageLoot.prize);
                                imageLoot.imageX = b.x;
                                imageLoot.imageY = b.y;
                                lootArray.push(imageLoot);
                            } else if (!incrementTracker) {
                                game.incrementPrizeSwitch = "false";
                                console.log("no prize");
                            }
                        }
                    }
                }
            }
        }
    }
}

//thuong
function lootBoard() {
    lootArray.forEach((obj) => {
        if (obj.imageY == board.y) {
            if (obj.prize === "heart") {
                increaseHearts();
                lootArray.splice(lootArray.indexOf(obj), 1);
            }
            if (obj.prize === "board") {
                increaseBoardWidth();
                lootArray.splice(lootArray.indexOf(obj), 1);
            } else {
                // decreaseHearts();
                // lootArray.splice(lootArray.indexOf(obj), 1);
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
    const insideCanvas = () =>
        mouseMovement - board.width / 2 > 0 &&
        mouseMovement + board.width / 2 < canvas.width;

    if (insideCanvas()) {
        board.x = mouseMovement - board.width / 2;
    }
}

function loop() {
    clearTimeout(game.timeoutId);
    if (!game.paused) {
        paint();
        moveBall();
        ballWall();
        ballBoard();
        // ballBrick();
        ballBrickCollision();
        lootBoard();
        if (game.startPrizeSwitch) {
            moveLoot();
        }

        //kiểm tra xem cấp độ hoặc trò chơi đã kết thúc chưa, sau đó thoát khỏi animate()
        if (isLevelCompleted() || isGameOver()) return;
        game.requestId = requestAnimationFrame(loop);
    }
}

function paint() {
    pen.drawImage(image, 0, 0);
    drawBoard();
    drawBall();
    drawBricks();
    drawScore();
    drawLives();
    if (game.incrementPrizeSwitch === "true") {
        drawLoot();
        moveLoot();
    }
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
    if (gameOver)
        showGameOver();
    return gameOver;

}

//kiểm tra màn chơi hoàn thành hay chưa
function checkFinished() {
    let levelFinished = true;
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status != 0 && b.status != 3) {
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

    brick.brickFinished = true;

    pen.drawImage(image, 0, 0);
    currentLevel = level;
    // hiển thi thong tin level
    initLevel(currentLevel);
    // sounds.nextLevel.play();
    resetGame();
    resetBall();
    resetBoard();
    resetBricks();

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

    // game.level++;
    // game.speed++;
    // bricks = [];
// hiển thị thông báo cho cấp độ mới
    pen.font = "50px ArcadeClassic";
    pen.fillStyle = "yellow";
    pen.fillText(
        `LEVEL ${game.level}!`,
        canvas.width / 2 - 80,
        canvas.height / 2
    );
}

function showGameOver() {
    let highestScore = getHighestScore();

    pen.font = "50px Verdana";
    pen.fillStyle = "#bf1b54";
    pen.fillText("GAME OVER", canvas.width / 2 - 125, canvas.height / 2);
    pen.font = "20px Verdana";
    pen.fillText(
        `Your score ${game.score}`,
        canvas.width / 2 - 125,
        canvas.height / 2 + 60
    );
    if (highestScore === 0) {
        pen.fillText(
            `ZERO POINTS !? you still a nobby`,
            canvas.width / 2 - 125,
            canvas.height / 2 + 120
        );
    } else {
        pen.fillText(
            `Highest score = ${highestScore} `,
            canvas.width / 2 - 125,
            canvas.height / 2 + 120
        );
    }
}

// loop();
function play() {
    document.removeEventListener("keydown", clickHandler);
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

function clickHandler(e) {
    if (e.key === "s") {
        play();
    }
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

// test
const btnNextLvl = document.querySelector('#choose-level');
const lvlInput = document.querySelector('#level-input');
btnNextLvl.addEventListener('click', () => {

    let level = parseInt(lvlInput.value);
    setLevel(level);
    console.log('current level: ', currentLevel);
    console.log('speed: ', game.speed);
})
