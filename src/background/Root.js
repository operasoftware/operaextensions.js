
var OperaExtension = function() {

  OBackgroundMessagePort.call( this );

};

OperaExtension.prototype = Object.create( OBackgroundMessagePort.prototype );

// Generate API stubs

var OEX = opr.extension = opr.extension || new OperaExtension();

var OEC = opr.contexts = opr.contexts || {};
