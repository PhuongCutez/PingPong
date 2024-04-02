const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
let lives = 3;
let fps = 40;
let breaker;
let ball;
let score = 0;
let level = 1;
let alive_bricks = 0;
let bricks = []
let active = false;

const levels = {
    "level1": [
        "","","","","","",
        "","","","","","",
        "red","red","red","red","red","red",
        "green","green","green","green","green","green",
        "yellow","yellow","yellow","yellow","yellow","yellow",
        "blue","blue","blue","blue","blue","blue",
        "","","","","","",
        "","","","","","",
        ],
    "level2": [
        "","","","","","",
        "","","","","","",
        "","","red","red","","",
        "","green","green","green","green","",
        "yellow","yellow","yellow","yellow","yellow","yellow",
        "blue","blue","blue","blue","blue","blue",
        "","","","","","",
        "","","","","","",
        ],
    "level3": [
        "yellow","yellow","yellow","yellow","yellow","yellow",
        "blue","blue","blue","blue","blue","blue",
        "","green","green","green","green","",
        "","","red","red","","",
        "","","red","red","","",
        "","green","green","green","green","",
        "yellow","yellow","yellow","yellow","yellow","yellow",
        "blue","blue","blue","blue","blue","blue",
        ]
}

let start = () => {
    breaker = new Breaker(210, 470, 80, 10, 10);
    ball = new Ball(250,460, 10, 10, 4);
    createBricks();
}

let createBricks = () => {
    current_level = levels["level" + level];
    bricks = []
    for (let i = 0; i < current_level.length; i++){
        if (current_level[i] !== ""){
            bricks = bricks.concat(new Brick(current_level[i], i%6*70 +40, 30*Math.floor(i/6)));
            alive_bricks++;
        }else {
            bricks = bricks.concat("");
        }
    }
}

let checkBrick = () => {
    for (const brick of bricks) {
        if (brick !== "" && brick.isAlive){
            if(parseInt(ball.x + ball.width) >= parseInt(brick.x) && parseInt(ball.x) <= parseInt(brick.x + brick.width) && parseInt(ball.y + ball.height) >= parseInt(brick.y) && parseInt(ball.y) <= parseInt(brick.y + brick.height)){
                brick.isAlive = false;
                alive_bricks--;
                updateScore(brick.color);
                ball.increaseSpeed();
                if (parseInt(ball.x + ball.width) >= parseInt(brick.x) - 5 && parseInt(ball.x + ball.width) <= parseInt(brick.x) + 1){
                    ball.direction = 3.1416 - ball.direction;
                }
                if (parseInt(ball.y) <= parseInt(brick.y + brick.height) + 1 && parseInt(ball.y) >= parseInt(brick.y + brick.height) - 5){
                    ball.direction = 2 * 3.1416- ball.direction;
                }
                if (parseInt(ball.x) >= parseInt(brick.x + brick.width) - 5 && parseInt(ball.x) <= parseInt(brick.x + brick.width + 1)){
                    ball.direction = 3.1416 - ball.direction;
                }
                if (parseInt(ball.y + ball.height) >= parseInt(brick.y) -5 && parseInt(ball.y + ball.height) <= parseInt(brick.y) +1){
                    ball.direction = 2 * 3.1416- ball.direction;
                }
            }
        }
    }
}

let updateScore = (color) => {
    if (color === "red"){
        score += 20
    } else if (color === "green"){
        score += 15
    } else if (color === "yellow"){
        score += 10
    } else if (color === "blue"){
        score += 5
    }
}

let gameLoop = () => {
    if(lives !== 0 && active){
        update();
        draw();
    } else{
        draw();
        drawBallPath();
    }
};

let drawBallPath = () => {
    createRect(ball.x + 30 * Math.cos(ball.direction), ball.y - 30 * Math.sin(ball.direction), 5, 5, "white");
    createRect(ball.x + 60 * Math.cos(ball.direction), ball.y - 60 * Math.sin(ball.direction), 5, 5, "white");
    createRect(ball.x + 90 * Math.cos(ball.direction), ball.y - 90 * Math.sin(ball.direction), 5, 5, "white");

}


let update = () => {
    breaker.move();
    ball.move();
    checkBrick();
    if (alive_bricks===0){
        level++;
        createBricks();
        reset();
    }
}

let reset = () => {
    ball.x = 250;
    ball.y = 460;
    breaker.x = 210;
    active = false;
    ball.direction = 90 * 3.1416 / 180;
}


let draw = () => {
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    createRect(0,0,canvas.width, canvas.height, "black");
    drawWalls();
    ball.draw();
    breaker.draw();
    drawBricks();
    drawStatus();
}

let drawStatus = () => {
    canvasContext.font = "20px Arial"
    canvasContext.fillStyle = "#21ed86"
    canvasContext.fillText("Score: "+ score, 50, 550);
    canvasContext.fillText("Lives: "+ lives, 200, 550);
    canvasContext.fillText("Level: "+ level, 350, 550);
}

let drawBricks = () => {
    for (const brick of bricks) {
        if (brick !== "" && brick.isAlive){
            brick.draw();
        }
    }
}


let drawWalls = () => {
    createRect(0,0,500,5,"grey");
    createRect(0,0,5,500,"grey");
    createRect(0,495,500,5,"grey");
    createRect(495,0,5,500,"grey");
}

let createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};




start();
let gameInterval = setInterval(gameLoop, 1000 / fps);


window.addEventListener("keydown", (event) => {
    let k = event.keyCode;
    setTimeout(() => {
        if (active){
            if (k === 37 || k === 65) {
                // left arrow or a
                breaker.direction = 180;
                breaker.isMoving = true;
            } else if (k === 39 || k === 68) {
                // right arrow or d
                breaker.direction = 0;
                breaker.isMoving = true;
            }
        }else {
            if (k === 37 || k === 65) {
                // left arrow or a
                ball.direction += .1
                if (ball.direction >=2.8)
                    ball.direction = 2.8;
            } else if (k === 39 || k === 68) {
                // right arrow or d
                ball.direction -= .1
                if (ball.direction <= .3)
                    ball.direction = .3;
            } else if (k === 32){
                active = true;
            }
        }
    }, 1);
});
window.addEventListener("keyup", (event) => {
    let k = event.keyCode;
    setTimeout(() => {
        if (k === 37 || k === 65) {
            // left arrow or a
            breaker.isMoving = false;
        } else if (k === 39 || k === 68) {
            // right arrow or d
            breaker.isMoving = false;
        }
    }, 1);
});




















