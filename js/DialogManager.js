function DialogObject(face, once, dialog) {
    this.once = once;
    this.face = face,
    this.dialog = dialog;
}

function DialogManager(stage, inventory) {
    this.stage = stage;
    this.inventory = inventory;
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
        for (var key in evt.content.content.json.dialog) {
            var dialog = evt.content.content.json.dialog[key];
            for (var index = 0; index < dialog.events.length; index++) {
                that.eventToDialog[dialog.events[index]] = key;
            }
            that.dialogs[key] = new DialogObject(dialog.face, dialog.once, dialog.dialog);
        }
    });
    loader.load();
}

DialogManager.prototype.handleDialogFinished = function() {
    this.stage.removeChild(this.currentDialog);
    this.currentDialog = null;
    radio("dialogFinished").broadcast();
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

    this.currentDialog = new Dialog(dialog.face, dialog.dialog, this.inventory);
    this.currentDialog.onDialogFinished = this.handleDialogFinished.bind(this);
    this.stage.addChild(this.currentDialog);
    radio("dialogStarted").broadcast();
}

DialogManager.prototype.handleObjectTouched = function(object) {
    this.executeDialog(object.name + "_touched");
}

DialogManager.prototype.handleObjectLeft = function(object) {
    this.executeDialog(object.name + "_left");
}
