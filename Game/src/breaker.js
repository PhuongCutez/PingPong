
    move(){
        if (this.direction === 0 && this.isMoving && this.x <= 415){
            this.x += this.speed;
            if (this.x > 415){this.x = 415;}
        } else if (this.direction === 180 && this.isMoving && this.x >= 5){
            this.x -= this.speed;
            if (this.x < 5){this.x = 5;}

        }
    }
    draw () {
        createRect(this.x, this.y, this.width, this.height, "white")
    }

}