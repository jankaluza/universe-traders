require("./TestCommon.js").prepareTest();

function isFloatEqual(one, two) {
    return (Math.abs(one - two) < 0.0000001);
}

exports['Inventory'] = {
    setUp: function(done) {
        this.ship = new PlayerShip();
        this.itemManager = new ItemManager();
        this.inventory = new Inventory(this.ship, this.itemManager);
        done();
    },
    tearDown: function(done) {
        done();
    },
    addRemoveItem: function(test) {
        var item = new Item(0, "Item", Item.ENGINE, "resources/0.png", 100, 1, null, null, null);
        this.itemManager.addItem(item);

        test.ok(!this.inventory.hasItem(0));
        this.inventory.addItem(0);
        test.ok(this.inventory.hasItem(0));
        this.inventory.removeItem(0);
        test.ok(!this.inventory.hasItem(0));

        this.inventory.addItem(0);
        test.ok(this.inventory.hasItem(0));
        this.inventory.removeItem(item);
        test.ok(!this.inventory.hasItem(0));

        test.done();
    },
    removeAll: function(test) {
        this.itemManager.addItem(new Item(0, "Item", Item.ENGINE, "resources/0.png", 100, 1, null, null, null));
        this.inventory.addItem(0);
        this.inventory.addItem(0);
        this.inventory.addItem(0);
        this.inventory.removeItem(0);
        test.ok(this.inventory.hasItem(0));
        this.inventory.removeAll();
        test.ok(!this.inventory.hasItem(0));
        test.done();
    },
    addFuel: function(test) {
        this.itemManager.addItem(new Item(0, "Item", Item.FUEL, "resources/0.png", 100, 1, null, null, null));
        this.ship.fuel = 0;
        this.ship.food = 0;

        this.inventory.addItem(0);
        test.ok(!this.inventory.hasItem(0));
        test.equal(this.ship.fuel, 100);
        test.equal(this.ship.food, 0);
        test.done();
        
    },
    addFood: function(test) {
        this.itemManager.addItem(new Item(0, "Item", Item.FOOD, "resources/0.png", 100, 1, null, null, null));
        this.ship.fuel = 0;
        this.ship.food = 0;

        this.inventory.addItem(0);
        test.ok(!this.inventory.hasItem(0));
        test.equal(this.ship.fuel, 0);
        test.equal(this.ship.food, 100);
        test.done();
        
    },
    recountStats: function(test) {
        this.itemManager.addItem(new Item(0, "Item", Item.ENGINE, "resources/0.png", 100, 0.1, 0.2, 0.3, 0.4));
        this.itemManager.addItem(new Item(1, "Item", Item.ENGINE, "resources/0.png", 100, 0.4, 0.3, 0.2, 0.1));

        this.inventory.addItem(0);
        test.ok(isFloatEqual(this.ship.speed, 0.1));
        test.ok(isFloatEqual(this.ship.fuelPerPoint, 0.2));
        test.ok(isFloatEqual(this.ship.sanityPerPoint, PlayerShip.SANITY_PER_POINT + 0.3));
        test.ok(isFloatEqual(this.ship.foodPerPoint, PlayerShip.FOOD_PER_POINT + 0.4));

        this.inventory.addItem(1);
        test.ok(isFloatEqual(this.ship.speed, 0.5));
        test.ok(isFloatEqual(this.ship.fuelPerPoint, 0.5));
        test.ok(isFloatEqual(this.ship.sanityPerPoint, PlayerShip.SANITY_PER_POINT + 0.5));
        test.ok(isFloatEqual(this.ship.foodPerPoint, PlayerShip.FOOD_PER_POINT + 0.5));

        test.done();
    },
    recountStatsNoEngine: function(test) {
        this.itemManager.addItem(new Item(0, "Item", Item.SHIP_IMPROVEMENT, "resources/0.png", 100, 0.1, 0.2, 0.3, 0.4));
        this.inventory.addItem(0);
        test.ok(isFloatEqual(this.ship.speed, 0));
        test.done();
    }
};
