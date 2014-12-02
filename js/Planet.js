function Planet(ship, itemManager) {
    var texture = PIXI.Texture.fromImage("resources/planet.png");
    PIXI.Sprite.call(this, texture);
    this.width = 448;
    this.height = 448;
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = 32;
    this.position.y = 90;
    this.showed = false;

    this.ship = ship;
    this.itemManager = itemManager;
    this.planet = null;

    this.inventory = new Array(7);
    for (var i = 0; i < 7; i++) {
        this.inventory[i] = new Array(7);
    }
}

Planet.constructor = Planet;
Planet.prototype = Object.create(PIXI.Sprite.prototype);

Planet.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x / 64 >> 0;
    var y = data.getLocalPosition(this).y / 64 >> 0;
    var itemSprite = this.inventory[x][y];
    if (!itemSprite) {
        return;
    }

    var item = itemSprite.item;
    if (this.onItemClicked) {
        this.onItemClicked(item, this.ship);
    }
}

Planet.prototype.correctPrice = function(item, price, buy) {
    // For fuel and food, the price depends on the current state of fuel/food
    if (item.type == Item.FUEL) {
        price *= 100 - this.ship.fuel;
    }
    else if (item.type == Item.FOOD) {
        price *= 100 - this.ship.food;
    }

    // change the price according to current demand
    price *= this.planet.prices[item.type] * (1 + ((item.id in this.planet.demand) ? this.planet.demand[item.id] : 0));

    // apply gross margin
    if (buy) {
        for (var i = 0; i < this.planet.items.length; i++) {
            if (this.planet.items[i] == item.id) {
                price *= 0.75;
            }
        }
    }
    else {
        // Ship is buying, so price has to be -price to decrease this.ship.credit
        price = -price;
    }

    return price >> 0;
}

Planet.prototype.clear = function() {
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y]) {
                this.removeChild(this.inventory[x][y]);
                this.inventory[x][y] = null;
            }
        }
    }
}

Planet.prototype.removeItem = function(item) {
    if (item.type == Item.FOOD || item.type == Item.FUEL) {
        return;
    }

    // Item removed from planet, so increase the demand
    if (!(item.id in this.planet.demand)) {
        this.planet.demand[item.id] = 0.0;
    }
    this.planet.demand[item.id] += 0.05;
}

Planet.prototype.addItem = function(id, x, y) {
    // Item added to planet, so decrease the demand
    if (!(id in this.planet.demand)) {
        this.planet.demand[id] = 0;
    }
    this.planet.demand[id] -= 0.05;
}

Planet.prototype._addItem = function(id, x, y) {
    // Find free space in inventory.
    if (x == null || y == null) {
        var found = false;
        for (x = 0; x < 7; x++) {
            for (y = 0; y < 7; y++) {
                if (this.inventory[x][y] == null) {
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
    }

    if (x >= 7 || y >= 7) {
        return false;
    }   

    var itemSprite = this.itemManager.createSprite(id);
    itemSprite.position.x = x * 64;
    itemSprite.position.y = y * 64;
    this.addChild(itemSprite);
    this.inventory[x][y] = itemSprite;
    return true;
}

Planet.prototype.setPlanet = function(planet) {
    this.planet = planet;
    if (this.planet) {
        this._addItem(2);
        this._addItem(3);
        for (var i = 0; i < this.planet.items.length; i++) {
            this._addItem(this.planet.items[i]);
        }
    }
    else {
        this.clear();
    }
}
