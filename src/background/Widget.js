
// Add Widget API directly to global window
try {
  global.widget = widget || new OWidgetObj();
} catch(e) {
  global.widget = new OWidgetObj();
}
