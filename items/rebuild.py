import os
import sys
import json
import errno

def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else: raise

index = """---
layout: default
title: Items
---

## Items
"""

def rebuildItems():
    global index
    f = open(sys.argv[1])
    data = json.load(f)
    f.close()

    types = ["Engine", "Food", "Fuel", "Ship improvement", "Special food", "Machine", "Gun"]

    keys = data["items"].keys()
    keys.sort()
    for key in keys:
        d = data["items"][key]
        name = d["name"]
        index += "* [%s](/items/%s)\n" % (name, name.replace(" ", "_"))
        p = """---
layout: default
title: %s
---

## %s
""" % (name, name)

        p += "* **Type**: %s\n" % (types[int(d['type'])])
        p += "* **Price**: %s\n" % (str(d['price']))
        if "fuel" in d:
            p += "* **Fuel consumption**: %s\n" % (str(d['fuel']))
        if "food" in d:
            p += "* **Food consumption**: %s\n" % (str(d['food']))
        if "speed" in d:
            p += "* **Speed**: %s\n" % (str(d['speed']))

        mkdir_p(name.replace(" ", "_"))
        planet = open(name.replace(" ", "_") + "/index.md", "w")
        planet.write(p);
        planet.close()
        

rebuildItems()

f = open("index.md", "w")
f.write(index)
f.close()