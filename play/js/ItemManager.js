function ItemManager() {
    this.items = [];
}

ItemManager.prototype.loadItems = function() {
    var that = this;
    var loader = new PIXI.JsonLoader("resources/items.json");
    loader.on('loaded', function(evt) {
        for (var key in evt.content.json.items) {
            var item = evt.content.json.items[key];
            var it = new Item(that.items.length, item.name, item.type, item.texture, item.price, item.speed, item.fuel, item.sanity, item.food);
            that.items[that.items.length] = it;
        }
        if (that.onItemsLoaded) that.onItemsLoaded();
    });
    loader.load();
}

ItemManager.prototype.createSprite = function(id) {
    return new ItemSprite(this.items[id]);
}

ItemManager.prototype.getItem = function(id) {
    return this.items[id];
}
