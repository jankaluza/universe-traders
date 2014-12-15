import sys
from PyQt4 import QtGui, QtCore
import json
import ui_ObjectEditor
import ui_ItemEditor
import ui_DialogEditor

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
        self.data["dialog"]["New dialog"]["dialog"] = {"Question" : "Answer"}

    def itemAdded(self):
        it = QtGui.QTreeWidgetItem(self.item)
        it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
        it.setExpanded(True);
        it.setText(0, "Text")

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

    def addItem(self, rootItem, dialog):
        if isinstance(dialog, unicode) or isinstance(dialog, str):
            it = QtGui.QTreeWidgetItem(rootItem)
            it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
            it.setExpanded(True);
            it.setText(0, dialog)
            return;
        elif isinstance(dialog, list):
            it = QtGui.QTreeWidgetItem(rootItem)
            it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
            it.setExpanded(True);
            it.setText(0, dialog[0])
            it.setText(2, '; '.join(dialog[1:]))
            return;
        elif dialog == None:
            return;

        for key, value in dialog.iteritems():
            if key == "filter":
                rootItem.setText(1, '; '.join(value))
                continue
            it = QtGui.QTreeWidgetItem(rootItem)
            it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
            it.setText(0, key)
            it.setExpanded(True);
            self.addItem(it, value)

    def eventsChanged(self, text):
        if len(self.key) == 0:
            return
        t = unicode(text);
        self.data["dialog"][self.key]["events"] = t.split(";")

    def avatarChanged(self, text):
        if len(self.key) == 0:
            return
        t = unicode(text);
        self.data["dialog"][self.key]["face"] = t

    def onceChanged(self, state):
        if len(self.key) == 0:
            return
        self.data["dialog"][self.key]["once"] = state == QtCore.Qt.Checked

    def itemClicked(self, item):
        self.dialog.itemChanged.disconnect(self.itemChanged)
        key = unicode(item.text())
        self.key = key;
        self.dialog.clear();

        for key2 in self.data["dialog"][key]['dialog'].keys():
            it = QtGui.QTreeWidgetItem(self.dialog)
            it.setFlags(it.flags() | QtCore.Qt.ItemIsEditable)
            it.setText(0, key2)
            it.setExpanded(True);
            self.addItem(it, self.data["dialog"][key]['dialog'][key2])

        self.dialog.resizeColumnToContents(0)
        self.dialog.itemChanged.connect(self.itemChanged)

        self.events.setText(";".join(self.data["dialog"][key]["events"]))
        self.avatar.setText(self.data["dialog"][key]["face"])
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


	def loadItems(self):
		for key,item in self.main.items.data["items"].iteritems():
			self.addItem(key, item)

			if int(key) > self.lastIndex:
				self.lastIndex = int(key)
		self.items.resizeColumnToContents(0)

class Items:
	def __init__(self):
		self.loadData()

	def loadData(self):
		f = open("../resources/items.json")
		self.data = json.load(f)
		f.close()

	def saveData(self):
		f = open("../resources/items.json", "w")
		f.write(json.dumps(self.data))
		f.close()

class ObjectEditor(QtGui.QWidget, ui_ObjectEditor.Ui_ObjectEditor):
	def __init__(self, main, parent):
		super(ObjectEditor, self).__init__(parent)
		self.setupUi(self)
		self.setMaximumWidth(250)
		self.main = main
		self.n = None
		for i in range(0, self.prices.rowCount()):
			it = QtGui.QTableWidgetItem()
			it.setText("1")
			self.prices.setItem(i, 0, it)

		QtCore.QObject.connect(self.pushButton, QtCore.SIGNAL('clicked()'), self.save)
		QtCore.QObject.connect(self.removeItem, QtCore.SIGNAL('clicked()'), self.removeIt)
		QtCore.QObject.connect(self.addItem, QtCore.SIGNAL('clicked()'), self.addIt)
		QtCore.QObject.connect(self.editDialogs, QtCore.SIGNAL('clicked()'), self.editDialog)
		QtCore.QObject.connect(self.name, QtCore.SIGNAL("textEdited(const QString &)"), self.nameChanged)
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
			self.main.m.data["map"][self.n]["prices"][item.row()] = unicode(item.text())

	def typeChanged(self, t):
		if self.n:
			self.main.m.data["map"][self.n]["type"] = t

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
			self.main.m.data["map"][unicode(name)] = {"items":[], "type":0, "texture":"", "x":self.x.value(), "y":self.y.value(), "prices":[1,1,1,1,1], "desc":""}
		self.n = unicode(name)
		self.main.m.reloadTextures()

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
		self.n = name
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

			for item in obj["items"]:
				it = QtGui.QListWidgetItem(self.main.items.data["items"][str(item)]["name"])
				it.setData(QtCore.QVariant.UserType, QtCore.QVariant(item))
				self.items.addItem(it)
		else:
			self.name.setText("")
			self.desc.setText("")
			self.texture.setText("")
			self.x.setValue(x)
			self.y.setValue(y)
			self.a.setValue(0)
			self.b.setValue(0)
			self.speed.setValue(0)
			self.center.setText("")
			self.items.clear()
			for i in range(0, self.prices.rowCount()):
				self.prices.item(i, 0).setText("1")



