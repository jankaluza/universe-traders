/**
* Represents the universe as seen by the player. Controls the ship
* and planets movement.
*
* @class Universe
* @constructor
*/
function Universe() {
    var texture = PIXI.Texture.fromImage("resources/universe.png");
    PIXI.extras.TilingSprite.call(this, texture, Main.WIDTH, Main.HEIGHT);

    this.overlay = new Overlay(this);

    // Create ship
    this.ship = new PlayerShip();
    this.addChild(this.ship);

    this.panel = new Panel(this, this.ship);
    this.addChild(this.panel);

    this.interactive = true;
    this.hitArea = new PIXI.Rectangle(0, this.panel.height, Main.WIDTH, Main.HEIGHT - this.panel.height);

    this.objManager = new ObjectManager(this);
    this.objManager.onObjectsLoaded = this.objectsLoaded.bind(this);

    this.stopMove = false;
    this.orbitTimer = 0;
    this.statsTimer = 0;
    this.shootTimer = 0;
    this.currentObject = null;
    this.objectToMove = null;

    this.mapX = 0;
    this.mapY = 0;

    radio("dialogStarted").subscribe(this.stopMovement.bind(this));
    radio("dialogFinished").subscribe(this.continueMovement.bind(this));
    radio("objectVisited").subscribe(this.stopMovement.bind(this));
    radio("objectVisitFinished").subscribe(this.continueMovement.bind(this));

    this.reset();
}

Universe.constructor = Universe;
Universe.prototype = Object.create(PIXI.extras.TilingSprite.prototype);

// Map is divided into 15x15 px squares
Universe.MAP_POINT_SIZE = 15;

/**
* Stops the movement of the Ship. After calling this method, user can't move
* the Ship anymore. Used for example when Dialog is showed.
*
* @method stopMovement
*/
Universe.prototype.stopMovement = function() {
    this.stopMove = true;
    if (this.xVel || this.yVel) {
        this.moving_x = ((this.tilePositionX + Main.WIDTH / 2) / Universe.MAP_POINT_SIZE) >> 0;
        this.moving_y = ((this.tilePositionY + Main.HEIGHT / 2) / Universe.MAP_POINT_SIZE) >> 0;
    }
};

/**
* Starts handling the Ship movement again.
*
* @method continueMovement
*/
Universe.prototype.continueMovement = function() {
    this.stopMove = false;
};

/**
* Resets (reinitializes) the universe. Used when restarting the game.
*
* @method reset
*/
Universe.prototype.reset = function() {
    // Start somewhere in the middle of the map
    this.tilePosition.x = this.tilePositionX = 990 * Universe.MAP_POINT_SIZE;
    this.tilePosition.y = this.tilePositionY = 990 * Universe.MAP_POINT_SIZE;

    // Coordinates to which the ship is moving when user clicks
    this.moving_x = 0;
    this.moving_y = 0;

    // X and Y velocity (step) by which the ship moves
    this.xVel = 0;
    this.yVel = 0;
    this.currentObject = null;

    this.ship.reset();
    this.objManager.reset();
    var visitedObject = this.objManager.updateObjects();
    this.setCurrentObject(visitedObject);
    this.panel.updateCredit();
};

/**
* Saves the Universe (including the Ship and Objects) to localStorage.
*
* @method save
*/
Universe.prototype.save = function() {
    localStorage.setItem("universe.moving_x", this.moving_x);
    localStorage.setItem("universe.moving_y", this.moving_y);
    localStorage.setItem("universe.xVel", this.xVel);
    localStorage.setItem("universe.yVel", this.yVel);
    localStorage.setItem("universe.running", true);
    localStorage.setItem("universe.x", this.tilePositionX);
    localStorage.setItem("universe.y", this.tilePositionY);

    this.ship.save();
    this.objManager.save();
};

