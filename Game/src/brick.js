class Brick{
    constructor(color, x, y){
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 15;
        this.isAlive = true;
    }
    draw () {
        createRect(this.x, this.y, this.width, this.height, this.color)
    }

}