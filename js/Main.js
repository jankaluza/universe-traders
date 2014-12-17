function resize() {
    canvas = document.getElementById("game-canvas");
    var screen_height = window.innerHeight;
    var screen_width = window.innerWidth;
    var width = screen_width - 20;
    var height = screen_height - 20;
    var ratio;
    if(screen_height > screen_width){
        ratio = canvas.height/canvas.width;
        height = ratio * screen_width;
    }else{
        ratio = canvas.width/canvas.height;
        width = screen_height * ratio;
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
    var rendererOptions = {
        view:document.getElementById("game-canvas"),
        resolution:1
    };
    this.renderer = new PIXI.autoDetectRenderer(Main.WIDTH, Main.HEIGHT,
                                                rendererOptions);
    this.stop = false;
    this.itemInfo = null;
    this.msg = null;
    this.lastSaveTime = Date.now();
    this.tickRate = Date.now();

    window.addEventListener('resize', resize, false);
    resize();

    this.loadAssets();
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
};

Main.prototype.outOfFuel = function() {
    this.showCenterMsg("Captain, we are out of fuel!");
    this.universe.stopMove = true;
};

Main.prototype.outOfFood = function() {
    this.showCenterMsg("Captain, we are out of food!");
    this.universe.stopMove = true;
};

Main.prototype.outOfSanity = function() {
    this.showCenterMsg("Captain, we are crazy!");
    this.universe.stopMove = true;
};

Main.prototype.lowFuel = function() {
    this.showCenterMsg("Captain, we have almost no fuel!");
    this.universe.stopMove = false;
};

Main.prototype.lowFood = function() {
    this.showCenterMsg("Captain, we have almost no food!");
};

Main.prototype.lowSanity = function() {
    this.showCenterMsg("Captain, we are starting to be crazy!");
};

Main.prototype.normalFuel = function() {
    this.stage.removeChild(this.msg);
    this.msg = null;
    this.universe.stopMove = false;
};

Main.prototype.normalFood = function() {
    this.stage.removeChild(this.msg);
    this.msg = null;
};

Main.prototype.normalSanity = function() {
    this.stage.removeChild(this.msg);
    this.msg = null;
};

Main.prototype.visitObject = function(obj) {
    this.universe.ship.sanity = 100;
    if (this.planet.showed) {
        this.planet.setPlanet(null);
        this.stage.removeChild(this.planet);
        if (this.inventory.showed) {
            this.showInventory();
        }
        radio("objectVisitFinished").broadcast();
    }
    else {
        this.planet.setPlanet(obj);
        this.stage.addChild(this.planet);
        if (!this.inventory.showed) {
            this.showInventory();
        }
        radio("objectVisited").broadcast();
    }
    this.planet.showed = !this.planet.showed;
};

Main.prototype.showInventory = function() {
    if (this.inventory.showed) {
        this.stage.removeChild(this.inventory);
        this.closeItemInfo();
    }
    else {
        this.stage.addChild(this.inventory);
    }
    this.inventory.showed = !this.inventory.showed;
};

Main.prototype.closeItemInfo = function() {
    if (this.itemInfo) {
        this.stage.removeChild(this.itemInfo);
        this.itemInfo = null;
        this.universe.panel.updateCredit();
        this.universe.ship.updateStats();
    }
};

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
};

Main.prototype.showMenu = function() {
    if (this.menu.showed) {
        this.stage.removeChild(this.menu);
    }
    else {
        this.stage.addChild(this.menu);
    }
    this.menu.showed = !this.menu.showed;
};

Main.prototype.showMap = function() {
    if (this.map.showed) {
        this.stage.removeChild(this.map);
        this.closeItemInfo();
    }
    else {
        this.stage.addChild(this.map);
    }
    this.map.showed = !this.map.showed;
};

Main.prototype.restartGame = function() {
    if (this.menu.showed) {
        this.stage.removeChild(this.menu);
    }
    localStorage.clear();
    this.universe.reset();
    this.inventory.reset();
    this.dialogManager.reset();
};

Main.prototype.gameLoaded = function() {
    requestAnimFrame(this.update.bind(this));
};

Main.prototype.loadAssets = function() {
    this.assetsLoader = new AssetsLoader(this.renderer, this.stage);
    this.assetsLoader.onComplete = this.assetsLoaded.bind(this);
    this.assetsLoader.load();
};

Main.prototype.assetsLoaded = function() {
    this.menu = new Menu();
    this.menu.onRestart = this.restartGame.bind(this);

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
    this.stage.addChild(this.universe);

    this.itemManager = new ItemManager();
    this.inventory = new Inventory(this.universe.ship, this.itemManager);
    this.inventory.onItemClicked = this.showItemInfo.bind(this, true);
    this.dialogManager = new DialogManager(this.stage, this.inventory);
    this.planet = new Planet(this.universe.ship, this.itemManager, this.dialogManager);
    this.planet.onItemClicked = this.showItemInfo.bind(this, false);

    this.map = new Map(this.universe);

    this.universe.loadMap();
    this.itemManager.loadItems();
    this.dialogManager.loadDialogs();
    this.universe.onGameLoaded = this.gameLoaded.bind(this);

    this.stage.removeChild(this.assetsLoader.progressBar);
    this.assetsLoader = null;
};

