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
title: Planets
---

## Planets
"""

class node():
    def __init__(self, name, value):
        self.name = name
        self.value = value
        self.children = []

    def __lt__(self, other):
        return self.name < other.name

def get_children_list(ret, center, nodes, i):
    ret += "%s* [%s](/planets/%s)\n" % ("  " * i, center, center)
    print "  " * i, center
    nodes[center].children.sort()
    for node in nodes[center].children:
        ret = get_children_list(ret, node.name, nodes, i + 1)
    return ret

def rebuildPlanets():
    global index
    f = open(sys.argv[1])
    data = json.load(f)
    f.close()

    nodes = {}
    centers = []
    while (len(nodes) != len(data["map"])):
        for name, d in data["map"].iteritems():
            if name in nodes:
                continue
            if d['orbit_center'] == "":
                nodes[name] = node(name, d)
                centers.append(name)
            elif d['orbit_center'] in nodes:
                nodes[name] = node(name, d)
                nodes[d['orbit_center']].children.append(nodes[name])
    for center in centers:
        index += get_children_list("", center, nodes, 0)

    for name, d in data["map"].iteritems():
        p = """---
layout: default
title: %s
---

## %s
""" % (name, name)

        p += "* **Type**: "
        if d['type'] == 0:
            p += "Planet"
        elif  d['type'] == 1:
            p += "Star"
        if d['orbit_center'] != "":
            p += " orbiting " + d['orbit_center'] + ".\n"
        else:
            p += ".\n"

        p += "### Prices\n"
        p += "| Category | Price coeficient |\n"
        p += "|----------|------------------|\n"
        p += "| %s | %f |\n" % ("Engines", float(d['prices'][0]))
        p += "| %s | %f |\n" % ("Fuel", float(d['prices'][1]))
        p += "| %s | %f |\n" % ("Food", float(d['prices'][2]))
        p += "| %s | %f |\n" % ("Ship improvements", float(d['prices'][3]))
        p += "| %s | %f |\n" % ("Special food", float(d['prices'][4]))

        mkdir_p(name)
        planet = open(name + "/index.md", "w")
        planet.write(p);
        planet.close()
        

rebuildPlanets()

f = open("index.md", "w")
f.write(index)
f.close()