function Dialog(face, dialog, inventory, objManager) {
    var texture = PIXI.Texture.fromImage("resources/dialog.png");
    PIXI.Sprite.call(this, texture);

    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = 0;
    this.position.y = Main.HEIGHT - this.height;

    if (face) {
        texture = PIXI.Texture.fromImage(face);
        this.face = new PIXI.Sprite(texture);
        this.face.position.x = 0;
        this.face.position.y = 0;
        this.face.width = 64;
        this.face.height = 64;
    }
    else {
        this.face = null;
    }

    this.inventory = inventory;
    this.objManager = objManager;
    this.root = null;
    this.rootKeys = [];
    this.dialog = dialog;
}

Dialog.constructor = Dialog;
Dialog.prototype = Object.create(PIXI.Sprite.prototype);

Dialog.prototype.start = function() {
    return this.generate(this.dialog);
};

Dialog.prototype.showNPCSentence = function(sentence) {
    var npcSentence = new PIXI.Text(sentence, {font: "20px Snippet", fill: "white", wordWrap: true, wordWrapWidth:950});
    npcSentence.position.x = 70;
    npcSentence.position.y = 10;
    this.addChild(npcSentence);
};

Dialog.prototype.showSentence = function(i, sentence) {
    var response = new PIXI.Text(sentence, {font: "20px Snippet", fill: "lightgreen", wordWrap: true, wordWrapWidth:950});
    response.position.x = 70;
    response.position.y = 70 + i * 35;
    this.addChild(response);
};

