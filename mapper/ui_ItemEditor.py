# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'ItemEditor.ui'
#
# Created: Thu Jan  1 18:00:12 2015
#      by: PyQt4 UI code generator 4.10.2
#
# WARNING! All changes made in this file will be lost!

from PyQt4 import QtCore, QtGui

try:
    _fromUtf8 = QtCore.QString.fromUtf8
except AttributeError:
    def _fromUtf8(s):
        return s

try:
    _encoding = QtGui.QApplication.UnicodeUTF8
    def _translate(context, text, disambig):
        return QtGui.QApplication.translate(context, text, disambig, _encoding)
except AttributeError:
    def _translate(context, text, disambig):
        return QtGui.QApplication.translate(context, text, disambig)

class Ui_ItemEditor(object):
    def setupUi(self, ItemEditor):
        ItemEditor.setObjectName(_fromUtf8("ItemEditor"))
        ItemEditor.resize(714, 429)
        self.gridLayout = QtGui.QGridLayout(ItemEditor)
        self.gridLayout.setObjectName(_fromUtf8("gridLayout"))
        self.items = QtGui.QTreeWidget(ItemEditor)
        self.items.setContextMenuPolicy(QtCore.Qt.CustomContextMenu)
        self.items.setObjectName(_fromUtf8("items"))
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        item_0 = QtGui.QTreeWidgetItem(self.items)
        self.gridLayout.addWidget(self.items, 0, 0, 1, 1)
        self.buttonBox = QtGui.QDialogButtonBox(ItemEditor)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtGui.QDialogButtonBox.Cancel|QtGui.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName(_fromUtf8("buttonBox"))
        self.gridLayout.addWidget(self.buttonBox, 1, 0, 1, 1)

        self.retranslateUi(ItemEditor)
        QtCore.QObject.connect(self.buttonBox, QtCore.SIGNAL(_fromUtf8("accepted()")), ItemEditor.accept)
        QtCore.QObject.connect(self.buttonBox, QtCore.SIGNAL(_fromUtf8("rejected()")), ItemEditor.reject)
        QtCore.QMetaObject.connectSlotsByName(ItemEditor)

    def retranslateUi(self, ItemEditor):
        ItemEditor.setWindowTitle(_translate("ItemEditor", "Items", None))
        self.items.headerItem().setText(0, _translate("ItemEditor", "Name", None))
        self.items.headerItem().setText(1, _translate("ItemEditor", "Price", None))
        self.items.headerItem().setText(2, _translate("ItemEditor", "Fuel", None))
        self.items.headerItem().setText(3, _translate("ItemEditor", "Speed", None))
        self.items.headerItem().setText(4, _translate("ItemEditor", "Food", None))
        self.items.headerItem().setText(5, _translate("ItemEditor", "Sanity", None))
        self.items.headerItem().setText(6, _translate("ItemEditor", "Attack", None))
        self.items.headerItem().setText(7, _translate("ItemEditor", "Defense", None))
        __sortingEnabled = self.items.isSortingEnabled()
        self.items.setSortingEnabled(False)
        self.items.topLevelItem(0).setText(0, _translate("ItemEditor", "Engine", None))
        self.items.topLevelItem(1).setText(0, _translate("ItemEditor", "Fuel", None))
        self.items.topLevelItem(2).setText(0, _translate("ItemEditor", "Food", None))
        self.items.topLevelItem(3).setText(0, _translate("ItemEditor", "Ship improvements", None))
        self.items.topLevelItem(4).setText(0, _translate("ItemEditor", "Special food", None))
        self.items.topLevelItem(5).setText(0, _translate("ItemEditor", "Machine", None))
        self.items.topLevelItem(6).setText(0, _translate("ItemEditor", "Gun", None))
        self.items.topLevelItem(7).setText(0, _translate("ItemEditor", "Ship weapon", None))
        self.items.topLevelItem(8).setText(0, _translate("ItemEditor", "Ship shield", None))
        self.items.setSortingEnabled(__sortingEnabled)

