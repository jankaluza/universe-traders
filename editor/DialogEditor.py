from PyQt4 import QtGui, QtCore
import ui_DialogEditor
import json

class DialogEditor(QtGui.QDialog, ui_DialogEditor.Ui_dialogEditor):
    def __init__(self, main, parent):
        super(DialogEditor, self).__init__(parent)
        self.setupUi(self)
        self.main = main
        self.dialog.itemChanged.connect(self.itemChanged)
        self.loadDialogs()
        self.refresh();
        self.key = ""
        self.dialogs.itemClicked.connect(self.itemClicked)
        self.dialogs.itemChanged.connect(self.dialogItemChanged)
        QtCore.QObject.connect(self.dialog, QtCore.SIGNAL("currentItemChanged(QTreeWidgetItem *, QTreeWidgetItem *)"), self.currentItemChanged)
        QtCore.QObject.connect(self.events, QtCore.SIGNAL("textEdited(const QString &)"), self.eventsChanged)
        QtCore.QObject.connect(self.avatar, QtCore.SIGNAL("textEdited(const QString &)"), self.avatarChanged)
        QtCore.QObject.connect(self.object, QtCore.SIGNAL("textEdited(const QString &)"), self.objectChanged)
        QtCore.QObject.connect(self.once, QtCore.SIGNAL("stateChanged ( int )"), self.onceChanged)
        QtCore.QObject.connect(self.add, QtCore.SIGNAL('clicked()'), self.addDialog)

        self.dialog.setContextMenuPolicy(QtCore.Qt.ActionsContextMenu)

        quitAction = QtGui.QAction("Add item", self, triggered=self.itemAdded)
        self.dialog.addAction(quitAction)
        quitAction = QtGui.QAction("Remove item", self, triggered=self.itemRemoved)
        self.dialog.addAction(quitAction)

    def addDialog(self):
        it = QtGui.QListWidgetItem("New dialog")
        it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
        self.dialogs.addItem(it)
        self.data["dialog"]["New dialog"] = {}
        self.data["dialog"]["New dialog"]["events"] = []
        self.data["dialog"]["New dialog"]["face"] = "resources/face0.png"
        self.data["dialog"]["New dialog"]["once"] = False
        self.data["dialog"]["New dialog"]["object"] = ""
        self.data["dialog"]["New dialog"]["dialog"] = {"Question" : "Answer"}

    def itemAdded(self):
        self.createItem(self.item, "Text")

    def itemRemoved(self):
        if self.item.parent() == None:
            self.dialog.takeTopLevelItem(self.dialog.indexOfTopLevelItem(self.item))
        else:
            self.item.parent().takeChild(self.item.parent().indexOfChild(self.item))
        self.itemChanged(None)

    def currentItemChanged(self, item, old):
        self.item = item;

    def refresh(self):
        self.dialog.itemChanged.disconnect(self.itemChanged)
        self.dialogs.clear();
        self.dialog.clear();

        for k, dialog in self.data["dialog"].iteritems():
            it = QtGui.QListWidgetItem(k)
            it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
            self.dialogs.addItem(it)
        self.dialog.itemChanged.connect(self.itemChanged)

    def createItem(self, rootItem, text, actions = None, filters = None):
        it = QtGui.QTreeWidgetItem(rootItem)
        it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
        it.setExpanded(True);

        #label = QtGui.QLabel(text)
        #label.setWordWrap(True)
        #self.dialog.setItemWidget(it, 0, label)
        it.setText(0, text)

        if actions:
            it.setText(2, '; '.join(actions))
        if filters:
            it.setText(1, '; '.join(filters))
        return it

    def addItem(self, rootItem, dialog):
        if isinstance(dialog, unicode) or isinstance(dialog, str):
            self.createItem(rootItem, dialog)
            return;
        elif isinstance(dialog, list):
            self.createItem(rootItem, dialog[0], dialog[1:])
            return;
        elif dialog == None:
            return;

        for key, value in dialog.iteritems():
            if key == "filter":
                rootItem.setText(1, '; '.join(value))
                continue
            it = self.createItem(rootItem, key)
            self.addItem(it, value)

    def eventsChanged(self, text):
        if len(self.key) == 0:
            return
        t = unicode(text);
        self.data["dialog"][self.key]["events"] = t.split(";")
        self.saveDialogs()

    def avatarChanged(self, text):
        if len(self.key) == 0:
            return
        t = unicode(text);
        self.data["dialog"][self.key]["face"] = t
        self.saveDialogs()

    def objectChanged(self, text):
        if len(self.key) == 0:
            return
        t = unicode(text);
        self.data["dialog"][self.key]["object"] = t
        self.saveDialogs()

    def onceChanged(self, state):
        if len(self.key) == 0:
            return
        self.data["dialog"][self.key]["once"] = state == QtCore.Qt.Checked
        self.saveDialogs()

    def itemClicked(self, item):
        self.dialog.itemChanged.disconnect(self.itemChanged)
        key = unicode(item.text())
        self.key = key;
        self.dialog.clear();

        for key2 in self.data["dialog"][key]['dialog'].keys():
            it = self.createItem(self.dialog, key2)
            self.addItem(it, self.data["dialog"][key]['dialog'][key2])

        self.dialog.resizeColumnToContents(0)
        self.dialog.itemChanged.connect(self.itemChanged)

        self.events.setText(";".join(self.data["dialog"][key]["events"]))
        self.avatar.setText(self.data["dialog"][key]["face"])
        if self.data["dialog"][key].has_key("object"):
            self.object.setText(self.data["dialog"][key]["object"])
        else:
            self.object.setText("")
        self.once.setChecked(self.data["dialog"][key]["once"])

    def dumpItem(self, parent):
        # A
        #  - B
        #    -D
        #  - C
        #    - E
        # {A : {B : D, C : E}}
        data = {}
        key = unicode(parent.text(0))
        filters = unicode(parent.text(1))
        actions = unicode(parent.text(2))

        if parent.childCount() == 0 and parent.parent() != None:
            if actions != "":
                ret = [key] + actions.split(";")
                return [x.strip(' ') for x in ret]
            return key
        else:
            data[key] = {}
            for i in range(parent.childCount()):
                child = parent.child(i)
                ret = self.dumpItem(child)
                if isinstance(ret, dict):
                    data[key].update(ret)
                else:
                    if isinstance(data[key], unicode):
                        data[key] = {data[key]: None}
                        if isinstance(ret, unicode):
                            data[key][ret] = None
                        #else:
                            #data[key][ret[0]] = ret[1:]
                    elif isinstance(data[key], list):
                        data[key] = {data[key][0] : data[key][1:]}
                        if isinstance(ret, unicode):
                            data[key][ret] = None
                        #else:
                            #data[key][ret[0]] = ret[1:]
                    elif isinstance(ret, unicode):
                        data[key][ret] = None
                    else:
                        print data[key], ret
                        data[key] = ret
            if isinstance(data[key], dict) and filters != "":
                data[key]["filter"] = [x.strip(' ') for x in filters.split(";")]
            return data

    def itemChanged(self, item):
        dialog = {}

        for i in range(self.dialog.topLevelItemCount()):
            item = self.dialog.topLevelItem(i)
            dialog.update(self.dumpItem(item))

        self.data["dialog"][self.key]['dialog'] = dialog
        self.saveDialogs()

    def dialogItemChanged(self, item):
        key = unicode(item.text())
        self.data["dialog"][key] = self.data["dialog"][self.key]
        del self.data["dialog"][self.key]
        self.key = key
        self.saveDialogs()

    def loadDialogs(self):
        f = open("../resources/dialogs.json")
        self.data = json.load(f)
        f.close()

    def saveDialogs(self):
        f = open("../resources/dialogs.json", "w")
        f.write(json.dumps(self.data))
        f.close()
