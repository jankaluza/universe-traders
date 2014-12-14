# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'DialogEditor.ui'
#
# Created: Sat Dec 13 14:23:06 2014
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

class Ui_dialogEditor(object):
    def setupUi(self, dialogEditor):
        dialogEditor.setObjectName(_fromUtf8("dialogEditor"))
        dialogEditor.resize(714, 429)
        self.gridLayout = QtGui.QGridLayout(dialogEditor)
        self.gridLayout.setObjectName(_fromUtf8("gridLayout"))
        self.add = QtGui.QPushButton(dialogEditor)
        self.add.setObjectName(_fromUtf8("add"))
        self.gridLayout.addWidget(self.add, 6, 0, 1, 1)
        self.buttonBox = QtGui.QDialogButtonBox(dialogEditor)
        self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
        self.buttonBox.setStandardButtons(QtGui.QDialogButtonBox.Cancel|QtGui.QDialogButtonBox.Ok)
        self.buttonBox.setObjectName(_fromUtf8("buttonBox"))
        self.gridLayout.addWidget(self.buttonBox, 6, 1, 1, 1)
        self.dialog = QtGui.QTreeWidget(dialogEditor)
        self.dialog.setContextMenuPolicy(QtCore.Qt.CustomContextMenu)
        self.dialog.setDragEnabled(True)
        self.dialog.setDragDropMode(QtGui.QAbstractItemView.InternalMove)
        self.dialog.setDefaultDropAction(QtCore.Qt.MoveAction)
        self.dialog.setAlternatingRowColors(False)
        self.dialog.setAllColumnsShowFocus(True)
        self.dialog.setWordWrap(True)
        self.dialog.setObjectName(_fromUtf8("dialog"))
        self.gridLayout.addWidget(self.dialog, 0, 1, 6, 1)
        self.dialogs = QtGui.QListWidget(dialogEditor)
        self.dialogs.setMaximumSize(QtCore.QSize(180, 16777215))
        self.dialogs.setObjectName(_fromUtf8("dialogs"))
        self.gridLayout.addWidget(self.dialogs, 0, 0, 1, 1)
        self.label_2 = QtGui.QLabel(dialogEditor)
        self.label_2.setObjectName(_fromUtf8("label_2"))
        self.gridLayout.addWidget(self.label_2, 1, 0, 1, 1)
        self.once = QtGui.QCheckBox(dialogEditor)
        self.once.setObjectName(_fromUtf8("once"))
        self.gridLayout.addWidget(self.once, 5, 0, 1, 1)
        self.avatar = QtGui.QLineEdit(dialogEditor)
        self.avatar.setMaximumSize(QtCore.QSize(180, 180))
        self.avatar.setObjectName(_fromUtf8("avatar"))
        self.gridLayout.addWidget(self.avatar, 4, 0, 1, 1)
        self.label = QtGui.QLabel(dialogEditor)
        self.label.setObjectName(_fromUtf8("label"))
        self.gridLayout.addWidget(self.label, 3, 0, 1, 1)
        self.events = QtGui.QLineEdit(dialogEditor)
        self.events.setMaximumSize(QtCore.QSize(180, 16777215))
        self.events.setObjectName(_fromUtf8("events"))
        self.gridLayout.addWidget(self.events, 2, 0, 1, 1)

        self.retranslateUi(dialogEditor)
        QtCore.QObject.connect(self.buttonBox, QtCore.SIGNAL(_fromUtf8("accepted()")), dialogEditor.accept)
        QtCore.QObject.connect(self.buttonBox, QtCore.SIGNAL(_fromUtf8("rejected()")), dialogEditor.reject)
        QtCore.QMetaObject.connectSlotsByName(dialogEditor)

    def retranslateUi(self, dialogEditor):
        dialogEditor.setWindowTitle(_translate("dialogEditor", "Dialogs", None))
        self.add.setText(_translate("dialogEditor", "Add dialog", None))
        self.dialog.headerItem().setText(0, _translate("dialogEditor", "Text", None))
        self.dialog.headerItem().setText(1, _translate("dialogEditor", "Filters", None))
        self.dialog.headerItem().setText(2, _translate("dialogEditor", "Actions", None))
        self.label_2.setText(_translate("dialogEditor", "Events:", None))
        self.once.setText(_translate("dialogEditor", "Display just once", None))
        self.label.setText(_translate("dialogEditor", "Avatar:", None))

