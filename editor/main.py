import sys
from PyQt4 import QtGui, QtCore
from MainWindow import *

def main():
    app = QtGui.QApplication(sys.argv)
    w = MainWindow()
    w.setWindowTitle('Universe Editor')
    w.showMaximized()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