/**
* Loads the Universe (including the Ship and Objects) from localStorage.
* Calls this.onGameLoaded() when finished.
*
* @method load
*/
Universe.prototype.load = function() {
    if (localStorage.getItem("universe.running") !== "true") {
        if (this.onGameLoaded) {
            this.onGameLoaded();
        }
        return;
    }

    console.log("loading previosly saved game");

    this.moving_x = parseFloat(localStorage.getItem("universe.moving_x"));
    this.moving_y = parseFloat(localStorage.getItem("universe.moving_y"));
    this.xVel = parseFloat(localStorage.getItem("universe.xVel"));
    this.yVel = parseFloat(localStorage.getItem("universe.yVel"));
    this.tilePositionX = this.tilePosition.x = parseInt(localStorage.getItem("universe.x"), 10);
    this.tilePositionY = this.tilePosition.y = parseInt(localStorage.getItem("universe.y"), 10);

    this.ship.load();
    this.objManager.load();

    var visitedObject = this.objManager.updateObjects();
    this.setCurrentObject(visitedObject);
    this.panel.updateCredit();
    if (this.onGameLoaded) {
        this.onGameLoaded();
    }
};

/**
* Loads the map of the Universe. Also calls this.load() when map is loaded.
*
* @method loadMap
*/
Universe.prototype.loadMap = function() {
    this.objManager.loadObjects();
};

/**
* Moves the Ship (center of the screen) to the defined coordinates.
*
* @param {Number} mapX X coordinate.
* @param {Number} mapY Y coordinate.
* @method moveToMapPoint
*/
Universe.prototype.moveToMapPoint = function(mapX, mapY) {
    this.moving_x = mapX;
    this.moving_y = mapY;
    var visitedObject = this.objManager.updateObjects();

    // compute global point where we want to end up
    var x = mapX * Universe.MAP_POINT_SIZE - this.tilePositionX;
    var y = mapY * Universe.MAP_POINT_SIZE - this.tilePositionY;
    var shipAngle = Math.atan2(y - Main.HEIGHT/2, x - Main.WIDTH/2);
    this.xVel = this.ship.speed * Math.cos(shipAngle);
    this.yVel = this.ship.speed * Math.sin(shipAngle);

    this.ship.setNewRotation(shipAngle);
};

/**
* Moves the Ship (center of the screen) to the global coordinates (pixels).
*
* @param {Number} x X coordinate.
* @param {Number} x Y coordinate.
* @method moveToGlobalPoint
*/
Universe.prototype.moveToGlobalPoint = function(x, y) {
    // compute map point where we want to end up
    this.moving_x = ((this.tilePositionX + x) / Universe.MAP_POINT_SIZE) >> 0;
    this.moving_y = ((this.tilePositionY + y) / Universe.MAP_POINT_SIZE) >> 0;
    var visitedObject = this.objManager.updateObjects();

    var shipAngle = Math.atan2(y - Main.HEIGHT/2, x - Main.WIDTH/2);
    this.xVel = this.ship.speed * Math.cos(shipAngle);
    this.yVel = this.ship.speed * Math.sin(shipAngle);

    this.ship.setNewRotation(shipAngle);
};

/**
* Moves the Ship (center of the screen) to the MapObject.
*
* @param {MapObject} object MapObject to move to.
* @method moveToObject
*/
Universe.prototype.moveToObject = function(object) {
    this.objectToMove = object;
    if (object) {
        this.moveToMapPoint(object.mapX, object.mapY);
    }
};

/**
* Handles 'click' event. Moves the ship (center of the screen) to coordinates
* defined by click.
*
* @method click
* @private
*/
Universe.prototype.click = function(data) {
    if (this.stopMove) {
        return;
    }

    var object = this.objManager.getObject(data.global.x, data.global.y, MapObject.ENEMY_SHIP);
    if (object) {
        if (this.shootTimer > 2000) {
            this.shootTimer = 0;
            this.overlay.laserShot(this.ship, object, 20);
        }
        return;
    }

    // We have to use point reflection with the screen center to get the proper
    // point, because we are moving with the background which has to move the
    // opposite direction than the point where the mouse is to simulate ship
    // movement.
    var x = Main.WIDTH - data.global.x;
    var y = Main.HEIGHT - data.global.y;

    this.moveToGlobalPoint(x, y);
};

/**
* Sets the current object which is under the Ship.
*
* @param {MapObject} object MapObject under the ship or null.
* @method setCurrentObject
* @private
*/
Universe.prototype.setCurrentObject = function(object) {
    if (!object && ! this.currentObject) {
        return;
    }

    // This means object == this.currentObject
    if (object && object.shipObject && this.currentObject.type == MapObject.PLANET) {
        return;
    }

//     console.log("currentObjectChanged " + object.type);
    if (this.currentObject) {
        if (!object || object.type == MapObject.PLANET) {
            this.currentObject.shipObject = null;
        }
        radio("objectLeft").broadcast(this.currentObject);
    }

    this.currentObject = object;

    if (object) {
        if (object.type == MapObject.PLANET) {
            object.shipObject = this;
        }
        radio("objectTouched").broadcast(object);
    }

};

