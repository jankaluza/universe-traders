import json

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
