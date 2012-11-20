#!/bin/sh

python build.py --include background --output ../build/operaextensions_background.js
python build.py --include background --minify --output ../build/operaextensions_background.min.js

python build.py --include injectedscript --output ../build/operaextensions_injectedscript.js
python build.py --include injectedscript --minify --output ../build/operaextensions_injectedscript.min.js

python build.py --include popup --output ../build/operaextensions_popup.js
python build.py --include popup --minify --output ../build/operaextensions_popup.min.js
