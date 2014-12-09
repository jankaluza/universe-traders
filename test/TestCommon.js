
exports.prepareTest = function() {
    var jsdom = require("jsdom");
    var canvas = require('canvas');
    global.Image = canvas.Image;

    Main.WIDTH = 1024; Main.HEIGHT = 672; Main.CENTER_X = Main.WIDTH / 2; Main.CENTER_Y = Main.HEIGHT / 2;
    function Main() {}
    global.Main = Main;

    if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
    }

    window = jsdom.jsdom('<html><head></head><body><div id="rondavu_container"></div></body></html>')
    global.window = window.parentWindow;
    global.document = window.document;

    global.PIXI = require("../bower_components/pixi.js/bin/pixi.js")
    global.radio = require("../bower_components/radio/radio.min.js")
    global.Ship = require("../js/Ship.js");
    global.Item = require("../js/Item.js");
    global.ItemSprite = require("../js/ItemSprite.js");
    global.ItemManager = require("../js/ItemManager.js");
    global.Inventory = require("../js/Inventory.js");
    global.Dialog = require("../js/Dialog.js");
    global.DialogManager = require("../js/DialogManager.js");
}
