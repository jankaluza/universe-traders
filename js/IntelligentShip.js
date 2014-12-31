function IntelligentShip(objManager, name, type, texture, x, y, items, prices, speed, waypoints, attack, defense) {
    Ship.call(this, texture, texture);

    this.attack = attack;
    this.defense = defense;
    this.objManager = objManager;
    this.collideWidth = this.width * 0.8;
    this.collideHeight = this.height * 0.8;
    this.origX = x;
    this.origY = y;
    this.mapX = x;        // X coordinate on the map.
    this.mapY = y;        // Y coordinate on the map.
    this.staged = false;  // True when Object is showed on screen.
    this.name = name;     // Name of the Object.
    this.type = type;     // Type of the Object.
    this.items = items;   // List of IDs of items sold on this Object,
    this.prices = prices; // List of floats - prices on this planet per ItemType.
    this.demand = {};      // ItemType:demand. Increasee == buy, decrease == sell.
    this.speed = speed;   // Speed of the Object.
    this.waypoints = waypoints;
    this.waypoint = 0;
    this.movingX = 0;
    this.movingY = 0;
    this.xVel = 0;
    this.yVel = 0;

    this.addX = 0;  // Internal, counts increase of position.x per tick.
    this.addY = 0;  // Internal, counts increase of position.y per tick.
    this.cycles = 0;    // Internal counter.
    this.mapText = null;
    this.disableMovement = false;
    this.closeShips = [];
    this.shootTimer = (Math.random() * 100) >> 0;
    this.respawnTimer = 0;

    while (this.prices.length != Item.LAST_CATEGORY) {
        this.prices[this.prices.length] = 1;
    }

    radio("objectTouched").subscribe(this.handleObjectTouched.bind(this));
    radio("objectLeft").subscribe(this.handleObjectLeft.bind(this));

    this.reset();
}

IntelligentShip.constructor = IntelligentShip;
IntelligentShip.prototype = Object.create(Ship.prototype);

IntelligentShip.prototype.handleObjectTouched = function(obj) {
    if (obj.name == this.name) {
        this.disableMovement = true;
    }
};

IntelligentShip.prototype.handleObjectLeft = function(obj) {
     if (obj.name == this.name) {
        this.disableMovement = false;
    }
};

IntelligentShip.prototype.destroy = function() {
    this.respawnTimer = 1000;
    this.mapX = 0;
    this.mapY = 0;
    radio("objectDestroyed").broadcast(this);
};

IntelligentShip.prototype.computeWaypointMapPoint = function() {
    var args = this.waypoints[this.waypoint].split(" ");
    if (args.length == 2) {
        this.movingX = parseInt(args[0], 10);
        this.movingY = parseInt(args[1], 10);
    }
    else {
        // TODO: Store objects in hasharray to speed up finding.
        var object = null;
        for (var index = 0; index < this.objManager.objects.length; index++) {
            if (this.objManager.objects[index].name == args[0]) {
                object = this.objManager.objects[index];
                break;
            }
        }

        this.movingX = object.mapX;
        this.movingY = object.mapY;
    }

    // compute global point where we want to end up
    var shipAngle = Math.atan2(this.movingY - this.mapY, this.movingX - this.mapX);
    this.xVel = 1.9 * Math.cos(shipAngle);
    this.yVel = 1.9 * Math.sin(shipAngle);
    this.setNewRotation(shipAngle);
};

IntelligentShip.prototype.setNextWaypoint = function() {
    if (this.waypoints.length === 0) {
        return;
    }
    
    if (this.movingX > (this.mapX - 3)
        && this.movingX < (this.mapX + 3)
        && this.movingY > (this.mapY - 3)
        && this.movingY < (this.mapY + 3)) {
        this.waypoint = (this.waypoint + 1) % this.waypoints.length;
        this.computeWaypointMapPoint();
    }
};

IntelligentShip.prototype.recountPosition = function() {

};

IntelligentShip.prototype.reset = function() {
    Ship.prototype.reset.call(this);
    this.demand = {};
    this.staged = false;
    this.mapX = this.origX;
    this.mapY = this.origY;
    this.addX = 0;
    this.addY = 0;
    this.cycles = 0;
    this.closeShips = [];
};

IntelligentShip.prototype.save = function() {
    Ship.prototype.save.call(this);
    if (this.demand.length !== 0) {
        localStorage.setItem(this.name + ".demand", JSON.stringify(this.demand));
    }

    localStorage.setItem(this.name + ".mapX", this.mapX);
    localStorage.setItem(this.name + ".mapY", this.mapY);
    localStorage.setItem(this.name + ".addX", this.addX);
    localStorage.setItem(this.name + ".addY", this.addY);
    localStorage.setItem(this.name + ".respawnTimer", this.respawnTimer);
};

IntelligentShip.prototype.load = function() {
    if (localStorage.getItem("universe.running") != "true") {
        return;
    }

    Ship.prototype.load.call(this);
    var demand = JSON.parse(localStorage.getItem(this.name + ".demand"));
    if (demand) {
        this.demand = demand;
    }

    this.mapX = parseInt(localStorage.getItem(this.name + ".mapX"));
    this.mapY = parseInt(localStorage.getItem(this.name + ".mapY"));
    this.addX = parseFloat(localStorage.getItem(this.name + ".addX"));
    this.addY = parseFloat(localStorage.getItem(this.name + ".addY"));
    this.respawnTimer = parseInt(localStorage.getItem(this.name + ".respawnTimer"));
};

IntelligentShip.prototype.shootAt = function(obj) {
    this.objManager.universe.overlay.laserShot(this, obj, 20);
};

IntelligentShip.prototype.doOrbitalMovement = function(addMapX, addMapY, addX, addY) {
    if (this.respawnTimer !== 0) {
        this.respawnTimer -= 1;
        if (this.respawnTimer === 0) {
            this.reset();
        }
    }

    if (this.staged && this.closeShips.length !== 0) {
        this.shootTimer += 1;
        if (this.shootTimer > 100) {
            var ship = this.closeShips[((Math.random() * this.closeShips.length) >> 0)];
            this.shootAt(ship);
            this.shootTimer = 0;
        }
    }

    if (this.disableMovement) {
        return;
    }

    if (this.cycles > 10) {
        this.computeWaypointMapPoint();
        this.setNextWaypoint();
        this.cycles = 0;
    }

    this.cycles += 1;
    this.addX += this.xVel;
    this.addY += this.yVel;
    this.position.x -= this.xVel;
    this.position.y -= this.yVel;

    // If we have moved for one map point, update the mapX/mapY.
    if (this.addX > Universe.MAP_POINT_SIZE || this.addX < -Universe.MAP_POINT_SIZE) {
        this.mapX += (this.addX / 15) >> 0;
        this.addX = this.addX % 15;
        this.mapX = this.mapX >> 0;
    }
    if (this.addY > Universe.MAP_POINT_SIZE || this.addY < -Universe.MAP_POINT_SIZE) {
        this.mapY += (this.addY / 15) >> 0;
        this.addY = this.addY % 15;
        this.mapY = this.mapY >> 0;
    }
    Ship.prototype.update.call(this);
};

IntelligentShip.prototype.collides = function(x, y) {
    return (x > (this.position.x - (this.collideWidth >> 1))
            && x < (this.position.x + (this.collideWidth >> 1))
            && y > (this.position.y - (this.collideHeight >> 1))
            && y < (this.position.y + (this.collideHeight >> 1)));
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = IntelligentShip;
    }
}
