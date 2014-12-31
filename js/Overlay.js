function Overlay(universe) {
    PIXI.Graphics.call(this);
    this.width = Main.WIDTH;
    this.height = Main.HEIGHT;
    this.position.x = 0;
    this.position.y = 0;

    this.universe = universe;
    this.shots = [];
    this.showed = false;
}

Overlay.constructor = Overlay;
Overlay.prototype = Object.create(PIXI.Graphics.prototype);

Overlay.prototype.laserShot = function(from, to, time) {
    this.shots[this.shots.length] = [from, to, time];
    if (!this.showed) {
        this.universe.addChild(this);
        this.showed = true;
    }

    to.fuel -= time * from.attack * (1 - to.defense);
    to.fuel = to.fuel >> 0;
    if (to.fuel <= 0) {
        radio("objectDestroyed").broadcast(to);
        console.log("objectDestroyed " + to.name)
    }
    else {
        console.log("objectHit " + to.name + " " + to.fuel)
    }
};

Overlay.prototype.update = function() {
    if (!this.showed) {
        return;
    }

    this.clear();

    for (var i = 0; i < this.shots.length; i++) {
        var from = this.shots[i][0];
        var to = this.shots[i][1];
        this.lineStyle(2, 0xff0000, 1);
        this.moveTo(from.position.x, from.position.y);
        this.lineTo(to.position.x, to.position.y);

        this.lineStyle(1, 0x006600, 1);
        this.beginFill(0x005500, 0.2);
        this.drawCircle(to.position.x, to.position.y, to.width/2);
        this.endFill();
        
        this.shots[i][2] -= 1;
        if (this.shots[i][2] <= 0) {
            this.shots.splice(i, 1);
            i -= 1;

            if (this.shots.length === 0) {
                this.universe.removeChild(this);
                this.showed = false;
            }
        }
    }
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Overlay;
    }
}
