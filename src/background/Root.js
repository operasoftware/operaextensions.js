
var OperaExtension = function() {

  OBackgroundMessagePort.call( this );

};

OperaExtension.prototype = Object.create( OBackgroundMessagePort.prototype );

// Generate API stubs

var OEX = opera.extension = opera.extension || new OperaExtension();

var OEC = opera.contexts = opera.contexts || {};
