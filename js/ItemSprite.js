function ItemSprite(item) {
    var texture = PIXI.Texture.fromImage(item.texture);
    PIXI.Sprite.call(this, texture);
    this.width = 64;
    this.height = 64;
    this.item = item;
}

ItemSprite.constructor = ItemSprite;
ItemSprite.prototype = Object.create(PIXI.Sprite.prototype);

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ItemSprite;
    }
}
