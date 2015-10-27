function Ship(texture, movingTexture) {
    if (typeof texture === "string") {
        this.stayingTexture = PIXI.Texture.fromImage(texture);
    }
    else {
        this.stayingTexture = texture;
    }
    if (typeof movingTexture === "string") {
        this.flyingTexture = PIXI.Texture.fromImage(movingTexture);
    }
    else {
        this.flyingTexture = movingTexture;
    }
    PIXI.Sprite.call(this, this.stayingTexture);

    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.position.x = Main.WIDTH / 2;
    this.position.y = Main.HEIGHT / 2;
    this.attack = 0.1;
    this.defense = 0.1;
    this.reset();
}

Ship.prototype = Object.create(PIXI.Sprite.prototype);
Ship.constructor = Ship;

Ship.prototype.setNewRotation = function(rotation) {
    this.newRotation = -3.14/2 + rotation;
    if (this.newRotation < - 3.14) {
       this.newRotation += 2*3.14;
    }

    // Possible detection of too big rotation, so we can eventually slow down
    // the ship movement.
    // if (Math.abs(this.newRotation + 2*3.14 - (this.rotation + 2*3.14)) > 3.14/2) {
    //     this.shipRotate = true;
    // }

    this.texture = this.flyingTexture;
};

Ship.prototype.update = function() {
    if (this.newRotation > 0 && this.rotation < 0 && 3.14 - this.newRotation + 3.14 + this.rotation < this.newRotation - this.rotation) {
        this.rotation -= 0.060;
        if (this.newRotation < this.rotation) {
            this.rotation = this.newRotation;
        }
    }
    else if (this.newRotation < 0 && this.rotation > 0 && 3.14 + this.newRotation + 3.14 - this.rotation < this.rotation - this.newRotation) {
        this.rotation += 0.060;
        if (this.newRotation > this.rotation) {
            this.rotation = this.newRotation;
        }
    }
    else if (this.newRotation < this.rotation) {
        this.rotation -= 0.060;
        if (this.newRotation > this.rotation) {
            this.rotation = this.newRotation;
        }
    }
    else if (this.newRotation > this.rotation) {
        this.rotation += 0.060;
        if (this.newRotation < this.rotation) {
            this.rotation = this.newRotation;
        }
    }
    if (this.rotation > 3.14) {
        this.rotation = -3.14;
    }
    else if (this.rotation < -3.14) {
        this.rotation = 3.14;
    }
};

Ship.prototype.reset = function() {
    this.rotation = 0;
    this.newRotation = 0;
    this.speed = 0.9;
    this.fuel = 1000;
};

Ship.prototype.save = function() {
    localStorage.setItem(this.name + ".rotation", this.rotation);
    localStorage.setItem(this.name + ".newRotation", this.newRotation);
    localStorage.setItem(this.name + ".fuel", this.fuel);
};

Ship.prototype.load = function() {
    this.rotation = parseFloat(localStorage.getItem(this.name + ".rotation"));
    this.newRotation = parseFloat(localStorage.getItem(this.name + ".newRotation"));
    this.fuel = parseFloat(localStorage.getItem(this.name + ".fuel"));
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Ship;
    }
}
