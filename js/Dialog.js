function Dialog() {
    var texture = PIXI.Texture.fromImage("resources/dialog.png");
    PIXI.Sprite.call(this, texture);

    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = 0
    this.position.y = Main.HEIGHT - this.height;
}

Dialog.constructor = Dialog;
Dialog.prototype = Object.create(PIXI.Sprite.prototype);


Dialog.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x;
    var y = data.getLocalPosition(this).y;
}
