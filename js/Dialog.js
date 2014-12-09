function Dialog(face, dialog, inventory) {
    var texture = PIXI.Texture.fromImage("resources/dialog.png");
    PIXI.Sprite.call(this, texture);

    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = 0
    this.position.y = Main.HEIGHT - this.height;

    if (face) {
        var texture = PIXI.Texture.fromImage(face);
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
    this.root = null;
    this.rootKeys = [];
    this.dialog = dialog;
    this.generate(this.dialog);
}

Dialog.constructor = Dialog;
Dialog.prototype = Object.create(PIXI.Sprite.prototype);

Dialog.prototype.showNPCSentence = function(sentence) {
    var npcSentence = new PIXI.Text(sentence, {font: "20px Snippet", fill: "white", wordWrap: true, wordWrapWidth:950});
    npcSentence.position.x = 70;
    npcSentence.position.y = 10;
    this.addChild(npcSentence);
}

Dialog.prototype.showSentence = function(i, sentence) {
    var response = new PIXI.Text(sentence, {font: "20px Snippet", fill: "lightgreen", wordWrap: true, wordWrapWidth:950});
    response.position.x = 70;
    response.position.y = 70 + i * 35;
    this.addChild(response);
}

Dialog.prototype.executeCommands = function(root) {
    for (var i = 1; i < root.length; i++) {
        var args = root[i].split(" ");
        if (args[0] == "add_item") {
            this.inventory.addItem(parseInt(args[1]))
        }
        else if (args[0] == "add_token") {
            localStorage.setItem("dialog." + args[1], 1);
        }
    }

    return root[0];
}

Dialog.prototype.executeFilter = function(root) {
    if (typeof root == "string" || Array.isArray(root)) {
        return true;
    }

    if (!("filter" in root)) {
        return true;
    }

    for (var i = 0; i < root["filter"].length; i++) {
        var args = root["filter"][i].split(" ");
        var neg = args[0].charAt(0) == "!";
        if (neg) {
            args[0] = args[0].substring(1);
        }

        if (args[0] == "has_token") {
            if (localStorage.getItem("dialog." + args[1]) != "1" || neg) {
                return false;
            }
        }
    }

    return true;
}

Dialog.prototype.showDefaultSentences = function() {
    this.showSentence(0, "Ask something else.");
    this.showSentence(1, "Leave the conversation.");
}

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
        return;
    }

    for (var key in root) {
        this.showNPCSentence(key);
        var i = 0;
        for (var answer in root[key]) {
            if (this.executeFilter(root[key][answer])) {
                this.showSentence(i++, answer)
                this.rootKeys[this.rootKeys.length] = answer;
            }
        }
        this.root = root[key];
        break;
    }

    if (this.rootKeys.length == 0) {
        this.showDefaultSentences();
    }
}

Dialog.prototype.choose = function(choice) {
    if (this.rootKeys.length == 0) {
        if (choice == 0) {
            this.generate(this.dialog);
        }
        else {
            this.onDialogFinished();
        }
        return;
    }
    this.generate(this.root[this.rootKeys[choice]]);
}

Dialog.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x;
    var y = data.getLocalPosition(this).y;
    var choice = -1;
    if (y > 70 && y < 105) {
        choice = 0;
    }
    else if (y > 105 && y < 140) {
        choice = 1;
    }
    else {
        return;
    }

    this.choose(choice);
}

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Dialog;
    }
}
