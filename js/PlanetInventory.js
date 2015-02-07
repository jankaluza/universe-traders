function PlanetInventory(ship, itemManager, dialogManager) {
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
    this.dialogManager = dialogManager;
    this.planet = null;

    this.inventory = new Array(7);
    for (var i = 0; i < 7; i++) {
        this.inventory[i] = new Array(7);
    }
}

PlanetInventory.constructor = PlanetInventory;
PlanetInventory.prototype = Object.create(PIXI.Sprite.prototype);

PlanetInventory.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x / 64 >> 0;
    var y = data.getLocalPosition(this).y / 64 >> 0;
    var item = this.inventory[x][y];
    if (!item) {
        return;
    }

    if (typeof item == "string") {
        this.dialogManager.executeDialog(item);
        return;
    }

    if (this.onItemClicked) {
        this.onItemClicked(item.item, this.ship);
    }
};

PlanetInventory.prototype.correctPrice = function(item, price, buy) {
    // For fuel and food, the price depends on the current state of fuel/food
    if (item.type == Item.FUEL) {
        price *= 1000 - this.ship.fuel;
    }
    else if (item.type == Item.FOOD) {
        price *= 1000 - this.ship.food;
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
};

PlanetInventory.prototype.clear = function() {
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y]) {
                this.removeChild(this.inventory[x][y]);
                this.inventory[x][y] = null;
            }
        }
    }
};

PlanetInventory.prototype.hasItem = function(id) {
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y] && this.inventory[x][y].item.id == id) {
                return true;
            }
        }
    }
    return false;
};

PlanetInventory.prototype.removeItem = function(item) {
    if (item.type == Item.FOOD || item.type == Item.FUEL) {
        return;
    }

    // Item removed from planet, so increase the demand
    if (!(item.id in this.planet.demand)) {
        this.planet.demand[item.id] = 0.0;
    }
    this.planet.demand[item.id] += 0.05;
};

PlanetInventory.prototype.addItem = function(id, x, y) {
    // Item added to planet, so decrease the demand
    if (!(id in this.planet.demand)) {
        this.planet.demand[id] = 0;
    }
    this.planet.demand[id] -= 0.05;
};

PlanetInventory.prototype._addItem = function(id, x, y) {
    // Find free space in inventory.
    if (!x || !y) {
        var found = false;
        for (x = 0; x < 7; x++) {
            for (y = 0; y < 7; y++) {
                if (!this.inventory[x][y]) {
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
};

PlanetInventory.prototype.addDialogs = function() {
    if (!this.dialogManager) {
        return;
    }

    var dialogs = this.dialogManager.objectToDialog[this.planet.name];
    if (!dialogs) {
        return;
    }

    for (var i = 0; i < dialogs.length; i++) {
        var texture = PIXI.Texture.fromImage(this.dialogManager.dialogs[dialogs[i]].face);
        var face = new PIXI.Sprite(texture);
        face.position.x = 6 * 64;
        face.position.y = i * 64;
        face.width = 64;
        face.height = 64;
        this.addChild(face);
        this.inventory[6][i] = dialogs[i];
    }
};

PlanetInventory.prototype.setPlanet = function(planet) {
    this.planet = planet;
    if (this.planet) {
        if (this.planet.type == MapObject.PLANET) {
            this._addItem(2);
            this._addItem(3);
        }
        for (var i = 0; i < this.planet.items.length; i++) {
            this._addItem(this.planet.items[i]);
        }
        this.addDialogs();
    }
    else {
        this.clear();
    }
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = PlanetInventory;
    }
}

