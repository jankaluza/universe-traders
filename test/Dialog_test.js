require("./TestCommon.js").prepareTest();

function hasText(dialog, text) {
    for (var i = 0; i < dialog.children.length; i++) {
        var child = dialog.children[i];
        if (child.text.lastIndexOf(text, 0) === 0) {
            return true;
        }
    }
    return false;
}

exports['Dialog'] = {
    setUp: function(done) {
        localStorage.clear();
        this.ship = new PlayerShip();
        this.itemManager = new ItemManager();
        this.itemManager.addItem(new Item(0, "Item", Item.ENGINE, "resources/0.png", 100, 1, null, null, null));
        this.inventory = new Inventory(this.ship, this.itemManager);
        this.dialogFinished = false;
        this.universe = new Universe();
        this.objManager = new ObjectManager(this.universe);
        done();
    },
    simpleDialog: function(test) {
        var data = {"How are you?":
                        {"Fine!" : "That's great!",
                        "Bad!" : "That's not great!"}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.onDialogFinished = function () { this.dialogFinished = true; }.bind(this);
        dialog.start();

        for (var i = 0; i < 2; i++) {
            test.ok(hasText(dialog, "How are you?"));
            test.ok(hasText(dialog, "Fine!"));
            test.ok(hasText(dialog, "Bad!"));
            test.ok(!hasText(dialog, "That's great!"));
            test.ok(!hasText(dialog, "That's not great!"));
            test.ok(!this.dialogFinished);

            dialog.choose(0);
            test.ok(!hasText(dialog, "How are you?"));
            test.ok(!hasText(dialog, "Fine!"));
            test.ok(!hasText(dialog, "Bad!"));
            test.ok(hasText(dialog, "That's great!"));
            test.ok(!hasText(dialog, "That's not great!"));
            test.ok(hasText(dialog, "Ask something else."));
            test.ok(hasText(dialog, "Leave the conversation."));
            test.ok(!this.dialogFinished);

            if (i == 0) {
                // Ask something else.
                dialog.choose(0);
            }
            else {
                // Leave the conversation.
                dialog.choose(1);
            }
        }

        test.ok(this.dialogFinished);
        test.done();
    },
    spawnShipCopy: function(test) {
        var old_ship = new IntelligentShip(this.objManager, "old_name", MapObject.ENEMY_SHIP, "resources/ship.png", 500, 500, [], [], 1, "10 10 20 20", 1, 1, 0);
        this.objManager.addShip(old_ship);
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "spawn_ship_copy old_name new_name 1010 1020 [1000 1001 earth moon 500 500]"]}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();
        test.equal(this.objManager.ships.length, 1);

        dialog.choose(0);
        test.equal(this.objManager.ships.length, 2);

        var new_ship = this.objManager.getShip("new_name");
        test.ok(new_ship != null);
        test.equal(new_ship.mapX, 1010);
        test.equal(new_ship.mapY, 1020);
        test.equal(new_ship.waypoints.toString(), [ [ 1000, 1001 ], ['earth'], [ 'moon' ], [ 500, 500 ] ].toString());

        test.done();
    },
    addItem: function(test) {
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "add_item 0"]}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(!this.inventory.hasItem(0));

        dialog.choose(0);
        test.ok(!hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "That's great!"));
        test.ok(this.inventory.hasItem(0));

        test.done();
    },
    addItems: function(test) {
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "add_item 0 5"]}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(!this.inventory.hasItem(0));
        test.equal(this.inventory.itemCount(0), 0);

        dialog.choose(0);
        test.ok(!hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "That's great!"));
        test.ok(this.inventory.hasItem(0));
        test.equal(this.inventory.itemCount(0), 5);

        test.done();
    },
    addItemsNoSpace: function(test) {
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "add_item 0", "add_item 0 100"]}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(!this.inventory.hasItem(0));
        test.equal(this.inventory.itemCount(0), 0);

        dialog.choose(0);
        test.ok(hasText(dialog, "You don't have free space on your ship"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(!hasText(dialog, "That's great!"));
        test.ok(!this.inventory.hasItem(0));
        test.equal(this.inventory.itemCount(0), 0);

        test.done();
    },
    removeItems: function(test) {
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "remove_item 0 3"]}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        this.inventory.addItem(0);
        this.inventory.addItem(0);
        this.inventory.addItem(0);
        this.inventory.addItem(0);
        this.inventory.addItem(0);
        test.equal(this.inventory.itemCount(0), 5);

        dialog.choose(0);
        test.ok(!hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "That's great!"));
        test.ok(this.inventory.hasItem(0));
        test.equal(this.inventory.itemCount(0), 2);

        test.done();
    },
    addToken: function(test) {
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "add_token xyz"]}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(localStorage.getItem("dialog.xyz") != "1");
        dialog.choose(0);
        test.ok(localStorage.getItem("dialog.xyz") == "1");
        test.done();
    },
    filterNotIgnoredInQuestion: function(test) {
        var data = {"X":{"Y": {"filter": ["!has_token wine_moon"], "Z": "X"}}};
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();
        dialog.choose(0);

        test.ok(!hasText(dialog, "filter"));
        test.done();
    },
    filterWholeDialog: function(test) {
        var data = {"Question": {"Answer": "Text", "filter": ["has_token xyz"]}}
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        var ret = dialog.start();

        test.ok(!hasText(dialog, "Question"));
        test.ok(!ret);
        test.done();
    },
    filterNotIgnoredInAnswer: function(test) {
        var data = {"Question": {"Answer": "Text", "filter": ["!has_token xyz"]}}
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        var ret = dialog.start();

        test.ok(hasText(dialog, "Question"));
        test.ok(!hasText(dialog, "filter"));
        test.ok(ret);
        test.done();
    },
    moreStructuredDialog: function(test) {
        var data = {"Q1": {"A1": {"Q2": {"filter": ["!has_item 0 20"], "A2": ["Q3", "add_item 0 20"]}, "Q4": {"filter": ["has_item 0 20"], "A4": "Q5"}}}}
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(hasText(dialog, "Q1"));
        test.ok(hasText(dialog, "A1"));

        dialog.choose(0);
        test.ok(hasText(dialog, "Q2"));
        test.ok(hasText(dialog, "A2"));

        dialog.choose(0);
        test.ok(hasText(dialog, "Q3"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        dialog.choose(0);
        test.ok(hasText(dialog, "Q1"));
        test.ok(hasText(dialog, "A1"));

        dialog.choose(0);
        test.ok(hasText(dialog, "Q4"));
        test.ok(hasText(dialog, "A4"));

        dialog.choose(0);
        test.ok(hasText(dialog, "Q5"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        test.done();
    },
    hasItem: function(test) {
        var data = {"How are you?":
                        {"Fine!" : {"filter": ["has_item 0"], "That's great!" : "xxx"}}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        this.inventory.addItem(0);
        dialog.choose(0);
        test.ok(hasText(dialog, "How are you?"));
        test.ok(hasText(dialog, "Fine!"));
        test.ok(!hasText(dialog, "Ask something else."));
        test.ok(!hasText(dialog, "Leave the conversation."));

        test.done();
    },
    hasItems: function(test) {
        var data = {"How are you?":
                        {"Fine!" : {"filter": ["has_item 0 3"], "That's great!" : "xxx"}}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        this.inventory.addItem(0);
        dialog.choose(0);
        test.ok(hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        this.inventory.addItem(0);
        this.inventory.addItem(0);
        dialog.choose(0);
        test.ok(hasText(dialog, "How are you?"));
        test.ok(hasText(dialog, "Fine!"));
        test.ok(!hasText(dialog, "Ask something else."));
        test.ok(!hasText(dialog, "Leave the conversation."));

        test.done();
    },
    hasNotItem: function(test) {
        var data = {"How are you?":
                        {"Fine!" : {"That's great!" : null, "filter": ["!has_item 0"]}}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(hasText(dialog, "How are you?"));
        test.ok(hasText(dialog, "Fine!"));
        test.ok(!hasText(dialog, "Ask something else."));
        test.ok(!hasText(dialog, "Leave the conversation."));

        this.inventory.addItem(0);
        dialog.choose(0);
        dialog.choose(0);
        test.ok(hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        test.done();
    },
    hasToken: function(test) {
        var data = {"How are you?":
                        {"Fine!" : {"filter": ["has_token xyz"], "That's great!" : "xxx"}}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));
        test.ok(!hasText(dialog, "filter"));

        localStorage.setItem("dialog.xyz", "1");
        dialog.choose(0);
        test.ok(hasText(dialog, "How are you?"));
        test.ok(hasText(dialog, "Fine!"));
        test.ok(!hasText(dialog, "Ask something else."));
        test.ok(!hasText(dialog, "Leave the conversation."));
        test.ok(!hasText(dialog, "filter"));

        test.done();
    },
    hasNotToken: function(test) {
        var data = {"How are you?":
                        {"Fine!" : {"That's great!" : null, "filter": ["!has_token xyz"]}}
                   };
        var dialog = new Dialog(null, data, this.inventory, this.objManager);
        dialog.start();

        test.ok(hasText(dialog, "How are you?"));
        test.ok(hasText(dialog, "Fine!"));
        test.ok(!hasText(dialog, "Ask something else."));
        test.ok(!hasText(dialog, "Leave the conversation."));

        localStorage.setItem("dialog.xyz", "1");
        dialog.choose(0);
        dialog.choose(0);
        test.ok(hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        test.done();
    }
};
