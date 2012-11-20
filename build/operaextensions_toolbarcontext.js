(function( global ) {

  var opera = global.opera || { REVISION: '1' };

  var OEX = opera.extension = opera.extension || {};
  
  var OEC = opera.contexts = opera.contexts || {};

  self.console = self.console || {

    info: function() {},
    log: function() {},
    debug: function() {},
    warn: function() {},
    error: function() {}

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

  var self = this;

  this._queue = [];
  this.resolved = false;

  this.on('promise:resolved', function() {

    // Mark this object as resolved
    self.resolved = true;

    // Run next enqueued action on this object, if any
    self.dequeue();
  });

};

OPromise.prototype = Object.create( RSVP.Promise.prototype );

OPromise.prototype.addEventListener = OPromise.prototype.on;

OPromise.prototype.removeEventListener = OPromise.prototype.off;

OPromise.prototype.fireEvent = function( oexEventObj ) {

  var eventName = oexEventObj.type;

  if(typeof this[ 'on' + eventName.toLowerCase() ] === 'function') {
    this[ 'on' + eventName.toLowerCase() ].call( this, oexEventObj );
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
  // TODO invoke this function when a popup page loads
  function clickEventHandler(_tab) {
    
    console.log('click event');
    
    //if( self.resolved ) {
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
  
  toolbarUIItem.badge.resolve();
  toolbarUIItem.popup.resolve();
  
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
  
  this.enqueue('apply');
  
};

ToolbarBadge.prototype = Object.create( OPromise.prototype );

ToolbarBadge.prototype.apply = function() {

  chrome.browserAction.setBadgeBackgroundColor({ "color": this.backgroundColor });
  
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
  
  this.enqueue('apply');

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
  // will need to pass this message to the popup process itself
  // to resize the popup window
});

ToolbarPopup.prototype.__defineGetter__("height", function() {
  return this.properties.height;
});

ToolbarPopup.prototype.__defineSetter__("height", function( val ) {
  this.properties.height = val;
  // not implemented in chromium
  //
  // will need to pass this message to the popup process itself
  // to resize the popup window
});

var ToolbarUIItem = function( properties ) {
  
  OPromise.call( this );
  
  this.properties = {};
  
  this.properties.disabled = properties.disabled || false;
  this.properties.title = properties.title || "";
  this.properties.icon = properties.icon || "";
  this.properties.popup = new ToolbarPopup( properties.popup || {} );
  this.properties.badge = new ToolbarBadge( properties.badge || {} );
  
  this.enqueue('apply');
  
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

  // Make API available on the window DOM object
  global.opera = opera;

})( window );