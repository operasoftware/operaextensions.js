
/**
 * UserJS shim
 * http://www.opera.com/docs/userjs/specs
 */

EventTarget.mixin( Opera.prototype );

Opera.prototype.defineMagicVariable = function(name, getter, setter) {
  if( getter === undefined || setter === undefined ){
    return;
  }
  var allowedStringifications = {"[object Function]":1, "[object Null]":1};
  if( ! ( ( Object.prototype.toString.call(getter) in allowedStringifications ) &&
        ( Object.prototype.toString.call(setter) in allowedStringifications )) ) {
    return;
  }

  var magicScriptEl = document.createElement('script');
  magicScriptEl.setAttribute('type', 'text/javascript');

  if (getter && Object.prototype.toString.call(getter) === "[object Function]") {
    magicScriptEl.textContent += "window.__defineGetter__('" + name + "', " + getter.toString() + ");\n";
  }

  if (setter && Object.prototype.toString.call(setter) === "[object Function]") {
    magicScriptEl.textContent += "window.__defineSetter__('" + name + "', " + setter.toString() + ");\n";
  }

  document.getElementsByTagName('head')[0].appendChild( magicScriptEl );
  document.getElementsByTagName('head')[0].removeChild( magicScriptEl );

};

Opera.prototype.defineMagicFunction = function(name, implementation) {

  if(!implementation || Object.prototype.toString.call(implementation) !== "[object Function]") {
    return;
  }

  var magicScriptEl = document.createElement('script');
  magicScriptEl.setAttribute('type', 'text/javascript');

  magicScriptEl.textContent = "var " + name + " = " + implementation.toString() + ";";

  document.getElementsByTagName('head')[0].appendChild( magicScriptEl );
  document.getElementsByTagName('head')[0].removeChild( magicScriptEl );

};

Opera.prototype.addEventListener = function(name, fn, useCapture) {
  // TODO Implement http://www.opera.com/docs/userjs/specs/#evlistener
  // ... this.on(name, function)
};

Opera.prototype.removeEventListener = function(name, fn, useCapture) {
  // TODO Implement http://www.opera.com/docs/userjs/specs/#evlistener
  // ... this.off(name, function)
};

// Same backend implementation as widget.preferences
Opera.prototype.__defineGetter__('scriptStorage', function() {
  return widget.preferences;
});

Opera.prototype.setOverrideHistoryNavigationMode = function(mode) {
  // NOT IMPLEMENTED
};

Opera.prototype.__defineGetter__('getOverrideHistoryNavigationMode', function() {
  return "automatic"; // default
});
