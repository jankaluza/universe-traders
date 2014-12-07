function Dialog(face, dialog) {
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

Dialog.prototype.generate = function(root) {
    this.root = root;
    this.rootKeys = [];
    this.removeChildren();
    if (this.face) {
        this.addChild(this.face);
    }

    if (typeof root == "string") {
        this.showNPCSentence(root);
        this.showSentence(0, "Ask something else.");
        this.showSentence(1, "Leave the conversation.");
        return;
    }

    for (var key in root) {
        this.showNPCSentence(key);
        var i = 0;
        for (var answer in root[key]) {
            this.showSentence(i++, answer)
            this.rootKeys[this.rootKeys.length] = answer;
        }
        this.root = root[key];
        break;
    }
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
