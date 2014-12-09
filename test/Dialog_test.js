var jsdom = require("jsdom");
var canvas = require('canvas');
global.Image = canvas.Image;

Main.WIDTH = 1024;
Main.HEIGHT = 672;
Main.CENTER_X = Main.WIDTH / 2;
Main.CENTER_Y = Main.HEIGHT / 2;

function Main() {}
global.Main = Main;

window = jsdom.jsdom('<html><head></head><body><div id="rondavu_container"></div></body></html>')
global.window = window.parentWindow;
global.document = window.document;

global.PIXI = require("../bower_components/pixi.js/bin/pixi.js")
global.Ship = require("../js/Ship.js");
global.ItemManager = require("../js/ItemManager.js");
require("../js/Inventory.js");
require("../js/Dialog.js");

exports['Dialog'] = {
    setUp: function(done) {
        this.ship = new Ship();
        done();
    },
    createShip: function(test) {
        test.expect(1);
        test.equal(this.ship.food, 100);
        test.done();
    },
};
