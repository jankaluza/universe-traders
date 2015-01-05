function Quests(stage) {
    PIXI.Graphics.call(this);
    this.width = 560;
    this.height = 560;
    this.position.x = 112;
    this.position.y = 90;
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, 560, 560);

    this.stg = stage;
    this.showed = false;

    radio("showQuests").subscribe(this.show.bind(this));
}

Quests.constructor = Quests;
Quests.prototype = Object.create(PIXI.Graphics.prototype);

Quests.prototype.show = function() {
    this.clear();

    this.beginFill(0x000000, 1);
    this.drawRect(0, 0, 560, 560);
    this.endFill();

    this.lineStyle(2, 0x808080, 1);
    this.drawRect(0, 0, 560, 560);

    var txt;
    var y = 10;

    for (var i = 0; i < 10; i++) {
        var text = localStorage.getItem("quests." + i);
        if (text && text !== "") {
            txt = new PIXI.Text("- " + text, {font: "24px Snippet", fill: "white", align: "center"});
            txt.position.x = 10;
            txt.position.y = y;
            y += 30;
            this.addChild(txt);
        }
    }

    this.lineStyle(2, 0x808080, 1);
    this.drawRect(336, 512, 224, 48);
    txt = new PIXI.Text("Close", {font: "24px Snippet", fill: "white", align: "center"});
    txt.position.x = 420;
    txt.position.y = 560 - 33;
    this.addChild(txt);

    if (!this.showed) {
        this.showed = true;
        this.stg.addChild(this);
    }
};

Quests.prototype.hide = function() {
    if (this.showed) {
        this.showed = false;
        this.removeChildren();
        this.stg.removeChild(this);
    }
};

Quests.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x;
    var y = data.getLocalPosition(this).y;
    if (y > 400) {
        this.hide();
    }
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Quests;
    }
}
