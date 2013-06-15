!(function( global ) {
  
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

  var opr, isOEX = false;
  
  try {
    if(opera) {
      opr = opera;
      isOEX = true;
    } else {
      opr = new Opera();
    }
  } catch(e) {
    opr = new Opera();
  }
  
  var manifest = null;
  
  try {
    manifest = chrome.app.getDetails(); // null in injected scripts / popups.
  } catch(e) {}                         // Throws in Opera 12.15.
  
  
  global.navigator.browserLanguage = global.navigator.language; //Opera defines both, some extensions use the former

  var isReady = false;

  var _delayedExecuteEvents = [
    // Example:
    // { 'target': opera.extension, 'methodName': 'message', 'args': event }
  ];
  
  // Pick the right base URL for new tab generation
  var newTab_BaseURL = 'data:text/html,<!DOCTYPE html><!--tab_%s--><title>Loading...</title><script>history.forward()</script>';

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
