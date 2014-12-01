function resize() {
    canvas = document.getElementById("game-canvas");
    var screen_height = window.innerHeight;
    var screen_width = window.innerWidth;
    var width = screen_width - 20;
    var height = screen_height - 20;
    if(screen_height > screen_width){
        var ratio = canvas.height/canvas.width;
        height = ratio * screen_width;
    }else{
        var ratio = canvas.width/canvas.height;
        var width = screen_height * ratio;
    }            
    canvas.style.width = width+'px';
    canvas.style.height = height+'px'; 
}

Main.WIDTH = 1024;
Main.HEIGHT = 672;
Main.CENTER_X = Main.WIDTH / 2;
Main.CENTER_Y = Main.HEIGHT / 2;

function Main() {
    this.stage = new PIXI.Stage(0x000000, true);
    this.renderer = new PIXI.autoDetectRenderer(
        Main.WIDTH,
        Main.HEIGHT,
        document.getElementById("game-canvas")
    );
    this.stop = false;
    this.itemInfo = null;
    this.msg = null;
    this.lastSaveTime = Date.now();
    this.tickRate = Date.now();

    window.addEventListener('resize', resize, false);
    resize();

    var dot = PIXI.Texture.fromImage("resources/dot.png");
    this.progressBar = new PIXI.Sprite(dot);
    this.progressBar.x = Main.CENTER_X - 100;
    this.progressBar.y = Main.CENTER_Y - 15;
    this.progressBar.height = 30;
    this.progressBar.width = 1;
    this.stage.addChild(this.progressBar);

    this.loadSpriteSheet();
}

Main.prototype.update = function() {
    var now = Date.now();
    this.universe.update(now - this.tickRate);
    if (this.map.showed) {
        this.map.update();
    }
    this.renderer.render(this.stage);

    if (!this.stop) {
        requestAnimFrame(this.update.bind(this));
    }
    
    if (now - this.lastSaveTime > 3000) {
        this.lastSaveTime = now;
        this.universe.save();
        this.inventory.save();
    }
    this.tickRate = now;
};

Main.prototype.showCenterMsg = function(msg) {
    if (this.msg) {
        this.stage.removeChild(this.msg);
    }
    this.msg = new PIXI.Text(msg, {font: "40px Snippet", fill: "white", align: "left"});
    this.msg.position.x = Main.CENTER_X - this.msg.width/2;
    this.msg.position.y = Main.CENTER_Y - this.msg.height/2;
    this.stage.addChild(this.msg);
}

Main.prototype.outOfFuel = function() {
    this.showCenterMsg("Captain, we are out of fuel!");
    this.stop = true;
}

Main.prototype.outOfFood = function() {
    this.showCenterMsg("Captain, we are out of food!");
    this.stop = true;
}

Main.prototype.outOfSanity = function() {
    this.showCenterMsg("Captain, we are crazy!");
    this.stop = true;
}

Main.prototype.lowFuel = function() {
    this.showCenterMsg("Captain, we have almost no fuel!");
}

Main.prototype.lowFood = function() {
    this.showCenterMsg("Captain, we have almost no food!");
}

Main.prototype.lowSanity = function() {
    this.showCenterMsg("Captain, we are starting to be crazy!");
}

Main.prototype.normalFuel = function() {
    this.stage.removeChild(this.msg);
    this.msg = null;
}

Main.prototype.normalFood = function() {
    this.stage.removeChild(this.msg);
    this.msg = null;
}

Main.prototype.normalSanity = function() {
    this.stage.removeChild(this.msg);
    this.msg = null;
}

Main.prototype.visitObject = function(obj) {
    this.universe.ship.sanity = 100;
    if (this.planet.showed) {
        this.planet.setPlanet(null);
        this.stage.removeChild(this.planet);
        if (this.inventory.showed) {
            this.showInventory();
        }
        this.universe.stopMove = false;
    }
    else {
        this.planet.setPlanet(obj);
        this.stage.addChild(this.planet);
        if (!this.inventory.showed) {
            this.showInventory();
        }
        this.universe.stopMove = true;
    }
    this.planet.showed = !this.planet.showed;
}

Main.prototype.showInventory = function() {
    if (this.inventory.showed) {
        this.stage.removeChild(this.inventory);
        this.closeItemInfo();
    }
    else {
        this.stage.addChild(this.inventory);
    }
    this.inventory.showed = !this.inventory.showed;
}

