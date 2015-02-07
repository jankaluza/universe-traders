function Waypoints(objManager, waypoints) {
    this.waypoints = [];
    this.obj = null;
    this.movingX = 0;
    this.movingY = 0;
    this.waypoint = 0;
    this.objManager = objManager;
    this.setWaypoints(waypoints);
}

Waypoints.constructor = Waypoints;

Waypoints.prototype.setWaypoints = function(arg) {
    if (Array.isArray(arg)) {
        this.waypoints = arg;
        return;
    }

    this.waypoints = [];
    var left = arg.indexOf("[");
    if (left == -1) {
        return;
    }

    var right = arg.indexOf("]", left);
    if (right == -1) {
        return;
    }

    var args = arg.substring(left + 1, right).split(" ");
    for (var i = 0; i < args.length; i++) {
        var a = parseInt(args[i], 10);
        if (isNaN(a) && args[i].indexOf("+") == -1) {
            this.waypoints[this.waypoints.length] = args[i];
        }
        else {
            this.waypoints[this.waypoints.length] = args[i] + " " + args[i + 1];
            i += 1;
        }
    }
};

Waypoints.prototype.setObject = function(obj) {
    this.obj = obj;
};

Waypoints.prototype.isMovingFinished = function() {
    if (this.waypoints.length === 0) {
        return false;
    }
    
    return (this.movingX > (this.obj.mapX - 3)
        && this.movingX < (this.obj.mapX + 3)
        && this.movingY > (this.obj.mapY - 3)
        && this.movingY < (this.obj.mapY + 3));
};

Waypoints.prototype.refreshCurrentPoint = function() {
    var args = this.waypoints[this.waypoint].split(" ");
    var object = null;
    if (args.length == 2) {
        var x = args[0].split("+");
        if (x.length == 2) {
            object = this.objManager.getObjectByName(x[0]);
            this.movingX = object.mapX + parseInt(x[1], 10);
        }
        else {
            this.movingX = parseInt(x[0], 10);
        }
        var y = args[1].split("+");
        if (y.length == 2) {
            object = this.objManager.getObjectByName(y[0]);
            this.movingY = object.mapY + parseInt(y[1], 10);
        }
        else {
            this.movingY = parseInt(y[0], 10);
        }
    }
    else {
        object = this.objManager.getObjectByName(args[0]);

        this.movingX = object.mapX;
        this.movingY = object.mapY;
    }

    // compute global point where we want to end up
    var angle = Math.atan2(this.movingY - this.obj.mapY, this.movingX - this.obj.mapX);
    return angle;
};

Waypoints.prototype.moveToNextPoint = function() {
    this.waypoint = (this.waypoint + 1) % this.waypoints.length;
    return this.refreshCurrentPoint();
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Waypoints;
    }
}
