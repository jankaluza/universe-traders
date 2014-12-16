function Map(universe) {
    PIXI.Graphics.call(this);
    this.width = 448 * 2;
    this.height = 448;
//     this.interactive = true;
//     this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);

    this.position.x = 32;
    this.position.y = 90;
    this.showed = false;

    this.universe = universe;
}

Map.PIXELS_PER_POINT = 0.7;
Map.LEFT = 400 + (448*2) / Map.PIXELS_PER_POINT;
Map.TOP = 600 + (448) / Map.PIXELS_PER_POINT;

Map.constructor = Map;
Map.prototype = Object.create(PIXI.Graphics.prototype);


Map.prototype.update = function() {
    this.clear();
    this.beginFill(0x000000, 0.6);
    this.drawRect(0, 0, 448*2, 448);
    this.endFill();
    this.moveTo(this.position.x, this.position.y);

    var x, y;

    Map.LEFT = (this.universe.tilePositionX + Main.WIDTH/2) / Universe.MAP_POINT_SIZE + (448 + 32) / Map.PIXELS_PER_POINT;
    Map.TOP = (this.universe.tilePositionY + Main.HEIGHT/2) / Universe.MAP_POINT_SIZE + (224 + 32) / Map.PIXELS_PER_POINT;
    objects = this.universe.objManager.objects;
    for (var index = 0; index < objects.length; index++) {
        var obj = objects[index];
        if (obj.type == MapObject.PLANET) {
            this.lineStyle(2, 0x00FFFF, 1);
        }
        else {
            this.lineStyle(2, 0xFFFF00, 1);
        }
        x = -(obj.mapX - Map.LEFT) * Map.PIXELS_PER_POINT;
        y = -(obj.mapY - Map.TOP) * Map.PIXELS_PER_POINT;
        this.drawRect(x - 5, y - 5, 10, 10);

        if (obj.mapText === null) {
            obj.mapText = new PIXI.Text(obj.name, {font: "14px Snippet", fill: "white", align: "center"});
            this.addChild(obj.mapText);
        }
        obj.mapText.position.x = x + 8;
        obj.mapText.position.y = y - 6;
    }

    x = -(((this.universe.tilePositionX + Main.WIDTH/2) / Universe.MAP_POINT_SIZE - Map.LEFT) * Map.PIXELS_PER_POINT) >> 0;
    y = -(((this.universe.tilePositionY + Main.HEIGHT/2) / Universe.MAP_POINT_SIZE - Map.TOP) * Map.PIXELS_PER_POINT) >> 0;
    this.lineStyle(2, 0x00FF00, 1);
    this.drawRect(x - 5, y - 5, 10, 10);

    this.drawCircle(x, y, (this.universe.ship.fuel/this.universe.ship.fuelPerPoint) * Map.PIXELS_PER_POINT);
    
};
