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

exports['DialogManager'] = {
    setUp: function(done) {
        this.ship = new Ship();
        this.itemManager = new ItemManager();
        this.inventory = new Inventory(this.ship, this.itemManager);
        this.stage = new PIXI.Stage(0x000000, true);
        this.dialoManager = new DialogManager(this.stage, this.inventory);
        done();
    },
    tearDown: function(done) {
        localStorage.clear();
        radio();
        done();
    },
    simpleDialog: function(test) {
        test.done();
    }
};
