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
canvas.addEventListener("mousemove", mouseHandler);
addEventListener("DOMContentLoaded", onLoadPage);
pause.addEventListener("click", pauseGame);
//kich thuoc board
let boardWidth = 90;
const boardHeight = 15;
const boardMarginBottom = 30;
//audio
const sounds= {
    ballHitBrick: new Audio("sounds/brick.mp3"),
    ballHitBoard: new Audio("sounds/brick.mp3"),
    gameStart: new Audio("sounds/brick.mp3"),
    gameFinish: new Audio("sounds/game-over.mp3"),
    nextLevel: new Audio("sounds/level-up.mp3"),
    brickCrack: new Audio("sounds/brick_hit.mp3"), //Sound Effect from pixapay
    pauseGameSound: new Audio("sounds/pause.mp3"), //Sound Effect from pixapay
    onLoadSound: new Audio("sounds/game_start.mp3"), //Sound Effect from pixapay
};
let game = {
    requestId: null,//ID của yêu cầu animation frame
    hearts: 3,//lượt chơi
    speed: 10,//tốc độ
    score: 0,//điểm
    scoreGain: 5,// số điểm đạt sau lần va chạm
    level: 1,
    timeoutId: null,
    paused: false,

    startPrizeScore: 100,// điểm bắt đầu có phần thưởng
    startPrizeSwitch: "false", //phần thưởng được bật hay tắt
    incrementPrizeSwitch: "false", // tăng thưởng
    prizeIncr: 50,// số điểm tăng mỗi khi xuất hiện thưởng

    boardTimeOut: null,

    music: true,
    sfx: true,
};
const board = {
    x: canvas.width / 2 - boardWidth / 2,
    y: canvas.height - boardHeight - boardMarginBottom,
    width: boardWidth,
    height: boardHeight,
};
let brick = {
    row: 4,
    column: 12,
    brickFinished: false,
    brickHits: 0, //Số lượng va chạm tối đa có thể chịu được cho mỗi viên gạch
    width: 60,
    height: 20,
    offsetLeft: 30,
    offsetTop: 20,
    marginTop: 40,
};
// thông tin phần thưởng
let imageLoot = {
    imageX: 0,
    imageY: 0,
    prize: "",
};
const ball = {
    x: canvas.width / 2,
    y: board.y - radiusBall,
    radius: radiusBall,
    dx: game.speed * (Math.random() * 2 - 1),
    dy: -game.speed,
};
const radiusBall = 10;
function resetGame() {
    game.hearts = 3;
    game.requestId = null;
    game.score = 0;
    game.level = 1;
    game.paused = false;
    game.innerText = "Pause";
    game.startPrizeSwitch = false;
    game.incrementPrizeSwitch = false;
    game.prizeIncr = 10;
}
function resetBricks() {
    brick.brickFinished = false;
    brick.brickHits = 0;
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
let bricks = []; // 2d array of bricks

//tạo ra viên gạch
//status = 1: gạch bị nứt
// status = 2: gạch có thể phá vỡ
// status = 3: gạch ko thể phá vỡ
function createBricks() {
    for (let r = 0; r < brick.row; r++) {
        brick[r] = [];
        for (let c = 0; c < brick.column; c++) {
            if((r == 3 && c == 3) ||
            (r == 3 && c == 8) ||
            (r == 1 && c == 2) ||
            (r == 2 && c == 10)) {
                brick[r][c] = {
                    x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
                    y: r * (brick.offsetTop + brick.height) +
                        brick.offsetTop +
                        brick.marginTop,
                    status: 3,
                };
            }else {
                bricks[r][c] = {
                    x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
                    y:
                        r * (brick.offsetTop + brick.height) +
                        brick.offsetTop +
                        brick.marginTop,
                    status: 2,
                };
            }
        }
    }
}
createBricks();
function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status === 3) {
                pen.beginPath();
                pen.fillStyle = "#ebd1d5";
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
function drawBoard() {
    pen.beginPath();
    pen.fillStyle = "#3c6e71";
    pen.strokeStyle = "#284b63";
    // pen.lineWidth = "2";
    pen.rect(board.x, board.y, board.width, board.height);
    pen.fill();
    pen.stroke();
}
function drawScore() {
    pen.font = "24px ArcadeClassic";
    pen.fillStyle = "rgb(59, 99, 230)";
    //destructure score from game object
    const { score} = game;
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
function ballWall() {
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        ball.y = ball.radius;
    }
    if (ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        ball.x = ball.radius;
    }
    if (ball.x + ball.radius * 2 > canvas.width) {
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
    )
    {
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
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}
function onLoadPage() {
    pauseAllSounds();
    resetGame();
    createBricks();
    resetBoard();
    paint();
    pen.font = "50px ArcadeClassic";
    pen.fillStyle = "Lime";
    pen.fillText("START GAME", canvas.width / 2 - 120, canvas.height / 2);

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

// }
    function play() {
        pauseAllSounds();
        sounds.onLoadSound.play();
        clearTimeout(game.timeoutId);
        cancelAnimationFrame(game.requestId);
        sounds.gameStart.play();
        resetGame();
        resetBall();
        resetBoard();
        createBricks();
        // ggame.sfx && sounds.breakout.play();
        // Start music after starting sound ends.
        setTimeout(() => game.music && sounds.music.play(), 2000);
        loop();

    }

    function pauseGame(e) {
        //thay đổi giá tri
        game.paused = game.paused === false ? true : false;
        pause.innerText = pause.innerText === "Resume" ? "Pause" : "Resume";
        pauseAllSounds();
        sounds.pauseGameSound.play();
        loop();
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

            //this check if the level or game is over, then break from animate()
            if (isLevelCompleted() || isGameOver()) return;

            game.requestId = requestAnimationFrame(loop);
        }
    }

    function gameOver() {
        let highestScore = getHighestScore();

        pen.font = "50px Verdana";
        pen.fillStyle = "red";
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

//random phần thưởng
    let lootArray = [];

    function randomPrize() {
        let prizeOptions = ["heart", "board"];
        let randomPrize =
            prizeOptions[Math.floor(Math.random() * prizeOptions.length)];

        return randomPrize;
    }

//vẽ các phần thưởng
    function drawLoot() {
        lootArray.forEach((obj) => {
            if (obj.prize === "heart") {
                pen.drawImage(heartImage, obj.imageX, obj.imageY, 20, 20);
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

// xđ để xem khi nào phần thường xuất hiện
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

    function lootBoard() {
        lootArray.forEach((obj) => {
            if (obj.imageY == board.y) {
                if (obj.prize == "heart") {
                    increaseHarts();
                    lootArray.splice(lootArray.indexOf(obj), 1);
                } else if (obj.prize == "board") {
                    increaseBoardWidth();
                    lootArray.splice(lootArray.indexOf(obj), 1);
                }
            }
        });
    }

    function increaseHarts() {
        // increase game.hearts
        game.hearts++;
    }

    function increaseBoardWidth() {
        if (board.width === 90) {
            board.width = 160;
            setTimeout(() => {
                board.width = 90;
            }, 15000);
        }
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

    function isGameOver() {
        if (game.hearts === 0) {
            pauseAllSounds();
            sounds.gameFinish.play();
            game.speed = 5;

            drawLives();
            gameOver();
            return true;
        }
    }

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
            lootArray.splice(0, lootArray.length);

            brick.brickFinished = true;

            pen.drawImage(image, 0, 0);
            initNextLevel();
            // sounds.nextLevel.play();
            resetBall();
            resetBoard();
            resetBricks();

            createBricks();
            game.timeoutId = setTimeout(() => {
                loop();
                sounds.nextLevel.play();
            }, 3000);

            return true;
        }
        return false;
    }

    function initNextLevel() {

        game.level++;
        game.speed++;

        pen.font = "50px ArcadeClassic";
        pen.fillStyle = "yellow";
        pen.fillText(
            `LEVEL ${game.level}!`,
            canvas.width / 2 - 80,
            canvas.height / 2
        );
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
            //init highestScore,
            highestScore = 0;
        } else {
            //get the old score to increment on
            highestScore = JSON.parse(localStorage.getItem("highestScore"));
        }
        //check if newScore is greater
        if (newScore > highestScore) {
            highestScore = newScore;
        }
        //update local storage
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
}



























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