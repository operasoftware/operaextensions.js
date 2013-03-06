!(function( global ) {
  
  // NEX<->CRX support set up
  var nexAPIStubs = ['app', 'extension', 'windows', 'tabs', 'browserAction', 'contextMenus', 'i18n', 'webRequest'];
  if(!global.chrome) {
    global.chrome = {};
  }
  for(var i = 0, l = nexAPIStubs.length; i < l; i++) {
    global.chrome[ nexAPIStubs[ i ] ] = global.chrome[ nexAPIStubs[ i ] ] || global.navigator[ nexAPIStubs[ i ] ] || {};
  }

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
  
  var manifest = chrome.app.getDetails(); // null in injected scripts / popups
  
  navigator.browserLanguage=navigator.language; //Opera defines both, some extensions use the former

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
