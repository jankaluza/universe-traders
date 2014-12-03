function DialogObject(once, dialog) {
    this.once = once;
    this.dialog = dialog;
}

function DialogManager(stage) {
    this.stage = stage;
    this.currentDialog = null;
    this.dialogs = {};
    this.eventToDialog = {}

    radio("objectTouched").subscribe(this.handleObjectTouched.bind(this));
    radio("objectLeft").subscribe(this.handleObjectLeft.bind(this));
}

DialogManager.prototype.click = function(data) {
    var x = data.getLocalPosition(this).x;
    var y = data.getLocalPosition(this).y;
}

DialogManager.prototype.loadDialogs = function() {
    var that = this;
    loader = new PIXI.JsonLoader("resources/dialogs.json");
    loader.on('loaded', function(evt) {
        for (var key in evt.content.json.dialog) {
            var dialog = evt.content.json.dialog[key];
            for (var index = 0; index < dialog.events.length; index++) {
                that.eventToDialog[dialog.events[index]] = key;
            }
            that.dialogs[key] = new DialogObject(dialog.once, dialog.dialog);
        }
    });
    loader.load();
}

DialogManager.prototype.executeDialog = function(name) {
    if (!(name in this.eventToDialog)) {
        return;
    }

    var dialog = this.dialogs[this.eventToDialog[name]];
    if (dialog.once) {
        if (localStorage.getItem("dialog." + name) == "1") {
            return;
        }
        localStorage.setItem("dialog." + name, "1");
    }

    this.currentDialog = new Dialog();
    this.stage.addChild(this.currentDialog);
}

DialogManager.prototype.handleObjectTouched = function(object) {
    this.executeDialog(object.name + "_touched");
}

DialogManager.prototype.handleObjectLeft = function(object) {
    this.executeDialog(object.name + "_left");
}
