function MapObject(name, type, texture, x, y, items, prices, a, b, speed) {
    PIXI.Sprite.call(this, texture);

    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.mapX = x;        // X coordinate on the map.
    this.mapY = y;        // Y coordinate on the map.
    this.staged = false;  // True when Object is showed on screen.
    this.name = name;     // Name of the Object.
    this.type = type;     // Type of the Object.
    this.items = items;   // List of IDs of items sold on this Object,
    this.prices = prices; // List of floats - prices on this planet per ItemType.
    this.demand = {}      // ItemType:demand. Increasee == buy, decrease == sell.
    this.a = a * Universe.MAP_POINT_SIZE;   // Width of orbit.
    this.b = b * Universe.MAP_POINT_SIZE;   // Height of the orbit.
    this.speed = speed;   // Speed of the Object.
    this.posParam = 0;    // Position on the Orbit.
    this.parentObject = null;   // Parent object. Used as center of orbit.
    this.childrenObjects = []   // Objects orbiting this object.
    this.staggedChildren = 0;   // Number of children showed on screen.
    this.shipObject = null;

    this.addX = 0;  // Internal, counts increase of position.x per tick.
    this.addY = 0;  // Internal, counts increase of position.y per tick.
    this.prevX = this.a * Math.cos(this.posParam); // Internal, previous X increase.
    this.prevY = this.b * Math.sin(this.posParam); // Internal, previous Y increase.
    this.cycles = 0;    // Internal counter.
    this.mapText = null;
    this.reset();
}

MapObject.PLANET = 0;
MapObject.STAR = 1;

MapObject.constructor = MapObject;
MapObject.prototype = Object.create(PIXI.Sprite.prototype);

MapObject.prototype.recountPosition = function() {
    if (this.parentObject) {
        var x = ((this.a / Universe.MAP_POINT_SIZE) * Math.cos(this.posParam)) >> 0;
        var y = ((this.b / Universe.MAP_POINT_SIZE) * Math.sin(this.posParam)) >> 0;
        this.mapX = this.parentObject.mapX - x;
        this.mapY = this.parentObject.mapY - y;
        this.prevX = this.a * Math.cos(this.posParam); // Internal, previous X increase.
        this.prevY = this.b * Math.sin(this.posParam); // Internal, previous Y increase.
    }
    console.log(this.name + ": "  + this.mapX + " " + this.mapY);

    for (var index = 0; index < this.childrenObjects.length; index++) {
        var obj = this.childrenObjects[index];
        obj.recountPosition();
    }
}

MapObject.prototype.reset = function() {
    this.demand = {}
    this.staged = false;
    this.staggedChildren = 0;
    if (this.name == "Earth") {
        this.posParam = 0;
    }
    else {
        this.posParam = Math.random() * 6.28;
    }
    this.addX = 0;
    this.addY = 0;
    this.prevX = this.a * Math.cos(this.posParam);
    this.prevY = this.b * Math.sin(this.posParam);
    this.cycles = 0;
    this.shipObject = null;
}

MapObject.prototype.save = function() {
    if (this.demand.length != 0) {
        localStorage.setItem(this.name + ".demand", JSON.stringify(this.demand));
    }

    localStorage.setItem(this.name + ".mapX", this.mapX);
    localStorage.setItem(this.name + ".mapY", this.mapY);
    localStorage.setItem(this.name + ".posParam", this.posParam);
    localStorage.setItem(this.name + ".addX", this.addX);
    localStorage.setItem(this.name + ".addY", this.addY);
}

MapObject.prototype.load = function() {
    if (localStorage.getItem("universe.running") != "true") {
        return;
    }

    var demand = JSON.parse(localStorage.getItem(this.name + ".demand"));
    if (demand) {
        this.demand = demand;
    }

    this.mapX = parseInt(localStorage.getItem(this.name + ".mapX"));
    this.mapY = parseInt(localStorage.getItem(this.name + ".mapY"));
    this.posParam = parseFloat(localStorage.getItem(this.name + ".posParam"));
    this.addX = parseFloat(localStorage.getItem(this.name + ".addX"));
    this.addY = parseFloat(localStorage.getItem(this.name + ".addY"));

    this.prevX = this.a * Math.cos(this.posParam); // Internal, previous X increase.
    this.prevY = this.b * Math.sin(this.posParam); // Internal, previous Y increase.
}

MapObject.prototype.doOrbitalMovement = function(addMapX, addMapY, addX, addY) {
    if (this.speed != 0 && this.parentObject) {
        // For stagged objects, we have to computer exact coordinates. For
        // objects which are not showed on the screen, we can computer the exact
        // coordinates just from time to time.
        if (this.staged || this.cycles > 10) {
            // Count the coordinates on ellipse (parametric equatation),
            // store the increase since the last mapX/mapY update and change
            // the position of the object (relative to parent)
            var x = this.a * Math.cos(this.posParam);
            var y = this.b * Math.sin(this.posParam);
            addX += this.prevX - x;
            addY += this.prevY - y;
            this.addX += this.prevX - x;
            this.addY += this.prevY - y;
            this.prevX = x;
            this.prevY = y;
            this.position.x = x + this.parentObject.position.x;
            this.position.y = y + this.parentObject.position.y;

            // If the ship is on this MapObject, move the ship with this object.
            if (this.shipObject && this.shipObject.moving_x == 0
                && this.shipObject.moving_y == 0) {
                this.shipObject.xVel += addX;
                this.shipObject.yVel += addY;
            }

            // If we have moved for one map point, update the mapX/mapY.
            if (this.addX > Universe.MAP_POINT_SIZE || this.addX < -Universe.MAP_POINT_SIZE) {
                addMapX += (this.addX / 15) >> 0;
                this.addX = this.addX % 15;
            }
            if (this.addY > Universe.MAP_POINT_SIZE || this.addY < -Universe.MAP_POINT_SIZE) {
                addMapY += (this.addY / 15) >> 0;
                this.addY = this.addY % 15;
            }

            this.cycles = 0;
        }
        else {
            this.cycles += 1;
        }
        this.posParam += this.speed;
    }

    this.mapX += addMapX;
    this.mapY += addMapY;

    // Move the children objects and pass our (if any) movement to them.
    for (var index = 0; index < this.childrenObjects.length; index++) {
        var obj = this.childrenObjects[index];
        obj.doOrbitalMovement(addMapX, addMapY, addX, addY);
    }
}