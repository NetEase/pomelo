#
#   dependencies:
#      fabric (apt-get install fabric)
#      node-jslint (http://github.com/reid/node-jslint)
#      expresso (or replace with whatever node.js test tool you're using)
#

from fabric.api import local
import os, os.path

def test():
    local('expresso -I lib test/*', capture=False)

def jslint():
    ignore = [ "/lib-cov/" ]
    for root, subFolders, files in os.walk("."):
        for file in files:
            if file.endswith(".js"):
                filename = os.path.join(root,file)
                processFile = True
                for i in ignore:
                    if filename.find(i) != -1:
                        processFile = False
                if processFile:
                    print filename
                    local('jslint %s' % filename, capture=False)

