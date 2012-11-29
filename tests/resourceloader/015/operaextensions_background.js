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

// Used to trigger opera.isReady() functions
var deferredComponentsLoadStatus = {
  'WINTABS_LOADED': false,
  'WIDGET_API_LOADED': false,
  'WIDGET_PREFERENCES_LOADED': false
  // ...etc
};
/**
 * rsvp.js
 *
 * Author: Tilde, Inc.
 * URL: https://github.com/tildeio/rsvp.js
 * Licensed under MIT License
 *
 * Customized for use in operaextensions.js
 * By: Rich Tibbett
 */

 var exports = {};
 var browserGlobal = (typeof window !== 'undefined') ? window : {};

 var MutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
 var async;

 if (typeof process !== 'undefined' &&
   {}.toString.call(process) === '[object process]') {
   async = function(callback, binding) {
     process.nextTick(function() {
       callback.call(binding);
     });
   };
 } else if (MutationObserver) {
   var queue = [];

   var observer = new MutationObserver(function() {
     var toProcess = queue.slice();
     queue = [];

     toProcess.forEach(function(tuple) {
       var callback = tuple[0], binding = tuple[1];
       callback.call(binding);
     });
   });

   var element = document.createElement('div');
   observer.observe(element, { attributes: true });

   async = function(callback, binding) {
     queue.push([callback, binding]);
     element.setAttribute('drainQueue', 'drainQueue');
   };
 } else {
   async = function(callback, binding) {
     setTimeout(function() {
       callback.call(binding);
     }, 1);
   };
 }

 exports.async = async;

 var Event = exports.Event = function(type, options) {
   this.type = type;

   for (var option in options) {
     if (!options.hasOwnProperty(option)) { continue; }

     this[option] = options[option];
   }
 };

 var indexOf = function(callbacks, callback) {
   for (var i=0, l=callbacks.length; i<l; i++) {
     if (callbacks[i][0] === callback) { return i; }
   }

   return -1;
 };

 var callbacksFor = function(object) {
   var callbacks = object._promiseCallbacks;

   if (!callbacks) {
     callbacks = object._promiseCallbacks = {};
   }

   return callbacks;
 };

 var EventTarget = exports.EventTarget = {
   mixin: function(object) {
     object.on = this.on;
     object.off = this.off;
     object.trigger = this.trigger;
     return object;
   },

   on: function(eventNames, callback, binding) {
     var allCallbacks = callbacksFor(this), callbacks, eventName;
     eventNames = eventNames.split(/\s+/);
     binding = binding || this;

     while (eventName = eventNames.shift()) {
       callbacks = allCallbacks[eventName];

       if (!callbacks) {
         callbacks = allCallbacks[eventName] = [];
       }

       if (indexOf(callbacks, callback) === -1) {
         callbacks.push([callback, binding]);
       }
     }
   },

   off: function(eventNames, callback) {
     var allCallbacks = callbacksFor(this), callbacks, eventName, index;
     eventNames = eventNames.split(/\s+/);

     while (eventName = eventNames.shift()) {
       if (!callback) {
         allCallbacks[eventName] = [];
         continue;
       }

       callbacks = allCallbacks[eventName];

       index = indexOf(callbacks, callback);

       if (index !== -1) { callbacks.splice(index, 1); }
     }
   },

   trigger: function(eventName, options) {
     var allCallbacks = callbacksFor(this),
         callbacks, callbackTuple, callback, binding, event;

     if (callbacks = allCallbacks[eventName]) {
       for (var i=0, l=callbacks.length; i<l; i++) {
         callbackTuple = callbacks[i];
         callback = callbackTuple[0];
         binding = callbackTuple[1];

         if (typeof options !== 'object') {
           options = { detail: options };
         }

         event = new Event(eventName, options);
         callback.call(binding, event);
       }
     }
   }
 };

 var Promise = exports.Promise = function() {
   this.on('promise:resolved', function(event) {
     this.trigger('success', { detail: event.detail });
   }, this);

   this.on('promise:failed', function(event) {
     this.trigger('error', { detail: event.detail });
   }, this);
 };

 var noop = function() {};

 var invokeCallback = function(type, promise, callback, event) {
   var value, error;

   if (callback) {
     try {
       value = callback(event.detail);
     } catch(e) {
       error = e;
     }
   } else {
     value = event.detail;
   }

   if (value instanceof Promise) {
     value.then(function(value) {
       promise.resolve(value);
     }, function(error) {
       promise.reject(error);
     });
   } else if (callback && value) {
     promise.resolve(value);
   } else if (error) {
     promise.reject(error);
   } else {
     promise[type](value);
   }
 };

 Promise.prototype = {
   then: function(done, fail) {
     var thenPromise = new Promise();

     this.on('promise:resolved', function(event) {
       invokeCallback('resolve', thenPromise, done, event);
     });

     this.on('promise:failed', function(event) {
       invokeCallback('reject', thenPromise, fail, event);
     });

     return thenPromise;
   },

   resolve: function(value) {
     exports.async(function() {
       this.trigger('promise:resolved', { detail: value });
       this.isResolved = value;
     }, this);

     this.resolve = noop;
     this.reject = noop;
   },

   reject: function(value) {
     exports.async(function() {
       this.trigger('promise:failed', { detail: value });
       this.isRejected = value;
     }, this);

     this.resolve = noop;
     this.reject = noop;
   }
 };

 EventTarget.mixin(Promise.prototype);

var OPromise = function() {

  Promise.call( this );

  // General enqueue/dequeue infrastructure

  this._queue = [];
  this.resolved = false;

  this.on('promise:resolved', function() {

    // Mark this object as resolved
    this.resolved = true;

    // Run next enqueued action on this object, if any
    this.dequeue();
  }.bind(this));

};

OPromise.prototype = Object.create( Promise.prototype );

OPromise.prototype.addEventListener = OPromise.prototype.on;

OPromise.prototype.removeEventListener = OPromise.prototype.off;

OPromise.prototype.fireEvent = function( oexEventObj ) {

  var eventName = oexEventObj.type;

  // Register an onX functions registered for this event
  if(typeof this[ 'on' + eventName.toLowerCase() ] === 'function') {
    this.on( eventName, this[ 'on' + eventName.toLowerCase() ] );
  }

  this.trigger( eventName, oexEventObj );

}

OPromise.prototype.enqueue = function() {

  // Must at least provide a method name to queue
  if(arguments.length < 1) {
    return;
  }
  var methodName = arguments[0];

  var methodArgs = [];

  if(arguments.length > 1) {
    for(var i = 1, l = arguments.length; i < l; i++) {
      methodArgs.push( arguments[i] );
    }
  }

  // Add provided action item to the queue
  this._queue.push( { 'action': methodName, 'args': methodArgs } );

  //console.log("Enqueue on obj[" + this._operaId + "] queue length = " + this._queue.length);
};

OPromise.prototype.dequeue = function() {
  // Select first queued action item
  var queueItem = this._queue[0];

  if(!queueItem) {
    return;
  }

  // Remove fulfilled action from the queue
  this._queue.splice(0, 1);

  // Fulfil action item
  if( this[ queueItem.action ] ) {
    this[ queueItem.action ].apply( this, queueItem.args );
  }

  //console.log("Dequeue on obj[" + this._operaId + "] queue length = " + this._queue.length);
};

var OEvent = function(eventType, eventProperties) {

  var evt = document.createEvent("Event");

  evt.initEvent(eventType, true, true);

  // Add custom properties or override standard event properties
  for (var i in eventProperties) {
    evt[i] = eventProperties[i];
  }

  return evt;

};

