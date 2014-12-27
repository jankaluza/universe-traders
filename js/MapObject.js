function MapObject() {    
}

MapObject.PLANET = 0;
MapObject.STAR = 1;
MapObject.SHIP = 2;
MapObject.ENEMY_SHIP = 3;

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = MapObject;
    }
}
