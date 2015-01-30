function DialogObject(face, once, dialog) {
    this.once = once;
    this.face = face;
    this.dialog = dialog;
}

function DialogManager(stage, inventory, objManager) {
    this.stage = stage;
    this.inventory = inventory;
    this.objManager = objManager;
    this.currentDialog = null;
    this.currentName = "";
    this.dialogs = {};
    this.eventToDialog = {};
    this.objectToDialog = {};

    radio("objectTouched").subscribe(this.handleObjectTouched.bind(this));
    radio("objectLeft").subscribe(this.handleObjectLeft.bind(this));
}

DialogManager.prototype.reset = function() {
    if (this.currentDialog) {
        this.stage.removeChild(this.currentDialog);
        this.currentDialog = null;
    }
};

DialogManager.prototype.parseDialogs = function(dialogs) {
    for (var key in dialogs) {
        var dialog = dialogs[key];
        for (var index = 0; index < dialog.events.length; index++) {
            this.eventToDialog[dialog.events[index]] = key;
        }
        if (!(dialog.object in this.objectToDialog)) {
            this.objectToDialog[dialog.object] = [];
        }
        this.objectToDialog[dialog.object][this.objectToDialog[dialog.object].length] = key;
        this.dialogs[key] = new DialogObject(dialog.face, dialog.once, dialog.dialog);
    }
};

DialogManager.prototype.loadDialogs = function() {
    var that = this;
    loader = new PIXI.JsonLoader("resources/dialogs.json");
    loader.on('loaded', function(evt) {
        that.parseDialogs(evt.content.content.json.dialog);
    });
    loader.load();
};

DialogManager.prototype.handleDialogFinished = function() {
    this.stage.removeChild(this.currentDialog);
    this.currentDialog = null;
    this.currentName = "";
    radio("dialogFinished").broadcast();
};

DialogManager.prototype.executeDialog = function(name, eventResult) {
    if (this.currentName == name) {
        return;
    }

    var dialog = this.dialogs[name];

    if (this.currentDialog) {
        this.handleDialogFinished(this.currentDialog);
    }

    this.currentDialog = new Dialog(dialog.face, dialog.dialog, this.inventory, this.objManager);
    this.currentDialog.onDialogFinished = this.handleDialogFinished.bind(this);
    if (this.currentDialog.start()) {
        if (dialog.once && eventResult) {
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
};

DialogManager.prototype.handleObjectTouched = function(object) {
    var name = object.name + "_touched";
    if (!(name in this.eventToDialog)) {
        return;
    }

    this.executeDialog(this.eventToDialog[name], true);
};

DialogManager.prototype.handleObjectLeft = function(object) {
    var name = object.name + "_left";
    if (!(name in this.eventToDialog), true) {
        if (this.currentDialog) {
            this.handleDialogFinished(this.currentDialog);
        }
        return;
    }

    this.executeDialog(this.eventToDialog[name]);
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = DialogManager;
    }
}
