function ObjectManager(universe) {
    this.universe = universe;
    this.objects = [];  // List of all available objects on map.
    this.staged = [];   // List of objects currently showed on screen.
    // List of objects needed to compute exact position of objects on screen.
    // If for example Earth is showed on screen, we need exact position of
    // Sun to compute the position of Earth. Sun is then "bound object".
    this.boundToStaged = [];
    // Parent object of all objects on screen (currently Sun).
    this.centralObject = null;
    this.ships = [];
}

ObjectManager.prototype.parseObjects = function(map) {
    var objects = {}; // tmp variable to map name:MapObject
    var key, object, obj;
    for (key in map) {
        object = map[key];
        if (object.type >= MapObject.SHIP) {
            obj = new IntelligentShip(this, key, object.type, object.texture, object.x, object.y, object.items, object.prices, object.orbit_speed, object.waypoints);
        }
        else {
            obj = new CelestialBody(this, key, object.type, object.texture, object.x, object.y, object.items, object.prices, object.orbit_a, object.orbit_b, object.orbit_speed);
        }
        this.objects[this.objects.length] = obj;
        objects[key] = obj;
        if (object.type >= MapObject.SHIP) {
            this.ships[this.ships.length] = obj;
        }
    }

    // Add parent->child relationship between objects to computer orbits
    for (key in map) {
        object = map[key];
        if (object.type >= MapObject.SHIP) {
            continue;
        }
        var center = object.orbit_center;
        if (center !== "") {
            objects[key].parentObject = objects[center];
            objects[center].childrenObjects[objects[center].childrenObjects.length] = objects[key];
        }
        else {
            this.centralObject = objects[key];
        }
    }

    this.updateObjects();
    if (this.onObjectsLoaded) this.onObjectsLoaded();
};

ObjectManager.prototype.loadObjects = function() {
    var that = this;
    var loader = new PIXI.JsonLoader("resources/map.json");
    loader.on('loaded', function(evt) {
        that.parseObjects(evt.content.content.json.map);
    });
    loader.load();
};

ObjectManager.prototype.doOrbitalMovement = function() {
    if (this.centralObject) {
        this.centralObject.doOrbitalMovement(0, 0, 0, 0);
    }
    for (var index = 0; index < this.ships.length; index++) {
        this.ships[index].doOrbitalMovement(0, 0, 0, 0);
    }
};

ObjectManager.prototype.moveObjects = function(diffX, diffY) {
    var index, obj;

    // Move the objects bound to staged objects.
    for (index = 0; index < this.boundToStaged.length; index++) {
        obj = this.boundToStaged[index];
        obj.position.x += diffX;
        obj.position.y += diffY;
    }

    // Move staged objects with the background
    for (index = 0; index < this.staged.length; index++) {
        obj = this.staged[index];
        obj.position.x += diffX;
        obj.position.y += diffY;
    }
};

ObjectManager.prototype.removeFromStage = function(obj) {
    this.staged.splice(this.staged.indexOf(obj), 1);
    obj.staged = false;
    this.universe.removeChild(obj);

    if (obj.type < MapObject.SHIP) {
        // We are removing object which still has some stagged children, so
        // this object is bound to them. Movate it to boundToStaged.
        if (obj.staggedChildren !== 0) {
            this.boundToStaged[this.boundToStaged.length] = obj;
        }

        // Decrease the "staggedChildren" of all parents of this object.
        while (obj.parentObject) {
            obj = obj.parentObject;
            obj.staggedChildren -= 1;
            // If this parent does not have any stagged children and is not
            // stagged, we can remove it from boundToStaged, because there's
            // no reason to keep it there.
            if (obj.staggedChildren === 0 && !obj.staged) {
                this.boundToStaged.splice(this.boundToStaged.indexOf(obj), 1);
            }
        }
    }
    else {
        obj.closeShips.splice(0, obj.closeShips.length);
        for (var i = 0; i < this.staged.length; i++) {
            var o = this.staged[i];
            if (o.type < MapObject.SHIP || o.name == obj.name) {
                continue;
            }

            if (obj.type === o.type) {
                continue;
            }

            for (var index = 0; index < o.closeShips.length; index++) {
                if (o.closeShips[index].name == obj.name) {
                    o.closeShips.splice(index, 1);
                    break;
                }
            }
        }
    }
};