var OMessagePort = function( isBackground ) {

  OPromise.call( this );
  
  this._isBackground = isBackground || false;
  
  this._localPort = null;
  
  // Every process, except the background process needs to connect up ports
  if( !this._isBackground ) {
    
    this._localPort = chrome.extension.connect({ "name": ("" + Math.floor( Math.random() * 1e16)) });
    
    this._localPort.onDisconnect.addListener(function() {
    
      this.fireEvent( new OEvent( 'disconnect', { "source": this._localPort } ) );
      
      this._localPort = null;
      
    }.bind(this));
    
    this._localPort.onMessage.addListener( function( _message, _sender, responseCallback ) {

      var localPort = this._localPort;
      
      if(_message && _message.action && _message.action.indexOf('___O_') === 0) {

        // Fire controlmessage events *immediately*
        this.fireEvent( new OEvent(
          'controlmessage', 
          { 
            "data": _message,
            "source": {
              postMessage: function( data ) {
                localPort.postMessage( data );
              },
              "tabId": _sender && _sender.tab ? _sender.tab.id : null
            }
          }
        ) );
        
      } else {
        
        // Fire 'message' event once we have all the initial listeners setup on the page
        // so we don't miss any .onconnect call from the extension page.
        // Or immediately if the shim isReady
        addDelayedEvent(this, 'fireEvent', [ new OEvent(
          'message', 
          { 
            "data": _message,
            "source": {
              postMessage: function( data ) {
                localPort.postMessage( data );
              },
              "tabId": _sender && _sender.tab ? _sender.tab.id : null
            }
          }
        ) ]);
        
      }
      
    }.bind(this) );

    // Fire 'connect' event once we have all the initial listeners setup on the page
    // so we don't miss any .onconnect call from the extension page
    addDelayedEvent(this, 'fireEvent', [ new OEvent('connect', { "source": this._localPort }) ]);
    
  }
  
};

OMessagePort.prototype = Object.create( OPromise.prototype );

OMessagePort.prototype.postMessage = function( data ) {
  
  if( !this._isBackground ) {
    if(this._localPort) {
      
      this._localPort.postMessage( data );
      
    }
  } else {
    
    this.broadcastMessage( data );
        
  }
  
};

var OBackgroundMessagePort = function() {

  OMessagePort.call( this, true );
  
  this._allPorts = [];
  
  chrome.extension.onConnect.addListener(function( _remotePort ) {
  
    var portIndex = this._allPorts.length;
    
    // When this port disconnects, remove _port from this._allPorts
    _remotePort.onDisconnect.addListener(function() {
      
      this._allPorts.splice( portIndex - 1, 1 );
      
      this.fireEvent( new OEvent('disconnect', { "source": _remotePort }) );
      
    }.bind(this));
    
    this._allPorts[ portIndex ] = _remotePort;
    
    _remotePort.onMessage.addListener( function( _message, _sender, responseCallback ) {
      
      if(_message && _message.action && _message.action.indexOf('___O_') === 0) {

        // Fire controlmessage events *immediately*
        this.fireEvent( new OEvent(
          'controlmessage', 
          { 
            "data": _message,
            "source": {
              postMessage: function( data ) {
                _remotePort.postMessage( data );
              },
              "tabId": _remotePort.sender && _remotePort.sender.tab ? _remotePort.sender.tab.id : null
            }
          }
        ) );
        
      } else {
        
        // Fire 'message' event once we have all the initial listeners setup on the page
        // so we don't miss any .onconnect call from the extension page.
        // Or immediately if the shim isReady
        addDelayedEvent(this, 'fireEvent', [ new OEvent(
          'message', 
          { 
            "data": _message,
            "source": {
              postMessage: function( data ) {
                _remotePort.postMessage( data );
              },
              "tabId": _remotePort.sender && _remotePort.sender.tab ? _remotePort.sender.tab.id : null
            }
          }
        ) ]);
        
      }

    }.bind(this) );
  
    this.fireEvent( new OEvent('connect', { "source": _remotePort }) );
  
  }.bind(this));
  
};

OBackgroundMessagePort.prototype = Object.create( OMessagePort.prototype );

OBackgroundMessagePort.prototype.broadcastMessage = function( data ) {
  
  for(var i = 0, l = this._allPorts.length; i < l; i++) {
    this._allPorts[ i ].postMessage( data );
  }
  
};

var OExtension = function() {
  
  OBackgroundMessagePort.call( this );
  
};

OExtension.prototype = Object.create( OBackgroundMessagePort.prototype );

// Generate API stubs

var OEX = opera.extension = opera.extension || (function() { return new OExtension(); })();

var OEC = opera.contexts = opera.contexts || {};
OExtension.prototype.getFile = function(path) {
	var response = null;
	
	if(typeof path != "string")return response;
	
  try{
    var host = chrome.extension.getURL('');
    
    if(path.indexOf('widget:')==0)path = path.replace('widget:','chrome-extension:');
    if(path.indexOf('/')==0)path = path.substring(1);
    
		path = (path.indexOf(host)==-1?host:'')+path;
    
		var xhr = new XMLHttpRequest();
    
    xhr.onloadend = function(){
        if (xhr.readyState==xhr.DONE && xhr.status==200){
          result = xhr.response;
          
          result.name = path.substring(path.lastIndexOf('/')+1);
          
          result.lastModifiedDate = null;
          result.toString = function(){
            return "[object File]";
          };
          response = result;
        };
    };
   
    xhr.open('GET',path,false);
    xhr.responseType = 'blob';
  
    xhr.send(null);
	
  } catch(e){
    return response;
  };
  
	return response;
};
var OStorage = function () {
  
  // All attributes and methods defined in this class must be non-enumerable, 
  // hence the structure of this class and use of Object.defineProperty.
  
  Object.defineProperty(this, "_storage", { value : localStorage });
  
  Object.defineProperty(this, "length", { value : 0, writable:true });
  
  Object.defineProperty(OStorage.prototype, "getItem", { 
    value: function( key ) {
      var value = this._storage.getItem(key);
      // We return 'undefined' rather than 'null' if the key
      // does not exist in the Opera implementation according to
      // http://dev.opera.com/articles/view/extensions-api-widget-preferences/
      // so hack that return value here instead of returning null.
      return value === null ? undefined : value;
    }.bind(this)
  });
  
  Object.defineProperty(OStorage.prototype, "key", { 
    value: function( i ) {
      return this._storage.key(i);
    }.bind(this)
  });
  
  Object.defineProperty(OStorage.prototype, "removeItem", { 
    value: function( key, proxiedChange ) {
      this._storage.removeItem(key);
      
      if( this.hasOwnProperty( key ) ) {
        delete this[key];
        this.length--;
      }
      
      if( !proxiedChange ) {
        OEX.postMessage({
          "action": "___O_widgetPreferences_removeItem_RESPONSE",
          "data": {
            "key": key
          }
        });
      }
    }.bind(this)
  });
  
  Object.defineProperty(OStorage.prototype, "setItem", { 
    value: function( key, value, proxiedChange ) {
      this._storage.setItem(key, value);
      
      if( !this[key] ) {
        this.length++;
      }
      this[key] = value;
      
      if( !proxiedChange ) {
        OEX.postMessage({
          "action": "___O_widgetPreferences_setItem_RESPONSE",
          "data": {
            "key": key,
            "val": value
          }
        });
      } 
    }.bind(this)
  });
  
  Object.defineProperty(OStorage.prototype, "clear", { 
    value: function( proxiedChange ) {
      this._storage.clear();
      
      for(var i in this) {
        if( this.hasOwnProperty( i ) ) {
          delete this[ i ];
        }
      }
      this.length = 0;
      
      if( !proxiedChange ) {
        OEX.postMessage({
          "action": "___O_widgetPreferences_clearItem_RESPONSE"
        });
      }
    }.bind(this)
  });

};

// Inherit the standard Storage prototype
OStorage.prototype = Object.create( Storage.prototype );

