function Inventory(ship, itemManager) {
    var texture = PIXI.Texture.fromImage("resources/inventory.png");
    PIXI.Sprite.call(this, texture);
    this.width = 448;
    this.height = 448;
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = 544;
    this.position.y = 90;
    this.showed = false;

    this.ship = ship;
    this.itemManager = itemManager;
    this.itemManager.onItemsLoaded = this.itemsLoaded.bind(this);

    this.inventory = new Array(7);
    for (var i = 0; i < 7; i++) {
        this.inventory[i] = new Array(7);
    }
}

Inventory.constructor = Inventory;
Inventory.prototype = Object.create(PIXI.Sprite.prototype);

Inventory.prototype.click = function(data) {
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
};

Inventory.prototype.correctPrice = function(item, price, buy) {
    return price;
};

Inventory.prototype.recountStats = function() {
    if (0) {
        this.ship.fuelPerPoint = 0;
        this.ship.sanityPerPoint = 0.0;
        this.ship.foodPerPoint = 0.0;
        this.ship.speed = 3;
        return;
    }
    this.ship.fuelPerPoint = 0;
    this.ship.sanityPerPoint = Ship.SANITY_PER_POINT;
    this.ship.foodPerPoint = Ship.FOOD_PER_POINT;
    this.ship.speed = 0;
    var gotEngine = false;

    for (x = 0; x < 7; x++) {
        for (y = 0; y < 7; y++) {
            if (this.inventory[x][y]) {
                var item = this.inventory[x][y].item;
                if (item.fuel) {
                    this.ship.fuelPerPoint += item.fuel;
                }
                if (item.speed) {
                    this.ship.speed += item.speed;
                }
                if (item.sanity) {
                    this.ship.sanityPerPoint += item.sanity;
                }
                if (item.food) {
                    this.ship.foodPerPoint += item.food;
                }
                if (item.type == Item.ENGINE) {
                    gotEngine = true;
                }
            }
        }
    }

    if (!gotEngine) {
        this.ship.speed = 0;
    }

    if (this.ship.fuelPerPoint < 0) {
        this.ship.fuelPerPoint = 0;
    }
    if (this.ship.speed < 0) {
        this.ship.speed = 0;
    }
};

Inventory.prototype.hasItem = function(id) {
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y] && this.inventory[x][y].item.id == id) {
                return true;
            }
        }
    }
    return false;
};

Inventory.prototype.itemCount = function(id) {
    var counter = 0;
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y] && this.inventory[x][y].item.id == id) {
                counter += 1;
            }
        }
    }
    return counter;
};

Inventory.prototype.removeAll = function() {
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y]) {
                this.removeChild(this.inventory[x][y]);
                this.inventory[x][y] = null;
            }
        }
    }
};

Inventory.prototype.removeItem = function(item) {
    var id = item;
    if (typeof id == "object") {
        id = item.id;
    }

    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y] && this.inventory[x][y].item.id == id) {
                this.removeChild(this.inventory[x][y]);
                this.inventory[x][y] = null;
                this.recountStats();
                return;
            }
        }
    }
};

Inventory.prototype.freeSlotsCount = function() {
    var count = 0;
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (!this.inventory[x][y]) {
                count += 1;
            }
        }
    }
    return count;
};

Inventory.prototype.addItem = function(id, x, y) {
    if (this.itemManager.getItem(id).type == Item.FOOD) {
        this.ship.food = 100;
        return true;
    }

    if (this.itemManager.getItem(id).type == Item.FUEL) {
        this.ship.fuel = 100;
        return true;
    }

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

    var item = this.itemManager.createSprite(id);
    item.position.x = x * 64;
    item.position.y = y * 64;
    this.addChild(item);
    this.inventory[x][y] = item;
    this.recountStats();
    return true;
};

Inventory.prototype.itemsLoaded = function() {
    this.reset();
    this.load();
};

Inventory.prototype.reset = function() {
    this.removeAll();
    this.addItem(0);
    this.addItem(1);
};

Inventory.prototype.save = function() {
    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            if (this.inventory[x][y]) {
                localStorage.setItem("inventory." + x + "." + y, this.inventory[x][y].item.id);
            }
            else {
                localStorage.setItem("inventory." + x + "." + y, -1);
            }
        }
    }
};

Inventory.prototype.load = function() {
    if (localStorage.getItem("universe.running") != "true") {
        return;
    }

    this.removeAll();

    for (var x = 0; x < 7; x++) {
        for (var y = 0; y < 7; y++) {
            var id = parseInt(localStorage.getItem("inventory." + x + "." + y));
            if (id >= 0) {
                this.addItem(id, x, y);
            }
            else {
                
                localStorage.setItem("inventory." + x + "." + y, -1);
            }
        }
    }

    this.recountStats();
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Inventory;
    }
}
