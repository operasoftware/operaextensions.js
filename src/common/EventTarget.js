
var OEventTarget = function() {

  EventTarget.mixin( this );

};

OEventTarget.prototype.constructor = OEventTarget;

OEventTarget.prototype.addEventListener = function(eventName, callback, useCapture) {
  this.on(eventName, callback); // no useCapture
};

OEventTarget.prototype.removeEventListener = function(eventName, callback, useCapture) {
  this.off(eventName, callback); // no useCapture
}

OEventTarget.prototype.dispatchEvent = function( eventObj ) {

  var eventName = eventObj.type;

  // Register an onX functions registered for this event, if any
  if(typeof this[ 'on' + eventName.toLowerCase() ] === 'function') {
    this.on( eventName, this[ 'on' + eventName.toLowerCase() ] );
  }

  this.trigger( eventName, eventObj );

};