var OWidgetObj = function() {
  
  OPromise.call(this);
  
  this.properties = {};
  
  // LocalStorage shim
  this._preferences = new OStorage();
  
  // Set WIDGET_PREFERENCES_LOADED feature to LOADED
  deferredComponentsLoadStatus['WIDGET_PREFERENCES_LOADED'] = true;
  
  // Setup the widget interface
  var xhr = new XMLHttpRequest();
  
  xhr.open("GET", '/manifest.json', true);

  xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
          this.properties = JSON.parse(xhr.responseText);
          this.resolve();
          
          // Set WIDGET_API_LOADED feature to LOADED
          deferredComponentsLoadStatus['WIDGET_API_LOADED'] = true;
      }
  }.bind(this);

  xhr.send();
  
  // Setup widget object proxy listener 
  // for injected scripts and popups to connect to
  OEX.addEventListener('controlmessage', function( msg ) {
    
    if( !msg.data || !msg.data.action ) {
      return;
    }
    
    switch( msg.data.action ) {
      
      // Set up all storage properties
      case '___O_widget_setup_REQUEST':
      
        var dataObj = {};
        for(var i in this.properties) {
          dataObj[ i ] = this.properties[ i ];
        }

        msg.source.postMessage({
          "action": "___O_widget_setup_RESPONSE",
          "attrs": dataObj,
          // Add a copy of the preferences object
          "_prefs": this._preferences
        });

        break;
        
      // Update a storage item
      case '___O_widgetPreferences_setItem_REQUEST':
        
        this._preferences.setItem( msg.data.data.key, msg.data.data.val, true );
        
        break;
      
      // Remove a storage item
      case '___O_widgetPreferences_removeItem_REQUEST':

        this._preferences.removeItem( msg.data.data.key, true );

        break;
        
      // Clear all storage items
      case '___O_widgetPreferences_clear_REQUEST':

        this._preferences.clear( true );
        
        break;
        
      default:
        break;
    }
    
  }.bind(this), false);
  
};

OWidgetObj.prototype = Object.create( OPromise.prototype );

OWidgetObj.prototype.__defineGetter__('name', function() {
  return this.properties.name || "";
});

OWidgetObj.prototype.__defineGetter__('shortName', function() {
  return this.properties.name ? this.properties.name.short || "" : "";
});

OWidgetObj.prototype.__defineGetter__('id', function() {
  // TODO return an id (currently no id attribute is set up)
  return this.properties.id || "";
});

OWidgetObj.prototype.__defineGetter__('description', function() {
  return this.properties.description || "";
});

OWidgetObj.prototype.__defineGetter__('author', function() {
  return this.properties.author || "";
});

OWidgetObj.prototype.__defineGetter__('authorHref', function() {
  return this.properties.author ? this.properties.author.href || "" : "";
});

OWidgetObj.prototype.__defineGetter__('authorEmail', function() {
  return this.properties.author ? this.properties.author.email || "" : "";
});

OWidgetObj.prototype.__defineGetter__('version', function() {
  return this.properties.version || "";
});

OWidgetObj.prototype.__defineGetter__('preferences', function() {
  return this._preferences;
});

// Add Widget API directly to global window
global.widget = global.widget || (function() {
  return new OWidgetObj();
})();
OEX.BrowserWindowsManager = function() {

  OPromise.call(this);

  // Set up 1 mock BrowserWindow at startup
  this[0] = new OEX.BrowserWindow();
  this.length = 1;

  this._lastFocusedWindow = this[0];

  // Set up the real BrowserWindow (& BrowserTab) objects currently available
  chrome.windows.getAll({
    populate: true
  }, function(_windows) {

    var _allTabs = [];

    // Treat the first window specially
    if (_windows.length > 0) {
      for (var i in _windows[0]) {
        this[0].properties[i] = _windows[0][i];
      }

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[0].tabs.length; j < k; j++) {
        _tabs[j] = new OEX.BrowserTab(_windows[0].tabs[j], this[0]);
        
        // Set as the currently focused tab?
        if(_tabs[j].properties.active == true && this[0].properties.focused == true) {
          this[0].tabs._lastFocusedTab = _tabs[j];
          OEX.tabs._lastFocusedTab = _tabs[j];
        }
        
      }
      this[0].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);
    }

    for (var i = 1, l = _windows.length; i < l; i++) {
      this[i] = new OEX.BrowserWindow(_windows[i]);
      this.length = i + 1;

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[i].tabs.length; j < k; j++) {
        _tabs[j] = new OEX.BrowserTab(_windows[i].tabs[j], this[i]);
        
        // Set as the currently focused tab?
        if(_tabs[j].properties.active == true && this[i].properties.focused == true) {
          this[i].tabs._lastFocusedTab = _tabs[j];
          OEX.tabs._lastFocusedTab = _tabs[j];
        }
        
      }
      this[i].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);

    }

    // Replace tabs in root tab manager object
    OEX.tabs.replaceTabs(_allTabs);

    // Set up the correct lastFocused window object
    chrome.windows.getLastFocused(
      { populate: false }, 
      function(_window) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (this[i].properties.id === _window.id) {
            this._lastFocusedWindow = this[i];
            break;
          }
        }
      }.bind(this)
    );

    // Resolve root window manager
    this.resolve();
    // Resolve root tabs manager
    OEX.tabs.resolve();

    // Resolve objects.
    //
    // Resolution of each object in order:
    // 1. Window
    // 2. Window's Tab Manager
    // 3. Window's Tab Manager's Tabs
    for (var i = 0, l = this.length; i < l; i++) {
      this[i].resolve();
      this[i].tabs.resolve();
      for (var j = 0, k = this[i].tabs.length; j < k; j++) {
        this[i].tabs[j].resolve();
      }
    }
    
    // Set WinTabs feature to LOADED
    deferredComponentsLoadStatus['WINTABS_LOADED'] = true;

  }.bind(this));

  // Monitor ongoing window events
  chrome.windows.onCreated.addListener(function(_window) {

    // Delay enough so that the create callback can run first in o.e.windows.create() function
    window.setTimeout(function() {

      var windowFound = false;

      // If this window is already registered in the collection then ignore
      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].properties.id == _window.id) {
          windowFound = true;
          break;
        }
      }

      // If window was created outside of this framework, add it in and initialize
      if (!windowFound) {
        var newBrowserWindow = new OEX.BrowserWindow(_window);

        // Convert tab objects to OEX.BrowserTab objects
        var newBrowserTabs = [];
        for (var i in _window.tabs) {

          var newBrowserTab = new OEX.BrowserTab(_window.tabs[i], newBrowserWindow);

          newBrowserTabs.push(newBrowserTab);

        }
        // Add OEX.BrowserTab objects to new OEX.BrowserWindow object
        newBrowserWindow.tabs.replaceTabs(newBrowserTabs);

        this[this.length] = newBrowserWindow;
        this.length += 1;

        // Resolve objects.
        //
        // Resolution of each object in order:
        // 1. Window
        // 2. Window's Tab Manager
        // 3. Window's Tab Manager's Tabs
        newBrowserWindow.resolve();
        newBrowserWindow.tabs.resolve();
        for (var i = 0, l = newBrowserWindow.tabs.length; i < l; i++) {
          newBrowserWindow.tabs[i].resolve();
        }

        // Fire a new 'create' event on this manager object
        this.fireEvent(new OEvent('create', {
          browserWindow: newBrowserWindow
        }));

      }

    }.bind(this), 200);

  }.bind(this));

  chrome.windows.onRemoved.addListener(function(windowId) {

    // Remove window from current collection
    var deleteIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == windowId) {
        deleteIndex = i;
        break;
      }
    }

    if (deleteIndex > -1) {

      // Fire a new 'close' event on the closed BrowserWindow object
      this[deleteIndex].fireEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));

      // Fire a new 'close' event on this manager object
      this.fireEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));

      // Manually splice the deleteIndex_th_ item from the current collection
      for (var i = deleteIndex, l = this.length; i < l; i++) {
        if (this[i + 1]) {
          this[i] = this[i + 1];
        }
      }
      delete this[this.length - 1];
      this.length -= 1;

    }

  }.bind(this));

  chrome.windows.onFocusChanged.addListener(function(windowId) {

    for (var i = 0, l = this.length; i < l; i++) {

      if (this[i].properties.id == windowId) {
        this._lastFocusedWindow = this[i];
        break;
      }

    }

  }.bind(this));

};

OEX.BrowserWindowsManager.prototype = Object.create(OPromise.prototype);

