function Menu(universe, ship) {
    var texture = PIXI.Texture.fromImage("resources/menu.png");
    PIXI.Sprite.call(this, texture);
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = Main.CENTER_X - this.width / 2;
    this.position.y = Main.CENTER_Y - this.height / 2;
    this.showed = false;
}

Menu.constructor = Menu;
Menu.prototype = Object.create(PIXI.Sprite.prototype);

Menu.prototype.click = function(data) {
    var y = data.getLocalPosition(this).y;

    if (y > 0 && y < 64) {
        if (this.onRestart) {
            this.onRestart()
        }
    }
}
