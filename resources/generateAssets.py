import os, sys

data = "var assetsToLoad = ["
    #var assetsToLoad = ["resources/universe.png", "resources/ship.png",
    #"resources/panel.png", "resources/dot.png", "resources/map.json",
    #"resources/mars.png", "resources/inventory.png", "resources/mercury.png",
    #"resources/sun.png"];
for f in os.listdir("."):
	if f.endswith(".png") or f.endswith(".jpg"):
		data += '"resources/' + f + '",'
data = data[:-1] + "];"
print data