OEX.BrowserWindowsManager.prototype.create = function(tabsToInject, browserWindowProperties, obj) {

  browserWindowProperties = browserWindowProperties || {};

  var shadowBrowserWindow = obj || new OEX.BrowserWindow(browserWindowProperties);

  // If current object is not resolved, then enqueue this action
  if (!this.resolved) {
    this.enqueue('create', tabsToInject, browserWindowProperties, shadowBrowserWindow);
    return shadowBrowserWindow;
  }

  browserWindowProperties.incognito = browserWindowProperties.private || false;

  chrome.windows.create(
    browserWindowProperties, 
    function(_window) {
      // Update BrowserWindow properties
      for (var i in _window) {
        shadowBrowserWindow.properties[i] = _window[i];
      }

      // Convert tab objects to OEX.BrowserTab objects
      var browserTabs = [];

      if (_window.tabs) {

        for (var i = 0, l = _window.tabs.length; i < l; i++) {

          var shadowBrowserTab = new OEX.BrowserTab(_window.tabs[i], shadowBrowserWindow);

          browserTabs.push(shadowBrowserTab);

        }

      }

      //shadowBrowserWindow._parent = self;
      shadowBrowserWindow.tabs.replaceTabs(browserTabs);

      // Add this object to the current collection
      this[this.length] = shadowBrowserWindow;
      this.length += 1;

      // Resolution order:
      // 1. Window
      // 2. Window's Tab Manager
      // 3. Window's Tab Manager's Tabs
      shadowBrowserWindow.resolve();

      shadowBrowserWindow.tabs.resolve();

      // Add tabs included in the create() call to the newly created
      // window, if any, based on type
      if (tabsToInject) {
        for (var i in tabsToInject) {

          if (tabsToInject[i] instanceof OEX.BrowserTab) {

            (function(tab) {
              chrome.tabs.move(
                tab.properties.id, 
                {
                  index: -1,
                  windowId: _window.id
                }, function(_tab) {
                  for (var i in _tab) {
                    tab.properties[i] = _tab[i];
                  }

                  tab.resolve();
                }
              );
            })(tabsToInject[i]);

          } else if (tabsToInject[i] instanceof OEX.BrowserTabGroup) {

            // TODO Implement BrowserTabGroup object handling here
            
          } else { // Treat as a BrowserTabProperties object by default
            (function(browserTabProperties) {

              var shadowBrowserTab = new OEX.BrowserTab(browserTabProperties, shadowBrowserWindow);

              chrome.tabs.create(
                shadowBrowserTab.properties, 
                {
                  index: -1,
                  windowId: _window.id
                }, 
                function(_tab) {
                  for (var i in _tab) {
                    shadowBrowserTab.properties[i] = _tab[i];
                  }

                  shadowBrowserTab.resolve();
                }
              );

              // Register BrowserTab object with the current BrowserWindow object
              shadowBrowserWindow.tabs.addTabs([shadowBrowserTab]);

            })(tabsToInject[i]);

          }

        }

      }

      // Fire a new 'create' event on this manager object
      this.fireEvent(new OEvent('create', {
        browserWindow: shadowBrowserWindow
      }));

      this.dequeue();

    }.bind(this)
  );

  return shadowBrowserWindow;
};

OEX.BrowserWindowsManager.prototype.getAll = function() {

  var allWindows = [];

  for (var i = 0, l = this.length; i < l; i++) {
    allWindows[i] = this[i];
  }

  return allWindows;

};

OEX.BrowserWindowsManager.prototype.getLastFocused = function() {

  return this._lastFocusedWindow;

};

OEX.BrowserWindowsManager.prototype.close = function(browserWindow) {

  chrome.windows.remove(browserWindow.properties.id, function() {

    browserWindow.properties.closed = true;
    browserWindow.dequeue();

  });

};

OEX.BrowserWindow = function(browserWindowProperties) {

  OPromise.call(this);

  this.properties = browserWindowProperties || {};

  this._parent = null;

  this._tabGroups = [];

  // Create a unique browserWindow id
  this._operaId = Math.floor(Math.random() * 1e16);

  this.tabs = new OEX.BrowserTabsManager(this);
  // TODO Implement BrowserTabGroupsManager interface
  //this.tabGroups = new OEX.BrowserTabGroupsManager( this );
};

OEX.BrowserWindow.prototype = Object.create(OPromise.prototype);

// API
OEX.BrowserWindow.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

OEX.BrowserWindow.prototype.__defineGetter__("closed", function() {
  return this.properties.closed || false;
});

OEX.BrowserWindow.prototype.__defineGetter__("focused", function() {
  return this.properties.focused || false;
});

OEX.BrowserWindow.prototype.__defineGetter__("private", function() {
  return this.properties.incognito || false;
});

OEX.BrowserWindow.prototype.__defineGetter__("parent", function() {
  return this._parent;
});

OEX.BrowserWindow.prototype.insert = function(browserTab, child) {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._parent && !this._parent.resolved) || !browserTab.resolved ||
            (child && !child.resolved)) {
    this.enqueue('insert', browserTab, child);
    return;
  }

  if (this.closed === true) {
    throw {
      name: "Invalid State Error",
      message: "Current window is in the closed state and therefore is invalid"
    };
    return;
  }

  var browserTabProperties = {
    windowId: this.properties.id
  };

  // Set insert position for the new tab from 'before' attribute, if any
  if (child && child instanceof OEX.BrowserTab) {

    if (child.closed === true) {
      throw {
        name: "Invalid State Error",
        message: "'child' attribute is in the closed state and therefore is invalid"
      };
      return;
    }

    if (child._windowParent && child._windowParent.closed === true) {
      throw {
        name: "Invalid State Error",
        message: "Parent window of 'child' attribute is in the closed state and therefore is invalid"
      };
      return;
    }
    browserTabProperties.windowId = child._windowParent ?
                                      child._windowParent.properties.id : browserTabProperties.windowId;
    browserTabProperties.index = child.position;

  }

  if (browserTab instanceof OEX.BrowserTab) {

    // Fulfill this action against the current object
    chrome.tabs.move(
      browserTab.properties.id, 
      browserTabProperties, 
      function(_tab) {
        // Run next enqueued action on this object, if any
        this.dequeue();
      }.bind(this)
    );

  }
/* else if( browserTab instanceof OEX.BrowserTabGroup ) {

    // TODO implement BrowserTabGroup interface

  }*/

};

OEX.BrowserWindow.prototype.focus = function() {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved || (this._parent && !this._parent.resolved)) {
    this.enqueue('focus');
    return;
  }

  chrome.windows.update(
    this.properties.id, {
      focused: true
    }, 
    function() {
      this.dequeue();
    }
  );

};

OEX.BrowserWindow.prototype.update = function(browserWindowProperties) {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved || (this._parent && !this._parent.resolved)) {
    this.enqueue('update', browserWindowProperties);
    return;
  }

  for (var i in browserWindowProperties) {
    this.properties[i] = browserWindowProperties[i];
  }

  // TODO enforce incognito because we can't make a tab incognito once it has been added to a non-incognito window.
  //browserWindowProperties.incognito = browserWindowProperties.private || false;
  
  // Make any requested changes take effect in the user agent
  chrome.windows.update(
    this.properties.id, 
    browserWindowProperties, 
    function() {
      this.dequeue();
    }
  );

}

OEX.BrowserWindow.prototype.close = function() {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved || (this._parent && !this._parent.resolved)) {
    this.enqueue('close');
    return;
  }

  OEX.windows.close(this);

};

