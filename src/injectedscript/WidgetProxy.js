
// Add Widget API directly to global window
try {
  global.widget = widget || new OWidgetObjProxy();
} catch(e) {
  global.widget = new OWidgetObjProxy();
}
