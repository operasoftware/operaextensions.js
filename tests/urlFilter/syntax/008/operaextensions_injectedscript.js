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

  var opera = global.opera || new Opera();
  
  var manifest = chrome.app.getDetails(); // null in injected scripts / popups
  
  navigator.browserLanguage=navigator.language; //Opera defines both, some extensions use the former

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

// Used to trigger opera.isReady() functions
var deferredComponentsLoadStatus = {
  'WIDGET_API_LOADED': false,
  'WIDGET_PREFERENCES_LOADED': false
  // ...etc
};

// Events to delay until window 'load' event has been
// fired by opera.isReady() below
var delayedExecuteEvents = [
  // Example:
  // { 'target': opera.extension, 'eventName': 'message', 'eventObj': event }
];

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

function OError(name, msg, code) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = name || "Error";
  this.code = code || -1;
  this.message = msg || "";
};

OError.prototype.__proto__ = Error.prototype;

var OEvent = function(eventType, eventProperties) {
  
  var props = eventProperties || {};
  
  var newEvt = new CustomEvent(eventType, true, true);

  for(var i in props) {
    newEvt[i] = props[i];
  }

  return newEvt;

};

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

var OMessagePort = function( isBackground ) {

  OEventTarget.call( this );

  this._isBackground = isBackground || false;

  this._localPort = null;

  // Every process, except the background process needs to connect up ports
  if( !this._isBackground ) {

    this._localPort = chrome.extension.connect({ "name": ("" + Math.floor( Math.random() * 1e16)) });

    this._localPort.onDisconnect.addListener(function() {

      this.dispatchEvent( new OEvent( 'disconnect', { "source": this._localPort } ) );

      this._localPort = null;

    }.bind(this));

    var onMessageHandler = function( _message, _sender, responseCallback ) {

      var localPort = this._localPort;

      if(_message && _message.action && _message.action.indexOf('___O_') === 0) {

        // Fire controlmessage events *immediately*
        this.dispatchEvent( new OEvent(
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
        addDelayedEvent(this, 'dispatchEvent', [ new OEvent(
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

      if(responseCallback)responseCallback({});

    }.bind(this);

    this._localPort.onMessage.addListener( onMessageHandler );
    chrome.extension.onMessage.addListener( onMessageHandler );


    // Fire 'connect' event once we have all the initial listeners setup on the page
    // so we don't miss any .onconnect call from the extension page
    addDelayedEvent(this, 'dispatchEvent', [ new OEvent('connect', { "source": this._localPort, "origin": "" }) ]);

  }

};

OMessagePort.prototype = Object.create( OEventTarget.prototype );

OMessagePort.prototype.postMessage = function( data ) {

  if( !this._isBackground ) {
    if(this._localPort) {

      this._localPort.postMessage( data );

    }
  } else {

    this.broadcastMessage( data );

  }

};

var OperaExtension = function() {

  OMessagePort.call( this, false );

};

OperaExtension.prototype = Object.create( OMessagePort.prototype );

OperaExtension.prototype.__defineGetter__('bgProcess', function() {
  return chrome.extension.getBackgroundPage();
});

// Add Screenshot API to Injected Script processes only
OperaExtension.prototype.getScreenshot = function( callback ) {

  var screenshotCallback = function( msg ) {

    if( !msg.data || !msg.data.action || msg.data.action !== '___O_getScreenshot_RESPONSE' || !msg.data.dataUrl ) {
      return;
    }

    // Convert the returned dataUrl in to an ImageData object and
    // return via callback function argument
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
    };
    img.src = msg.data.dataUrl;

    // Tear down this event listener
    OEX.removeEventListener('controlmessage', screenshotCallback);

  }.bind(this);

  // Set up this event listener
  OEX.addEventListener('controlmessage', screenshotCallback);

  // Request the screenshot from the background process
  OEX.postMessage({
    "action": "___O_getScreenshot_REQUEST"
  });

};

// Generate API stubs

var OEX = opera.extension = opera.extension || new OperaExtension();

var OEC = opera.contexts = opera.contexts || {};

OperaExtension.prototype.getFile = function(path) {
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

var OStorageProxy = function () {

  // All attributes and methods defined in this class must be non-enumerable,
  // hence the structure of this class and the use of Object.defineProperty.

  Object.defineProperty(this, "length", { value : 0, writable:true });

  Object.defineProperty(OStorageProxy.prototype, "getItem", {
    value: function( key ) {
      var val = this[key];
      return val === undefined ? null : val;
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

// Inherit the standard Storage prototype
OStorageProxy.prototype = Object.create( Storage.prototype );

var OWidgetObjProxy = function() {

  OEventTarget.call(this);

  this.properties = manifest || {};
  
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

        // Set WIDGET_API_LOADED feature to LOADED
        deferredComponentsLoadStatus['WIDGET_API_LOADED'] = true;

        // Copy initial _preferences items to storage proxy object
        if(msg.data._prefs) {
          var size = 0;
          for(var i in msg.data._prefs) {
            this._preferences[ i ] = msg.data._prefs[ i ];
            this._preferences.length++;
          }
        }

        // Set WIDGET_PREFERENCES_LOADED feature to LOADED
        deferredComponentsLoadStatus['WIDGET_PREFERENCES_LOADED'] = true;

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

  // When the page unloads, take all items that have been
  // added with preference.blah or preferences['blah']
  // (instead of the catachable .setItem) and push these
  // preferences to the background script
  global.addEventListener('beforeunload', function() {
    // TODO implement widget.preferences page unload behavior
  }, false);

};

OWidgetObjProxy.prototype = Object.create( OEventTarget.prototype );

OWidgetObjProxy.prototype.__defineGetter__('name', function() {
  return this.properties.name || "";
});

OWidgetObjProxy.prototype.__defineGetter__('shortName', function() {
  return this.properties.name ? this.properties.name.short || "" : "";
});

OWidgetObjProxy.prototype.__defineGetter__('id', function() {
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
global.widget = global.widget || new OWidgetObjProxy();

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
  if( ! ( (Object.prototype.toString.call(getter) in allowedStringifications) &&  
        (Object.prototype.toString.call(setter) in allowedStringifications)) ) {
    return;
  }

  var magicScriptEl = document.createElement('script');
  magicScriptEl.setAttribute('type', 'text/javascript');

  if (Object.prototype.toString.call(getter) === "[object Function]") {
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
  this.on(name, fn);
  var evtData=name.split(/\./), op=this;
  if(/beforeevent(listener|)/i.test(evtData[0]) && evtData[1]){ // BeforeEvent.event, BeforeEventListener.event. Note: no support for 'BeforeEvent' only
    document.addEventListener(evtData[1], function(e){
      fn.call( op, {type:name, event:e, preventDefault:function(){e.stopPropagation();}} ); // Note:  no support for .listener. 
      // Note: we could use op.trigger( name, {event:e} ); but the RSVP framework doesn't support event.preventDefault()
    }, true);
    return;
  }
  console.log( 'Warning: no support for '+name+' events' );
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
var MenuEvent = (function(){
  var lastSrcElement = null;

  document.addEventListener('contextmenu',function(e){
    lastSrcElement = e.srcElement;
  },false);

  return function(type,args,target){

    var event = OEvent(type,{

      documentURL: args.info.pageUrl,
      pageURL: args.info.pageUrl,
      isEditable: args.info.editable,
      linkURL: args.info.linkUrl || null,
      mediaType: args.info.mediaType || null,
      selectionText: args.info.selectionText || null,
      source:  null,
      srcURL: args.info.srcUrl || null
    });

    Object.defineProperty(event,'target',{enumerable: true,  configurable: false,  get: function(){return target || null;}, set: function(value){}});
    Object.defineProperty(event,'srcElement',{enumerable: true,  configurable: false,  get: function(srcElement){ return function(){return srcElement || null;} }(lastSrcElement), set: function(value){}});

    return event;
  };

})();

MenuEvent.prototype = Object.create( Event.prototype );
var MenuEventTarget = function(){
	var that = this;
	var target = {};

	EventTarget.mixin( target );

	var onclick = null;

	Object.defineProperty(this,'onclick',{enumerable: true,  configurable: false,  get: function(){
				return onclick;
			},
			set: function(value){
				if(onclick!=null)this.removeEventListener('click',onclick,false);

				onclick = value;

				if(onclick!=null && onclick instanceof Function)this.addEventListener('click',onclick,false);
				else onclick = null;
			}
	});

	Object.defineProperty(this,'dispatchEvent',{enumerable: false,  configurable: false, writable: false, value: function(event){
		var currentTarget = this;
		var stoppedImmediatePropagation = false;
		Object.defineProperty(event,'currentTarget',{enumerable: true,  configurable: false,  get: function(){return currentTarget;}, set: function(value){}});
		Object.defineProperty(event,'stopImmediatePropagation',{enumerable: true,  configurable: false, writable: false, value: function(){ stoppedImmediatePropagation = true;}});

		var allCallbacks = callbacksFor(target),
		callbacks = allCallbacks[event.type], callbackTuple, callback, binding;


		if (callbacks)for (var i=0, l=callbacks.length; i<l; i++) {
			callbackTuple = callbacks[i];
			callback = callbackTuple[0];
			binding = callbackTuple[1];
			if(!stoppedImmediatePropagation)callback.call(binding, event);
		};

	}});
	Object.defineProperty(this,'addEventListener',{enumerable: true,  configurable: false, writable: false, value: function(eventName, callback, useCapture) {
		target.on(eventName, callback,this); // no useCapture
	}});
	Object.defineProperty(this,'removeEventListener',{enumerable: true,  configurable: false, writable: false, value: function(eventName, callback, useCapture) {
		target.off(eventName, callback,this); // no useCapture
	}});

};

var MenuItemProxy = function(id) {

  MenuEventTarget.call( this );

  Object.defineProperty(this,'toString',{enumerable: false,  configurable: false, writable: false, value: function(event){
		return "[object MenuItemProxy]";
	}});

  Object.defineProperty(this,'id',{enumerable: true,  configurable: false,  get: function(){return id;}, set: function(){}});

};

MenuItemProxy.prototype = Object.create( MenuEventTarget.prototype );

var MenuContextProxy = function() {

  MenuEventTarget.call( this );

  Object.defineProperty(this,'toString',{enumerable: false,  configurable: false, writable: false, value: function(event){
		return "[object MenuContextProxy]";
	}});


	OEX.addEventListener('controlmessage', function(e) {

		if( !e.data || !e.data.action || e.data.action !== '___O_MenuItem_Click') {
      return;
    }

		this.dispatchEvent( new MenuEvent('click', {info: e.data.info, tab: null},new MenuItemProxy(e.data.menuItemId)) );

  }.bind(this));

};

MenuContextProxy.prototype = Object.create( MenuEventTarget.prototype );



//if(manifest && manifest.permissions && manifest.permissions.indexOf('contextMenus')!=-1){

OEC.menu = OEC.menu || new MenuContextProxy();

//}


var UrlFilterEventListener = function() {

  OEventTarget.call(this);

  this.pageSrcElementsPointers = {};
  this.pageSrcElements = {};

  // Catch resource load failures and reconcile with incoming event messages from background
  this.grabPageElements = function() {

    // Catch static HTML elements that load external content via 'src' tag:
    // SCRIPT (script), IMAGE (img, image), STYLESHEET (link rel='stylesheet'),
    // OBJECT (object, embed), SUB-DOCUMENT (iframe), MEDIA (audio, video),
    // OTHER (e.g. but not limited to: input, textarea, etc)
    var els = global.document.querySelectorAll("[src],link[rel='stylesheet'][href],object[data],body[background]");

    for(var i = 0, l = els.length; i < l; i++) {
      var url = els[ i ].src || els[ i ].href || els[ i ].data || els[ i ].background;

      // keep track of the full URL
      els[i].origUrl = url;

      var key = global.encodeURIComponent( url.split('#')[0] );

      if(this.pageSrcElements[ key ] === undefined ) {
        this.pageSrcElements[ key ] = [];
      }
      this.pageSrcElements[ key ].push( els[i] );
    }

  };

  this.dispatchURLFilterEvent = function( type, data ) {

    // get a set of the latest page elements
    this.pageSrcElements = {};
    this.grabPageElements.call(this);

    type = type + ""; // force 'type' to string
    data = data || { 'url': 'null' };

    var key = global.encodeURIComponent( (data.url).split('#')[0] );

    if( this.pageSrcElements[ key ] == undefined || this.pageSrcElements[ key ] == null ) {

      // Fire 1 basic event on this object
      this.dispatchEvent( new OEvent(type, data) );

    } else {

      for(var i = 0, l = this.pageSrcElements[ key ].length; i < l; i++) {

        var evtData = data;

        // Reconcile element from provided event url
        evtData.element = this.pageSrcElements[ key ][ i ];

        // Re-write correct URL for event
        evtData.url = evtData.element ? evtData.element.origUrl : evtData.url;

        // Fire event on this object
        this.dispatchEvent( new OEvent(type, evtData) );

      }

      this.pageSrcElements[ key ] = [];

    }

  }

  // listen for URL Filter block/unblock/allowed events sent from the background
  // process and fire in this content script

  OEX.addEventListener('controlmessage', function( msg ) {

    if( !msg.data || !msg.data.action || !msg.data.data ) {
      return;
    }

    switch( msg.data.action ) {

      // Set up all storage properties
      case '___O_urlfilter_contentblocked':

        this.dispatchURLFilterEvent.call(this, 'contentblocked', msg.data.data)

        break;

      case '___O_urlfilter_contentunblocked':

        this.dispatchURLFilterEvent.call(this, 'contentunblocked', msg.data.data)

        break;

      case '___O_urlfilter_contentallowed':

        this.dispatchURLFilterEvent.call(this, 'contentallowed', msg.data.data)

        break;
    }

  }.bind(this));

};

UrlFilterEventListener.prototype = Object.create( OEventTarget.prototype );

// Override
UrlFilterEventListener.prototype.addEventListener = function(eventName, callback, useCapture) {

  eventName = (eventName + "").toLowerCase(); // force to lower case string

  this.on(eventName, callback); // no useCapture

  // Trigger delivery of URLFilter events from the background process
  addDelayedEvent(OEX, 'postMessage', [
    { 'action': '___O_urlfilter_DRAINQUEUE', 'eventType': eventName }
  ]);

};

OEX.urlfilter = OEX.urlfilter || new UrlFilterEventListener();

if (global.opera) {
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
          "readystatechange": [],
          "domcontentloaded": [],
          "load": []
        };

    var hasFired_DOMContentLoaded = false,
        hasFired_Load = false;
    
    // If we already missed DOMContentLoaded or Load events firing, record that now...
    if(global.document.readyState === "interactive") {
      hasFired_DOMContentLoaded = true;
    }
    if(global.document.readyState === "complete") {
      hasFired_DOMContentLoaded = true;
      hasFired_Load = true;
    }

    // ...otherwise catch DOMContentLoaded and Load events when they happen and set the same flag.
    global.document.addEventListener("DOMContentLoaded", function handle_DomContentLoaded() {
      hasFired_DOMContentLoaded = true;
      global.document.removeEventListener("DOMContentLoaded", handle_DomContentLoaded, true);
    }, true);
    global.addEventListener("load", function handle_Load() {
      hasFired_Load = true;
      global.removeEventListener("load", handle_Load, true);
    }, true);
    
    // Catch and fire readystatechange events when they happen
    global.document.addEventListener("readystatechange", function(event) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      if( global.document.readyState !== 'interactive' && global.document.readyState !== 'complete' ) {
        fireEvent('readystatechange', global.document);
      } else {
        global.document.readyState = 'loading';
      }
    }, true);
    
    // Take over handling of document.readyState via our own load bootstrap code below
    var _readyState = (hasFired_DOMContentLoaded || hasFired_Load) ? global.document.readyState : "uninitialized";
    global.document.__defineSetter__('readyState', function(val) { _readyState = val; });
    global.document.__defineGetter__('readyState', function() { return _readyState; });

    function interceptAddEventListener(target, _name) {

      var _target = target.addEventListener;

      // Replace addEventListener for given target
      target.addEventListener = function(name, fn, usecapture) {
        name = name + ""; // force event name to type string
        
        if (name.toLowerCase() === _name.toLowerCase()) {
          if (fn === undefined || fn === null ||
                Object.prototype.toString.call(fn) !== "[object Function]") {
            return;
          }

          if (isReady) {
            fn.call(global);
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

    interceptAddEventListener(global, 'load');
    interceptAddEventListener(global.document, 'domcontentloaded');
    interceptAddEventListener(global, 'domcontentloaded'); // handled bubbled DOMContentLoaded events
    interceptAddEventListener(global.document, 'readystatechange');

    function fireEvent(name, target, props) {
      var evtName = name.toLowerCase();
      
      // Role a standard object as the Event since we really need
      // to set the target + other unsettable properties on the 
      // isReady events
      
      var evt = props || {};

      evt.type = name;

      if(!evt.target) evt.target = global;
      if(!evt.currentTarget) evt.currentTarget = evt.target;
      if(!evt.srcElement) evt.srcElement = evt.target;

      if(evt.bubbles !== true) evt.bubbles = false;
      if(evt.cancelable !== true) evt.cancelable = false;

      if(!evt.timeStamp) evt.timeStamp = 0;

      for (var i = 0, len = fns[evtName].length; i < len; i++) {
        fns[evtName][i].call(target, evt);
      }
    }

    function ready() {
      global.setTimeout(function() {

        if (isReady) {
          return;
        }

        // Handle queued opera 'isReady' event functions
        for (var i = 0, len = fns['isready'].length; i < len; i++) {
          fns['isready'][i].call(global);
        }
        fns['isready'] = []; // clear

        var domContentLoadedTimeoutOverride = new Date().getTime() + 120000;

        // Synthesize and fire the document domcontentloaded event
        (function fireDOMContentLoaded() {

          var currentTime = new Date().getTime();

          // Check for hadFired_Load in case we missed DOMContentLoaded
          // event, in which case, we syntesize DOMContentLoaded here
          // (always synthesized in Chromium Content Scripts)
          if (hasFired_DOMContentLoaded || hasFired_Load || currentTime >= domContentLoadedTimeoutOverride) {

            global.document.readyState = 'interactive';
            fireEvent('readystatechange', global.document);

            fireEvent('domcontentloaded', global.document, { bubbles: true }); // indicate that event bubbles

            if(currentTime >= domContentLoadedTimeoutOverride) {
              console.warn('document.domcontentloaded event fired on check timeout');
            }

            var loadTimeoutOverride = new Date().getTime() + 120000;

            // Synthesize and fire the window load event
            // after the domcontentloaded event has been
            // fired
            (function fireLoad() {

              var currentTime = new Date().getTime();

              if (hasFired_Load || currentTime >= loadTimeoutOverride) {
                
                global.document.readyState = 'complete';
                fireEvent('readystatechange', global.document);

                fireEvent('load', global);

                if(currentTime >= loadTimeoutOverride) {
                  console.warn('window.load event fired on check timeout');
                }

                // Run delayed events (if any)
                for(var i = 0, l = _delayedExecuteEvents.length; i < l; i++) {
                  var o = _delayedExecuteEvents[i];
                  o.target[o.methodName].apply(o.target, o.args);
                }
                _delayedExecuteEvents = [];

              } else {
                global.setTimeout(function() {
                  fireLoad();
                }, 50);
              }

            })();

          } else {
            global.setTimeout(function() {
              fireDOMContentLoaded();
            }, 50);
          }

        })();

        isReady = true;

      }, 0);
    }

    var holdTimeoutOverride = new Date().getTime() + 240000;

    (function holdReady() {

      var currentTime = new Date().getTime();

      if (currentTime >= holdTimeoutOverride) {
        // All scripts now ready to be executed: TIMEOUT override
        console.warn('opera.isReady check timed out');
        hasFired_Load = true; // override
        ready();
        return;
      }

      for (var i in deferredComponentsLoadStatus) {
        if (deferredComponentsLoadStatus[i] !== true) {
          // spin the loop until everything is working
          // or we receive a timeout override (handled
          // in next loop, above)
          global.setTimeout(function() {
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
        fn.call(global);
      } else {
        fns['isready'].push(fn);
      }
    }
  })();

}

  // Make API available on the window DOM object
  global.opera = opera;

})( window );