OEX.BrowserTabsManager = function( parentObj ) {

  OPromise.call( this );

  // Set up 0 mock BrowserTab objects at startup
  this.length = 0;

  this._lastFocusedTab = null;

  this._parent = parentObj;

  // Remove all collection items and replace with browserTabs
  this.replaceTabs = function( browserTabs ) {

    for( var i = 0, l = this.length; i < l; i++ ) {
      delete this[ i ];
    }
    this.length = 0;

    for( var i = 0, l = browserTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        browserTabs[ i ].properties.index = i;
      }
      browserTabs[ i ].properties.closed = false;
      this[ i ] = browserTabs[ i ];
    }
    this.length = browserTabs.length;
  };

  // Add an array of browserTabs to the current collection
  this.addTabs = function( browserTabs, startPosition ) {
    // Extract current set of tabs in collection
    var allTabs = [];
    for(var i = 0, l = this.length; i < l; i++) {
      allTabs[ i ] = this[ i ];
    }

    // Add new browserTabs to allTabs array
    var spliceArgs = [startPosition || allTabs.length - 1, 0].concat( browserTabs );
    Array.prototype.splice.apply(allTabs, spliceArgs);

    // Rewrite the current tabs collection in order
    for( var i = 0, l = allTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        // Update all tab indexes to the current tabs collection order
        allTabs[ i ].properties.index = i;
      }
      allTabs[ i ].properties.closed = false;
      this[ i ] = allTabs[ i ];
    }
    this.length = allTabs.length;
    
  };

  // Remove a browserTab from the current collection
  this.removeTab = function( browserTab ) {
    
    var oldCollectionLength = this.length;
    
    // Extract current set of tabs in collection
    var allTabs = [];
    var removeTabIndex = -1;
    for(var i = 0, l = this.length; i < l; i++) {
      allTabs[ i ] = this[ i ];
      if( allTabs[ i ].id == browserTab.id ) {
        removeTabIndex = i;
      }
    }

    // Remove browser tab
    if(removeTabIndex > -1) {
      allTabs.splice(removeTabIndex, 1);
    }
    
    // Indicate that this tab is now closed
    browserTab.properties.closed = true;
    // Detach _windowParent from removed tab
    browserTab._windowParent = null;

    // Rewrite the current tabs collection
    for( var i = 0, l = allTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        allTabs[ i ].properties.index = i;
      }
      this[ i ] = allTabs[ i ];
    }
    this.length = allTabs.length;
    
    // Remove any ghost items, if any
    if(oldCollectionLength > this.length) {
      for(var i = this.length, l = oldCollectionLength; i < l; i++) {
        delete this[ i ];
      }
    }
    
  };

};

OEX.BrowserTabsManager.prototype = Object.create( OPromise.prototype );

OEX.BrowserTabsManager.prototype.create = function( browserTabProperties, before, obj ) {

  browserTabProperties = browserTabProperties || {};

  var shadowBrowserTab = obj || new OEX.BrowserTab();

  // If current object is not resolved, then enqueue this action
  if( !this.resolved || (this._parent && !this._parent.resolved) ) {
    this.enqueue( 'create', browserTabProperties, before, shadowBrowserTab );
    return shadowBrowserTab;
  }

  // Parameter mappings
  browserTabProperties.pinned = browserTabProperties.locked || false;
  browserTabProperties.active = browserTabProperties.focused || false;

  // Not allowed in Chromium API
  delete browserTabProperties.focused;

  // TODO handle private tab insertion differently in Chromium
  //browserTabProperties.incognito = browserTabProperties.private || false;

  // Set parent window to create the tab in

  if(this._parent && this._parent.closed === true ) {
    throw {
        name:        "Invalid State Error",
        message:     "Parent window is in the closed state and therefore is invalid"
    };
    return;
  }
  // no windowId will default to adding the tab to the current window
  browserTabProperties.windowId = this._parent ? this._parent.properties.id : undefined;

  // Set insert position for the new tab from 'before' attribute, if any
  if( before && before instanceof OEX.BrowserTab ) {

    if( before.closed === true ) {
      throw {
          name:        "Invalid State Error",
          message:     "'before' attribute is in the closed state and therefore is invalid"
      };
      return;
    }

    if(before._windowParent && before._windowParent.closed === true ) {
      throw {
          name:        "Invalid State Error",
          message:     "Parent window of 'before' attribute is in the closed state and therefore is invalid"
      };
      return;
    }
    browserTabProperties.windowId = before._windowParent ?
                                      before._windowParent.properties.id : browserTabProperties.windowId;
    browserTabProperties.index = before.position;

  }

  chrome.tabs.create(
    browserTabProperties,
    function( _tab ) {

      // Update BrowserTab properties
      for(var i in _tab) {
        shadowBrowserTab.properties[i] = _tab[i];
      }

      // Set up the shadowBrowserTab's parent BrowserWindow relationship
      var noParentWindow = true;

      if(_tab.windowId) {
        var _windows = opera.extension.windows;
        for(var i = 0, l = _windows.length; i < l; i++ ) {
          if( _windows[ i ].properties.id === _tab.windowId ) {
            noParentWindow = false;
            shadowBrowserTab._windowParent = _windows[ i ];
            break;
          }
        }
      }

      // Add to the default window if there is no other parent to use
      if( noParentWindow ) {
        shadowBrowserTab._windowParent = OEX.windows.getLastFocused();
      }

      // Add this object to the current tabs collection
      this.addTabs([ shadowBrowserTab ], shadowBrowserTab.properties.index);

      // Add this object to the root tab manager (if this is not the root tab manager)
      if(this !== OEX.tabs) {
        OEX.tabs.addTabs([ shadowBrowserTab ]);
      }

      // Resolve new tab, if it hasn't been resolved already
      shadowBrowserTab.resolve( _tab );

      // Dispatch oncreate event to all attached event listeners
      this.fireEvent( new OEvent('create', {
          "tab": shadowBrowserTab,
          "prevWindow": shadowBrowserTab._windowParent,
          "prevTabGroup": null,
          "prevPosition": -1
      }) );

      this.dequeue();

  }.bind(this));

  return shadowBrowserTab;

};

OEX.BrowserTabsManager.prototype.getAll = function() {

  var allTabs = [];

  for(var i = 0, l = this.length; i < l; i++) {
    allTabs[ i ] = this[ i ];
  }

  return allTabs;

};

OEX.BrowserTabsManager.prototype.getSelected = function() {

  return this._lastFocusedTab || this[ 0 ];

};
// Alias of .getSelected()
OEX.BrowserTabsManager.prototype.getFocused = OEX.BrowserTabsManager.prototype.getSelected;

OEX.BrowserTabsManager.prototype.close = function( browserTab ) {

  if( !browserTab ) {
    return;
  }

  // If current object is not resolved, then enqueue this action
  if( !this.resolved || (this._parent && !this._parent.resolved) || !browserTab.resolved ) {
    this.enqueue( 'close', browserTab );
    return;
  }

  chrome.tabs.remove(browserTab.properties.id, function() {
    browserTab.dequeue();

    this.dequeue();
  }.bind(this));

};

