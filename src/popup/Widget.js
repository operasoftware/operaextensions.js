
// Add Widget API via the bgProcess
try {
  global.widget = widget || OEX.bgProcess.widget;
} catch(e) {
  global.widget = OEX.bgProcess.widget;
}
