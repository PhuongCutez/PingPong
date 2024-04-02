class Ball {
    constructor(ballx, bally, ballwidth, ballheight, speed) {
        this.ballx = ballx;
        this.bally = bally;
        this.ballwidth = ballwidth;
        this.ballheight = ballheight;
        this.speed = speed;
        this.color = "white";
        this.direction = 90 * 3.1416 / 180;//theo hướng ngang 90 độ
    }
}
class Breaker {
    constructor(breakerx, breakery, breakerwidth, breakerheight, speed) {
        this.breakerx = breakerx;
        this.breakery = breakery;
        this.breakerwidth = breakerwidth;
        this.breakerheight = breakerheight;
        this.speed = speed;
        this.isMoving = false;
        this.direction = 0;
    }
}

class Move(){
        this.ballx += Math.cos(this.direction) * this.speed;
        this.bally -= Math.sin(this.direction) * this.speed;
        this.checkCollision();//kiem tra va cham

    }

    draw () {//vẽ quả bóng
        createRect(this.x, this.y, this.width, this.height, "white")
    }
    //ktra va cham
    checkCollision = () => {
        if (ball.x < 5){
            ball.x = 5;
            ball.direction = 3.1416 - ball.direction;
        } else if (ball.x > 485){
            ball.x = 485;
            ball.direction = 3.1416 - ball.direction;
        } else if (ball.y > 485){
            //rơi bóng
            lives --;//giảm lượt
            ball.x = 250;
            ball.y = 460;
            breaker.x = 210;
            active = false;
        } else if (ball.y < 5){
            ball.y = 5;
            ball.direction = 2 * 3.1416- ball.direction;
        }
        if (ball.y >= 460 && ball.y <= 480 && ball.x > breaker.x && ball.x < breaker.x + breaker.width){
            ball.direction = (((ball.x + ball.width / 2) - (breaker.x + breaker.width / 2)  - 50) / -30);
        }
    }
    increaseSpeed = () =>{
        if (this.speed < 15){
            this.speed+= .05;
        }
    }
