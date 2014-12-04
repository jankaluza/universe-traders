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

Dialog.prototype.generate = function(root) {
    this.root = root;
    this.rootKeys = [];
    this.removeChildren();
    if (this.face) {
        this.addChild(this.face);
    }

    if (typeof root == "string") {
        var npcSentence = new PIXI.Text(root, {font: "20px Snippet", fill: "white", wordWrap: true, wordWrapWidth:950});
        npcSentence.position.x = 70;
        npcSentence.position.y = 10;
        this.addChild(npcSentence);

        var response = new PIXI.Text("Ask something else.", {font: "20px Snippet", fill: "lightgreen"});
        response.position.x = 70;
        response.position.y = 70;
        this.addChild(response);

        var response2 = new PIXI.Text("Leave the conversation.", {font: "20px Snippet", fill: "lightgreen"});
        response2.position.x = 70;
        response2.position.y = 105;
        this.addChild(response2);
        return;
    }

    for (var key in root) {
        var npcSentence = new PIXI.Text(key, {font: "20px Snippet", fill: "white", wordWrap: true, wordWrapWidth:950});
        npcSentence.position.x = 70;
        npcSentence.position.y = 10;
        this.addChild(npcSentence);
        y = 70;
        for (var answer in root[key]) {
            var response = new PIXI.Text(answer, {font: "20px Snippet", fill: "lightgreen"});
            response.position.x = 70;
            response.position.y = y;
            this.addChild(response);
            this.rootKeys[this.rootKeys.length] = answer;
            y += 35;
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
