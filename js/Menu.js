function Menu(stage) {
    var texture = PIXI.Texture.fromImage("resources/menu.png");
    PIXI.Sprite.call(this, texture);
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = Main.CENTER_X - this.width / 2;
    this.position.y = Main.CENTER_Y - this.height / 2;
    this.showed = false;
    this.stg = stage;
}

Menu.constructor = Menu;
Menu.prototype = Object.create(PIXI.Sprite.prototype);

Menu.prototype.show = function() {
    this.stg.addChild(this);
    this.showed = true;
};

Menu.prototype.hide = function() {
    this.stg.removeChild(this);
    this.showed = false;
};

Menu.prototype.toggle = function() {
    if (this.showed) {
        this.hide();
    }
    else {
        this.show();
    }
};

Menu.prototype.click = function(data) {
    var y = data.getLocalPosition(this).y;

    if (y > 0 && y < 64) {
        radio("showQuests").broadcast();
        this.hide();
    }
    else if (y > 64 && y < 128) {
        radio("showStatistics").broadcast();
        this.hide();
    }
    else if (y > 384) {
        radio("restartGame").broadcast();
        this.hide();
    }
};
