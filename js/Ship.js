function Ship() {
    this.stayingTexture = PIXI.Texture.fromImage("resources/ship.png");
    this.flyingTexture = PIXI.Texture.fromImage("resources/ship_moving.png");
    PIXI.Sprite.call(this, this.stayingTexture);

    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.position.x = Main.WIDTH / 2;
    this.position.y = Main.HEIGHT / 2;

    this.reset();
}

Ship.prototype = Object.create(PIXI.Sprite.prototype);

Ship.prototype.timeout = function() {
    this.food -= this.foodPerPoint;
    this.sanity -= this.sanityPerPoint;
    this.updateStats();
}

Ship.prototype.updateStats = function() {
    if (this.fuel < 0) {
        if (this.onOutOfFuel) this.onOutOfFuel();
        this.fuel = 0;
    }
    else if (this.fuelState == 0 && this.fuel < 25) {
        if (this.onLowFuel) this.onLowFuel();
        this.fuelState = 1;
    }
    else if (this.fuelState == 1 && this.fuel > 25) {
        if (this.onNormalFuel) this.onNormalFuel();
        this.fuelState = 0;
    }

    if (this.food < 0) {
        if (this.onOutOfFood) this.onOutOfFood();
        this.food = 0;
    }
    else if (this.foodState == 0 && this.food < 25) {
        if (this.onLowFood) this.onLowFood();
        this.foodState = 1;
    }
    else if (this.foodState == 1 && this.food > 25) {
        if (this.onNormalFood) this.onNormalFood();
        this.foodState = 0;
    }

    if (this.sanity < 0) {
        if (this.onOutOfSanity) this.onOutOfSanity();
        this.sanity = 0;
    }
    else if (this.sanityState == 0 && this.sanity < 25) {
        if (this.onLowSanity) this.onLowSanity();
        this.sanityState = 1;
    }
    else if (this.sanityState == 1 && this.sanity > 25) {
        if (this.onNormalSanity) this.onNormalSanity();
        this.sanityState = 0;
    }
}

Ship.prototype.moved = function() {
    this.fuel -= this.fuelPerPoint;
}

Ship.prototype.setNewRotation = function(rotation) {
    this.newRotation = -3.14/2 + rotation;
    if (this.newRotation < - 3.14) {
       this.newRotation += 2*3.14;
    }

    // Possible detection of too big rotation, so we can eventually slow down
    // the ship movement.
//     if (Math.abs(this.newRotation + 2*3.14 - (this.rotation + 2*3.14)) > 3.14/2) {
//         this.shipRotate = true;
//     }

    this.setTexture(this.flyingTexture);
}

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
    this.fuel = 100;
    this.fuelPerPoint = 1;
    this.fuelState = 0;
    this.food = 100;
    this.foodPerPoint = 0.2;
    this.foodState = 0;
    this.sanity = 100;
    this.sanityPerPoint = 0.1;
    this.sanityState = 0;
    this.credit = 500;
    this.speed = 0.9;

    if (this.onNormalFuel) this.onNormalFuel();
    if (this.onNormalFood) this.onNormalFood();
    if (this.onNormalSanity) this.onNormalSanity();
}

Ship.prototype.save = function() {
    localStorage.setItem("ship.rotation", this.rotation);
    localStorage.setItem("ship.newRotation", this.newRotation);
    localStorage.setItem("ship.fuel", this.fuel);
    localStorage.setItem("ship.food", this.food);
    localStorage.setItem("ship.sanity", this.sanity);
    localStorage.setItem("ship.credit", this.credit);
}

Ship.prototype.load = function() {
    this.rotation = parseFloat(localStorage.getItem("ship.rotation"));
    this.newRotation = parseFloat(localStorage.getItem("ship.newRotation"));

    this.fuel = parseFloat(localStorage.getItem("ship.fuel"));
    if (this.fuel == 0) {
        this.fuel = -1;
        this.fuelState = 1;
    }

    this.food = parseFloat(localStorage.getItem("ship.food"));
    if (this.food == 0) {
        this.food = -1;
        this.foodState = 1;
    }

    this.sanity = parseFloat(localStorage.getItem("ship.sanity"));
    if (this.sanity == 0) {
        this.sanity == -1;
        this.sanityState = 1;
    }

    this.credit = parseFloat(localStorage.getItem("ship.credit"));
}

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Ship;
    }
}
