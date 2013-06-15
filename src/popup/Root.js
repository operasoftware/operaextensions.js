
var OperaExtension = function() {

  OMessagePort.call( this, false );

};

OperaExtension.prototype = Object.create( OMessagePort.prototype );

OperaExtension.prototype.__defineGetter__('bgProcess', function() {
  return chrome.extension.getBackgroundPage();
});

// Generate API stubs

var OEX = opr.extension = opr.extension || new OperaExtension();

var OEC = opr.contexts = opr.contexts || {};