OEX.RootBrowserTabsManager = function() {

  OEX.BrowserTabsManager.call(this);

  // Event Listener implementations
  chrome.tabs.onCreated.addListener(function(_tab) {

    window.setTimeout(function() {

      // If this tab is already registered in the root tab collection then ignore
      var tabFound = false;
      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].properties.id == _tab.id) {
          tabFound = true;
          break;
        }
      }

      if (!tabFound) {
        // Create and register a new BrowserTab object
        var newTab = new OEX.BrowserTab(_tab);

        var noParentFound = true;

        // Attach the tab to its parent window object
        var _windows = opera.extension.windows;
        for (var i = 0, l = _windows.length; i < l; i++) {
          if (_windows[i].properties.id == _tab.windowId) {

            noParentFound = false;

            newTab._windowParent = _windows[i];

            break;
          }
        }

        if (noParentFound) {
          newTab._windowParent = OEX.windows.getLastFocused();
        }

        newTab._windowParent.tabs.addTabs([newTab], newTab.properties.index);

        newTab._windowParent.tabs.fireEvent(new OEvent('create', {
          "tab": newTab,
          "prevWindow": newTab._windowParent,
          "prevTabGroup": null,
          "prevPosition": NaN
        }));

        // Add object to root store
        this.addTabs([newTab]);

        // Resolve new tab, if it hasn't been resolved already
        newTab.resolve();

        // Fire a create event at RootTabsManager
        this.fireEvent(new OEvent('create', {
          "tab": newTab,
          "prevWindow": newTab._windowParent,
          "prevTabGroup": null,
          "prevPosition": NaN
        }));

      }

    }.bind(this), 200);

  }.bind(this));

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

    // Remove tab from current collection
    var deleteIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        deleteIndex = i;
        break;
      }
    }

    if (deleteIndex > -1) {

      var oldTab = this[deleteIndex];
      
      var oldTabWindowParent = oldTab ? oldTab._windowParent : null;
      var oldTabPosition = oldTab ? oldTab.position : NaN;

      // Detach from parent BrowserWindow
      if (oldTabWindowParent) {
        
        oldTabWindowParent.tabs.removeTab( oldTab );

      }
      
      // Remove tab from root tab manager
      this.removeTab( oldTab );

      // Fire a new 'close' event on the closed BrowserTab object
      oldTab.fireEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));
      
      // Fire a new 'close' event on the closed BrowserTab's previous 
      // BrowserWindow parent object
      if(oldTabWindowParent) {
        oldTabWindowParent.tabs.fireEvent(new OEvent('close', {
          "tab": oldTab,
          "prevWindow": oldTabWindowParent,
          "prevTabGroup": null,
          "prevPosition": oldTabPosition
        }));
      }

      // Fire a new 'close' event on this root tab manager object
      this.fireEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));

    }

  }.bind(this));

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {

    var updateIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        updateIndex = i;
        break;
      }
    }

    if (updateIndex < 0) {
      return; // nothing to update
    }

    var updateTab = this[updateIndex];

    // Update tab properties in current collection
    for (var i in changeInfo) {
      updateTab.properties[i] = changeInfo[i];
    }

    // Update tab properties in _windowParent object
    if (updateTab._windowParent) {
      var parentUpdateIndex = -1;
      for (var i = 0, l = updateTab._windowParent.tabs.length; i < l; i++) {
        if (updateTab._windowParent.tabs[i].properties.id == tabId) {
          parentUpdateIndex = i;
          break;
        }
      }

      if (parentUpdateIndex > -1) {

        for (var i in changeInfo) {
          updateTab._windowParent.tabs[parentUpdateIndex].properties[i] = changeInfo[i];
        }

      }

    }

  }.bind(this));

  chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {

    // Find tab object
    var moveIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        moveIndex = i;
        break;
      }
    }

    if (moveIndex < 0) {
      return; // nothing to update
    }

    var moveTab = this[moveIndex];
    var moveTabWindowParent = moveTab ? moveTab._windowParent : null;

    if(moveTab) {

      // Detach from current _windowParent and attach to new BrowserWindow parent
      if (moveTabWindowParent) {

        var parentMoveIndex = -1;
        for (var i = 0, l = moveTabWindowParent.tabs.length; i < l; i++) {
          if (moveTabWindowParent.tabs[i].properties.id == tabId) {
            parentMoveIndex = i;
            break;
          }
        }

        if (parentMoveIndex > -1) {

          // Remove moveTab from _windowParent.tabs
          for (var i = parentMoveIndex, l = moveTabWindowParent.tabs.length; i < l; i++) {
            if (moveTabWindowParent.tabs[i + 1]) {
              moveTabWindowParent.tabs[i] = moveTabWindowParent.tabs[i + 1];
            }
          }
          delete moveTabWindowParent.tabs[moveTab._windowParent.length - 1];
          moveTabWindowParent.tabs.length -= 1;

        }

      }
    
      // Find new BrowserWindow parent and attach moveTab
      for (var i = 0, l = OEX.windows.length; i < l; i++) {
        if (OEX.windows[i].properties.id == moveInfo.windowId) {
          // Attach tab to new parent
          OEX.windows[i].tabs.addTabs([moveTab], moveInfo.toIndex);
          
          // Reassign moveTab's _windowParent
          moveTab._windowParent = OEX.windows[i];
          
          break;
        }
      }

      moveTab.fireEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveInfo.fromIndex
      }));

      this.fireEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveInfo.fromIndex
      }));
    
    }

  }.bind(this));

  chrome.tabs.onHighlighted.addListener(function(highlightInfo) {

    // Set current tab property to active while setting everything else to inactive
    for (var i = 0, l = OEX.windows.length; i < l; i++) {

      for (var j = 0, k = OEX.windows[i].tabs.length; j < k; j++) {

        for (var x = 0, z = highlightInfo.tabIds.length; x < z; x++) {

          if (OEX.windows[i] == highlightInfo.windowId &&
                OEX.windows[i].tabs[j].properties.id == highlightInfo.tabIds[x]) {

            OEX.windows[i].tabs[j].properties.active = true;
            
            OEX.windows[i].tabs._lastFocusedTab = OEX.windows[i].tabs[j];
            
            this._lastFocusedTab = OEX.windows[i].tabs[j];

          } else {

            OEX.windows[i].tabs[j].properties.active = false;

          }

        }

      }

    }

  }.bind(this));
  
  // Listen for getScreenshot requests from Injected Scripts
  OEX.addEventListener('controlmessage', function( msg ) {

    if( !msg.data || !msg.data.action || msg.data.action !== '___O_getScreenshot_REQUEST' || !msg.source.tabId ) {
      return;
    }
    
    // Resolve tabId to BrowserTab object
    var sourceBrowserTab = null
    for(var i = 0, l = this.length; i < l; i++) {
      if( this[ i ].properties.id == msg.source.tabId ) {
        sourceBrowserTab = this[ i ];
        break;
      }
    }
    
    if( sourceBrowserTab !== null && 
          sourceBrowserTab._windowParent && 
              sourceBrowserTab._windowParent.properties.closed != true ) { 
      
      try {
      
        // Get screenshot of requested window belonging to current tab
        chrome.tabs.captureVisibleTab(
          sourceBrowserTab._windowParent.properties.id, 
          {},
          function( nativeCallback ) {

            // Return the result to the callee
            msg.source.postMessage({
              "action": "___O_getScreenshot_RESPONSE",
              "dataUrl": nativeCallback || null
            });
      
          }.bind(this)
        );
    
      } catch(e) {}
    
    } else {
      
      msg.source.postMessage({
        "action": "___O_getScreenshot_RESPONSE",
        "dataUrl": undefined
      });
      
    }
    
  }.bind(this));

};

OEX.RootBrowserTabsManager.prototype = Object.create(OEX.BrowserTabsManager.prototype);

OEX.BrowserTab = function(browserTabProperties, windowParent) {

  OPromise.call(this);

  this.properties = browserTabProperties || {};

  this._windowParent = windowParent;

  // Create a unique browserTab id
  this._operaId = Math.floor(Math.random() * 1e16);

};

OEX.BrowserTab.prototype = Object.create(OPromise.prototype);

// API
OEX.BrowserTab.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

OEX.BrowserTab.prototype.__defineGetter__("closed", function() {
  return this.properties.closed || false;
});

OEX.BrowserTab.prototype.__defineGetter__("locked", function() {
  return this.properties.pinned || false;
});

OEX.BrowserTab.prototype.__defineGetter__("focused", function() {
  return this.properties.active || false;
});

OEX.BrowserTab.prototype.__defineGetter__("selected", function() {
  return this.properties.active || false;
});

OEX.BrowserTab.prototype.__defineGetter__("private", function() {
  return this.properties.incognito || false;
});

OEX.BrowserTab.prototype.__defineGetter__("faviconUrl", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.favIconUrl || "";
});

OEX.BrowserTab.prototype.__defineGetter__("title", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.title || "";
});

OEX.BrowserTab.prototype.__defineGetter__("url", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.url || "";
});

OEX.BrowserTab.prototype.__defineGetter__("readyState", function() {
  return this.properties.status || "loading";
});

OEX.BrowserTab.prototype.__defineGetter__("browserWindow", function() {
  return this._windowParent;
});

OEX.BrowserTab.prototype.__defineGetter__("tabGroup", function() {
  // not implemented
  return null;
});

OEX.BrowserTab.prototype.__defineGetter__("position", function() {
  return this.properties.index || NaN;
});

// Methods
OEX.BrowserTab.prototype.close = function() {

  OEX.tabs.close(this);

};

