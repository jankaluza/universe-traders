function PlayerShip() {
    Ship.call(this, "resources/ship.png", "resources/ship_moving.png");
    this.name = "ship";

    this.reset();
}

PlayerShip.prototype = Object.create(Ship.prototype);
PlayerShip.constructor = PlayerShip;

PlayerShip.SANITY_PER_POINT = 0.1;
PlayerShip.FOOD_PER_POINT = 0.2;

PlayerShip.prototype.timeout = function() {
    this.food -= this.foodPerPoint;
    this.sanity -= this.sanityPerPoint;
    this.updateStats();
};

PlayerShip.prototype.updateStats = function() {
    if (this.fuel < 0) {
        if (this.onOutOfFuel) this.onOutOfFuel();
        this.fuel = 0;
    }
    else if (this.fuelState === 0 && this.fuel < 25) {
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
    else if (this.foodState === 0 && this.food < 25) {
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
    else if (this.sanityState === 0 && this.sanity < 25) {
        if (this.onLowSanity) this.onLowSanity();
        this.sanityState = 1;
    }
    else if (this.sanityState == 1 && this.sanity > 25) {
        if (this.onNormalSanity) this.onNormalSanity();
        this.sanityState = 0;
    }
};

PlayerShip.prototype.moved = function() {
    this.fuel -= this.fuelPerPoint;
};

PlayerShip.prototype.reset = function() {
    Ship.prototype.reset.call(this);

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

    if (this.onNormalFuel) this.onNormalFuel();
    if (this.onNormalFood) this.onNormalFood();
    if (this.onNormalSanity) this.onNormalSanity();
};

PlayerShip.prototype.save = function() {
    Ship.prototype.save.call(this);
    localStorage.setItem("ship.food", this.food);
    localStorage.setItem("ship.sanity", this.sanity);
    localStorage.setItem("ship.credit", this.credit);
};

PlayerShip.prototype.load = function() {
    Ship.prototype.load.call(this);

    if (this.fuel === 0) {
        this.fuel = -1;
        this.fuelState = 1;
    }

    this.food = parseFloat(localStorage.getItem("ship.food"));
    if (this.food === 0) {
        this.food = -1;
        this.foodState = 1;
    }

    this.sanity = parseFloat(localStorage.getItem("ship.sanity"));
    if (this.sanity === 0) {
        this.sanity = -1;
        this.sanityState = 1;
    }

    this.credit = parseFloat(localStorage.getItem("ship.credit"));
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = PlayerShip;
    }
}
