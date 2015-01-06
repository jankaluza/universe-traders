from PyQt4 import QtGui, QtCore
import ui_ItemEditor
import json

class ItemEditor(QtGui.QDialog, ui_ItemEditor.Ui_ItemEditor):
    def __init__(self, main, parent):
        super(ItemEditor, self).__init__(parent)
        self.setupUi(self)
        self.main = main
        self.lastIndex = 0
        self.loadItems()
        self.index = -1

        QtCore.QObject.connect(self.items, QtCore.SIGNAL("currentItemChanged(QTreeWidgetItem *, QTreeWidgetItem *)"), self.currentItemChanged)
        self.items.itemChanged.connect(self.itemChanged)
        self.items.setContextMenuPolicy(QtCore.Qt.ActionsContextMenu)

        quitAction = QtGui.QAction("Add item", self, triggered=self.itemAdded)
        self.items.addAction(quitAction)
        quitAction = QtGui.QAction("Remove item", self, triggered=self.itemRemoved)
        self.items.addAction(quitAction)

    def createIcon(self, key, text):
        img = QtGui.QImage(64, 64, QtGui.QImage.Format_ARGB32)
        img.fill(QtCore.Qt.transparent);
        p = QtGui.QPainter()
        p.begin(img);

        p.setPen(QtCore.Qt.white);
        p.drawText(0, 0, 64, 64, QtCore.Qt.TextWordWrap | QtCore.Qt.AlignCenter, text)
        p.end()
        img.save("../resources/" + str(key) + ".png");

    def itemAdded(self):
        name, ok = QtGui.QInputDialog.getText(self, "New item", "New item name:", QtGui.QLineEdit.Normal, "")
        if not ok:
            return
        self.lastIndex += 1
        self.main.items.data["items"][str(self.lastIndex)] = {}
        self.main.items.data["items"][str(self.lastIndex)]["name"] = unicode(name)
        self.main.items.data["items"][str(self.lastIndex)]["type"] = self.items.indexOfTopLevelItem(self.item)
        self.main.items.data["items"][str(self.lastIndex)]["price"] = 0
        self.main.items.data["items"][str(self.lastIndex)]["texture"] = "resources/" + str(self.lastIndex) + ".png"
        self.createIcon(self.lastIndex, name)
        self.addItem(self.lastIndex, self.main.items.data["items"][str(self.lastIndex)])

    def itemRemoved(self):
        del self.main.items.data["items"][str(self.index)]
        self.item.parent().takeChild(self.item.parent().indexOfChild(self.item))
        self.item = None
        self.main.items.saveData()

    def itemChanged(self, item):
        if item != self.item:
            return
        it = str(item.data(0, QtCore.Qt.UserRole).toInt()[0])
        if not item.text(1).isEmpty():
            self.main.items.data["items"][it]["price"] = int(unicode(item.text(1)))
        self.main.items.data["items"][it]["name"] = unicode(item.text(0))
        if not item.text(2).isEmpty():
            self.main.items.data["items"][it]["fuel"] = float(unicode(item.text(2)))
        elif self.main.items.data["items"][it].has_key("fuel"):
            del self.main.items.data["items"][it]["fuel"]
        if not item.text(3).isEmpty():
            self.main.items.data["items"][it]["speed"] = float(unicode(item.text(3)))
        elif self.main.items.data["items"][it].has_key("speed"):
            del self.main.items.data["items"][it]["speed"]
        if not item.text(4).isEmpty():
            self.main.items.data["items"][it]["food"] = float(unicode(item.text(4)))
        elif self.main.items.data["items"][it].has_key("food"):
            del self.main.items.data["items"][it]["food"]
        if not item.text(5).isEmpty():
            self.main.items.data["items"][it]["sanity"] = float(unicode(item.text(5)))
        elif self.main.items.data["items"][it].has_key("sanity"):
            del self.main.items.data["items"][it]["sanity"]
        if not item.text(6).isEmpty():
            self.main.items.data["items"][it]["attack"] = float(unicode(item.text(6)))
        elif self.main.items.data["items"][it].has_key("attack"):
            del self.main.items.data["items"][it]["attack"]
        if not item.text(7).isEmpty():
            self.main.items.data["items"][it]["defense"] = float(unicode(item.text(7)))
        elif self.main.items.data["items"][it].has_key("defense"):
            del self.main.items.data["items"][it]["defense"]
        self.main.items.saveData()

    def currentItemChanged(self, item, prev):
        it = item.data(0, QtCore.Qt.UserRole).toInt()[0]
        self.index = it
        self.item = item

    def addItem(self, key, item):
        parent = self.items.topLevelItem(item["type"])
        parent.setExpanded(True)
        parent.setData(0, QtCore.Qt.UserRole, -1);

        it = QtGui.QTreeWidgetItem(parent)
        it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
        it.setIcon(0, QtGui.QIcon("../resources/" + str(key) + ".png"))
        it.setText(0, item["name"])
        it.setData(0, QtCore.Qt.UserRole, int(key));
        it.setText(1, str(item["price"]))
        if item.has_key("fuel"):
            it.setText(2, str(item["fuel"]))
        if item.has_key("speed"):
            it.setText(3, str(item["speed"]))
        if item.has_key("food"):
            it.setText(4, str(item["food"]))
        if item.has_key("sanity"):
            it.setText(5, str(item["sanity"]))
        if item.has_key("attack"):
            it.setText(6, str(item["attack"]))
        if item.has_key("defense"):
            it.setText(7, str(item["defense"]))


    def loadItems(self):
        for key,item in self.main.items.data["items"].iteritems():
            self.addItem(key, item)

            if int(key) > self.lastIndex:
                self.lastIndex = int(key)
        self.items.resizeColumnToContents(0)