ObjectManager.prototype.addToStage = function(obj) {
    if (obj.type >= MapObject.SHIP) {
        obj.staged = true;
        this.staged[this.staged.length] = obj;
        obj.position.x = -(obj.mapX - this.left) * Universe.MAP_POINT_SIZE;
        obj.position.y = -(obj.mapY - this.top) * Universe.MAP_POINT_SIZE;
        this.universe.addChildAt(obj, this.universe.children.length - 1);

        for (var i = 0; i < this.staged.length; i++) {
            var o = this.staged[i];
            if (o.type < MapObject.SHIP || o.name == obj.name) {
                continue;
            }

            if (obj.type === o.type) {
                continue;
            }

            o.closeShips[o.closeShips.length] = obj;
            obj.closeShips[obj.closeShips.length] = o;
        }
        return;
    }

    // We are adding object which has been in boundToStagged before, so we have
    // to remove it from boundToStagged.
    if (obj.staggedChildren !== 0) {
        this.boundToStaged.splice(this.boundToStaged.indexOf(obj), 1);
    }
    // If we are adding object which has not been bound to any object yet,
    // we have to update its coordinates
    else {
        obj.position.x = -(obj.mapX - this.left) * Universe.MAP_POINT_SIZE;
        obj.position.y = -(obj.mapY - this.top) * Universe.MAP_POINT_SIZE;
    }
    obj.staged = true;
    this.staged[this.staged.length] = obj;
    this.universe.addChildAt(obj, 0);

    // Increase the staggedChildren counter of all parents.
    while (obj.parentObject) {
        obj = obj.parentObject;
        obj.staggedChildren += 1;
        // If the parent is not in boundToStaged list, add it there.
        if (obj.staggedChildren == 1 && !obj.staged) {
            obj.position.x = -(obj.mapX - this.left) * Universe.MAP_POINT_SIZE;
            obj.position.y = -(obj.mapY - this.top) * Universe.MAP_POINT_SIZE;
            this.boundToStaged[this.boundToStaged.length] = obj;
        }
    }
};

ObjectManager.prototype.getObject = function(x, y) {
    for (var index = 0; index < this.staged.length; index++) {
        var obj = this.staged[index];
        if (x > (obj.position.x - (obj.width >> 1))
            && x < (obj.position.x - (obj.width >> 1)) + obj.width
            && y > (obj.position.y - (obj.height >> 1))
            && y < (obj.position.y - (obj.height >> 1)) + obj.height) {
            return obj;
        }
    }
    return null;
};

ObjectManager.prototype.updateObjects = function() {
    // Get the current screen borders
    this.left = ((this.universe.tilePositionX + Main.WIDTH) / Universe.MAP_POINT_SIZE) >> 0;
    this.right = ((this.universe.tilePositionX) / Universe.MAP_POINT_SIZE) >> 0;
    this.top = ((this.universe.tilePositionY + Main.HEIGHT) / Universe.MAP_POINT_SIZE) >> 0;
    this.bottom = ((this.universe.tilePositionY) / Universe.MAP_POINT_SIZE) >> 0;
    var visitedObject = null;

    for (var index = 0; index < this.objects.length; index++) {
        var obj = this.objects[index];
        // If this object is not staged, check if it is close to the screen
        // and add it to screen.
        if (!obj.staged && obj.mapX <= this.left + 18 && obj.mapX >= this.right - 18 && obj.mapY <= this.top + 18 && obj.mapY >= this.bottom - 18) {
            this.addToStage(obj);
        }
        // For staged object, remove it if it is no close
        // to screen anymore.
        else if (obj.staged && (obj.mapX > this.left + 18 || obj.mapX < this.right - 18 || obj.mapY > this.top + 18 || obj.mapY < this.bottom - 18)) {
            this.removeFromStage(obj);
        }
        // If the ship is above the object, mark object as visited.
        else if (obj.staged && obj.collides(Main.CENTER_X, Main.CENTER_Y)) {
            visitedObject = obj;
        }
    }

    return visitedObject;
};

ObjectManager.prototype.updateStaggedObjects = function() {
    var visitedObject = null;

    for (var index = 0; index < this.objects.length; index++) {
        var obj = this.objects[index];
        // If this object is not staged, check if it is close to the screen
        // and add it to screen.
        if (!obj.staged && obj.mapX <= this.left + 18 && obj.mapX >= this.right - 18 && obj.mapY <= this.top + 18 && obj.mapY >= this.bottom - 18) {
            this.addToStage(obj);
        }
        // For staged object, remove it if it is no close
        // to screen anymore.
        else if (obj.staged && (obj.mapX > this.left + 18 || obj.mapX < this.right - 18 || obj.mapY > this.top + 18 || obj.mapY < this.bottom - 18)) {
            this.removeFromStage(obj);
        }
        // If the ship is above the object, mark object as visited.
        else if (obj.staged && obj.collides(Main.CENTER_X, Main.CENTER_Y)) {
            visitedObject = obj;
        }
    }

    return visitedObject;
};

ObjectManager.prototype.reset = function() {
    for (var index = 0; index < this.objects.length; index++) {
        var obj = this.objects[index];
        if (obj.staged) {
            this.universe.removeChild(obj);
        }
        obj.reset();
    }

    if (this.centralObject) {
        this.centralObject.recountPosition();
    }

    this.staged.length = 0;
    this.boundToStaged.length = 0;
    console.log("reset");
};

ObjectManager.prototype.save = function() {
    for (var index = 0; index < this.objects.length; index++) {
        var obj = this.objects[index];
        obj.save();
    }
};

ObjectManager.prototype.load = function() {
    // Reset everything before loading, otherwise we would
    // have some objects already on screen, but on bad coordinates.
    this.reset();
    // Load all objects.
    for (var index = 0; index < this.objects.length; index++) {
        var obj = this.objects[index];
        obj.load();
    }
    // And now update them, so we have proper coordinates of the objects.
    this.updateObjects();
    if (this.centralObject) {
        this.centralObject.recountPosition();
    }
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = ObjectManager;
    }
}