/**
* Updates the universe. This is the main looping method of the game called
* on every tick.
*
* @param {Number} dt Time elapsed since the previous execution of this method.
* @method update
*/
Universe.prototype.update = function(dt) {
    var visitedObject;

    this.orbitTimer += dt;
    if (this.orbitTimer > 25) {
        this.orbitTimer = 0;
        this.objManager.doOrbitalMovement();

        visitedObject = this.objManager.updateStaggedObjects();
        if (!this.stopMove) {
            this.setCurrentObject(visitedObject);
        }
    }

    this.statsTimer += dt;
    this.shootTimer += dt;
    if (this.statsTimer > 1000) {
        this.statsTimer = 0;
        this.ship.timeout();
        this.panel.update();
    }

    // Move the background if user clicked somewhere (so we have xVel and yVel)
    if (this.xVel !== 0 || this.yVel !== 0) {
        var center_x = ((this.tilePositionX + Main.WIDTH/2) / Universe.MAP_POINT_SIZE) >> 0;
        var center_y = ((this.tilePositionY + Main.HEIGHT/2) / Universe.MAP_POINT_SIZE) >> 0;
        var oldX = center_x;
        var oldY = center_y;
        var xVel = this.xVel;
        var yVel = this.yVel;

        if (center_x != this.moving_x) {
            if (this.xVel !== 0) {
                this.tilePosition.x += xVel;
                this.tilePositionX += xVel;
                center_x = ((this.tilePositionX + Main.WIDTH/2) / Universe.MAP_POINT_SIZE) >> 0;
                if (this.moving_x === 0) {
                    this.xVel = 0;
                }
                else if (oldX > this.moving_x && center_x < this.moving_x || oldX < this.moving_x && center_x > this.moving_x) {
                    this.tilePosition.x = this.tilePositionX = (-this.moving_x - Main.WIDTH/2/Universe.MAP_POINT_SIZE) * Universe.MAP_POINT_SIZE;
                    this.xVel = 0;
                    this.moving_x = 0;
                }
            }
        }
        else {
            this.xVel = 0;
            this.moving_x = 0;
        }

        if (center_y != this.moving_y) {
            if (this.yVel !== 0) {
                this.tilePosition.y += yVel;
                this.tilePositionY += yVel;
                center_y = ((this.tilePositionY + Main.HEIGHT/2) / Universe.MAP_POINT_SIZE) >> 0;
                if (this.moving_y === 0) {
                    this.yVel = 0;
                }
                else if (oldY > this.moving_y && center_y < this.moving_y || oldY < this.moving_y && center_y > this.moving_y) {
                    this.tilePosition.y = this.tilePositionY = (-this.moving_y - Main.HEIGHT/2/Universe.MAP_POINT_SIZE) * Universe.MAP_POINT_SIZE;
                    this.yVel = 0;
                    this.moving_y = 0;
                }
            }
        }
        else {
            this.yVel = 0;
            this.moving_y = 0;
        }

        this.objManager.moveObjects(xVel, yVel);

        if (oldX != center_x || oldY != center_y) {
            this.panel.update();
            visitedObject = this.objManager.updateObjects();
            this.setCurrentObject(visitedObject);
            if (!visitedObject || visitedObject.type != MapObject.PLANET) {
                this.ship.moved();
            }
        }

        if (this.xVel === 0 && this.yVel === 0) {
            this.ship.texture = this.ship.stayingTexture;
        }

        if (this.objectToMove) {
            if (center_x != this.objectToMove.mapX && center_y != this.objectToMove.mapY) {
                this.moveToObject(this.objectToMove);
            }
            else {
                this.moveToObject(null);
            }
        }
    }

    this.ship.update();
    this.overlay.update();
};

/**
* Called when all the objects on the map are loaded.
*
* @method objectsLoaded
* @private
*/
Universe.prototype.objectsLoaded = function() {
    var visitedObject = this.objManager.updateObjects();
    this.setCurrentObject(visitedObject);
    this.objManager.reset();
    this.load();
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Universe;
    }
}
