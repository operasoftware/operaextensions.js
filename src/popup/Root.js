
var OperaExtension = function() {
  
  OMessagePort.call( this, false );
  
};

OperaExtension.prototype = Object.create( OMessagePort.prototype );

OperaExtension.prototype.__defineGetter__('bgProcess', function() {
  return chrome.extension.getBackgroundPage();
});

// Generate API stubs

var OEX = opera.extension = opera.extension || (function() { return new OperaExtension(); })();

var OEC = opera.contexts = opera.contexts || {};
