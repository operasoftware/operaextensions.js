#!/bin/sh

#
# Build the libraries
#

python build.py --include background --output ../build/operaextensions_background.js
python build.py --include injectedscript --output ../build/operaextensions_injectedscript.js
python build.py --include popup --output ../build/operaextensions_popup.js

#
# Copy the files to the examples dir
#

# ToolbarButtons Test Extension
cp ../build/operaextensions_background.js ../examples/ToolbarButtons/operaextensions_background.js

# WinTabs Test Extension
cp ../build/operaextensions_background.js ../examples/WinTabs/operaextensions_background.js

# Messaging Test Extension
cp ../build/operaextensions_background.js ../examples/Messaging/operaextensions_background.js
cp ../build/operaextensions_injectedscript.js ../examples/Messaging/operaextensions_injectedscript.js

# Widget API Test Extension
cp ../build/operaextensions_background.js ../examples/WidgetAPI/operaextensions_background.js
cp ../build/operaextensions_injectedscript.js ../examples/WidgetAPI/operaextensions_injectedscript.js