OEX.BrowserTab.prototype.focus = function() {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved) {
    this.enqueue('focus');
    return;
  }

  chrome.tabs.update(this.properties.id, {
    active: true
  }, function() {
    this.dequeue();
  }.bind(this));

};

OEX.BrowserTab.prototype.update = function(browserTabProperties) {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved) {
    this.enqueue('update', browserTabProperties);
    return;
  }

  for (var i in browserTabProperties) {
    this.properties[i] = browserTabProperties[i];
  }

  // Parameter mappings
  browserTabProperties.active = browserTabProperties.focused || false;
  browserTabProperties.pinned = browserTabProperties.locked || false;

  // Not allowed in Chromium API
  delete browserTabProperties.focused;

  // TODO handle private tab insertion differently in Chromium
  //browserTabProperties.incognito = browserTabProperties.private || false;

  // Make any requested changes take effect in the user agent
  chrome.tabs.update(this.properties.id, browserTabProperties, function() {
    
    this.dequeue();

  }.bind(this));

};

OEX.BrowserTab.prototype.refresh = function() {
  // not implemented
};

// Web Messaging support for BrowserTab objects
OEX.BrowserTab.prototype.postMessage = function( postData ) {
  
  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._windowParent && !this._windowParent.resolved) ||
            (this._windowParent && this._windowParent._parent && !this._windowParent._parent.resolved)) {
    this.enqueue('postMessage', postData);
    return;
  }
  
  chrome.tabs.sendMessage( this.properties.id, postData );
  
  this.dequeue();
  
};

// Screenshot API support for BrowserTab objects
OEX.BrowserTab.prototype.getScreenshot = function( callback ) {
  
  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._windowParent && !this._windowParent.resolved) ||
            (this._windowParent && this._windowParent._parent && !this._windowParent._parent.resolved)) {
    this.enqueue('getScreenshot', callback);
    return;
  }
  
  if( !this._windowParent || this._windowParent.properties.closed === true) {
    callback.call( this, undefined );
    return;
  }
  
  try {
  
    // Get screenshot of requesting tab
    chrome.tabs.captureVisibleTab(
      this._windowParent.properties.id, 
      {}, 
      function( nativeCallback ) {
      
        if( nativeCallback ) {
      
          // Convert the returned dataURL in to an ImageData object and
          // return via the main callback function argument
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          var img = new Image();
          img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Return the ImageData object to the callee
            callback.call( this, imageData );
        
            this.dequeue();
            
          }.bind(this);
          img.src = nativeCallback;
      
        } else {
        
          callback.call( this, undefined );
        
        }
    
      }.bind(this)
    );
  
  } catch(e) {} 
  
};

OEX.windows = OEX.windows || (function() {
  return new OEX.BrowserWindowsManager();
})();

OEX.tabs = OEX.tabs || (function() {
  return new OEX.RootBrowserTabsManager();
})();

OEC.ToolbarContext = function() {
  
  OPromise.call( this );
  
  // we shouldn't need this on this object since it is never checked 
  // and nothing is enqueued
  // (we need OPromise for its event handling capabilities only)
  this.resolve();
  
  // Unfortunately, click events only fire if a popup is not supplied 
  // to a registered browser action in Chromium :(
  // http://stackoverflow.com/questions/1938356/chrome-browser-action-click-not-working
  //
  // TODO also invoke clickEventHandler function when a popup page loads
  function clickEventHandler(_tab) {
    
    if( this[ 0 ] ) {
      this[ 0 ].fireEvent( new OEvent('click', {}) );
    }
    
    // Fire event also on ToolbarContext API stub
    this.fireEvent( new OEvent('click', {}) );
    
  }
  
  chrome.browserAction.onClicked.addListener(clickEventHandler.bind(this));
  
};

OEC.ToolbarContext.prototype = Object.create( OPromise.prototype );

OEC.ToolbarContext.prototype.createItem = function( toolbarUIItemProperties ) {
  return new ToolbarUIItem( toolbarUIItemProperties );
};

OEC.ToolbarContext.prototype.addItem = function( toolbarUIItem ) {
  
  if( !toolbarUIItem || !(toolbarUIItem instanceof ToolbarUIItem) ) {
    return;
  }

  this[ 0 ] = toolbarUIItem;
  this.length = 1;

  toolbarUIItem.resolve();
  toolbarUIItem.apply();
  
  toolbarUIItem.badge.resolve();
  toolbarUIItem.badge.apply();
  
  toolbarUIItem.popup.resolve();
  toolbarUIItem.popup.apply();
  
  // Enable the toolbar button
  chrome.browserAction.enable();

};

OEC.ToolbarContext.prototype.removeItem = function( toolbarUIItem ) {

  if( !toolbarUIItem || !(toolbarUIItem instanceof ToolbarUIItem) ) {
    return;
  }

  if( this[ 0 ] && this[ 0 ] === toolbarUIItem ) {
    
    delete this[ 0 ];
    this.length = 0;

    // Disable the toolbar button
    chrome.browserAction.disable();
  
    toolbarUIItem.fireEvent( new OEvent('remove', {}) );
  
    // Fire event on self
    this.fireEvent( new OEvent('remove', {}) );
  
  }

};

var ToolbarBadge = function( properties ) {
  
  OPromise.call( this );
  
  this.properties = {};
  
  // Set provided properties through object prototype setter functions
  this.properties.textContent = properties.textContent;
  this.properties.backgroundColor = properties.backgroundColor;
  this.properties.color = properties.color;
  this.properties.display = properties.display;
  
  //this.enqueue('apply');
  
};

ToolbarBadge.prototype = Object.create( OPromise.prototype );

ToolbarBadge.prototype.apply = function() {

  chrome.browserAction.setBadgeBackgroundColor({ "color": (this.backgroundColor || "#f00") });
  
  if( this.display === "block" ) {
    chrome.browserAction.setBadgeText({ "text": this.textContent });
  } else {
    chrome.browserAction.setBadgeText({ "text": "" });
  }
  
};

// API

ToolbarBadge.prototype.__defineGetter__("textContent", function() {
  return this.properties.textContent;
});

ToolbarBadge.prototype.__defineSetter__("textContent", function( val ) {
  this.properties.textContent = "" + val;
  if( this.resolved ) {
    if( this.properties.display === "block" ) {
      chrome.browserAction.setBadgeText({ "text": ("" + val) });
    }
  }
});

ToolbarBadge.prototype.__defineGetter__("backgroundColor", function() {
  return this.properties.backgroundColor;
});

ToolbarBadge.prototype.__defineSetter__("backgroundColor", function( val ) {
  this.properties.backgroundColor = "" + val;

  if( this.resolved ) {
    chrome.browserAction.setBadgeBackgroundColor({ "color": ("" + val) });
  }
});

ToolbarBadge.prototype.__defineGetter__("color", function() {
  return this.properties.color;
});

ToolbarBadge.prototype.__defineSetter__("color", function( val ) {
  this.properties.color = "" + val;
  // not implemented in chromium
});

ToolbarBadge.prototype.__defineGetter__("display", function() {
  return this.properties.display;
});

ToolbarBadge.prototype.__defineSetter__("display", function( val ) {
  if(("" + val).toLowerCase() === "block") {
    this.properties.display = "block";
    if( this.resolved ) {
      chrome.browserAction.setBadgeText({ "text": this.properties.textContent });
    }
  } else {
    this.properties.display = "none";
    if( this.resolved ) {
      chrome.browserAction.setBadgeText({ "text": "" });
    }
  }
});

var ToolbarPopup = function( properties ) {
  
  OPromise.call( this );
  
  this.properties = {};
  
  // Set provided properties through object prototype setter functions
  this.properties.href = properties.href || "";
  this.properties.width = properties.width;
  this.properties.height = properties.height;
  
  //this.enqueue('apply');

};

ToolbarPopup.prototype = Object.create( OPromise.prototype );

ToolbarPopup.prototype.apply = function() {
  
  chrome.browserAction.setPopup({ "popup": this.href });
  
};

// API

ToolbarPopup.prototype.__defineGetter__("href", function() {
  return this.properties.href;
});

