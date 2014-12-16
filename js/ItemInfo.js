function ItemInfo(itemManager, ship, item, action, from, to) {
    var texture = PIXI.Texture.fromImage("resources/iteminfo.png");
    PIXI.Sprite.call(this, texture);
    this.width = 351;
    this.height = 257;
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = Main.CENTER_X/2 - this.width / 2;
    this.position.y = Main.CENTER_Y - this.height / 2;

    this.to = to;
    this.from = from;
    this.ship = ship;

    this.item = item;
    this.itemSprite = itemManager.createSprite(item.id);
    this.addChild(this.itemSprite);

    var name = new PIXI.Text(item.name, {font: "20px Snippet", fill: "white"});
    name.position.x = 70;
    name.position.y = 25;
    this.addChild(name);

    var y = 50;

    if (item.speed) {
        var speed = new PIXI.Text("Speed: " + (item.speed > 0 ? "+" : "-") + item.speed,
                                  {font: "20px Snippet", fill: item.speed > 0 ? "lightgreen" : "red"});
        speed.position.x = 70;
        speed.position.y = y;
        y += 25;
        this.addChild(speed);
    }
    if (item.fuel) {
        var fuel = new PIXI.Text("Fuel consumption: " + (item.fuel > 0 ? "+" : "-") + item.fuel,
                                 {font: "20px Snippet", fill: item.fuel > 0 ? "red" : "lightgreen"});
        fuel.position.x = 70;
        fuel.position.y = y;
        y += 25;
        this.addChild(fuel);
    }
    if (item.sanity) {
        var sanity = new PIXI.Text("Sanity: " + (item.sanity > 0 ? "+" : "-") + item.sanity,
                                  {font: "20px Snippet", fill: item.sanity < 0 ? "lightgreen" : "red"});
        sanity.position.x = 70;
        sanity.position.y = y;
        y += 25;
        this.addChild(sanity);
    }
    if (item.food) {
        var food = new PIXI.Text("Food: " + (item.food > 0 ? "+" : "-") + item.food,
                                  {font: "20px Snippet", fill: item.food < 0 ? "lightgreen" : "red"});
        food.position.x = 70;
        food.position.y = y;
        y += 25;
        this.addChild(food);
    }

    var _price = item.price;
    _price = this.from.correctPrice(item, _price, false);
    if (this.to) {
        _price = this.to.correctPrice(item, _price, true);
    }
    var price = new PIXI.Text("Price: " + (_price > 0 ? _price : -_price), {font: "20px Snippet", fill: "white"});
    price.position.x = 70;
    price.position.y = 200;
    y += 25;
    this.addChild(price);

    var close = new PIXI.Text("Close", {font: "25px Snippet", fill: "white"});
    close.position.x = 262 - close.width / 2;
    close.position.y = 230;
    this.addChild(close);

    if (!this.to || this.ship.credit + _price >= 0) {
        action = new PIXI.Text(action, {font: "25px Snippet", fill: "white"});
        action.position.x = 87 - action.width / 2;
        action.position.y = 230;
        this.addChild(action);
    }
}

ItemInfo.constructor = ItemInfo;
ItemInfo.prototype = Object.create(PIXI.Sprite.prototype);

ItemInfo.prototype.doAction = function() {
    // Drop the item.
    if (!this.to) {
        this.from.removeItem(this.item);
    }
    // Sell or buy the item.
    else {
        var _price = this.item.price;
        _price = this.from.correctPrice(this.item, _price, false);
        if (this.from) {
            _price = this.to.correctPrice(this.item, _price, true);
        }
        
        if (this.ship.credit + _price < 0) {
            return;
        }

        this.from.removeItem(this.item);
        this.ship.credit += _price;
        this.to.addItem(this.item.id);
    }

    if (this.onClose) this.onClose();
};

ItemInfo.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x;
    var y = data.getLocalPosition(this).y;

    if (y < 230) {
        return;
    }

    if (x > 200) {
        if (this.onClose) this.onClose();
    }
    else {
        this.doAction();
    }
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ItemInfo;
    }
}

