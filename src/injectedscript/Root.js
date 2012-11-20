
var OExtension = function() {
  
  OMessagePort.call( this, false );
  
};

OExtension.prototype = Object.create( OMessagePort.prototype );

OExtension.prototype.__defineGetter__('bgProcess', function() {
  return chrome.extension.getBackgroundPage();
});

// Generate API stubs

var OEX = opera.extension = opera.extension || (function() { return new OExtension(); })();

var OEC = opera.contexts = opera.contexts || {};