class Map(QtGui.QWidget):
	PIXELS_PER_POINT = 1
	WIDTH = 1024
	HEIGHT = 672

	def __init__(self, main, parent):
		super(Map, self).__init__(parent)
		self.main = main
		self.loadData()
		self.x = 500
		self.y = 500
		self.setMouseTracking(True)
		self.dragx = -1
		self.dragy = -1
		self.shipx = 0
		self.shipy = 0
		self.shipradius = 1.0
		self.dragname = None

	def loadData(self):
		f = open("../resources/map.json")
		self.data = json.load(f)
		f.close()

		self.reloadTextures()

	def reloadTextures(self):
		self.textures = {}
		for name, data in self.data["map"].iteritems():
			p = QtGui.QPixmap("../" + data["texture"])
			p = p.scaled(p.width() / 15 * self.PIXELS_PER_POINT, p.height() / 15 * self.PIXELS_PER_POINT)
			self.textures[name] = p
			if not data.has_key("orbit_a"):
				self.data["map"][name]["orbit_a"] = 0
			if not data.has_key("orbit_b"):
				self.data["map"][name]["orbit_b"] = 0
			if not data.has_key("orbit_center"):
				self.data["map"][name]["orbit_center"] = ""
			if not data.has_key("orbit_speed"):
				self.data["map"][name]["orbit_speed"] = 0

	def saveData(self):
		f = open("../resources/map.json", "w")
		f.write(json.dumps(self.data))
		f.close()
		self.saveMap()

	def resizeEvent(self, event = None):
		self.left = self.x + self.width() / self.PIXELS_PER_POINT
		self.top = self.y + self.height() / self.PIXELS_PER_POINT
		self.w = self.WIDTH / 15 * self.PIXELS_PER_POINT
		self.h = self.HEIGHT / 15 * self.PIXELS_PER_POINT

	def drawBeginning(self, p):
		x = -(1030 - self.left) * self.PIXELS_PER_POINT
		y = -(1022 - self.top) * self.PIXELS_PER_POINT
		p.drawEllipse(QtCore.QPoint(x, y), 2 * self.PIXELS_PER_POINT, 2 * self.PIXELS_PER_POINT)

	def drawMap(self, p):
		p.setPen(QtCore.Qt.red);
		for name, data in self.data["map"].iteritems():
			x = -(data["x"] - self.left) * self.PIXELS_PER_POINT
			y = -(data["y"] - self.top) * self.PIXELS_PER_POINT
			t = self.textures[name]
			p.drawPixmap(x - t.width() / 2, y - t.height() / 2, t)

			if data["orbit_center"] != "" and self.data["map"].has_key(data["orbit_center"]):
				x = -(self.data["map"][data["orbit_center"]]["x"] - self.left) * self.PIXELS_PER_POINT
				y = -(self.data["map"][data["orbit_center"]]["y"] - self.top) * self.PIXELS_PER_POINT
				p.drawEllipse(QtCore.QPoint(x, y), data["orbit_a"] * self.PIXELS_PER_POINT, data["orbit_b"] * self.PIXELS_PER_POINT)

		x = -(self.shipx - self.left) * self.PIXELS_PER_POINT
		y = -(self.shipy - self.top) * self.PIXELS_PER_POINT
		p.setPen(QtCore.Qt.green);
		font = QtGui.QFont("monospace")
		font.setStyleHint(QtGui.QFont.Monospace)
		p.setFont(font)
		p.drawEllipse(QtCore.QPoint(x, y), (100.0/self.shipradius) * self.PIXELS_PER_POINT, (100.0/self.shipradius) * self.PIXELS_PER_POINT)
		p.drawRect(x - self.w / 2, y - self.h / 2, self.w, self.h)
		p.drawText(10, 20, "Ship fuel consumption: " + str(self.shipradius))
		p.drawText(10, 35, "Radius               : " + str(int(100/self.shipradius)))

		self.drawBeginning(p)

	def paintEvent(self, event):
		p = QtGui.QPainter()
		p.begin(self)
		p.fillRect(0, 0, self.width(), self.height(), QtCore.Qt.black)
		self.drawMap(p)
		p.end()

	def saveMap(self):
		PIXELS_PER_POINT = 0.5
		left = 800 + (448*2) / PIXELS_PER_POINT
		top = 800 + (448) / PIXELS_PER_POINT
		img = QtGui.QImage(448*2, 448, QtGui.QImage.Format_RGB32)
		img.fill(QtCore.Qt.black);
		p = QtGui.QPainter()
		p.begin(img);

		p.setPen(QtCore.Qt.red);
		for name, data in self.data["map"].iteritems():
			x = -(data["x"] - self.left) * PIXELS_PER_POINT
			y = -(data["y"] - self.top) * PIXELS_PER_POINT

			if data["orbit_center"] != "" and self.data["map"].has_key(data["orbit_center"]):
				x = -(self.data["map"][data["orbit_center"]]["x"] - self.left) * PIXELS_PER_POINT
				y = -(self.data["map"][data["orbit_center"]]["y"] - self.top) * PIXELS_PER_POINT
				p.drawEllipse(QtCore.QPoint(x, y), data["orbit_a"] * PIXELS_PER_POINT, data["orbit_b"] * PIXELS_PER_POINT)

		p.end();
		img.save("../resources/map.png");

	def wheelEvent(self, event):
		if event.buttons() & QtCore.Qt.RightButton:
			if event.delta() > 0:
				self.shipradius += 0.1
			else:
				self.shipradius -= 0.1
		else:
			if event.delta() > 0:
				self.PIXELS_PER_POINT += 0.3
			else:
				self.PIXELS_PER_POINT -= 0.3
			self.resizeEvent()
			self.reloadTextures()
		
		self.repaint()

	def objectAt(self, x1, y1):
		for name, data in self.data["map"].iteritems():
			x = -(data["x"] - self.left) * self.PIXELS_PER_POINT
			y = -(data["y"] - self.top) * self.PIXELS_PER_POINT
			#x = -(dx - left) * P
			#x / P = -dx + left
			#-dx = x / P - left
			#dx = - x / P + left
			t = self.textures[name]
			if x1 >= x - t.width() / 2 and x1 <= x + t.width() / 2 and y1 >= y - t.height() / 2 and y1 <= y + t.height() / 2:
				return name
		return None

	def mousePressEvent(self, event):
		#self.left = self.x + self.width() / self.PIXELS_PER_POINT
		#self.top = self.y + self.height() / self.PIXELS_PER_POINT
		#x = self.left -event.x() / self.PIXELS_PER_POINT
		#y = self.top - event.y() / self.PIXELS_PER_POINT
		#print x, y

		#x = (self.left - event.x()) / self.PIXELS_PER_POINT
		#y = (self.top - event.y()) / self.PIXELS_PER_POINT
		x = - event.x() / self.PIXELS_PER_POINT + self.left
		y = - event.y() / self.PIXELS_PER_POINT + self.top

		if event.buttons() & QtCore.Qt.LeftButton:
			name = self.objectAt(event.x(), event.y())
			self.main.editor.setObject(name, x, y)

			self.dragx = event.x()
			self.dragy = event.y()
			self.dragname = name
		else:
			self.shipx = x
			self.shipy = y
			self.repaint()

	def mouseReleaseEvent(self, event):
		self.dragx = -1
		self.dragy = -1
		self.dragname = None

	def mouseMoveEvent(self, event):
		if event.buttons() & QtCore.Qt.LeftButton and self.dragx != -1:
			x = (self.dragx - event.x()) / self.PIXELS_PER_POINT
			y = (self.dragy - event.y()) / self.PIXELS_PER_POINT
			if self.dragname == None:
				self.x -= x
				self.y -= y
			else:
				self.data["map"][self.dragname]["x"] += x
				self.data["map"][self.dragname]["y"] += y
			self.dragx = event.x()
			self.dragy = event.y()                
			self.resizeEvent()
			self.repaint()

class MainWindow(QtGui.QMainWindow):
	def __init__(self):
		super(MainWindow, self).__init__()

		w = QtGui.QWidget(self)
		self.setCentralWidget(w)

		self.editor = ObjectEditor(self, w)
		self.m = Map(self, w)

		l = QtGui.QHBoxLayout(w)
		l.addWidget(self.m)
		l.addWidget(self.editor)

		self.items = Items()
      
        

def main():
    
    app = QtGui.QApplication(sys.argv)

    w = MainWindow()
    w.resize(800, 600)
    w.setWindowTitle('Stars Map')
    w.showMaximized()
    #w.show()
    
    sys.exit(app.exec_())


if __name__ == '__main__':
    main()
