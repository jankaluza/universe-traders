function Panel(universe, ship) {
    var texture = PIXI.Texture.fromImage("resources/panel.png");
    PIXI.Sprite.call(this, texture);
    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, 0, 730, this.height);

    this.ship = ship
    this.universe = universe;
    var dot = PIXI.Texture.fromImage("resources/dot.png");

    this.fuel = new PIXI.Sprite(dot);
    this.fuel.position.x = 735;
    this.fuel.position.y = 25;
    this.fuel.height = 20;
    this.fuel.width = 80;
    this.addChild(this.fuel);

    this.food = new PIXI.Sprite(dot);
    this.food.position.x = 835;
    this.food.position.y = 25;
    this.food.height = 20;
    this.food.width = 80;
    this.addChild(this.food);

    this.sanity = new PIXI.Sprite(dot);
    this.sanity.position.x = 935;
    this.sanity.position.y = 25;
    this.sanity.height = 20;
    this.sanity.width = 80;
    this.addChild(this.sanity);

    this.visit = new PIXI.Text("", {font: "25px Snippet", fill: "white", align: "left"});
    this.visit.position.x = 20;
    this.visit.position.y = 15;
    this.addChild(this.visit);

    this.credit = new PIXI.Text(this.ship.credit, {font: "20px Snippet", fill: "white", align: "center"});
    this.credit.position.x = 650;
    this.credit.position.y = 25;
    this.addChild(this.credit);

    this.coordinates = new PIXI.Text("", {font: "14px Snippet", fill: "white", align: "center"});
    this.coordinates.position.x = 10;
    this.coordinates.position.y = 55;
    this.addChild(this.coordinates);

    this.object = null;
}

Panel.constructor = Panel;
Panel.prototype = Object.create(PIXI.Sprite.prototype);

Panel.prototype.updateCredit = function() {
    this.credit.setText(this.ship.credit);   
    this.fuel.width = 0.8 * this.ship.fuel;
    this.food.width = 0.8 * this.ship.food;
    this.sanity.width = 0.8 * this.ship.sanity;
}

Panel.prototype.update = function() {
    this.fuel.width = 0.8 * this.ship.fuel;
    this.food.width = 0.8 * this.ship.food;
    this.sanity.width = 0.8 * this.ship.sanity;
};

Panel.prototype.setObject = function(object) {
    if (object && object.type == MapObject.STAR) {
        object = null;
    }

    if (this.object == null && object != null) {
        this.visit.setText("Visit " + object.name);
        if (object) {
            object.shipObject = this.universe;
        }
    }
    else if (this.object != null && object == null) {
        this.visit.setText("");
        if (this.onObjectLeft) this.onObjectLeft();
        this.object.shipObject = null;
    }
    this.object = object;
};

Panel.prototype.click = function(data) {
    if (data.global.x > 470 && data.global.x < 630) {
        if (this.onShowInventory) {
            this.onShowInventory()
        }
    }
    else if (data.global.x > 382 && data.global.x < 470) {
        if (this.onShowMap) {
            this.onShowMap()
        }
    }
    else if (data.global.x > 272 && data.global.x < 382) {
        if (this.onShowMenu) {
            this.onShowMenu()
        }
    }
    else {
        if (this.object && this.onVisitObject) {
            this.onVisitObject(this.object);
        }
    }
}
