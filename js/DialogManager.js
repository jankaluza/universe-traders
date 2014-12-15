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

DialogManager.prototype.parseDialogs = function(dialogs) {
    for (var key in dialogs) {
        var dialog = dialogs[key];
        for (var index = 0; index < dialog.events.length; index++) {
            this.eventToDialog[dialog.events[index]] = key;
        }
        this.dialogs[key] = new DialogObject(dialog.face, dialog.once, dialog.dialog);
    }
}

DialogManager.prototype.loadDialogs = function() {
    var that = this;
    loader = new PIXI.JsonLoader("resources/dialogs.json");
    loader.on('loaded', function(evt) {
        that.parseDialogs(evt.content.content.json.dialog);
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

    this.currentDialog = new Dialog(dialog.face, dialog.dialog, this.inventory);
    this.currentDialog.onDialogFinished = this.handleDialogFinished.bind(this);
    if (this.currentDialog.start()) {
        if (dialog.once) {
            if (localStorage.getItem("dialog." + name) == "1") {
                return;
            }
            localStorage.setItem("dialog." + name, "1");
        }

        this.stage.addChild(this.currentDialog);
        radio("dialogStarted").broadcast();
    }
    else {
        this.currentDialog = null;
    }
}

DialogManager.prototype.handleObjectTouched = function(object) {
    this.executeDialog(object.name + "_touched");
}

DialogManager.prototype.handleObjectLeft = function(object) {
    this.executeDialog(object.name + "_left");
}

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = DialogManager;
    }
}
