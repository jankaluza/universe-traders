require("./TestCommon.js").prepareTest();

exports['Planet'] = {
    setUp: function(done) {
        this.ship = new Ship();
        this.itemManager = new ItemManager();
        this.itemManager.addItem(new Item(0, "Item", Item.ENGINE, "resources/0.png", 100, 1, null, null, null));
        this.itemManager.addItem(new Item(1, "Item", Item.ENGINE, "resources/1.png", 100, 1, null, null, null));
        this.itemManager.addItem(new Item(2, "Item", Item.FOOD, "resources/2.png", 100, 1, null, null, null));
        this.itemManager.addItem(new Item(3, "Item", Item.FUEL, "resources/3.png", 100, 1, null, null, null));
        this.planet = new Planet(this.ship, this.itemManager);
        done();
    },
    tearDown: function(done) {
        done();
    },
    setPlanet: function(test) {
        var obj = new MapObject("Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [], 10, 10, 0.1);

        test.ok(!this.planet.hasItem(0));
        test.ok(!this.planet.hasItem(1));
        this.planet.setPlanet(obj);
        test.ok(this.planet.hasItem(0));
        test.ok(this.planet.hasItem(1));

        this.planet.setPlanet(null);
        test.ok(!this.planet.hasItem(0));
        test.ok(!this.planet.hasItem(1));

        test.done();
    },
    addItem: function(test) {
        var obj = new MapObject("Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [], 10, 10, 0.1);
        this.planet.setPlanet(obj);
        this.planet.addItem(0);
        test.ok(obj.demand[0] < 0);
        test.done();
    },
    removeItem: function(test) {
        var obj = new MapObject("Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [], 10, 10, 0.1);
        this.planet.setPlanet(obj);
        this.planet.removeItem(this.itemManager.getItem(0));
        test.ok(obj.demand[0] > 0);
        test.done();
    },
    correctPrice: function(test) {
        var obj = new MapObject("Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [0.9], 10, 10, 0.1);
        this.planet.setPlanet(obj);

        // When selling item, it's price has to "grow"
        test.equal(this.planet.correctPrice(this.itemManager.getItem(0), 100, false), -90);
        test.equal(this.planet.correctPrice(this.itemManager.getItem(0), 100, true), 67);
        this.planet.removeItem(this.itemManager.getItem(0));
        test.ok(this.planet.correctPrice(this.itemManager.getItem(0), 100, false) < -90);
        test.ok(this.planet.correctPrice(this.itemManager.getItem(0), 100, true) > 67);
        
        test.done();
    },
    correctPriceFoodFuel: function(test) {
        this.ship.food = 50;
        this.ship.fuel = 60
        var obj = new MapObject("Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [0, 1], [0.9], 10, 10, 0.1);
        this.planet.setPlanet(obj);

        test.equal(this.planet.correctPrice(this.itemManager.getItem(2), 100, false), -5000);
        test.equal(this.planet.correctPrice(this.itemManager.getItem(3), 100, false), -4000);
        test.done();
    }
};
