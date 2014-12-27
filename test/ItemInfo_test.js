require("./TestCommon.js").prepareTest();

function hasText(dialog, text) {
    for (var i = 0; i < dialog.children.length; i++) {
        var child = dialog.children[i];
        if (child.text == text) {
            return true;
        }
    }
    return false;
}

exports['ItemInfo'] = {
    setUp: function(done) {
        this.ship = new PlayerShip();
        this.itemManager = new ItemManager();
        this.item = new Item(0, "Item", Item.ENGINE, "resources/0.png", 100, 1, 2, 3, 4)
        this.itemManager.addItem(this.item);
        this.itemManager.addItem(new Item(1, "Item", Item.ENGINE, "resources/1.png", 100, 1, null, null, null));
        this.itemManager.addItem(new Item(2, "Item", Item.FOOD, "resources/2.png", 100, 1, null, null, null));
        this.itemManager.addItem(new Item(3, "Item", Item.FUEL, "resources/3.png", 100, 1, null, null, null));
        this.planet = new PlanetInventory(this.ship, this.itemManager);
        this.inventory = new Inventory(this.ship, this.itemManager);
        done();
    },
    tearDown: function(done) {
        done();
    },
    fromInventoryToNull: function(test) {
        var itemInfo = new ItemInfo(this.itemManager, this.ship, this.item, "drop", this.inventory, null);
        test.ok(hasText(itemInfo, "Speed: +1"));
        test.ok(hasText(itemInfo, "Fuel consumption: +2"));
        test.ok(hasText(itemInfo, "Sanity: +3"));
        test.ok(hasText(itemInfo, "Food: +4"));
        test.ok(hasText(itemInfo, "Price: 100"));
        test.ok(hasText(itemInfo, "drop"));
        test.ok(hasText(itemInfo, "Close"));
        test.done();
    },
    fromInventoryToPlanet: function(test) {
        var obj = new CelestialBody(null, "Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [0.9], 10, 10, 0.1);
        this.planet.setPlanet(obj);
        var itemInfo = new ItemInfo(this.itemManager, this.ship, this.item, "drop", this.inventory, this.planet);
        test.ok(hasText(itemInfo, "Price: 67"));
        test.done();
    },
    fromPlanetToInventory: function(test) {
        var obj = new CelestialBody(null, "Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [0.9], 10, 10, 0.1);
        this.planet.setPlanet(obj);
        this.ship.credit = 0;
        var itemInfo = new ItemInfo(this.itemManager, this.ship, this.item, "drop", this.planet, this.inventory);
        test.ok(hasText(itemInfo, "Price: 90"));
        test.ok(!hasText(itemInfo, "drop"));
        test.done();
    },
    sell: function(test) {
        this.ship.credit = 0;
        this.inventory.addItem(0);
        var obj = new CelestialBody(null, "Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [0.9], 10, 10, 0.1);
        this.planet.setPlanet(obj);
        var itemInfo = new ItemInfo(this.itemManager, this.ship, this.item, "drop", this.inventory, this.planet);
        test.ok(hasText(itemInfo, "drop"));
        
        itemInfo.doAction();
        test.ok(!this.inventory.hasItem(0));
        test.equal(this.ship.credit, 67);
        test.done();
    },
    buy: function(test) {
        this.ship.credit = 90;
        var obj = new CelestialBody(null, "Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [0.9], 10, 10, 0.1);
        this.planet.setPlanet(obj);
        var itemInfo = new ItemInfo(this.itemManager, this.ship, this.item, "drop", this.planet, this.inventory);
        test.ok(hasText(itemInfo, "drop"));

        test.ok(!this.inventory.hasItem(0));
        itemInfo.doAction();
        test.ok(this.inventory.hasItem(0));
        test.equal(this.ship.credit, 0);
        test.done();
    },
    drop: function(test) {
        this.ship.credit = 0;
        this.inventory.addItem(0);
        var obj = new CelestialBody(null, "Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [0.9], 10, 10, 0.1);
        this.planet.setPlanet(obj);
        var itemInfo = new ItemInfo(this.itemManager, this.ship, this.item, "drop", this.inventory, null);

        test.ok(this.inventory.hasItem(0));
        itemInfo.doAction();
        test.ok(!this.inventory.hasItem(0));
        test.equal(this.ship.credit, 0);
        test.done();
    }
};
