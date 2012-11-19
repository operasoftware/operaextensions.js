#!/bin/sh

python build.py --include common --output ../build/operaextensions.js
python build.py --include common --output ../build/operaextensions.min.js
python build.py --include wintabs --output ../build/operaextensions_wintabs.js
python build.py --include toolbarcontext --output ../build/operaextensions_toolbarcontext.js
