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

exports['Dialog'] = {
    setUp: function(done) {
        localStorage.clear();
        this.ship = new Ship();
        this.itemManager = new ItemManager();
        this.itemManager.addItem(new Item(0, "Item", Item.ENGINE, "resources/0.png", 100, 1, null, null, null));
        this.inventory = new Inventory(this.ship, this.itemManager);
        this.dialogFinished = false;
        done();
    },
    simpleDialog: function(test) {
        var data = {"How are you?":
                        {"Fine!" : "That's great!",
                        "Bad!" : "That's not great!"}
                   };
        var dialog = new Dialog(null, data, this.inventory);
        dialog.onDialogFinished = function () { this.dialogFinished = true; }.bind(this);

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
    addItemAction: function(test) {
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "add_item 0"]}
                   };
        var dialog = new Dialog(null, data, this.inventory);

        test.ok(!this.inventory.hasItem(0));

        dialog.choose(0);
        test.ok(!hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "That's great!"));
        test.ok(this.inventory.hasItem(0));

        test.done();
    },
    addToken: function(test) {
        var data = {"How are you?":
                        {"Fine!" : ["That's great!", "add_token xyz"]}
                   };
        var dialog = new Dialog(null, data, this.inventory);

        test.ok(localStorage.getItem("dialog.xyz") != "1");
        dialog.choose(0);
        test.ok(localStorage.getItem("dialog.xyz") == "1");
        test.done();
    },
    hasToken: function(test) {
        var data = {"How are you?":
                        {"Fine!" : {"That's great!" : "xxx", "filter": ["has_token xyz"]}}
                   };
        var dialog = new Dialog(null, data, this.inventory);

        test.ok(hasText(dialog, "How are you?"));
        test.ok(!hasText(dialog, "Fine!"));
        test.ok(hasText(dialog, "Ask something else."));
        test.ok(hasText(dialog, "Leave the conversation."));

        localStorage.setItem("dialog.xyz", "1");
        dialog.choose(0);
        test.ok(hasText(dialog, "How are you?"));
        test.ok(hasText(dialog, "Fine!"));
        test.ok(!hasText(dialog, "Ask something else."));
        test.ok(!hasText(dialog, "Leave the conversation."));

        test.done();
    },
    hasNotToken: function(test) {
        var data = {"How are you?":
                        {"Fine!" : {"That's great!" : null, "filter": ["!has_token xyz"]}}
                   };
        var dialog = new Dialog(null, data, this.inventory);

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
