from PyQt4 import QtGui, QtCore
import json

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
            elif data.has_key("waypoints") and len(data["waypoints"]) != 0:
                x_new = x
                y_new = y
                for waypoint in data["waypoints"]:
                    w = waypoint.split(" ")
                    if len(w) == 2:
                        x2 = -(int(w[0]) - self.left) * self.PIXELS_PER_POINT
                        y2 = -(int(w[1]) - self.top) * self.PIXELS_PER_POINT
                    else:
                        x2 = -(self.data["map"][w[0]]["x"] - self.left) * self.PIXELS_PER_POINT
                        y2 = -(self.data["map"][w[0]]["y"] - self.top) * self.PIXELS_PER_POINT
                    p.drawLine(x_new, y_new, x2, y2)
                    x_new = x2
                    y_new = y2
                p.drawLine(x_new, y_new, x, y)

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