Dialog.prototype.checkCommandsRestrictions = function(root) {
    var count, found, y;
    for (var i = 1; i < root.length; i++) {
        var args = root[i].split(" ");
        if (args[0] == "add_item") {
            count = args.length == 3 ? parseInt(args[2], 10) : 1;
            if (this.inventory.freeSlotsCount() < count) {
                return "You don't have free space on your ship, you need at least " + count + " free slots.";
            }
        }
        else if (args[0] == "remove_credit") {
            if (this.inventory.ship.credit - parseInt(args[1]) < 0) {
                return "You don't have enough credits, you need at least " + args[1] + " credits.";
            }
        }
        else if (args[0] == "start_quest") {
            found = false;
            for (y = 0; y < 10; y++) {
                text = localStorage.getItem("quests." + y);
                if (!text || text === "") {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return "Sorry, you have too much quests in progress.";
            }
        }
    }

    return null;
};

Dialog.prototype.executeCommands = function(root) {
    var error = this.checkCommandsRestrictions(root);
    if (error) {
        return error;
    }

    var count, x, text;
    for (var i = 1; i < root.length; i++) {
        var args = root[i].split(" ");
        if (args[0] == "add_item") {
            count = args.length == 3 ? parseInt(args[2], 10) : 1;
            for (x = 0; x < count; x++) {
                this.inventory.addItem(parseInt(args[1]));
            }
        }
        else if (args[0] == "remove_item") {
            count = args.length == 3 ? parseInt(args[2], 10) : 1;
            for (x = 0; x < count; x++) {
                this.inventory.removeItem(args[1]);
            }
        }
        else if (args[0] == "add_token") {
            localStorage.setItem("dialog." + args[1], 1);
        }
        else if (args[0] == "start_quest") {
            for (x = 0; x < 10; x++) {
                text = localStorage.getItem("quests." + x);
                if (!text || text === "") {
                    localStorage.setItem("quests." + x, args.slice(2).join(" "));
                    localStorage.setItem("dialog." + args[1], x);
                    break;
                }
            }
        }
        else if (args[0] == "finish_quest") {
            text = localStorage.getItem("dialog." + args[1]);
            console.log("FINISH " + text);
            if (text && text !== "") {
                localStorage.removeItem("quests." + text);
                localStorage.setItem("dialog." + args[1], -2);
            }
        }
        else if (args[0] == "restart_quest") {
            text = localStorage.getItem("dialog." + args[1]);
            if (text && text !== "") {
                localStorage.removeItem("quests." + text);
                localStorage.removeItem("dialog." + args[1]);
            }
        }
        else if (args[0] == "add_credit") {
            this.inventory.ship.credit += parseInt(args[1]);
            radio("creditChanged").broadcast();
        }
        else if (args[0] == "remove_credit") {
            this.inventory.ship.credit -= parseInt(args[1]);
            radio("creditChanged").broadcast();
        }
        else if (args[0] == "spawn_ship_copy") {
            this.objManager.spawnShipCopy(args[1], args[2],
                                          parseInt(args[3], 10),
                                          parseInt(args[4], 10),
                                          new Waypoints(this.objManager, root[i]),
                                          0);
        }
    }

    return root[0];
};

Dialog.prototype.executeFilter = function(root) {
    if (!root || typeof root == "string" || Array.isArray(root)) {
        return true;
    }

    if (!("filter" in root)) {
        return true;
    }

    var count, x;
    for (var i = 0; i < root.filter.length; i++) {
        var args = root.filter[i].split(" ");
        var neg = args[0].charAt(0) == "!";
        if (neg) {
            args[0] = args[0].substring(1);
        }

        if (args[0] == "has_token" || args[0] == "has_quest") {
            x = localStorage.getItem("dialog." + args[1]);
            if ((x !== null && x !== "" && x != "-2") == neg) {
                return false;
            }
        }
        else if (args[0] == "finished_quest") {
            if ((localStorage.getItem("dialog." + args[1]) == "-2") == neg) {
                return false;
            }
        }
        else if (args[0] == "has_item") {
            count = args.length == 3 ? parseInt(args[2], 10) : 1;
            if (count === 1 && this.inventory.hasItem(args[1]) == neg) {
                return false;
            }
            else if ((this.inventory.itemCount(args[1]) == count) == neg) {
                return false;
            }
        }
    }

    return true;
};

Dialog.prototype.showDefaultSentences = function() {
    this.showSentence(0, "Ask something else.");
    this.showSentence(1, "Leave the conversation.");
};

Dialog.prototype.generate = function(root) {
    this.root = root;
    this.rootKeys = [];
    this.removeChildren();
    if (this.face) {
        this.addChild(this.face);
    }

    if (Array.isArray(root)) {
        this.root = this.executeCommands(root);
        root = this.root;
    }

    if (typeof root == "string") {
        this.showNPCSentence(root);
        this.showDefaultSentences();
        return true;
    }

    var NPCShowed = false;
    for (var key in root) {
        if (key == "filter") {
            continue;
        }

        if (!this.executeFilter(root[key])) {
            continue;
        }

        this.showNPCSentence(key);
        NPCShowed = true;
        var i = 0;
        for (var answer in root[key]) {
            if (answer == "filter") {
                continue;
            }
            if (this.executeFilter(root[key][answer])) {
                this.showSentence(i++, answer);
                this.rootKeys[this.rootKeys.length] = answer;
            }
        }
        this.root = root[key];
        break;
    }

    if (!NPCShowed) {
        return false;
    }

    if (this.rootKeys.length === 0) {
        this.showDefaultSentences();
    }

    return true;
};

Dialog.prototype.choose = function(choice) {
//     console.log("choise " + choice);
    if (this.rootKeys.length === 0) {
        if (choice === 0) {
            if (!this.start()) {
                this.onDialogFinished();
            }
        }
        else {
            this.onDialogFinished();
        }
        return;
    }

    if (choice >= this.rootKeys.length) {
        return;
    }

    if (this.generate(this.root[this.rootKeys[choice]]) === false) {
        this.onDialogFinished();
    }
};

Dialog.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x;
    var y = data.getLocalPosition(this).y;
    var choice = -1;

    choice = ((y - 70) / 35) >> 0;
    if (choice < 0 || choice > 3) {
        return;
    }

    this.choose(choice);
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Dialog;
    }
}
