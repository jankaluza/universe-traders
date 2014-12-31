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
    var hit = (time * from.attack * (1 - to.defense)) >> 0;
    to.fuel -= hit;
    to.fuel = to.fuel >> 0;
    if (to.fuel <= 0) {
        to.destroy();
    }

    var hitText = new PIXI.Text("-" + hit, {font: "24px Snippet", fill: "white", align: "left"});
    this.addChild(hitText);

    this.shots[this.shots.length] = [from, to, time, hitText];
    if (!this.showed) {
        this.universe.addChild(this);
        this.showed = true;
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

        this.shots[i][3].position.x = to.position.x + to.width/2;
        this.shots[i][3].position.y = to.position.y - from.height/2;
        
        this.shots[i][2] -= 1;
        if (this.shots[i][2] <= 0) {
            this.removeChild(this.shots[i][3]);
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
