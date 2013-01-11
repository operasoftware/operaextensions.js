!(function( global, manifest ) {

  var Opera = function() {};

  Opera.prototype.REVISION = '1';

  Opera.prototype.version = function() {
    return this.REVISION;
  };

  Opera.prototype.buildNumber = function() {
    return this.REVISION;
  };

  Opera.prototype.postError = function( str ) {
    console.log( str );
  };

  var opera = global.opera || new Opera();

  var isReady = false;

  var _delayedExecuteEvents = [
    // Example:
    // { 'target': opera.extension, 'methodName': 'message', 'args': event }
  ];

  function addDelayedEvent(target, methodName, args) {
    if(isReady) {
      target[methodName].apply(target, args);
    } else {
      _delayedExecuteEvents.push({
        "target": target,
        "methodName": methodName,
        "args": args
      });
    }
  };
