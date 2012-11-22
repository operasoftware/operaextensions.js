!(function( global ) {

  var opera = global.opera || { 
    REVISION: '1', 
    postError: function() { 
      console.log.apply( null, arguments ); 
    } 
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

(function(exports) { "use strict";

  var browserGlobal = (typeof window !== 'undefined') ? window : {};

  var MutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var async;

  if (typeof process !== 'undefined') {
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

    on: function(eventName, callback, binding) {
      var allCallbacks = callbacksFor(this), callbacks;
      binding = binding || this;

      callbacks = allCallbacks[eventName];

      if (!callbacks) {
        callbacks = allCallbacks[eventName] = [];
      }

      if (indexOf(callbacks, callback) === -1) {
        callbacks.push([callback, binding]);
      }
    },

    off: function(eventName, callback) {
      var allCallbacks = callbacksFor(this), callbacks;

      if (!callback) {
        allCallbacks[eventName] = [];
        return;
      }

      callbacks = allCallbacks[eventName];

      var index = indexOf(callbacks, callback);

      if (index !== -1) { callbacks.splice(index, 1); }
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

  exports.invokeCallback = function(type, promise, callback, event) {
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
        exports.invokeCallback('resolve', thenPromise, done, event);
      });

      this.on('promise:failed', function(event) {
        exports.invokeCallback('reject', thenPromise, fail, event);
      });

      return thenPromise;
    },

    resolve: function(value) {
      exports.async(function() {
        this.trigger('promise:resolved', { detail: value });
        //this.resolvedValue = value;
      }, this);

      this.resolve = function() {}; // noop
      this.reject = function() {}; // noop
    },

    reject: function(value) {
      exports.async(function() {
        this.trigger('promise:failed', { detail: value });
        //this.rejectedValue = value;
      }, this);

      this.resolve = function() {}; // noop
      this.reject = function() {}; // noop
    }
  };

  EventTarget.mixin(Promise.prototype);
  
})(opera._RSVP = {});

/** end rsvp.js */

var OPromise = function() {

  opera._RSVP.Promise.call( this );

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

OPromise.prototype = Object.create( opera._RSVP.Promise.prototype );

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
    
      this._localPort = null;
      
    }.bind(this));
    
    this._localPort.onMessage.addListener( function( _message, _sender, responseCallback ) {

      var messageType = 'message';
      if(_message && _message.action && _message.action.indexOf('___O_') === 0) {
        messageType = 'controlmessage';
      }

      this.fireEvent( new OEvent(
        messageType, 
        { 
          "data": _message, 
          "source": {
            postMessage: function( data ) {
              this._localPort.postMessage( data );
            }
          }
        }
      ));

    }.bind(this) );

    // Fire 'connect' event once we have all the initial listeners setup on the page
    // so we don't miss any .onconnect call from the extension page
    global.addEventListener('load', function() {
      this.fireEvent( new OEvent('connect', { "source": this._localPort }) );
    }.bind(this), false);
    
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

var OStorageProxy = function () {
  
  // All attributes and methods defined in this class must be non-enumerable, 
  // hence the structure of this class and the use of Object.defineProperty.
  
  Object.defineProperty(this, "length", { value : 0, writable:true });
  
  Object.defineProperty(OStorageProxy.prototype, "getItem", { 
    value: function( key ) {
      return this[key] === undefined ? null : this[key];
    }
  });
  
  Object.defineProperty(OStorageProxy.prototype, "key", { 
    value: function( i ) {
      var size = 0;
      for (var i in this) {
        if( this.hasOwnProperty( i ) ) {
          if (size == i) return i;
          size++;
        }
      }
      return null;
    }
  });
  
  Object.defineProperty(OStorageProxy.prototype, "removeItem", { 
    value: function( key, proxiedChange ) {
      if( this.hasOwnProperty( key ) ) {
        delete this[key];
        this.length--;
        
        if( !proxiedChange ) {
          // Send control message to remove item from background store
          OEX.postMessage({
            "action": "___O_widgetPreferences_removeItem_REQUEST",
            "data": {
              "key": key
            }
          });
        }
      }
    }
  });
  
  Object.defineProperty(OStorageProxy.prototype, "setItem", { 
    value: function( key, value, proxiedChange ) {
      if( !this[key] ) {
        this.length++;
      }
      this[key] = value;
      
      if( !proxiedChange ) {
        // Send control message to set item in background store
        OEX.postMessage({
          "action": "___O_widgetPreferences_setItem_REQUEST",
          "data": {
            "key": key,
            "val": value
          }
        });
      }
    }
  });
  
  Object.defineProperty(OStorageProxy.prototype, "clear", { 
    value: function( proxiedChange ) {
      for(var i in this) {
        if( this.hasOwnProperty( i ) ) {
          delete this[ i ];
        }
      }
      this.length = 0;
      
      if( !proxiedChange ) {
        // Send control message to clear all items from background store
        OEX.postMessage({
          "action": "___O_widgetPreferences_clear_REQUEST"
        });
      }
    }
  });

};

var OWidgetObjProxy = function() {
  
  this.properties = {};
  
  // LocalStorage shim
  this._preferences = new OStorageProxy();
  this._preferencesSet = {};
  
  OEX.addEventListener('controlmessage', function( msg ) {
    
    if( !msg.data || !msg.data.action ) {
      return;
    }
    
    switch( msg.data.action ) {
      
      // Set up all storage properties
      case '___O_widget_setup_RESPONSE':
      
        // Copy properties
        for(var i in msg.data.attrs) {
          this.properties[ i ] = msg.data.attrs[ i ];
        }

        // Copy initial _preferences items to storage proxy object
        if(msg.data._prefs) {
          var size = 0;
          for(var i in msg.data._prefs) {
            this._preferences[ i ] = msg.data._prefs[ i ];
            this._preferences.length++;
          }
        }
      
        break;
        
      // Update a storage item
      case '___O_widgetPreferences_setItem_RESPONSE':
        
        this._preferences.setItem( msg.data.data.key, msg.data.data.val, true );
        
        break;
      
      // Remove a storage item
      case '___O_widgetPreferences_removeItem_RESPONSE':

        this._preferences.removeItem( msg.data.data.key, true );

        break;
        
      // Clear all storage items
      case '___O_widgetPreferences_clear_RESPONSE':

        this._preferences.clear( true );

        break;
        
      default:
        break;
    }
    
  }.bind(this), false); 
  
  // Setup widget API via proxy
  OEX.postMessage({
    "action": "___O_widget_setup_REQUEST"
  });
  
};

OWidgetObjProxy.prototype = Object.create( OPromise.prototype );

OWidgetObjProxy.prototype.__defineGetter__('name', function() {
  return this.properties.name || "";
});

OWidgetObjProxy.prototype.__defineGetter__('shortName', function() {
  return this.properties.name ? this.properties.name.short || "" : "";
});

OWidgetObjProxy.prototype.__defineGetter__('id', function() {
  // TODO return an id (currently no id attribute is set up)
  return this.properties.id || "";
});

OWidgetObjProxy.prototype.__defineGetter__('description', function() {
  return this.properties.description || "";
});

OWidgetObjProxy.prototype.__defineGetter__('author', function() {
  return this.properties.author || "";
});

OWidgetObjProxy.prototype.__defineGetter__('authorHref', function() {
  return this.properties.author ? this.properties.author.href || "" : "";
});

OWidgetObjProxy.prototype.__defineGetter__('authorEmail', function() {
  return this.properties.author ? this.properties.author.email || "" : "";
});

OWidgetObjProxy.prototype.__defineGetter__('version', function() {
  return this.properties.version || "";
});

OWidgetObjProxy.prototype.__defineGetter__('preferences', function() {
  return this._preferences;
});

// Add Widget API directly to global window
global.widget = global.widget || (function() {
  return new OWidgetObjProxy();
})();
  // Make API available on the window DOM object
  global.opera = opera;

})( window );