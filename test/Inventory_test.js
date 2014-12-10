require("./TestCommon.js").prepareTest();

exports['Inventory'] = {
    setUp: function(done) {
        this.ship = new Ship();
        this.itemManager = new ItemManager();
        this.inventory = new Inventory(this.ship, this.itemManager);
        done();
    },
    tearDown: function(done) {
        done();
    },
    simpleDialog: function(test) {
        test.done();
    }
};
