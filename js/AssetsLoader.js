function AssetsLoader(renderer, stage) {
    var assetsToLoad = ["resources/4.png","resources/jupiter.png","resources/mercury.png","resources/moon.png","resources/mars.png","resources/venus.png","resources/panel.png","resources/iteminfo.png","resources/2.png","resources/inventory.png","resources/3.png","resources/universe.png","resources/sun.png","resources/earth.png","resources/planet.png","resources/ship.png","resources/neptune.png","resources/uranus.png","resources/ship_moving.png","resources/dot.png","resources/1.png","resources/map.png","resources/0.png","resources/saturn.png", "resources/menu.png", "resources/dialog.png"];
    PIXI.AssetLoader.call(this, assetsToLoad);
    this.stage = stage;
    this.renderer = renderer;

    var dot = PIXI.Texture.fromImage("resources/dot.png");
    this.progressBar = new PIXI.Sprite(dot);
    this.progressBar.x = Main.CENTER_X - 100;
    this.progressBar.y = Main.CENTER_Y - 15;
    this.progressBar.height = 30;
    this.progressBar.width = 1;
    this.stage.addChild(this.progressBar);

    this.onProgress = this.assetLoaded.bind(this, assetsToLoad.length);
}

AssetsLoader.constructor = AssetsLoader;
AssetsLoader.prototype = Object.create(PIXI.AssetLoader.prototype);


AssetsLoader.prototype.assetLoaded = function(count) {
    this.progressBar.width = (200 / count) * (count - this.loadCount);
    this.renderer.render(this.stage);
};
