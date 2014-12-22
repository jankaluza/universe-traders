function Item(id, name, type, texture, price, speed, fuel, sanity, food) {
    this.id = id;
    this.texture = texture;
    this.name = name;
    this.type = type;
    this.speed = speed;
    this.fuel = fuel;
    this.price = price;
    this.sanity = sanity;
    this.food = food;
}

Item.ENGINE = 0;
Item.FUEL = 1;
Item.FOOD = 2;
Item.SHIP_IMPROVEMENT = 3;
Item.SPECIAL_FOOD = 4;
Item.MACHINE = 5;
Item.GUN = 6;
Item.LAST_CATEGORY = 7;

Item.constructor = Item;
// Item.prototype = Object.create(PIXI.Sprite.prototype);

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Item;
    }
}