ToolbarPopup.prototype.__defineSetter__("href", function( val ) {
  this.properties.href = "" + val;
  if( this.resolved ) {
    chrome.browserAction.setPopup({ "popup": ("" + val) });
  }
});

ToolbarPopup.prototype.__defineGetter__("width", function() {
  return this.properties.width;
});

ToolbarPopup.prototype.__defineSetter__("width", function( val ) {
  this.properties.width = val;
  // not implemented in chromium
  //
  // TODO pass this message to the popup process itself to resize the popup window
});

ToolbarPopup.prototype.__defineGetter__("height", function() {
  return this.properties.height;
});

ToolbarPopup.prototype.__defineSetter__("height", function( val ) {
  this.properties.height = val;
  // not implemented in chromium
  //
  // TODO pass this message to the popup process itself to resize the popup window
});

var ToolbarUIItem = function( properties ) {
  
  OPromise.call( this );
  
  this.properties = {};
  
  this.properties.disabled = properties.disabled || false;
  this.properties.title = properties.title || "";
  this.properties.icon = properties.icon || "";
  this.properties.popup = new ToolbarPopup( properties.popup || {} );
  this.properties.badge = new ToolbarBadge( properties.badge || {} );
  
  //this.enqueue('apply');
  
};

ToolbarUIItem.prototype = Object.create( OPromise.prototype );

ToolbarUIItem.prototype.apply = function() {
  
  // Apply disabled property
  if( this.disabled === true ) {
    chrome.browserAction.disable();
  } else {
    chrome.browserAction.enable();
  }
  
  // Apply title property
  chrome.browserAction.setTitle({ "title": (this.title) });
  
  // Apply icon property
  chrome.browserAction.setIcon({ "path": this.icon });
  
};

// API

ToolbarUIItem.prototype.__defineGetter__("disabled", function() {
  return this.properties.disabled;
});

ToolbarUIItem.prototype.__defineSetter__("disabled", function( val ) {
  if( this.properties.disabled !== val ) {
    if( val === true || val === "true" || val === 1 || val === "1" ) {
      this.properties.disabled = true;
      if( this.resolved ) {
        chrome.browserAction.disable();
      }
    } else {
      this.properties.disabled = false;
      if( this.resolved ) {
        chrome.browserAction.enable();
      }
    }
  }
});

ToolbarUIItem.prototype.__defineGetter__("title", function() {
  return this.properties.title;
});

ToolbarUIItem.prototype.__defineSetter__("title", function( val ) {
  this.properties.title = "" + val;
  
  if( this.resolved ) {
    chrome.browserAction.setTitle({ "title": (this.title) });
  }
});

ToolbarUIItem.prototype.__defineGetter__("icon", function() {
  return this.properties.icon;
});

ToolbarUIItem.prototype.__defineSetter__("icon", function( val ) {
  this.properties.icon = "" + val;
  
  if( this.resolved ) {
    chrome.browserAction.setIcon({ "path": this.icon });
  }
});

ToolbarUIItem.prototype.__defineGetter__("popup", function() {
  return this.properties.popup;
});

ToolbarUIItem.prototype.__defineGetter__("badge", function() {
  return this.properties.badge;
});

OEC.toolbar = OEC.toolbar || (function() {
  return new OEC.ToolbarContext();
})();

  if (window.opera) {
    isReady = true;

    // Make scripts also work in Opera <= version 12
    opera.isReady = function(fn) {
      fn.call(opera);
      
      // Run delayed events (if any)
      for(var i = 0, l = _delayedExecuteEvents.length; i < l; i++) {
        var o = _delayedExecuteEvents[i];
        o.target[o.methodName].apply(o.target, o.args);
      }
      _delayedExecuteEvents = [];
    };

  } else {
  
    opera.isReady = (function() {

      var fns = {
            "isready": [],
            "domcontentloaded": [],
            "load": []
          };

      var hasFired_DOMContentLoaded = false,
          hasFired_Load = false;

      document.addEventListener("DOMContentLoaded", function handle_DomContentLoaded() {
        hasFired_DOMContentLoaded = true;
        document.removeEventListener("DOMContentLoaded", handle_DomContentLoaded, true);
      }, true);
    
      window.addEventListener("load", function handle_Load() {
        hasFired_Load = true;
        window.removeEventListener("load", handle_Load, true);
      }, true);

      function interceptAddEventListener(target, _name) {

        var _target = target.addEventListener;

        // Replace addEventListener for given target
        target.addEventListener = function(name, fn, usecapture) {
          if (name.toLowerCase() === _name.toLowerCase()) {
            if (fn === undefined || fn === null ||
                  Object.prototype.toString.call(fn) !== "[object Function]") {
              return;
            }
          
            if (isReady) {
              fn.call(window);
            } else {
              fns[_name.toLowerCase()].push(fn);
            }
          } else {
            // call standard addEventListener method on target
            _target.call(target, name, fn, usecapture);
          }
        };
      
        // Replace target.on[_name] with custom setter function
        target.__defineSetter__("on" + _name.toLowerCase(), function( fn ) {
          // call code block just created above...
          target.addEventListener(_name.toLowerCase(), fn, false);
        });

      }

      interceptAddEventListener(window, 'load');
      interceptAddEventListener(document, 'domcontentloaded');
      interceptAddEventListener(window, 'domcontentloaded'); // handled bubbled DOMContentLoaded

      function fireEvent(name, target) {
        var evtName = name.toLowerCase();

        var evt = document.createEvent('Event');
        evt.initEvent(evtName, true, true);

        for (var i = 0, len = fns[evtName].length; i < len; i++) {
          fns[evtName][i].call(target, evt);
        }
        fns[evtName] = [];
      }

      function ready() {
        window.setTimeout(function() {

          if (isReady) {
            return;
          }

          // Handle queued opera 'isReady' event functions
          for (var i = 0, len = fns['isready'].length; i < len; i++) {
            fns['isready'][i].call(window);
          }
          fns['isready'] = []; // clear

          // Synthesize and fire the document domcontentloaded event
          (function fireDOMContentLoaded() {

            // Check for hadFired_Load in case we missed DOMContentLoaded
            // event, in which case, we syntesize DOMContentLoaded here
            // (always synthesized in Chromium Content Scripts)
            if (hasFired_DOMContentLoaded || hasFired_Load) {
              
              fireEvent('domcontentloaded', document);
              
              // Synthesize and fire the window load event
              // after the domcontentloaded event has been
              // fired
              (function fireLoad() {

                if (hasFired_Load) {
                  fireEvent('load', window);

                  // Run delayed events (if any)
                  for(var i = 0, l = _delayedExecuteEvents.length; i < l; i++) {
                    var o = _delayedExecuteEvents[i];
                    o.target[o.methodName].apply(o.target, o.args);
                  }
                  _delayedExecuteEvents = [];
                } else {
                  window.setTimeout(function() {
                    fireLoad();
                  }, 20);
                }
                
              })();
              
            } else {
              window.setTimeout(function() {
                fireDOMContentLoaded();
              }, 20);
            }

          })();

          isReady = true;

        }, 0);
      }

      var holdTimeoutOverride = new Date().getTime() + 3000;
    
      (function holdReady() {

        var currentTime = new Date().getTime();

        if (currentTime >= holdTimeoutOverride) {
          // All scripts now ready to be executed: TIMEOUT override
          console.error('opera.isReady check timed out');
          ready();
          return;
        }

        for (var i in deferredComponentsLoadStatus) {
          if (deferredComponentsLoadStatus[i] !== true) {
            // spin the loop until everything is working
            // or we receive a timeout override (handled
            // in next loop, above)
            window.setTimeout(function() {
              holdReady();
            }, 20);
            return;
          }
        }

        // All scripts now ready to be executed
        ready();

      })();

      return function(fn) {
        // if the Library is already ready,
        // execute the function immediately.
        // otherwise, queue it up until isReady
        if (isReady) {
          fn.call(window);
        } else {
          fns['isready'].push(fn);
        }
      }
    })();

  }

  // Make API available on the window DOM object
  global.opera = opera;

})( window );