require("./TestCommon.js").prepareTest();

exports['DialogManager'] = {
    setUp: function(done) {
        this.ship = new Ship();
        this.itemManager = new ItemManager();
        this.inventory = new Inventory(this.ship, this.itemManager);
        this.stage = new PIXI.Stage(0x000000, true);
        this.dialogManager = new DialogManager(this.stage, this.inventory);
        this.dialogStarted = false;
        this.dialogFinished = false;
        radio("dialogStarted").subscribe(function () { this.dialogStarted = true; }.bind(this));
        radio("dialogFinished").subscribe(function () { this.dialogFinished = true; }.bind(this));
        done();
    },
    tearDown: function(done) {
        localStorage.clear();
        radio.$.channels = [];
        radio.$.channelName = "";
        done();
    },
    simpleDialog: function(test) {
        var obj = new MapObject("Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [], {}, 10, 10, 0.1);

        var data = {"0": {"events": ["Earth_touched"], "dialog": {"A": {"B": "C"}}}};
        this.dialogManager.parseDialogs(data);
        test.ok(!this.dialogStarted);
        test.ok(!this.dialogFinished);
        test.equal(this.stage.children.length, 0);

        radio("objectTouched").broadcast(obj);
        test.ok(this.dialogStarted);
        test.ok(!this.dialogFinished);
        test.equal(this.stage.children.length, 1);

        this.stage.children[0].choose(0); // B
        this.stage.children[0].choose(1); // Leave the conversation.
        test.ok(this.dialogStarted);
        test.ok(this.dialogFinished);
        test.equal(this.stage.children.length, 0);

        // Restart the dialog
        this.dialogStarted = false;
        radio("objectTouched").broadcast(obj);
        test.ok(this.dialogStarted);

        test.done();
    },
    onlyOnce: function(test) {
        var obj = new MapObject("Earth", MapObject.PLANET, "resources/earth.png", 0, 0, [], {}, 10, 10, 0.1);

        var data = {"0": {"events": ["Earth_touched"], "once": true, "dialog": {"A": {"B": "C"}}}};
        this.dialogManager.parseDialogs(data);

        // Finish the dialog for first time.
        radio("objectTouched").broadcast(obj);
        this.stage.children[0].choose(0); // B
        this.stage.children[0].choose(1); // Leave the conversation.
        test.ok(this.dialogStarted);
        test.ok(this.dialogFinished);
        test.equal(this.stage.children.length, 0);

        // We should not be able to start the dialog again.
        this.dialogStarted = false;
        radio("objectTouched").broadcast(obj);
        test.ok(!this.dialogStarted);
        test.equal(this.stage.children.length, 0);

        test.done();
    }
};
