python build.py --include background --output ../build/operaextensions_background.js
python build.py --include injectedscript --output ../build/operaextensions_injectedscript.js
python build.py --include popup --output ../build/operaextensions_popup.js

cp ../build/operaextensions_background.js ../examples/ToolbarButtons/operaextensions_background.js

cp ../build/operaextensions_background.js ../examples/WinTabs/operaextensions_background.js

cp ../build/operaextensions_background.js ../examples/Messaging/operaextensions_background.js
cp ../build/operaextensions_injectedscript.js ../examples/Messaging/operaextensions_injectedscript.js

cp ../build/operaextensions_background.js ../examples/WidgetAPI/operaextensions_background.js
cp ../build/operaextensions_injectedscript.js ../examples/WidgetAPI/operaextensions_injectedscript.js

cp ../build/operaextensions_background.js ../examples/Screenshot/operaextensions_background.js
cp ../build/operaextensions_injectedscript.js ../examples/Screenshot/operaextensions_injectedscript.js

cp ../build/operaextensions_background.js ../examples/catalog/close-tabs-right-of-current-0.2.4/shim/operaextensions_background.min.js
cp ../build/operaextensions_injectedscript.js ../examples/catalog/close-tabs-right-of-current-0.2.4/shim/operaextensions_injectedscript.min.js
cp ../build/operaextensions_popup.js ../examples/catalog/close-tabs-right-of-current-0.2.4/shim/operaextensions_popup.min.js

cp ../build/operaextensions_background.js ../examples/catalog/extendtube-1.16.1/shim/operaextensions_background.min.js
cp ../build/operaextensions_injectedscript.js ../examples/catalog/extendtube-1.16.1/shim/operaextensions_injectedscript.min.js
cp ../build/operaextensions_popup.js ../examples/catalog/extendtube-1.16.1/shim/operaextensions_popup.min.js

cp ../build/operaextensions_background.js ../examples/catalog/to-read-sites-4.1-3-1/shim/operaextensions_background.min.js
cp ../build/operaextensions_injectedscript.js ../examples/catalog/to-read-sites-4.1-3-1/shim/operaextensions_injectedscript.min.js
cp ../build/operaextensions_popup.js ../examples/catalog/to-read-sites-4.1-3-1/shim/operaextensions_popup.min.js
