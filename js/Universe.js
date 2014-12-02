function Universe(stage) {
    var texture = PIXI.Texture.fromImage("resources/universe.png");
    PIXI.TilingSprite.call(this, texture, Main.WIDTH, Main.HEIGHT);

    // Create ship
    this.ship = new Ship();
    this.addChild(this.ship);

    this.panel = new Panel(this, this.ship);
    this.addChild(this.panel);

    this.interactive=true;
    this.hitArea = new PIXI.Rectangle(0, this.panel.height, Main.WIDTH, Main.HEIGHT - this.panel.height);

    this.objManager = new ObjectManager(this);
    this.objManager.onObjectsLoaded = this.objectsLoaded.bind(this);

    this.stopMove = false;
    this.orbitTimer = 0;
    this.statsTimer = 0;

    this.reset();
}

Universe.constructor = Universe;
Universe.prototype = Object.create(PIXI.TilingSprite.prototype);

// Map is divided into 15x15 px squares
Universe.MAP_POINT_SIZE = 15;

Universe.prototype.reset = function() {
    // Start somewhere in the middle of the map
    this.tilePosition.x = 1000 * Universe.MAP_POINT_SIZE;
    this.tilePosition.y = 1000 * Universe.MAP_POINT_SIZE;

    // Coordinates to which the ship is moving when user clicks
    this.moving_x = 0;
    this.moving_y = 0;

    // X and Y velocity (step) by which the ship moves
    this.xVel = 0;
    this.yVel = 0;

    this.ship.reset();
    this.objManager.reset();
    var visitedObject = this.objManager.updateObjects();
    this.panel.setObject(visitedObject);
    this.panel.updateCredit();
}

Universe.prototype.save = function() {
    localStorage.setItem("universe.moving_x", this.moving_x);
    localStorage.setItem("universe.moving_y", this.moving_y);
    localStorage.setItem("universe.xVel", this.xVel);
    localStorage.setItem("universe.yVel", this.yVel);
    localStorage.setItem("universe.running", true);
    localStorage.setItem("universe.x", this.tilePosition.x);
    localStorage.setItem("universe.y", this.tilePosition.y);

    this.ship.save();
    this.objManager.save();
}

Universe.prototype.load = function() {
    if (localStorage.getItem("universe.running") != "true") {
        if (this.onGameLoaded) this.onGameLoaded();
        return;
    }

    console.log("loading previosly saved game");

    this.moving_x = parseFloat(localStorage.getItem("universe.moving_x"));
    this.moving_y = parseFloat(localStorage.getItem("universe.moving_y"));
    this.xVel = parseFloat(localStorage.getItem("universe.xVel"));
    this.yVel = parseFloat(localStorage.getItem("universe.yVel"));
    this.tilePosition.x = parseInt(localStorage.getItem("universe.x"));
    this.tilePosition.y = parseInt(localStorage.getItem("universe.y"));

    this.ship.load();
    this.objManager.load();

    var visitedObject = this.objManager.updateObjects();
    this.panel.setObject(visitedObject);
    this.panel.updateCredit();
    if (this.onGameLoaded) this.onGameLoaded();
}

Universe.prototype.loadMap = function() {
    this.objManager.loadObjects();
}

Universe.prototype.click = function(data) {
    if (this.stopMove) {
        return;
    }
    // We have to use point reflection with the screen center to get the proper
    // point, because we are moving with the background which has to move the
    // opposite direction than the point where the mouse is to simulate ship
    // movement.
    var x = Main.WIDTH - data.global.x;
    var y = Main.HEIGHT - data.global.y;

    // compute global point where we want to end up
    this.moving_x = ((this.tilePosition.x + x) / Universe.MAP_POINT_SIZE) >> 0;
    this.moving_y = ((this.tilePosition.y + y) / Universe.MAP_POINT_SIZE) >> 0;
    var visitedObject = this.objManager.updateObjects();

    var shipAngle = Math.atan2(y - Main.HEIGHT/2, x - Main.WIDTH/2);
    this.xVel = this.ship.speed * Math.cos(shipAngle);
    this.yVel = this.ship.speed * Math.sin(shipAngle);

    this.ship.setNewRotation(shipAngle);
}

Universe.prototype.update = function(dt) {
    this.orbitTimer += dt;
    if (this.orbitTimer > 25) {
        this.orbitTimer = 0;
        this.objManager.doOrbitalMovement();

        var visitedObject = this.objManager.updateStaggedObjects();
        if (visitedObject) {
            this.panel.setObject(visitedObject);
        }
    }

    this.statsTimer += dt;
    if (this.statsTimer > 1000) {
        this.statsTimer = 0;
        this.ship.timeout();
        this.panel.update();
    }

    // Move the background if user clicked somewhere (so we have xVel and yVel)
    if (this.xVel != 0 || this.yVel !=0) {
        var center_x = ((this.tilePosition.x + Main.WIDTH/2) / Universe.MAP_POINT_SIZE) >> 0;
        var center_y = ((this.tilePosition.y + Main.HEIGHT/2) / Universe.MAP_POINT_SIZE) >> 0;
        var oldX = center_x;
        var oldY = center_y;
        var xVel = this.xVel;
        var yVel = this.yVel;

        if (center_x != this.moving_x) {
            if (this.xVel != 0) {
                this.tilePosition.x += xVel;
                center_x = ((this.tilePosition.x + Main.WIDTH/2) / Universe.MAP_POINT_SIZE) >> 0;
                if (this.moving_x == 0) {
                    this.xVel = 0;
                }
                else if (oldX > this.moving_x && center_x < this.moving_x || oldX < this.moving_x && center_x > this.moving_x) {
                    this.tilePosition.x = (-this.moving_x - Main.WIDTH/2/Universe.MAP_POINT_SIZE) * Universe.MAP_POINT_SIZE;
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
            if (this.yVel != 0) {
                this.tilePosition.y += yVel;
                center_y = ((this.tilePosition.y + Main.HEIGHT/2) / Universe.MAP_POINT_SIZE) >> 0;
                if (this.moving_y == 0) {
                    this.yVel = 0;
                }
                else if (oldY > this.moving_y && center_y < this.moving_y || oldY < this.moving_y && center_y > this.moving_y) {
                    this.tilePosition.y = (-this.moving_y - Main.HEIGHT/2/Universe.MAP_POINT_SIZE) * Universe.MAP_POINT_SIZE;
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
//         console.log("ship: " + center_x + " " + center_y);
            this.panel.update();
            var visitedObject = this.objManager.updateObjects();
            this.panel.setObject(visitedObject);
            if (visitedObject && visitedObject.type != MapObject.STAR) {
                this.panel.coordinates.setText(center_x + " " + center_y + " | " + visitedObject.mapX + " " + visitedObject.mapY);
            }
            else {
                this.ship.moved();
                this.panel.coordinates.setText(center_x + " " + center_y);
            }
        }

        if (this.xVel == 0 && this.yVel == 0) {
            this.ship.setTexture(this.ship.stayingTexture);
        }
    }

    this.ship.update();
};

Universe.prototype.objectsLoaded = function() {
    var visitedObject = this.objManager.updateObjects();
    this.panel.setObject(visitedObject);
    this.load();
}
