from PyQt4 import QtGui, QtCore
import ui_ObjectEditor
import json
from DialogEditor import *
from ItemEditor import *

class ObjectEditor(QtGui.QWidget, ui_ObjectEditor.Ui_ObjectEditor):
    def __init__(self, main, parent):
        super(ObjectEditor, self).__init__(parent)
        self.setupUi(self)
        self.setMaximumWidth(250)
        self.main = main
        self.n = None
        self.waypointsBox.hide()
        for i in range(0, self.prices.rowCount()):
            it = QtGui.QTableWidgetItem()
            it.setText("1")
            self.prices.setItem(i, 0, it)

        QtCore.QObject.connect(self.pushButton, QtCore.SIGNAL('clicked()'), self.save)
        QtCore.QObject.connect(self.removeItem, QtCore.SIGNAL('clicked()'), self.removeIt)
        QtCore.QObject.connect(self.addItem, QtCore.SIGNAL('clicked()'), self.addIt)
        QtCore.QObject.connect(self.editDialogs, QtCore.SIGNAL('clicked()'), self.editDialog)
        QtCore.QObject.connect(self.name, QtCore.SIGNAL("textEdited(const QString &)"), self.nameChanged)
        QtCore.QObject.connect(self.waypoints, QtCore.SIGNAL("textEdited(const QString &)"), self.waypointsChanged)
        QtCore.QObject.connect(self.attack, QtCore.SIGNAL("textEdited(const QString &)"), self.attackChanged)
        QtCore.QObject.connect(self.defense, QtCore.SIGNAL("textEdited(const QString &)"), self.defenseChanged)
        QtCore.QObject.connect(self.texture, QtCore.SIGNAL("textEdited(const QString &)"), self.textureChanged)
        QtCore.QObject.connect(self.center, QtCore.SIGNAL("textEdited(const QString &)"), self.centerChanged)
        QtCore.QObject.connect(self.x, QtCore.SIGNAL("valueChanged ( int )"), self.xChanged)
        QtCore.QObject.connect(self.y, QtCore.SIGNAL("valueChanged ( int )"), self.yChanged)
        QtCore.QObject.connect(self.a, QtCore.SIGNAL("valueChanged ( int )"), self.aChanged)
        QtCore.QObject.connect(self.b, QtCore.SIGNAL("valueChanged ( int )"), self.bChanged)
        QtCore.QObject.connect(self.speed, QtCore.SIGNAL("valueChanged ( double )"), self.speedChanged)
        QtCore.QObject.connect(self.comboBox, QtCore.SIGNAL("currentIndexChanged ( int )"), self.typeChanged)
        QtCore.QObject.connect(self.prices, QtCore.SIGNAL("itemChanged ( QTableWidgetItem * )"), self.priceChanged)
        QtCore.QObject.connect(self.desc, QtCore.SIGNAL("textChanged()"), self.descChanged)

    def descChanged(self):
        if self.n:
            self.main.m.data["map"][self.n]["desc"] = unicode(self.desc.toPlainText())

    def centerChanged(self, texture):
        if self.n:
            self.main.m.data["map"][self.n]["orbit_center"] = unicode(self.center.text())
            self.main.m.repaint()

    def textureChanged(self, texture):
        if self.n:
            self.main.m.data["map"][self.n]["texture"] = unicode(self.texture.text())
            self.main.m.reloadTextures()
            self.main.m.repaint()

    def priceChanged(self, item):
        if self.n:
            while (len(self.main.m.data["map"][self.n]["prices"]) <= item.row()):
                self.main.m.data["map"][self.n]["prices"].append("1")
            self.main.m.data["map"][self.n]["prices"][item.row()] = unicode(item.text())

    def typeChanged(self, t):
        if self.n:
            self.main.m.data["map"][self.n]["type"] = t
        if t < 2:
            self.orbit.show()
            self.waypointsBox.hide()
        else:
            self.orbit.hide()
            self.waypointsBox.show()

    def speedChanged(self, a):
        if self.n:
            self.main.m.data["map"][self.n]["orbit_speed"] = a
            self.main.m.repaint()

    def aChanged(self, a):
        if self.n:
            self.main.m.data["map"][self.n]["orbit_a"] = a
            self.main.m.repaint()

    def bChanged(self, b):
        if self.n:
            self.main.m.data["map"][self.n]["orbit_b"] = b
            self.main.m.repaint()

    def xChanged(self, x):
        if self.n:
            self.main.m.data["map"][self.n]["x"] = x
            self.main.m.repaint()

    def yChanged(self, y):
        if self.n:
            self.main.m.data["map"][self.n]["y"] = y
            self.main.m.repaint()

    def nameChanged(self, name):
        if self.n:
            self.main.m.data["map"][unicode(name)] = self.main.m.data["map"][self.n]
            del self.main.m.data["map"][self.n]
        else:
            self.main.m.data["map"][unicode(name)] = {"items":[], "type":0, "texture":"", "x":self.x.value(), "y":self.y.value(), "prices":[1,1,1,1,1,1,1], "desc":""}
        self.n = unicode(name)
        self.main.m.reloadTextures()

    def attackChanged(self, attack):
        if self.n:
            w = float(unicode(attack))
            self.main.m.data["map"][self.n]["attack"] = w

    def defenseChanged(self, defense):
        if self.n:
            w = float(unicode(defense))
            self.main.m.data["map"][self.n]["defense"] = w

    def waypointsChanged(self, waypoints):
        if self.n:
            w = unicode(waypoints).split(";")
            w = [x.strip(' ') for x in w]
            self.main.m.data["map"][self.n]["waypoints"] = w
            self.main.m.repaint()

    def editDialog(self):
        it = DialogEditor(self.main, self)
        it.exec_()

    def addIt(self):
        it = ItemEditor(self.main, self)
        if it.exec_():
            self.main.m.data["map"][self.n]["items"].append(it.index)
        self.setObject(self.n, 0, 0)

    def removeIt(self):
        item = self.items.currentItem()
        i = item.data(QtCore.QVariant.UserType).toInt()[0]
        self.main.m.data["map"][self.n]["items"].remove(i)
        self.items.takeItem(self.items.currentRow())

    def save(self):
        self.main.m.saveData()

    def setObject(self, name, x, y):
        self.n = None
        if name != None:
            obj = self.main.m.data["map"][name]
            self.name.setText(name)
            self.texture.setText(obj["texture"])
            if not obj.has_key("desc"):
                obj["desc"] = ""
            if not obj.has_key("orbit_a"):
                obj["orbit_a"] = 0
            if not obj.has_key("orbit_b"):
                obj["orbit_b"] = 0
            if not obj.has_key("orbit_center"):
                obj["orbit_center"] = ""
            if not obj.has_key("waypoints"):
                obj["waypoints"] = []
            self.desc.setText(obj["desc"])
            self.x.setValue(obj["x"])
            self.y.setValue(obj["y"])
            self.a.setValue(obj["orbit_a"])
            self.b.setValue(obj["orbit_b"])
            self.speed.setValue(obj["orbit_speed"])
            self.center.setText(obj["orbit_center"])
            self.comboBox.setCurrentIndex(obj["type"])
            self.items.clear()
            for i in range(0, self.prices.rowCount()):
                self.prices.item(i, 0).setText("1")
            for i in range(0, len(obj["prices"])):
                self.prices.item(i, 0).setText(str(obj["prices"][i]))
            self.waypoints.setText("; ".join(obj["waypoints"]))
            if obj.has_key("attack"):
                self.attack.setText(str(obj["attack"]))
            if obj.has_key("defense"):
                self.defense.setText(str(obj["defense"]))

            for item in obj["items"]:
                it = QtGui.QListWidgetItem(self.main.items.data["items"][str(item)]["name"])
                it.setData(QtCore.QVariant.UserType, QtCore.QVariant(item))
                self.items.addItem(it)
        else:
            self.name.setText("")
            self.desc.setText("")
            self.attack.setText("")
            self.defense.setText("")
            self.texture.setText("")
            self.x.setValue(x)
            self.y.setValue(y)
            self.a.setValue(0)
            self.b.setValue(0)
            self.speed.setValue(0)
            self.center.setText("")
            self.items.clear()
            self.waypoints.setText("")
            for i in range(0, self.prices.rowCount()):
                self.prices.item(i, 0).setText("1")
        self.n = name
