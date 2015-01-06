from PyQt4 import QtGui, QtCore
from ObjectEditor import *
from Items import *
from Map import *

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
