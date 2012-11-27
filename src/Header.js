!(function( global ) {

  var opera = global.opera || { 
    REVISION: '1',
    version: function() {
      return this.REVISION;
    },
    postError: function( str ) { 
      console.log( str ); 
    } 
  };
  
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