Main.prototype.closeItemInfo = function() {
    if (this.itemInfo) {
        this.stage.removeChild(this.itemInfo);
        this.itemInfo = null;
        this.universe.panel.updateCredit();
        this.universe.ship.updateStats();
    }
}

Main.prototype.showItemInfo = function(fromInventory, item, ship) {
    this.closeItemInfo();

    if (fromInventory) {
        if (!this.planet.showed) {
            this.itemInfo = new ItemInfo(this.itemManager, ship, item, "Drop", this.inventory, null);
        }
        else {
            this.itemInfo = new ItemInfo(this.itemManager, ship, item, "Sell", this.inventory, this.planet);
        }
    }
    else {
        this.itemInfo = new ItemInfo(this.itemManager, ship, item, "Buy", this.planet, this.inventory);
        this.itemInfo.position.x += Main.CENTER_X;
    }
    this.itemInfo.onClose = this.closeItemInfo.bind(this);
    this.stage.addChild(this.itemInfo);
}

Main.prototype.showMenu = function() {
    localStorage.clear();
    this.universe.reset();
    this.inventory.reset();
}

Main.prototype.showMap = function() {
    if (this.map.showed) {
        this.stage.removeChild(this.map);
        this.closeItemInfo();
    }
    else {
        this.stage.addChild(this.map);
    }
    this.map.showed = !this.map.showed;
}

Main.prototype.objectLeft = function() {
    if (this.inventory.showed) {
        this.showInventory();
    }
    if (this.planet.showed) {
        this.visitObject();
    }
}

Main.prototype.loadSpriteSheet = function() {
    var assetsToLoad = ["resources/4.png","resources/jupiter.png","resources/mercury.png","resources/moon.png","resources/mars.png","resources/venus.png","resources/panel.png","resources/iteminfo.png","resources/2.png","resources/inventory.png","resources/3.png","resources/universe.png","resources/sun.png","resources/earth.png","resources/planet.png","resources/ship.png","resources/neptune.png","resources/uranus.png","resources/ship_moving.png","resources/dot.png","resources/1.png","resources/map.png","resources/0.png","resources/saturn.png"];
    loader = new PIXI.AssetLoader(assetsToLoad);
    loader.onComplete = this.assetsLoaded.bind(this);
    loader.onProgress = this.assetLoaded.bind(this, loader, assetsToLoad.length);
    loader.load();
};

Main.prototype.gameLoaded = function() {
    requestAnimFrame(this.update.bind(this));
}

Main.prototype.assetLoaded = function(loader, count) {
    this.progressBar.width = (200 / count) * (count - loader.loadCount)
    this.renderer.render(this.stage);
}

Main.prototype.assetsLoaded = function() {
    this.universe = new Universe();
    this.universe.ship.onOutOfFuel = this.outOfFuel.bind(this);
    this.universe.ship.onOutOfFood = this.outOfFood.bind(this);
    this.universe.ship.onOutOfSanity = this.outOfSanity.bind(this);
    this.universe.ship.onLowFuel = this.lowFuel.bind(this);
    this.universe.ship.onLowFood = this.lowFood.bind(this);
    this.universe.ship.onLowSanity = this.lowSanity.bind(this);
    this.universe.ship.onNormalFuel = this.normalFuel.bind(this);
    this.universe.ship.onNormalFood = this.normalFood.bind(this);
    this.universe.ship.onNormalSanity = this.normalSanity.bind(this);
    this.universe.panel.onVisitObject = this.visitObject.bind(this);
    this.universe.panel.onShowInventory = this.showInventory.bind(this);
    this.universe.panel.onShowMenu = this.showMenu.bind(this);
    this.universe.panel.onShowMap = this.showMap.bind(this);
    this.universe.panel.onObjectLeft = this.objectLeft.bind(this);
    this.stage.addChild(this.universe);

    this.itemManager = new ItemManager();
    this.inventory = new Inventory(this.universe.ship, this.itemManager);
    this.inventory.onItemClicked = this.showItemInfo.bind(this, true);
    this.planet = new Planet(this.universe.ship, this.itemManager);
    this.planet.onItemClicked = this.showItemInfo.bind(this, false);

    this.map = new Map(this.universe);

    this.universe.loadMap();
    this.itemManager.loadItems();
    this.universe.onGameLoaded = this.gameLoaded.bind(this);
};

