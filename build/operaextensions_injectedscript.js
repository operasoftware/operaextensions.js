!(function( global ) {

  var opera = global.opera || { 
    REVISION: '1', 
    postError: function() { 
      console.log.apply( null, arguments ); 
    } 
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
  
})(this.RSVP = {});

/** end rsvp.js */

var OPromise = function() {

  RSVP.Promise.call( this );

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

OPromise.prototype = Object.create( RSVP.Promise.prototype );

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

      this.fireEvent( new OEvent(
        'message', 
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

  // Make API available on the window DOM object
  global.opera = opera;

})( window );