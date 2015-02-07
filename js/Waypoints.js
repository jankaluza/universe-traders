/**
* Represents list of waypoints. This list is used to move the MapObject (For
* example IntelligentShip) on the universe map. The object must be set using setObject()
* method.
*
* Following are the examples of valid waypoints in their string representation:
* 
* * "[10 10 40 40]" - Moves the object between MapPoints x=10, y=10 and x=40, y=40
* * "[10 10 Mars 30 30]" - Moves the object between MapPoint x=10, y=10, MapObject
* called Mars and MapPoint x=30, y=30
* * "[10 10 Mars+2 Mars+3]" - Moves the object between MapPoint x=10, y=10 and MapPoint
* x=Mars.x+2, y=Mars.y+3
* 
* @class Waypoints
* @param {ObjectManager} objManager ObjectManager.
* @param {String|Array} waypoints List of waypoints.
* @constructor
*/
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

/**
* Set object with which the waypoints should be associated.
*
* @method setObject
*/
Waypoints.prototype.setObject = function(obj) {
    this.obj = obj;
};

/**
* Returns True if the moving to the current waypoint has been finished.
*
* @method isMovingFinished
* @return {Boolean} True if the moving to the current waypoint has been finished.
*/
Waypoints.prototype.isMovingFinished = function() {
    if (this.waypoints.length === 0) {
        return false;
    }
    
    return (this.movingX > (this.obj.mapX - 3)
        && this.movingX < (this.obj.mapX + 3)
        && this.movingY > (this.obj.mapY - 3)
        && this.movingY < (this.obj.mapY + 3));
};

/**
* Refreshes current waypoint. This is needed for dynamic waypoints like Planet
* to recompute its position and the angle used by the MapObject
* associated with this Waypoints list.
*
* @method refreshCurrentPoint
* @return {Float} angle to which the object should move to reach the next
* waypoint.
*/
Waypoints.prototype.refreshCurrentPoint = function() {
    var args = this.waypoints[this.waypoint].split(" ");
    var object = null;

    // Handle "x y" or "Object+x Object+y"
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
    // Handle "Object"
    else {
        object = this.objManager.getObjectByName(args[0]);

        this.movingX = object.mapX;
        this.movingY = object.mapY;
    }

    // compute the angle to the global point where we want to end up
    var angle = Math.atan2(this.movingY - this.obj.mapY, this.movingX - this.obj.mapX);
    return angle;
};

/**
* Move to the next waypoint.
*
* @method moveToNextPoint
* @return {Float} angle to which the object should move to reach the next
* waypoint.
*/
Waypoints.prototype.moveToNextPoint = function() {
    this.waypoint = (this.waypoint + 1) % this.waypoints.length;
    return this.refreshCurrentPoint();
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Waypoints;
    }
}
