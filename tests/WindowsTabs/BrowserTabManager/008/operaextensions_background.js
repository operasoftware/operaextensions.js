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
  'WINTABS_LOADED': false,
  'WIDGET_API_LOADED': false,
  'WIDGET_PREFERENCES_LOADED': false,
  'SPEEDDIAL_LOADED': false
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

function isObjectEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

/**
 * GENERAL OEX SHIM UTILITY FUNCTIONS
 */

/**
 * Chromium doesn't support complex colors in places so
 * this function will convert colors from rgb, rgba, hsv,
 * hsl and hsla in to hex colors.
 *
 * 'color' is the color string to convert.
 * 'backgroundColorVal' is a background color number (0-255)
 * with which to apply alpha blending (if any).
 */
function complexColorToHex(color, backgroundColorVal) {

  if(color === undefined || color === null) {
    return color;
  }
  
  // Convert an Array input to RGG(A)
  if(Object.prototype.toString.call(color) === "[object Array]") {
    if(color.length === 4) {
      color = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
    } else if(color.length === 3) {
      color = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    } else {
      color = "rgb(255,255,255)";
    }
  }

  // Force covert color to String
  color = color + "";

  // X11/W3C Color Names List
  var colorKeywords = { aliceblue: [240,248,255], antiquewhite: [250,235,215], aqua: [0,255,255], aquamarine: [127,255,212],
  azure: [240,255,255], beige: [245,245,220], bisque: [255,228,196], black: [0,0,0], blanchedalmond: [255,235,205],
  blue: [0,0,255], blueviolet: [138,43,226], brown: [165,42,42], burlywood: [222,184,135], cadetblue: [95,158,160],
  chartreuse: [127,255,0], chocolate: [210,105,30], coral: [255,127,80], cornflowerblue: [100,149,237], cornsilk: [255,248,220],
  crimson: [220,20,60], cyan: [0,255,255], darkblue: [0,0,139], darkcyan: [0,139,139], darkgoldenrod: [184,134,11],
  darkgray: [169,169,169], darkgreen: [0,100,0], darkgrey: [169,169,169], darkkhaki: [189,183,107], darkmagenta: [139,0,139],
  darkolivegreen: [85,107,47], darkorange: [255,140,0], darkorchid: [153,50,204], darkred: [139,0,0], darksalmon: [233,150,122],
  darkseagreen: [143,188,143], darkslateblue: [72,61,139], darkslategray: [47,79,79], darkslategrey: [47,79,79],
  darkturquoise: [0,206,209], darkviolet: [148,0,211], deeppink: [255,20,147], deepskyblue: [0,191,255], dimgray: [105,105,105],
  dimgrey: [105,105,105], dodgerblue: [30,144,255], firebrick: [178,34,34], floralwhite: [255,250,240], forestgreen: [34,139,34],
  fuchsia: [255,0,255], gainsboro: [220,220,220], ghostwhite: [248,248,255], gold: [255,215,0], goldenrod: [218,165,32],
  gray: [128,128,128], green: [0,128,0], greenyellow: [173,255,47], grey: [128,128,128], honeydew: [240,255,240],
  hotpink: [255,105,180], indianred: [205,92,92], indigo: [75,0,130], ivory: [255,255,240], khaki: [240,230,140],
  lavender: [230,230,250], lavenderblush: [255,240,245], lawngreen: [124,252,0], lemonchiffon: [255,250,205],
  lightblue: [173,216,230], lightcoral: [240,128,128], lightcyan: [224,255,255], lightgoldenrodyellow: [250,250,210],
  lightgray: [211,211,211], lightgreen: [144,238,144], lightgrey: [211,211,211], lightpink: [255,182,193],
  lightsalmon: [255,160,122], lightseagreen: [32,178,170], lightskyblue: [135,206,250], lightslategray: [119,136,153],
  lightslategrey: [119,136,153], lightsteelblue: [176,196,222], lightyellow: [255,255,224], lime: [0,255,0],
  limegreen: [50,205,50], linen: [250,240,230], magenta: [255,0,255], maroon: [128,0,0], mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205], mediumorchid: [186,85,211], mediumpurple: [147,112,219], mediumseagreen: [60,179,113],
  mediumslateblue: [123,104,238], mediumspringgreen: [0,250,154], mediumturquoise: [72,209,204], mediumvioletred: [199,21,133],
  midnightblue: [25,25,112], mintcream: [245,255,250], mistyrose: [255,228,225], moccasin: [255,228,181], navajowhite: [255,222,173],
  navy: [0,0,128], oldlace: [253,245,230], olive: [128,128,0], olivedrab: [107,142,35], orange: [255,165,0], orangered: [255,69,0],
  orchid: [218,112,214], palegoldenrod: [238,232,170], palegreen: [152,251,152], paleturquoise: [175,238,238],
  palevioletred: [219,112,147], papayawhip: [255,239,213], peachpuff: [255,218,185], peru: [205,133,63], pink: [255,192,203],
  plum: [221,160,221], powderblue: [176,224,230], purple: [128,0,128], red: [255,0,0], rosybrown: [188,143,143],
  royalblue: [65,105,225], saddlebrown: [139,69,19], salmon: [250,128,114], sandybrown: [244,164,96], seagreen: [46,139,87],
  seashell: [255,245,238], sienna: [160,82,45], silver: [192,192,192], skyblue: [135,206,235], slateblue: [106,90,205],
  slategray: [112,128,144], slategrey: [112,128,144], snow: [255,250,250], springgreen: [0,255,127], steelblue: [70,130,180],
  tan: [210,180,140], teal: [0,128,128], thistle: [216,191,216], tomato: [255,99,71], turquoise: [64,224,208], violet: [238,130,238],
  wheat: [245,222,179], white: [255,255,255], whitesmoke: [245,245,245], yellow: [255,255,0], yellowgreen: [154,205,50] };

  // X11/W3C Color Name check
  var predefinedColor = colorKeywords[ color.toLowerCase() ];
  if( predefinedColor ) {
    return "#" + DectoHex(predefinedColor[0]) + DectoHex(predefinedColor[1]) + DectoHex(predefinedColor[2]);
  }

  // Hex color patterns
  var hexColorTypes = {
    "hexLong": /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    "hexShort": /^#([0-9a-fA-F]{3})$/
  };

  for(var colorType in hexColorTypes) {
    if(color.match(hexColorTypes[ colorType ])) {
	return color;
    }
  }

  // Other color patterns
  var otherColorTypes = [
    ["rgb", /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/],
    ["rgb", /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+(?:\.\d+)?|\.\d+)\s*\)$/], // rgba
    ["hsl", /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/],
    ["hsl", /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d+(?:\.\d+)?|\.\d+)\s*\)$/], // hsla
    ["hsv", /^hsv\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/]
  ];

  function hueToRgb( p, q, t ) {
    if ( t < 0 ) {
      t += 1;
    }
    if ( t > 1 ) {
      t -= 1;
    }
    if ( t < 1 / 6 ) {
      return p + ( q - p ) * 6 * t;
    }
    if ( t < 1 / 2 ) {
      return q;
    }
    if ( t < 2 / 3 ) {
      return p + ( q - p ) * ( 2 / 3 - t ) * 6;
    }
    return p;
  };

  var toRGB = {
    rgb: function( bits ) {
      return [ bits[1], bits[2], bits[3], bits[4] || 1 ];
    },
    hsl: function( bits ) {
      var hsl = {
        h : parseInt( bits[ 1 ], 10 ) % 360 / 360,
        s : parseInt( bits[ 2 ], 10 ) % 101 / 100,
        l : parseInt( bits[ 3 ], 10 ) % 101 / 100,
        a : bits[4] || 1
      };

      if ( hsl.s === 0 ) {
	return [ hsl.l, hsl.l, hsl.l ];
    }

      var q = hsl.l < 0.5 ? hsl.l * ( 1 + hsl.s ) : hsl.l + hsl.s - hsl.l * hsl.s;
      var p = 2 * hsl.l - q;

      return [
        ( hueToRgb( p, q, hsl.h + 1 / 3 ) * 256 ).toFixed( 0 ),
        ( hueToRgb( p, q, hsl.h ) * 256 ).toFixed( 0 ),
        ( hueToRgb( p, q, hsl.h - 1 / 3 ) * 256 ).toFixed( 0 ),
        hsl.a
      ];
    },
    hsv: function( bits ) {
      var rgb = {},
          hsv = {
            h : parseInt( bits[ 1 ], 10 ) % 360 / 360,
            s : parseInt( bits[ 2 ], 10 ) % 101 / 100,
            v : parseInt( bits[ 3 ], 10 ) % 101 / 100
          },
          i = Math.floor( hsv.h * 6 ),
          f = hsv.h * 6 - i,
          p = hsv.v * ( 1 - hsv.s ),
          q = hsv.v * ( 1 - f * hsv.s ),
          t = hsv.v * ( 1 - ( 1 - f ) * hsv.s );

      switch( i % 6 ) {
        case 0:
          rgb.r = hsv.v; rgb.g = t; rgb.b = p;
          break;
        case 1:
          rgb.r = q; rgb.g = hsv.v; rgb.b = p;
          break;
        case 2:
          rgb.r = p; rgb.g = hsv.v; rgb.b = t;
          break;
        case 3:
          rgb.r = p; rgb.g = q; rgb.b = hsv.v;
          break;
        case 4:
          rgb.r = t; rgb.g = p; rgb.b = hsv.v;
          break;
        case 5:
          rgb.r = hsv.v; rgb.g = p; rgb.b = q;
          break;
      }

      return [ rgb.r * 256,  rgb.g * 256, rgb.b * 256 ];
    }
  };

  function DectoHex( dec ) {
    var hex = parseInt( dec, 10 );
    hex = hex.toString(16);
    return hex == 0 ? "00" : hex;
  }

  function applySaturation( rgb ) {
    var alpha = parseFloat(rgb[3] || 1);
    if(alpha + "" === "NaN" || alpha < 0 || alpha >= 1) {
	return rgb;
    }
    if(alpha == 0) {
      return [ 255, 255, 255 ];
    }
    return [
      alpha * parseInt(rgb[0], 10) + (1 - alpha) * (backgroundColorVal || 255),
      alpha * parseInt(rgb[1], 10) + (1 - alpha) * (backgroundColorVal || 255),
      alpha * parseInt(rgb[2], 10) + (1 - alpha) * (backgroundColorVal || 255)
    ]; // assumes background is white (255)
  }

  for(var i = 0, l = otherColorTypes.length; i < l; i++) {
    var bits = otherColorTypes[i][1].exec( color );
    if(bits) {
      var rgbVal = applySaturation( toRGB[ otherColorTypes[i][0] ]( bits ) );
      return "#" + DectoHex(rgbVal[0] || 255) + DectoHex(rgbVal[1] || 255) + DectoHex(rgbVal[2] || 255);
    }
  }

  return "#f00"; // default in case of error

};

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

var OPromise = function() {

  Promise.call( this );

};

OPromise.prototype = Object.create( Promise.prototype );

// Add OEventTarget helper functions to OPromise prototype
for(var i in OEventTarget.prototype) {
  OPromise.prototype[i] = OEventTarget.prototype[i];
}

/**
 * Queue for running multi-object promise-rooted asynchronous
 * functions serially
 */
var Queue = (function() {
  var _q = [], _lock = false, _timeout = 1000;

  function callNext() {
    _lock = false;
    dequeue(); // auto-execute next queue item
  }

  function dequeue() {
    if (_lock) {
      return;
    }
    _lock = true; // only allow one accessor at a time

    var item = _q.shift(); // pop the next item from the queue

    if (item === undefined) {
      _lock = false;
      return; // end dequeuing
    }
    if (item.obj.isResolved) {
      // execute queue item immediately
      item.fn.call(item.obj, callNext);
    } else {
      if(item.ignoreResolve) {
        item.fn.call(item.obj, callNext);
      } else {
        // break deadlocks
        var timer = global.setTimeout(function() {
          console.warn('PromiseQueue deadlock broken with timeout.');
          console.log(item.obj);
          console.log(item.obj.isResolved);
          item.obj.trigger('promise:resolved'); // manual trigger / resolve
        }, _timeout);

        // execute queue item when obj resolves
        item.obj.on('promise:resolved', function() {
          if(timer) global.clearTimeout(timer);

          item.obj.isResolved = true; // set too late in rsvp.js

          item.fn.call(item.obj, callNext);
        });
      }
    }
  };

  return {
    enqueue: function(obj, fn, ignoreResolve) {
      _q.push({ "obj": obj, "fn": fn, "ignoreResolve": ignoreResolve });
      dequeue(); // auto-execute next queue item
    },
    dequeue: function() {
      dequeue();
    }
  }
})();

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

var OBackgroundMessagePort = function() {

  OMessagePort.call( this, true );

  this._allPorts = {};

  chrome.extension.onConnect.addListener(function( _remotePort ) {

    var portIndex = _remotePort['name'] || Math.floor(Math.random() * 1e16);

    // When this port disconnects, remove _port from this._allPorts
    _remotePort.onDisconnect.addListener(function() {

      delete this._allPorts[ portIndex ];

      this.dispatchEvent( new OEvent('disconnect', { "source": _remotePort }) );

    }.bind(this));

    this._allPorts[ portIndex ] = _remotePort;

    _remotePort.onMessage.addListener( function( _message, _sender, responseCallback ) {

      if(_message && _message.action && _message.action.indexOf('___O_') === 0) {

        // Fire controlmessage events *immediately*
        this.dispatchEvent( new OEvent(
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
        addDelayedEvent(this, 'dispatchEvent', [ new OEvent(
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

    this.dispatchEvent( new OEvent('connect', { "source": _remotePort, "origin": "" }) );

  }.bind(this));

};

OBackgroundMessagePort.prototype = Object.create( OMessagePort.prototype );

OBackgroundMessagePort.prototype.broadcastMessage = function( data ) {

  for(var activePort in this._allPorts) {
    this._allPorts[ activePort ].postMessage( data );
  }

};

var OperaExtension = function() {

  OBackgroundMessagePort.call( this );

};

OperaExtension.prototype = Object.create( OBackgroundMessagePort.prototype );

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

var OStorage = function () {

  // All attributes and methods defined in this class must be non-enumerable,
  // hence the structure of this class and use of Object.defineProperty.

  Object.defineProperty(this, "_storage", { value : localStorage });

  Object.defineProperty(this, "length", { value : 0, writable:true });

  // Copy all key/value pairs from localStorage on startup
  for(var i in localStorage) {
    this[i] = localStorage[i];
    this.length++;
  }

  Object.defineProperty(OStorage.prototype, "getItem", {
    value: function( key ) {
      return this._storage.getItem(key);
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
      var oldVal = this._storage.getItem(key);

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

      // Create and fire 'storage' event on window object
      var storageEvt = new OEvent('storage', {
        "key": key,
        "oldValue": oldVal,
        "newValue": this._storage.getItem(key),
        "url": chrome.extension.getURL(""),
        "storageArea": this._storage
      });
      global.dispatchEvent( storageEvt );

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

  OEventTarget.call(this);

  this.properties = manifest || chrome.app.getDetails();
  
  // Set WIDGET_API_LOADED feature to LOADED
  deferredComponentsLoadStatus['WIDGET_API_LOADED'] = true;

  // LocalStorage shim
  this._preferences = new OStorage();

  // Set WIDGET_PREFERENCES_LOADED feature to LOADED
  deferredComponentsLoadStatus['WIDGET_PREFERENCES_LOADED'] = true;

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

OWidgetObj.prototype = Object.create( OEventTarget.prototype );

OWidgetObj.prototype.__defineGetter__('name', function() {
  return this.properties.name || "";
});

OWidgetObj.prototype.__defineGetter__('shortName', function() {
  return this.properties.name ? this.properties.name.short || "" : "";
});

OWidgetObj.prototype.__defineGetter__('id', function() {
  return this.properties.id || "";
});

OWidgetObj.prototype.__defineGetter__('description', function() {
  return this.properties.description || "";
});

OWidgetObj.prototype.__defineGetter__('author', function() {
  return this.properties.author ? this.properties.author.name || "" : "";
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
global.widget = global.widget || new OWidgetObj();

var BrowserWindowManager = function() {

  OPromise.call(this);

  this.length = 0;

  // Set up the real BrowserWindow (& BrowserTab) objects available at start up time
  chrome.windows.getAll({
    populate: true
  }, function(_windows) {

    var _allTabs = [];

    for (var i = 0, l = _windows.length; i < l; i++) {
      var newWindow = new BrowserWindow(_windows[i]);

      // Set properties not available in BrowserWindow constructor
      newWindow.properties.id = _windows[i].id;
      newWindow.properties.incognito = _windows[i].incognito;

      this[i] = newWindow;
      this.length = i + 1;

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[i].tabs.length; j < k; j++) {
        _tabs[j] = new BrowserTab(_windows[i].tabs[j], this[i], true);

        // Set properties not available in BrowserTab constructor
        _tabs[j].properties.id = _windows[i].tabs[j].id;
        _tabs[j].properties.active = _windows[i].tabs[j].active;
        _tabs[j].properties.pinned = _windows[i].tabs[j].pinned;
        _tabs[j].properties.status = _windows[i].tabs[j].status;
        _tabs[j].properties.title = _windows[i].tabs[j].title;
        _tabs[j].properties.favIconUrl = _windows[i].tabs[j].favIconUrl;
        _tabs[j].properties.url = _windows[i].tabs[j].url;
        _tabs[j].properties.index = _windows[i].tabs[j].index;
        _tabs[j].properties.incognito = _windows[i].tabs[j].incognito;
      }
      this[i].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);

    }

    // Replace tabs in root tab manager object
    OEX.tabs.replaceTabs(_allTabs);

    // Resolve root window manager
    this.resolve(true);
    // Resolve root tabs manager
    OEX.tabs.resolve(true);

    // Resolve objects.
    //
    // Resolution of each object in order:
    // 1. Window
    // 2. Window's Tab Manager
    // 3. Window's Tab Manager's Tabs
    for (var i = 0, l = this.length; i < l; i++) {
      this[i].resolve(true);

      this[i].tabs.resolve(true);

      for (var j = 0, k = this[i].tabs.length; j < k; j++) {

        this[i].tabs[j].resolve(true);

      }
    }

    // Set WinTabs feature to LOADED
    deferredComponentsLoadStatus['WINTABS_LOADED'] = true;

  }.bind(this));

  this.addWindow = function(windowId, windowObj) {

    windowObj.properties.id = windowId;

    this[this.length] = windowObj;
    this.length += 1;

    // Resolve object
    windowObj.resolve(true);
    windowObj.tabs.resolve(true);

    // Fire a new 'create' event on this manager object
    this.dispatchEvent(new OEvent('create', {
      browserWindow: windowObj
    }));

  };

  // Monitor ongoing window events

  chrome.windows.onFocusChanged.addListener(function(windowId) {

      var _prevFocusedWindow = this.getLastFocused();

      // If no new window is focused, abort here
      if( windowId !== chrome.windows.WINDOW_ID_NONE ) {

        // Find and fire focus event on newly focused window
        for (var i = 0, l = this.length; i < l; i++) {

          if (this[i].properties.id == windowId && _prevFocusedWindow !== this[i] ) {

            this[i].properties.focused = true;

          } else {

            this[i].properties.focused = false;

          }

        }

      }

      // Find and fire blur event on currently focused window
      for (var i = 0, l = this.length; i < l; i++) {

        if (this[i].properties.id !== windowId && this[i] == _prevFocusedWindow) {

          this[i].properties.focused = false;
          
          var _newFocusedWindow = this.getLastFocused();

          // Fire a new 'blur' event on the window object
          this[i].dispatchEvent(new OEvent('blur', {
            browserWindow: _newFocusedWindow
          }));

          // Fire a new 'blur' event on this manager object
          this.dispatchEvent(new OEvent('blur', {
            browserWindow: _newFocusedWindow
          }));

          // If something is blurring then we should also fire the
          // corresponding 'focus' events

          // Fire a new 'focus' event on the window object
          _newFocusedWindow.dispatchEvent(new OEvent('focus', {
            browserWindow: _prevFocusedWindow
          }));

          // Fire a new 'focus' event on this manager object
          this.dispatchEvent(new OEvent('focus', {
            browserWindow: _prevFocusedWindow
          }));

          break;
        }

      }

//      Queue.dequeue();

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

      var removedWindow = this[deleteIndex];

      removedWindow.properties.closed = true;

      // Set window tabs collection to empty
      removedWindow.tabs.replaceTabs([]);

      // Manually splice the deleteIndex_th_ item from the current windows collection
      for (var i = deleteIndex, l = this.length; i < l; i++) {
        if (this[i + 1]) {
          this[i] = this[i + 1];
        } else {
          delete this[i]; // remove last item
        }
      }
      this.length -= 1;

      // Fire a new 'close' event on the closed BrowserWindow object
      removedWindow.dispatchEvent(new OEvent('close', {}));

      // Fire a new 'close' event on this manager object
      this.dispatchEvent(new OEvent('close', {
        'browserWindow': removedWindow
      }));

    }

//    Queue.dequeue();

  }.bind(this));

};

BrowserWindowManager.prototype = Object.create(OPromise.prototype);

BrowserWindowManager.prototype.create = function(tabsToInject, browserWindowProperties) {

  /*
  // Support tc-BrowserWindowManager-015 test

  var isEmpty_TabsToInject = true;

  if(tabsToInject && Object.prototype.toString.call(tabsToInject) === "[object Array]") {
    for(var i = 0, l = tabsToInject.length; i < l; i++) {
      if( !isObjectEmpty(tabsToInject[i]) ) {
        isEmpty_TabsToInject = false;
        break;
      }
    }
  }

  var isEmpty_BrowserWindowProperties = isObjectEmpty(browserWindowProperties || {});

  // undefined/null tabsToInject w/ non-empty window properties is ok
  if( !isEmpty_BrowserWindowProperties && (tabsToInject === undefined || tabsToInject === null)) {
    noTabsToInject = false;
  }

  if(isEmpty_TabsToInject && isEmpty_BrowserWindowProperties) {
    throw new OError(
      "NotSupportedError",
      "Cannot create a new window without providing at least one method parameter.",
      DOMException.NOT_SUPPORTED_ERR
    );
  }

  if(!isEmpty_TabsToInject && isEmpty_BrowserWindowProperties) {
    throw new OError(
      "NotSupportedError",
      "Cannot create a new window without providing at least one window property parameter.",
      DOMException.NOT_SUPPORTED_ERR
    );
  }

  if(isEmpty_TabsToInject && !isEmpty_BrowserWindowProperties) {
    throw new OError(
      "NotSupportedError",
      "Cannot create a new window without providing at least one object (or 'null')",
      DOMException.NOT_SUPPORTED_ERR
    );
  }*/

  // Create new BrowserWindow object (+ sanitize browserWindowProperties values)
  var shadowBrowserWindow = new BrowserWindow(browserWindowProperties);

  var createProperties = {
    'focused': shadowBrowserWindow.properties.focused,
    'incognito': shadowBrowserWindow.properties.incognito,
    'width': shadowBrowserWindow.properties.width,
    'height': shadowBrowserWindow.properties.height,
    'top': shadowBrowserWindow.properties.top,
    'left': shadowBrowserWindow.properties.left
  };

  // Add tabs included in the create() call to the newly created
  // window, if any, based on type
  var hasTabsToInject = false;

  var tabsToMove = [];
  var tabsToCreate = [];

  if (tabsToInject &&
        Object.prototype.toString.call(tabsToInject) === "[object Array]" &&
          tabsToInject.length > 0) {

    hasTabsToInject = true;

    for (var i = 0, l = tabsToInject.length; i < l; i++) {

      if (tabsToInject[i] instanceof BrowserTab) {

        (function(existingBrowserTab, index) {

          // Remove tab from previous window parent and then
          // add it to its new window parent
          if(existingBrowserTab._windowParent) {
            existingBrowserTab._windowParent.tabs.removeTab(existingBrowserTab);
          }

          // Rewrite tab's BrowserWindow parent
          existingBrowserTab._windowParent = shadowBrowserWindow;

          // Rewrite tab's index position in collection
          existingBrowserTab.properties.index = shadowBrowserWindow.tabs.length;

          shadowBrowserWindow.tabs.addTab( existingBrowserTab, existingBrowserTab.properties.index);

          // Don't create the first tab as this will be resolved differently
          if(index == 0) {

            // Implicitly add the first BrowserTab to the new window
            createProperties.tabId = existingBrowserTab.properties.id;

            shadowBrowserWindow.rewriteUrl = newTab_BaseURL.replace('%s', existingBrowserTab.properties.id);

          } else {

           // handled in window.create callback function
           // because we need the window's id property to move
           // items to this window object
           tabsToMove.push(existingBrowserTab);

          }

          // move events etc will fire in onMoved listener of RootBrowserTabManager

        })(tabsToInject[i], i);

      } else { // Treat as a BrowserTabProperties object by default

        (function(browserTabProperties, index) {

          browserTabProperties = browserTabProperties || {};

          var newBrowserTab = new BrowserTab(browserTabProperties, shadowBrowserWindow);

          newBrowserTab.properties.index = i;

          // Register BrowserTab object with the current BrowserWindow object
          shadowBrowserWindow.tabs.addTab( newBrowserTab, newBrowserTab.properties.index);

          // Add object to root store
          OEX.tabs.addTab( newBrowserTab );

          // set BrowserWindow object's rewriteUrl to first tab's opera id
          if( index == 0 ) {

            createProperties.url = shadowBrowserWindow.rewriteUrl = newTab_BaseURL.replace('%s', newBrowserTab._operaId);

          } else {

            tabsToCreate.push(newBrowserTab);

          }

        })(tabsToInject[i], i);

      }

    }

  } else { // we only have one default chrome://newtab or opera://startpage tab to set up

    // setup single new tab and tell onCreated to ignore this item
    var defaultBrowserTab = new BrowserTab({ active: true }, shadowBrowserWindow);

    // Register BrowserTab object with the current BrowserWindow object
    shadowBrowserWindow.tabs.addTab( defaultBrowserTab, defaultBrowserTab.properties.index );

    // Add object to root store
    OEX.tabs.addTab( defaultBrowserTab );

    // set rewriteUrl to windowId
    shadowBrowserWindow.rewriteUrl = newTab_BaseURL.replace('%s', shadowBrowserWindow._operaId);

    createProperties.url = shadowBrowserWindow.rewriteUrl;

  }

  // Add this object to the current collection
  this[this.length] = shadowBrowserWindow;
  this.length += 1;

  // unfocus all other windows in collection if this window is focused
  if(shadowBrowserWindow.properties.focused == true ) {
    for(var i = 0, l = this.length; i < l; i++) {
      if(this[i] !== shadowBrowserWindow) {
        this[i].properties.focused = false;
      }
    }
  }

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {

  chrome.windows.create(
    createProperties,
    function(_window) {

      // Update BrowserWindow properties
      for (var i in _window) {
        if(i == 'tabs') continue; // don't overwrite tabs!
        shadowBrowserWindow.properties[i] = _window[i];
      }

      // Move any remaining existing tabs to new window
      // now that we have the window.id property assigned
      // above in properties copy
      if( tabsToMove.length > 0 ) {

        for(var i = 0, l = tabsToMove.length; i < l; i++) {

          (function(existingBrowserTab) {

            // Explicitly move anything after the first BrowserTab to the new window
            Queue.enqueue(existingBrowserTab, function(done) {

              chrome.tabs.move(
                this.properties.id,
                {
                  index: this._windowParent.tabs.length,
                  windowId: this._windowParent.properties.id
                },
                function(_tab) {
                  for (var i in _tab) {
                    if(i == 'url') continue;
                    this.properties[i] = _tab[i];
                  }

                  done();
                }.bind(this)
              );
            }.bind(existingBrowserTab));

          })(tabsToMove[i]);

        }

      }

      if( tabsToCreate.length > 0 ) {

        for(var i = 0, l = tabsToCreate.length; i < l; i++) {

          (function(newBrowserTab) {

            var tabCreateProps = {
              'windowId': shadowBrowserWindow.properties.id,
              'url': newBrowserTab.properties.url || 'about:blank',
              'active': newBrowserTab.properties.active,
              'pinned': newBrowserTab.properties.pinned,
              'index': newBrowserTab.properties.index
            };

            Queue.enqueue(this, function(done) {
            chrome.tabs.create(
              tabCreateProps,
              function(_tab) {
                for (var i in _tab) {
                  newBrowserTab.properties[i] = _tab[i];
                }

                newBrowserTab.resolve(true);

                done();

              }.bind(shadowBrowserWindow.tabs)
            );
            }.bind(this), true);

            newBrowserTab._windowParent.tabs.dispatchEvent(new OEvent('create', {
              "tab": newBrowserTab,
              "prevWindow": newBrowserTab._windowParent,
              "prevTabGroup": null,
              "prevPosition": NaN
            }));

            // Fire a create event at RootTabsManager
            OEX.tabs.dispatchEvent(new OEvent('create', {
              "tab": newBrowserTab,
              "prevWindow": newBrowserTab._windowParent,
              "prevTabGroup": null,
              "prevPosition": NaN
            }));

          })(tabsToCreate[i]);

        }

      }

      done();

    }.bind(this)
  );

  }.bind(this), true);

  // return shadowBrowserWindow from this function before firing these events!
  global.setTimeout(function() {

    // Fire a new 'create' event on this manager object
    this.dispatchEvent(new OEvent('create', {
      browserWindow: shadowBrowserWindow
    }));

  }.bind(this), 50);

  return shadowBrowserWindow;
};

BrowserWindowManager.prototype.getAll = function() {

  var allWindows = [];

  for (var i = 0, l = this.length; i < l; i++) {
    allWindows[i] = this[i];
  }

  return allWindows;

};

BrowserWindowManager.prototype.getLastFocused = function() {

  for(var i = 0, l = this.length; i < l; i++) {
    if(this[i].focused == true) {
      return this[i];
    }
  }

  // default
  if(this[0]) {
    this[0].properties.focused = true;
  }

  return this[0] || undefined;

};

BrowserWindowManager.prototype.close = function(browserWindow) {

  if(!browserWindow || !(browserWindow instanceof BrowserWindow)) {
    return;
  }

  browserWindow.close();

};

var BrowserWindow = function(browserWindowProperties) {

  OPromise.call(this);

  browserWindowProperties = browserWindowProperties || {};

  this.properties = {
    'id': undefined, // not settable on create
    'closed': false, // not settable on create
    'focused': browserWindowProperties.focused ? !!browserWindowProperties.focused : undefined,
    // private:
    'incognito': browserWindowProperties.private ? !!browserWindowProperties.private : undefined,
    'parent': null,
    'width': browserWindowProperties.width ? parseInt(browserWindowProperties.width, 10) : undefined,
    'height': browserWindowProperties.height ? parseInt(browserWindowProperties.height, 10) : undefined,
    'top': browserWindowProperties.top ? parseInt(browserWindowProperties.top, 10) : undefined,
    'left': browserWindowProperties.left ? parseInt(browserWindowProperties.left, 10) : undefined
    // 'tabGroups' not part of settable properties
    // 'tabs' not part of settable properties
  };

  this._parent = null;

  // Create a unique browserWindow id
  this._operaId = Math.floor(Math.random() * 1e16);

  this.tabs = new BrowserTabManager(this);

  this.tabGroups = new BrowserTabGroupManager(this);

  if(this.properties.private !== undefined) {
    this.properties.incognito = !!this.properties.private;
    delete this.properties.private;
  }

  // Not allowed when creating a new window object
  if(this.properties.closed !== undefined) {
    delete this.properties.closed;
  }
};

BrowserWindow.prototype = Object.create(OPromise.prototype);

// API
BrowserWindow.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

BrowserWindow.prototype.__defineGetter__("closed", function() {
  return this.properties.closed !== undefined ? !!this.properties.closed : false;
});

BrowserWindow.prototype.__defineGetter__("focused", function() {
  return this.properties.focused !== undefined ? !!this.properties.focused : false;
});

BrowserWindow.prototype.__defineGetter__("private", function() {
  return this.properties.incognito !== undefined ? !!this.properties.incognito : false;
});

BrowserWindow.prototype.__defineGetter__("top", function() {
  return this.properties.top !== undefined ? this.properties.top : -1;
}); // read-only

BrowserWindow.prototype.__defineGetter__("left", function() {
  return this.properties.left !== undefined ? this.properties.left : -1;
}); // read-only

BrowserWindow.prototype.__defineGetter__("height", function() {
  return this.properties.height !== undefined ? this.properties.height : -1;
}); // read-only

BrowserWindow.prototype.__defineGetter__("width", function() {
  return this.properties.width !== undefined ? this.properties.width : -1;
}); // read-only

BrowserWindow.prototype.__defineGetter__("parent", function() {
  return this._parent;
});

BrowserWindow.prototype.insert = function(browserTab, child) {

  if (!browserTab || !(browserTab instanceof BrowserTab)) {
    return;
  }

  if (this.properties.closed === true) {
    throw new OError(
      "InvalidStateError",
      "Current window is in the closed state and therefore is invalid",
      DOMException.INVALID_STATE_ERR
    );
  }

  var moveProperties = {
    windowId: this.properties.id,
    index: OEX.windows.length // by default, add to the end of the current window
  };

  // Set insert position for the new tab from 'before' attribute, if any
  if (child && (child instanceof BrowserTab)) {

    if (child.closed === true) {
      throw new OError(
        "InvalidStateError",
        "'child' parameter is in the closed state and therefore is invalid",
        DOMException.INVALID_STATE_ERR
      );
    }

    if (child._windowParent && child._windowParent.closed === true) {
      throw new OError(
        "InvalidStateError",
        "Parent window of 'child' parameter is in the closed state and therefore is invalid",
        DOMException.INVALID_STATE_ERR
      );
    }
    moveProperties.windowId = child._windowParent ?
                                      child._windowParent.properties.id : moveProperties.windowId;
    moveProperties.index = child.position;

  } else {
    // IF we're moving within the same window then index will be length - 1
    moveProperties.index = moveProperties.index > 0 ? moveProperties.index - 1 : moveProperties.index;
  }

  // Detach tab from existing BrowserWindow parent (if any)
  if (browserTab._windowParent) {
    browserTab._oldWindowParent = browserTab._windowParent;
    browserTab._oldIndex = browserTab.properties.index;

    if(browserTab._oldWindowParent !== this) {
      browserTab._windowParent.tabs.removeTab( browserTab );
    }
  }

  // Attach tab to new BrowserWindow parent
  browserTab._windowParent = this;

  // Update index within new parent
  browserTab.properties.index = moveProperties.index;

  if(this !== browserTab._oldWindowParent) {
    // Attach tab to new parent
    this.tabs.addTab( browserTab, browserTab.properties.index );
  }

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(browserTab, function(done) {
    chrome.tabs.move(
      browserTab.properties.id,
      {
        windowId: moveProperties.windowId || this.properties.id,
        index: moveProperties.index
      },
      function(_tab) {
        done();
      }.bind(this)
    );
  }.bind(this));

};

BrowserWindow.prototype.focus = function() {

  if(this.properties.focused == true || this.properties.closed == true) {
    return; // already focused or invalid because window is closed
  }

  // Set BrowserWindow object to focused state
  this.properties.focused = true;

  // unset all other window object's focused state
  for(var i = 0, l = OEX.windows.length; i < l; i++) {
    if(OEX.windows[i] !== this) {
      OEX.windows[i].properties.focused = false;
    }
  }

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    chrome.windows.update(
      this.properties.id,
      { focused: true },
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

BrowserWindow.prototype.update = function(browserWindowProperties) {

  var updateProperties = {};

  if(browserWindowProperties.focused !== undefined && browserWindowProperties.focused == true) {
    this.properties.focused = updateProperties.focused = !!browserWindowProperties.focused;
  }

  if(browserWindowProperties.top !== undefined && browserWindowProperties.top !== null) {
    this.properties.top = updateProperties.top = parseInt(browserWindowProperties.top, 10);
  }

  if(browserWindowProperties.left !== undefined && browserWindowProperties.left !== null) {
    this.properties.left = updateProperties.left = parseInt(browserWindowProperties.left, 10);
  }

  if(browserWindowProperties.height !== undefined && browserWindowProperties.height !== null) {
    this.properties.height = updateProperties.height = parseInt(browserWindowProperties.height, 10);
  }

  if(browserWindowProperties.width !== undefined && browserWindowProperties.width !== null) {
      this.properties.width = updateProperties.width = parseInt(browserWindowProperties.width, 10);
    }

  if( !isObjectEmpty(updateProperties) ) {

    // Queue platform action or fire immediately if this object is resolved
    Queue.enqueue(this, function(done) {
      chrome.windows.update(
        this.properties.id,
        updateProperties,
        function() {
          done();
        }.bind(this)
      );
    }.bind(this));

  }

}

BrowserWindow.prototype.close = function() {

  if( this.properties.closed == true) {
    /*throw new OError(
      "InvalidStateError",
      "The current BrowserWindow object is already closed. Cannot call close on this object.",
      DOMException.INVALID_STATE_ERR
    );*/
    return;
  }

  // Set BrowserWindow object to closed state
  this.properties.closed = true;

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    if(!this.properties.id) return;
    chrome.windows.remove(
      this.properties.id,
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

var BrowserTabManager = function( parentObj ) {

  OPromise.call( this );

  // Set up 0 mock BrowserTab objects at startup
  this.length = 0;

  this._parent = parentObj;

  // Remove all collection items and replace with browserTabs
  this.replaceTabs = function( browserTabs ) {

    for( var i = 0, l = this.length; i < l; i++ ) {
      delete this[ i ];
    }
    this.length = 0;

    if(browserTabs.length <= 0) {
      return;
    }

    for( var i = 0, l = browserTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        browserTabs[ i ].properties.index = i;
      }
      this[ i ] = browserTabs[ i ];
    }
    this.length = browserTabs.length;

    // Set focused on first tab object, unless some other tab object has focused=='true'
    var focusFound = false;
    for(var i = 0, l = browserTabs.length; i < l; i++) {
      if(browserTabs[i].properties.active == true) {
        focusFound = true;
        break;
      }
    }
    if(!focusFound) {
      browserTabs[0].focus();
    }

  };

  // Add an array of browserTabs to the current collection
  this.addTab = function( browserTab, startPosition ) {
    // Extract current set of tabs in collection
    var allTabs = [];

    for(var i = 0, l = this.length; i < l; i++) {
      allTabs[ i ] = this[ i ];
      if(allTabs[ i ].properties.active == true) {
        focusFound = true;
      }
    }

    if(browserTab.properties.active == true) {
      browserTab.focus();
    }

    var position = startPosition !== undefined ? startPosition : allTabs.length;

    // Add new browserTab to allTabs array
    allTabs.splice(this !== OEX.tabs ? position : this.length, 0, browserTab);

    // Rewrite the current tabs collection in order
    for( var i = 0, l = allTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        // Update all tab indexes to the current tabs collection order
        allTabs[ i ].properties.index = i;
      }
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

BrowserTabManager.prototype = Object.create( OPromise.prototype );

BrowserTabManager.prototype.create = function( browserTabProperties, before ) {

  if(before && !(before instanceof BrowserTab)) {
    throw new OError(
      "TypeMismatchError",
      "Could not create BrowserTab object. 'before' attribute provided is invalid.",
      DOMException.TYPE_MISMATCH_ERR
    );
  } else if(before) {
    
    if( before.closed === true ) {
      throw new OError(
        "InvalidStateError",
        "'before' BrowserTab object is in the closed state and therefore is invalid.",
        DOMException.INVALID_STATE_ERR
      );
    }

    if(before._windowParent && before._windowParent.closed === true ) {
      throw new OError(
        "InvalidStateError",
        "Parent window of 'before' BrowserTab object is in the closed state and therefore is invalid.",
        DOMException.INVALID_STATE_ERR
      );
    }
    
    // If we're adding this BrowserTab before an existing object then set its insert position correctly
    browserTabProperties.position = before.properties.index;
    
  }

  // Set parent window to create the tab in
  var windowParent = before && before._windowParent ? before._windowParent : this._parent || OEX.windows.getLastFocused();
  
  if(windowParent && windowParent.closed === true ) {
    throw new OError(
      "InvalidStateError",
      "Parent window of the current BrowserTab object is in the closed state and therefore is invalid.",
      DOMException.INVALID_STATE_ERR
    );
  }

  var shadowBrowserTab = new BrowserTab( browserTabProperties, windowParent );

  // Sanitized tab properties
  var createTabProperties = {
    'url': shadowBrowserTab.properties.url,
    'active': shadowBrowserTab.properties.active,
    'pinned': shadowBrowserTab.properties.pinned,
    'index': shadowBrowserTab.properties.index
  };

  // Set insert position for the new tab from 'before' attribute, if any
  if( before ) {
    createTabProperties.windowId = before._windowParent ?
                                      before._windowParent.properties.id : createTabProperties.windowId;
  }

  // Add this object to the end of the current tabs collection
  shadowBrowserTab._windowParent.tabs.addTab(shadowBrowserTab, shadowBrowserTab.properties.index);

  // unfocus all other tabs in tab's window parent collection if this tab is set to focused
  if(shadowBrowserTab.properties.active == true ) {
    for(var i = 0, l = shadowBrowserTab._windowParent.tabs.length; i < l; i++) {
      if(shadowBrowserTab._windowParent.tabs[i] !== shadowBrowserTab) {
        shadowBrowserTab._windowParent.tabs[i].properties.active = false;
      }
    }
  }

  // Add this object to the root tab manager
  OEX.tabs.addTab( shadowBrowserTab );

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {

    chrome.tabs.create(
      createTabProperties,
      function( _tab ) {
        // Update BrowserTab properties
        for(var i in _tab) {
          if(i == 'url') continue;
          shadowBrowserTab.properties[i] = _tab[i];
        }

        // Resolve new tab, if it hasn't been resolved already
        shadowBrowserTab.resolve(true);

        done();

      }.bind(this)
    );

  }.bind(this), true);

  // return shadowBrowserTab from this function before firing these events!
  global.setTimeout(function() {

    shadowBrowserTab._windowParent.tabs.dispatchEvent(new OEvent('create', {
      "tab": shadowBrowserTab,
      "prevWindow": null,
      "prevTabGroup": null,
      "prevPosition": 0
    }));

    // Fire a create event at RootTabsManager
    OEX.tabs.dispatchEvent(new OEvent('create', {
      "tab": shadowBrowserTab,
      "prevWindow": null,
      "prevTabGroup": null,
      "prevPosition": 0
    }));

  }, 50);

  return shadowBrowserTab;

};

BrowserTabManager.prototype.getAll = function() {

  var allTabs = [];

  for(var i = 0, l = this.length; i < l; i++) {
    allTabs[ i ] = this[ i ];
  }

  return allTabs;

};

BrowserTabManager.prototype.getSelected = function() {

  for(var i = 0, l = this.length; i < l; i++) {
    if(this[i].focused == true) {
      return this[i];
    }
  }

  // default
  if(this[0]) {
    this[0].properties.active = true;
  }

  return this[0] || undefined;

};
// Alias of .getSelected()
BrowserTabManager.prototype.getFocused = BrowserTabManager.prototype.getSelected;

BrowserTabManager.prototype.close = function( browserTab ) {

  if( !browserTab || !(browserTab instanceof BrowserTab)) {
    throw new OError(
      "TypeMismatchError",
      "Expected browserTab argument to be of type BrowserTab.",
      DOMException.TYPE_MISMATCH_ERR
    );
  }

  browserTab.close();

};

var RootBrowserTabManager = function() {

  BrowserTabManager.call(this);

  // list of tab objects we should ignore
  this._blackList = {};

  // global permanaent tabs collection manager
  this._allTabs = [];

  // Event Listener implementations
  chrome.tabs.onCreated.addListener(function(_tab) {

    var tabFoundIndex = -1;

    for (var i = 0, l = this._allTabs.length; i < l; i++) {

      // opera.extension.windows.create rewrite hack
      if (this._allTabs[i].rewriteUrl && this._allTabs[i].properties.url == _tab.url) {

        if(this._allTabs[i]._windowParent) {

          // If the window ids don't match then silently move the tab to the correct parent
          // e.g. this happens if we create a new tab from the background page's console.
          if(this._allTabs[i]._windowParent.properties.id !== _tab.windowId) {
            for(var j = 0, k = OEX.windows.length; j < k; j++) {
              if(OEX.windows[j].properties.id == _tab.windowId) {
                this._allTabs[i]._windowParent.tabs.removeTab(this._allTabs[i]);
                this._allTabs[i]._windowParent = OEX.windows[j];
                //this._allTabs[i].properties.index = this._allTabs[i]._windowParent.tabs.length;
                this._allTabs[i].properties.windowId = _tab.windowId;

                // Force change tab's index position in platform
                Queue.enqueue(this._allTabs[i], function(done) {
                  chrome.tabs.move(
                    this.properties.id,
                    { index: this._windowParent.tabs.length },
                    function(_tab) {
                      done();
                    }.bind(this)
                  );
                }.bind(this._allTabs[i]));

                OEX.windows[j].tabs.addTab( this._allTabs[i], this._allTabs[i].properties.index);
              }
            }
          }

          // Resolve the parent window object, if it's not already resolved
          this._allTabs[i]._windowParent.properties.id = _tab.windowId;
          this._allTabs[i]._windowParent.resolve(true);
          // Also resolve window object's root tab manager
          this._allTabs[i]._windowParent.tabs.resolve(true);

        } else {

          throw new OError('NoParent', 'BrowserTab object must have a parent window.');

        }

        // Rewrite tab properties (importantly, the id gets added here)
        /*for(var j in _tab) {
          if(j == 'url') continue;
          this._allTabs[i].properties[j] = _tab[j];
        }*/
        // update oncreate tab properties
        this._allTabs[i].properties.id = _tab.id;
        this._allTabs[i].properties.index = _tab.index;

        /*this._allTabs[i].properties.status = _tab.readyState;
        this._allTabs[i].properties.title = _tab.title;
        this._allTabs[i].properties.favIconUrl = _tab.favIconUrl;
        this._allTabs[i].properties.incognito = _tab.incognito;
        this._allTabs[i].properties.pinned = _tab.pinned;*/
        // 'index' should be handled in shim

        // now rewrite tab to the correct url
        // (which will be automatically trigger navigation to the rewrite url)

        // Resolve the tab object
        this._allTabs[i].resolve(true);

        // remove windowparent rewrite url
        if(this._allTabs[i]._windowParent.rewriteUrl !== undefined) {
          delete this._allTabs[i]._windowParent.rewriteUrl;
        }

        return;
      }

      // Standard tab search
      if (this._allTabs[i].properties.id == _tab.id) {
        tabFoundIndex = i;
        break;
      }
    }

    var newTab;

    if (tabFoundIndex < 0) {

      var parentWindow;

      // find tab's parent window object via the window.rewriteURL property
      var _windows = OEX.windows;
      for (var i = 0, l = _windows.length; i < l; i++) {

        // Bind the window object with its window id and resolve
        if( _windows[i].rewriteUrl && _windows[i].rewriteUrl == _tab.url ) {
          _windows[i].properties.id = _tab.windowId;
          _windows[i].resolve(true);
          // Also resolve window object's root tab manager
          _windows[i].tabs.resolve(true);
        }

        if (_windows[i].properties.id !== undefined && _windows[i].properties.id == _tab.windowId) {
          parentWindow = _windows[i];
          break;
        }
      }

      if (!parentWindow) {

        // Create new BrowserWindow object
        parentWindow = new BrowserWindow();

        // write properties not available in BrowserWindow constructor
        parentWindow.properties.id = _tab.windowId;

        // Attach to windows collection
        OEX.windows.addWindow(_tab.windowId, parentWindow);

        parentWindow.resolve(true);
        parentWindow.tabs.resolve(true);

        // we really need to learn more about the newly create BrowserWindow object
        chrome.windows.get(parentWindow.properties.id, { 'populate': false }, function(_window) {

          // update window properties
          for(var prop in _window) {
            if(prop == 'tabs') continue;
            parentWindow.properties[prop] = _window[prop];
          }

        }.bind(this));

      }

      // Replace first tab object with newTab
      if(parentWindow.rewriteUrl && parentWindow.tabs.length > 0) {

        newTab = parentWindow.tabs[0];

        // rewrite the tab's properties
        for(var j in _tab) {
          newTab.properties[j] = _tab[j];
        }

      } else {

        // Create the new BrowserTab object using the provided properties
        newTab = new BrowserTab(_tab, parentWindow, true);

        // write properties not available in BrowserTab constructor
        newTab.properties.id = _tab.id;
        newTab.properties.url = _tab.url;
        newTab.properties.title = _tab.title;
        newTab.properties.favIconUrl = _tab.favIconUrl;

        newTab.properties.pinned = _tab.pinned;
        newTab.properties.incognito = _tab.incognito;

        newTab.properties.status = _tab.status;

        newTab.properties.index = _tab.index;

        if(_tab.active == true && newTab.properties.active == false) {
          newTab.focus();
        }

        // Register the new BrowserTab object with a BrowserWindow's tabs collection
        newTab._windowParent.tabs.addTab( newTab, newTab.properties.index );

        // Add object to root store
        this.addTab( newTab );

      }

      // Fire create events for a newly created BrowserTab object
      newTab._windowParent.tabs.dispatchEvent(new OEvent('create', {
        "tab": newTab,
        "prevWindow": null,
        "prevTabGroup": null,
        "prevPosition": 0
      }));

      // Fire a create event at RootTabsManager
      OEX.tabs.dispatchEvent(new OEvent('create', {
        "tab": newTab,
        "prevWindow": null,
        "prevTabGroup": null,
        "prevPosition": 0
      }));

    } else {

      newTab = this[tabFoundIndex];

      // Update existing tab properties
      for(var i in _tab) {
        if(i == 'url') continue;
        newTab.properties[i] = _tab[i];
      }
      // update individual properties
      //newTab.properties.id = _tab.id;

    }

    // remove window rewriteUrl since the bootstrap has now been used
    if(newTab._windowParent.rewriteUrl !== undefined) {
      delete newTab._windowParent.rewriteUrl;
    }

    // Resolve new tab, if it hasn't been resolved already
    newTab.resolve(true);

//    Queue.dequeue();

  }.bind(this));

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

    if( this._blackList[ tabId ] ) {
      return;
    }

    // Remove tab from current collection
    var deleteIndex = -1;
    for (var i = 0, l = this._allTabs.length; i < l; i++) {
      if (this._allTabs[i].properties.id == tabId) {
        deleteIndex = i;
        break;
      }
    }

    if (deleteIndex < 0) {
      return;
    }

    var oldTab = this._allTabs[deleteIndex];

    var oldTabWindowParent = oldTab._oldWindowParent;
    var oldTabPosition = oldTab._oldIndex || oldTab.properties.index;

    // Detach from current parent BrowserWindow (if close happened outside of our framework)
    if (!oldTabWindowParent && oldTab._windowParent !== undefined && oldTab._windowParent !== null) {
      oldTab.properties.closed = true;

      oldTab._windowParent.tabs.removeTab( oldTab );

      // Remove tab from root tab manager
      this.removeTab( oldTab );

      // Focus new tab within the removed tab's window
      for(var i = 0, l = oldTab._windowParent.tabs.length; i < l; i++) {
        if(oldTab._windowParent.tabs[i].properties.active == true) {
          oldTab._windowParent.tabs[i].focus();
        } else {
          oldTab._windowParent.tabs[i].properties.active = false;
        }
      }

      oldTab.properties.index = NaN;

      oldTabWindowParent = oldTab._windowParent;
      oldTab._windowParent = null;
    }

    // Fire a new 'close' event on the closed BrowserTab object
    oldTab.dispatchEvent(new OEvent('close', {
      "tab": oldTab,
      "prevWindow": oldTabWindowParent,
      "prevTabGroup": null,
      "prevPosition": oldTabPosition
    }));

    // Fire a new 'close' event on the closed BrowserTab's previous
    // BrowserWindow parent object
    if(oldTabWindowParent) {

      oldTabWindowParent.tabs.dispatchEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));

    }

    // Fire a new 'close' event on this root tab manager object
    this.dispatchEvent(new OEvent('close', {
      "tab": oldTab,
      "prevWindow": oldTabWindowParent,
      "prevTabGroup": null,
      "prevPosition": oldTabPosition
    }));

//    Queue.dequeue();

  }.bind(this));

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    var updateIndex = -1;
    for (var i = 0, l = this._allTabs.length; i < l; i++) {
      if (this._allTabs[i].properties.id == tabId) {
        updateIndex = i;
        break;
      }
    }

    if (updateIndex < 0) {
      return; // nothing to update
    }

    var updateTab = this._allTabs[updateIndex];

    if (tab.status == 'complete' && updateTab.rewriteUrl && updateTab.properties.url == tab.url) {
      
      updateTab.properties.url = updateTab.rewriteUrl;
      updateTab.properties.title = '';
      updateTab.properties.favIconUrl = '';
      updateTab.properties.status = 'loading';
      
      delete updateTab.rewriteUrl;

      Queue.enqueue(this, function(done) {
        chrome.tabs.update(
          updateTab.properties.id,
          { 'url': updateTab.properties.url },
          function() {
            done();
          }.bind(this)
        );
      }.bind(this));
      
    } else {
      
      // Update individual tab properties
      updateTab.properties.url = tab.url;
      updateTab.properties.title = tab.title;
      updateTab.properties.favIconUrl = tab.favIconUrl;

      updateTab.properties.status = tab.status;

      updateTab.properties.pinned = tab.pinned;
      updateTab.properties.incognito = tab.incognito;

      updateTab.properties.index = tab.index;

      if(tab.active == true && updateTab.properties.active == false) {
        updateTab.focus();
      }
      
    }
    
//    Queue.dequeue();

  }.bind(this));

  function moveHandler(tabId, moveInfo) {

    if( this._blackList[ tabId ] ) {
      return;
    }

    // find tab's parent window object via the window.rewriteURL property
    // and rewrite it's id value
    var _windows = OEX.windows;
    for (var i = 0, l = _windows.length; i < l; i++) {

      // Bind the window object with its window id and resolve
      if( _windows[i].rewriteUrl && _windows[i].rewriteUrl == newTab_BaseURL.replace('%s', tabId) ) {
        _windows[i].properties.id = moveInfo.windowId;
        _windows[i].resolve(true);
        // Also resolve window object's root tab manager
        _windows[i].tabs.resolve(true);

        delete _windows[i].rewriteUrl;
      }
    }

    // Find tab object
    var moveIndex = -1;
    for (var i = 0, l = this._allTabs.length; i < l; i++) {
      if (this._allTabs[i].properties.id == tabId) {
        moveIndex = i;
        break;
      }
    }

    if (moveIndex < 0) {
      return; // nothing to update
    }

    var moveTab = this._allTabs[moveIndex];

    if(moveTab) {

      // Remove and re-add to BrowserTabManager parent in the correct position
      if(moveTab._oldWindowParent) {
        moveTab._oldWindowParent.tabs.removeTab( moveTab );
      } else {
        moveTab._windowParent.tabs.removeTab( moveTab );
      }

      // Update index
      moveTab.properties.index = moveInfo.toIndex;

      moveTab._windowParent.tabs.addTab( moveTab, moveInfo.toIndex );

      moveTab.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTab._oldWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveTab._oldIndex
      }));

      this.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTab._oldWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveTab._oldIndex
      }));

      // Clean up temporary attributes
      if(moveTab._oldWindowParent !== undefined) {
        delete moveTab._oldWindowParent;
      }
      if(moveTab._oldIndex !== undefined) {
        delete moveTab._oldIndex;
      }

    }

//    Queue.dequeue();

  }

  function attachHandler(tabId, attachInfo) {

    // Find tab object
    var attachIndex = -1;
    for (var i = 0, l = this._allTabs.length; i < l; i++) {
      if (this._allTabs[i].properties.id == tabId) {
        attachIndex = i;
        break;
      }
    }

    if (attachIndex < 0) {
      return; // nothing to update
    }

    var attachedTab = this._allTabs[attachIndex];

    // Detach tab from existing BrowserWindow parent (if any)
    if (attachedTab._oldWindowParent) {
      attachedTab._oldWindowParent.tabs.removeTab( attachedTab );
    }

    // Wait for new window to be created and attached!
    //global.setTimeout(function() {

      // Attach tab to new BrowserWindow parent
      for (var i = 0, l = OEX.windows.length; i < l; i++) {
        if (OEX.windows[i].properties.id == attachInfo.newWindowId) {
          // Reassign attachedTab's _windowParent
          attachedTab._windowParent = OEX.windows[i];

          // Tab will be added in the moveHandler function

          break;
        }
      }

      var moveInfo = {
        windowId: attachInfo.newWindowId,
        //fromIndex: null,
        toIndex: attachInfo.newPosition
      };

      // Execute normal move handler
      moveHandler.bind(this).call(this, tabId, moveInfo);

    //}.bind(this), 200);
  }

  function detachHandler(tabId, detachInfo) {

    // Find tab object
    var detachIndex = -1;
    for (var i = 0, l = this._allTabs.length; i < l; i++) {
      if (this._allTabs[i].properties.id == tabId) {
        detachIndex = i;
        break;
      }
    }

    if (detachIndex < 0) {
      return; // nothing to update
    }

    var detachedTab = this._allTabs[detachIndex];

    if(detachedTab) {
      detachedTab._oldWindowParent = detachedTab._windowParent;
      detachedTab._oldIndex = detachedTab.position;
    }

//    Queue.dequeue();

  }

  // Fired when a tab is moved within a window
  chrome.tabs.onMoved.addListener(moveHandler.bind(this));

  // Fired when a tab is moved between windows
  chrome.tabs.onAttached.addListener(attachHandler.bind(this));

  // Fired when a tab is removed from an existing window
  chrome.tabs.onDetached.addListener(detachHandler.bind(this));

  chrome.tabs.onActivated.addListener(function(activeInfo) {

    if( this._blackList[ activeInfo.tabId ] ) {
      return;
    }

    if(!activeInfo.tabId) return;

    var blurTarget, focusTarget;

    for(var i = 0, l = this._allTabs.length; i < l; i++) {

      if(this._allTabs[i].properties.id == activeInfo.tabId) {

        // Set BrowserTab object to active state
        this._allTabs[i].properties.active = true;

        // Fire focus event on tab's manager
        focusTarget = this._allTabs[i];

        if(this._allTabs[i]._windowParent) {

          // unset active state of all other tabs in this collection
          for(var j = 0, k = this._allTabs[i]._windowParent.tabs.length; j < k; j++) {
            if(this._allTabs[i]._windowParent.tabs[j] !== this._allTabs[i]) {
              if(this._allTabs[i]._windowParent.tabs[j].properties.active == true) {
                blurTarget = this._allTabs[i]._windowParent.tabs[j];
              }
              this._allTabs[i]._windowParent.tabs[j].properties.active = false;
            }
          }
        }

      }

    }

    // Fire blur event
    if(focusTarget) {
      OEX.tabs.dispatchEvent( new OEvent('blur', {
        "tab": focusTarget,
        "prevWindow": focusTarget._windowParent, // same as current window
        "prevTabGroup": null,
        "prevPosition": focusTarget.properties.index
      }) );
    }

    // Fire focus event
    if(blurTarget) {
      OEX.tabs.dispatchEvent( new OEvent('focus', {
        "tab": blurTarget,
        "prevWindow": blurTarget._windowParent, // same as current window
        "prevTabGroup": null,
        "prevPosition": blurTarget.properties.index
      }) );
    }

//    Queue.dequeue();

  }.bind(this));

  // Listen for getScreenshot requests from Injected Scripts
  OEX.addEventListener('controlmessage', function( msg ) {

    if( !msg.data || !msg.data.action || msg.data.action !== '___O_getScreenshot_REQUEST' || !msg.source.tabId ) {
      return;
    }

    // Resolve tabId to BrowserTab object
    var sourceBrowserTab = null
    for(var i = 0, l = this._allTabs.length; i < l; i++) {
      if( this._allTabs[ i ].properties.id == msg.source.tabId ) {
        sourceBrowserTab = this._allTabs[ i ];
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

RootBrowserTabManager.prototype = Object.create( BrowserTabManager.prototype );

// Make sure .__proto__ object gets setup correctly
for(var i in BrowserTabManager.prototype) {
  if(BrowserTabManager.prototype.hasOwnProperty(i)) {
    RootBrowserTabManager.prototype[i] = BrowserTabManager.prototype[i];
  }
}


var BrowserTab = function(browserTabProperties, windowParent, bypassRewriteUrl) {

  if(!windowParent) {
    throw new OError('Parent missing', 'BrowserTab objects can only be created with a window parent provided');
  }

  OPromise.call(this);

  this._windowParent = windowParent;
  
  browserTabProperties = browserTabProperties || {};
  
  // Set the correct tab index
  var tabIndex = 0;
  if(browserTabProperties.position !== undefined && 
      browserTabProperties.position !== null && 
        parseInt(browserTabProperties.position, 10) >= 0) {
    tabIndex = parseInt(browserTabProperties.position, 10);
  } else if(windowParent && windowParent.tabs) {
    tabIndex = windowParent.tabs.length;
  }

  this.properties = {
    'id': undefined, // not settable on create
    'closed': false, // not settable on create
    // locked:
    'pinned': browserTabProperties.locked ? !!browserTabProperties.locked : false,
    // private:
    'incognito': false, // TODO handle private tab creation in Chromium model
    // selected:
    'active': browserTabProperties.focused ? !!browserTabProperties.focused : false,
    // readyState:
    'status': 'loading', // not settable on create
    // faviconUrl:
    'favIconUrl': '', // not settable on create
    'title': '', // not settable on create
    'url': browserTabProperties.url ? (browserTabProperties.url + "") : 'about:blank',
    // position:
    'index': tabIndex
    // 'browserWindow' not part of settable properties
    // 'tabGroup' not part of settable properties
  }

  // Create a unique browserTab id
  this._operaId = Math.floor(Math.random() * 1e16);

  // Pass the identity of this tab through the Chromium Tabs API via the URL field
  if(!bypassRewriteUrl) {
    this.rewriteUrl = this.properties.url;
    this.properties.url = newTab_BaseURL.replace('%s', this._operaId)
  }

  // Set tab focused if active
  if(this.properties.active == true) {
    this.focus();
  }

  // Add this object to the permanent management collection
  OEX.tabs._allTabs.push( this );

};

BrowserTab.prototype = Object.create(OPromise.prototype);

// API
BrowserTab.prototype.__defineGetter__("id", function() {
  return this._operaId;
}); // read-only

BrowserTab.prototype.__defineGetter__("closed", function() {
  return this.properties.closed !== undefined ? !!this.properties.closed : false;
}); // read-only

BrowserTab.prototype.__defineGetter__("locked", function() {
  return this.properties.pinned !== undefined ? !!this.properties.pinned : false;
}); // read-only

BrowserTab.prototype.__defineGetter__("focused", function() {
  return this.properties.active !== undefined ? !!this.properties.active : false;
}); // read

BrowserTab.prototype.__defineSetter__("focused", function(val) {
  this.properties.active = !!val;

  if(this.properties.active == true) {
    this.focus();
  }
}); // write

BrowserTab.prototype.__defineGetter__("selected", function() {
  return this.properties.active !== undefined ? !!this.properties.active : false;
}); // read

BrowserTab.prototype.__defineSetter__("selected", function(val) {
  this.properties.active = !!val;

  if(this.properties.active == true) {
    this.focus();
  }
}); // write

BrowserTab.prototype.__defineGetter__("private", function() {
  return this.properties.incognito !== undefined ? !!this.properties.incognito : false;
}); // read-only

BrowserTab.prototype.__defineGetter__("faviconUrl", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.favIconUrl || "";
}); // read-only

BrowserTab.prototype.__defineGetter__("title", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.title || "";
}); // read-only

BrowserTab.prototype.__defineGetter__("url", function() {
  if (this.properties.closed) {
    return "";
  }

  // URL rewrite hack
  if (this.rewriteUrl) {
    return this.rewriteUrl;
  }

  return this.properties.url || "";
}); // read-only

BrowserTab.prototype.__defineSetter__("url", function(val) {
  this.properties.url = val + "";

  Queue.enqueue(this, function(done) {
    chrome.tabs.update(
      this.properties.id,
      { 'url': this.properties.url },
      function(_tab) {
        done();
      }.bind(this)
    );
  }.bind(this));
});

BrowserTab.prototype.__defineGetter__("readyState", function() {
  return this.properties.status !== undefined ? this.properties.status : "loading";
});

BrowserTab.prototype.__defineGetter__("browserWindow", function() {
  return this._windowParent;
});

BrowserTab.prototype.__defineGetter__("tabGroup", function() {
  // not implemented
  return null;
});

BrowserTab.prototype.__defineGetter__("position", function() {
  return this.properties.index !== undefined ? this.properties.index : NaN;
});

// Methods

BrowserTab.prototype.focus = function() {

  if(this.properties.active == true || this.properties.closed == true) {
    return; // already focused or invalid because tab is closed
  }

  // Set BrowserTab object to active state
  this.properties.active = true;

  if(this._windowParent) {
    // unset active state of all other tabs in this collection
    for(var i = 0, l = this._windowParent.tabs.length; i < l; i++) {
      if(this._windowParent.tabs[i] !== this) {
        this._windowParent.tabs[i].properties.active = false;
      }
    }
  }

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    chrome.tabs.update(
      this.properties.id,
      { active: true },
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

BrowserTab.prototype.update = function(browserTabProperties) {

  if( this.properties.closed == true ) {
    throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is closed. Cannot call 'update' on this object.",
      DOMException.INVALID_STATE_ERR
    );
  }

  if( isObjectEmpty(browserTabProperties || {}) ) {
    throw new OError(
      'TypeMismatchError',
      'You must provide some valid properties to update a BrowserTab object',
      DOMException.TYPE_MISMATCH_ERR
    );
  }

  var updateProperties = {};

  // Cannot set focused = false in update
  if(browserTabProperties.focused !== undefined && browserTabProperties.focused == true) {
    this.properties.active = updateProperties.active = !!browserTabProperties.focused;

    // unset active parameter of all other objects
    if(this._windowParent) {
      for(var i = 0, l = this._windowParent.tabs.length; i < l; i++) {
        if(this._windowParent.tabs[i] != this) {
          this._windowParent.tabs[i].properties.active = false;
        }
      }
    }
  }

  if(browserTabProperties.locked !== undefined && browserTabProperties.locked !== null) {
    this.properties.pinned = updateProperties.pinned = !!browserTabProperties.locked;
  }

  if(browserTabProperties.url !== undefined && browserTabProperties.url !== null) {
    if(this.rewriteUrl) {
      this.rewriteUrl = updateProperties.url = browserTabProperties.url;
    } else {
      this.properties.url = updateProperties.url = browserTabProperties.url;
    }
  }

  if( !isObjectEmpty(updateProperties) ) {

    // Queue platform action or fire immediately if this object is resolved
    Queue.enqueue(this, function(done) {
      chrome.tabs.update(
        this.properties.id,
        updateProperties,
        function(_tab) {
          done();
        }.bind(this)
      );
    }.bind(this));

  }

};

BrowserTab.prototype.refresh = function() {

  // Cannot refresh if the tab is in the closed state
  if(this.properties.closed === true) {
    return;
  }

  // reload by resetting the URL

  //this.properties.status = "loading";
  //this.properties.title = undefined;

  Queue.enqueue(this, function(done) {
    // reset the readyState + title
    this.properties.status = "loading";
    this.properties.title = undefined;

    chrome.tabs.reload(
      this.properties.id,
      { bypassCache: true },
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

// Web Messaging support for BrowserTab objects
BrowserTab.prototype.postMessage = function( postData ) {

  // Cannot send messages if tab is in the closed state
  if(this.properties.closed === true) {
    throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is in the closed state and therefore is invalid.",
      DOMException.INVALID_STATE_ERR
    );
  }

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    chrome.tabs.sendMessage(
      this.properties.id,
      postData,
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

// Screenshot API support for BrowserTab objects
BrowserTab.prototype.getScreenshot = function( callback ) {

  // Cannot get a screenshot if tab is in the closed state
  if(this.properties.closed === true) {
    throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is in the closed state and therefore is invalid.",
      DOMException.INVALID_STATE_ERR
    );
  }

  if( !this._windowParent || this._windowParent.properties.closed === true) {
    callback.call( this, undefined );
    return;
  }

  try {

    // Queue platform action or fire immediately if this object is resolved
    Queue.enqueue(this, function(done) {
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

            }.bind(this);
            img.src = nativeCallback;

          } else {

            callback.call( this, undefined );

          }

          done();

        }.bind(this)
      );
    }.bind(this));

  } catch(e) {}

};

BrowserTab.prototype.close = function() {

  if(this.properties.closed == true) {
    /*throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is already closed. Cannot call 'close' on this object.",
      DOMException.INVALID_STATE_ERR
    );*/
    return;
  }

  // Cannot close pinned tab
  if(this.properties.pinned == true) {
    return;
  }

  // Set BrowserTab object to closed state
  this.properties.closed = true;

  this.properties.active = false;

  // Detach from parent window
  this._oldWindowParent = this._windowParent;
  //this._windowParent = null;

  // Remove index
  this._oldIndex = this.properties.index;
  this.properties.index = undefined;

  // Remove tab from current collection
  if(this._oldWindowParent) {
    this._oldWindowParent.tabs.removeTab( this );
  }

  // Remove tab from global collection
  OEX.tabs.removeTab( this );

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    if(!this.properties.id) return;
    chrome.tabs.remove(
      this.properties.id,
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

var BrowserTabGroupManager = function( parentObj ) {

  OEventTarget.call(this);

  this._parent = parentObj;

  // Set up 0 mock BrowserTabGroup objects at startup
  this.length = 0;

};

BrowserTabGroupManager.prototype = Object.create( OEventTarget.prototype );

BrowserTabGroupManager.prototype.create = function() {

  // When this feature is not supported in the current user agent then we must
  // throw a NOT_SUPPORTED_ERR as per the full Opera WinTabs API specification.
  throw new OError(
    "NotSupportedError",
    "The current user agent does not support the Tab Groups feature.",
    DOMException.NOT_SUPPORTED_ERR
  );

};

BrowserTabGroupManager.prototype.getAll = function() {
  return []; // always empty
};

if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.windows = OEX.windows || new BrowserWindowManager();

} else {
  
  // Set WinTabs feature to LOADED
  deferredComponentsLoadStatus['WINTABS_LOADED'] = true;
  
}

if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.tabs = OEX.tabs || new RootBrowserTabManager();

}  else {

  // Set WinTabs feature to LOADED
  deferredComponentsLoadStatus['WINTABS_LOADED'] = true;

}

if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.tabGroups = OEX.tabGroups || new BrowserTabGroupManager();

}

var ToolbarContext = function() {

  OEventTarget.call( this );
  
  this.length = 0;

  // Unfortunately, click events only fire if a popup is not supplied
  // to a registered browser action in Chromium :(
  // http://stackoverflow.com/questions/1938356/chrome-browser-action-click-not-working
  //
  // TODO also invoke clickEventHandler function when a popup page loads
  function clickEventHandler(_tab) {

    if( this[ 0 ] ) {
      this[ 0 ].dispatchEvent( new OEvent('click', {}) );
    }

    // Fire event also on ToolbarContext API stub
    this.dispatchEvent( new OEvent('click', {}) );

  }

  chrome.browserAction.onClicked.addListener(clickEventHandler.bind(this));

};

ToolbarContext.prototype = Object.create( OEventTarget.prototype );

ToolbarContext.prototype.createItem = function( toolbarUIItemProperties ) {
  return new ToolbarUIItem( toolbarUIItemProperties );
};

ToolbarContext.prototype.addItem = function( toolbarUIItem ) {

  if( !toolbarUIItem || !toolbarUIItem instanceof ToolbarUIItem ) {
    return;
  }

  this[ 0 ] = toolbarUIItem;
  this.length = 1;

  toolbarUIItem.resolve(true);
  toolbarUIItem.apply();

  toolbarUIItem.badge.resolve(true);
  toolbarUIItem.badge.apply();

  toolbarUIItem.popup.resolve(true);
  toolbarUIItem.popup.apply();

};

ToolbarContext.prototype.removeItem = function( toolbarUIItem ) {

  if( !toolbarUIItem || !toolbarUIItem instanceof ToolbarUIItem ) {
    return;
  }

  if( this[ 0 ] && this[ 0 ] === toolbarUIItem ) {

    delete this[ 0 ];
    this.length = 0;

    // Disable the toolbar button
    chrome.browserAction.disable();

    toolbarUIItem.dispatchEvent( new OEvent('remove', {}) );

    // Fire event on self
    this.dispatchEvent( new OEvent('remove', {}) );

  }

};

var ToolbarBadge = function( properties ) {

  OPromise.call( this );

  this.properties = {};

  // Set provided properties through object prototype setter functions
  this.properties.textContent = properties.textContent ? "" + properties.textContent : properties.textContent;
  this.properties.backgroundColor = complexColorToHex(properties.backgroundColor);
  this.properties.color = complexColorToHex(properties.color);
  this.properties.display = String(properties.display).toLowerCase() === 'none' ? 'none' : 'block';
};

ToolbarBadge.prototype = Object.create( OPromise.prototype );

ToolbarBadge.prototype.apply = function() {

  chrome.browserAction.setBadgeBackgroundColor({ "color": (this.backgroundColor || "#f00") });

  if( this.display === "block" ) {
    chrome.browserAction.setBadgeText({ "text": this.textContent || "" });
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
  if( this.properties.display === "block" ) {
    Queue.enqueue(this, function(done) {

      chrome.browserAction.setBadgeText({ "text": ("" + val) });

      done();

    }.bind(this));
  }
});

ToolbarBadge.prototype.__defineGetter__("backgroundColor", function() {
  return this.properties.backgroundColor;
});

ToolbarBadge.prototype.__defineSetter__("backgroundColor", function( val ) {
  this.properties.backgroundColor = complexColorToHex(val);

  Queue.enqueue(this, function(done) {

    chrome.browserAction.setBadgeBackgroundColor({ "color": this.properties.backgroundColor });

    done();

  }.bind(this));
});

ToolbarBadge.prototype.__defineGetter__("color", function() {
  return this.properties.color;
});

ToolbarBadge.prototype.__defineSetter__("color", function( val ) {
  this.properties.color = complexColorToHex(val);
  // not implemented in chromium
});

ToolbarBadge.prototype.__defineGetter__("display", function() {
  return this.properties.display;
});

ToolbarBadge.prototype.__defineSetter__("display", function( val ) {
    if(("" + val).toLowerCase() === "none")  {
	this.properties.display = "none";
	Queue.enqueue(this, function(done) {

	    chrome.browserAction.setBadgeText({ "text": "" });

	    done();
	}.bind(this));
    }

    else {
	this.properties.display = "block";
	Queue.enqueue(this, function(done) {

	chrome.browserAction.setBadgeText({ "text": this.properties.textContent });

      done();

    }.bind(this));
  }
});

var ToolbarPopup = function( properties ) {

	OPromise.call( this );

	this.properties = {
	  href: "",
	  width: 300,
	  height: 300
	};
	
	// internal properties
	this.isExternalHref = false;
	
	this.href = properties.href;
	this.width = properties.width;
	this.height = properties.height;
	
	this.applyHrefVal = function() {
		// If href points to a http or https resource we need to load it via an iframe
		if(this.isExternalHref === true) {
			return "/oex_shim/popup_resourceloader.html?href=" + global.btoa(this.properties.href) +
              "&w=" + this.properties.width + "&h=" + this.properties.height;
		}
		
		return this.properties.href + (this.properties.href.indexOf('?') > 0 ? '&' : '?' ) + 
		        "w=" + this.properties.width + "&h=" + this.properties.height;
	};

};

ToolbarPopup.prototype = Object.create( OPromise.prototype );

ToolbarPopup.prototype.apply = function() {
  
  if(this.properties.href && this.properties.href !== "undefined" && this.properties.href !== "null" && this.properties.href !== "") {

	  chrome.browserAction.setPopup({ "popup": this.applyHrefVal() });
	
  } else {
    
    chrome.browserAction.setPopup({ "popup": "" });
    
  }

};

// API

ToolbarPopup.prototype.__defineGetter__("href", function() {
	return this.properties.href;
});

ToolbarPopup.prototype.__defineSetter__("href", function( val ) {
	val = val + ""; // force to type string
	
	// Check if we have an external href path
	if(val.match(/^(https?:\/\/|data:)/)) {
		this.isExternalHref = true;
	} else {
		this.isExternalHref = false;
	}
	
	this.properties.href = val;

  if(this.properties.href && this.properties.href !== "undefined" && this.properties.href !== "null" && this.properties.href !== "") {

  	Queue.enqueue(this, function(done) {

  		chrome.browserAction.setPopup({ "popup": this.applyHrefVal() });

  		done();

  	}.bind(this));
	
  } else {

    chrome.browserAction.setPopup({ "popup": "" });

  }
});

ToolbarPopup.prototype.__defineGetter__("width", function() {
	return this.properties.width;
});

ToolbarPopup.prototype.__defineSetter__("width", function( val ) {
	val = (val + "").replace(/\D/g, '');
	
	if(val == '') {
		this.properties.width = 300; // default width
	} else {
		this.properties.width = val < 800 ? val : 800; // enforce max width
	}
	
  if(this.properties.href && this.properties.href !== "undefined" && this.properties.href !== "null" && this.properties.href !== "") {

  	Queue.enqueue(this, function(done) {

  		chrome.browserAction.setPopup({ "popup": this.applyHrefVal() });

  		done();

  	}.bind(this));
	
  } else {

    chrome.browserAction.setPopup({ "popup": "" });

  }
});

ToolbarPopup.prototype.__defineGetter__("height", function() {
	return this.properties.height;
});

ToolbarPopup.prototype.__defineSetter__("height", function( val ) {
	val = (val + "").replace(/\D/g, '');
	
	if(val == '') {
		this.properties.height = 300; // default height
	} else {
	  this.properties.height = val < 600 ? val : 600; // enforce max height
	}
	
	if(this.properties.href && this.properties.href !== "undefined" && this.properties.href !== "null" && this.properties.href !== "") {

  	Queue.enqueue(this, function(done) {

  		chrome.browserAction.setPopup({ "popup": this.applyHrefVal() });

  		done();

  	}.bind(this));
	
  } else {

    chrome.browserAction.setPopup({ "popup": "" });

  }
});

var ToolbarUIItem = function( properties ) {

  OPromise.call( this );

  this.properties = {};

  this.properties.disabled = properties.disabled || false;
  this.properties.title = properties.title || "";
  this.properties.icon = properties.icon || "";
  this.properties.popup = new ToolbarPopup( properties.popup || {} );
  this.properties.badge = new ToolbarBadge( properties.badge || {} );
  if(properties.onclick){this.onclick = properties.onclick;}
  if(properties.onremove){this.onremove = properties.onremove;}

};

ToolbarUIItem.prototype = Object.create( OPromise.prototype );

ToolbarUIItem.prototype.apply = function() {

  // Apply title property
  chrome.browserAction.setTitle({ "title": this.title });

  // Apply icon property
  if(this.icon) {
    chrome.browserAction.setIcon({ "path": this.icon });
  } 
  
  // Apply disabled property
  if( this.disabled === true ) {
    chrome.browserAction.disable();
  } else {
    chrome.browserAction.enable();
  }

};

// API

ToolbarUIItem.prototype.__defineGetter__("disabled", function() {
  return this.properties.disabled;
});

ToolbarUIItem.prototype.__defineSetter__("disabled", function( val ) {
  if( this.properties.disabled !== val ) {
    if( val === true || val === "true" || val === 1 || val === "1" ) {
      this.properties.disabled = true;
      Queue.enqueue(this, function(done) {

        chrome.browserAction.disable();

        done();

      }.bind(this));
    } else {
      this.properties.disabled = false;
      Queue.enqueue(this, function(done) {

        chrome.browserAction.enable();

        done();

      }.bind(this));
    }
  }
});

ToolbarUIItem.prototype.__defineGetter__("title", function() {
  return this.properties.title;
});

ToolbarUIItem.prototype.__defineSetter__("title", function( val ) {
  this.properties.title = "" + val;

  Queue.enqueue(this, function(done) {

    chrome.browserAction.setTitle({ "title": this.title });

    done();

  }.bind(this));
});

ToolbarUIItem.prototype.__defineGetter__("icon", function() {
  return this.properties.icon;
});

ToolbarUIItem.prototype.__defineSetter__("icon", function( val ) {
  this.properties.icon = "" + val;

  Queue.enqueue(this, function(done) {

    chrome.browserAction.setIcon({ "path": this.icon });

    done();

  }.bind(this));
});

ToolbarUIItem.prototype.__defineGetter__("popup", function() {
  return this.properties.popup;
});

ToolbarUIItem.prototype.__defineGetter__("badge", function() {
  return this.properties.badge;
});

if(manifest && manifest.browser_action !== undefined && manifest.browser_action !== null ) {

  OEC.toolbar = OEC.toolbar || new ToolbarContext();

}
var MenuEvent = function(type,args,target){
  var event;

	if(type=='click'){

		var tab = null;
		var tabs = OEX.tabs.getAll();
		for(var i=0;i<tabs.length;i++){
			if(tabs[i].properties.id==args.tab.id&&tabs[i].browserWindow.properties.id==args.tab.windowId)tab = tabs[i];
		};

		event = OEvent(type,{
			documentURL: args.info.pageUrl,
			pageURL: args.info.pageUrl,
			isEditable: args.info.editable,
			linkURL: args.info.linkUrl || null,
			mediaType: args.info.mediaType || null,
			selectionText: args.info.selectionText || null,
			source: tab,//tab.port should be implemented
			srcURL: args.info.srcUrl || null
		});
	} else event = OEvent(type,args);


	Object.defineProperty(event,'target',{enumerable: true,  configurable: false,  get: function(){return target || null;}, set: function(value){}});

	return event;

};

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

var OMenuContext = function(internal) {
  if(internal !== Opera){//only internal creations
    throw new OError(
      "NotSupportedError",
      "NOT_SUPPORTED_ERR",
      DOMException.NOT_SUPPORTED_ERR
    );
    return;
  };

  MenuEventTarget.call( this );

  var length = 0;

	Object.defineProperty(this,'length',{enumerable: true,  configurable: false,  get: function(){ return length;	}, set: function(value){ }	});

	function toUint32(value){
    value = Number(value);
    value = value < 0 ? Math.ceil(value) : Math.floor(value);

    return value - Math.floor(value/Math.pow(2, 32))*Math.pow(2, 32);
  };


	Object.defineProperty(this,'addItem',{enumerable: true,  configurable: false, writable: false, value: function(menuItem,before){


		//too many items
    if(this instanceof MenuContext && this.length>0){
      throw new OError(
        "NotSupportedError",
        "NOT_SUPPORTED_ERR",
        DOMException.NOT_SUPPORTED_ERR
      );
      return;
    };

    //no item to add
    if( !menuItem || !(menuItem instanceof MenuItem) ) {
      throw new OError(
        "TypeMismatchError",
        "TYPE_MISMATCH_ERR",
        DOMException.TYPE_MISMATCH_ERR
      );
      return;
    }

    //adding only for folders
    if(this instanceof MenuItem && this.type!='folder'){
			throw new OError(
        "TypeMismatchError",
        "TYPE_MISMATCH_ERR",
        DOMException.TYPE_MISMATCH_ERR
      );
      return;
    };

    if(Array.prototype.indexOf.apply(this,[menuItem])!=-1)return;//already exist

    //same parent check
    if(before===undefined || this instanceof MenuContext)before = this.length;
    else if(before instanceof MenuItem){
      var index = Array.prototype.indexOf.apply(this,[before]);
      if(before.parent != this || index == -1){
        throw new OError(
          "HierarchyRequestError",
          "HIERARCHY_REQUEST_ERR",
          DOMException.HIERARCHY_REQUEST_ERR
        );
        return;

      } else before = index;

    } else if(before === null)before = this.length;
    else before = toUint32(before);

    if(isNaN(before))before = 0;

    //loop check
    var parent = this;
    var noLoop = false;
    while(!noLoop){
      if(parent instanceof MenuContext || parent == null)noLoop = true;
      else if(parent === menuItem){
        throw new OError(
          "HierarchyRequestError",
          "HIERARCHY_REQUEST_ERR",
          DOMException.HIERARCHY_REQUEST_ERR
        );
        return;
      } else parent = parent.parent;

    };


    Array.prototype.splice.apply(this,[before,0,menuItem]);

		length = length + 1;

    if(this instanceof MenuContext)menuItem.dispatchEvent( new MenuEvent('change', {properties : {parent: this} },menuItem));
		else this.dispatchEvent( new MenuEvent('change', {properties : {parent: this} }, menuItem));

	}});

	Object.defineProperty(this,'removeItem',{enumerable: true,  configurable: false, writable: false, value: function(index){
		if(index===undefined) {
			throw new OError(
				"TypeMismatchError",
				"TYPE_MISMATCH_ERR",
				DOMException.TYPE_MISMATCH_ERR
			);
			return;
		};

		if(index<0 || index >= length || this[ index ] == undefined)return;

		this[ index ].dispatchEvent( new MenuEvent('change', {properties : {parent: null} },this[ index ]));

		Array.prototype.splice.apply(this,[index,1]);

		length = length - 1;

	}});

	Object.defineProperty(this,'item',{enumerable: true,  configurable: false, writable: false, value: function(index){
		return this[index] || null;
	}});

};

OMenuContext.prototype = Object.create( MenuEventTarget.prototype);

var MenuItemProperties = function(obj,initial){
	var lock = false;
	var menuItemId = null;
	var properties = {
		id: "",
		type: "entry",
		contexts: ["page"],
		disabled: false,
		title: "",
		icon: "",
		documentURLPatterns: null,
		targetURLPatterns: null,
		parent: null
	};
	var allowedContexts = ["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"];
	var changed = function(){
		if(!lock)obj.dispatchEvent(new MenuEvent('change',{},obj));
	}
	var update = function(props){
		if(lock)return;

		lock = true;

		if(props!=undefined)for(var name in props)if(properties[name]!==undefined){
			if(name === "type"){

				if(["entry", "folder", "line"].indexOf(String(props.type).toLowerCase())!=-1)properties.type = String(props.type);

			} else if(name === "parent"){
				if(props.parent === null || props.parent instanceof OMenuContext)properties.parent = props.parent;
				else throw new TypeError();

			} else if(name === "id")properties.id = String(props.id);
			else obj[name] = props[name];
		};

		lock = false;
		//update

		if(properties.parent==null || (properties.parent instanceof MenuItem && properties.parent.menuItemId==null) ){

			if(menuItemId!=null){
				chrome.contextMenus.remove(menuItemId);
				menuItemId = null;
			};
			
		} else if(properties.disabled==true){
			
			if(menuItemId!=null){
				chrome.contextMenus.remove(menuItemId);
				menuItemId = null;
			};
			
		} else {

			var updateProperties = {
				title: properties.title.length==0?chrome.app.getDetails().name:properties.title,
				type: properties.type.toLowerCase()=="line"?"separator":"normal" //"normal", "checkbox", "radio", "separator"
			};

			var contexts = properties.contexts.join(',').toLowerCase().split(',').filter(function(element){
				return allowedContexts.indexOf(element.toLowerCase())!=-1;
			});

			if(contexts.length==0)updateProperties.contexts = ["page"];
			else updateProperties.contexts = contexts;

			if(properties.parent instanceof MenuItem && properties.parent.menuItemId!=null){
				updateProperties.parentId = properties.parent.menuItemId;
			};



			if(menuItemId==null){
				if(properties.id != "")updateProperties.id = properties.id;//set id
				menuItemId = chrome.contextMenus.create(updateProperties);
			} else chrome.contextMenus.update(menuItemId,updateProperties);

			/* unsafe code
			if(
				this.properties.parent instanceof MenuContext && this.properties.icon.length>0 //has icon
				&& !(chrome.app.getDetails().icons && chrome.app.getDetails().icons[16]) // no global 16x16 icon
			){//set custom root icon
				chrome.browserAction.setIcon({path: this.properties.icon });
			};
			*/

		};

	};

	var nosetter = function(value){};

	Object.defineProperty(obj,'id',{enumerable: true,  configurable: false,  get: function(){return properties.id;}, set: nosetter});
	Object.defineProperty(obj,'type',{enumerable: true,  configurable: false,  get: function(){return properties.type;}, set: nosetter});

	Object.defineProperty(obj,'contexts',{enumerable: true,  configurable: false,  get: function(){return properties.contexts;}, set: function(value){
		if(!Array.isArray(value)){
			throw new TypeError();
			return;
		};

		properties.contexts = value.length==0?value:value.join(',').split(',');
		changed();

	}});

	Object.defineProperty(obj,'disabled',{enumerable: true,  configurable: false,  get: function(){return properties.disabled;}, set: function(value){
		properties.disabled = Boolean(value);
		changed();
	}});

	Object.defineProperty(obj,'title',{enumerable: true,  configurable: false,  get: function(){return properties.title;}, set: function(value){
		properties.title = String(value);
		changed();
	}});

	Object.defineProperty(obj,'icon',{enumerable: true,  configurable: false,  get: function(){return properties.icon;}, set: function(value){
		if(typeof value === "string"){
			properties.icon = value;

			if(properties.icon.indexOf(':')==-1&&properties.icon.indexOf('/')==-1&&properties.icon.length>0)properties.icon = '/'+properties.icon;
		};

		changed();
	}});

	Object.defineProperty(obj,'documentURLPatterns',{enumerable: true,  configurable: false,  get: function(){return properties.documentURLPatterns;}, set: function(value){

		if(Array.isArray(value)){
			properties.documentURLPatterns = [];
			for(var i=0;i<value.length;i++)properties.documentURLPatterns.push(String(value[i]).toLowerCase());
		};

		changed();
	}});

	Object.defineProperty(obj,'targetURLPatterns',{enumerable: true,  configurable: false,  get: function(){return properties.targetURLPatterns;}, set: function(value){

		if(Array.isArray(value)){
			properties.targetURLPatterns = [];
			for(var i=0;i<value.length;i++)properties.targetURLPatterns.push(String(value[i]).toLowerCase());
		};

		changed();
	}});

	Object.defineProperty(obj,'menuItemId',{enumerable: false,  configurable: false,  get: function(){return menuItemId;},set: nosetter});

	Object.defineProperty(obj,'parent',{enumerable: true,  configurable: false,  get: function(){
			return properties.parent;
	}, set: nosetter	});

	if(initial!=undefined)update(initial);

	return update;
};



var MenuItem = function(internal,properties ) {
	OMenuContext.apply( this, [internal] );

	var _apply = MenuItemProperties(this,properties);

	//click event
	if(properties.onclick!=undefined)this.onclick = properties.onclick;//set initial click handler

	if(this.type.toLowerCase() === 'entry')chrome.contextMenus.onClicked.addListener(function(_info,_tab) {
    if(this.menuItemId == null || !(this.menuItemId === _info.menuItemId || this.id === _info.menuItemId))return;

    this.dispatchEvent( new MenuEvent('click', {info: _info, tab: _tab},this) );

		var event = new MenuEvent('click', {info: _info, tab: _tab},this);

    OEC.menu.dispatchEvent(event);

		event.source.postMessage({
			"action": "___O_MenuItem_Click",
			"info": _info,
			"menuItemId": this.id
		});

  }.bind(this));

	this.addEventListener('change',function(e){
		if(e.target === this)_apply(e.properties);
		else _apply();

		for(var i=0;i<this.length;i++)this[i].dispatchEvent(new MenuEvent('change',{properties: e.properties},e.target));

	},false);

	Object.defineProperty(this,'toString',{enumerable: false,  configurable: false, writable: false, value: function(event){
		return "[object MenuItem]";
	}});

};

MenuItem.prototype = Object.create( OMenuContext.prototype );


var MenuContext = function(internal) {
  chrome.contextMenus.removeAll();//clear all items

	OMenuContext.apply(this,[internal]);

  Object.defineProperty(this,'toString',{enumerable: false,  configurable: false, writable: false, value: function(event){
		return "[object MenuContext]";
	}});

};

MenuContext.prototype = Object.create( OMenuContext.prototype );

MenuContext.prototype.createItem = function( menuItemProperties ) {
  return new MenuItem(Opera, menuItemProperties );
};

if(manifest && manifest.permissions && manifest.permissions.indexOf('contextMenus')!=-1){

  global.MenuItem = MenuItem;
  global.MenuContext = MenuContext;

  OEC.menu = OEC.menu || new MenuContext(Opera);

}


var SpeeddialContext = function() {
  
  this.properties = {};
  
  global.opr.speeddial.get(function(speeddialProperties) {
    this.properties.url = speeddialProperties.url;
    this.properties.title = speeddialProperties.title;
    
    // Set WinTabs feature to LOADED
    deferredComponentsLoadStatus['SPEEDDIAL_LOADED'] = true;
  }.bind(this));

};

SpeeddialContext.prototype.constructor = SpeeddialContext;

SpeeddialContext.prototype.__defineGetter__('url', function() {
  return this.properties.url || "";
}); // read

SpeeddialContext.prototype.__defineSetter__('url', function(val) {
  
  this.properties.url = val;
  
  global.opr.speeddial.update({ 'url': val }, function() {});

}); // write

SpeeddialContext.prototype.__defineGetter__('title', function() {
  return this.properties.title || "";
}); // read

SpeeddialContext.prototype.__defineSetter__('title', function(val) {
  
  this.properties.title = val;
  
  global.opr.speeddial.update({ 'title': val }, function() {});

}); // write

if(global.opr && global.opr.speeddial && manifest && manifest.speeddial){

  OEC.speeddial = OEC.speeddial || new SpeeddialContext();

} else {

  // Set WinTabs feature to LOADED
  deferredComponentsLoadStatus['SPEEDDIAL_LOADED'] = true;

}


/*
 * This file is part of the Adblock Plus extension,
 * Copyright (C) 2006-2012 Eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

//
// Module framework stuff
//

function require(module)
{
  return require.scopes[module];
}
require.scopes = {__proto__: null};

function importAll(module, globalObj)
{
  var exports = require(module);
  for (var key in exports)
    globalObj[key] = exports[key];
}

onShutdown = {
  done: false,
  add: function() {},
  remove: function() {}
};

//
// XPCOM emulation
//

var Components =
{
  interfaces:
  {
    nsIFile: {DIRECTORY_TYPE: 0},
    nsIFileURL: function() {},
    nsIHttpChannel: function() {},
    nsITimer: {TYPE_REPEATING_SLACK: 0},
    nsIInterfaceRequestor: null,
    nsIChannelEventSink: null
  },
  classes:
  {
    "@mozilla.org/timer;1":
    {
      createInstance: function()
      {
        return new FakeTimer();
      }
    },
    "@mozilla.org/xmlextras/xmlhttprequest;1":
    {
      createInstance: function()
      {
        return new XMLHttpRequest();
      }
    }
  },
  results: {},
  utils: {
    reportError: function(e)
    {
      console.error(e);
      console.trace();
    }
  },
  manager: null,
  ID: function()
  {
    return null;
  }
};
var Cc = Components.classes;
var Ci = Components.interfaces;
var Cr = Components.results;
var Cu = Components.utils;

var XPCOMUtils =
{
  generateQI: function() {}
};

//
// Info pseudo-module
//

require.scopes.info =
{
  get addonID()
  {
    return chrome.i18n.getMessage("@@extension_id");
  },
  addonVersion: "2.1", // Hardcoded for now
  addonRoot: "",
  get addonName()
  {
    return chrome.i18n.getMessage("name");
  },
  application: "chrome"
};

//
// IO module: no direct file system access, using FileSystem API
//

require.scopes.io =
{
  IO: {
    _getFileEntry: function(file, create, successCallback, errorCallback)
    {
      if (file instanceof FakeFile)
        file = file.path;
      else if ("spec" in file)
        file = file.spec;

      // Remove directory path - we operate on a single directory in Chrome
      file = file.replace(/^.*[\/\\]/, "");

      // We request a gigabyte of space, just in case
      (window.requestFileSystem || window.webkitRequestFileSystem)(window.PERSISTENT, 1024*1024*1024, function(fs)
      {
        fs.root.getFile(file, {create: create}, function(fileEntry)
        {
          successCallback(fs, fileEntry);
        }, errorCallback);
      }, errorCallback);
    },

    lineBreak: "\n",

    resolveFilePath: function(path)
    {
      return new FakeFile(path);
    },

    readFromFile: function(file, decode, listener, callback, timeLineID)
    {
      if ("spec" in file && /^defaults\b/.test(file.spec))
      {
        // Code attempts to read the default patterns.ini, we don't have that.
        // Make sure to execute first-run actions instead.
        callback(null);
        if (localStorage.currentVersion)
          seenDataCorruption = true;
        delete localStorage.currentVersion;
        return;
      }

      this._getFileEntry(file, false, function(fs, fileEntry)
      {
        fileEntry.file(function(file)
        {
          var reader = new FileReader();
          reader.onloadend = function()
          {
            if (reader.error)
              callback(reader.error);
            else
            {
              var lines = reader.result.split(/[\r\n]+/);
              for (var i = 0; i < lines.length; i++)
                listener.process(lines[i]);
              listener.process(null);
              callback(null);
            }
          };
          reader.readAsText(file);
        }, callback);
      }, callback);
    },

    writeToFile: function(file, encode, data, callback, timeLineID)
    {
      this._getFileEntry(file, true, function(fs, fileEntry)
      {
        fileEntry.createWriter(function(writer)
        {
          var executeWriteOperation = function(op, nextOperation)
          {
            writer.onwriteend = function()
            {
              if (writer.error)
                callback(writer.error);
              else
                nextOperation();
            }.bind(this);

            op();
          }.bind(this);

          executeWriteOperation(writer.truncate.bind(writer, 0), function()
          {
            var blob;
            try
            {
              blob = new Blob([data.join(this.lineBreak) + this.lineBreak], {type: "text/plain"});
            }
            catch (e)
            {
              if (!(e instanceof TypeError))
                throw e;

              // Blob wasn't a constructor before Chrome 20
              var builder = new (window.BlobBuilder || window.WebKitBlobBuilder);
              builder.append(data.join(this.lineBreak) + this.lineBreak);
              blob = builder.getBlob("text/plain");
            }
            executeWriteOperation(writer.write.bind(writer, blob), callback.bind(null, null));
          }.bind(this));
        }.bind(this), callback);
      }.bind(this), callback);
    },

    copyFile: function(fromFile, toFile, callback)
    {
      // Simply combine read and write operations
      var data = [];
      this.readFromFile(fromFile, false, {
        process: function(line)
        {
          if (line !== null)
            data.push(line);
        }
      }, function(e)
      {
        if (e)
          callback(e);
        else
          this.writeToFile(toFile, false, data, callback);
      }.bind(this));
    },

    renameFile: function(fromFile, newName, callback)
    {
      this._getFileEntry(fromFile, false, function(fs, fileEntry)
      {
        fileEntry.moveTo(fs.root, newName, function()
        {
          callback(null);
        }, callback);
      }, callback);
    },

    removeFile: function(file, callback)
    {
      this._getFileEntry(file, false, function(fs, fileEntry)
      {
        fileEntry.remove(function()
        {
          callback(null);
        }, callback);
      }, callback);
    },

    statFile: function(file, callback)
    {
      this._getFileEntry(file, false, function(fs, fileEntry)
      {
        fileEntry.getMetadata(function(metadata)
        {
          callback(null, {
            exists: true,
            isDirectory: fileEntry.isDirectory,
            isFile: fileEntry.isFile,
            lastModified: metadata.modificationTime.getTime()
          });
        }, callback);
      }, callback);
    }
  }
};

//
// Fake nsIFile implementation for our I/O
//

function FakeFile(path)
{
  this.path = path;
}
FakeFile.prototype =
{
  get leafName()
  {
    return this.path;
  },
  set leafName(value)
  {
    this.path = value;
  },
  append: function(path)
  {
    this.path += path;
  },
  clone: function()
  {
    return new FakeFile(this.path);
  },
  get parent()
  {
    return {create: function() {}};
  },
  normalize: function() {}
};

//
// Prefs module: the values are hardcoded for now.
//

require.scopes.prefs = {
  Prefs: {
    enabled: true,
    patternsfile: "patterns.ini",
    patternsbackups: 5,
    patternsbackupinterval: 24,
    data_directory: "",
    savestats: false,
    privateBrowsing: false,
    subscriptions_fallbackerrors: 5,
    subscriptions_fallbackurl: "https://adblockplus.org/getSubscription?version=%VERSION%&url=%SUBSCRIPTION%&downloadURL=%URL%&error=%ERROR%&channelStatus=%CHANNELSTATUS%&responseStatus=%RESPONSESTATUS%",
    subscriptions_autoupdate: true,
    subscriptions_exceptionsurl: "https://easylist-downloads.adblockplus.org/exceptionrules.txt",
    documentation_link: "https://adblockplus.org/redirect?link=%LINK%&lang=%LANG%",
    addListener: function() {}
  }
};

//
// Utils module
//

require.scopes.utils =
{
  Utils: {
    systemPrincipal: null,
    getString: function(id)
    {
      return id;
    },
    runAsync: function(callback, thisPtr)
    {
      var params = Array.prototype.slice.call(arguments, 2);
      window.setTimeout(function()
      {
        callback.apply(thisPtr, params);
      }, 0);
    },
    get appLocale()
    {
      var locale = chrome.i18n.getMessage("@@ui_locale").replace(/_/g, "-");
      this.__defineGetter__("appLocale", function() {return locale});
      return this.appLocale;
    },
    generateChecksum: function(lines)
    {
      // We cannot calculate MD5 checksums yet :-(
      return null;
    },
    makeURI: function(url)
    {
      return Services.io.newURI(url);
    },

    checkLocalePrefixMatch: function(prefixes)
    {
      if (!prefixes)
        return null;

      var list = prefixes.split(",");
      for (var i = 0; i < list.length; i++)
        if (new RegExp("^" + list[i] + "\\b").test(this.appLocale))
          return list[i];

      return null;
    },

    chooseFilterSubscription: function(subscriptions)
    {
      var selectedItem = null;
      var selectedPrefix = null;
      var matchCount = 0;
      for (var i = 0; i < subscriptions.length; i++)
      {
        var subscription = subscriptions[i];
        if (!selectedItem)
          selectedItem = subscription;

        var prefix = require("utils").Utils.checkLocalePrefixMatch(subscription.getAttribute("prefixes"));
        if (prefix)
        {
          if (!selectedPrefix || selectedPrefix.length < prefix.length)
          {
            selectedItem = subscription;
            selectedPrefix = prefix;
            matchCount = 1;
          }
          else if (selectedPrefix && selectedPrefix.length == prefix.length)
          {
            matchCount++;

            // If multiple items have a matching prefix of the same length:
            // Select one of the items randomly, probability should be the same
            // for all items. So we replace the previous match here with
            // probability 1/N (N being the number of matches).
            if (Math.random() * matchCount < 1)
            {
              selectedItem = subscription;
              selectedPrefix = prefix;
            }
          }
        }
      }
      return selectedItem;
    }
  }
};

//
// ElemHideHitRegistration dummy implementation
//

require.scopes.elemHideHitRegistration =
{
  AboutHandler: {}
};

//
// Services.jsm module emulation
//

var Services =
{
  io: {
    newURI: function(uri)
    {
      if (!uri.length || uri[0] == "~")
        throw new Error("Invalid URI");

      /^([^:\/]*)/.test(uri);
      var scheme = RegExp.$1.toLowerCase();

      return {
        scheme: scheme,
        spec: uri,
        QueryInterface: function()
        {
          return this;
        }
      };
    },
    newFileURI: function(file)
    {
      var result = this.newURI("file:///" + file.path);
      result.file = file;
      return result;
    }
  },
  obs: {
    addObserver: function() {},
    removeObserver: function() {}
  },
  vc: {
    compare: function(v1, v2)
    {
      function parsePart(s)
      {
        if (!s)
          return parsePart("0");

        var part = {
          numA: 0,
          strB: "",
          numC: 0,
          extraD: ""
        };

        if (s === "*")
        {
          part.numA = Number.MAX_VALUE;
          return part;
        }

        var matches = s.match(/(\d*)(\D*)(\d*)(.*)/);
        part.numA = parseInt(matches[1], 10) || part.numA;
        part.strB = matches[2] || part.strB;
        part.numC = parseInt(matches[3], 10) || part.numC;
        part.extraD = matches[4] || part.extraD;

        if (part.strB == "+")
        {
          part.numA++;
          part.strB = "pre";
        }

        return part;
      }

      function comparePartElement(s1, s2)
      {
        if (s1 === "" && s2 !== "")
          return 1;
        if (s1 !== "" && s2 === "")
          return -1;
        return s1 === s2 ? 0 : (s1 > s2 ? 1 : -1);
      }

      function compareParts(p1, p2)
      {
        var result = 0;
        var elements = ["numA", "strB", "numC", "extraD"];
        elements.some(function(element)
        {
          result = comparePartElement(p1[element], p2[element]);
          return result;
        });
        return result;
      }

      var parts1 = v1.split(".");
      var parts2 = v2.split(".");
      for (var i = 0; i < Math.max(parts1.length, parts2.length); i++)
      {
        var result = compareParts(parsePart(parts1[i]), parsePart(parts2[i]));
        if (result)
          return result;
      }
      return 0;
    }
  }
}

//
// FileUtils.jsm module emulation
//

var FileUtils =
{
  PERMS_DIRECTORY: 0
};

function FakeTimer()
{
}
FakeTimer.prototype =
{
  delay: 0,
  callback: null,
  initWithCallback: function(callback, delay)
  {
    this.callback = callback;
    this.delay = delay;
    this.scheduleTimeout();
  },
  scheduleTimeout: function()
  {
    var me = this;
    window.setTimeout(function()
    {
      try
      {
        me.callback();
      }
      catch(e)
      {
        Cu.reportError(e);
      }
      me.scheduleTimeout();
    }, this.delay);
  }
};

//
// Add a channel property to XMLHttpRequest, Synchronizer needs it
//

XMLHttpRequest.prototype.channel =
{
  status: -1,
  notificationCallbacks: {},
  loadFlags: 0,
  INHIBIT_CACHING: 0,
  VALIDATE_ALWAYS: 0,
  QueryInterface: function()
  {
    return this;
  }
};

/*
 * This file is part of the Adblock Plus extension,
 * Copyright (C) 2006-2012 Eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

//
// This file has been generated automatically from Adblock Plus for Firefox
// source code. DO NOT MODIFY, change the original source code instead.
//
// Relevant repositories:
// * https://hg.adblockplus.org/adblockplus/
// * https://hg.adblockplus.org/jshydra/
//

/**
 * Minor modifications for compatibility with operaextensions.js
 *
 * You can view changes by diffing this file with:
 * https://github.com/adblockplus/adblockpluschrome/blob/0f158ee8c97390b831bac12016241613b4276729/lib/adblockplus.js
 *
 */

require.scopes["filterNotifier"] = (function()
{
  var exports = {};
  var listeners = [];
  var FilterNotifier = exports.FilterNotifier =
  {
    addListener: function(listener)
    {
      if (listeners.indexOf(listener) >= 0)
      {
        return;
      }
      listeners.push(listener);
    },
    removeListener: function(listener)
    {
      var index = listeners.indexOf(listener);
      if (index >= 0)
      {
        listeners.splice(index, 1);
      }
    },
    triggerListeners: function(action, item, param1, param2, param3)
    {
      for (var _loopIndex0 = 0; _loopIndex0 < listeners.length; ++_loopIndex0)
      {
        var listener = listeners[_loopIndex0];
        listener(action, item, param1, param2, param3);
      }
    }
  };
  return exports;
})();
require.scopes["filterClasses"] = (function()
{
  var exports = {};
  var FilterNotifier = require("filterNotifier").FilterNotifier;

  function Filter(text)
  {
    this.text = text;
    this.subscriptions = [];
  }
  exports.Filter = Filter;
  Filter.prototype =
  {
    text: null,
    subscriptions: null,
    serialize: function(buffer)
    {
      buffer.push("[Filter]");
      buffer.push("text=" + this.text);
    },
    toString: function()
    {
      return this.text;
    }
  };
  Filter.knownFilters =
  {
    __proto__: null
  };
  Filter.elemhideRegExp = /^([^\/\*\|\@"!]*?)#(\@)?(?:([\w\-]+|\*)((?:\([\w\-]+(?:[$^*]?=[^\(\)"]*)?\))*)|#([^{}]+))$/;
  Filter.regexpRegExp = /^(@@)?\/.*\/(?:\$~?[\w\-]+(?:=[^,\s]+)?(?:,~?[\w\-]+(?:=[^,\s]+)?)*)?$/;
  Filter.optionsRegExp = /\$(~?[\w\-]+(?:=[^,\s]+)?(?:,~?[\w\-]+(?:=[^,\s]+)?)*)$/;
  Filter.fromText = function(text)
  {
    if (text in Filter.knownFilters)
    {
      return Filter.knownFilters[text];
    }
    var ret;
    // element hiding is not supported in Opera's URL Filter API
    // TODO: remove all elemhide related code
    var match = null;
    if (match)
    {
      ret = ElemHideBase.fromText(text, match[1], match[2], match[3], match[4], match[5]);
    }
    else if (text[0] == "!")
    {
      ret = new CommentFilter(text);
    }
    else
    {
      ret = RegExpFilter.fromText(text);
    }
    Filter.knownFilters[ret.text] = ret;
    return ret;
  };
  Filter.fromObject = function(obj)
  {
    var ret = Filter.fromText(obj.text);
    if (ret instanceof ActiveFilter)
    {
      if ("disabled" in obj)
      {
        ret._disabled = obj.disabled == "true";
      }
      if ("hitCount" in obj)
      {
        ret._hitCount = parseInt(obj.hitCount) || 0;
      }
      if ("lastHit" in obj)
      {
        ret._lastHit = parseInt(obj.lastHit) || 0;
      }
    }
    return ret;
  };
  Filter.normalize = function(text)
  {
    if (!text)
    {
      return text;
    }
    text = text.replace(/[^\S ]/g, "");
    if (/^\s*!/.test(text))
    {
      return text.replace(/^\s+/, "").replace(/\s+$/, "");
    }
    else if (Filter.elemhideRegExp.test(text))
    {
      var _tempVar1 = /^(.*?)(#\@?#?)(.*)$/.exec(text);
      var domain = _tempVar1[1];
      var separator = _tempVar1[2];
      var selector = _tempVar1[3];
      return domain.replace(/\s/g, "") + separator + selector.replace(/^\s+/, "").replace(/\s+$/, "");
    }
    else
    {
      return text.replace(/\s/g, "");
    }
  };

  function InvalidFilter(text, reason)
  {
    Filter.call(this, text);
    this.reason = reason;
  }
  exports.InvalidFilter = InvalidFilter;
  InvalidFilter.prototype =
  {
    __proto__: Filter.prototype,
    reason: null,
    serialize: function(buffer){}
  };

  function CommentFilter(text)
  {
    Filter.call(this, text);
  }
  exports.CommentFilter = CommentFilter;
  CommentFilter.prototype =
  {
    __proto__: Filter.prototype,
    serialize: function(buffer){}
  };

  function ActiveFilter(text, domains)
  {
    Filter.call(this, text);
    this.domainSource = domains;
  }
  exports.ActiveFilter = ActiveFilter;
  ActiveFilter.prototype =
  {
    __proto__: Filter.prototype,
    _disabled: false,
    _hitCount: 0,
    _lastHit: 0,
    get disabled()
    {
      return this._disabled;
    },
    set disabled(value)
    {
      if (value != this._disabled)
      {
        var oldValue = this._disabled;
        this._disabled = value;
        FilterNotifier.triggerListeners("filter.disabled", this, value, oldValue);
      }
      return this._disabled;
    },
    get hitCount()
    {
      return this._hitCount;
    },
    set hitCount(value)
    {
      if (value != this._hitCount)
      {
        var oldValue = this._hitCount;
        this._hitCount = value;
        FilterNotifier.triggerListeners("filter.hitCount", this, value, oldValue);
      }
      return this._hitCount;
    },
    get lastHit()
    {
      return this._lastHit;
    },
    set lastHit(value)
    {
      if (value != this._lastHit)
      {
        var oldValue = this._lastHit;
        this._lastHit = value;
        FilterNotifier.triggerListeners("filter.lastHit", this, value, oldValue);
      }
      return this._lastHit;
    },
    domainSource: null,
    domainSeparator: null,
    ignoreTrailingDot: true,
    get domains()
    {
      var domains = null;
      if (this.domainSource)
      {
        var list = this.domainSource.split(this.domainSeparator);
        if (list.length == 1 && list[0][0] != "~")
        {
          domains =
          {
            __proto__: null,
            "": false
          };
          if (this.ignoreTrailingDot)
          {
            list[0] = list[0].replace(/\.+$/, "");
          }
          domains[list[0]] = true;
        }
        else
        {
          var hasIncludes = false;
          for (var i = 0; i < list.length; i++)
          {
            var domain = list[i];
            if (this.ignoreTrailingDot)
            {
              domain = domain.replace(/\.+$/, "");
            }
            if (domain == "")
            {
              continue;
            }
            var include;
            if (domain[0] == "~")
            {
              include = false;
              domain = domain.substr(1);
            }
            else
            {
              include = true;
              hasIncludes = true;
            }
            if (!domains)
            {
              domains =
              {
                __proto__: null
              };
            }
            domains[domain] = include;
          }
          domains[""] = !hasIncludes;
        }
        delete this.domainSource;
      }
      this.__defineGetter__("domains", function()
      {
        return domains;
      });
      return this.domains;
    },
    isActiveOnDomain: function(docDomain)
    {
      if (!this.domains)
      {
        return true;
      }
      if (!docDomain)
      {
        return this.domains[""];
      }
      if (this.ignoreTrailingDot)
      {
        docDomain = docDomain.replace(/\.+$/, "");
      }
      docDomain = docDomain.toUpperCase();
      while (true)
      {
        if (docDomain in this.domains)
        {
          return this.domains[docDomain];
        }
        var nextDot = docDomain.indexOf(".");
        if (nextDot < 0)
        {
          break;
        }
        docDomain = docDomain.substr(nextDot + 1);
      }
      return this.domains[""];
    },
    isActiveOnlyOnDomain: function(docDomain)
    {
      if (!docDomain || !this.domains || this.domains[""])
      {
        return false;
      }
      if (this.ignoreTrailingDot)
      {
        docDomain = docDomain.replace(/\.+$/, "");
      }
      docDomain = docDomain.toUpperCase();
      for (var domain in this.domains)
      {
        if (this.domains[domain] && domain != docDomain && (domain.length <= docDomain.length || domain.indexOf("." + docDomain) != domain.length - docDomain.length - 1))
        {
          return false;
        }
      }
      return true;
    },
    serialize: function(buffer)
    {
      if (this._disabled || this._hitCount || this._lastHit)
      {
        Filter.prototype.serialize.call(this, buffer);
        if (this._disabled)
        {
          buffer.push("disabled=true");
        }
        if (this._hitCount)
        {
          buffer.push("hitCount=" + this._hitCount);
        }
        if (this._lastHit)
        {
          buffer.push("lastHit=" + this._lastHit);
        }
      }
    }
  };

  function RegExpFilter(text, regexpSource, contentType, matchCase, domains, thirdParty)
  {
    ActiveFilter.call(this, text, domains);
    if (contentType != null)
    {
      this.contentType = contentType;
    }
    if (matchCase)
    {
      this.matchCase = matchCase;
    }
    if (thirdParty != null)
    {
      this.thirdParty = thirdParty;
    }
    if (regexpSource.length >= 2 && regexpSource[0] == "/" && regexpSource[regexpSource.length - 1] == "/")
    {
      var regexp = new RegExp(regexpSource.substr(1, regexpSource.length - 2), this.matchCase ? "" : "i");
      this.__defineGetter__("regexp", function()
      {
        return regexp;
      });
    }
    else
    {
      this.regexpSource = regexpSource;
    }
  }
  exports.RegExpFilter = RegExpFilter;
  RegExpFilter.prototype =
  {
    __proto__: ActiveFilter.prototype,
    length: 1,
    domainSeparator: "|",
    regexpSource: null,
    get regexp()
    {
      var source = this.regexpSource.replace(/\*+/g, "*");
      if (source[0] == "*")
      {
        source = source.substr(1);
      }
      var pos = source.length - 1;
      if (pos >= 0 && source[pos] == "*")
      {
        source = source.substr(0, pos);
      }
      source = source.replace(/\^\|$/, "^").replace(/\W/g, "\\$&").replace(/\\\*/g, ".*").replace(/\\\^/g, "(?:[\\x00-\\x24\\x26-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x80]|$)").replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?!\\/)(?:[^.\\/]+\\.)*?").replace(/^\\\|/, "^").replace(/\\\|$/, "$");
      var regexp = new RegExp(source, this.matchCase ? "" : "i");
      delete this.regexpSource;
      this.__defineGetter__("regexp", function()
      {
        return regexp;
      });
      return this.regexp;
    },
    contentType: 2147483647,
    matchCase: false,
    thirdParty: null,
    matches: function(location, contentType, docDomain, thirdParty)
    {
      if (this.regexp.test(location) && (RegExpFilter.typeMap[contentType] & this.contentType) != 0 && (this.thirdParty == null || this.thirdParty == thirdParty) && this.isActiveOnDomain(docDomain))
      {
        return true;
      }
      return false;
    }
  };
  RegExpFilter.prototype.__defineGetter__("0", function()
  {
    return this;
  });
  RegExpFilter.fromText = function(text)
  {
    var blocking = true;
    var origText = text;
    if (text.indexOf("@@") == 0)
    {
      blocking = false;
      text = text.substr(2);
    }
    var contentType = null;
    var matchCase = null;
    var domains = null;
    var siteKeys = null;
    var thirdParty = null;
    var collapse = null;
    var options;
    var match = text.indexOf("$") >= 0 ? Filter.optionsRegExp.exec(text) : null;
    if (match)
    {
      options = match[1].toUpperCase().split(",");
      text = match.input.substr(0, match.index);
      for (var _loopIndex2 = 0; _loopIndex2 < options.length; ++_loopIndex2)
      {
        var option = options[_loopIndex2];
        var value = null;
        var separatorIndex = option.indexOf("=");
        if (separatorIndex >= 0)
        {
          value = option.substr(separatorIndex + 1);
          option = option.substr(0, separatorIndex);
        }
        option = option.replace(/-/, "_");
        if (option in RegExpFilter.typeMap)
        {
          if (contentType == null)
          {
            contentType = 0;
          }
          contentType |= RegExpFilter.typeMap[option];
        }
        else if (option[0] == "~" && option.substr(1) in RegExpFilter.typeMap)
        {
          if (contentType == null)
          {
            contentType = RegExpFilter.prototype.contentType;
          }
          contentType &= ~RegExpFilter.typeMap[option.substr(1)];
        }
        else if (option == "MATCH_CASE")
        {
          matchCase = true;
        }
        else if (option == "DOMAIN" && typeof value != "undefined")
        {
          domains = value;
        }
        else if (option == "THIRD_PARTY")
        {
          thirdParty = true;
        }
        else if (option == "~THIRD_PARTY")
        {
          thirdParty = false;
        }
        else if (option == "COLLAPSE")
        {
          collapse = true;
        }
        else if (option == "~COLLAPSE")
        {
          collapse = false;
        }
        else if (option == "SITEKEY" && typeof value != "undefined")
        {
          siteKeys = value.split(/\|/);
        }
      }
    }
    if (!blocking && (contentType == null || contentType & RegExpFilter.typeMap.DOCUMENT) && (!options || options.indexOf("DOCUMENT") < 0) && !/^\|?[\w\-]+:/.test(text))
    {
      if (contentType == null)
      {
        contentType = RegExpFilter.prototype.contentType;
      }
      contentType &= ~RegExpFilter.typeMap.DOCUMENT;
    }
    if (!blocking && siteKeys)
    {
      contentType = RegExpFilter.typeMap.DOCUMENT;
    }
    try
    {
      if (blocking)
      {
        return new BlockingFilter(origText, text, contentType, matchCase, domains, thirdParty, collapse);
      }
      else
      {
        return new WhitelistFilter(origText, text, contentType, matchCase, domains, thirdParty, siteKeys);
      }
    }
    catch (e)
    {
      return new InvalidFilter(text, e);
    }
  };
  RegExpFilter.typeMap =
  {
    OTHER: 1,
    SCRIPT: 2,
    IMAGE: 4,
    STYLESHEET: 8,
    OBJECT: 16,
    SUBDOCUMENT: 32,
    DOCUMENT: 64,
    XBL: 1,
    PING: 1,
    XMLHTTPREQUEST: 2048,
    OBJECT_SUBREQUEST: 4096,
    DTD: 1,
    MEDIA: 16384,
    FONT: 32768,
    BACKGROUND: 4,
    POPUP: 268435456,
    DONOTTRACK: 536870912,
    ELEMHIDE: 1073741824
  };
  RegExpFilter.prototype.contentType &= ~ (RegExpFilter.typeMap.ELEMHIDE | RegExpFilter.typeMap.DONOTTRACK | RegExpFilter.typeMap.POPUP);

  function BlockingFilter(text, regexpSource, contentType, matchCase, domains, thirdParty, collapse)
  {
    RegExpFilter.call(this, text, regexpSource, contentType, matchCase, domains, thirdParty);
    this.collapse = collapse;
  }
  exports.BlockingFilter = BlockingFilter;
  BlockingFilter.prototype =
  {
    __proto__: RegExpFilter.prototype,
    collapse: null
  };

  function WhitelistFilter(text, regexpSource, contentType, matchCase, domains, thirdParty, siteKeys)
  {
    RegExpFilter.call(this, text, regexpSource, contentType, matchCase, domains, thirdParty);
    if (siteKeys != null)
    {
      this.siteKeys = siteKeys;
    }
  }
  exports.WhitelistFilter = WhitelistFilter;
  WhitelistFilter.prototype =
  {
    __proto__: RegExpFilter.prototype,
    siteKeys: null
  };

  function ElemHideBase(text, domains, selector)
  {
    ActiveFilter.call(this, text, domains ? domains.toUpperCase() : null);
    if (domains)
    {
      this.selectorDomain = domains.replace(/,~[^,]+/g, "").replace(/^~[^,]+,?/, "").toLowerCase();
    }
    this.selector = selector;
  }
  exports.ElemHideBase = ElemHideBase;
  ElemHideBase.prototype =
  {
    __proto__: ActiveFilter.prototype,
    domainSeparator: ",",
    ignoreTrailingDot: false,
    selectorDomain: null,
    selector: null
  };
  ElemHideBase.fromText = function(text, domain, isException, tagName, attrRules, selector)
  {
    if (!selector)
    {
      if (tagName == "*")
      {
        tagName = "";
      }
      var id = null;
      var additional = "";
      if (attrRules)
      {
        attrRules = attrRules.match(/\([\w\-]+(?:[$^*]?=[^\(\)"]*)?\)/g);
        for (var _loopIndex3 = 0; _loopIndex3 < attrRules.length; ++_loopIndex3)
        {
          var rule = attrRules[_loopIndex3];
          rule = rule.substr(1, rule.length - 2);
          var separatorPos = rule.indexOf("=");
          if (separatorPos > 0)
          {
            rule = rule.replace(/=/, "=\"") + "\"";
            additional += "[" + rule + "]";
          }
          else
          {
            if (id)
            {
              var Utils = require("utils").Utils;
              return new InvalidFilter(text, Utils.getString("filter_elemhide_duplicate_id"));
            }
            else
            {
              id = rule;
            }
          }
        }
      }
      if (id)
      {
        selector = tagName + "." + id + additional + "," + tagName + "#" + id + additional;
      }
      else if (tagName || additional)
      {
        selector = tagName + additional;
      }
      else
      {
        var Utils = require("utils").Utils;
        return new InvalidFilter(text, Utils.getString("filter_elemhide_nocriteria"));
      }
    }
    if (isException)
    {
      return new ElemHideException(text, domain, selector);
    }
    else
    {
      return new ElemHideFilter(text, domain, selector);
    }
  };

  function ElemHideFilter(text, domains, selector)
  {
    ElemHideBase.call(this, text, domains, selector);
  }
  exports.ElemHideFilter = ElemHideFilter;
  ElemHideFilter.prototype =
  {
    __proto__: ElemHideBase.prototype
  };

  function ElemHideException(text, domains, selector)
  {
    ElemHideBase.call(this, text, domains, selector);
  }
  exports.ElemHideException = ElemHideException;
  ElemHideException.prototype =
  {
    __proto__: ElemHideBase.prototype
  };
  return exports;
})();
require.scopes["subscriptionClasses"] = (function()
{
  var exports = {};
  var _tempVar4 = require("filterClasses");
  var ActiveFilter = _tempVar4.ActiveFilter;
  var BlockingFilter = _tempVar4.BlockingFilter;
  var WhitelistFilter = _tempVar4.WhitelistFilter;
  var ElemHideBase = _tempVar4.ElemHideBase;
  var FilterNotifier = require("filterNotifier").FilterNotifier;

  function Subscription(url, title)
  {
    this.url = url;
    this.filters = [];
    if (title)
    {
      this._title = title;
    }
    else
    {
      var Utils = require("utils").Utils;
      this._title = Utils.getString("newGroup_title");
    }
    Subscription.knownSubscriptions[url] = this;
  }
  exports.Subscription = Subscription;
  Subscription.prototype =
  {
    url: null,
    filters: null,
    _title: null,
    _fixedTitle: false,
    _disabled: false,
    get title()
    {
      return this._title;
    },
    set title(value)
    {
      if (value != this._title)
      {
        var oldValue = this._title;
        this._title = value;
        FilterNotifier.triggerListeners("subscription.title", this, value, oldValue);
      }
      return this._title;
    },
    get fixedTitle()
    {
      return this._fixedTitle;
    },
    set fixedTitle(value)
    {
      if (value != this._fixedTitle)
      {
        var oldValue = this._fixedTitle;
        this._fixedTitle = value;
        FilterNotifier.triggerListeners("subscription.fixedTitle", this, value, oldValue);
      }
      return this._fixedTitle;
    },
    get disabled()
    {
      return this._disabled;
    },
    set disabled(value)
    {
      if (value != this._disabled)
      {
        var oldValue = this._disabled;
        this._disabled = value;
        FilterNotifier.triggerListeners("subscription.disabled", this, value, oldValue);
      }
      return this._disabled;
    },
    serialize: function(buffer)
    {
      buffer.push("[Subscription]");
      buffer.push("url=" + this.url);
      buffer.push("title=" + this._title);
      if (this._fixedTitle)
      {
        buffer.push("fixedTitle=true");
      }
      if (this._disabled)
      {
        buffer.push("disabled=true");
      }
    },
    serializeFilters: function(buffer)
    {
      for (var _loopIndex5 = 0; _loopIndex5 < this.filters.length; ++_loopIndex5)
      {
        var filter = this.filters[_loopIndex5];
        buffer.push(filter.text.replace(/\[/g, "\\["));
      }
    },
    toString: function()
    {
      var buffer = [];
      this.serialize(buffer);
      return buffer.join("\n");
    }
  };
  Subscription.knownSubscriptions =
  {
    __proto__: null
  };
  Subscription.fromURL = function(url)
  {
    if (url in Subscription.knownSubscriptions)
    {
      return Subscription.knownSubscriptions[url];
    }
    try
    {
      url = Services.io.newURI(url, null, null).spec;
      return new DownloadableSubscription(url, null);
    }
    catch (e)
    {
      return new SpecialSubscription(url);
    }
  };
  Subscription.fromObject = function(obj)
  {
    var result;
    try
    {
      obj.url = Services.io.newURI(obj.url, null, null).spec;
      result = new DownloadableSubscription(obj.url, obj.title);
      if ("nextURL" in obj)
      {
        result.nextURL = obj.nextURL;
      }
      if ("downloadStatus" in obj)
      {
        result._downloadStatus = obj.downloadStatus;
      }
      if ("lastModified" in obj)
      {
        result.lastModified = obj.lastModified;
      }
      if ("lastSuccess" in obj)
      {
        result.lastSuccess = parseInt(obj.lastSuccess) || 0;
      }
      if ("lastCheck" in obj)
      {
        result._lastCheck = parseInt(obj.lastCheck) || 0;
      }
      if ("expires" in obj)
      {
        result.expires = parseInt(obj.expires) || 0;
      }
      if ("softExpiration" in obj)
      {
        result.softExpiration = parseInt(obj.softExpiration) || 0;
      }
      if ("errors" in obj)
      {
        result._errors = parseInt(obj.errors) || 0;
      }
      if ("requiredVersion" in obj)
      {
        var addonVersion = require("info").addonVersion;
        result.requiredVersion = obj.requiredVersion;
        if (Services.vc.compare(result.requiredVersion, addonVersion) > 0)
        {
          result.upgradeRequired = true;
        }
      }
      if ("alternativeLocations" in obj)
      {
        result.alternativeLocations = obj.alternativeLocations;
      }
      if ("homepage" in obj)
      {
        result._homepage = obj.homepage;
      }
      if ("lastDownload" in obj)
      {
        result._lastDownload = parseInt(obj.lastDownload) || 0;
      }
    }
    catch (e)
    {
      if (!("title" in obj))
      {
        if (obj.url == "~wl~")
        {
          obj.defaults = "whitelist";
        }
        else if (obj.url == "~fl~")
        {
          obj.defaults = "blocking";
        }
        else if (obj.url == "~eh~")
        {
          obj.defaults = "elemhide";
        }
        if ("defaults" in obj)
        {
          var Utils = require("utils").Utils;
          obj.title = Utils.getString(obj.defaults + "Group_title");
        }
      }
      result = new SpecialSubscription(obj.url, obj.title);
      if ("defaults" in obj)
      {
        result.defaults = obj.defaults.split(" ");
      }
    }
    if ("fixedTitle" in obj)
    {
      result._fixedTitle = obj.fixedTitle == "true";
    }
    if ("disabled" in obj)
    {
      result._disabled = obj.disabled == "true";
    }
    return result;
  };

  function SpecialSubscription(url, title)
  {
    Subscription.call(this, url, title);
  }
  exports.SpecialSubscription = SpecialSubscription;
  SpecialSubscription.prototype =
  {
    __proto__: Subscription.prototype,
    defaults: null,
    isDefaultFor: function(filter)
    {
      if (this.defaults && this.defaults.length)
      {
        for (var _loopIndex6 = 0; _loopIndex6 < this.defaults.length; ++_loopIndex6)
        {
          var type = this.defaults[_loopIndex6];
          if (filter instanceof SpecialSubscription.defaultsMap[type])
          {
            return true;
          }
          if (!(filter instanceof ActiveFilter) && type == "blacklist")
          {
            return true;
          }
        }
      }
      return false;
    },
    serialize: function(buffer)
    {
      Subscription.prototype.serialize.call(this, buffer);
      if (this.defaults && this.defaults.length)
      {
        buffer.push("defaults=" + this.defaults.filter(function(type)
        {
          return type in SpecialSubscription.defaultsMap;
        }).join(" "));
      }
      if (this._lastDownload)
      {
        buffer.push("lastDownload=" + this._lastDownload);
      }
    }
  };
  SpecialSubscription.defaultsMap =
  {
    __proto__: null,
    "whitelist": WhitelistFilter,
    "blocking": BlockingFilter,
    "elemhide": ElemHideBase
  };
  SpecialSubscription.create = function(title)
  {
    var url;
    do
    {
      url = "~user~" + Math.round(Math.random() * 1000000);
    }
    while (url in Subscription.knownSubscriptions);
    return new SpecialSubscription(url, title);
  };
  SpecialSubscription.createForFilter = function(filter)
  {
    var subscription = SpecialSubscription.create();
    subscription.filters.push(filter);
    for (var type in SpecialSubscription.defaultsMap)
    {
      if (filter instanceof SpecialSubscription.defaultsMap[type])
      {
        subscription.defaults = [type];
      }
    }
    if (!subscription.defaults)
    {
      subscription.defaults = ["blocking"];
    }
    var Utils = require("utils").Utils;
    subscription.title = Utils.getString(subscription.defaults[0] + "Group_title");
    return subscription;
  };

  function RegularSubscription(url, title)
  {
    Subscription.call(this, url, title || url);
  }
  exports.RegularSubscription = RegularSubscription;
  RegularSubscription.prototype =
  {
    __proto__: Subscription.prototype,
    _homepage: null,
    _lastDownload: 0,
    get homepage()
    {
      return this._homepage;
    },
    set homepage(value)
    {
      if (value != this._homepage)
      {
        var oldValue = this._homepage;
        this._homepage = value;
        FilterNotifier.triggerListeners("subscription.homepage", this, value, oldValue);
      }
      return this._homepage;
    },
    get lastDownload()
    {
      return this._lastDownload;
    },
    set lastDownload(value)
    {
      if (value != this._lastDownload)
      {
        var oldValue = this._lastDownload;
        this._lastDownload = value;
        FilterNotifier.triggerListeners("subscription.lastDownload", this, value, oldValue);
      }
      return this._lastDownload;
    },
    serialize: function(buffer)
    {
      Subscription.prototype.serialize.call(this, buffer);
      if (this._homepage)
      {
        buffer.push("homepage=" + this._homepage);
      }
      if (this._lastDownload)
      {
        buffer.push("lastDownload=" + this._lastDownload);
      }
    }
  };

  function ExternalSubscription(url, title)
  {
    RegularSubscription.call(this, url, title);
  }
  exports.ExternalSubscription = ExternalSubscription;
  ExternalSubscription.prototype =
  {
    __proto__: RegularSubscription.prototype,
    serialize: function(buffer)
    {
      throw new Error("Unexpected call, external subscriptions should not be serialized");
    }
  };

  function DownloadableSubscription(url, title)
  {
    RegularSubscription.call(this, url, title);
  }
  exports.DownloadableSubscription = DownloadableSubscription;
  DownloadableSubscription.prototype =
  {
    __proto__: RegularSubscription.prototype,
    _downloadStatus: null,
    _lastCheck: 0,
    _errors: 0,
    nextURL: null,
    get downloadStatus()
    {
      return this._downloadStatus;
    },
    set downloadStatus(value)
    {
      var oldValue = this._downloadStatus;
      this._downloadStatus = value;
      FilterNotifier.triggerListeners("subscription.downloadStatus", this, value, oldValue);
      return this._downloadStatus;
    },
    lastModified: null,
    lastSuccess: 0,
    get lastCheck()
    {
      return this._lastCheck;
    },
    set lastCheck(value)
    {
      if (value != this._lastCheck)
      {
        var oldValue = this._lastCheck;
        this._lastCheck = value;
        FilterNotifier.triggerListeners("subscription.lastCheck", this, value, oldValue);
      }
      return this._lastCheck;
    },
    expires: 0,
    softExpiration: 0,
    get errors()
    {
      return this._errors;
    },
    set errors(value)
    {
      if (value != this._errors)
      {
        var oldValue = this._errors;
        this._errors = value;
        FilterNotifier.triggerListeners("subscription.errors", this, value, oldValue);
      }
      return this._errors;
    },
    requiredVersion: null,
    upgradeRequired: false,
    alternativeLocations: null,
    serialize: function(buffer)
    {
      RegularSubscription.prototype.serialize.call(this, buffer);
      if (this.nextURL)
      {
        buffer.push("nextURL=" + this.nextURL);
      }
      if (this.downloadStatus)
      {
        buffer.push("downloadStatus=" + this.downloadStatus);
      }
      if (this.lastModified)
      {
        buffer.push("lastModified=" + this.lastModified);
      }
      if (this.lastSuccess)
      {
        buffer.push("lastSuccess=" + this.lastSuccess);
      }
      if (this.lastCheck)
      {
        buffer.push("lastCheck=" + this.lastCheck);
      }
      if (this.expires)
      {
        buffer.push("expires=" + this.expires);
      }
      if (this.softExpiration)
      {
        buffer.push("softExpiration=" + this.softExpiration);
      }
      if (this.errors)
      {
        buffer.push("errors=" + this.errors);
      }
      if (this.requiredVersion)
      {
        buffer.push("requiredVersion=" + this.requiredVersion);
      }
      if (this.alternativeLocations)
      {
        buffer.push("alternativeLocations=" + this.alternativeLocations);
      }
    }
  };
  return exports;
})();
require.scopes["filterStorage"] = (function()
{
  var exports = {};
  var IO = require("io").IO;
  var Prefs = require("prefs").Prefs;
  var _tempVar7 = require("filterClasses");
  var Filter = _tempVar7.Filter;
  var ActiveFilter = _tempVar7.ActiveFilter;
  var _tempVar8 = require("subscriptionClasses");
  var Subscription = _tempVar8.Subscription;
  var SpecialSubscription = _tempVar8.SpecialSubscription;
  var ExternalSubscription = _tempVar8.ExternalSubscription;
  var FilterNotifier = require("filterNotifier").FilterNotifier;
  var formatVersion = 4;
  var FilterStorage = exports.FilterStorage =
  {
    get formatVersion()
    {
      return formatVersion;
    },
    get sourceFile()
    {
      var file = null;
      if (Prefs.patternsfile)
      {
        file = IO.resolveFilePath(Prefs.patternsfile);
      }
      if (!file)
      {
        file = IO.resolveFilePath(Prefs.data_directory);
        if (file)
        {
          file.append("patterns.ini");
        }
      }
      if (!file)
      {
        try
        {
          file = IO.resolveFilePath(Services.prefs.getDefaultBranch("extensions.adblockplus.").getCharPref("data_directory"));
          if (file)
          {
            file.append("patterns.ini");
          }
        }
        catch (e){}
      }
      if (!file)
      {
        Cu.reportError("Adblock Plus: Failed to resolve filter file location from extensions.adblockplus.patternsfile preference");
      }
      this.__defineGetter__("sourceFile", function()
      {
        return file;
      });
      return this.sourceFile;
    },
    fileProperties:
    {
      __proto__: null
    },
    subscriptions: [],
    knownSubscriptions:
    {
      __proto__: null
    },
    getGroupForFilter: function(filter)
    {
      var generalSubscription = null;
      for (var _loopIndex9 = 0; _loopIndex9 < FilterStorage.subscriptions.length; ++_loopIndex9)
      {
        var subscription = FilterStorage.subscriptions[_loopIndex9];
        if (subscription instanceof SpecialSubscription && !subscription.disabled)
        {
          if (subscription.isDefaultFor(filter))
          {
            return subscription;
          }
          if (!generalSubscription && (!subscription.defaults || !subscription.defaults.length))
          {
            generalSubscription = subscription;
          }
        }
      }
      return generalSubscription;
    },
    addSubscription: function(subscription, silent)
    {
      if (subscription.url in FilterStorage.knownSubscriptions)
      {
        return;
      }
      FilterStorage.subscriptions.push(subscription);
      FilterStorage.knownSubscriptions[subscription.url] = subscription;
      addSubscriptionFilters(subscription);
      if (!silent)
      {
        FilterNotifier.triggerListeners("subscription.added", subscription);
      }
    },
    removeSubscription: function(subscription, silent)
    {
      for (var i = 0; i < FilterStorage.subscriptions.length; i++)
      {
        if (FilterStorage.subscriptions[i].url == subscription.url)
        {
          removeSubscriptionFilters(subscription);
          FilterStorage.subscriptions.splice(i--, 1);
          delete FilterStorage.knownSubscriptions[subscription.url];
          if (!silent)
          {
            FilterNotifier.triggerListeners("subscription.removed", subscription);
          }
          return;
        }
      }
    },
    moveSubscription: function(subscription, insertBefore)
    {
      var currentPos = FilterStorage.subscriptions.indexOf(subscription);
      if (currentPos < 0)
      {
        return;
      }
      var newPos = insertBefore ? FilterStorage.subscriptions.indexOf(insertBefore) : -1;
      if (newPos < 0)
      {
        newPos = FilterStorage.subscriptions.length;
      }
      if (currentPos < newPos)
      {
        newPos--;
      }
      if (currentPos == newPos)
      {
        return;
      }
      FilterStorage.subscriptions.splice(currentPos, 1);
      FilterStorage.subscriptions.splice(newPos, 0, subscription);
      FilterNotifier.triggerListeners("subscription.moved", subscription);
    },
    updateSubscriptionFilters: function(subscription, filters)
    {
      removeSubscriptionFilters(subscription);
      subscription.oldFilters = subscription.filters;
      subscription.filters = filters;
      addSubscriptionFilters(subscription);
      FilterNotifier.triggerListeners("subscription.updated", subscription);
      delete subscription.oldFilters;
    },
    addFilter: function(filter, subscription, position, silent)
    {
      if (!subscription)
      {
        if (filter.subscriptions.some(function(s)
        {
          return s instanceof SpecialSubscription && !s.disabled;
        }))
        {
          return;
        }
        subscription = FilterStorage.getGroupForFilter(filter);
      }
      if (!subscription)
      {
        subscription = SpecialSubscription.createForFilter(filter);
        this.addSubscription(subscription);
        return;
      }
      if (typeof position == "undefined")
      {
        position = subscription.filters.length;
      }
      if (filter.subscriptions.indexOf(subscription) < 0)
      {
        filter.subscriptions.push(subscription);
      }
      subscription.filters.splice(position, 0, filter);
      if (!silent)
      {
        FilterNotifier.triggerListeners("filter.added", filter, subscription, position);
      }
    },
    removeFilter: function(filter, subscription, position)
    {
      var subscriptions = subscription ? [subscription] : filter.subscriptions.slice();
      for (var i = 0; i < subscriptions.length; i++)
      {
        var subscription = subscriptions[i];
        if (subscription instanceof SpecialSubscription)
        {
          var positions = [];
          if (typeof position == "undefined")
          {
            var index = -1;
            do
            {
              index = subscription.filters.indexOf(filter, index + 1);
              if (index >= 0)
              {
                positions.push(index);
              }
            }
            while (index >= 0);
          }
          else
          {
            positions.push(position);
          }
          for (var j = positions.length - 1; j >= 0; j--)
          {
            var position = positions[j];
            if (subscription.filters[position] == filter)
            {
              subscription.filters.splice(position, 1);
              if (subscription.filters.indexOf(filter) < 0)
              {
                var index = filter.subscriptions.indexOf(subscription);
                if (index >= 0)
                {
                  filter.subscriptions.splice(index, 1);
                }
              }
              FilterNotifier.triggerListeners("filter.removed", filter, subscription, position);
            }
          }
        }
      }
    },
    moveFilter: function(filter, subscription, oldPosition, newPosition)
    {
      if (!(subscription instanceof SpecialSubscription) || subscription.filters[oldPosition] != filter)
      {
        return;
      }
      newPosition = Math.min(Math.max(newPosition, 0), subscription.filters.length - 1);
      if (oldPosition == newPosition)
      {
        return;
      }
      subscription.filters.splice(oldPosition, 1);
      subscription.filters.splice(newPosition, 0, filter);
      FilterNotifier.triggerListeners("filter.moved", filter, subscription, oldPosition, newPosition);
    },
    increaseHitCount: function(filter)
    {
      if (!Prefs.savestats || PrivateBrowsing.enabled || !(filter instanceof ActiveFilter))
      {
        return;
      }
      filter.hitCount++;
      filter.lastHit = Date.now();
    },
    resetHitCounts: function(filters)
    {
      if (!filters)
      {
        filters = [];
        for (var text in Filter.knownFilters)
        {
          filters.push(Filter.knownFilters[text]);
        }
      }
      for (var _loopIndex10 = 0; _loopIndex10 < filters.length; ++_loopIndex10)
      {
        var filter = filters[_loopIndex10];
        filter.hitCount = 0;
        filter.lastHit = 0;
      }
    },
    _loading: false,
    loadFromDisk: function(sourceFile)
    {
      if (this._loading)
      {
        return;
      }
      var readFile = function(sourceFile, backupIndex)
      {
        var parser = new INIParser();
        doneReading(parser);
        return;

        IO.readFromFile(sourceFile, true, parser, function(e)
        {
          if (!e && parser.subscriptions.length == 0)
          {
            e = new Error("No data in the file");
          }
          if (e)
          {
            Cu.reportError(e);
          }
          if (e && !explicitFile)
          {
            sourceFile = this.sourceFile;
            if (sourceFile)
            {
              var _tempVar11 = /^(.*)(\.\w+)$/.exec(sourceFile.leafName) || [null, sourceFile.leafName, ""];
              var part1 = _tempVar11[1];
              var part2 = _tempVar11[2];
              sourceFile = sourceFile.clone();
              sourceFile.leafName = part1 + "-backup" + ++backupIndex + part2;
              IO.statFile(sourceFile, function(e, statData)
              {
                if (!e && statData.exists)
                {
                  readFile(sourceFile, backupIndex);
                }
                else
                {
                  doneReading(parser);
                }
              });
              return;
            }
          }
          doneReading(parser);
        }.bind(this), "FilterStorageRead");
      }.bind(this);
      var doneReading = function(parser)
      {
        var specialMap =
        {
          "~il~": true,
          "~wl~": true,
          "~fl~": true,
          "~eh~": true
        };
        var knownSubscriptions =
        {
          __proto__: null
        };
        for (var i = 0; i < parser.subscriptions.length; i++)
        {
          var subscription = parser.subscriptions[i];
          if (subscription instanceof SpecialSubscription && subscription.filters.length == 0 && subscription.url in specialMap)
          {
            parser.subscriptions.splice(i--, 1);
          }
          else
          {
            knownSubscriptions[subscription.url] = subscription;
          }
        }
        this.fileProperties = parser.fileProperties;
        this.subscriptions = parser.subscriptions;
        this.knownSubscriptions = knownSubscriptions;
        Filter.knownFilters = parser.knownFilters;
        Subscription.knownSubscriptions = parser.knownSubscriptions;
        if (parser.userFilters)
        {
          for (var i = 0; i < parser.userFilters.length; i++)
          {
            var filter = Filter.fromText(parser.userFilters[i]);
            this.addFilter(filter, null, undefined, true);
          }
        }
        this._loading = false;
        FilterNotifier.triggerListeners("load");
        if (sourceFile != this.sourceFile)
        {
          this.saveToDisk();
        }
      }.bind(this);
      var startRead = function(file)
      {
        this._loading = true;
        readFile(file, 0);
      }.bind(this);
      var explicitFile;
      if (sourceFile)
      {
        explicitFile = true;
        startRead(sourceFile);
      }
      else
      {
        explicitFile = false;
        sourceFile = FilterStorage.sourceFile;
        var callback = function(e, statData)
        {
          if (e || !statData.exists)
          {
            var addonRoot = require("info").addonRoot;
            sourceFile = Services.io.newURI(addonRoot + "defaults/patterns.ini", null, null);
          }
          startRead(sourceFile);
        };
        if (sourceFile)
        {
          IO.statFile(sourceFile, callback);
        }
        else
        {
          callback(true);
        }
      }
    },
    _generateFilterData: function(subscriptions)
    {
      var _generatorResult12 = [];
      _generatorResult12.push("# Adblock Plus preferences");
      _generatorResult12.push("version=" + formatVersion);
      var saved =
      {
        __proto__: null
      };
      var buf = [];
      for (var i = 0; i < subscriptions.length; i++)
      {
        var subscription = subscriptions[i];
        for (var j = 0; j < subscription.filters.length; j++)
        {
          var filter = subscription.filters[j];
          if (!(filter.text in saved))
          {
            filter.serialize(buf);
            saved[filter.text] = filter;
            for (var k = 0; k < buf.length; k++)
            {
              _generatorResult12.push(buf[k]);
            }
            buf.splice(0);
          }
        }
      }
      for (var i = 0; i < subscriptions.length; i++)
      {
        var subscription = subscriptions[i];
        _generatorResult12.push("");
        subscription.serialize(buf);
        if (subscription.filters.length)
        {
          buf.push("", "[Subscription filters]");
          subscription.serializeFilters(buf);
        }
        for (var k = 0; k < buf.length; k++)
        {
          _generatorResult12.push(buf[k]);
        }
        buf.splice(0);
      }
      return _generatorResult12;
    },
    _saving: false,
    _needsSave: false,
    saveToDisk: function(targetFile)
    {
      var explicitFile = true;
      if (!targetFile)
      {
        targetFile = FilterStorage.sourceFile;
        explicitFile = false;
      }
      if (!targetFile)
      {
        return;
      }
      if (!explicitFile && this._saving)
      {
        this._needsSave = true;
        return;
      }
      try
      {
        targetFile.parent.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
      }
      catch (e){}
      var writeFilters = function()
      {
        IO.writeToFile(targetFile, true, this._generateFilterData(subscriptions), function(e)
        {
          /*if (!explicitFile)
          {
            this._saving = false;
          }
          if (e)
          {
            Cu.reportError(e);
          }
          if (!explicitFile && this._needsSave)
          {
            this._needsSave = false;
            this.saveToDisk();
          }
          else
          {
            FilterNotifier.triggerListeners("save");
          }*/
        }.bind(this), "FilterStorageWrite");
      }.bind(this);
      var checkBackupRequired = function(callbackNotRequired, callbackRequired)
      {
        if (explicitFile || Prefs.patternsbackups <= 0)
        {
          callbackNotRequired();
        }
        else
        {
          IO.statFile(targetFile, function(e, statData)
          {
            if (e || !statData.exists)
            {
              callbackNotRequired();
            }
            else
            {
              var _tempVar13 = /^(.*)(\.\w+)$/.exec(targetFile.leafName) || [null, targetFile.leafName, ""];
              var part1 = _tempVar13[1];
              var part2 = _tempVar13[2];
              var newestBackup = targetFile.clone();
              newestBackup.leafName = part1 + "-backup1" + part2;
              IO.statFile(newestBackup, function(e, statData)
              {
                if (!e && (!statData.exists || (Date.now() - statData.lastModified) / 3600000 >= Prefs.patternsbackupinterval))
                {
                  callbackRequired(part1, part2);
                }
                else
                {
                  callbackNotRequired();
                }
              });
            }
          });
        }
      }.bind(this);
      var removeLastBackup = function(part1, part2)
      {
        var file = targetFile.clone();
        file.leafName = part1 + "-backup" + Prefs.patternsbackups + part2;
        IO.removeFile(file, function(e)
        {
          return renameBackup(part1, part2, Prefs.patternsbackups - 1);
        });
      }.bind(this);
      var renameBackup = function(part1, part2, index)
      {
        if (index > 0)
        {
          var fromFile = targetFile.clone();
          fromFile.leafName = part1 + "-backup" + index + part2;
          var toName = part1 + "-backup" + (index + 1) + part2;
          IO.renameFile(fromFile, toName, function(e)
          {
            return renameBackup(part1, part2, index - 1);
          });
        }
        else
        {
          var toFile = targetFile.clone();
          toFile.leafName = part1 + "-backup" + (index + 1) + part2;
          IO.copyFile(targetFile, toFile, writeFilters);
        }
      }.bind(this);
      var subscriptions = this.subscriptions.filter(function(s)
      {
        return !(s instanceof ExternalSubscription);
      });
      if (!explicitFile)
      {
        this._saving = true;
      }
      checkBackupRequired(writeFilters, removeLastBackup);
    },
    getBackupFiles: function()
    {
      var result = [];
      var _tempVar14 = /^(.*)(\.\w+)$/.exec(FilterStorage.sourceFile.leafName) || [null, FilterStorage.sourceFile.leafName, ""];
      var part1 = _tempVar14[1];
      var part2 = _tempVar14[2];
      for (var i = 1;; i++)
      {
        var file = FilterStorage.sourceFile.clone();
        file.leafName = part1 + "-backup" + i + part2;
        if (file.exists())
        {
          result.push(file);
        }
        else
        {
          break;
        }
      }
      return result;
    }
  };

  function addSubscriptionFilters(subscription)
  {
    if (!(subscription.url in FilterStorage.knownSubscriptions))
    {
      return;
    }
    for (var _loopIndex15 = 0; _loopIndex15 < subscription.filters.length; ++_loopIndex15)
    {
      var filter = subscription.filters[_loopIndex15];
      filter.subscriptions.push(subscription);
    }
  }

  function removeSubscriptionFilters(subscription)
  {
    if (!(subscription.url in FilterStorage.knownSubscriptions))
    {
      return;
    }
    for (var _loopIndex16 = 0; _loopIndex16 < subscription.filters.length; ++_loopIndex16)
    {
      var filter = subscription.filters[_loopIndex16];
      var i = filter.subscriptions.indexOf(subscription);
      if (i >= 0)
      {
        filter.subscriptions.splice(i, 1);
      }
    }
  }
  var PrivateBrowsing = exports.PrivateBrowsing =
  {
    enabled: false,
    init: function()
    {
      if ("@mozilla.org/privatebrowsing;1" in Cc)
      {
        try
        {
          this.enabled = Cc["@mozilla.org/privatebrowsing;1"].getService(Ci.nsIPrivateBrowsingService).privateBrowsingEnabled;
          Services.obs.addObserver(this, "private-browsing", true);
          onShutdown.add(function()
          {
            Services.obs.removeObserver(this, "private-browsing");
          }.bind(this));
        }
        catch (e)
        {
          Cu.reportError(e);
        }
      }
    },
    observe: function(subject, topic, data)
    {
      if (topic == "private-browsing")
      {
        if (data == "enter")
        {
          this.enabled = true;
        }
        else if (data == "exit")
        {
          this.enabled = false;
        }
      }
    },
    QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference, Ci.nsIObserver])
  };
  PrivateBrowsing.init();

  function INIParser()
  {
    this.fileProperties = this.curObj = {};
    this.subscriptions = [];
    this.knownFilters =
    {
      __proto__: null
    };
    this.knownSubscriptions =
    {
      __proto__: null
    };
  }
  INIParser.prototype =
  {
    subscriptions: null,
    knownFilters: null,
    knownSubscrptions: null,
    wantObj: true,
    fileProperties: null,
    curObj: null,
    curSection: null,
    userFilters: null,
    process: function(val)
    {
      var origKnownFilters = Filter.knownFilters;
      Filter.knownFilters = this.knownFilters;
      var origKnownSubscriptions = Subscription.knownSubscriptions;
      Subscription.knownSubscriptions = this.knownSubscriptions;
      var match;
      try
      {
        if (this.wantObj === true && (match = /^(\w+)=(.*)$/.exec(val)))
        {
          this.curObj[match[1]] = match[2];
        }
        else if (val === null || (match = /^\s*\[(.+)\]\s*$/.exec(val)))
        {
          if (this.curObj)
          {
            switch (this.curSection)
            {
            case "filter":
            case "pattern":
              if ("text" in this.curObj)
              {
                Filter.fromObject(this.curObj);
              }
              break;
            case "subscription":
              var subscription = Subscription.fromObject(this.curObj);
              if (subscription)
              {
                this.subscriptions.push(subscription);
              }
              break;
            case "subscription filters":
            case "subscription patterns":
              if (this.subscriptions.length)
              {
                var subscription = this.subscriptions[this.subscriptions.length - 1];
                for (var _loopIndex17 = 0; _loopIndex17 < this.curObj.length; ++_loopIndex17)
                {
                  var text = this.curObj[_loopIndex17];
                  var filter = Filter.fromText(text);
                  subscription.filters.push(filter);
                  filter.subscriptions.push(subscription);
                }
              }
              break;
            case "user patterns":
              this.userFilters = this.curObj;
              break;
            }
          }
          if (val === null)
          {
            return;
          }
          this.curSection = match[1].toLowerCase();
          switch (this.curSection)
          {
          case "filter":
          case "pattern":
          case "subscription":
            this.wantObj = true;
            this.curObj = {};
            break;
          case "subscription filters":
          case "subscription patterns":
          case "user patterns":
            this.wantObj = false;
            this.curObj = [];
            break;
          default:
            this.wantObj = undefined;
            this.curObj = null;
          }
        }
        else if (this.wantObj === false && val)
        {
          this.curObj.push(val.replace(/\\\[/g, "["));
        }
      }
      finally
      {
        Filter.knownFilters = origKnownFilters;
        Subscription.knownSubscriptions = origKnownSubscriptions;
      }
    }
  };
  return exports;
})();
require.scopes["elemHide"] = (function()
{
  var exports = {};
  var Utils = require("utils").Utils;
  var IO = require("io").IO;
  var Prefs = require("prefs").Prefs;
  var ElemHideException = require("filterClasses").ElemHideException;
  var FilterNotifier = require("filterNotifier").FilterNotifier;
  var AboutHandler = require("elemHideHitRegistration").AboutHandler;
  var filterByKey =
  {
    __proto__: null
  };
  var keyByFilter =
  {
    __proto__: null
  };
  var knownExceptions =
  {
    __proto__: null
  };
  var exceptions =
  {
    __proto__: null
  };
  var styleURL = null;
  var ElemHide = exports.ElemHide =
  {
    isDirty: false,
    applied: false,
    init: function()
    {
      Prefs.addListener(function(name)
      {
        if (name == "enabled")
        {
          ElemHide.apply();
        }
      });
      onShutdown.add(function()
      {
        ElemHide.unapply();
      });
      var styleFile = IO.resolveFilePath(Prefs.data_directory);
      styleFile.append("elemhide.css");
      styleURL = Services.io.newFileURI(styleFile).QueryInterface(Ci.nsIFileURL);
    },
    clear: function()
    {
      filterByKey =
      {
        __proto__: null
      };
      keyByFilter =
      {
        __proto__: null
      };
      knownExceptions =
      {
        __proto__: null
      };
      exceptions =
      {
        __proto__: null
      };
      ElemHide.isDirty = false;
      ElemHide.unapply();
    },
    add: function(filter)
    {
      if (filter instanceof ElemHideException)
      {
        if (filter.text in knownExceptions)
        {
          return;
        }
        var selector = filter.selector;
        if (!(selector in exceptions))
        {
          exceptions[selector] = [];
        }
        exceptions[selector].push(filter);
        knownExceptions[filter.text] = true;
      }
      else
      {
        if (filter.text in keyByFilter)
        {
          return;
        }
        var key;
        do
        {
          key = Math.random().toFixed(15).substr(5);
        }
        while (key in filterByKey);
        filterByKey[key] = filter;
        keyByFilter[filter.text] = key;
        ElemHide.isDirty = true;
      }
    },
    remove: function(filter)
    {
      if (filter instanceof ElemHideException)
      {
        if (!(filter.text in knownExceptions))
        {
          return;
        }
        var list = exceptions[filter.selector];
        var index = list.indexOf(filter);
        if (index >= 0)
        {
          list.splice(index, 1);
        }
        delete knownExceptions[filter.text];
      }
      else
      {
        if (!(filter.text in keyByFilter))
        {
          return;
        }
        var key = keyByFilter[filter.text];
        delete filterByKey[key];
        delete keyByFilter[filter.text];
        ElemHide.isDirty = true;
      }
    },
    getException: function(filter, docDomain)
    {
      var selector = filter.selector;
      if (!(filter.selector in exceptions))
      {
        return null;
      }
      var list = exceptions[filter.selector];
      for (var i = list.length - 1; i >= 0; i--)
      {
        if (list[i].isActiveOnDomain(docDomain))
        {
          return list[i];
        }
      }
      return null;
    },
    _applying: false,
    _needsApply: false,
    apply: function()
    {
      if (this._applying)
      {
        this._needsApply = true;
        return;
      }
      if (!ElemHide.isDirty || !Prefs.enabled)
      {
        if (Prefs.enabled && !ElemHide.applied)
        {
          try
          {
            Utils.styleService.loadAndRegisterSheet(styleURL, Ci.nsIStyleSheetService.USER_SHEET);
            ElemHide.applied = true;
          }
          catch (e)
          {
            Cu.reportError(e);
          }
        }
        else if (!Prefs.enabled && ElemHide.applied)
        {
          ElemHide.unapply();
        }
        return;
      }
      IO.writeToFile(styleURL.file, false, this._generateCSSContent(), function(e)
      {
        this._applying = false;
        if (e && e.result == Cr.NS_ERROR_NOT_AVAILABLE)
        {
          IO.removeFile(styleURL.file, function(e2){});
        }
        else if (e)
        {
          Cu.reportError(e);
        }
        if (this._needsApply)
        {
          this._needsApply = false;
          this.apply();
        }
        else if (!e || e.result == Cr.NS_ERROR_NOT_AVAILABLE)
        {
          ElemHide.isDirty = false;
          ElemHide.unapply();
          if (!e)
          {
            try
            {
              Utils.styleService.loadAndRegisterSheet(styleURL, Ci.nsIStyleSheetService.USER_SHEET);
              ElemHide.applied = true;
            }
            catch (e)
            {
              Cu.reportError(e);
            }
          }
          FilterNotifier.triggerListeners("elemhideupdate");
        }
      }.bind(this), "ElemHideWrite");
      this._applying = true;
    },
    _generateCSSContent: function()
    {
      var _generatorResult12 = [];
      var domains =
      {
        __proto__: null
      };
      var hasFilters = false;
      for (var key in filterByKey)
      {
        var filter = filterByKey[key];
        var domain = filter.selectorDomain || "";
        var list;
        if (domain in domains)
        {
          list = domains[domain];
        }
        else
        {
          list =
          {
            __proto__: null
          };
          domains[domain] = list;
        }
        list[filter.selector] = key;
        hasFilters = true;
      }
      if (!hasFilters)
      {
        throw Cr.NS_ERROR_NOT_AVAILABLE;
      }

      function escapeChar(match)
      {
        return "\\" + match.charCodeAt(0).toString(16) + " ";
      }
      var cssTemplate = "-moz-binding: url(about:" + AboutHandler.aboutPrefix + "?%ID%#dummy) !important;";
      for (var domain in domains)
      {
        var rules = [];
        var list = domains[domain];
        if (domain)
        {
          _generatorResult12.push(("@-moz-document domain(\"" + domain.split(",").join("\"),domain(\"") + "\"){").replace(/[^\x01-\x7F]/g, escapeChar));
        }
        else
        {
          _generatorResult12.push("@-moz-document url-prefix(\"http://\"),url-prefix(\"https://\")," + "url-prefix(\"mailbox://\"),url-prefix(\"imap://\")," + "url-prefix(\"news://\"),url-prefix(\"snews://\"){");
        }
        for (var selector in list)
        {
          _generatorResult12.push(selector.replace(/[^\x01-\x7F]/g, escapeChar) + "{" + cssTemplate.replace("%ID%", list[selector]) + "}");
        }
        _generatorResult12.push("}");
      }
      return _generatorResult12;
    },
    unapply: function()
    {
      if (ElemHide.applied)
      {
        try
        {
          Utils.styleService.unregisterSheet(styleURL, Ci.nsIStyleSheetService.USER_SHEET);
        }
        catch (e)
        {
          Cu.reportError(e);
        }
        ElemHide.applied = false;
      }
    },
    get styleURL()
    {
      return ElemHide.applied ? styleURL.spec : null;
    },
    getFilterByKey: function(key)
    {
      return key in filterByKey ? filterByKey[key] : null;
    },
    getSelectorsForDomain: function(domain, specificOnly)
    {
      var result = [];
      for (var key in filterByKey)
      {
        var filter = filterByKey[key];
        if (specificOnly && (!filter.domains || filter.domains[""]))
        {
          continue;
        }
        if (filter.isActiveOnDomain(domain) && !this.getException(filter, domain))
        {
          result.push(filter.selector);
        }
      }
      return result;
    }
  };
  return exports;
})();
require.scopes["matcher"] = (function()
{
  var exports = {};
  var _tempVar18 = require("filterClasses");
  var Filter = _tempVar18.Filter;
  var RegExpFilter = _tempVar18.RegExpFilter;
  var WhitelistFilter = _tempVar18.WhitelistFilter;

  function Matcher()
  {
    this.clear();
  }
  exports.Matcher = Matcher;
  Matcher.prototype =
  {
    filterByKeyword: null,
    keywordByFilter: null,
    clear: function()
    {
      this.filterByKeyword =
      {
        __proto__: null
      };
      this.keywordByFilter =
      {
        __proto__: null
      };
    },
    add: function(filter)
    {
      if (filter.text in this.keywordByFilter)
      {
        return;
      }
      var keyword = this.findKeyword(filter);
      var oldEntry = this.filterByKeyword[keyword];
      if (typeof oldEntry == "undefined")
      {
        this.filterByKeyword[keyword] = filter;
      }
      else if (oldEntry.length == 1)
      {
        this.filterByKeyword[keyword] = [oldEntry, filter];
      }
      else
      {
        oldEntry.push(filter);
      }
      this.keywordByFilter[filter.text] = keyword;
    },
    remove: function(filter)
    {
      if (!(filter.text in this.keywordByFilter))
      {
        return;
      }
      var keyword = this.keywordByFilter[filter.text];
      var list = this.filterByKeyword[keyword];
      if (list.length <= 1)
      {
        delete this.filterByKeyword[keyword];
      }
      else
      {
        var index = list.indexOf(filter);
        if (index >= 0)
        {
          list.splice(index, 1);
          if (list.length == 1)
          {
            this.filterByKeyword[keyword] = list[0];
          }
        }
      }
      delete this.keywordByFilter[filter.text];
    },
    findKeyword: function(filter)
    {
      var defaultResult = filter.contentType & RegExpFilter.typeMap.DONOTTRACK ? "donottrack" : "";
      var text = filter.text;
      if (Filter.regexpRegExp.test(text))
      {
        return defaultResult;
      }
      var match = Filter.optionsRegExp.exec(text);
      if (match)
      {
        text = match.input.substr(0, match.index);
      }
      if (text.substr(0, 2) == "@@")
      {
        text = text.substr(2);
      }
      var candidates = text.toLowerCase().match(/[^a-z0-9%*][a-z0-9%]{3,}(?=[^a-z0-9%*])/g);
      if (!candidates)
      {
        return defaultResult;
      }
      var hash = this.filterByKeyword;
      var result = defaultResult;
      var resultCount = 16777215;
      var resultLength = 0;
      for (var i = 0, l = candidates.length; i < l; i++)
      {
        var candidate = candidates[i].substr(1);
        var count = candidate in hash ? hash[candidate].length : 0;
        if (count < resultCount || count == resultCount && candidate.length > resultLength)
        {
          result = candidate;
          resultCount = count;
          resultLength = candidate.length;
        }
      }
      return result;
    },
    hasFilter: function(filter)
    {
      return filter.text in this.keywordByFilter;
    },
    getKeywordForFilter: function(filter)
    {
      if (filter.text in this.keywordByFilter)
      {
        return this.keywordByFilter[filter.text];
      }
      else
      {
        return null;
      }
    },
    _checkEntryMatch: function(keyword, location, contentType, docDomain, thirdParty)
    {
      var list = this.filterByKeyword[keyword];
      for (var i = 0; i < list.length; i++)
      {
        var filter = list[i];
        if (filter.matches(location, contentType, docDomain, thirdParty))
        {
          return filter;
        }
      }
      return null;
    },
    matchesAny: function(location, contentType, docDomain, thirdParty)
    {
      var candidates = location.toLowerCase().match(/[a-z0-9%]{3,}/g);
      if (candidates === null)
      {
        candidates = [];
      }
      if (contentType == "DONOTTRACK")
      {
        candidates.unshift("donottrack");
      }
      else
      {
        candidates.push("");
      }
      for (var i = 0, l = candidates.length; i < l; i++)
      {
        var substr = candidates[i];
        if (substr in this.filterByKeyword)
        {
          var result = this._checkEntryMatch(substr, location, contentType, docDomain, thirdParty);
          if (result)
          {
            return result;
          }
        }
      }
      return null;
    }
  };

  function CombinedMatcher()
  {
    this.blacklist = new Matcher();
    this.whitelist = new Matcher();
    this.keys =
    {
      __proto__: null
    };
    this.resultCache =
    {
      __proto__: null
    };
  }
  exports.CombinedMatcher = CombinedMatcher;
  CombinedMatcher.maxCacheEntries = 1000;
  CombinedMatcher.prototype =
  {
    blacklist: null,
    whitelist: null,
    keys: null,
    resultCache: null,
    cacheEntries: 0,
    clear: function()
    {
      this.blacklist.clear();
      this.whitelist.clear();
      this.keys =
      {
        __proto__: null
      };
      this.resultCache =
      {
        __proto__: null
      };
      this.cacheEntries = 0;
    },
    add: function(filter)
    {
      if (filter instanceof WhitelistFilter)
      {
        if (filter.siteKeys)
        {
          for (var i = 0; i < filter.siteKeys.length; i++)
          {
            this.keys[filter.siteKeys[i]] = filter.text;
          }
        }
        else
        {
          this.whitelist.add(filter);
        }
      }
      else
      {
        this.blacklist.add(filter);
      }
      if (this.cacheEntries > 0)
      {
        this.resultCache =
        {
          __proto__: null
        };
        this.cacheEntries = 0;
      }
    },
    remove: function(filter)
    {
      if (filter instanceof WhitelistFilter)
      {
        if (filter.siteKeys)
        {
          for (var i = 0; i < filter.siteKeys.length; i++)
          {
            delete this.keys[filter.siteKeys[i]];
          }
        }
        else
        {
          this.whitelist.remove(filter);
        }
      }
      else
      {
        this.blacklist.remove(filter);
      }
      if (this.cacheEntries > 0)
      {
        this.resultCache =
        {
          __proto__: null
        };
        this.cacheEntries = 0;
      }
    },
    findKeyword: function(filter)
    {
      if (filter instanceof WhitelistFilter)
      {
        return this.whitelist.findKeyword(filter);
      }
      else
      {
        return this.blacklist.findKeyword(filter);
      }
    },
    hasFilter: function(filter)
    {
      if (filter instanceof WhitelistFilter)
      {
        return this.whitelist.hasFilter(filter);
      }
      else
      {
        return this.blacklist.hasFilter(filter);
      }
    },
    getKeywordForFilter: function(filter)
    {
      if (filter instanceof WhitelistFilter)
      {
        return this.whitelist.getKeywordForFilter(filter);
      }
      else
      {
        return this.blacklist.getKeywordForFilter(filter);
      }
    },
    isSlowFilter: function(filter)
    {
      var matcher = filter instanceof WhitelistFilter ? this.whitelist : this.blacklist;
      if (matcher.hasFilter(filter))
      {
        return !matcher.getKeywordForFilter(filter);
      }
      else
      {
        return !matcher.findKeyword(filter);
      }
    },
    matchesAnyInternal: function(location, contentType, docDomain, thirdParty)
    {
      var candidates = location.toLowerCase().match(/[a-z0-9%]{3,}/g);
      if (candidates === null)
      {
        candidates = [];
      }
      if (contentType == "DONOTTRACK")
      {
        candidates.unshift("donottrack");
      }
      else
      {
        candidates.push("");
      }
      var blacklistHit = null;
      for (var i = 0, l = candidates.length; i < l; i++)
      {
        var substr = candidates[i];
        if (substr in this.whitelist.filterByKeyword)
        {
          var result = this.whitelist._checkEntryMatch(substr, location, contentType, docDomain, thirdParty);
          if (result)
          {
            return result;
          }
        }
        if (substr in this.blacklist.filterByKeyword && blacklistHit === null)
        {
          blacklistHit = this.blacklist._checkEntryMatch(substr, location, contentType, docDomain, thirdParty);
        }
      }
      return blacklistHit;
    },
    matchesAny: function(location, contentType, docDomain, thirdParty)
    {
      var key = location + " " + contentType + " " + docDomain + " " + thirdParty;
      if (key in this.resultCache)
      {
        return this.resultCache[key];
      }
      var result = this.matchesAnyInternal(location, contentType, docDomain, thirdParty);
      if (this.cacheEntries >= CombinedMatcher.maxCacheEntries)
      {
        this.resultCache =
        {
          __proto__: null
        };
        this.cacheEntries = 0;
      }
      this.resultCache[key] = result;
      this.cacheEntries++;
      return result;
    },
    matchesByKey: function(location, key, docDomain)
    {
      key = key.toUpperCase();
      if (key in this.keys)
      {
        var filter = Filter.knownFilters[this.keys[key]];
        if (filter && filter.matches(location, "DOCUMENT", docDomain, false))
        {
          return filter;
        }
        else
        {
          return null;
        }
      }
      else
      {
        return null;
      }
    }
  };
  var defaultMatcher = exports.defaultMatcher = new CombinedMatcher();
  return exports;
})();
require.scopes["filterListener"] = (function()
{
  var exports = {};
  var FilterStorage = require("filterStorage").FilterStorage;
  var FilterNotifier = require("filterNotifier").FilterNotifier;
  var ElemHide = require("elemHide").ElemHide;
  var defaultMatcher = require("matcher").defaultMatcher;
  var _tempVar19 = require("filterClasses");
  var ActiveFilter = _tempVar19.ActiveFilter;
  var RegExpFilter = _tempVar19.RegExpFilter;
  var ElemHideBase = _tempVar19.ElemHideBase;
  var Prefs = require("prefs").Prefs;
  var batchMode = false;
  var isDirty = 0;
  var FilterListener = exports.FilterListener =
  {
    get batchMode()
    {
      return batchMode;
    },
    set batchMode(value)
    {
      batchMode = value;
      flushElemHide();
    },
    setDirty: function(factor)
    {
      if (factor == 0 && isDirty > 0)
      {
        isDirty = 1;
      }
      else
      {
        isDirty += factor;
      }
      if (isDirty >= 1)
      {
        FilterStorage.saveToDisk();
      }
    }
  };
  var HistoryPurgeObserver =
  {
    observe: function(subject, topic, data)
    {
      if (topic == "browser:purge-session-history" && Prefs.clearStatsOnHistoryPurge)
      {
        FilterStorage.resetHitCounts();
        FilterListener.setDirty(0);
        Prefs.recentReports = [];
      }
    },
    QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference, Ci.nsIObserver])
  };

  function init()
  {
    FilterNotifier.addListener(function(action, item, newValue, oldValue)
    {
      var match = /^(\w+)\.(.*)/.exec(action);
      if (match && match[1] == "filter")
      {
        onFilterChange(match[2], item, newValue, oldValue);
      }
      else if (match && match[1] == "subscription")
      {
        onSubscriptionChange(match[2], item, newValue, oldValue);
      }
      else
      {
        onGenericChange(action, item);
      }
    });
    var application = require("info").application;
    if (application == "chrome")
    {
      flushElemHide = function(){};
    }
    else
    {
      ElemHide.init();
    }
    FilterStorage.loadFromDisk();
    Services.obs.addObserver(HistoryPurgeObserver, "browser:purge-session-history", true);
    onShutdown.add(function()
    {
      Services.obs.removeObserver(HistoryPurgeObserver, "browser:purge-session-history");
    });
  }
  init();

  function flushElemHide()
  {
    if (!batchMode && ElemHide.isDirty)
    {
      ElemHide.apply();
    }
  }

  function addFilter(filter)
  {
    if (!(filter instanceof ActiveFilter) || filter.disabled)
    {
      return;
    }
    var hasEnabled = false;
    for (var i = 0; i < filter.subscriptions.length; i++)
    {
      if (!filter.subscriptions[i].disabled)
      {
        hasEnabled = true;
      }
    }
    if (!hasEnabled)
    {
      return;
    }
    if (filter instanceof RegExpFilter)
    {
      defaultMatcher.add(filter);
    }
    else if (filter instanceof ElemHideBase)
    {
      ElemHide.add(filter);
    }
  }

  function removeFilter(filter)
  {
    if (!(filter instanceof ActiveFilter))
    {
      return;
    }
    if (!filter.disabled)
    {
      var hasEnabled = false;
      for (var i = 0; i < filter.subscriptions.length; i++)
      {
        if (!filter.subscriptions[i].disabled)
        {
          hasEnabled = true;
        }
      }
      if (hasEnabled)
      {
        return;
      }
    }
    if (filter instanceof RegExpFilter)
    {
      defaultMatcher.remove(filter);
    }
    else if (filter instanceof ElemHideBase)
    {
      ElemHide.remove(filter);
    }
  }

  function onSubscriptionChange(action, subscription, newValue, oldValue)
  {
    FilterListener.setDirty(1);
    if (action != "added" && action != "removed" && action != "disabled" && action != "updated")
    {
      return;
    }
    if (action != "removed" && !(subscription.url in FilterStorage.knownSubscriptions))
    {
      return;
    }
    if ((action == "added" || action == "removed" || action == "updated") && subscription.disabled)
    {
      return;
    }
    if (action == "added" || action == "removed" || action == "disabled")
    {
      var method = action == "added" || action == "disabled" && newValue == false ? addFilter : removeFilter;
      if (subscription.filters)
      {
        subscription.filters.forEach(method);
      }
    }
    else if (action == "updated")
    {
      subscription.oldFilters.forEach(removeFilter);
      subscription.filters.forEach(addFilter);
    }
    flushElemHide();
  }

  function onFilterChange(action, filter, newValue, oldValue)
  {
    if (action == "hitCount" || action == "lastHit")
    {
      FilterListener.setDirty(0.002);
    }
    else
    {
      FilterListener.setDirty(1);
    }
    if (action != "added" && action != "removed" && action != "disabled")
    {
      return;
    }
    if ((action == "added" || action == "removed") && filter.disabled)
    {
      return;
    }
    if (action == "added" || action == "disabled" && newValue == false)
    {
      addFilter(filter);
    }
    else
    {
      removeFilter(filter);
    }
    flushElemHide();
  }

  function onGenericChange(action)
  {
    if (action == "load")
    {
      isDirty = 0;
      defaultMatcher.clear();
      ElemHide.clear();
      for (var _loopIndex20 = 0; _loopIndex20 < FilterStorage.subscriptions.length; ++_loopIndex20)
      {
        var subscription = FilterStorage.subscriptions[_loopIndex20];
        if (!subscription.disabled)
        {
          subscription.filters.forEach(addFilter);
        }
      }
      flushElemHide();
    }
    else if (action == "save")
    {
      isDirty = 0;
    }
  }
  return exports;
})();
require.scopes["synchronizer"] = (function()
{
  var exports = {};
  var Utils = require("utils").Utils;
  var FilterStorage = require("filterStorage").FilterStorage;
  var FilterNotifier = require("filterNotifier").FilterNotifier;
  var Prefs = require("prefs").Prefs;
  var _tempVar21 = require("filterClasses");
  var Filter = _tempVar21.Filter;
  var CommentFilter = _tempVar21.CommentFilter;
  var _tempVar22 = require("subscriptionClasses");
  var Subscription = _tempVar22.Subscription;
  var DownloadableSubscription = _tempVar22.DownloadableSubscription;
  var MILLISECONDS_IN_SECOND = 1000;
  var SECONDS_IN_MINUTE = 60;
  var SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
  var SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
  var INITIAL_DELAY = 6 * SECONDS_IN_MINUTE;
  var CHECK_INTERVAL = SECONDS_IN_HOUR;
  var MIN_EXPIRATION_INTERVAL = 1 * SECONDS_IN_DAY;
  var MAX_EXPIRATION_INTERVAL = 14 * SECONDS_IN_DAY;
  var MAX_ABSENSE_INTERVAL = 1 * SECONDS_IN_DAY;
  var timer = null;
  var executing =
  {
    __proto__: null
  };
  var Synchronizer = exports.Synchronizer =
  {
    init: function()
    {
      var callback = function()
      {
        timer.delay = CHECK_INTERVAL * MILLISECONDS_IN_SECOND;
        checkSubscriptions();
      };
      timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
      timer.initWithCallback(callback, INITIAL_DELAY * MILLISECONDS_IN_SECOND, Ci.nsITimer.TYPE_REPEATING_SLACK);
      onShutdown.add(function()
      {
        timer.cancel();
      });
    },
    isExecuting: function(url)
    {
      return url in executing;
    },
    execute: function(subscription, manual, forceDownload)
    {
      Utils.runAsync(this.executeInternal, this, subscription, manual, forceDownload);
    },
    executeInternal: function(subscription, manual, forceDownload)
    {
      var url = subscription.url;
      if (url in executing)
      {
        return;
      }
      var newURL = subscription.nextURL;
      var hadTemporaryRedirect = false;
      subscription.nextURL = null;
      var loadFrom = newURL;
      var isBaseLocation = true;
      if (!loadFrom)
      {
        loadFrom = url;
      }
      if (loadFrom == url)
      {
        if (subscription.alternativeLocations)
        {
          var options = [
            [1, url]
          ];
          var totalWeight = 1;
          for (var _loopIndex23 = 0; _loopIndex23 < subscription.alternativeLocations.split(",").length; ++_loopIndex23)
          {
            var alternative = subscription.alternativeLocations.split(",")[_loopIndex23];
            if (!/^https?:\/\//.test(alternative))
            {
              continue;
            }
            var weight = 1;
            var match = /;q=([\d\.]+)$/.exec(alternative);
            if (match)
            {
              weight = parseFloat(match[1]);
              if (isNaN(weight) || !isFinite(weight) || weight < 0)
              {
                weight = 1;
              }
              if (weight > 10)
              {
                weight = 10;
              }
              alternative = alternative.substr(0, match.index);
            }
            options.push([weight, alternative]);
            totalWeight += weight;
          }
          var choice = Math.random() * totalWeight;
          for (var _loopIndex24 = 0; _loopIndex24 < options.length; ++_loopIndex24)
          {
            var _tempVar25 = options[_loopIndex24];
            var weight = _tempVar25[0];
            var alternative = _tempVar25[1];
            choice -= weight;
            if (choice < 0)
            {
              loadFrom = alternative;
              break;
            }
          }
          isBaseLocation = loadFrom == url;
        }
      }
      else
      {
        forceDownload = true;
      }
      var addonVersion = require("info").addonVersion;
      loadFrom = loadFrom.replace(/%VERSION%/, "ABP" + addonVersion);
      var request = null;

      function errorCallback(error)
      {
        var channelStatus = -1;
        try
        {
          channelStatus = request.channel.status;
        }
        catch (e){}
        var responseStatus = "";
        try
        {
          responseStatus = request.channel.QueryInterface(Ci.nsIHttpChannel).responseStatus;
        }
        catch (e){}
        setError(subscription, error, channelStatus, responseStatus, loadFrom, isBaseLocation, manual);
      }
      try
      {
        request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
        request.mozBackgroundRequest = true;
        request.open("GET", loadFrom);
      }
      catch (e)
      {
        errorCallback("synchronize_invalid_url");
        return;
      }
      try
      {
        request.overrideMimeType("text/plain");
        request.channel.loadFlags = request.channel.loadFlags | request.channel.INHIBIT_CACHING | request.channel.VALIDATE_ALWAYS;
        if (request.channel instanceof Ci.nsIHttpChannel)
        {
          request.channel.redirectionLimit = 5;
        }
        var oldNotifications = request.channel.notificationCallbacks;
        var oldEventSink = null;
        request.channel.notificationCallbacks =
        {
          QueryInterface: XPCOMUtils.generateQI([Ci.nsIInterfaceRequestor, Ci.nsIChannelEventSink]),
          getInterface: function(iid)
          {
            if (iid.equals(Ci.nsIChannelEventSink))
            {
              try
              {
                oldEventSink = oldNotifications.QueryInterface(iid);
              }
              catch (e){}
              return this;
            }
            if (oldNotifications)
            {
              return oldNotifications.QueryInterface(iid);
            }
            else
            {
              throw Cr.NS_ERROR_NO_INTERFACE;
            }
          },
          asyncOnChannelRedirect: function(oldChannel, newChannel, flags, callback)
          {
            if (isBaseLocation && !hadTemporaryRedirect && oldChannel instanceof Ci.nsIHttpChannel)
            {
              try
              {
                subscription.alternativeLocations = oldChannel.getResponseHeader("X-Alternative-Locations");
              }
              catch (e)
              {
                subscription.alternativeLocations = null;
              }
            }
            if (flags & Ci.nsIChannelEventSink.REDIRECT_TEMPORARY)
            {
              hadTemporaryRedirect = true;
            }
            else if (!hadTemporaryRedirect)
            {
              newURL = newChannel.URI.spec;
            }
            if (oldEventSink)
            {
              oldEventSink.asyncOnChannelRedirect(oldChannel, newChannel, flags, callback);
            }
            else
            {
              callback.onRedirectVerifyCallback(Cr.NS_OK);
            }
          }
        };
      }
      catch (e)
      {
        Cu.reportError(e);
      }
      if (subscription.lastModified && !forceDownload)
      {
        request.setRequestHeader("If-Modified-Since", subscription.lastModified);
      }
      request.addEventListener("error", function(ev)
      {
        if (onShutdown.done)
        {
          return;
        }
        delete executing[url];
        try
        {
          request.channel.notificationCallbacks = null;
        }
        catch (e){}
        errorCallback("synchronize_connection_error");
      }, false);
      request.addEventListener("load", function(ev)
      {
        if (onShutdown.done)
        {
          return;
        }
        delete executing[url];
        try
        {
          request.channel.notificationCallbacks = null;
        }
        catch (e){}
        if (request.status && request.status != 200 && request.status != 304)
        {
          errorCallback("synchronize_connection_error");
          return;
        }
        var newFilters = null;
        if (request.status != 304)
        {
          newFilters = readFilters(subscription, request.responseText, errorCallback);
          if (!newFilters)
          {
            return;
          }
          subscription.lastModified = request.getResponseHeader("Last-Modified");
        }
        if (isBaseLocation && !hadTemporaryRedirect)
        {
          subscription.alternativeLocations = request.getResponseHeader("X-Alternative-Locations");
        }
        subscription.lastSuccess = subscription.lastDownload = Math.round(Date.now() / MILLISECONDS_IN_SECOND);
        subscription.downloadStatus = "synchronize_ok";
        subscription.errors = 0;
        var now = Math.round(((new Date(request.getResponseHeader("Date"))).getTime() || Date.now()) / MILLISECONDS_IN_SECOND);
        var expires = Math.round((new Date(request.getResponseHeader("Expires"))).getTime() / MILLISECONDS_IN_SECOND) || 0;
        var expirationInterval = expires ? expires - now : 0;
        for (var _loopIndex26 = 0; _loopIndex26 < (newFilters || subscription.filters).length; ++_loopIndex26)
        {
          var filter = (newFilters || subscription.filters)[_loopIndex26];
          if (!(filter instanceof CommentFilter))
          {
            continue;
          }
          var match = /\bExpires\s*(?::|after)\s*(\d+)\s*(h)?/i.exec(filter.text);
          if (match)
          {
            var interval = parseInt(match[1], 10);
            if (match[2])
            {
              interval *= SECONDS_IN_HOUR;
            }
            else
            {
              interval *= SECONDS_IN_DAY;
            }
            if (interval > expirationInterval)
            {
              expirationInterval = interval;
            }
          }
        }
        expirationInterval = Math.min(Math.max(expirationInterval, MIN_EXPIRATION_INTERVAL), MAX_EXPIRATION_INTERVAL);
        subscription.expires = subscription.lastDownload + expirationInterval * 2;
        subscription.softExpiration = subscription.lastDownload + Math.round(expirationInterval * (Math.random() * 0.4 + 0.8));
        if (newFilters)
        {
          var fixedTitle = false;
          for (var i = 0; i < newFilters.length; i++)
          {
            var filter = newFilters[i];
            if (!(filter instanceof CommentFilter))
            {
              continue;
            }
            var match = /^!\s*(\w+)\s*:\s*(.*)/.exec(filter.text);
            if (match)
            {
              var keyword = match[1].toLowerCase();
              var value = match[2];
              var known = true;
              if (keyword == "redirect")
              {
                if (isBaseLocation && value != url)
                {
                  subscription.nextURL = value;
                }
              }
              else if (keyword == "homepage")
              {
                var uri = Utils.makeURI(value);
                if (uri && (uri.scheme == "http" || uri.scheme == "https"))
                {
                  subscription.homepage = uri.spec;
                }
              }
              else if (keyword == "title")
              {
                if (value)
                {
                  subscription.title = value;
                  fixedTitle = true;
                }
              }
              else
              {
                known = false;
              }
              if (known)
              {
                newFilters.splice(i--, 1);
              }
            }
          }
          subscription.fixedTitle = fixedTitle;
        }
        if (isBaseLocation && newURL && newURL != url)
        {
          var listed = subscription.url in FilterStorage.knownSubscriptions;
          if (listed)
          {
            FilterStorage.removeSubscription(subscription);
          }
          url = newURL;
          var newSubscription = Subscription.fromURL(url);
          for (var key in newSubscription)
          {
            delete newSubscription[key];
          }
          for (var key in subscription)
          {
            newSubscription[key] = subscription[key];
          }
          delete Subscription.knownSubscriptions[subscription.url];
          newSubscription.oldSubscription = subscription;
          subscription = newSubscription;
          subscription.url = url;
          if (!(subscription.url in FilterStorage.knownSubscriptions) && listed)
          {
            FilterStorage.addSubscription(subscription);
          }
        }
        if (newFilters)
        {
          FilterStorage.updateSubscriptionFilters(subscription, newFilters);
        }
        delete subscription.oldSubscription;
      }, false);
      executing[url] = true;
      FilterNotifier.triggerListeners("subscription.downloadStatus", subscription);
      try
      {
        request.send(null);
      }
      catch (e)
      {
        delete executing[url];
        errorCallback("synchronize_connection_error");
        return;
      }
    }
  };
  Synchronizer.init();

  function checkSubscriptions()
  {
    if (!Prefs.subscriptions_autoupdate)
    {
      return;
    }
    var time = Math.round(Date.now() / MILLISECONDS_IN_SECOND);
    for (var _loopIndex27 = 0; _loopIndex27 < FilterStorage.subscriptions.length; ++_loopIndex27)
    {
      var subscription = FilterStorage.subscriptions[_loopIndex27];
      if (!(subscription instanceof DownloadableSubscription))
      {
        continue;
      }
      if (subscription.lastCheck && time - subscription.lastCheck > MAX_ABSENSE_INTERVAL)
      {
        subscription.softExpiration += time - subscription.lastCheck;
      }
      subscription.lastCheck = time;
      if (subscription.expires - time > MAX_EXPIRATION_INTERVAL)
      {
        subscription.expires = time + MAX_EXPIRATION_INTERVAL;
      }
      if (subscription.softExpiration - time > MAX_EXPIRATION_INTERVAL)
      {
        subscription.softExpiration = time + MAX_EXPIRATION_INTERVAL;
      }
      if (subscription.softExpiration > time && subscription.expires > time)
      {
        continue;
      }
      if (time - subscription.lastDownload >= MIN_EXPIRATION_INTERVAL)
      {
        Synchronizer.execute(subscription, false);
      }
    }
  }

  function readFilters(subscription, text, errorCallback)
  {
    var lines = text.split(/[\r\n]+/);
    var match = /\[Adblock(?:\s*Plus\s*([\d\.]+)?)?\]/i.exec(lines[0]);
    if (!match)
    {
      errorCallback("synchronize_invalid_data");
      return null;
    }
    var minVersion = match[1];
    for (var i = 0; i < lines.length; i++)
    {
      var match = /!\s*checksum[\s\-:]+([\w\+\/]+)/i.exec(lines[i]);
      if (match)
      {
        lines.splice(i, 1);
        var checksum = Utils.generateChecksum(lines);
        if (checksum && checksum != match[1])
        {
          errorCallback("synchronize_checksum_mismatch");
          return null;
        }
        break;
      }
    }
    delete subscription.requiredVersion;
    delete subscription.upgradeRequired;
    if (minVersion)
    {
      var addonVersion = require("info").addonVersion;
      subscription.requiredVersion = minVersion;
      if (Services.vc.compare(minVersion, addonVersion) > 0)
      {
        subscription.upgradeRequired = true;
      }
    }
    lines.shift();
    var result = [];
    for (var _loopIndex28 = 0; _loopIndex28 < lines.length; ++_loopIndex28)
    {
      var line = lines[_loopIndex28];
      line = Filter.normalize(line);
      if (line)
      {
        result.push(Filter.fromText(line));
      }
    }
    return result;
  }

  function setError(subscription, error, channelStatus, responseStatus, downloadURL, isBaseLocation, manual)
  {
    if (!isBaseLocation)
    {
      subscription.alternativeLocations = null;
    }
    try
    {
      Cu.reportError("Adblock Plus: Downloading filter subscription " + subscription.title + " failed (" + Utils.getString(error) + ")\n" + "Download address: " + downloadURL + "\n" + "Channel status: " + channelStatus + "\n" + "Server response: " + responseStatus);
    }
    catch (e){}
    subscription.lastDownload = Math.round(Date.now() / MILLISECONDS_IN_SECOND);
    subscription.downloadStatus = error;
    if (!manual)
    {
      if (error == "synchronize_checksum_mismatch")
      {
        subscription.errors = 0;
      }
      else
      {
        subscription.errors++;
      }
      if (subscription.errors >= Prefs.subscriptions_fallbackerrors && /^https?:\/\//i.test(subscription.url))
      {
        subscription.errors = 0;
        var fallbackURL = Prefs.subscriptions_fallbackurl;
        var addonVersion = require("info").addonVersion;
        fallbackURL = fallbackURL.replace(/%VERSION%/g, encodeURIComponent(addonVersion));
        fallbackURL = fallbackURL.replace(/%SUBSCRIPTION%/g, encodeURIComponent(subscription.url));
        fallbackURL = fallbackURL.replace(/%URL%/g, encodeURIComponent(downloadURL));
        fallbackURL = fallbackURL.replace(/%ERROR%/g, encodeURIComponent(error));
        fallbackURL = fallbackURL.replace(/%CHANNELSTATUS%/g, encodeURIComponent(channelStatus));
        fallbackURL = fallbackURL.replace(/%RESPONSESTATUS%/g, encodeURIComponent(responseStatus));
        var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
        request.mozBackgroundRequest = true;
        request.open("GET", fallbackURL);
        request.overrideMimeType("text/plain");
        request.channel.loadFlags = request.channel.loadFlags | request.channel.INHIBIT_CACHING | request.channel.VALIDATE_ALWAYS;
        request.addEventListener("load", function(ev)
        {
          if (onShutdown.done)
          {
            return;
          }
          if (!(subscription.url in FilterStorage.knownSubscriptions))
          {
            return;
          }
          var match = /^(\d+)(?:\s+(\S+))?$/.exec(request.responseText);
          if (match && match[1] == "301" && match[2])
          {
            subscription.nextURL = match[2];
          }
          else if (match && match[1] == "410")
          {
            var data = "[Adblock]\n" + subscription.filters.map(function(f)
            {
              return f.text;
            }).join("\n");
            var url = "data:text/plain," + encodeURIComponent(data);
            var newSubscription = Subscription.fromURL(url);
            newSubscription.title = subscription.title;
            newSubscription.disabled = subscription.disabled;
            FilterStorage.removeSubscription(subscription);
            FilterStorage.addSubscription(newSubscription);
            Synchronizer.execute(newSubscription);
          }
        }, false);
        request.send(null);
      }
    }
  }
  return exports;
})();

var publicSuffixes = {
    "0.bg": 1,
    "1.bg": 1,
    "2.bg": 1,
    "2000.hu": 1,
    "3.bg": 1,
    "4.bg": 1,
    "5.bg": 1,
    "6.bg": 1,
    "6bone.pl": 1,
    "7.bg": 1,
    "8.bg": 1,
    "9.bg": 1,
    "a.bg": 1,
    "a.se": 1,
    "aa.no": 1,
    "aarborte.no": 1,
    "ab.ca": 1,
    "abashiri.hokkaido.jp": 1,
    "abeno.osaka.jp": 1,
    "abiko.chiba.jp": 1,
    "abira.hokkaido.jp": 1,
    "abo.pa": 1,
    "abu.yamaguchi.jp": 1,
    "ac.ae": 1,
    "ac.at": 1,
    "ac.be": 1,
    "ac.ci": 1,
    "ac.cn": 1,
    "ac.cr": 1,
    "ac.gn": 1,
    "ac.id": 1,
    "ac.im": 1,
    "ac.in": 1,
    "ac.ir": 1,
    "ac.jp": 1,
    "ac.kr": 1,
    "ac.ma": 1,
    "ac.me": 1,
    "ac.mu": 1,
    "ac.mw": 1,
    "ac.ng": 1,
    "ac.pa": 1,
    "ac.pr": 1,
    "ac.rs": 1,
    "ac.ru": 1,
    "ac.rw": 1,
    "ac.se": 1,
    "ac.sz": 1,
    "ac.th": 1,
    "ac.tj": 1,
    "ac.tz": 1,
    "ac.ug": 1,
    "ac.vn": 1,
    "aca.pro": 1,
    "academy.museum": 1,
    "accident-investigation.aero": 1,
    "accident-prevention.aero": 1,
    "achi.nagano.jp": 1,
    "act.au": 1,
    "act.edu.au": 1,
    "act.gov.au": 1,
    "ad.jp": 1,
    "adachi.tokyo.jp": 1,
    "adm.br": 1,
    "adult.ht": 1,
    "adv.br": 1,
    "adygeya.ru": 1,
    "ae.org": 1,
    "aejrie.no": 1,
    "aero.mv": 1,
    "aero.tt": 1,
    "aerobatic.aero": 1,
    "aeroclub.aero": 1,
    "aerodrome.aero": 1,
    "aeroport.fr": 1,
    "afjord.no": 1,
    "ag.it": 1,
    "aga.niigata.jp": 1,
    "agano.niigata.jp": 1,
    "agdenes.no": 1,
    "agematsu.nagano.jp": 1,
    "agents.aero": 1,
    "agr.br": 1,
    "agrar.hu": 1,
    "agriculture.museum": 1,
    "agrigento.it": 1,
    "agrinet.tn": 1,
    "agro.pl": 1,
    "aguni.okinawa.jp": 1,
    "ah.cn": 1,
    "ah.no": 1,
    "aibetsu.hokkaido.jp": 1,
    "aichi.jp": 1,
    "aid.pl": 1,
    "aikawa.kanagawa.jp": 1,
    "ainan.ehime.jp": 1,
    "aioi.hyogo.jp": 1,
    "aip.ee": 1,
    "air-surveillance.aero": 1,
    "air-traffic-control.aero": 1,
    "air.museum": 1,
    "aircraft.aero": 1,
    "airguard.museum": 1,
    "airline.aero": 1,
    "airport.aero": 1,
    "airtraffic.aero": 1,
    "aisai.aichi.jp": 1,
    "aisho.shiga.jp": 1,
    "aizubange.fukushima.jp": 1,
    "aizumi.tokushima.jp": 1,
    "aizumisato.fukushima.jp": 1,
    "aizuwakamatsu.fukushima.jp": 1,
    "ak.us": 1,
    "akabira.hokkaido.jp": 1,
    "akagi.shimane.jp": 1,
    "akaiwa.okayama.jp": 1,
    "akashi.hyogo.jp": 1,
    "aki.kochi.jp": 1,
    "akiruno.tokyo.jp": 1,
    "akishima.tokyo.jp": 1,
    "akita.akita.jp": 1,
    "akita.jp": 1,
    "akkeshi.hokkaido.jp": 1,
    "aknoluokta.no": 1,
    "ako.hyogo.jp": 1,
    "akrehamn.no": 1,
    "akune.kagoshima.jp": 1,
    "al.it": 1,
    "al.no": 1,
    "al.us": 1,
    "alabama.museum": 1,
    "alaheadju.no": 1,
    "aland.fi": 1,
    "alaska.museum": 1,
    "alessandria.it": 1,
    "alesund.no": 1,
    "algard.no": 1,
    "alstahaug.no": 1,
    "alta.no": 1,
    "altai.ru": 1,
    "alto-adige.it": 1,
    "altoadige.it": 1,
    "alvdal.no": 1,
    "am.br": 1,
    "ama.aichi.jp": 1,
    "ama.shimane.jp": 1,
    "amagasaki.hyogo.jp": 1,
    "amakusa.kumamoto.jp": 1,
    "amami.kagoshima.jp": 1,
    "amber.museum": 1,
    "ambulance.aero": 1,
    "ambulance.museum": 1,
    "american.museum": 1,
    "americana.museum": 1,
    "americanantiques.museum": 1,
    "americanart.museum": 1,
    "ami.ibaraki.jp": 1,
    "amli.no": 1,
    "amot.no": 1,
    "amsterdam.museum": 1,
    "amur.ru": 1,
    "amursk.ru": 1,
    "amusement.aero": 1,
    "an.it": 1,
    "anamizu.ishikawa.jp": 1,
    "anan.nagano.jp": 1,
    "anan.tokushima.jp": 1,
    "ancona.it": 1,
    "and.museum": 1,
    "andasuolo.no": 1,
    "andebu.no": 1,
    "ando.nara.jp": 1,
    "andoy.no": 1,
    "andria-barletta-trani.it": 1,
    "andria-trani-barletta.it": 1,
    "andriabarlettatrani.it": 1,
    "andriatranibarletta.it": 1,
    "and\u00f8y.no": 1,
    "anjo.aichi.jp": 1,
    "annaka.gunma.jp": 1,
    "annefrank.museum": 1,
    "anpachi.gifu.jp": 1,
    "anthro.museum": 1,
    "anthropology.museum": 1,
    "antiques.museum": 1,
    "ao.it": 1,
    "aogaki.hyogo.jp": 1,
    "aogashima.tokyo.jp": 1,
    "aoki.nagano.jp": 1,
    "aomori.aomori.jp": 1,
    "aomori.jp": 1,
    "aosta.it": 1,
    "aoste.it": 1,
    "ap.it": 1,
    "appspot.com": 1,
    "aq.it": 1,
    "aquarium.museum": 1,
    "aquila.it": 1,
    "ar": 2,
    "ar.com": 1,
    "ar.it": 1,
    "ar.us": 1,
    "arai.shizuoka.jp": 1,
    "arakawa.saitama.jp": 1,
    "arakawa.tokyo.jp": 1,
    "arao.kumamoto.jp": 1,
    "arboretum.museum": 1,
    "archaeological.museum": 1,
    "archaeology.museum": 1,
    "architecture.museum": 1,
    "ardal.no": 1,
    "aremark.no": 1,
    "arendal.no": 1,
    "arezzo.it": 1,
    "ariake.saga.jp": 1,
    "arida.wakayama.jp": 1,
    "aridagawa.wakayama.jp": 1,
    "arita.saga.jp": 1,
    "arkhangelsk.ru": 1,
    "arna.no": 1,
    "arq.br": 1,
    "art.br": 1,
    "art.do": 1,
    "art.dz": 1,
    "art.ht": 1,
    "art.museum": 1,
    "art.pl": 1,
    "art.sn": 1,
    "artanddesign.museum": 1,
    "artcenter.museum": 1,
    "artdeco.museum": 1,
    "arteducation.museum": 1,
    "artgallery.museum": 1,
    "arts.co": 1,
    "arts.museum": 1,
    "arts.nf": 1,
    "arts.ro": 1,
    "artsandcrafts.museum": 1,
    "as.us": 1,
    "asago.hyogo.jp": 1,
    "asahi.chiba.jp": 1,
    "asahi.ibaraki.jp": 1,
    "asahi.mie.jp": 1,
    "asahi.nagano.jp": 1,
    "asahi.toyama.jp": 1,
    "asahi.yamagata.jp": 1,
    "asahikawa.hokkaido.jp": 1,
    "asaka.saitama.jp": 1,
    "asakawa.fukushima.jp": 1,
    "asakuchi.okayama.jp": 1,
    "asaminami.hiroshima.jp": 1,
    "ascoli-piceno.it": 1,
    "ascolipiceno.it": 1,
    "aseral.no": 1,
    "ashibetsu.hokkaido.jp": 1,
    "ashikaga.tochigi.jp": 1,
    "ashiya.fukuoka.jp": 1,
    "ashiya.hyogo.jp": 1,
    "ashoro.hokkaido.jp": 1,
    "asker.no": 1,
    "askim.no": 1,
    "askoy.no": 1,
    "askvoll.no": 1,
    "ask\u00f8y.no": 1,
    "asmatart.museum": 1,
    "asn.au": 1,
    "asn.lv": 1,
    "asnes.no": 1,
    "aso.kumamoto.jp": 1,
    "ass.km": 1,
    "assabu.hokkaido.jp": 1,
    "assassination.museum": 1,
    "assedic.fr": 1,
    "assisi.museum": 1,
    "assn.lk": 1,
    "asso.bj": 1,
    "asso.ci": 1,
    "asso.dz": 1,
    "asso.fr": 1,
    "asso.gp": 1,
    "asso.ht": 1,
    "asso.km": 1,
    "asso.mc": 1,
    "asso.nc": 1,
    "asso.re": 1,
    "association.aero": 1,
    "association.museum": 1,
    "asti.it": 1,
    "astrakhan.ru": 1,
    "astronomy.museum": 1,
    "asuke.aichi.jp": 1,
    "at-band-camp.net": 1,
    "at.it": 1,
    "atami.shizuoka.jp": 1,
    "ath.cx": 1,
    "atlanta.museum": 1,
    "atm.pl": 1,
    "ato.br": 1,
    "atsugi.kanagawa.jp": 1,
    "atsuma.hokkaido.jp": 1,
    "audnedaln.no": 1,
    "augustow.pl": 1,
    "aukra.no": 1,
    "aure.no": 1,
    "aurland.no": 1,
    "aurskog-holand.no": 1,
    "aurskog-h\u00f8land.no": 1,
    "austevoll.no": 1,
    "austin.museum": 1,
    "australia.museum": 1,
    "austrheim.no": 1,
    "author.aero": 1,
    "auto.pl": 1,
    "automotive.museum": 1,
    "av.it": 1,
    "avellino.it": 1,
    "averoy.no": 1,
    "aver\u00f8y.no": 1,
    "aviation.museum": 1,
    "avocat.fr": 1,
    "avoues.fr": 1,
    "awaji.hyogo.jp": 1,
    "axis.museum": 1,
    "aya.miyazaki.jp": 1,
    "ayabe.kyoto.jp": 1,
    "ayagawa.kagawa.jp": 1,
    "ayase.kanagawa.jp": 1,
    "az.us": 1,
    "azumino.nagano.jp": 1,
    "a\u00e9roport.ci": 1,
    "b.bg": 1,
    "b.br": 1,
    "b.se": 1,
    "ba.it": 1,
    "babia-gora.pl": 1,
    "badaddja.no": 1,
    "badajoz.museum": 1,
    "baghdad.museum": 1,
    "bahcavuotna.no": 1,
    "bahccavuotna.no": 1,
    "bahn.museum": 1,
    "baidar.no": 1,
    "baikal.ru": 1,
    "bajddar.no": 1,
    "balat.no": 1,
    "bale.museum": 1,
    "balestrand.no": 1,
    "ballangen.no": 1,
    "ballooning.aero": 1,
    "balsan.it": 1,
    "balsfjord.no": 1,
    "baltimore.museum": 1,
    "bamble.no": 1,
    "bandai.fukushima.jp": 1,
    "bando.ibaraki.jp": 1,
    "bar.pro": 1,
    "barcelona.museum": 1,
    "bardu.no": 1,
    "bari.it": 1,
    "barletta-trani-andria.it": 1,
    "barlettatraniandria.it": 1,
    "barreau.bj": 1,
    "barrel-of-knowledge.info": 1,
    "barrell-of-knowledge.info": 1,
    "barum.no": 1,
    "baseball.museum": 1,
    "basel.museum": 1,
    "bashkiria.ru": 1,
    "baths.museum": 1,
    "bato.tochigi.jp": 1,
    "batsfjord.no": 1,
    "bauern.museum": 1,
    "bc.ca": 1,
    "bd": 2,
    "bd.se": 1,
    "bearalvahki.no": 1,
    "bearalv\u00e1hki.no": 1,
    "beardu.no": 1,
    "beauxarts.museum": 1,
    "bedzin.pl": 1,
    "beeldengeluid.museum": 1,
    "beiarn.no": 1,
    "belau.pw": 1,
    "belgorod.ru": 1,
    "bellevue.museum": 1,
    "belluno.it": 1,
    "benevento.it": 1,
    "beppu.oita.jp": 1,
    "berg.no": 1,
    "bergamo.it": 1,
    "bergbau.museum": 1,
    "bergen.no": 1,
    "berkeley.museum": 1,
    "berlevag.no": 1,
    "berlev\u00e5g.no": 1,
    "berlin.museum": 1,
    "bern.museum": 1,
    "beskidy.pl": 1,
    "better-than.tv": 1,
    "bg.it": 1,
    "bi.it": 1,
    "bialowieza.pl": 1,
    "bialystok.pl": 1,
    "bibai.hokkaido.jp": 1,
    "bible.museum": 1,
    "biei.hokkaido.jp": 1,
    "bielawa.pl": 1,
    "biella.it": 1,
    "bieszczady.pl": 1,
    "bievat.no": 1,
    "biev\u00e1t.no": 1,
    "bifuka.hokkaido.jp": 1,
    "bihoro.hokkaido.jp": 1,
    "bilbao.museum": 1,
    "bill.museum": 1,
    "bindal.no": 1,
    "bio.br": 1,
    "bir.ru": 1,
    "biratori.hokkaido.jp": 1,
    "birdart.museum": 1,
    "birkenes.no": 1,
    "birthplace.museum": 1,
    "biz.at": 1,
    "biz.az": 1,
    "biz.bb": 1,
    "biz.ki": 1,
    "biz.mv": 1,
    "biz.mw": 1,
    "biz.nr": 1,
    "biz.pk": 1,
    "biz.pl": 1,
    "biz.pr": 1,
    "biz.tj": 1,
    "biz.tt": 1,
    "biz.vn": 1,
    "bizen.okayama.jp": 1,
    "bj.cn": 1,
    "bjarkoy.no": 1,
    "bjark\u00f8y.no": 1,
    "bjerkreim.no": 1,
    "bjugn.no": 1,
    "bl.it": 1,
    "bl.uk": 0,
    "blog.br": 1,
    "blogdns.com": 1,
    "blogdns.net": 1,
    "blogdns.org": 1,
    "blogsite.org": 1,
    "bmd.br": 1,
    "bn": 2,
    "bn.it": 1,
    "bo.it": 1,
    "bo.nordland.no": 1,
    "bo.telemark.no": 1,
    "bodo.no": 1,
    "bod\u00f8.no": 1,
    "bokn.no": 1,
    "boldlygoingnowhere.org": 1,
    "boleslawiec.pl": 1,
    "bologna.it": 1,
    "bolt.hu": 1,
    "bolzano.it": 1,
    "bomlo.no": 1,
    "bonn.museum": 1,
    "boston.museum": 1,
    "botanical.museum": 1,
    "botanicalgarden.museum": 1,
    "botanicgarden.museum": 1,
    "botany.museum": 1,
    "bozen.it": 1,
    "br.com": 1,
    "br.it": 1,
    "brand.se": 1,
    "brandywinevalley.museum": 1,
    "brasil.museum": 1,
    "bremanger.no": 1,
    "brescia.it": 1,
    "brindisi.it": 1,
    "bristol.museum": 1,
    "british-library.uk": 0,
    "british.museum": 1,
    "britishcolumbia.museum": 1,
    "broadcast.museum": 1,
    "broke-it.net": 1,
    "broker.aero": 1,
    "bronnoy.no": 1,
    "bronnoysund.no": 1,
    "brumunddal.no": 1,
    "brunel.museum": 1,
    "brussel.museum": 1,
    "brussels.museum": 1,
    "bruxelles.museum": 1,
    "bryansk.ru": 1,
    "bryne.no": 1,
    "br\u00f8nn\u00f8y.no": 1,
    "br\u00f8nn\u00f8ysund.no": 1,
    "bs.it": 1,
    "bt.it": 1,
    "bu.no": 1,
    "budejju.no": 1,
    "building.museum": 1,
    "bungoono.oita.jp": 1,
    "bungotakada.oita.jp": 1,
    "bunkyo.tokyo.jp": 1,
    "burghof.museum": 1,
    "buryatia.ru": 1,
    "bus.museum": 1,
    "busan.kr": 1,
    "bushey.museum": 1,
    "buyshouses.net": 1,
    "buzen.fukuoka.jp": 1,
    "bv.nl": 1,
    "bydgoszcz.pl": 1,
    "bygland.no": 1,
    "bykle.no": 1,
    "bytom.pl": 1,
    "bz.it": 1,
    "b\u00e1hcavuotna.no": 1,
    "b\u00e1hccavuotna.no": 1,
    "b\u00e1id\u00e1r.no": 1,
    "b\u00e1jddar.no": 1,
    "b\u00e1l\u00e1t.no": 1,
    "b\u00e5d\u00e5ddj\u00e5.no": 1,
    "b\u00e5tsfjord.no": 1,
    "b\u00e6rum.no": 1,
    "b\u00f8.nordland.no": 1,
    "b\u00f8.telemark.no": 1,
    "b\u00f8mlo.no": 1,
    "c.bg": 1,
    "c.la": 1,
    "c.se": 1,
    "ca.it": 1,
    "ca.na": 1,
    "ca.us": 1,
    "caa.aero": 1,
    "cadaques.museum": 1,
    "cagliari.it": 1,
    "cahcesuolo.no": 1,
    "california.museum": 1,
    "caltanissetta.it": 1,
    "cambridge.museum": 1,
    "campidano-medio.it": 1,
    "campidanomedio.it": 1,
    "campobasso.it": 1,
    "can.museum": 1,
    "canada.museum": 1,
    "capebreton.museum": 1,
    "carbonia-iglesias.it": 1,
    "carboniaiglesias.it": 1,
    "cargo.aero": 1,
    "carrara-massa.it": 1,
    "carraramassa.it": 1,
    "carrier.museum": 1,
    "cartoonart.museum": 1,
    "casadelamoneda.museum": 1,
    "caserta.it": 1,
    "casino.hu": 1,
    "castle.museum": 1,
    "castres.museum": 1,
    "catania.it": 1,
    "catanzaro.it": 1,
    "catering.aero": 1,
    "cb.it": 1,
    "cbg.ru": 1,
    "cc.ak.us": 1,
    "cc.al.us": 1,
    "cc.ar.us": 1,
    "cc.as.us": 1,
    "cc.az.us": 1,
    "cc.ca.us": 1,
    "cc.co.us": 1,
    "cc.ct.us": 1,
    "cc.dc.us": 1,
    "cc.de.us": 1,
    "cc.fl.us": 1,
    "cc.ga.us": 1,
    "cc.gu.us": 1,
    "cc.hi.us": 1,
    "cc.ia.us": 1,
    "cc.id.us": 1,
    "cc.il.us": 1,
    "cc.in.us": 1,
    "cc.ks.us": 1,
    "cc.ky.us": 1,
    "cc.la.us": 1,
    "cc.ma.us": 1,
    "cc.md.us": 1,
    "cc.me.us": 1,
    "cc.mi.us": 1,
    "cc.mn.us": 1,
    "cc.mo.us": 1,
    "cc.ms.us": 1,
    "cc.mt.us": 1,
    "cc.na": 1,
    "cc.nc.us": 1,
    "cc.nd.us": 1,
    "cc.ne.us": 1,
    "cc.nh.us": 1,
    "cc.nj.us": 1,
    "cc.nm.us": 1,
    "cc.nv.us": 1,
    "cc.ny.us": 1,
    "cc.oh.us": 1,
    "cc.ok.us": 1,
    "cc.or.us": 1,
    "cc.pa.us": 1,
    "cc.pr.us": 1,
    "cc.ri.us": 1,
    "cc.sc.us": 1,
    "cc.sd.us": 1,
    "cc.tn.us": 1,
    "cc.tx.us": 1,
    "cc.ut.us": 1,
    "cc.va.us": 1,
    "cc.vi.us": 1,
    "cc.vt.us": 1,
    "cc.wa.us": 1,
    "cc.wi.us": 1,
    "cc.wv.us": 1,
    "cc.wy.us": 1,
    "cci.fr": 1,
    "ce.it": 1,
    "cechire.com": 1,
    "celtic.museum": 1,
    "center.museum": 1,
    "certification.aero": 1,
    "cesena-forli.it": 1,
    "cesenaforli.it": 1,
    "ch.it": 1,
    "chambagri.fr": 1,
    "championship.aero": 1,
    "charter.aero": 1,
    "chattanooga.museum": 1,
    "chel.ru": 1,
    "cheltenham.museum": 1,
    "chelyabinsk.ru": 1,
    "cherkassy.ua": 1,
    "cherkasy.ua": 1,
    "chernigov.ua": 1,
    "chernihiv.ua": 1,
    "chernivtsi.ua": 1,
    "chernovtsy.ua": 1,
    "chesapeakebay.museum": 1,
    "chiba.jp": 1,
    "chicago.museum": 1,
    "chichibu.saitama.jp": 1,
    "chieti.it": 1,
    "chigasaki.kanagawa.jp": 1,
    "chihayaakasaka.osaka.jp": 1,
    "chijiwa.nagasaki.jp": 1,
    "chikugo.fukuoka.jp": 1,
    "chikuho.fukuoka.jp": 1,
    "chikuhoku.nagano.jp": 1,
    "chikujo.fukuoka.jp": 1,
    "chikuma.nagano.jp": 1,
    "chikusei.ibaraki.jp": 1,
    "chikushino.fukuoka.jp": 1,
    "chikuzen.fukuoka.jp": 1,
    "children.museum": 1,
    "childrens.museum": 1,
    "childrensgarden.museum": 1,
    "chino.nagano.jp": 1,
    "chippubetsu.hokkaido.jp": 1,
    "chiropractic.museum": 1,
    "chirurgiens-dentistes.fr": 1,
    "chiryu.aichi.jp": 1,
    "chita.aichi.jp": 1,
    "chita.ru": 1,
    "chitose.hokkaido.jp": 1,
    "chiyoda.gunma.jp": 1,
    "chiyoda.tokyo.jp": 1,
    "chizu.tottori.jp": 1,
    "chocolate.museum": 1,
    "chofu.tokyo.jp": 1,
    "chonan.chiba.jp": 1,
    "chosei.chiba.jp": 1,
    "choshi.chiba.jp": 1,
    "choyo.kumamoto.jp": 1,
    "christiansburg.museum": 1,
    "chtr.k12.ma.us": 1,
    "chukotka.ru": 1,
    "chungbuk.kr": 1,
    "chungnam.kr": 1,
    "chuo.chiba.jp": 1,
    "chuo.fukuoka.jp": 1,
    "chuo.osaka.jp": 1,
    "chuo.tokyo.jp": 1,
    "chuo.yamanashi.jp": 1,
    "chuvashia.ru": 1,
    "ci.it": 1,
    "cieszyn.pl": 1,
    "cim.br": 1,
    "cincinnati.museum": 1,
    "cinema.museum": 1,
    "circus.museum": 1,
    "city.hu": 1,
    "city.kawasaki.jp": 0,
    "city.kitakyushu.jp": 0,
    "city.kobe.jp": 0,
    "city.nagoya.jp": 0,
    "city.sapporo.jp": 0,
    "city.sendai.jp": 0,
    "city.yokohama.jp": 0,
    "civilaviation.aero": 1,
    "civilisation.museum": 1,
    "civilization.museum": 1,
    "civilwar.museum": 1,
    "ck": 2,
    "ck.ua": 1,
    "cl.it": 1,
    "clinton.museum": 1,
    "clock.museum": 1,
    "club.aero": 1,
    "club.tw": 1,
    "cmw.ru": 1,
    "cn.com": 1,
    "cn.it": 1,
    "cn.ua": 1,
    "cng.br": 1,
    "cnt.br": 1,
    "co.ae": 1,
    "co.ag": 1,
    "co.ao": 1,
    "co.at": 1,
    "co.ba": 1,
    "co.bi": 1,
    "co.bw": 1,
    "co.ca": 1,
    "co.ci": 1,
    "co.cl": 1,
    "co.cr": 1,
    "co.gg": 1,
    "co.gy": 1,
    "co.hu": 1,
    "co.id": 1,
    "co.im": 1,
    "co.in": 1,
    "co.ir": 1,
    "co.it": 1,
    "co.je": 1,
    "co.jp": 1,
    "co.kr": 1,
    "co.lc": 1,
    "co.ls": 1,
    "co.ma": 1,
    "co.me": 1,
    "co.mu": 1,
    "co.mw": 1,
    "co.na": 1,
    "co.nl": 1,
    "co.no": 1,
    "co.pl": 1,
    "co.pn": 1,
    "co.pw": 1,
    "co.rs": 1,
    "co.rw": 1,
    "co.st": 1,
    "co.sz": 1,
    "co.th": 1,
    "co.tj": 1,
    "co.tm": 1,
    "co.tt": 1,
    "co.tz": 1,
    "co.ua": 1,
    "co.ug": 1,
    "co.us": 1,
    "co.uz": 1,
    "co.ve": 1,
    "co.vi": 1,
    "coal.museum": 1,
    "coastaldefence.museum": 1,
    "cody.museum": 1,
    "coldwar.museum": 1,
    "collection.museum": 1,
    "colonialwilliamsburg.museum": 1,
    "coloradoplateau.museum": 1,
    "columbia.museum": 1,
    "columbus.museum": 1,
    "com.ac": 1,
    "com.af": 1,
    "com.ag": 1,
    "com.ai": 1,
    "com.al": 1,
    "com.an": 1,
    "com.au": 1,
    "com.aw": 1,
    "com.az": 1,
    "com.ba": 1,
    "com.bb": 1,
    "com.bh": 1,
    "com.bi": 1,
    "com.bm": 1,
    "com.bo": 1,
    "com.br": 1,
    "com.bs": 1,
    "com.bt": 1,
    "com.by": 1,
    "com.bz": 1,
    "com.ci": 1,
    "com.cn": 1,
    "com.co": 1,
    "com.cu": 1,
    "com.de": 1,
    "com.dm": 1,
    "com.do": 1,
    "com.dz": 1,
    "com.ec": 1,
    "com.ee": 1,
    "com.eg": 1,
    "com.es": 1,
    "com.fr": 1,
    "com.ge": 1,
    "com.gh": 1,
    "com.gi": 1,
    "com.gn": 1,
    "com.gp": 1,
    "com.gr": 1,
    "com.gy": 1,
    "com.hk": 1,
    "com.hn": 1,
    "com.hr": 1,
    "com.ht": 1,
    "com.io": 1,
    "com.iq": 1,
    "com.is": 1,
    "com.jo": 1,
    "com.kg": 1,
    "com.ki": 1,
    "com.km": 1,
    "com.kp": 1,
    "com.ky": 1,
    "com.kz": 1,
    "com.la": 1,
    "com.lb": 1,
    "com.lc": 1,
    "com.lk": 1,
    "com.lr": 1,
    "com.lv": 1,
    "com.ly": 1,
    "com.mg": 1,
    "com.mk": 1,
    "com.ml": 1,
    "com.mo": 1,
    "com.mu": 1,
    "com.mv": 1,
    "com.mw": 1,
    "com.mx": 1,
    "com.my": 1,
    "com.na": 1,
    "com.nf": 1,
    "com.ng": 1,
    "com.nr": 1,
    "com.pa": 1,
    "com.pe": 1,
    "com.pf": 1,
    "com.ph": 1,
    "com.pk": 1,
    "com.pl": 1,
    "com.pr": 1,
    "com.ps": 1,
    "com.pt": 1,
    "com.qa": 1,
    "com.re": 1,
    "com.ro": 1,
    "com.ru": 1,
    "com.rw": 1,
    "com.sa": 1,
    "com.sb": 1,
    "com.sc": 1,
    "com.sd": 1,
    "com.sg": 1,
    "com.sh": 1,
    "com.sl": 1,
    "com.sn": 1,
    "com.so": 1,
    "com.st": 1,
    "com.sy": 1,
    "com.tj": 1,
    "com.tm": 1,
    "com.tn": 1,
    "com.to": 1,
    "com.tt": 1,
    "com.tw": 1,
    "com.ua": 1,
    "com.ug": 1,
    "com.uy": 1,
    "com.uz": 1,
    "com.vc": 1,
    "com.ve": 1,
    "com.vi": 1,
    "com.vn": 1,
    "com.ws": 1,
    "communication.museum": 1,
    "communications.museum": 1,
    "community.museum": 1,
    "como.it": 1,
    "computer.museum": 1,
    "computerhistory.museum": 1,
    "comunica\u00e7\u00f5es.museum": 1,
    "conf.au": 1,
    "conf.lv": 1,
    "conference.aero": 1,
    "congresodelalengua3.ar": 0,
    "consulado.st": 1,
    "consultant.aero": 1,
    "consulting.aero": 1,
    "contemporary.museum": 1,
    "contemporaryart.museum": 1,
    "control.aero": 1,
    "convent.museum": 1,
    "coop.br": 1,
    "coop.ht": 1,
    "coop.km": 1,
    "coop.mv": 1,
    "coop.mw": 1,
    "coop.tt": 1,
    "copenhagen.museum": 1,
    "corporation.museum": 1,
    "correios-e-telecomunica\u00e7\u00f5es.museum": 1,
    "corvette.museum": 1,
    "cosenza.it": 1,
    "costume.museum": 1,
    "council.aero": 1,
    "countryestate.museum": 1,
    "county.museum": 1,
    "cpa.pro": 1,
    "cq.cn": 1,
    "cr.it": 1,
    "cr.ua": 1,
    "crafts.museum": 1,
    "cranbrook.museum": 1,
    "creation.museum": 1,
    "cremona.it": 1,
    "crew.aero": 1,
    "crimea.ua": 1,
    "crotone.it": 1,
    "cs.it": 1,
    "csiro.au": 1,
    "ct.it": 1,
    "ct.us": 1,
    "cultural.museum": 1,
    "culturalcenter.museum": 1,
    "culture.museum": 1,
    "cuneo.it": 1,
    "cv.ua": 1,
    "cy": 2,
    "cyber.museum": 1,
    "cymru.museum": 1,
    "cz.it": 1,
    "czeladz.pl": 1,
    "czest.pl": 1,
    "d.bg": 1,
    "d.se": 1,
    "daegu.kr": 1,
    "daejeon.kr": 1,
    "dagestan.ru": 1,
    "daigo.ibaraki.jp": 1,
    "daisen.akita.jp": 1,
    "daito.osaka.jp": 1,
    "daiwa.hiroshima.jp": 1,
    "dali.museum": 1,
    "dallas.museum": 1,
    "database.museum": 1,
    "date.fukushima.jp": 1,
    "date.hokkaido.jp": 1,
    "davvenjarga.no": 1,
    "davvenj\u00e1rga.no": 1,
    "davvesiida.no": 1,
    "dazaifu.fukuoka.jp": 1,
    "dc.us": 1,
    "ddr.museum": 1,
    "de.com": 1,
    "de.us": 1,
    "deatnu.no": 1,
    "decorativearts.museum": 1,
    "defense.tn": 1,
    "delaware.museum": 1,
    "dell-ogliastra.it": 1,
    "dellogliastra.it": 1,
    "delmenhorst.museum": 1,
    "denmark.museum": 1,
    "dep.no": 1,
    "depot.museum": 1,
    "design.aero": 1,
    "design.museum": 1,
    "detroit.museum": 1,
    "dgca.aero": 1,
    "dielddanuorri.no": 1,
    "dinosaur.museum": 1,
    "discovery.museum": 1,
    "divtasvuodna.no": 1,
    "divttasvuotna.no": 1,
    "dlugoleka.pl": 1,
    "dn.ua": 1,
    "dnepropetrovsk.ua": 1,
    "dni.us": 1,
    "dnipropetrovsk.ua": 1,
    "dnsalias.com": 1,
    "dnsalias.net": 1,
    "dnsalias.org": 1,
    "dnsdojo.com": 1,
    "dnsdojo.net": 1,
    "dnsdojo.org": 1,
    "does-it.net": 1,
    "doesntexist.com": 1,
    "doesntexist.org": 1,
    "dolls.museum": 1,
    "dominic.ua": 1,
    "donetsk.ua": 1,
    "donna.no": 1,
    "donostia.museum": 1,
    "dontexist.com": 1,
    "dontexist.net": 1,
    "dontexist.org": 1,
    "doomdns.com": 1,
    "doomdns.org": 1,
    "doshi.yamanashi.jp": 1,
    "dovre.no": 1,
    "dp.ua": 1,
    "dr.na": 1,
    "drammen.no": 1,
    "drangedal.no": 1,
    "dreamhosters.com": 1,
    "drobak.no": 1,
    "dr\u00f8bak.no": 1,
    "dudinka.ru": 1,
    "durham.museum": 1,
    "dvrdns.org": 1,
    "dyn-o-saur.com": 1,
    "dynalias.com": 1,
    "dynalias.net": 1,
    "dynalias.org": 1,
    "dynathome.net": 1,
    "dyndns-at-home.com": 1,
    "dyndns-at-work.com": 1,
    "dyndns-blog.com": 1,
    "dyndns-free.com": 1,
    "dyndns-home.com": 1,
    "dyndns-ip.com": 1,
    "dyndns-mail.com": 1,
    "dyndns-office.com": 1,
    "dyndns-pics.com": 1,
    "dyndns-remote.com": 1,
    "dyndns-server.com": 1,
    "dyndns-web.com": 1,
    "dyndns-wiki.com": 1,
    "dyndns-work.com": 1,
    "dyndns.biz": 1,
    "dyndns.info": 1,
    "dyndns.org": 1,
    "dyndns.tv": 1,
    "dyndns.ws": 1,
    "dyroy.no": 1,
    "dyr\u00f8y.no": 1,
    "d\u00f8nna.no": 1,
    "e-burg.ru": 1,
    "e.bg": 1,
    "e.se": 1,
    "e12.ve": 1,
    "e164.arpa": 1,
    "eastafrica.museum": 1,
    "eastcoast.museum": 1,
    "ebetsu.hokkaido.jp": 1,
    "ebina.kanagawa.jp": 1,
    "ebino.miyazaki.jp": 1,
    "ebiz.tw": 1,
    "echizen.fukui.jp": 1,
    "ecn.br": 1,
    "eco.br": 1,
    "ed.ao": 1,
    "ed.ci": 1,
    "ed.cr": 1,
    "ed.jp": 1,
    "ed.pw": 1,
    "edogawa.tokyo.jp": 1,
    "edu.ac": 1,
    "edu.af": 1,
    "edu.al": 1,
    "edu.an": 1,
    "edu.au": 1,
    "edu.az": 1,
    "edu.ba": 1,
    "edu.bb": 1,
    "edu.bh": 1,
    "edu.bi": 1,
    "edu.bm": 1,
    "edu.bo": 1,
    "edu.br": 1,
    "edu.bs": 1,
    "edu.bt": 1,
    "edu.bz": 1,
    "edu.ci": 1,
    "edu.cn": 1,
    "edu.co": 1,
    "edu.cu": 1,
    "edu.dm": 1,
    "edu.do": 1,
    "edu.dz": 1,
    "edu.ec": 1,
    "edu.ee": 1,
    "edu.eg": 1,
    "edu.es": 1,
    "edu.ge": 1,
    "edu.gh": 1,
    "edu.gi": 1,
    "edu.gn": 1,
    "edu.gp": 1,
    "edu.gr": 1,
    "edu.hk": 1,
    "edu.hn": 1,
    "edu.ht": 1,
    "edu.in": 1,
    "edu.iq": 1,
    "edu.is": 1,
    "edu.it": 1,
    "edu.jo": 1,
    "edu.kg": 1,
    "edu.ki": 1,
    "edu.km": 1,
    "edu.kn": 1,
    "edu.kp": 1,
    "edu.ky": 1,
    "edu.kz": 1,
    "edu.la": 1,
    "edu.lb": 1,
    "edu.lc": 1,
    "edu.lk": 1,
    "edu.lr": 1,
    "edu.lv": 1,
    "edu.ly": 1,
    "edu.me": 1,
    "edu.mg": 1,
    "edu.mk": 1,
    "edu.ml": 1,
    "edu.mn": 1,
    "edu.mo": 1,
    "edu.mv": 1,
    "edu.mw": 1,
    "edu.mx": 1,
    "edu.my": 1,
    "edu.ng": 1,
    "edu.nr": 1,
    "edu.pa": 1,
    "edu.pe": 1,
    "edu.pf": 1,
    "edu.ph": 1,
    "edu.pk": 1,
    "edu.pl": 1,
    "edu.pn": 1,
    "edu.pr": 1,
    "edu.ps": 1,
    "edu.pt": 1,
    "edu.qa": 1,
    "edu.rs": 1,
    "edu.ru": 1,
    "edu.rw": 1,
    "edu.sa": 1,
    "edu.sb": 1,
    "edu.sc": 1,
    "edu.sd": 1,
    "edu.sg": 1,
    "edu.sl": 1,
    "edu.sn": 1,
    "edu.st": 1,
    "edu.sy": 1,
    "edu.tj": 1,
    "edu.tm": 1,
    "edu.to": 1,
    "edu.tt": 1,
    "edu.tw": 1,
    "edu.ua": 1,
    "edu.uy": 1,
    "edu.vc": 1,
    "edu.ve": 1,
    "edu.vn": 1,
    "edu.ws": 1,
    "educ.ar": 0,
    "education.museum": 1,
    "educational.museum": 1,
    "educator.aero": 1,
    "edunet.tn": 1,
    "egersund.no": 1,
    "egyptian.museum": 1,
    "ehime.jp": 1,
    "eid.no": 1,
    "eidfjord.no": 1,
    "eidsberg.no": 1,
    "eidskog.no": 1,
    "eidsvoll.no": 1,
    "eigersund.no": 1,
    "eiheiji.fukui.jp": 1,
    "eisenbahn.museum": 1,
    "elblag.pl": 1,
    "elburg.museum": 1,
    "elk.pl": 1,
    "elvendrell.museum": 1,
    "elverum.no": 1,
    "embaixada.st": 1,
    "embetsu.hokkaido.jp": 1,
    "embroidery.museum": 1,
    "emergency.aero": 1,
    "emp.br": 1,
    "en.it": 1,
    "ena.gifu.jp": 1,
    "encyclopedic.museum": 1,
    "endofinternet.net": 1,
    "endofinternet.org": 1,
    "endoftheinternet.org": 1,
    "enebakk.no": 1,
    "eng.br": 1,
    "eng.pro": 1,
    "engerdal.no": 1,
    "engine.aero": 1,
    "engineer.aero": 1,
    "england.museum": 1,
    "eniwa.hokkaido.jp": 1,
    "enna.it": 1,
    "ens.tn": 1,
    "entertainment.aero": 1,
    "entomology.museum": 1,
    "environment.museum": 1,
    "environmentalconservation.museum": 1,
    "epilepsy.museum": 1,
    "equipment.aero": 1,
    "er": 2,
    "erimo.hokkaido.jp": 1,
    "erotica.hu": 1,
    "erotika.hu": 1,
    "es.kr": 1,
    "esan.hokkaido.jp": 1,
    "esashi.hokkaido.jp": 1,
    "esp.br": 1,
    "essex.museum": 1,
    "est-a-la-maison.com": 1,
    "est-a-la-masion.com": 1,
    "est-le-patron.com": 1,
    "est-mon-blogueur.com": 1,
    "est.pr": 1,
    "estate.museum": 1,
    "et": 2,
    "etajima.hiroshima.jp": 1,
    "etc.br": 1,
    "ethnology.museum": 1,
    "eti.br": 1,
    "etne.no": 1,
    "etnedal.no": 1,
    "eu.com": 1,
    "eu.int": 1,
    "eun.eg": 1,
    "evenassi.no": 1,
    "evenes.no": 1,
    "even\u00e1\u0161\u0161i.no": 1,
    "evje-og-hornnes.no": 1,
    "exchange.aero": 1,
    "exeter.museum": 1,
    "exhibition.museum": 1,
    "experts-comptables.fr": 1,
    "express.aero": 1,
    "f.bg": 1,
    "f.se": 1,
    "fam.pk": 1,
    "family.museum": 1,
    "far.br": 1,
    "fareast.ru": 1,
    "farm.museum": 1,
    "farmequipment.museum": 1,
    "farmers.museum": 1,
    "farmstead.museum": 1,
    "farsund.no": 1,
    "fauske.no": 1,
    "fc.it": 1,
    "fe.it": 1,
    "fed.us": 1,
    "federation.aero": 1,
    "fedje.no": 1,
    "fermo.it": 1,
    "ferrara.it": 1,
    "fet.no": 1,
    "fetsund.no": 1,
    "fg.it": 1,
    "fh.se": 1,
    "fhs.no": 1,
    "fhsk.se": 1,
    "fhv.se": 1,
    "fi.cr": 1,
    "fi.it": 1,
    "fie.ee": 1,
    "field.museum": 1,
    "figueres.museum": 1,
    "filatelia.museum": 1,
    "film.hu": 1,
    "film.museum": 1,
    "fin.ec": 1,
    "fin.tn": 1,
    "fineart.museum": 1,
    "finearts.museum": 1,
    "finland.museum": 1,
    "finnoy.no": 1,
    "finn\u00f8y.no": 1,
    "firenze.it": 1,
    "firm.co": 1,
    "firm.ht": 1,
    "firm.in": 1,
    "firm.nf": 1,
    "firm.ro": 1,
    "fitjar.no": 1,
    "fj": 2,
    "fj.cn": 1,
    "fjaler.no": 1,
    "fjell.no": 1,
    "fk": 2,
    "fl.us": 1,
    "fla.no": 1,
    "flakstad.no": 1,
    "flanders.museum": 1,
    "flatanger.no": 1,
    "flekkefjord.no": 1,
    "flesberg.no": 1,
    "flight.aero": 1,
    "flog.br": 1,
    "flora.no": 1,
    "florence.it": 1,
    "florida.museum": 1,
    "floro.no": 1,
    "flor\u00f8.no": 1,
    "fl\u00e5.no": 1,
    "fm.br": 1,
    "fm.it": 1,
    "fm.no": 1,
    "fnd.br": 1,
    "foggia.it": 1,
    "folkebibl.no": 1,
    "folldal.no": 1,
    "for-better.biz": 1,
    "for-more.biz": 1,
    "for-our.info": 1,
    "for-some.biz": 1,
    "for-the.biz": 1,
    "force.museum": 1,
    "forde.no": 1,
    "forgot.her.name": 1,
    "forgot.his.name": 1,
    "forli-cesena.it": 1,
    "forlicesena.it": 1,
    "forsand.no": 1,
    "fortmissoula.museum": 1,
    "fortworth.museum": 1,
    "forum.hu": 1,
    "fosnes.no": 1,
    "fot.br": 1,
    "foundation.museum": 1,
    "fr.it": 1,
    "frana.no": 1,
    "francaise.museum": 1,
    "frankfurt.museum": 1,
    "franziskaner.museum": 1,
    "fredrikstad.no": 1,
    "freemasonry.museum": 1,
    "frei.no": 1,
    "freiburg.museum": 1,
    "freight.aero": 1,
    "fribourg.museum": 1,
    "frog.museum": 1,
    "frogn.no": 1,
    "froland.no": 1,
    "from-ak.com": 1,
    "from-al.com": 1,
    "from-ar.com": 1,
    "from-az.net": 1,
    "from-ca.com": 1,
    "from-co.net": 1,
    "from-ct.com": 1,
    "from-dc.com": 1,
    "from-de.com": 1,
    "from-fl.com": 1,
    "from-ga.com": 1,
    "from-hi.com": 1,
    "from-ia.com": 1,
    "from-id.com": 1,
    "from-il.com": 1,
    "from-in.com": 1,
    "from-ks.com": 1,
    "from-ky.com": 1,
    "from-la.net": 1,
    "from-ma.com": 1,
    "from-md.com": 1,
    "from-me.org": 1,
    "from-mi.com": 1,
    "from-mn.com": 1,
    "from-mo.com": 1,
    "from-ms.com": 1,
    "from-mt.com": 1,
    "from-nc.com": 1,
    "from-nd.com": 1,
    "from-ne.com": 1,
    "from-nh.com": 1,
    "from-nj.com": 1,
    "from-nm.com": 1,
    "from-nv.com": 1,
    "from-ny.net": 1,
    "from-oh.com": 1,
    "from-ok.com": 1,
    "from-or.com": 1,
    "from-pa.com": 1,
    "from-pr.com": 1,
    "from-ri.com": 1,
    "from-sc.com": 1,
    "from-sd.com": 1,
    "from-tn.com": 1,
    "from-tx.com": 1,
    "from-ut.com": 1,
    "from-va.com": 1,
    "from-vt.com": 1,
    "from-wa.com": 1,
    "from-wi.com": 1,
    "from-wv.com": 1,
    "from-wy.com": 1,
    "from.hr": 1,
    "frosinone.it": 1,
    "frosta.no": 1,
    "froya.no": 1,
    "fr\u00e6na.no": 1,
    "fr\u00f8ya.no": 1,
    "fst.br": 1,
    "ftpaccess.cc": 1,
    "fuchu.hiroshima.jp": 1,
    "fuchu.tokyo.jp": 1,
    "fuchu.toyama.jp": 1,
    "fudai.iwate.jp": 1,
    "fuefuki.yamanashi.jp": 1,
    "fuel.aero": 1,
    "fuettertdasnetz.de": 1,
    "fuji.shizuoka.jp": 1,
    "fujieda.shizuoka.jp": 1,
    "fujiidera.osaka.jp": 1,
    "fujikawa.shizuoka.jp": 1,
    "fujikawa.yamanashi.jp": 1,
    "fujikawaguchiko.yamanashi.jp": 1,
    "fujimi.nagano.jp": 1,
    "fujimi.saitama.jp": 1,
    "fujimino.saitama.jp": 1,
    "fujinomiya.shizuoka.jp": 1,
    "fujioka.gunma.jp": 1,
    "fujisato.akita.jp": 1,
    "fujisawa.iwate.jp": 1,
    "fujisawa.kanagawa.jp": 1,
    "fujishiro.ibaraki.jp": 1,
    "fujiyoshida.yamanashi.jp": 1,
    "fukagawa.hokkaido.jp": 1,
    "fukaya.saitama.jp": 1,
    "fukuchi.fukuoka.jp": 1,
    "fukuchiyama.kyoto.jp": 1,
    "fukudomi.saga.jp": 1,
    "fukui.fukui.jp": 1,
    "fukui.jp": 1,
    "fukumitsu.toyama.jp": 1,
    "fukuoka.jp": 1,
    "fukuroi.shizuoka.jp": 1,
    "fukusaki.hyogo.jp": 1,
    "fukushima.fukushima.jp": 1,
    "fukushima.hokkaido.jp": 1,
    "fukushima.jp": 1,
    "fukuyama.hiroshima.jp": 1,
    "funabashi.chiba.jp": 1,
    "funagata.yamagata.jp": 1,
    "funahashi.toyama.jp": 1,
    "fundacio.museum": 1,
    "fuoisku.no": 1,
    "fuossko.no": 1,
    "furano.hokkaido.jp": 1,
    "furniture.museum": 1,
    "furubira.hokkaido.jp": 1,
    "furudono.fukushima.jp": 1,
    "furukawa.miyagi.jp": 1,
    "fusa.no": 1,
    "fuso.aichi.jp": 1,
    "fussa.tokyo.jp": 1,
    "futaba.fukushima.jp": 1,
    "futsu.nagasaki.jp": 1,
    "futtsu.chiba.jp": 1,
    "fylkesbibl.no": 1,
    "fyresdal.no": 1,
    "f\u00f8rde.no": 1,
    "g.bg": 1,
    "g.se": 1,
    "g12.br": 1,
    "ga.us": 1,
    "gaivuotna.no": 1,
    "gallery.museum": 1,
    "galsa.no": 1,
    "gamagori.aichi.jp": 1,
    "game-host.org": 1,
    "game-server.cc": 1,
    "game.tw": 1,
    "games.hu": 1,
    "gamo.shiga.jp": 1,
    "gamvik.no": 1,
    "gangaviika.no": 1,
    "gangwon.kr": 1,
    "garden.museum": 1,
    "gateway.museum": 1,
    "gaular.no": 1,
    "gausdal.no": 1,
    "gb.com": 1,
    "gb.net": 1,
    "gc.ca": 1,
    "gd.cn": 1,
    "gda.pl": 1,
    "gdansk.pl": 1,
    "gdynia.pl": 1,
    "ge.it": 1,
    "geelvinck.museum": 1,
    "geisei.kochi.jp": 1,
    "gemological.museum": 1,
    "gen.in": 1,
    "genkai.saga.jp": 1,
    "genoa.it": 1,
    "genova.it": 1,
    "geology.museum": 1,
    "geometre-expert.fr": 1,
    "georgia.museum": 1,
    "getmyip.com": 1,
    "gets-it.net": 1,
    "ggf.br": 1,
    "giehtavuoatna.no": 1,
    "giessen.museum": 1,
    "gifu.gifu.jp": 1,
    "gifu.jp": 1,
    "gildeskal.no": 1,
    "gildesk\u00e5l.no": 1,
    "ginan.gifu.jp": 1,
    "ginowan.okinawa.jp": 1,
    "ginoza.okinawa.jp": 1,
    "giske.no": 1,
    "gjemnes.no": 1,
    "gjerdrum.no": 1,
    "gjerstad.no": 1,
    "gjesdal.no": 1,
    "gjovik.no": 1,
    "gj\u00f8vik.no": 1,
    "glas.museum": 1,
    "glass.museum": 1,
    "gliding.aero": 1,
    "gliwice.pl": 1,
    "glogow.pl": 1,
    "gloppen.no": 1,
    "gmina.pl": 1,
    "gniezno.pl": 1,
    "go.ci": 1,
    "go.cr": 1,
    "go.dyndns.org": 1,
    "go.id": 1,
    "go.it": 1,
    "go.jp": 1,
    "go.kr": 1,
    "go.pw": 1,
    "go.th": 1,
    "go.tj": 1,
    "go.tz": 1,
    "go.ug": 1,
    "gob.bo": 1,
    "gob.cl": 1,
    "gob.do": 1,
    "gob.ec": 1,
    "gob.es": 1,
    "gob.hn": 1,
    "gob.mx": 1,
    "gob.pa": 1,
    "gob.pe": 1,
    "gob.pk": 1,
    "gobiernoelectronico.ar": 0,
    "gobo.wakayama.jp": 1,
    "godo.gifu.jp": 1,
    "gojome.akita.jp": 1,
    "gok.pk": 1,
    "gokase.miyazaki.jp": 1,
    "gol.no": 1,
    "gon.pk": 1,
    "gonohe.aomori.jp": 1,
    "gop.pk": 1,
    "gorge.museum": 1,
    "gorizia.it": 1,
    "gorlice.pl": 1,
    "gos.pk": 1,
    "gose.nara.jp": 1,
    "gosen.niigata.jp": 1,
    "goshiki.hyogo.jp": 1,
    "gotdns.com": 1,
    "gotdns.org": 1,
    "gotemba.shizuoka.jp": 1,
    "goto.nagasaki.jp": 1,
    "gotsu.shimane.jp": 1,
    "gouv.bj": 1,
    "gouv.ci": 1,
    "gouv.fr": 1,
    "gouv.ht": 1,
    "gouv.km": 1,
    "gouv.ml": 1,
    "gouv.rw": 1,
    "gouv.sn": 1,
    "gov.ac": 1,
    "gov.ae": 1,
    "gov.af": 1,
    "gov.al": 1,
    "gov.as": 1,
    "gov.au": 1,
    "gov.az": 1,
    "gov.ba": 1,
    "gov.bb": 1,
    "gov.bf": 1,
    "gov.bh": 1,
    "gov.bm": 1,
    "gov.bo": 1,
    "gov.br": 1,
    "gov.bs": 1,
    "gov.bt": 1,
    "gov.by": 1,
    "gov.bz": 1,
    "gov.cd": 1,
    "gov.cl": 1,
    "gov.cm": 1,
    "gov.cn": 1,
    "gov.co": 1,
    "gov.cu": 1,
    "gov.cx": 1,
    "gov.dm": 1,
    "gov.do": 1,
    "gov.dz": 1,
    "gov.ec": 1,
    "gov.ee": 1,
    "gov.eg": 1,
    "gov.ge": 1,
    "gov.gg": 1,
    "gov.gh": 1,
    "gov.gi": 1,
    "gov.gn": 1,
    "gov.gr": 1,
    "gov.hk": 1,
    "gov.ie": 1,
    "gov.im": 1,
    "gov.in": 1,
    "gov.iq": 1,
    "gov.ir": 1,
    "gov.is": 1,
    "gov.it": 1,
    "gov.je": 1,
    "gov.jo": 1,
    "gov.kg": 1,
    "gov.ki": 1,
    "gov.km": 1,
    "gov.kn": 1,
    "gov.kp": 1,
    "gov.ky": 1,
    "gov.kz": 1,
    "gov.la": 1,
    "gov.lb": 1,
    "gov.lc": 1,
    "gov.lk": 1,
    "gov.lr": 1,
    "gov.lt": 1,
    "gov.lv": 1,
    "gov.ly": 1,
    "gov.ma": 1,
    "gov.me": 1,
    "gov.mg": 1,
    "gov.mk": 1,
    "gov.ml": 1,
    "gov.mn": 1,
    "gov.mo": 1,
    "gov.mr": 1,
    "gov.mu": 1,
    "gov.mv": 1,
    "gov.mw": 1,
    "gov.my": 1,
    "gov.nc.tr": 1,
    "gov.ng": 1,
    "gov.nr": 1,
    "gov.ph": 1,
    "gov.pk": 1,
    "gov.pl": 1,
    "gov.pn": 1,
    "gov.pr": 1,
    "gov.ps": 1,
    "gov.pt": 1,
    "gov.qa": 1,
    "gov.rs": 1,
    "gov.ru": 1,
    "gov.rw": 1,
    "gov.sa": 1,
    "gov.sb": 1,
    "gov.sc": 1,
    "gov.sd": 1,
    "gov.sg": 1,
    "gov.sh": 1,
    "gov.sl": 1,
    "gov.st": 1,
    "gov.sx": 1,
    "gov.sy": 1,
    "gov.tj": 1,
    "gov.tl": 1,
    "gov.tm": 1,
    "gov.tn": 1,
    "gov.to": 1,
    "gov.tt": 1,
    "gov.tw": 1,
    "gov.ua": 1,
    "gov.vc": 1,
    "gov.ve": 1,
    "gov.vn": 1,
    "gov.ws": 1,
    "government.aero": 1,
    "gr.com": 1,
    "gr.it": 1,
    "gr.jp": 1,
    "grajewo.pl": 1,
    "gran.no": 1,
    "grandrapids.museum": 1,
    "grane.no": 1,
    "granvin.no": 1,
    "gratangen.no": 1,
    "graz.museum": 1,
    "greta.fr": 1,
    "grimstad.no": 1,
    "groks-the.info": 1,
    "groks-this.info": 1,
    "grong.no": 1,
    "grosseto.it": 1,
    "groundhandling.aero": 1,
    "group.aero": 1,
    "grozny.ru": 1,
    "grp.lk": 1,
    "grue.no": 1,
    "gs.aa.no": 1,
    "gs.ah.no": 1,
    "gs.bu.no": 1,
    "gs.cn": 1,
    "gs.fm.no": 1,
    "gs.hl.no": 1,
    "gs.hm.no": 1,
    "gs.jan-mayen.no": 1,
    "gs.mr.no": 1,
    "gs.nl.no": 1,
    "gs.nt.no": 1,
    "gs.of.no": 1,
    "gs.ol.no": 1,
    "gs.oslo.no": 1,
    "gs.rl.no": 1,
    "gs.sf.no": 1,
    "gs.st.no": 1,
    "gs.svalbard.no": 1,
    "gs.tm.no": 1,
    "gs.tr.no": 1,
    "gs.va.no": 1,
    "gs.vf.no": 1,
    "gsm.pl": 1,
    "gt": 2,
    "gu": 2,
    "gu.us": 1,
    "gub.uy": 1,
    "guernsey.museum": 1,
    "gujo.gifu.jp": 1,
    "gulen.no": 1,
    "gunma.jp": 1,
    "guovdageaidnu.no": 1,
    "gushikami.okinawa.jp": 1,
    "gv.ao": 1,
    "gv.at": 1,
    "gwangju.kr": 1,
    "gx.cn": 1,
    "gyeongbuk.kr": 1,
    "gyeonggi.kr": 1,
    "gyeongnam.kr": 1,
    "gyokuto.kumamoto.jp": 1,
    "gz.cn": 1,
    "g\u00e1ivuotna.no": 1,
    "g\u00e1ls\u00e1.no": 1,
    "g\u00e1\u014bgaviika.no": 1,
    "h.bg": 1,
    "h.se": 1,
    "ha.cn": 1,
    "ha.no": 1,
    "habikino.osaka.jp": 1,
    "habmer.no": 1,
    "haboro.hokkaido.jp": 1,
    "hachijo.tokyo.jp": 1,
    "hachinohe.aomori.jp": 1,
    "hachioji.tokyo.jp": 1,
    "hachirogata.akita.jp": 1,
    "hadano.kanagawa.jp": 1,
    "hadsel.no": 1,
    "haebaru.okinawa.jp": 1,
    "haga.tochigi.jp": 1,
    "hagebostad.no": 1,
    "hagi.yamaguchi.jp": 1,
    "haibara.shizuoka.jp": 1,
    "hakata.fukuoka.jp": 1,
    "hakodate.hokkaido.jp": 1,
    "hakone.kanagawa.jp": 1,
    "hakuba.nagano.jp": 1,
    "hakui.ishikawa.jp": 1,
    "hakusan.ishikawa.jp": 1,
    "halden.no": 1,
    "halloffame.museum": 1,
    "halsa.no": 1,
    "ham-radio-op.net": 1,
    "hamada.shimane.jp": 1,
    "hamamatsu.shizuoka.jp": 1,
    "hamar.no": 1,
    "hamaroy.no": 1,
    "hamatama.saga.jp": 1,
    "hamatonbetsu.hokkaido.jp": 1,
    "hamburg.museum": 1,
    "hammarfeasta.no": 1,
    "hammerfest.no": 1,
    "hamura.tokyo.jp": 1,
    "hanamaki.iwate.jp": 1,
    "hanamigawa.chiba.jp": 1,
    "hanawa.fukushima.jp": 1,
    "handa.aichi.jp": 1,
    "handson.museum": 1,
    "hanggliding.aero": 1,
    "hannan.osaka.jp": 1,
    "hanno.saitama.jp": 1,
    "hanyu.saitama.jp": 1,
    "hapmir.no": 1,
    "happou.akita.jp": 1,
    "hara.nagano.jp": 1,
    "haram.no": 1,
    "hareid.no": 1,
    "harima.hyogo.jp": 1,
    "harstad.no": 1,
    "harvestcelebration.museum": 1,
    "hasama.oita.jp": 1,
    "hasami.nagasaki.jp": 1,
    "hashikami.aomori.jp": 1,
    "hashima.gifu.jp": 1,
    "hashimoto.wakayama.jp": 1,
    "hasuda.saitama.jp": 1,
    "hasvik.no": 1,
    "hatogaya.saitama.jp": 1,
    "hatoyama.saitama.jp": 1,
    "hatsukaichi.hiroshima.jp": 1,
    "hattfjelldal.no": 1,
    "haugesund.no": 1,
    "hawaii.museum": 1,
    "hayakawa.yamanashi.jp": 1,
    "hayashima.okayama.jp": 1,
    "hazu.aichi.jp": 1,
    "hb.cn": 1,
    "he.cn": 1,
    "health.museum": 1,
    "health.vn": 1,
    "heguri.nara.jp": 1,
    "heimatunduhren.museum": 1,
    "hekinan.aichi.jp": 1,
    "hellas.museum": 1,
    "helsinki.museum": 1,
    "hembygdsforbund.museum": 1,
    "hemne.no": 1,
    "hemnes.no": 1,
    "hemsedal.no": 1,
    "herad.no": 1,
    "here-for-more.info": 1,
    "heritage.museum": 1,
    "heroy.more-og-romsdal.no": 1,
    "heroy.nordland.no": 1,
    "her\u00f8y.m\u00f8re-og-romsdal.no": 1,
    "her\u00f8y.nordland.no": 1,
    "hi.cn": 1,
    "hi.us": 1,
    "hichiso.gifu.jp": 1,
    "hida.gifu.jp": 1,
    "hidaka.hokkaido.jp": 1,
    "hidaka.kochi.jp": 1,
    "hidaka.saitama.jp": 1,
    "hidaka.wakayama.jp": 1,
    "higashi.fukuoka.jp": 1,
    "higashi.fukushima.jp": 1,
    "higashi.okinawa.jp": 1,
    "higashiagatsuma.gunma.jp": 1,
    "higashichichibu.saitama.jp": 1,
    "higashihiroshima.hiroshima.jp": 1,
    "higashiizu.shizuoka.jp": 1,
    "higashiizumo.shimane.jp": 1,
    "higashikagawa.kagawa.jp": 1,
    "higashikagura.hokkaido.jp": 1,
    "higashikawa.hokkaido.jp": 1,
    "higashikurume.tokyo.jp": 1,
    "higashimatsushima.miyagi.jp": 1,
    "higashimatsuyama.saitama.jp": 1,
    "higashimurayama.tokyo.jp": 1,
    "higashinaruse.akita.jp": 1,
    "higashine.yamagata.jp": 1,
    "higashiomi.shiga.jp": 1,
    "higashiosaka.osaka.jp": 1,
    "higashishirakawa.gifu.jp": 1,
    "higashisumiyoshi.osaka.jp": 1,
    "higashitsuno.kochi.jp": 1,
    "higashiura.aichi.jp": 1,
    "higashiyama.kyoto.jp": 1,
    "higashiyamato.tokyo.jp": 1,
    "higashiyodogawa.osaka.jp": 1,
    "higashiyoshino.nara.jp": 1,
    "hiji.oita.jp": 1,
    "hikari.yamaguchi.jp": 1,
    "hikawa.shimane.jp": 1,
    "hikimi.shimane.jp": 1,
    "hikone.shiga.jp": 1,
    "himeji.hyogo.jp": 1,
    "himeshima.oita.jp": 1,
    "himi.toyama.jp": 1,
    "hino.tokyo.jp": 1,
    "hino.tottori.jp": 1,
    "hinode.tokyo.jp": 1,
    "hinohara.tokyo.jp": 1,
    "hioki.kagoshima.jp": 1,
    "hirado.nagasaki.jp": 1,
    "hiraizumi.iwate.jp": 1,
    "hirakata.osaka.jp": 1,
    "hiranai.aomori.jp": 1,
    "hirara.okinawa.jp": 1,
    "hirata.fukushima.jp": 1,
    "hiratsuka.kanagawa.jp": 1,
    "hiraya.nagano.jp": 1,
    "hirogawa.wakayama.jp": 1,
    "hirokawa.fukuoka.jp": 1,
    "hirono.fukushima.jp": 1,
    "hirono.iwate.jp": 1,
    "hiroo.hokkaido.jp": 1,
    "hirosaki.aomori.jp": 1,
    "hiroshima.jp": 1,
    "hisayama.fukuoka.jp": 1,
    "histoire.museum": 1,
    "historical.museum": 1,
    "historicalsociety.museum": 1,
    "historichouses.museum": 1,
    "historisch.museum": 1,
    "historisches.museum": 1,
    "history.museum": 1,
    "historyofscience.museum": 1,
    "hita.oita.jp": 1,
    "hitachi.ibaraki.jp": 1,
    "hitachinaka.ibaraki.jp": 1,
    "hitachiomiya.ibaraki.jp": 1,
    "hitachiota.ibaraki.jp": 1,
    "hitoyoshi.kumamoto.jp": 1,
    "hitra.no": 1,
    "hizen.saga.jp": 1,
    "hjartdal.no": 1,
    "hjelmeland.no": 1,
    "hk.cn": 1,
    "hl.cn": 1,
    "hl.no": 1,
    "hm.no": 1,
    "hn.cn": 1,
    "hobby-site.com": 1,
    "hobby-site.org": 1,
    "hobol.no": 1,
    "hob\u00f8l.no": 1,
    "hof.no": 1,
    "hofu.yamaguchi.jp": 1,
    "hokkaido.jp": 1,
    "hokksund.no": 1,
    "hokuryu.hokkaido.jp": 1,
    "hokuto.hokkaido.jp": 1,
    "hokuto.yamanashi.jp": 1,
    "hol.no": 1,
    "hole.no": 1,
    "holmestrand.no": 1,
    "holtalen.no": 1,
    "holt\u00e5len.no": 1,
    "home.dyndns.org": 1,
    "homebuilt.aero": 1,
    "homedns.org": 1,
    "homeftp.net": 1,
    "homeftp.org": 1,
    "homeip.net": 1,
    "homelinux.com": 1,
    "homelinux.net": 1,
    "homelinux.org": 1,
    "homeunix.com": 1,
    "homeunix.net": 1,
    "homeunix.org": 1,
    "honai.ehime.jp": 1,
    "honbetsu.hokkaido.jp": 1,
    "honefoss.no": 1,
    "hongo.hiroshima.jp": 1,
    "honjo.akita.jp": 1,
    "honjo.saitama.jp": 1,
    "honjyo.akita.jp": 1,
    "hornindal.no": 1,
    "horokanai.hokkaido.jp": 1,
    "horology.museum": 1,
    "horonobe.hokkaido.jp": 1,
    "horten.no": 1,
    "hotel.hu": 1,
    "hotel.lk": 1,
    "house.museum": 1,
    "hoyanger.no": 1,
    "hoylandet.no": 1,
    "hs.kr": 1,
    "hu.com": 1,
    "hu.net": 1,
    "huissier-justice.fr": 1,
    "humanities.museum": 1,
    "hurdal.no": 1,
    "hurum.no": 1,
    "hvaler.no": 1,
    "hyllestad.no": 1,
    "hyogo.jp": 1,
    "hyuga.miyazaki.jp": 1,
    "h\u00e1bmer.no": 1,
    "h\u00e1mm\u00e1rfeasta.no": 1,
    "h\u00e1pmir.no": 1,
    "h\u00e5.no": 1,
    "h\u00e6gebostad.no": 1,
    "h\u00f8nefoss.no": 1,
    "h\u00f8yanger.no": 1,
    "h\u00f8ylandet.no": 1,
    "i.bg": 1,
    "i.ph": 1,
    "i.se": 1,
    "ia.us": 1,
    "iamallama.com": 1,
    "ibara.okayama.jp": 1,
    "ibaraki.ibaraki.jp": 1,
    "ibaraki.jp": 1,
    "ibaraki.osaka.jp": 1,
    "ibestad.no": 1,
    "ibigawa.gifu.jp": 1,
    "ichiba.tokushima.jp": 1,
    "ichihara.chiba.jp": 1,
    "ichikai.tochigi.jp": 1,
    "ichikawa.chiba.jp": 1,
    "ichikawa.hyogo.jp": 1,
    "ichikawamisato.yamanashi.jp": 1,
    "ichinohe.iwate.jp": 1,
    "ichinomiya.aichi.jp": 1,
    "ichinomiya.chiba.jp": 1,
    "ichinoseki.iwate.jp": 1,
    "id.au": 1,
    "id.ir": 1,
    "id.lv": 1,
    "id.ly": 1,
    "id.us": 1,
    "ide.kyoto.jp": 1,
    "idrett.no": 1,
    "idv.hk": 1,
    "idv.tw": 1,
    "if.ua": 1,
    "iglesias-carbonia.it": 1,
    "iglesiascarbonia.it": 1,
    "iheya.okinawa.jp": 1,
    "iida.nagano.jp": 1,
    "iide.yamagata.jp": 1,
    "iijima.nagano.jp": 1,
    "iitate.fukushima.jp": 1,
    "iiyama.nagano.jp": 1,
    "iizuka.fukuoka.jp": 1,
    "iizuna.nagano.jp": 1,
    "ikaruga.nara.jp": 1,
    "ikata.ehime.jp": 1,
    "ikawa.akita.jp": 1,
    "ikeda.fukui.jp": 1,
    "ikeda.gifu.jp": 1,
    "ikeda.hokkaido.jp": 1,
    "ikeda.nagano.jp": 1,
    "ikeda.osaka.jp": 1,
    "iki.fi": 1,
    "iki.nagasaki.jp": 1,
    "ikoma.nara.jp": 1,
    "ikusaka.nagano.jp": 1,
    "il": 2,
    "il.us": 1,
    "ilawa.pl": 1,
    "illustration.museum": 1,
    "im.it": 1,
    "imabari.ehime.jp": 1,
    "imageandsound.museum": 1,
    "imakane.hokkaido.jp": 1,
    "imari.saga.jp": 1,
    "imb.br": 1,
    "imizu.toyama.jp": 1,
    "imperia.it": 1,
    "in-addr.arpa": 1,
    "in-the-band.net": 1,
    "in.na": 1,
    "in.rs": 1,
    "in.th": 1,
    "in.ua": 1,
    "in.us": 1,
    "ina.ibaraki.jp": 1,
    "ina.nagano.jp": 1,
    "ina.saitama.jp": 1,
    "inabe.mie.jp": 1,
    "inagawa.hyogo.jp": 1,
    "inagi.tokyo.jp": 1,
    "inami.toyama.jp": 1,
    "inami.wakayama.jp": 1,
    "inashiki.ibaraki.jp": 1,
    "inatsuki.fukuoka.jp": 1,
    "inawashiro.fukushima.jp": 1,
    "inazawa.aichi.jp": 1,
    "incheon.kr": 1,
    "ind.br": 1,
    "ind.in": 1,
    "ind.tn": 1,
    "inderoy.no": 1,
    "inder\u00f8y.no": 1,
    "indian.museum": 1,
    "indiana.museum": 1,
    "indianapolis.museum": 1,
    "indianmarket.museum": 1,
    "ine.kyoto.jp": 1,
    "inf.br": 1,
    "inf.cu": 1,
    "inf.mk": 1,
    "info.at": 1,
    "info.au": 1,
    "info.az": 1,
    "info.bb": 1,
    "info.co": 1,
    "info.ec": 1,
    "info.ht": 1,
    "info.hu": 1,
    "info.ki": 1,
    "info.la": 1,
    "info.mv": 1,
    "info.na": 1,
    "info.nf": 1,
    "info.nr": 1,
    "info.pk": 1,
    "info.pl": 1,
    "info.pr": 1,
    "info.ro": 1,
    "info.sd": 1,
    "info.tn": 1,
    "info.tt": 1,
    "info.ve": 1,
    "info.vn": 1,
    "ing.pa": 1,
    "ingatlan.hu": 1,
    "ino.kochi.jp": 1,
    "insurance.aero": 1,
    "int.az": 1,
    "int.bo": 1,
    "int.ci": 1,
    "int.co": 1,
    "int.is": 1,
    "int.la": 1,
    "int.lk": 1,
    "int.mv": 1,
    "int.mw": 1,
    "int.pt": 1,
    "int.ru": 1,
    "int.rw": 1,
    "int.tj": 1,
    "int.tt": 1,
    "int.vn": 1,
    "intelligence.museum": 1,
    "interactive.museum": 1,
    "intl.tn": 1,
    "inuyama.aichi.jp": 1,
    "inzai.chiba.jp": 1,
    "ip6.arpa": 1,
    "iraq.museum": 1,
    "irc.pl": 1,
    "iris.arpa": 1,
    "irkutsk.ru": 1,
    "iron.museum": 1,
    "iruma.saitama.jp": 1,
    "is-a-anarchist.com": 1,
    "is-a-blogger.com": 1,
    "is-a-bookkeeper.com": 1,
    "is-a-bruinsfan.org": 1,
    "is-a-bulls-fan.com": 1,
    "is-a-candidate.org": 1,
    "is-a-caterer.com": 1,
    "is-a-celticsfan.org": 1,
    "is-a-chef.com": 1,
    "is-a-chef.net": 1,
    "is-a-chef.org": 1,
    "is-a-conservative.com": 1,
    "is-a-cpa.com": 1,
    "is-a-cubicle-slave.com": 1,
    "is-a-democrat.com": 1,
    "is-a-designer.com": 1,
    "is-a-doctor.com": 1,
    "is-a-financialadvisor.com": 1,
    "is-a-geek.com": 1,
    "is-a-geek.net": 1,
    "is-a-geek.org": 1,
    "is-a-green.com": 1,
    "is-a-guru.com": 1,
    "is-a-hard-worker.com": 1,
    "is-a-hunter.com": 1,
    "is-a-knight.org": 1,
    "is-a-landscaper.com": 1,
    "is-a-lawyer.com": 1,
    "is-a-liberal.com": 1,
    "is-a-libertarian.com": 1,
    "is-a-linux-user.org": 1,
    "is-a-llama.com": 1,
    "is-a-musician.com": 1,
    "is-a-nascarfan.com": 1,
    "is-a-nurse.com": 1,
    "is-a-painter.com": 1,
    "is-a-patsfan.org": 1,
    "is-a-personaltrainer.com": 1,
    "is-a-photographer.com": 1,
    "is-a-player.com": 1,
    "is-a-republican.com": 1,
    "is-a-rockstar.com": 1,
    "is-a-socialist.com": 1,
    "is-a-soxfan.org": 1,
    "is-a-student.com": 1,
    "is-a-teacher.com": 1,
    "is-a-techie.com": 1,
    "is-a-therapist.com": 1,
    "is-an-accountant.com": 1,
    "is-an-actor.com": 1,
    "is-an-actress.com": 1,
    "is-an-anarchist.com": 1,
    "is-an-artist.com": 1,
    "is-an-engineer.com": 1,
    "is-an-entertainer.com": 1,
    "is-by.us": 1,
    "is-certified.com": 1,
    "is-found.org": 1,
    "is-gone.com": 1,
    "is-into-anime.com": 1,
    "is-into-cars.com": 1,
    "is-into-cartoons.com": 1,
    "is-into-games.com": 1,
    "is-leet.com": 1,
    "is-lost.org": 1,
    "is-not-certified.com": 1,
    "is-saved.org": 1,
    "is-slick.com": 1,
    "is-uberleet.com": 1,
    "is-very-bad.org": 1,
    "is-very-evil.org": 1,
    "is-very-good.org": 1,
    "is-very-nice.org": 1,
    "is-very-sweet.org": 1,
    "is-with-theband.com": 1,
    "is.it": 1,
    "isa-geek.com": 1,
    "isa-geek.net": 1,
    "isa-geek.org": 1,
    "isa-hockeynut.com": 1,
    "isa.kagoshima.jp": 1,
    "isa.us": 1,
    "isahaya.nagasaki.jp": 1,
    "ise.mie.jp": 1,
    "isehara.kanagawa.jp": 1,
    "isen.kagoshima.jp": 1,
    "isernia.it": 1,
    "isesaki.gunma.jp": 1,
    "ishigaki.okinawa.jp": 1,
    "ishikari.hokkaido.jp": 1,
    "ishikawa.fukushima.jp": 1,
    "ishikawa.jp": 1,
    "ishikawa.okinawa.jp": 1,
    "ishinomaki.miyagi.jp": 1,
    "isla.pr": 1,
    "isleofman.museum": 1,
    "isshiki.aichi.jp": 1,
    "issmarterthanyou.com": 1,
    "isteingeek.de": 1,
    "istmein.de": 1,
    "isumi.chiba.jp": 1,
    "it.ao": 1,
    "itabashi.tokyo.jp": 1,
    "itako.ibaraki.jp": 1,
    "itakura.gunma.jp": 1,
    "itami.hyogo.jp": 1,
    "itano.tokushima.jp": 1,
    "itayanagi.aomori.jp": 1,
    "ito.shizuoka.jp": 1,
    "itoigawa.niigata.jp": 1,
    "itoman.okinawa.jp": 1,
    "its.me": 1,
    "ivano-frankivsk.ua": 1,
    "ivanovo.ru": 1,
    "iveland.no": 1,
    "ivgu.no": 1,
    "iwade.wakayama.jp": 1,
    "iwafune.tochigi.jp": 1,
    "iwaizumi.iwate.jp": 1,
    "iwaki.fukushima.jp": 1,
    "iwakuni.yamaguchi.jp": 1,
    "iwakura.aichi.jp": 1,
    "iwama.ibaraki.jp": 1,
    "iwamizawa.hokkaido.jp": 1,
    "iwanai.hokkaido.jp": 1,
    "iwanuma.miyagi.jp": 1,
    "iwata.shizuoka.jp": 1,
    "iwate.iwate.jp": 1,
    "iwate.jp": 1,
    "iwatsuki.saitama.jp": 1,
    "iyo.ehime.jp": 1,
    "iz.hr": 1,
    "izena.okinawa.jp": 1,
    "izhevsk.ru": 1,
    "izu.shizuoka.jp": 1,
    "izumi.kagoshima.jp": 1,
    "izumi.osaka.jp": 1,
    "izumiotsu.osaka.jp": 1,
    "izumisano.osaka.jp": 1,
    "izumizaki.fukushima.jp": 1,
    "izumo.shimane.jp": 1,
    "izumozaki.niigata.jp": 1,
    "izunokuni.shizuoka.jp": 1,
    "j.bg": 1,
    "jamal.ru": 1,
    "jamison.museum": 1,
    "jan-mayen.no": 1,
    "jar.ru": 1,
    "jaworzno.pl": 1,
    "jefferson.museum": 1,
    "jeju.kr": 1,
    "jelenia-gora.pl": 1,
    "jeonbuk.kr": 1,
    "jeonnam.kr": 1,
    "jerusalem.museum": 1,
    "jessheim.no": 1,
    "jet.uk": 0,
    "jevnaker.no": 1,
    "jewelry.museum": 1,
    "jewish.museum": 1,
    "jewishart.museum": 1,
    "jfk.museum": 1,
    "jgora.pl": 1,
    "jinsekikogen.hiroshima.jp": 1,
    "jl.cn": 1,
    "jm": 2,
    "joboji.iwate.jp": 1,
    "jobs.tt": 1,
    "joetsu.niigata.jp": 1,
    "jogasz.hu": 1,
    "johana.toyama.jp": 1,
    "jolster.no": 1,
    "jondal.no": 1,
    "jor.br": 1,
    "jorpeland.no": 1,
    "joshkar-ola.ru": 1,
    "joso.ibaraki.jp": 1,
    "journal.aero": 1,
    "journalism.museum": 1,
    "journalist.aero": 1,
    "joyo.kyoto.jp": 1,
    "jp.net": 1,
    "jpn.com": 1,
    "js.cn": 1,
    "judaica.museum": 1,
    "judygarland.museum": 1,
    "juedisches.museum": 1,
    "juif.museum": 1,
    "jur.pro": 1,
    "jus.br": 1,
    "jx.cn": 1,
    "j\u00f8lster.no": 1,
    "j\u00f8rpeland.no": 1,
    "k-uralsk.ru": 1,
    "k.bg": 1,
    "k.se": 1,
    "k12.ak.us": 1,
    "k12.al.us": 1,
    "k12.ar.us": 1,
    "k12.as.us": 1,
    "k12.az.us": 1,
    "k12.ca.us": 1,
    "k12.co.us": 1,
    "k12.ct.us": 1,
    "k12.dc.us": 1,
    "k12.de.us": 1,
    "k12.ec": 1,
    "k12.fl.us": 1,
    "k12.ga.us": 1,
    "k12.gu.us": 1,
    "k12.ia.us": 1,
    "k12.id.us": 1,
    "k12.il.us": 1,
    "k12.in.us": 1,
    "k12.ks.us": 1,
    "k12.ky.us": 1,
    "k12.la.us": 1,
    "k12.ma.us": 1,
    "k12.md.us": 1,
    "k12.me.us": 1,
    "k12.mi.us": 1,
    "k12.mn.us": 1,
    "k12.mo.us": 1,
    "k12.ms.us": 1,
    "k12.mt.us": 1,
    "k12.nc.us": 1,
    "k12.nd.us": 1,
    "k12.ne.us": 1,
    "k12.nh.us": 1,
    "k12.nj.us": 1,
    "k12.nm.us": 1,
    "k12.nv.us": 1,
    "k12.ny.us": 1,
    "k12.oh.us": 1,
    "k12.ok.us": 1,
    "k12.or.us": 1,
    "k12.pa.us": 1,
    "k12.pr.us": 1,
    "k12.ri.us": 1,
    "k12.sc.us": 1,
    "k12.sd.us": 1,
    "k12.tn.us": 1,
    "k12.tx.us": 1,
    "k12.ut.us": 1,
    "k12.va.us": 1,
    "k12.vi": 1,
    "k12.vi.us": 1,
    "k12.vt.us": 1,
    "k12.wa.us": 1,
    "k12.wi.us": 1,
    "k12.wv.us": 1,
    "k12.wy.us": 1,
    "kadena.okinawa.jp": 1,
    "kadogawa.miyazaki.jp": 1,
    "kadoma.osaka.jp": 1,
    "kafjord.no": 1,
    "kaga.ishikawa.jp": 1,
    "kagami.kochi.jp": 1,
    "kagamiishi.fukushima.jp": 1,
    "kagamino.okayama.jp": 1,
    "kagawa.jp": 1,
    "kagoshima.jp": 1,
    "kagoshima.kagoshima.jp": 1,
    "kaho.fukuoka.jp": 1,
    "kahoku.ishikawa.jp": 1,
    "kahoku.yamagata.jp": 1,
    "kai.yamanashi.jp": 1,
    "kainan.tokushima.jp": 1,
    "kainan.wakayama.jp": 1,
    "kaisei.kanagawa.jp": 1,
    "kaita.hiroshima.jp": 1,
    "kaizuka.osaka.jp": 1,
    "kakamigahara.gifu.jp": 1,
    "kakegawa.shizuoka.jp": 1,
    "kakinoki.shimane.jp": 1,
    "kakogawa.hyogo.jp": 1,
    "kakuda.miyagi.jp": 1,
    "kalisz.pl": 1,
    "kalmykia.ru": 1,
    "kaluga.ru": 1,
    "kamagaya.chiba.jp": 1,
    "kamaishi.iwate.jp": 1,
    "kamakura.kanagawa.jp": 1,
    "kamchatka.ru": 1,
    "kameoka.kyoto.jp": 1,
    "kameyama.mie.jp": 1,
    "kami.kochi.jp": 1,
    "kami.miyagi.jp": 1,
    "kamiamakusa.kumamoto.jp": 1,
    "kamifurano.hokkaido.jp": 1,
    "kamigori.hyogo.jp": 1,
    "kamiichi.toyama.jp": 1,
    "kamiizumi.saitama.jp": 1,
    "kamijima.ehime.jp": 1,
    "kamikawa.hokkaido.jp": 1,
    "kamikawa.hyogo.jp": 1,
    "kamikawa.saitama.jp": 1,
    "kamikitayama.nara.jp": 1,
    "kamikoani.akita.jp": 1,
    "kamimine.saga.jp": 1,
    "kaminokawa.tochigi.jp": 1,
    "kaminoyama.yamagata.jp": 1,
    "kamioka.akita.jp": 1,
    "kamisato.saitama.jp": 1,
    "kamishihoro.hokkaido.jp": 1,
    "kamisu.ibaraki.jp": 1,
    "kamisunagawa.hokkaido.jp": 1,
    "kamitonda.wakayama.jp": 1,
    "kamitsue.oita.jp": 1,
    "kamo.kyoto.jp": 1,
    "kamo.niigata.jp": 1,
    "kamoenai.hokkaido.jp": 1,
    "kamogawa.chiba.jp": 1,
    "kanagawa.jp": 1,
    "kanan.osaka.jp": 1,
    "kanazawa.ishikawa.jp": 1,
    "kanegasaki.iwate.jp": 1,
    "kaneyama.fukushima.jp": 1,
    "kaneyama.yamagata.jp": 1,
    "kani.gifu.jp": 1,
    "kanie.aichi.jp": 1,
    "kanmaki.nara.jp": 1,
    "kanna.gunma.jp": 1,
    "kannami.shizuoka.jp": 1,
    "kanonji.kagawa.jp": 1,
    "kanoya.kagoshima.jp": 1,
    "kanra.gunma.jp": 1,
    "kanuma.tochigi.jp": 1,
    "kanzaki.saga.jp": 1,
    "karasjohka.no": 1,
    "karasjok.no": 1,
    "karasuyama.tochigi.jp": 1,
    "karate.museum": 1,
    "karatsu.saga.jp": 1,
    "karelia.ru": 1,
    "karikatur.museum": 1,
    "kariwa.niigata.jp": 1,
    "kariya.aichi.jp": 1,
    "karlsoy.no": 1,
    "karmoy.no": 1,
    "karm\u00f8y.no": 1,
    "karpacz.pl": 1,
    "kartuzy.pl": 1,
    "karuizawa.nagano.jp": 1,
    "karumai.iwate.jp": 1,
    "kasahara.gifu.jp": 1,
    "kasai.hyogo.jp": 1,
    "kasama.ibaraki.jp": 1,
    "kasamatsu.gifu.jp": 1,
    "kasaoka.okayama.jp": 1,
    "kashiba.nara.jp": 1,
    "kashihara.nara.jp": 1,
    "kashima.ibaraki.jp": 1,
    "kashima.kumamoto.jp": 1,
    "kashima.saga.jp": 1,
    "kashiwa.chiba.jp": 1,
    "kashiwara.osaka.jp": 1,
    "kashiwazaki.niigata.jp": 1,
    "kasuga.fukuoka.jp": 1,
    "kasuga.hyogo.jp": 1,
    "kasugai.aichi.jp": 1,
    "kasukabe.saitama.jp": 1,
    "kasumigaura.ibaraki.jp": 1,
    "kasuya.fukuoka.jp": 1,
    "kaszuby.pl": 1,
    "katagami.akita.jp": 1,
    "katano.osaka.jp": 1,
    "katashina.gunma.jp": 1,
    "katori.chiba.jp": 1,
    "katowice.pl": 1,
    "katsuragi.nara.jp": 1,
    "katsuragi.wakayama.jp": 1,
    "katsushika.tokyo.jp": 1,
    "katsuura.chiba.jp": 1,
    "katsuyama.fukui.jp": 1,
    "kautokeino.no": 1,
    "kawaba.gunma.jp": 1,
    "kawachinagano.osaka.jp": 1,
    "kawagoe.mie.jp": 1,
    "kawagoe.saitama.jp": 1,
    "kawaguchi.saitama.jp": 1,
    "kawahara.tottori.jp": 1,
    "kawai.iwate.jp": 1,
    "kawai.nara.jp": 1,
    "kawajima.saitama.jp": 1,
    "kawakami.nagano.jp": 1,
    "kawakami.nara.jp": 1,
    "kawakita.ishikawa.jp": 1,
    "kawamata.fukushima.jp": 1,
    "kawaminami.miyazaki.jp": 1,
    "kawanabe.kagoshima.jp": 1,
    "kawanehon.shizuoka.jp": 1,
    "kawanishi.hyogo.jp": 1,
    "kawanishi.nara.jp": 1,
    "kawanishi.yamagata.jp": 1,
    "kawara.fukuoka.jp": 1,
    "kawasaki.jp": 2,
    "kawasaki.miyagi.jp": 1,
    "kawatana.nagasaki.jp": 1,
    "kawaue.gifu.jp": 1,
    "kawazu.shizuoka.jp": 1,
    "kayabe.hokkaido.jp": 1,
    "kazan.ru": 1,
    "kazimierz-dolny.pl": 1,
    "kazo.saitama.jp": 1,
    "kazuno.akita.jp": 1,
    "kchr.ru": 1,
    "ke": 2,
    "keisen.fukuoka.jp": 1,
    "kembuchi.hokkaido.jp": 1,
    "kemerovo.ru": 1,
    "kepno.pl": 1,
    "kesennuma.miyagi.jp": 1,
    "ketrzyn.pl": 1,
    "kg.kr": 1,
    "kh": 2,
    "kh.ua": 1,
    "khabarovsk.ru": 1,
    "khakassia.ru": 1,
    "kharkiv.ua": 1,
    "kharkov.ua": 1,
    "kherson.ua": 1,
    "khmelnitskiy.ua": 1,
    "khmelnytskyi.ua": 1,
    "khv.ru": 1,
    "kibichuo.okayama.jp": 1,
    "kicks-ass.net": 1,
    "kicks-ass.org": 1,
    "kids.museum": 1,
    "kids.us": 1,
    "kiev.ua": 1,
    "kiho.mie.jp": 1,
    "kihoku.ehime.jp": 1,
    "kijo.miyazaki.jp": 1,
    "kikonai.hokkaido.jp": 1,
    "kikuchi.kumamoto.jp": 1,
    "kikugawa.shizuoka.jp": 1,
    "kimino.wakayama.jp": 1,
    "kimitsu.chiba.jp": 1,
    "kimobetsu.hokkaido.jp": 1,
    "kin.okinawa.jp": 1,
    "kinko.kagoshima.jp": 1,
    "kinokawa.wakayama.jp": 1,
    "kira.aichi.jp": 1,
    "kirkenes.no": 1,
    "kirov.ru": 1,
    "kirovograd.ua": 1,
    "kiryu.gunma.jp": 1,
    "kisarazu.chiba.jp": 1,
    "kishiwada.osaka.jp": 1,
    "kiso.nagano.jp": 1,
    "kisofukushima.nagano.jp": 1,
    "kisosaki.mie.jp": 1,
    "kita.kyoto.jp": 1,
    "kita.osaka.jp": 1,
    "kita.tokyo.jp": 1,
    "kitaaiki.nagano.jp": 1,
    "kitaakita.akita.jp": 1,
    "kitadaito.okinawa.jp": 1,
    "kitagata.gifu.jp": 1,
    "kitagata.saga.jp": 1,
    "kitagawa.kochi.jp": 1,
    "kitagawa.miyazaki.jp": 1,
    "kitahata.saga.jp": 1,
    "kitahiroshima.hokkaido.jp": 1,
    "kitakami.iwate.jp": 1,
    "kitakata.fukushima.jp": 1,
    "kitakata.miyazaki.jp": 1,
    "kitakyushu.jp": 2,
    "kitami.hokkaido.jp": 1,
    "kitamoto.saitama.jp": 1,
    "kitanakagusuku.okinawa.jp": 1,
    "kitashiobara.fukushima.jp": 1,
    "kitaura.miyazaki.jp": 1,
    "kitayama.wakayama.jp": 1,
    "kiwa.mie.jp": 1,
    "kiyama.saga.jp": 1,
    "kiyokawa.kanagawa.jp": 1,
    "kiyosato.hokkaido.jp": 1,
    "kiyose.tokyo.jp": 1,
    "kiyosu.aichi.jp": 1,
    "kizu.kyoto.jp": 1,
    "klabu.no": 1,
    "klepp.no": 1,
    "klodzko.pl": 1,
    "kl\u00e6bu.no": 1,
    "km.ua": 1,
    "kms.ru": 1,
    "knowsitall.info": 1,
    "kobayashi.miyazaki.jp": 1,
    "kobe.jp": 2,
    "kobierzyce.pl": 1,
    "kochi.jp": 1,
    "kochi.kochi.jp": 1,
    "kodaira.tokyo.jp": 1,
    "koebenhavn.museum": 1,
    "koeln.museum": 1,
    "koenig.ru": 1,
    "kofu.yamanashi.jp": 1,
    "koga.fukuoka.jp": 1,
    "koga.ibaraki.jp": 1,
    "koganei.tokyo.jp": 1,
    "koge.tottori.jp": 1,
    "koka.shiga.jp": 1,
    "kokonoe.oita.jp": 1,
    "kokubunji.tokyo.jp": 1,
    "kolobrzeg.pl": 1,
    "komae.tokyo.jp": 1,
    "komagane.nagano.jp": 1,
    "komaki.aichi.jp": 1,
    "komatsu.ishikawa.jp": 1,
    "komatsushima.tokushima.jp": 1,
    "komforb.se": 1,
    "komi.ru": 1,
    "kommunalforbund.se": 1,
    "kommune.no": 1,
    "komono.mie.jp": 1,
    "komoro.nagano.jp": 1,
    "komvux.se": 1,
    "konan.aichi.jp": 1,
    "konan.shiga.jp": 1,
    "kongsberg.no": 1,
    "kongsvinger.no": 1,
    "konin.pl": 1,
    "konskowola.pl": 1,
    "konyvelo.hu": 1,
    "koori.fukushima.jp": 1,
    "kopervik.no": 1,
    "koriyama.fukushima.jp": 1,
    "koryo.nara.jp": 1,
    "kosa.kumamoto.jp": 1,
    "kosai.shizuoka.jp": 1,
    "kosaka.akita.jp": 1,
    "kosei.shiga.jp": 1,
    "koshigaya.saitama.jp": 1,
    "koshimizu.hokkaido.jp": 1,
    "koshu.yamanashi.jp": 1,
    "kostroma.ru": 1,
    "kosuge.yamanashi.jp": 1,
    "kota.aichi.jp": 1,
    "koto.shiga.jp": 1,
    "koto.tokyo.jp": 1,
    "kotohira.kagawa.jp": 1,
    "kotoura.tottori.jp": 1,
    "kouhoku.saga.jp": 1,
    "kounosu.saitama.jp": 1,
    "kouyama.kagoshima.jp": 1,
    "kouzushima.tokyo.jp": 1,
    "koya.wakayama.jp": 1,
    "koza.wakayama.jp": 1,
    "kozagawa.wakayama.jp": 1,
    "kozaki.chiba.jp": 1,
    "kr.com": 1,
    "kr.it": 1,
    "kr.ua": 1,
    "kraanghke.no": 1,
    "kragero.no": 1,
    "krager\u00f8.no": 1,
    "krakow.pl": 1,
    "krasnoyarsk.ru": 1,
    "kristiansand.no": 1,
    "kristiansund.no": 1,
    "krodsherad.no": 1,
    "krokstadelva.no": 1,
    "krym.ua": 1,
    "kr\u00e5anghke.no": 1,
    "kr\u00f8dsherad.no": 1,
    "ks.ua": 1,
    "ks.us": 1,
    "kuban.ru": 1,
    "kuchinotsu.nagasaki.jp": 1,
    "kudamatsu.yamaguchi.jp": 1,
    "kudoyama.wakayama.jp": 1,
    "kui.hiroshima.jp": 1,
    "kuji.iwate.jp": 1,
    "kuju.oita.jp": 1,
    "kujukuri.chiba.jp": 1,
    "kuki.saitama.jp": 1,
    "kumagaya.saitama.jp": 1,
    "kumakogen.ehime.jp": 1,
    "kumamoto.jp": 1,
    "kumamoto.kumamoto.jp": 1,
    "kumano.hiroshima.jp": 1,
    "kumano.mie.jp": 1,
    "kumatori.osaka.jp": 1,
    "kumejima.okinawa.jp": 1,
    "kumenan.okayama.jp": 1,
    "kumiyama.kyoto.jp": 1,
    "kunigami.okinawa.jp": 1,
    "kunimi.fukushima.jp": 1,
    "kunisaki.oita.jp": 1,
    "kunitachi.tokyo.jp": 1,
    "kunitomi.miyazaki.jp": 1,
    "kunneppu.hokkaido.jp": 1,
    "kunohe.iwate.jp": 1,
    "kunst.museum": 1,
    "kunstsammlung.museum": 1,
    "kunstunddesign.museum": 1,
    "kurashiki.okayama.jp": 1,
    "kurate.fukuoka.jp": 1,
    "kure.hiroshima.jp": 1,
    "kurgan.ru": 1,
    "kuriyama.hokkaido.jp": 1,
    "kurobe.toyama.jp": 1,
    "kurogi.fukuoka.jp": 1,
    "kuroishi.aomori.jp": 1,
    "kuroiso.tochigi.jp": 1,
    "kuromatsunai.hokkaido.jp": 1,
    "kurotaki.nara.jp": 1,
    "kursk.ru": 1,
    "kurume.fukuoka.jp": 1,
    "kusatsu.gunma.jp": 1,
    "kusatsu.shiga.jp": 1,
    "kushima.miyazaki.jp": 1,
    "kushimoto.wakayama.jp": 1,
    "kushiro.hokkaido.jp": 1,
    "kustanai.ru": 1,
    "kusu.oita.jp": 1,
    "kutchan.hokkaido.jp": 1,
    "kutno.pl": 1,
    "kuwana.mie.jp": 1,
    "kuzbass.ru": 1,
    "kuzumaki.iwate.jp": 1,
    "kv.ua": 1,
    "kvafjord.no": 1,
    "kvalsund.no": 1,
    "kvam.no": 1,
    "kvanangen.no": 1,
    "kvinesdal.no": 1,
    "kvinnherad.no": 1,
    "kviteseid.no": 1,
    "kvitsoy.no": 1,
    "kvits\u00f8y.no": 1,
    "kv\u00e6fjord.no": 1,
    "kv\u00e6nangen.no": 1,
    "kw": 2,
    "ky.us": 1,
    "kyiv.ua": 1,
    "kyonan.chiba.jp": 1,
    "kyotamba.kyoto.jp": 1,
    "kyotanabe.kyoto.jp": 1,
    "kyotango.kyoto.jp": 1,
    "kyoto.jp": 1,
    "kyowa.akita.jp": 1,
    "kyowa.hokkaido.jp": 1,
    "kyuragi.saga.jp": 1,
    "k\u00e1r\u00e1\u0161johka.no": 1,
    "k\u00e5fjord.no": 1,
    "l.bg": 1,
    "l.se": 1,
    "la-spezia.it": 1,
    "la.us": 1,
    "laakesvuemie.no": 1,
    "labor.museum": 1,
    "labour.museum": 1,
    "lahppi.no": 1,
    "lajolla.museum": 1,
    "lakas.hu": 1,
    "lanbib.se": 1,
    "lancashire.museum": 1,
    "land-4-sale.us": 1,
    "landes.museum": 1,
    "langevag.no": 1,
    "langev\u00e5g.no": 1,
    "lans.museum": 1,
    "lapy.pl": 1,
    "laquila.it": 1,
    "lardal.no": 1,
    "larsson.museum": 1,
    "larvik.no": 1,
    "laspezia.it": 1,
    "latina.it": 1,
    "lavagis.no": 1,
    "lavangen.no": 1,
    "law.pro": 1,
    "lc.it": 1,
    "le.it": 1,
    "leangaviika.no": 1,
    "leasing.aero": 1,
    "lea\u014bgaviika.no": 1,
    "lebesby.no": 1,
    "lebork.pl": 1,
    "lebtimnetz.de": 1,
    "lecce.it": 1,
    "lecco.it": 1,
    "leg.br": 1,
    "legnica.pl": 1,
    "leikanger.no": 1,
    "leirfjord.no": 1,
    "leirvik.no": 1,
    "leitungsen.de": 1,
    "leka.no": 1,
    "leksvik.no": 1,
    "lel.br": 1,
    "lenvik.no": 1,
    "lerdal.no": 1,
    "lesja.no": 1,
    "levanger.no": 1,
    "lewismiller.museum": 1,
    "lezajsk.pl": 1,
    "lg.jp": 1,
    "lg.ua": 1,
    "li.it": 1,
    "lib.ak.us": 1,
    "lib.al.us": 1,
    "lib.ar.us": 1,
    "lib.as.us": 1,
    "lib.az.us": 1,
    "lib.ca.us": 1,
    "lib.co.us": 1,
    "lib.ct.us": 1,
    "lib.dc.us": 1,
    "lib.de.us": 1,
    "lib.ee": 1,
    "lib.fl.us": 1,
    "lib.ga.us": 1,
    "lib.gu.us": 1,
    "lib.hi.us": 1,
    "lib.ia.us": 1,
    "lib.id.us": 1,
    "lib.il.us": 1,
    "lib.in.us": 1,
    "lib.ks.us": 1,
    "lib.ky.us": 1,
    "lib.la.us": 1,
    "lib.ma.us": 1,
    "lib.md.us": 1,
    "lib.me.us": 1,
    "lib.mi.us": 1,
    "lib.mn.us": 1,
    "lib.mo.us": 1,
    "lib.ms.us": 1,
    "lib.mt.us": 1,
    "lib.nc.us": 1,
    "lib.nd.us": 1,
    "lib.ne.us": 1,
    "lib.nh.us": 1,
    "lib.nj.us": 1,
    "lib.nm.us": 1,
    "lib.nv.us": 1,
    "lib.ny.us": 1,
    "lib.oh.us": 1,
    "lib.ok.us": 1,
    "lib.or.us": 1,
    "lib.pa.us": 1,
    "lib.pr.us": 1,
    "lib.ri.us": 1,
    "lib.sc.us": 1,
    "lib.sd.us": 1,
    "lib.tn.us": 1,
    "lib.tx.us": 1,
    "lib.ut.us": 1,
    "lib.va.us": 1,
    "lib.vi.us": 1,
    "lib.vt.us": 1,
    "lib.wa.us": 1,
    "lib.wi.us": 1,
    "lib.wv.us": 1,
    "lib.wy.us": 1,
    "lier.no": 1,
    "lierne.no": 1,
    "likes-pie.com": 1,
    "likescandy.com": 1,
    "lillehammer.no": 1,
    "lillesand.no": 1,
    "limanowa.pl": 1,
    "lincoln.museum": 1,
    "lindas.no": 1,
    "lindesnes.no": 1,
    "lind\u00e5s.no": 1,
    "linz.museum": 1,
    "lipetsk.ru": 1,
    "living.museum": 1,
    "livinghistory.museum": 1,
    "livorno.it": 1,
    "ln.cn": 1,
    "lo.it": 1,
    "loabat.no": 1,
    "loab\u00e1t.no": 1,
    "localhistory.museum": 1,
    "lodi.it": 1,
    "lodingen.no": 1,
    "logistics.aero": 1,
    "lom.no": 1,
    "lomza.pl": 1,
    "london.museum": 1,
    "loppa.no": 1,
    "lorenskog.no": 1,
    "losangeles.museum": 1,
    "loten.no": 1,
    "louvre.museum": 1,
    "lowicz.pl": 1,
    "loyalist.museum": 1,
    "lt.it": 1,
    "lt.ua": 1,
    "ltd.co.im": 1,
    "ltd.gi": 1,
    "ltd.lk": 1,
    "lu.it": 1,
    "lubin.pl": 1,
    "lucca.it": 1,
    "lucerne.museum": 1,
    "lugansk.ua": 1,
    "lukow.pl": 1,
    "lund.no": 1,
    "lunner.no": 1,
    "luroy.no": 1,
    "lur\u00f8y.no": 1,
    "luster.no": 1,
    "lutsk.ua": 1,
    "luxembourg.museum": 1,
    "luzern.museum": 1,
    "lv.ua": 1,
    "lviv.ua": 1,
    "lyngdal.no": 1,
    "lyngen.no": 1,
    "l\u00e1hppi.no": 1,
    "l\u00e4ns.museum": 1,
    "l\u00e6rdal.no": 1,
    "l\u00f8dingen.no": 1,
    "l\u00f8renskog.no": 1,
    "l\u00f8ten.no": 1,
    "m.bg": 1,
    "m.se": 1,
    "ma.us": 1,
    "macerata.it": 1,
    "machida.tokyo.jp": 1,
    "mad.museum": 1,
    "madrid.museum": 1,
    "maebashi.gunma.jp": 1,
    "magadan.ru": 1,
    "magazine.aero": 1,
    "magnitka.ru": 1,
    "maibara.shiga.jp": 1,
    "mail.pl": 1,
    "maintenance.aero": 1,
    "maizuru.kyoto.jp": 1,
    "makinohara.shizuoka.jp": 1,
    "makurazaki.kagoshima.jp": 1,
    "malatvuopmi.no": 1,
    "malbork.pl": 1,
    "mallorca.museum": 1,
    "malopolska.pl": 1,
    "malselv.no": 1,
    "malvik.no": 1,
    "mamurogawa.yamagata.jp": 1,
    "manchester.museum": 1,
    "mandal.no": 1,
    "maniwa.okayama.jp": 1,
    "manno.kagawa.jp": 1,
    "mansion.museum": 1,
    "mansions.museum": 1,
    "mantova.it": 1,
    "manx.museum": 1,
    "marburg.museum": 1,
    "mari-el.ru": 1,
    "mari.ru": 1,
    "marine.ru": 1,
    "maritime.museum": 1,
    "maritimo.museum": 1,
    "marker.no": 1,
    "marketplace.aero": 1,
    "marnardal.no": 1,
    "marugame.kagawa.jp": 1,
    "marumori.miyagi.jp": 1,
    "maryland.museum": 1,
    "marylhurst.museum": 1,
    "masaki.ehime.jp": 1,
    "masfjorden.no": 1,
    "mashike.hokkaido.jp": 1,
    "mashiki.kumamoto.jp": 1,
    "mashiko.tochigi.jp": 1,
    "masoy.no": 1,
    "massa-carrara.it": 1,
    "massacarrara.it": 1,
    "masuda.shimane.jp": 1,
    "mat.br": 1,
    "matera.it": 1,
    "matsubara.osaka.jp": 1,
    "matsubushi.saitama.jp": 1,
    "matsuda.kanagawa.jp": 1,
    "matsudo.chiba.jp": 1,
    "matsue.shimane.jp": 1,
    "matsukawa.nagano.jp": 1,
    "matsumae.hokkaido.jp": 1,
    "matsumoto.kagoshima.jp": 1,
    "matsumoto.nagano.jp": 1,
    "matsuno.ehime.jp": 1,
    "matsusaka.mie.jp": 1,
    "matsushige.tokushima.jp": 1,
    "matsushima.miyagi.jp": 1,
    "matsuura.nagasaki.jp": 1,
    "matsuyama.ehime.jp": 1,
    "matsuzaki.shizuoka.jp": 1,
    "matta-varjjat.no": 1,
    "mazowsze.pl": 1,
    "mazury.pl": 1,
    "mb.ca": 1,
    "mb.it": 1,
    "mbone.pl": 1,
    "mc.it": 1,
    "md.ci": 1,
    "md.us": 1,
    "me.it": 1,
    "me.us": 1,
    "mecon.ar": 0,
    "med.br": 1,
    "med.ec": 1,
    "med.ee": 1,
    "med.ht": 1,
    "med.ly": 1,
    "med.pa": 1,
    "med.pl": 1,
    "med.pro": 1,
    "med.sa": 1,
    "med.sd": 1,
    "medecin.fr": 1,
    "medecin.km": 1,
    "media.aero": 1,
    "media.hu": 1,
    "media.museum": 1,
    "media.pl": 1,
    "mediaphone.om": 0,
    "medical.museum": 1,
    "medio-campidano.it": 1,
    "mediocampidano.it": 1,
    "medizinhistorisches.museum": 1,
    "meeres.museum": 1,
    "meguro.tokyo.jp": 1,
    "meiwa.gunma.jp": 1,
    "meiwa.mie.jp": 1,
    "meland.no": 1,
    "meldal.no": 1,
    "melhus.no": 1,
    "meloy.no": 1,
    "mel\u00f8y.no": 1,
    "memorial.museum": 1,
    "meraker.no": 1,
    "merseine.nu": 1,
    "mer\u00e5ker.no": 1,
    "mesaverde.museum": 1,
    "messina.it": 1,
    "mi.it": 1,
    "mi.th": 1,
    "mi.us": 1,
    "miasa.nagano.jp": 1,
    "miasta.pl": 1,
    "mibu.tochigi.jp": 1,
    "michigan.museum": 1,
    "microlight.aero": 1,
    "midatlantic.museum": 1,
    "midori.chiba.jp": 1,
    "midori.gunma.jp": 1,
    "midsund.no": 1,
    "midtre-gauldal.no": 1,
    "mie.jp": 1,
    "mielec.pl": 1,
    "mielno.pl": 1,
    "mifune.kumamoto.jp": 1,
    "mihama.aichi.jp": 1,
    "mihama.chiba.jp": 1,
    "mihama.fukui.jp": 1,
    "mihama.mie.jp": 1,
    "mihama.wakayama.jp": 1,
    "mihara.hiroshima.jp": 1,
    "mihara.kochi.jp": 1,
    "miharu.fukushima.jp": 1,
    "miho.ibaraki.jp": 1,
    "mikasa.hokkaido.jp": 1,
    "mikawa.yamagata.jp": 1,
    "miki.hyogo.jp": 1,
    "mil.ac": 1,
    "mil.ae": 1,
    "mil.al": 1,
    "mil.az": 1,
    "mil.ba": 1,
    "mil.bo": 1,
    "mil.br": 1,
    "mil.by": 1,
    "mil.cl": 1,
    "mil.cn": 1,
    "mil.co": 1,
    "mil.do": 1,
    "mil.ec": 1,
    "mil.eg": 1,
    "mil.ge": 1,
    "mil.gh": 1,
    "mil.hn": 1,
    "mil.id": 1,
    "mil.in": 1,
    "mil.iq": 1,
    "mil.jo": 1,
    "mil.kg": 1,
    "mil.km": 1,
    "mil.kr": 1,
    "mil.kz": 1,
    "mil.lv": 1,
    "mil.mg": 1,
    "mil.mv": 1,
    "mil.my": 1,
    "mil.no": 1,
    "mil.pe": 1,
    "mil.ph": 1,
    "mil.pl": 1,
    "mil.qa": 1,
    "mil.ru": 1,
    "mil.rw": 1,
    "mil.sh": 1,
    "mil.st": 1,
    "mil.sy": 1,
    "mil.tj": 1,
    "mil.tm": 1,
    "mil.to": 1,
    "mil.tw": 1,
    "mil.tz": 1,
    "mil.uy": 1,
    "mil.vc": 1,
    "mil.ve": 1,
    "milan.it": 1,
    "milano.it": 1,
    "military.museum": 1,
    "mill.museum": 1,
    "mima.tokushima.jp": 1,
    "mimata.miyazaki.jp": 1,
    "minakami.gunma.jp": 1,
    "minamata.kumamoto.jp": 1,
    "minami-alps.yamanashi.jp": 1,
    "minami.fukuoka.jp": 1,
    "minami.kyoto.jp": 1,
    "minami.tokushima.jp": 1,
    "minamiaiki.nagano.jp": 1,
    "minamiashigara.kanagawa.jp": 1,
    "minamiawaji.hyogo.jp": 1,
    "minamiboso.chiba.jp": 1,
    "minamidaito.okinawa.jp": 1,
    "minamiechizen.fukui.jp": 1,
    "minamifurano.hokkaido.jp": 1,
    "minamiise.mie.jp": 1,
    "minamiizu.shizuoka.jp": 1,
    "minamimaki.nagano.jp": 1,
    "minamiminowa.nagano.jp": 1,
    "minamioguni.kumamoto.jp": 1,
    "minamisanriku.miyagi.jp": 1,
    "minamitane.kagoshima.jp": 1,
    "minamiuonuma.niigata.jp": 1,
    "minamiyamashiro.kyoto.jp": 1,
    "minano.saitama.jp": 1,
    "minato.osaka.jp": 1,
    "minato.tokyo.jp": 1,
    "mincom.tn": 1,
    "mine.nu": 1,
    "miners.museum": 1,
    "mining.museum": 1,
    "minnesota.museum": 1,
    "mino.gifu.jp": 1,
    "minobu.yamanashi.jp": 1,
    "minoh.osaka.jp": 1,
    "minokamo.gifu.jp": 1,
    "minowa.nagano.jp": 1,
    "misaki.okayama.jp": 1,
    "misaki.osaka.jp": 1,
    "misasa.tottori.jp": 1,
    "misato.akita.jp": 1,
    "misato.miyagi.jp": 1,
    "misato.saitama.jp": 1,
    "misato.shimane.jp": 1,
    "misato.wakayama.jp": 1,
    "misawa.aomori.jp": 1,
    "misconfused.org": 1,
    "mishima.fukushima.jp": 1,
    "mishima.shizuoka.jp": 1,
    "missile.museum": 1,
    "missoula.museum": 1,
    "misugi.mie.jp": 1,
    "mitaka.tokyo.jp": 1,
    "mitake.gifu.jp": 1,
    "mitane.akita.jp": 1,
    "mito.ibaraki.jp": 1,
    "mitou.yamaguchi.jp": 1,
    "mitoyo.kagawa.jp": 1,
    "mitsue.nara.jp": 1,
    "mitsuke.niigata.jp": 1,
    "miura.kanagawa.jp": 1,
    "miyada.nagano.jp": 1,
    "miyagi.jp": 1,
    "miyake.nara.jp": 1,
    "miyako.fukuoka.jp": 1,
    "miyako.iwate.jp": 1,
    "miyakonojo.miyazaki.jp": 1,
    "miyama.fukuoka.jp": 1,
    "miyama.mie.jp": 1,
    "miyashiro.saitama.jp": 1,
    "miyawaka.fukuoka.jp": 1,
    "miyazaki.jp": 1,
    "miyazaki.miyazaki.jp": 1,
    "miyazu.kyoto.jp": 1,
    "miyoshi.aichi.jp": 1,
    "miyoshi.hiroshima.jp": 1,
    "miyoshi.saitama.jp": 1,
    "miyoshi.tokushima.jp": 1,
    "miyota.nagano.jp": 1,
    "mizuho.tokyo.jp": 1,
    "mizumaki.fukuoka.jp": 1,
    "mizunami.gifu.jp": 1,
    "mizusawa.iwate.jp": 1,
    "mjondalen.no": 1,
    "mj\u00f8ndalen.no": 1,
    "mk.ua": 1,
    "mm": 2,
    "mn.it": 1,
    "mn.us": 1,
    "mo-i-rana.no": 1,
    "mo.cn": 1,
    "mo.it": 1,
    "mo.us": 1,
    "moareke.no": 1,
    "mobara.chiba.jp": 1,
    "mobi.gp": 1,
    "mobi.na": 1,
    "mobi.tt": 1,
    "mochizuki.nagano.jp": 1,
    "mod.gi": 1,
    "mod.uk": 0,
    "modalen.no": 1,
    "modelling.aero": 1,
    "modena.it": 1,
    "modern.museum": 1,
    "modum.no": 1,
    "moka.tochigi.jp": 1,
    "molde.no": 1,
    "moma.museum": 1,
    "mombetsu.hokkaido.jp": 1,
    "money.museum": 1,
    "monmouth.museum": 1,
    "monticello.museum": 1,
    "montreal.museum": 1,
    "monza-brianza.it": 1,
    "monza-e-della-brianza.it": 1,
    "monza.it": 1,
    "monzabrianza.it": 1,
    "monzaebrianza.it": 1,
    "monzaedellabrianza.it": 1,
    "mordovia.ru": 1,
    "moriguchi.osaka.jp": 1,
    "morimachi.shizuoka.jp": 1,
    "morioka.iwate.jp": 1,
    "moriya.ibaraki.jp": 1,
    "moriyama.shiga.jp": 1,
    "moriyoshi.akita.jp": 1,
    "morotsuka.miyazaki.jp": 1,
    "moroyama.saitama.jp": 1,
    "moscow.museum": 1,
    "moseushi.hokkaido.jp": 1,
    "mosjoen.no": 1,
    "mosj\u00f8en.no": 1,
    "moskenes.no": 1,
    "mosreg.ru": 1,
    "moss.no": 1,
    "mosvik.no": 1,
    "motegi.tochigi.jp": 1,
    "motobu.okinawa.jp": 1,
    "motorcycle.museum": 1,
    "motosu.gifu.jp": 1,
    "motoyama.kochi.jp": 1,
    "mo\u00e5reke.no": 1,
    "mr.no": 1,
    "mragowo.pl": 1,
    "ms.it": 1,
    "ms.kr": 1,
    "ms.us": 1,
    "msk.ru": 1,
    "mt": 2,
    "mt.it": 1,
    "mt.us": 1,
    "muenchen.museum": 1,
    "muenster.museum": 1,
    "mugi.tokushima.jp": 1,
    "muika.niigata.jp": 1,
    "mukawa.hokkaido.jp": 1,
    "muko.kyoto.jp": 1,
    "mulhouse.museum": 1,
    "munakata.fukuoka.jp": 1,
    "muncie.museum": 1,
    "muosat.no": 1,
    "muos\u00e1t.no": 1,
    "murakami.niigata.jp": 1,
    "murata.miyagi.jp": 1,
    "murayama.yamagata.jp": 1,
    "murmansk.ru": 1,
    "muroran.hokkaido.jp": 1,
    "muroto.kochi.jp": 1,
    "mus.br": 1,
    "musashimurayama.tokyo.jp": 1,
    "musashino.tokyo.jp": 1,
    "museet.museum": 1,
    "museum.mv": 1,
    "museum.mw": 1,
    "museum.no": 1,
    "museum.tt": 1,
    "museumcenter.museum": 1,
    "museumvereniging.museum": 1,
    "music.museum": 1,
    "mutsu.aomori.jp": 1,
    "mutsuzawa.chiba.jp": 1,
    "mx.na": 1,
    "mykolaiv.ua": 1,
    "myoko.niigata.jp": 1,
    "mypets.ws": 1,
    "myphotos.cc": 1,
    "mytis.ru": 1,
    "mz": 2,
    "m\u00e1latvuopmi.no": 1,
    "m\u00e1tta-v\u00e1rjjat.no": 1,
    "m\u00e5lselv.no": 1,
    "m\u00e5s\u00f8y.no": 1,
    "n.bg": 1,
    "n.se": 1,
    "na.it": 1,
    "naamesjevuemie.no": 1,
    "nabari.mie.jp": 1,
    "nachikatsuura.wakayama.jp": 1,
    "nacion.ar": 0,
    "nagahama.shiga.jp": 1,
    "nagai.yamagata.jp": 1,
    "nagakute.aichi.jp": 1,
    "nagano.jp": 1,
    "nagano.nagano.jp": 1,
    "naganohara.gunma.jp": 1,
    "nagaoka.niigata.jp": 1,
    "nagaokakyo.kyoto.jp": 1,
    "nagara.chiba.jp": 1,
    "nagareyama.chiba.jp": 1,
    "nagasaki.jp": 1,
    "nagasaki.nagasaki.jp": 1,
    "nagasu.kumamoto.jp": 1,
    "nagato.yamaguchi.jp": 1,
    "nagatoro.saitama.jp": 1,
    "nagawa.nagano.jp": 1,
    "nagi.okayama.jp": 1,
    "nagiso.nagano.jp": 1,
    "nago.okinawa.jp": 1,
    "nagoya.jp": 2,
    "naha.okinawa.jp": 1,
    "nahari.kochi.jp": 1,
    "naie.hokkaido.jp": 1,
    "naka.hiroshima.jp": 1,
    "naka.ibaraki.jp": 1,
    "nakadomari.aomori.jp": 1,
    "nakagawa.fukuoka.jp": 1,
    "nakagawa.hokkaido.jp": 1,
    "nakagawa.nagano.jp": 1,
    "nakagawa.tokushima.jp": 1,
    "nakagusuku.okinawa.jp": 1,
    "nakagyo.kyoto.jp": 1,
    "nakai.kanagawa.jp": 1,
    "nakama.fukuoka.jp": 1,
    "nakamichi.yamanashi.jp": 1,
    "nakamura.kochi.jp": 1,
    "nakaniikawa.toyama.jp": 1,
    "nakano.nagano.jp": 1,
    "nakano.tokyo.jp": 1,
    "nakanojo.gunma.jp": 1,
    "nakanoto.ishikawa.jp": 1,
    "nakasatsunai.hokkaido.jp": 1,
    "nakatane.kagoshima.jp": 1,
    "nakatombetsu.hokkaido.jp": 1,
    "nakatsugawa.gifu.jp": 1,
    "nakayama.yamagata.jp": 1,
    "nakhodka.ru": 1,
    "nakijin.okinawa.jp": 1,
    "naklo.pl": 1,
    "nalchik.ru": 1,
    "namdalseid.no": 1,
    "name.az": 1,
    "name.eg": 1,
    "name.hr": 1,
    "name.jo": 1,
    "name.mk": 1,
    "name.mv": 1,
    "name.my": 1,
    "name.na": 1,
    "name.pr": 1,
    "name.qa": 1,
    "name.tj": 1,
    "name.tt": 1,
    "name.vn": 1,
    "namegata.ibaraki.jp": 1,
    "namegawa.saitama.jp": 1,
    "namerikawa.toyama.jp": 1,
    "namie.fukushima.jp": 1,
    "namikata.ehime.jp": 1,
    "namsos.no": 1,
    "namsskogan.no": 1,
    "nanae.hokkaido.jp": 1,
    "nanao.ishikawa.jp": 1,
    "nanbu.tottori.jp": 1,
    "nanbu.yamanashi.jp": 1,
    "nango.fukushima.jp": 1,
    "nanjo.okinawa.jp": 1,
    "nankoku.kochi.jp": 1,
    "nanmoku.gunma.jp": 1,
    "nannestad.no": 1,
    "nanporo.hokkaido.jp": 1,
    "nantan.kyoto.jp": 1,
    "nanto.toyama.jp": 1,
    "nanyo.yamagata.jp": 1,
    "naoshima.kagawa.jp": 1,
    "naples.it": 1,
    "napoli.it": 1,
    "nara.jp": 1,
    "nara.nara.jp": 1,
    "narashino.chiba.jp": 1,
    "narita.chiba.jp": 1,
    "naroy.no": 1,
    "narusawa.yamanashi.jp": 1,
    "naruto.tokushima.jp": 1,
    "narviika.no": 1,
    "narvik.no": 1,
    "nasu.tochigi.jp": 1,
    "nasushiobara.tochigi.jp": 1,
    "nat.tn": 1,
    "national-library-scotland.uk": 0,
    "national.museum": 1,
    "nationalfirearms.museum": 1,
    "nationalheritage.museum": 1,
    "nativeamerican.museum": 1,
    "natori.miyagi.jp": 1,
    "naturalhistory.museum": 1,
    "naturalhistorymuseum.museum": 1,
    "naturalsciences.museum": 1,
    "naturbruksgymn.se": 1,
    "nature.museum": 1,
    "naturhistorisches.museum": 1,
    "natuurwetenschappen.museum": 1,
    "naumburg.museum": 1,
    "naustdal.no": 1,
    "naval.museum": 1,
    "navigation.aero": 1,
    "navuotna.no": 1,
    "nawras.om": 0,
    "nawrastelecom.om": 0,
    "nayoro.hokkaido.jp": 1,
    "nb.ca": 1,
    "nc.us": 1,
    "nd.us": 1,
    "ne.jp": 1,
    "ne.kr": 1,
    "ne.pw": 1,
    "ne.tz": 1,
    "ne.ug": 1,
    "ne.us": 1,
    "neat-url.com": 1,
    "nebraska.museum": 1,
    "nedre-eiker.no": 1,
    "nel.uk": 0,
    "nemuro.hokkaido.jp": 1,
    "nerima.tokyo.jp": 1,
    "nes.akershus.no": 1,
    "nes.buskerud.no": 1,
    "nesna.no": 1,
    "nesodden.no": 1,
    "nesoddtangen.no": 1,
    "nesseby.no": 1,
    "nesset.no": 1,
    "net.ac": 1,
    "net.ae": 1,
    "net.af": 1,
    "net.ag": 1,
    "net.ai": 1,
    "net.al": 1,
    "net.an": 1,
    "net.au": 1,
    "net.az": 1,
    "net.ba": 1,
    "net.bb": 1,
    "net.bh": 1,
    "net.bm": 1,
    "net.bo": 1,
    "net.br": 1,
    "net.bs": 1,
    "net.bt": 1,
    "net.bz": 1,
    "net.ci": 1,
    "net.cn": 1,
    "net.co": 1,
    "net.cu": 1,
    "net.dm": 1,
    "net.do": 1,
    "net.dz": 1,
    "net.ec": 1,
    "net.eg": 1,
    "net.ge": 1,
    "net.gg": 1,
    "net.gn": 1,
    "net.gp": 1,
    "net.gr": 1,
    "net.gy": 1,
    "net.hk": 1,
    "net.hn": 1,
    "net.ht": 1,
    "net.id": 1,
    "net.im": 1,
    "net.in": 1,
    "net.iq": 1,
    "net.ir": 1,
    "net.is": 1,
    "net.je": 1,
    "net.jo": 1,
    "net.kg": 1,
    "net.ki": 1,
    "net.kn": 1,
    "net.ky": 1,
    "net.kz": 1,
    "net.la": 1,
    "net.lb": 1,
    "net.lc": 1,
    "net.lk": 1,
    "net.lr": 1,
    "net.lv": 1,
    "net.ly": 1,
    "net.ma": 1,
    "net.me": 1,
    "net.mk": 1,
    "net.ml": 1,
    "net.mo": 1,
    "net.mu": 1,
    "net.mv": 1,
    "net.mw": 1,
    "net.mx": 1,
    "net.my": 1,
    "net.nf": 1,
    "net.ng": 1,
    "net.nr": 1,
    "net.pa": 1,
    "net.pe": 1,
    "net.ph": 1,
    "net.pk": 1,
    "net.pl": 1,
    "net.pn": 1,
    "net.pr": 1,
    "net.ps": 1,
    "net.pt": 1,
    "net.qa": 1,
    "net.ru": 1,
    "net.rw": 1,
    "net.sa": 1,
    "net.sb": 1,
    "net.sc": 1,
    "net.sd": 1,
    "net.sg": 1,
    "net.sh": 1,
    "net.sl": 1,
    "net.so": 1,
    "net.st": 1,
    "net.sy": 1,
    "net.th": 1,
    "net.tj": 1,
    "net.tm": 1,
    "net.tn": 1,
    "net.to": 1,
    "net.tt": 1,
    "net.tw": 1,
    "net.ua": 1,
    "net.uy": 1,
    "net.uz": 1,
    "net.vc": 1,
    "net.ve": 1,
    "net.vi": 1,
    "net.vn": 1,
    "net.ws": 1,
    "neues.museum": 1,
    "newhampshire.museum": 1,
    "newjersey.museum": 1,
    "newmexico.museum": 1,
    "newport.museum": 1,
    "news.hu": 1,
    "newspaper.museum": 1,
    "newyork.museum": 1,
    "neyagawa.osaka.jp": 1,
    "nf.ca": 1,
    "ngo.lk": 1,
    "ngo.ph": 1,
    "ngo.pl": 1,
    "nh.us": 1,
    "nhs.uk": 2,
    "ni": 2,
    "nic.ar": 0,
    "nic.im": 1,
    "nic.in": 1,
    "nic.tj": 1,
    "nic.tr": 0,
    "nic.uk": 0,
    "nichinan.miyazaki.jp": 1,
    "nichinan.tottori.jp": 1,
    "niepce.museum": 1,
    "nieruchomosci.pl": 1,
    "niigata.jp": 1,
    "niigata.niigata.jp": 1,
    "niihama.ehime.jp": 1,
    "niikappu.hokkaido.jp": 1,
    "niimi.okayama.jp": 1,
    "niiza.saitama.jp": 1,
    "nikaho.akita.jp": 1,
    "niki.hokkaido.jp": 1,
    "nikko.tochigi.jp": 1,
    "nikolaev.ua": 1,
    "ninohe.iwate.jp": 1,
    "ninomiya.kanagawa.jp": 1,
    "nirasaki.yamanashi.jp": 1,
    "nishi.fukuoka.jp": 1,
    "nishi.osaka.jp": 1,
    "nishiaizu.fukushima.jp": 1,
    "nishiarita.saga.jp": 1,
    "nishiawakura.okayama.jp": 1,
    "nishiazai.shiga.jp": 1,
    "nishigo.fukushima.jp": 1,
    "nishihara.kumamoto.jp": 1,
    "nishihara.okinawa.jp": 1,
    "nishiizu.shizuoka.jp": 1,
    "nishikata.tochigi.jp": 1,
    "nishikatsura.yamanashi.jp": 1,
    "nishikawa.yamagata.jp": 1,
    "nishimera.miyazaki.jp": 1,
    "nishinomiya.hyogo.jp": 1,
    "nishinoomote.kagoshima.jp": 1,
    "nishinoshima.shimane.jp": 1,
    "nishio.aichi.jp": 1,
    "nishiokoppe.hokkaido.jp": 1,
    "nishitosa.kochi.jp": 1,
    "nishiwaki.hyogo.jp": 1,
    "nissedal.no": 1,
    "nisshin.aichi.jp": 1,
    "nittedal.no": 1,
    "niyodogawa.kochi.jp": 1,
    "nj.us": 1,
    "nkz.ru": 1,
    "nl.ca": 1,
    "nl.no": 1,
    "nls.uk": 0,
    "nm.cn": 1,
    "nm.us": 1,
    "nnov.ru": 1,
    "no.com": 1,
    "no.it": 1,
    "nobeoka.miyazaki.jp": 1,
    "noboribetsu.hokkaido.jp": 1,
    "noda.chiba.jp": 1,
    "noda.iwate.jp": 1,
    "nogata.fukuoka.jp": 1,
    "nogi.tochigi.jp": 1,
    "noheji.aomori.jp": 1,
    "nom.ad": 1,
    "nom.ag": 1,
    "nom.br": 1,
    "nom.co": 1,
    "nom.es": 1,
    "nom.fr": 1,
    "nom.km": 1,
    "nom.mg": 1,
    "nom.pa": 1,
    "nom.pe": 1,
    "nom.pl": 1,
    "nom.re": 1,
    "nom.ro": 1,
    "nom.tm": 1,
    "nome.pt": 1,
    "nomi.ishikawa.jp": 1,
    "nonoichi.ishikawa.jp": 1,
    "nord-aurdal.no": 1,
    "nord-fron.no": 1,
    "nord-odal.no": 1,
    "norddal.no": 1,
    "nordkapp.no": 1,
    "nordre-land.no": 1,
    "nordreisa.no": 1,
    "nore-og-uvdal.no": 1,
    "norfolk.museum": 1,
    "norilsk.ru": 1,
    "north.museum": 1,
    "nose.osaka.jp": 1,
    "nosegawa.nara.jp": 1,
    "noshiro.akita.jp": 1,
    "not.br": 1,
    "notaires.fr": 1,
    "notaires.km": 1,
    "noto.ishikawa.jp": 1,
    "notodden.no": 1,
    "notogawa.shiga.jp": 1,
    "notteroy.no": 1,
    "nov.ru": 1,
    "novara.it": 1,
    "novosibirsk.ru": 1,
    "nowaruda.pl": 1,
    "nozawaonsen.nagano.jp": 1,
    "np": 2,
    "nrw.museum": 1,
    "ns.ca": 1,
    "nsk.ru": 1,
    "nsn.us": 1,
    "nsw.au": 1,
    "nsw.edu.au": 1,
    "nt.au": 1,
    "nt.ca": 1,
    "nt.edu.au": 1,
    "nt.gov.au": 1,
    "nt.no": 1,
    "nt.ro": 1,
    "ntr.br": 1,
    "nu.ca": 1,
    "nu.it": 1,
    "nuernberg.museum": 1,
    "numata.gunma.jp": 1,
    "numata.hokkaido.jp": 1,
    "numazu.shizuoka.jp": 1,
    "nuoro.it": 1,
    "nuremberg.museum": 1,
    "nv.us": 1,
    "nx.cn": 1,
    "ny.us": 1,
    "nyc.museum": 1,
    "nyny.museum": 1,
    "nysa.pl": 1,
    "nyuzen.toyama.jp": 1,
    "nz": 2,
    "n\u00e1vuotna.no": 1,
    "n\u00e5\u00e5mesjevuemie.no": 1,
    "n\u00e6r\u00f8y.no": 1,
    "n\u00f8tter\u00f8y.no": 1,
    "o.bg": 1,
    "o.se": 1,
    "oamishirasato.chiba.jp": 1,
    "oarai.ibaraki.jp": 1,
    "obama.fukui.jp": 1,
    "obama.nagasaki.jp": 1,
    "obanazawa.yamagata.jp": 1,
    "obihiro.hokkaido.jp": 1,
    "obira.hokkaido.jp": 1,
    "obu.aichi.jp": 1,
    "obuse.nagano.jp": 1,
    "oceanographic.museum": 1,
    "oceanographique.museum": 1,
    "ochi.kochi.jp": 1,
    "od.ua": 1,
    "odate.akita.jp": 1,
    "odawara.kanagawa.jp": 1,
    "odda.no": 1,
    "odesa.ua": 1,
    "odessa.ua": 1,
    "odo.br": 1,
    "oe.yamagata.jp": 1,
    "of.by": 1,
    "of.no": 1,
    "off.ai": 1,
    "office-on-the.net": 1,
    "ofunato.iwate.jp": 1,
    "og.ao": 1,
    "og.it": 1,
    "oga.akita.jp": 1,
    "ogaki.gifu.jp": 1,
    "ogano.saitama.jp": 1,
    "ogasawara.tokyo.jp": 1,
    "ogata.akita.jp": 1,
    "ogawa.ibaraki.jp": 1,
    "ogawa.nagano.jp": 1,
    "ogawa.saitama.jp": 1,
    "ogawara.miyagi.jp": 1,
    "ogi.saga.jp": 1,
    "ogimi.okinawa.jp": 1,
    "ogliastra.it": 1,
    "ogori.fukuoka.jp": 1,
    "ogose.saitama.jp": 1,
    "oguchi.aichi.jp": 1,
    "oguni.kumamoto.jp": 1,
    "oguni.yamagata.jp": 1,
    "oh.us": 1,
    "oharu.aichi.jp": 1,
    "ohda.shimane.jp": 1,
    "ohi.fukui.jp": 1,
    "ohira.miyagi.jp": 1,
    "ohira.tochigi.jp": 1,
    "ohkura.yamagata.jp": 1,
    "ohtawara.tochigi.jp": 1,
    "oi.kanagawa.jp": 1,
    "oirase.aomori.jp": 1,
    "oishida.yamagata.jp": 1,
    "oiso.kanagawa.jp": 1,
    "oita.jp": 1,
    "oita.oita.jp": 1,
    "oizumi.gunma.jp": 1,
    "oji.nara.jp": 1,
    "ojiya.niigata.jp": 1,
    "ok.us": 1,
    "okagaki.fukuoka.jp": 1,
    "okawa.fukuoka.jp": 1,
    "okawa.kochi.jp": 1,
    "okaya.nagano.jp": 1,
    "okayama.jp": 1,
    "okayama.okayama.jp": 1,
    "okazaki.aichi.jp": 1,
    "okegawa.saitama.jp": 1,
    "oketo.hokkaido.jp": 1,
    "oki.fukuoka.jp": 1,
    "okinawa.jp": 1,
    "okinawa.okinawa.jp": 1,
    "okinoshima.shimane.jp": 1,
    "okoppe.hokkaido.jp": 1,
    "oksnes.no": 1,
    "okuizumo.shimane.jp": 1,
    "okuma.fukushima.jp": 1,
    "okutama.tokyo.jp": 1,
    "ol.no": 1,
    "olawa.pl": 1,
    "olbia-tempio.it": 1,
    "olbiatempio.it": 1,
    "olecko.pl": 1,
    "olkusz.pl": 1,
    "olsztyn.pl": 1,
    "om": 2,
    "omachi.nagano.jp": 1,
    "omachi.saga.jp": 1,
    "omaezaki.shizuoka.jp": 1,
    "omaha.museum": 1,
    "omanmobile.om": 0,
    "omanpost.om": 0,
    "omantel.om": 0,
    "omasvuotna.no": 1,
    "ome.tokyo.jp": 1,
    "omi.nagano.jp": 1,
    "omi.niigata.jp": 1,
    "omigawa.chiba.jp": 1,
    "omihachiman.shiga.jp": 1,
    "omitama.ibaraki.jp": 1,
    "omiya.saitama.jp": 1,
    "omotego.fukushima.jp": 1,
    "omsk.ru": 1,
    "omura.nagasaki.jp": 1,
    "omuta.fukuoka.jp": 1,
    "on-the-web.tv": 1,
    "on.ca": 1,
    "onagawa.miyagi.jp": 1,
    "onga.fukuoka.jp": 1,
    "onjuku.chiba.jp": 1,
    "online.museum": 1,
    "onna.okinawa.jp": 1,
    "ono.fukui.jp": 1,
    "ono.fukushima.jp": 1,
    "ono.hyogo.jp": 1,
    "onojo.fukuoka.jp": 1,
    "onomichi.hiroshima.jp": 1,
    "ontario.museum": 1,
    "ookuwa.nagano.jp": 1,
    "ooshika.nagano.jp": 1,
    "openair.museum": 1,
    "operaunite.com": 1,
    "opoczno.pl": 1,
    "opole.pl": 1,
    "oppdal.no": 1,
    "oppegard.no": 1,
    "oppeg\u00e5rd.no": 1,
    "or.at": 1,
    "or.bi": 1,
    "or.ci": 1,
    "or.cr": 1,
    "or.id": 1,
    "or.it": 1,
    "or.jp": 1,
    "or.kr": 1,
    "or.mu": 1,
    "or.na": 1,
    "or.pw": 1,
    "or.th": 1,
    "or.tz": 1,
    "or.ug": 1,
    "or.us": 1,
    "ora.gunma.jp": 1,
    "oregon.museum": 1,
    "oregontrail.museum": 1,
    "orenburg.ru": 1,
    "org.ac": 1,
    "org.ae": 1,
    "org.af": 1,
    "org.ag": 1,
    "org.ai": 1,
    "org.al": 1,
    "org.an": 1,
    "org.au": 1,
    "org.az": 1,
    "org.ba": 1,
    "org.bb": 1,
    "org.bh": 1,
    "org.bi": 1,
    "org.bm": 1,
    "org.bo": 1,
    "org.br": 1,
    "org.bs": 1,
    "org.bt": 1,
    "org.bw": 1,
    "org.bz": 1,
    "org.ci": 1,
    "org.cn": 1,
    "org.co": 1,
    "org.cu": 1,
    "org.dm": 1,
    "org.do": 1,
    "org.dz": 1,
    "org.ec": 1,
    "org.ee": 1,
    "org.eg": 1,
    "org.es": 1,
    "org.ge": 1,
    "org.gg": 1,
    "org.gh": 1,
    "org.gi": 1,
    "org.gn": 1,
    "org.gp": 1,
    "org.gr": 1,
    "org.hk": 1,
    "org.hn": 1,
    "org.ht": 1,
    "org.hu": 1,
    "org.im": 1,
    "org.in": 1,
    "org.iq": 1,
    "org.ir": 1,
    "org.is": 1,
    "org.je": 1,
    "org.jo": 1,
    "org.kg": 1,
    "org.ki": 1,
    "org.km": 1,
    "org.kn": 1,
    "org.kp": 1,
    "org.ky": 1,
    "org.kz": 1,
    "org.la": 1,
    "org.lb": 1,
    "org.lc": 1,
    "org.lk": 1,
    "org.lr": 1,
    "org.ls": 1,
    "org.lv": 1,
    "org.ly": 1,
    "org.ma": 1,
    "org.me": 1,
    "org.mg": 1,
    "org.mk": 1,
    "org.ml": 1,
    "org.mn": 1,
    "org.mo": 1,
    "org.mu": 1,
    "org.mv": 1,
    "org.mw": 1,
    "org.mx": 1,
    "org.my": 1,
    "org.na": 1,
    "org.ng": 1,
    "org.nr": 1,
    "org.pa": 1,
    "org.pe": 1,
    "org.pf": 1,
    "org.ph": 1,
    "org.pk": 1,
    "org.pl": 1,
    "org.pn": 1,
    "org.pr": 1,
    "org.ps": 1,
    "org.pt": 1,
    "org.qa": 1,
    "org.ro": 1,
    "org.rs": 1,
    "org.ru": 1,
    "org.sa": 1,
    "org.sb": 1,
    "org.sc": 1,
    "org.sd": 1,
    "org.se": 1,
    "org.sg": 1,
    "org.sh": 1,
    "org.sl": 1,
    "org.sn": 1,
    "org.so": 1,
    "org.st": 1,
    "org.sy": 1,
    "org.sz": 1,
    "org.tj": 1,
    "org.tm": 1,
    "org.tn": 1,
    "org.to": 1,
    "org.tt": 1,
    "org.tw": 1,
    "org.ua": 1,
    "org.ug": 1,
    "org.uy": 1,
    "org.uz": 1,
    "org.vc": 1,
    "org.ve": 1,
    "org.vi": 1,
    "org.vn": 1,
    "org.ws": 1,
    "oristano.it": 1,
    "orkanger.no": 1,
    "orkdal.no": 1,
    "orland.no": 1,
    "orskog.no": 1,
    "orsta.no": 1,
    "oryol.ru": 1,
    "os.hedmark.no": 1,
    "os.hordaland.no": 1,
    "osaka.jp": 1,
    "osakasayama.osaka.jp": 1,
    "osaki.miyagi.jp": 1,
    "osakikamijima.hiroshima.jp": 1,
    "osen.no": 1,
    "oseto.nagasaki.jp": 1,
    "oshima.tokyo.jp": 1,
    "oshima.yamaguchi.jp": 1,
    "oshino.yamanashi.jp": 1,
    "oshu.iwate.jp": 1,
    "oskol.ru": 1,
    "oslo.no": 1,
    "osoyro.no": 1,
    "osteroy.no": 1,
    "oster\u00f8y.no": 1,
    "ostre-toten.no": 1,
    "ostroda.pl": 1,
    "ostroleka.pl": 1,
    "ostrowiec.pl": 1,
    "ostrowwlkp.pl": 1,
    "os\u00f8yro.no": 1,
    "ot.it": 1,
    "ota.gunma.jp": 1,
    "ota.tokyo.jp": 1,
    "otago.museum": 1,
    "otake.hiroshima.jp": 1,
    "otaki.chiba.jp": 1,
    "otaki.nagano.jp": 1,
    "otaki.saitama.jp": 1,
    "otama.fukushima.jp": 1,
    "otari.nagano.jp": 1,
    "otaru.hokkaido.jp": 1,
    "other.nf": 1,
    "oto.fukuoka.jp": 1,
    "otobe.hokkaido.jp": 1,
    "otofuke.hokkaido.jp": 1,
    "otoineppu.hokkaido.jp": 1,
    "otoyo.kochi.jp": 1,
    "otsu.shiga.jp": 1,
    "otsuchi.iwate.jp": 1,
    "otsuki.kochi.jp": 1,
    "otsuki.yamanashi.jp": 1,
    "ouchi.saga.jp": 1,
    "ouda.nara.jp": 1,
    "oumu.hokkaido.jp": 1,
    "overhalla.no": 1,
    "ovre-eiker.no": 1,
    "owani.aomori.jp": 1,
    "owariasahi.aichi.jp": 1,
    "oxford.museum": 1,
    "oyabe.toyama.jp": 1,
    "oyama.tochigi.jp": 1,
    "oyamazaki.kyoto.jp": 1,
    "oyer.no": 1,
    "oygarden.no": 1,
    "oyodo.nara.jp": 1,
    "oystre-slidre.no": 1,
    "oz.au": 1,
    "ozora.hokkaido.jp": 1,
    "ozu.ehime.jp": 1,
    "ozu.kumamoto.jp": 1,
    "p.bg": 1,
    "p.se": 1,
    "pa.gov.pl": 1,
    "pa.it": 1,
    "pa.us": 1,
    "pacific.museum": 1,
    "paderborn.museum": 1,
    "padova.it": 1,
    "padua.it": 1,
    "palace.museum": 1,
    "palana.ru": 1,
    "paleo.museum": 1,
    "palermo.it": 1,
    "palmsprings.museum": 1,
    "panama.museum": 1,
    "parachuting.aero": 1,
    "paragliding.aero": 1,
    "paris.museum": 1,
    "parliament.uk": 0,
    "parma.it": 1,
    "paroch.k12.ma.us": 1,
    "parti.se": 1,
    "pasadena.museum": 1,
    "passenger-association.aero": 1,
    "pavia.it": 1,
    "pb.ao": 1,
    "pc.it": 1,
    "pc.pl": 1,
    "pd.it": 1,
    "pe.ca": 1,
    "pe.it": 1,
    "pe.kr": 1,
    "penza.ru": 1,
    "per.la": 1,
    "per.nf": 1,
    "per.sg": 1,
    "perm.ru": 1,
    "perso.ht": 1,
    "perso.sn": 1,
    "perso.tn": 1,
    "perugia.it": 1,
    "pesaro-urbino.it": 1,
    "pesarourbino.it": 1,
    "pescara.it": 1,
    "pg": 2,
    "pg.it": 1,
    "pharmacien.fr": 1,
    "pharmaciens.km": 1,
    "pharmacy.museum": 1,
    "philadelphia.museum": 1,
    "philadelphiaarea.museum": 1,
    "philately.museum": 1,
    "phoenix.museum": 1,
    "photography.museum": 1,
    "pi.it": 1,
    "piacenza.it": 1,
    "pila.pl": 1,
    "pilot.aero": 1,
    "pilots.museum": 1,
    "pippu.hokkaido.jp": 1,
    "pisa.it": 1,
    "pistoia.it": 1,
    "pisz.pl": 1,
    "pittsburgh.museum": 1,
    "pl.ua": 1,
    "planetarium.museum": 1,
    "plantation.museum": 1,
    "plants.museum": 1,
    "plaza.museum": 1,
    "plc.co.im": 1,
    "plc.ly": 1,
    "plo.ps": 1,
    "pn.it": 1,
    "po.gov.pl": 1,
    "po.it": 1,
    "podhale.pl": 1,
    "podlasie.pl": 1,
    "podzone.net": 1,
    "podzone.org": 1,
    "pol.dz": 1,
    "pol.ht": 1,
    "police.uk": 2,
    "polkowice.pl": 1,
    "poltava.ua": 1,
    "pomorskie.pl": 1,
    "pomorze.pl": 1,
    "pordenone.it": 1,
    "porsanger.no": 1,
    "porsangu.no": 1,
    "porsgrunn.no": 1,
    "pors\u00e1\u014bgu.no": 1,
    "port.fr": 1,
    "portal.museum": 1,
    "portland.museum": 1,
    "portlligat.museum": 1,
    "posts-and-telecommunications.museum": 1,
    "potenza.it": 1,
    "powiat.pl": 1,
    "poznan.pl": 1,
    "pp.az": 1,
    "pp.ru": 1,
    "pp.se": 1,
    "pp.ua": 1,
    "ppg.br": 1,
    "pr.it": 1,
    "pr.us": 1,
    "prato.it": 1,
    "prd.fr": 1,
    "prd.km": 1,
    "prd.mg": 1,
    "preservation.museum": 1,
    "presidio.museum": 1,
    "press.aero": 1,
    "press.ma": 1,
    "press.museum": 1,
    "press.se": 1,
    "presse.ci": 1,
    "presse.fr": 1,
    "presse.km": 1,
    "presse.ml": 1,
    "pri.ee": 1,
    "principe.st": 1,
    "priv.at": 1,
    "priv.hu": 1,
    "priv.me": 1,
    "priv.no": 1,
    "priv.pl": 1,
    "pro.az": 1,
    "pro.br": 1,
    "pro.ec": 1,
    "pro.ht": 1,
    "pro.mv": 1,
    "pro.na": 1,
    "pro.pr": 1,
    "pro.tt": 1,
    "pro.vn": 1,
    "prochowice.pl": 1,
    "production.aero": 1,
    "prof.pr": 1,
    "project.museum": 1,
    "promocion.ar": 0,
    "pruszkow.pl": 1,
    "przeworsk.pl": 1,
    "psc.br": 1,
    "psi.br": 1,
    "pskov.ru": 1,
    "pt.it": 1,
    "ptz.ru": 1,
    "pu.it": 1,
    "pub.sa": 1,
    "publ.pt": 1,
    "public.museum": 1,
    "pubol.museum": 1,
    "pulawy.pl": 1,
    "pv.it": 1,
    "pvt.ge": 1,
    "pvt.k12.ma.us": 1,
    "py": 2,
    "pyatigorsk.ru": 1,
    "pz.it": 1,
    "q.bg": 1,
    "qc.ca": 1,
    "qc.com": 1,
    "qh.cn": 1,
    "qld.au": 1,
    "qld.edu.au": 1,
    "qld.gov.au": 1,
    "qsl.br": 1,
    "quebec.museum": 1,
    "r.bg": 1,
    "r.se": 1,
    "ra.it": 1,
    "rade.no": 1,
    "radio.br": 1,
    "radom.pl": 1,
    "radoy.no": 1,
    "rad\u00f8y.no": 1,
    "ragusa.it": 1,
    "rahkkeravju.no": 1,
    "raholt.no": 1,
    "railroad.museum": 1,
    "railway.museum": 1,
    "raisa.no": 1,
    "rakkestad.no": 1,
    "rakpetroleum.om": 0,
    "ralingen.no": 1,
    "rana.no": 1,
    "randaberg.no": 1,
    "rankoshi.hokkaido.jp": 1,
    "ranzan.saitama.jp": 1,
    "rauma.no": 1,
    "ravenna.it": 1,
    "rawa-maz.pl": 1,
    "rc.it": 1,
    "re.it": 1,
    "re.kr": 1,
    "readmyblog.org": 1,
    "realestate.pl": 1,
    "rebun.hokkaido.jp": 1,
    "rec.br": 1,
    "rec.co": 1,
    "rec.nf": 1,
    "rec.ro": 1,
    "recreation.aero": 1,
    "reggio-calabria.it": 1,
    "reggio-emilia.it": 1,
    "reggiocalabria.it": 1,
    "reggioemilia.it": 1,
    "reklam.hu": 1,
    "rel.ht": 1,
    "rel.pl": 1,
    "rendalen.no": 1,
    "rennebu.no": 1,
    "rennesoy.no": 1,
    "rennes\u00f8y.no": 1,
    "rep.kp": 1,
    "repbody.aero": 1,
    "res.aero": 1,
    "res.in": 1,
    "research.aero": 1,
    "research.museum": 1,
    "resistance.museum": 1,
    "retina.ar": 0,
    "rg.it": 1,
    "ri.it": 1,
    "ri.us": 1,
    "rieti.it": 1,
    "rifu.miyagi.jp": 1,
    "riik.ee": 1,
    "rikubetsu.hokkaido.jp": 1,
    "rikuzentakata.iwate.jp": 1,
    "rimini.it": 1,
    "rindal.no": 1,
    "ringebu.no": 1,
    "ringerike.no": 1,
    "ringsaker.no": 1,
    "riodejaneiro.museum": 1,
    "rishiri.hokkaido.jp": 1,
    "rishirifuji.hokkaido.jp": 1,
    "risor.no": 1,
    "rissa.no": 1,
    "ris\u00f8r.no": 1,
    "ritto.shiga.jp": 1,
    "rivne.ua": 1,
    "rl.no": 1,
    "rm.it": 1,
    "rn.it": 1,
    "rnd.ru": 1,
    "rnrt.tn": 1,
    "rns.tn": 1,
    "rnu.tn": 1,
    "ro.it": 1,
    "roan.no": 1,
    "rochester.museum": 1,
    "rockart.museum": 1,
    "rodoy.no": 1,
    "rokunohe.aomori.jp": 1,
    "rollag.no": 1,
    "roma.it": 1,
    "roma.museum": 1,
    "rome.it": 1,
    "romsa.no": 1,
    "romskog.no": 1,
    "roros.no": 1,
    "rost.no": 1,
    "rotorcraft.aero": 1,
    "rovigo.it": 1,
    "rovno.ua": 1,
    "royken.no": 1,
    "royrvik.no": 1,
    "rs.ba": 1,
    "ru.com": 1,
    "rubtsovsk.ru": 1,
    "ruovat.no": 1,
    "russia.museum": 1,
    "rv.ua": 1,
    "ryazan.ru": 1,
    "rybnik.pl": 1,
    "rygge.no": 1,
    "ryokami.saitama.jp": 1,
    "ryugasaki.ibaraki.jp": 1,
    "ryuoh.shiga.jp": 1,
    "rzeszow.pl": 1,
    "r\u00e1hkker\u00e1vju.no": 1,
    "r\u00e1isa.no": 1,
    "r\u00e5de.no": 1,
    "r\u00e5holt.no": 1,
    "r\u00e6lingen.no": 1,
    "r\u00f8d\u00f8y.no": 1,
    "r\u00f8mskog.no": 1,
    "r\u00f8ros.no": 1,
    "r\u00f8st.no": 1,
    "r\u00f8yken.no": 1,
    "r\u00f8yrvik.no": 1,
    "s.bg": 1,
    "s.se": 1,
    "sa.au": 1,
    "sa.com": 1,
    "sa.cr": 1,
    "sa.edu.au": 1,
    "sa.gov.au": 1,
    "sa.it": 1,
    "sabae.fukui.jp": 1,
    "sado.niigata.jp": 1,
    "safety.aero": 1,
    "saga.jp": 1,
    "saga.saga.jp": 1,
    "sagae.yamagata.jp": 1,
    "sagamihara.kanagawa.jp": 1,
    "saigawa.fukuoka.jp": 1,
    "saijo.ehime.jp": 1,
    "saikai.nagasaki.jp": 1,
    "saiki.oita.jp": 1,
    "saintlouis.museum": 1,
    "saitama.jp": 1,
    "saitama.saitama.jp": 1,
    "saito.miyazaki.jp": 1,
    "saka.hiroshima.jp": 1,
    "sakado.saitama.jp": 1,
    "sakae.chiba.jp": 1,
    "sakae.nagano.jp": 1,
    "sakahogi.gifu.jp": 1,
    "sakai.fukui.jp": 1,
    "sakai.ibaraki.jp": 1,
    "sakai.osaka.jp": 1,
    "sakaiminato.tottori.jp": 1,
    "sakaki.nagano.jp": 1,
    "sakata.yamagata.jp": 1,
    "sakawa.kochi.jp": 1,
    "sakegawa.yamagata.jp": 1,
    "sakhalin.ru": 1,
    "saku.nagano.jp": 1,
    "sakuho.nagano.jp": 1,
    "sakura.chiba.jp": 1,
    "sakura.tochigi.jp": 1,
    "sakuragawa.ibaraki.jp": 1,
    "sakurai.nara.jp": 1,
    "sakyo.kyoto.jp": 1,
    "salangen.no": 1,
    "salat.no": 1,
    "salem.museum": 1,
    "salerno.it": 1,
    "saltdal.no": 1,
    "salvadordali.museum": 1,
    "salzburg.museum": 1,
    "samara.ru": 1,
    "samegawa.fukushima.jp": 1,
    "samnanger.no": 1,
    "samukawa.kanagawa.jp": 1,
    "sanagochi.tokushima.jp": 1,
    "sanda.hyogo.jp": 1,
    "sande.more-og-romsdal.no": 1,
    "sande.m\u00f8re-og-romsdal.no": 1,
    "sande.vestfold.no": 1,
    "sandefjord.no": 1,
    "sandiego.museum": 1,
    "sandnes.no": 1,
    "sandnessjoen.no": 1,
    "sandnessj\u00f8en.no": 1,
    "sandoy.no": 1,
    "sand\u00f8y.no": 1,
    "sanfrancisco.museum": 1,
    "sango.nara.jp": 1,
    "sanjo.niigata.jp": 1,
    "sannan.hyogo.jp": 1,
    "sannohe.aomori.jp": 1,
    "sano.tochigi.jp": 1,
    "sanok.pl": 1,
    "santabarbara.museum": 1,
    "santacruz.museum": 1,
    "santafe.museum": 1,
    "sanuki.kagawa.jp": 1,
    "saotome.st": 1,
    "sapporo.jp": 2,
    "saratov.ru": 1,
    "saroma.hokkaido.jp": 1,
    "sarpsborg.no": 1,
    "sarufutsu.hokkaido.jp": 1,
    "sasaguri.fukuoka.jp": 1,
    "sasayama.hyogo.jp": 1,
    "sasebo.nagasaki.jp": 1,
    "saskatchewan.museum": 1,
    "sassari.it": 1,
    "satosho.okayama.jp": 1,
    "satsumasendai.kagoshima.jp": 1,
    "satte.saitama.jp": 1,
    "satx.museum": 1,
    "sauda.no": 1,
    "sauherad.no": 1,
    "savannahga.museum": 1,
    "saves-the-whales.com": 1,
    "savona.it": 1,
    "sayama.osaka.jp": 1,
    "sayama.saitama.jp": 1,
    "sayo.hyogo.jp": 1,
    "sb.ua": 1,
    "sc.cn": 1,
    "sc.kr": 1,
    "sc.tz": 1,
    "sc.ug": 1,
    "sc.us": 1,
    "sch.ae": 1,
    "sch.gg": 1,
    "sch.id": 1,
    "sch.ir": 1,
    "sch.je": 1,
    "sch.jo": 1,
    "sch.lk": 1,
    "sch.ly": 1,
    "sch.qa": 1,
    "sch.sa": 1,
    "sch.uk": 2,
    "schlesisches.museum": 1,
    "schoenbrunn.museum": 1,
    "schokoladen.museum": 1,
    "school.museum": 1,
    "school.na": 1,
    "schweiz.museum": 1,
    "sci.eg": 1,
    "science-fiction.museum": 1,
    "science.museum": 1,
    "scienceandhistory.museum": 1,
    "scienceandindustry.museum": 1,
    "sciencecenter.museum": 1,
    "sciencecenters.museum": 1,
    "sciencehistory.museum": 1,
    "sciences.museum": 1,
    "sciencesnaturelles.museum": 1,
    "scientist.aero": 1,
    "scotland.museum": 1,
    "scrapper-site.net": 1,
    "scrapping.cc": 1,
    "sd.cn": 1,
    "sd.us": 1,
    "se.com": 1,
    "se.net": 1,
    "seaport.museum": 1,
    "sebastopol.ua": 1,
    "sec.ps": 1,
    "seihi.nagasaki.jp": 1,
    "seika.kyoto.jp": 1,
    "seiro.niigata.jp": 1,
    "seirou.niigata.jp": 1,
    "seiyo.ehime.jp": 1,
    "sejny.pl": 1,
    "seki.gifu.jp": 1,
    "sekigahara.gifu.jp": 1,
    "sekikawa.niigata.jp": 1,
    "sel.no": 1,
    "selbu.no": 1,
    "selfip.biz": 1,
    "selfip.com": 1,
    "selfip.info": 1,
    "selfip.net": 1,
    "selfip.org": 1,
    "selje.no": 1,
    "seljord.no": 1,
    "sells-for-less.com": 1,
    "sells-for-u.com": 1,
    "sells-it.net": 1,
    "sellsyourhome.org": 1,
    "semboku.akita.jp": 1,
    "semine.miyagi.jp": 1,
    "sendai.jp": 2,
    "sennan.osaka.jp": 1,
    "seoul.kr": 1,
    "sera.hiroshima.jp": 1,
    "seranishi.hiroshima.jp": 1,
    "servebbs.com": 1,
    "servebbs.net": 1,
    "servebbs.org": 1,
    "serveftp.net": 1,
    "serveftp.org": 1,
    "servegame.org": 1,
    "services.aero": 1,
    "setagaya.tokyo.jp": 1,
    "seto.aichi.jp": 1,
    "setouchi.okayama.jp": 1,
    "settlement.museum": 1,
    "settlers.museum": 1,
    "settsu.osaka.jp": 1,
    "sevastopol.ua": 1,
    "sex.hu": 1,
    "sex.pl": 1,
    "sf.no": 1,
    "sh.cn": 1,
    "shacknet.nu": 1,
    "shakotan.hokkaido.jp": 1,
    "shari.hokkaido.jp": 1,
    "shell.museum": 1,
    "sherbrooke.museum": 1,
    "shibata.miyagi.jp": 1,
    "shibata.niigata.jp": 1,
    "shibecha.hokkaido.jp": 1,
    "shibetsu.hokkaido.jp": 1,
    "shibukawa.gunma.jp": 1,
    "shibuya.tokyo.jp": 1,
    "shichikashuku.miyagi.jp": 1,
    "shichinohe.aomori.jp": 1,
    "shiga.jp": 1,
    "shiiba.miyazaki.jp": 1,
    "shijonawate.osaka.jp": 1,
    "shika.ishikawa.jp": 1,
    "shikabe.hokkaido.jp": 1,
    "shikama.miyagi.jp": 1,
    "shikaoi.hokkaido.jp": 1,
    "shikatsu.aichi.jp": 1,
    "shiki.saitama.jp": 1,
    "shikokuchuo.ehime.jp": 1,
    "shima.mie.jp": 1,
    "shimabara.nagasaki.jp": 1,
    "shimada.shizuoka.jp": 1,
    "shimamaki.hokkaido.jp": 1,
    "shimamoto.osaka.jp": 1,
    "shimane.jp": 1,
    "shimane.shimane.jp": 1,
    "shimizu.hokkaido.jp": 1,
    "shimizu.shizuoka.jp": 1,
    "shimoda.shizuoka.jp": 1,
    "shimodate.ibaraki.jp": 1,
    "shimofusa.chiba.jp": 1,
    "shimogo.fukushima.jp": 1,
    "shimoichi.nara.jp": 1,
    "shimoji.okinawa.jp": 1,
    "shimokawa.hokkaido.jp": 1,
    "shimokitayama.nara.jp": 1,
    "shimonita.gunma.jp": 1,
    "shimonoseki.yamaguchi.jp": 1,
    "shimosuwa.nagano.jp": 1,
    "shimotsuke.tochigi.jp": 1,
    "shimotsuma.ibaraki.jp": 1,
    "shinagawa.tokyo.jp": 1,
    "shinanomachi.nagano.jp": 1,
    "shingo.aomori.jp": 1,
    "shingu.fukuoka.jp": 1,
    "shingu.hyogo.jp": 1,
    "shingu.wakayama.jp": 1,
    "shinichi.hiroshima.jp": 1,
    "shinjo.nara.jp": 1,
    "shinjo.okayama.jp": 1,
    "shinjo.yamagata.jp": 1,
    "shinjuku.tokyo.jp": 1,
    "shinkamigoto.nagasaki.jp": 1,
    "shinonsen.hyogo.jp": 1,
    "shinshinotsu.hokkaido.jp": 1,
    "shinshiro.aichi.jp": 1,
    "shinto.gunma.jp": 1,
    "shintoku.hokkaido.jp": 1,
    "shintomi.miyazaki.jp": 1,
    "shinyoshitomi.fukuoka.jp": 1,
    "shiogama.miyagi.jp": 1,
    "shiojiri.nagano.jp": 1,
    "shioya.tochigi.jp": 1,
    "shirahama.wakayama.jp": 1,
    "shirakawa.fukushima.jp": 1,
    "shirakawa.gifu.jp": 1,
    "shirako.chiba.jp": 1,
    "shiranuka.hokkaido.jp": 1,
    "shiraoi.hokkaido.jp": 1,
    "shiraoka.saitama.jp": 1,
    "shirataka.yamagata.jp": 1,
    "shiriuchi.hokkaido.jp": 1,
    "shiroi.chiba.jp": 1,
    "shiroishi.miyagi.jp": 1,
    "shiroishi.saga.jp": 1,
    "shirosato.ibaraki.jp": 1,
    "shishikui.tokushima.jp": 1,
    "shiso.hyogo.jp": 1,
    "shisui.chiba.jp": 1,
    "shitara.aichi.jp": 1,
    "shiwa.iwate.jp": 1,
    "shizukuishi.iwate.jp": 1,
    "shizuoka.jp": 1,
    "shizuoka.shizuoka.jp": 1,
    "shobara.hiroshima.jp": 1,
    "shonai.fukuoka.jp": 1,
    "shonai.yamagata.jp": 1,
    "shoo.okayama.jp": 1,
    "shop.ht": 1,
    "shop.hu": 1,
    "shop.pl": 1,
    "show.aero": 1,
    "showa.fukushima.jp": 1,
    "showa.gunma.jp": 1,
    "showa.yamanashi.jp": 1,
    "shunan.yamaguchi.jp": 1,
    "si.it": 1,
    "sibenik.museum": 1,
    "siedlce.pl": 1,
    "siellak.no": 1,
    "siemens.om": 0,
    "siena.it": 1,
    "sigdal.no": 1,
    "siljan.no": 1,
    "silk.museum": 1,
    "simbirsk.ru": 1,
    "simple-url.com": 1,
    "siracusa.it": 1,
    "sirdal.no": 1,
    "sk.ca": 1,
    "skanit.no": 1,
    "skanland.no": 1,
    "skaun.no": 1,
    "skedsmo.no": 1,
    "skedsmokorset.no": 1,
    "ski.museum": 1,
    "ski.no": 1,
    "skien.no": 1,
    "skierva.no": 1,
    "skierv\u00e1.no": 1,
    "skiptvet.no": 1,
    "skjak.no": 1,
    "skjervoy.no": 1,
    "skjerv\u00f8y.no": 1,
    "skj\u00e5k.no": 1,
    "sklep.pl": 1,
    "skoczow.pl": 1,
    "skodje.no": 1,
    "skole.museum": 1,
    "skydiving.aero": 1,
    "sk\u00e1nit.no": 1,
    "sk\u00e5nland.no": 1,
    "slask.pl": 1,
    "slattum.no": 1,
    "sld.do": 1,
    "sld.pa": 1,
    "slg.br": 1,
    "slupsk.pl": 1,
    "sm.ua": 1,
    "smola.no": 1,
    "smolensk.ru": 1,
    "sm\u00f8la.no": 1,
    "sn.cn": 1,
    "snaase.no": 1,
    "snasa.no": 1,
    "snillfjord.no": 1,
    "snoasa.no": 1,
    "snz.ru": 1,
    "sn\u00e5ase.no": 1,
    "sn\u00e5sa.no": 1,
    "so.gov.pl": 1,
    "so.it": 1,
    "sobetsu.hokkaido.jp": 1,
    "soc.lk": 1,
    "society.museum": 1,
    "sodegaura.chiba.jp": 1,
    "soeda.fukuoka.jp": 1,
    "software.aero": 1,
    "sogndal.no": 1,
    "sogne.no": 1,
    "soja.okayama.jp": 1,
    "soka.saitama.jp": 1,
    "sokndal.no": 1,
    "sola.no": 1,
    "sologne.museum": 1,
    "solund.no": 1,
    "soma.fukushima.jp": 1,
    "somna.no": 1,
    "sondre-land.no": 1,
    "sondrio.it": 1,
    "songdalen.no": 1,
    "songfest.om": 0,
    "soni.nara.jp": 1,
    "soo.kagoshima.jp": 1,
    "sopot.pl": 1,
    "sor-aurdal.no": 1,
    "sor-fron.no": 1,
    "sor-odal.no": 1,
    "sor-varanger.no": 1,
    "sorfold.no": 1,
    "sorreisa.no": 1,
    "sortland.no": 1,
    "sorum.no": 1,
    "sos.pl": 1,
    "sosa.chiba.jp": 1,
    "sosnowiec.pl": 1,
    "soundandvision.museum": 1,
    "southcarolina.museum": 1,
    "southwest.museum": 1,
    "sowa.ibaraki.jp": 1,
    "sp.it": 1,
    "space-to-rent.com": 1,
    "space.museum": 1,
    "spb.ru": 1,
    "spjelkavik.no": 1,
    "sport.hu": 1,
    "spy.museum": 1,
    "spydeberg.no": 1,
    "square.museum": 1,
    "sr.gov.pl": 1,
    "sr.it": 1,
    "srv.br": 1,
    "ss.it": 1,
    "sshn.se": 1,
    "st.no": 1,
    "stadt.museum": 1,
    "stalbans.museum": 1,
    "stalowa-wola.pl": 1,
    "stange.no": 1,
    "starachowice.pl": 1,
    "stargard.pl": 1,
    "starnberg.museum": 1,
    "starostwo.gov.pl": 1,
    "stat.no": 1,
    "state.museum": 1,
    "statecouncil.om": 0,
    "stateofdelaware.museum": 1,
    "stathelle.no": 1,
    "station.museum": 1,
    "stavanger.no": 1,
    "stavern.no": 1,
    "stavropol.ru": 1,
    "steam.museum": 1,
    "steiermark.museum": 1,
    "steigen.no": 1,
    "steinkjer.no": 1,
    "stjohn.museum": 1,
    "stjordal.no": 1,
    "stjordalshalsen.no": 1,
    "stj\u00f8rdal.no": 1,
    "stj\u00f8rdalshalsen.no": 1,
    "stockholm.museum": 1,
    "stokke.no": 1,
    "stor-elvdal.no": 1,
    "stord.no": 1,
    "stordal.no": 1,
    "store.bb": 1,
    "store.nf": 1,
    "store.ro": 1,
    "store.st": 1,
    "storfjord.no": 1,
    "stpetersburg.museum": 1,
    "strand.no": 1,
    "stranda.no": 1,
    "stryn.no": 1,
    "student.aero": 1,
    "stuff-4-sale.org": 1,
    "stuff-4-sale.us": 1,
    "stuttgart.museum": 1,
    "stv.ru": 1,
    "sue.fukuoka.jp": 1,
    "suedtirol.it": 1,
    "suginami.tokyo.jp": 1,
    "sugito.saitama.jp": 1,
    "suifu.ibaraki.jp": 1,
    "suisse.museum": 1,
    "suita.osaka.jp": 1,
    "sukagawa.fukushima.jp": 1,
    "sukumo.kochi.jp": 1,
    "sula.no": 1,
    "suldal.no": 1,
    "suli.hu": 1,
    "sumida.tokyo.jp": 1,
    "sumita.iwate.jp": 1,
    "sumoto.hyogo.jp": 1,
    "sumoto.kumamoto.jp": 1,
    "sumy.ua": 1,
    "sunagawa.hokkaido.jp": 1,
    "sund.no": 1,
    "sunndal.no": 1,
    "surgeonshall.museum": 1,
    "surgut.ru": 1,
    "surnadal.no": 1,
    "surrey.museum": 1,
    "susaki.kochi.jp": 1,
    "susono.shizuoka.jp": 1,
    "suwa.nagano.jp": 1,
    "suwalki.pl": 1,
    "suzaka.nagano.jp": 1,
    "suzu.ishikawa.jp": 1,
    "suzuka.mie.jp": 1,
    "sv": 2,
    "sv.it": 1,
    "svalbard.no": 1,
    "sveio.no": 1,
    "svelvik.no": 1,
    "svizzera.museum": 1,
    "sweden.museum": 1,
    "swidnica.pl": 1,
    "swiebodzin.pl": 1,
    "swinoujscie.pl": 1,
    "sx.cn": 1,
    "sydney.museum": 1,
    "sykkylven.no": 1,
    "syzran.ru": 1,
    "szczecin.pl": 1,
    "szczytno.pl": 1,
    "szex.hu": 1,
    "szkola.pl": 1,
    "s\u00e1lat.no": 1,
    "s\u00e1l\u00e1t.no": 1,
    "s\u00f8gne.no": 1,
    "s\u00f8mna.no": 1,
    "s\u00f8ndre-land.no": 1,
    "s\u00f8r-aurdal.no": 1,
    "s\u00f8r-fron.no": 1,
    "s\u00f8r-odal.no": 1,
    "s\u00f8r-varanger.no": 1,
    "s\u00f8rfold.no": 1,
    "s\u00f8rreisa.no": 1,
    "s\u00f8rum.no": 1,
    "t.bg": 1,
    "t.se": 1,
    "ta.it": 1,
    "tabayama.yamanashi.jp": 1,
    "tabuse.yamaguchi.jp": 1,
    "tachiarai.fukuoka.jp": 1,
    "tachikawa.tokyo.jp": 1,
    "tadaoka.osaka.jp": 1,
    "tado.mie.jp": 1,
    "tadotsu.kagawa.jp": 1,
    "tagajo.miyagi.jp": 1,
    "tagami.niigata.jp": 1,
    "tagawa.fukuoka.jp": 1,
    "tahara.aichi.jp": 1,
    "taiji.wakayama.jp": 1,
    "taiki.hokkaido.jp": 1,
    "taiki.mie.jp": 1,
    "tainai.niigata.jp": 1,
    "taira.toyama.jp": 1,
    "taishi.hyogo.jp": 1,
    "taishi.osaka.jp": 1,
    "taishin.fukushima.jp": 1,
    "taito.tokyo.jp": 1,
    "taiwa.miyagi.jp": 1,
    "tajimi.gifu.jp": 1,
    "tajiri.osaka.jp": 1,
    "taka.hyogo.jp": 1,
    "takagi.nagano.jp": 1,
    "takahagi.ibaraki.jp": 1,
    "takahama.aichi.jp": 1,
    "takahama.fukui.jp": 1,
    "takaharu.miyazaki.jp": 1,
    "takahashi.okayama.jp": 1,
    "takahata.yamagata.jp": 1,
    "takaishi.osaka.jp": 1,
    "takamatsu.kagawa.jp": 1,
    "takamori.kumamoto.jp": 1,
    "takamori.nagano.jp": 1,
    "takanabe.miyazaki.jp": 1,
    "takanezawa.tochigi.jp": 1,
    "takaoka.toyama.jp": 1,
    "takarazuka.hyogo.jp": 1,
    "takasago.hyogo.jp": 1,
    "takasaki.gunma.jp": 1,
    "takashima.shiga.jp": 1,
    "takasu.hokkaido.jp": 1,
    "takata.fukuoka.jp": 1,
    "takatori.nara.jp": 1,
    "takatsuki.osaka.jp": 1,
    "takatsuki.shiga.jp": 1,
    "takayama.gifu.jp": 1,
    "takayama.gunma.jp": 1,
    "takayama.nagano.jp": 1,
    "takazaki.miyazaki.jp": 1,
    "takehara.hiroshima.jp": 1,
    "taketa.oita.jp": 1,
    "taketomi.okinawa.jp": 1,
    "taki.mie.jp": 1,
    "takikawa.hokkaido.jp": 1,
    "takino.hyogo.jp": 1,
    "takinoue.hokkaido.jp": 1,
    "takizawa.iwate.jp": 1,
    "takko.aomori.jp": 1,
    "tako.chiba.jp": 1,
    "taku.saga.jp": 1,
    "tama.tokyo.jp": 1,
    "tamakawa.fukushima.jp": 1,
    "tamaki.mie.jp": 1,
    "tamamura.gunma.jp": 1,
    "tamano.okayama.jp": 1,
    "tamatsukuri.ibaraki.jp": 1,
    "tamayu.shimane.jp": 1,
    "tamba.hyogo.jp": 1,
    "tambov.ru": 1,
    "tana.no": 1,
    "tanabe.kyoto.jp": 1,
    "tanabe.wakayama.jp": 1,
    "tanagura.fukushima.jp": 1,
    "tananger.no": 1,
    "tank.museum": 1,
    "tanohata.iwate.jp": 1,
    "tara.saga.jp": 1,
    "tarama.okinawa.jp": 1,
    "taranto.it": 1,
    "targi.pl": 1,
    "tarnobrzeg.pl": 1,
    "tarui.gifu.jp": 1,
    "tarumizu.kagoshima.jp": 1,
    "tas.au": 1,
    "tas.edu.au": 1,
    "tas.gov.au": 1,
    "tatarstan.ru": 1,
    "tatebayashi.gunma.jp": 1,
    "tateshina.nagano.jp": 1,
    "tateyama.chiba.jp": 1,
    "tateyama.toyama.jp": 1,
    "tatsuno.hyogo.jp": 1,
    "tatsuno.nagano.jp": 1,
    "tawaramoto.nara.jp": 1,
    "taxi.aero": 1,
    "taxi.br": 1,
    "tcm.museum": 1,
    "te.it": 1,
    "te.ua": 1,
    "teaches-yoga.com": 1,
    "technology.museum": 1,
    "telekommunikation.museum": 1,
    "television.museum": 1,
    "tempio-olbia.it": 1,
    "tempioolbia.it": 1,
    "tendo.yamagata.jp": 1,
    "tenei.fukushima.jp": 1,
    "tenkawa.nara.jp": 1,
    "tenri.nara.jp": 1,
    "teo.br": 1,
    "teramo.it": 1,
    "terni.it": 1,
    "ternopil.ua": 1,
    "teshikaga.hokkaido.jp": 1,
    "test.ru": 1,
    "test.tj": 1,
    "texas.museum": 1,
    "textile.museum": 1,
    "tgory.pl": 1,
    "theater.museum": 1,
    "thruhere.net": 1,
    "time.museum": 1,
    "time.no": 1,
    "timekeeping.museum": 1,
    "tingvoll.no": 1,
    "tinn.no": 1,
    "tj.cn": 1,
    "tjeldsund.no": 1,
    "tjome.no": 1,
    "tj\u00f8me.no": 1,
    "tm.fr": 1,
    "tm.hu": 1,
    "tm.km": 1,
    "tm.mc": 1,
    "tm.mg": 1,
    "tm.no": 1,
    "tm.pl": 1,
    "tm.ro": 1,
    "tm.se": 1,
    "tmp.br": 1,
    "tn.it": 1,
    "tn.us": 1,
    "to.it": 1,
    "toba.mie.jp": 1,
    "tobe.ehime.jp": 1,
    "tobetsu.hokkaido.jp": 1,
    "tobishima.aichi.jp": 1,
    "tochigi.jp": 1,
    "tochigi.tochigi.jp": 1,
    "tochio.niigata.jp": 1,
    "toda.saitama.jp": 1,
    "toei.aichi.jp": 1,
    "toga.toyama.jp": 1,
    "togakushi.nagano.jp": 1,
    "togane.chiba.jp": 1,
    "togitsu.nagasaki.jp": 1,
    "togo.aichi.jp": 1,
    "togura.nagano.jp": 1,
    "tohma.hokkaido.jp": 1,
    "tohnosho.chiba.jp": 1,
    "toho.fukuoka.jp": 1,
    "tokai.aichi.jp": 1,
    "tokai.ibaraki.jp": 1,
    "tokamachi.niigata.jp": 1,
    "tokashiki.okinawa.jp": 1,
    "toki.gifu.jp": 1,
    "tokigawa.saitama.jp": 1,
    "tokke.no": 1,
    "tokoname.aichi.jp": 1,
    "tokorozawa.saitama.jp": 1,
    "tokushima.jp": 1,
    "tokushima.tokushima.jp": 1,
    "tokuyama.yamaguchi.jp": 1,
    "tokyo.jp": 1,
    "tolga.no": 1,
    "tom.ru": 1,
    "tomakomai.hokkaido.jp": 1,
    "tomari.hokkaido.jp": 1,
    "tome.miyagi.jp": 1,
    "tomi.nagano.jp": 1,
    "tomigusuku.okinawa.jp": 1,
    "tomika.gifu.jp": 1,
    "tomioka.gunma.jp": 1,
    "tomisato.chiba.jp": 1,
    "tomiya.miyagi.jp": 1,
    "tomobe.ibaraki.jp": 1,
    "tomsk.ru": 1,
    "tonaki.okinawa.jp": 1,
    "tonami.toyama.jp": 1,
    "tondabayashi.osaka.jp": 1,
    "tone.ibaraki.jp": 1,
    "tono.iwate.jp": 1,
    "tonosho.kagawa.jp": 1,
    "tonsberg.no": 1,
    "toon.ehime.jp": 1,
    "topology.museum": 1,
    "torahime.shiga.jp": 1,
    "toride.ibaraki.jp": 1,
    "torino.it": 1,
    "torino.museum": 1,
    "torsken.no": 1,
    "tosa.kochi.jp": 1,
    "tosashimizu.kochi.jp": 1,
    "toshima.tokyo.jp": 1,
    "tosu.saga.jp": 1,
    "tottori.jp": 1,
    "tottori.tottori.jp": 1,
    "touch.museum": 1,
    "tourism.pl": 1,
    "tourism.tn": 1,
    "towada.aomori.jp": 1,
    "town.museum": 1,
    "toya.hokkaido.jp": 1,
    "toyako.hokkaido.jp": 1,
    "toyama.jp": 1,
    "toyama.toyama.jp": 1,
    "toyo.kochi.jp": 1,
    "toyoake.aichi.jp": 1,
    "toyohashi.aichi.jp": 1,
    "toyokawa.aichi.jp": 1,
    "toyonaka.osaka.jp": 1,
    "toyone.aichi.jp": 1,
    "toyono.osaka.jp": 1,
    "toyooka.hyogo.jp": 1,
    "toyosato.shiga.jp": 1,
    "toyota.aichi.jp": 1,
    "toyota.yamaguchi.jp": 1,
    "toyotomi.hokkaido.jp": 1,
    "toyotsu.fukuoka.jp": 1,
    "toyoura.hokkaido.jp": 1,
    "tozawa.yamagata.jp": 1,
    "tozsde.hu": 1,
    "tp.it": 1,
    "tr": 2,
    "tr.it": 1,
    "tr.no": 1,
    "tra.kp": 1,
    "trader.aero": 1,
    "trading.aero": 1,
    "traeumtgerade.de": 1,
    "trainer.aero": 1,
    "trana.no": 1,
    "tranby.no": 1,
    "trani-andria-barletta.it": 1,
    "trani-barletta-andria.it": 1,
    "traniandriabarletta.it": 1,
    "tranibarlettaandria.it": 1,
    "tranoy.no": 1,
    "transport.museum": 1,
    "tran\u00f8y.no": 1,
    "trapani.it": 1,
    "travel.pl": 1,
    "travel.tt": 1,
    "trd.br": 1,
    "tree.museum": 1,
    "trentino.it": 1,
    "trento.it": 1,
    "treviso.it": 1,
    "trieste.it": 1,
    "troandin.no": 1,
    "trogstad.no": 1,
    "trolley.museum": 1,
    "tromsa.no": 1,
    "tromso.no": 1,
    "troms\u00f8.no": 1,
    "trondheim.no": 1,
    "trust.museum": 1,
    "trustee.museum": 1,
    "trysil.no": 1,
    "tr\u00e6na.no": 1,
    "tr\u00f8gstad.no": 1,
    "ts.it": 1,
    "tsaritsyn.ru": 1,
    "tsk.ru": 1,
    "tsu.mie.jp": 1,
    "tsubame.niigata.jp": 1,
    "tsubata.ishikawa.jp": 1,
    "tsubetsu.hokkaido.jp": 1,
    "tsuchiura.ibaraki.jp": 1,
    "tsuga.tochigi.jp": 1,
    "tsugaru.aomori.jp": 1,
    "tsuiki.fukuoka.jp": 1,
    "tsukigata.hokkaido.jp": 1,
    "tsukiyono.gunma.jp": 1,
    "tsukuba.ibaraki.jp": 1,
    "tsukui.kanagawa.jp": 1,
    "tsukumi.oita.jp": 1,
    "tsumagoi.gunma.jp": 1,
    "tsunan.niigata.jp": 1,
    "tsuno.kochi.jp": 1,
    "tsuno.miyazaki.jp": 1,
    "tsuru.yamanashi.jp": 1,
    "tsuruga.fukui.jp": 1,
    "tsurugashima.saitama.jp": 1,
    "tsurugi.ishikawa.jp": 1,
    "tsuruoka.yamagata.jp": 1,
    "tsuruta.aomori.jp": 1,
    "tsushima.aichi.jp": 1,
    "tsushima.nagasaki.jp": 1,
    "tsuwano.shimane.jp": 1,
    "tsuyama.okayama.jp": 1,
    "tula.ru": 1,
    "tur.br": 1,
    "turek.pl": 1,
    "turen.tn": 1,
    "turin.it": 1,
    "turystyka.pl": 1,
    "tuva.ru": 1,
    "tv.bo": 1,
    "tv.br": 1,
    "tv.it": 1,
    "tv.na": 1,
    "tv.sd": 1,
    "tvedestrand.no": 1,
    "tver.ru": 1,
    "tw.cn": 1,
    "tx.us": 1,
    "tychy.pl": 1,
    "tydal.no": 1,
    "tynset.no": 1,
    "tysfjord.no": 1,
    "tysnes.no": 1,
    "tysvar.no": 1,
    "tysv\u00e6r.no": 1,
    "tyumen.ru": 1,
    "t\u00f8nsberg.no": 1,
    "u.bg": 1,
    "u.se": 1,
    "uba.ar": 0,
    "ube.yamaguchi.jp": 1,
    "uchihara.ibaraki.jp": 1,
    "uchiko.ehime.jp": 1,
    "uchinada.ishikawa.jp": 1,
    "uchinomi.kagawa.jp": 1,
    "ud.it": 1,
    "uda.nara.jp": 1,
    "udine.it": 1,
    "udm.ru": 1,
    "udmurtia.ru": 1,
    "udono.mie.jp": 1,
    "ueda.nagano.jp": 1,
    "ueno.gunma.jp": 1,
    "uenohara.yamanashi.jp": 1,
    "ug.gov.pl": 1,
    "uhren.museum": 1,
    "uji.kyoto.jp": 1,
    "ujiie.tochigi.jp": 1,
    "ujitawara.kyoto.jp": 1,
    "uk": 2,
    "uk.com": 1,
    "uk.net": 1,
    "uki.kumamoto.jp": 1,
    "ukiha.fukuoka.jp": 1,
    "ulan-ude.ru": 1,
    "ullensaker.no": 1,
    "ullensvang.no": 1,
    "ulm.museum": 1,
    "ulsan.kr": 1,
    "ulvik.no": 1,
    "um.gov.pl": 1,
    "umaji.kochi.jp": 1,
    "umi.fukuoka.jp": 1,
    "unazuki.toyama.jp": 1,
    "unbi.ba": 1,
    "undersea.museum": 1,
    "union.aero": 1,
    "univ.sn": 1,
    "university.museum": 1,
    "unjarga.no": 1,
    "unj\u00e1rga.no": 1,
    "unnan.shimane.jp": 1,
    "unsa.ba": 1,
    "unzen.nagasaki.jp": 1,
    "uonuma.niigata.jp": 1,
    "uozu.toyama.jp": 1,
    "upow.gov.pl": 1,
    "urakawa.hokkaido.jp": 1,
    "urasoe.okinawa.jp": 1,
    "urausu.hokkaido.jp": 1,
    "urawa.saitama.jp": 1,
    "urayasu.chiba.jp": 1,
    "urbino-pesaro.it": 1,
    "urbinopesaro.it": 1,
    "ureshino.mie.jp": 1,
    "uri.arpa": 1,
    "urn.arpa": 1,
    "uruma.okinawa.jp": 1,
    "uryu.hokkaido.jp": 1,
    "us.com": 1,
    "us.na": 1,
    "us.org": 1,
    "usa.museum": 1,
    "usa.oita.jp": 1,
    "usantiques.museum": 1,
    "usarts.museum": 1,
    "uscountryestate.museum": 1,
    "usculture.museum": 1,
    "usdecorativearts.museum": 1,
    "usenet.pl": 1,
    "usgarden.museum": 1,
    "ushiku.ibaraki.jp": 1,
    "ushistory.museum": 1,
    "ushuaia.museum": 1,
    "uslivinghistory.museum": 1,
    "ustka.pl": 1,
    "usui.fukuoka.jp": 1,
    "usuki.oita.jp": 1,
    "ut.us": 1,
    "utah.museum": 1,
    "utashinai.hokkaido.jp": 1,
    "utazas.hu": 1,
    "utazu.kagawa.jp": 1,
    "uto.kumamoto.jp": 1,
    "utsira.no": 1,
    "utsunomiya.tochigi.jp": 1,
    "uvic.museum": 1,
    "uw.gov.pl": 1,
    "uwajima.ehime.jp": 1,
    "uy.com": 1,
    "uz.ua": 1,
    "uzhgorod.ua": 1,
    "v.bg": 1,
    "va.it": 1,
    "va.no": 1,
    "va.us": 1,
    "vaapste.no": 1,
    "vadso.no": 1,
    "vads\u00f8.no": 1,
    "vaga.no": 1,
    "vagan.no": 1,
    "vagsoy.no": 1,
    "vaksdal.no": 1,
    "valer.hedmark.no": 1,
    "valer.ostfold.no": 1,
    "valle.no": 1,
    "valley.museum": 1,
    "vang.no": 1,
    "vantaa.museum": 1,
    "vanylven.no": 1,
    "vardo.no": 1,
    "vard\u00f8.no": 1,
    "varese.it": 1,
    "varggat.no": 1,
    "varoy.no": 1,
    "vb.it": 1,
    "vc.it": 1,
    "vdonsk.ru": 1,
    "ve.it": 1,
    "vefsn.no": 1,
    "vega.no": 1,
    "vegarshei.no": 1,
    "veg\u00e5rshei.no": 1,
    "venezia.it": 1,
    "venice.it": 1,
    "vennesla.no": 1,
    "verbania.it": 1,
    "vercelli.it": 1,
    "verdal.no": 1,
    "verona.it": 1,
    "verran.no": 1,
    "versailles.museum": 1,
    "vestby.no": 1,
    "vestnes.no": 1,
    "vestre-slidre.no": 1,
    "vestre-toten.no": 1,
    "vestvagoy.no": 1,
    "vestv\u00e5g\u00f8y.no": 1,
    "vet.br": 1,
    "veterinaire.fr": 1,
    "veterinaire.km": 1,
    "vevelstad.no": 1,
    "vf.no": 1,
    "vgs.no": 1,
    "vi.it": 1,
    "vi.us": 1,
    "vibo-valentia.it": 1,
    "vibovalentia.it": 1,
    "vic.au": 1,
    "vic.edu.au": 1,
    "vic.gov.au": 1,
    "vicenza.it": 1,
    "video.hu": 1,
    "vik.no": 1,
    "viking.museum": 1,
    "vikna.no": 1,
    "village.museum": 1,
    "vindafjord.no": 1,
    "vinnica.ua": 1,
    "vinnytsia.ua": 1,
    "virginia.museum": 1,
    "virtual.museum": 1,
    "virtuel.museum": 1,
    "viterbo.it": 1,
    "vlaanderen.museum": 1,
    "vladikavkaz.ru": 1,
    "vladimir.ru": 1,
    "vladivostok.ru": 1,
    "vlog.br": 1,
    "vn.ua": 1,
    "voagat.no": 1,
    "volda.no": 1,
    "volgograd.ru": 1,
    "volkenkunde.museum": 1,
    "vologda.ru": 1,
    "volyn.ua": 1,
    "voronezh.ru": 1,
    "voss.no": 1,
    "vossevangen.no": 1,
    "vr.it": 1,
    "vrn.ru": 1,
    "vs.it": 1,
    "vt.it": 1,
    "vt.us": 1,
    "vv.it": 1,
    "vyatka.ru": 1,
    "v\u00e1rgg\u00e1t.no": 1,
    "v\u00e5gan.no": 1,
    "v\u00e5gs\u00f8y.no": 1,
    "v\u00e5g\u00e5.no": 1,
    "v\u00e5ler.hedmark.no": 1,
    "v\u00e5ler.\u00f8stfold.no": 1,
    "v\u00e6r\u00f8y.no": 1,
    "w.bg": 1,
    "w.se": 1,
    "wa.au": 1,
    "wa.edu.au": 1,
    "wa.gov.au": 1,
    "wa.us": 1,
    "wada.nagano.jp": 1,
    "wajiki.tokushima.jp": 1,
    "wajima.ishikawa.jp": 1,
    "wakasa.fukui.jp": 1,
    "wakasa.tottori.jp": 1,
    "wakayama.jp": 1,
    "wakayama.wakayama.jp": 1,
    "wake.okayama.jp": 1,
    "wakkanai.hokkaido.jp": 1,
    "wakuya.miyagi.jp": 1,
    "walbrzych.pl": 1,
    "wales.museum": 1,
    "wallonie.museum": 1,
    "wanouchi.gifu.jp": 1,
    "war.museum": 1,
    "warabi.saitama.jp": 1,
    "warmia.pl": 1,
    "warszawa.pl": 1,
    "washingtondc.museum": 1,
    "wassamu.hokkaido.jp": 1,
    "watarai.mie.jp": 1,
    "watari.miyagi.jp": 1,
    "watch-and-clock.museum": 1,
    "watchandclock.museum": 1,
    "waw.pl": 1,
    "wazuka.kyoto.jp": 1,
    "web.co": 1,
    "web.do": 1,
    "web.id": 1,
    "web.lk": 1,
    "web.nf": 1,
    "web.pk": 1,
    "web.tj": 1,
    "web.ve": 1,
    "webhop.biz": 1,
    "webhop.info": 1,
    "webhop.net": 1,
    "webhop.org": 1,
    "wegrow.pl": 1,
    "western.museum": 1,
    "westfalen.museum": 1,
    "whaling.museum": 1,
    "wi.us": 1,
    "wielun.pl": 1,
    "wiki.br": 1,
    "wildlife.museum": 1,
    "williamsburg.museum": 1,
    "windmill.museum": 1,
    "wlocl.pl": 1,
    "wloclawek.pl": 1,
    "wodzislaw.pl": 1,
    "wolomin.pl": 1,
    "workinggroup.aero": 1,
    "works.aero": 1,
    "workshop.museum": 1,
    "worse-than.tv": 1,
    "writesthisblog.com": 1,
    "wroc.pl": 1,
    "wroclaw.pl": 1,
    "ws.na": 1,
    "wv.us": 1,
    "www.ck": 0,
    "www.gt": 0,
    "www.ro": 1,
    "wy.us": 1,
    "x.bg": 1,
    "x.se": 1,
    "xj.cn": 1,
    "xz.cn": 1,
    "y.bg": 1,
    "y.se": 1,
    "yabu.hyogo.jp": 1,
    "yabuki.fukushima.jp": 1,
    "yachimata.chiba.jp": 1,
    "yachiyo.chiba.jp": 1,
    "yachiyo.ibaraki.jp": 1,
    "yaese.okinawa.jp": 1,
    "yahaba.iwate.jp": 1,
    "yahiko.niigata.jp": 1,
    "yaita.tochigi.jp": 1,
    "yaizu.shizuoka.jp": 1,
    "yakage.okayama.jp": 1,
    "yakumo.hokkaido.jp": 1,
    "yakumo.shimane.jp": 1,
    "yakutia.ru": 1,
    "yalta.ua": 1,
    "yamada.fukuoka.jp": 1,
    "yamada.iwate.jp": 1,
    "yamada.toyama.jp": 1,
    "yamaga.kumamoto.jp": 1,
    "yamagata.gifu.jp": 1,
    "yamagata.ibaraki.jp": 1,
    "yamagata.jp": 1,
    "yamagata.nagano.jp": 1,
    "yamagata.yamagata.jp": 1,
    "yamaguchi.jp": 1,
    "yamakita.kanagawa.jp": 1,
    "yamal.ru": 1,
    "yamamoto.miyagi.jp": 1,
    "yamanakako.yamanashi.jp": 1,
    "yamanashi.jp": 1,
    "yamanashi.yamanashi.jp": 1,
    "yamanobe.yamagata.jp": 1,
    "yamanouchi.nagano.jp": 1,
    "yamashina.kyoto.jp": 1,
    "yamato.fukushima.jp": 1,
    "yamato.kanagawa.jp": 1,
    "yamato.kumamoto.jp": 1,
    "yamatokoriyama.nara.jp": 1,
    "yamatotakada.nara.jp": 1,
    "yamatsuri.fukushima.jp": 1,
    "yamazoe.nara.jp": 1,
    "yame.fukuoka.jp": 1,
    "yanagawa.fukuoka.jp": 1,
    "yanaizu.fukushima.jp": 1,
    "yao.osaka.jp": 1,
    "yaotsu.gifu.jp": 1,
    "yaroslavl.ru": 1,
    "yasaka.nagano.jp": 1,
    "yashio.saitama.jp": 1,
    "yashiro.hyogo.jp": 1,
    "yasu.shiga.jp": 1,
    "yasuda.kochi.jp": 1,
    "yasugi.shimane.jp": 1,
    "yasuoka.nagano.jp": 1,
    "yatomi.aichi.jp": 1,
    "yatsuka.shimane.jp": 1,
    "yatsushiro.kumamoto.jp": 1,
    "yawara.ibaraki.jp": 1,
    "yawata.kyoto.jp": 1,
    "yawatahama.ehime.jp": 1,
    "yazu.tottori.jp": 1,
    "ye": 2,
    "yekaterinburg.ru": 1,
    "yk.ca": 1,
    "yn.cn": 1,
    "yoichi.hokkaido.jp": 1,
    "yoita.niigata.jp": 1,
    "yoka.hyogo.jp": 1,
    "yokaichiba.chiba.jp": 1,
    "yokawa.hyogo.jp": 1,
    "yokkaichi.mie.jp": 1,
    "yokohama.jp": 2,
    "yokoshibahikari.chiba.jp": 1,
    "yokosuka.kanagawa.jp": 1,
    "yokote.akita.jp": 1,
    "yokoze.saitama.jp": 1,
    "yomitan.okinawa.jp": 1,
    "yonabaru.okinawa.jp": 1,
    "yonago.tottori.jp": 1,
    "yonaguni.okinawa.jp": 1,
    "yonezawa.yamagata.jp": 1,
    "yono.saitama.jp": 1,
    "yorii.saitama.jp": 1,
    "york.museum": 1,
    "yorkshire.museum": 1,
    "yoro.gifu.jp": 1,
    "yosemite.museum": 1,
    "yoshida.saitama.jp": 1,
    "yoshida.shizuoka.jp": 1,
    "yoshikawa.saitama.jp": 1,
    "yoshimi.saitama.jp": 1,
    "yoshino.nara.jp": 1,
    "yoshinogari.saga.jp": 1,
    "yoshioka.gunma.jp": 1,
    "yotsukaido.chiba.jp": 1,
    "youth.museum": 1,
    "yuasa.wakayama.jp": 1,
    "yufu.oita.jp": 1,
    "yugawa.fukushima.jp": 1,
    "yugawara.kanagawa.jp": 1,
    "yuki.ibaraki.jp": 1,
    "yukuhashi.fukuoka.jp": 1,
    "yura.wakayama.jp": 1,
    "yurihonjo.akita.jp": 1,
    "yusuhara.kochi.jp": 1,
    "yusui.kagoshima.jp": 1,
    "yuu.yamaguchi.jp": 1,
    "yuza.yamagata.jp": 1,
    "yuzawa.niigata.jp": 1,
    "yuzhno-sakhalinsk.ru": 1,
    "z.bg": 1,
    "z.se": 1,
    "za": 2,
    "za.com": 1,
    "za.net": 1,
    "za.org": 1,
    "zachpomor.pl": 1,
    "zagan.pl": 1,
    "zakopane.pl": 1,
    "zama.kanagawa.jp": 1,
    "zamami.okinawa.jp": 1,
    "zao.miyagi.jp": 1,
    "zaporizhzhe.ua": 1,
    "zaporizhzhia.ua": 1,
    "zarow.pl": 1,
    "zentsuji.kagawa.jp": 1,
    "zgora.pl": 1,
    "zgorzelec.pl": 1,
    "zgrad.ru": 1,
    "zhitomir.ua": 1,
    "zhytomyr.ua": 1,
    "zj.cn": 1,
    "zlg.br": 1,
    "zm": 2,
    "zoological.museum": 1,
    "zoology.museum": 1,
    "zp.ua": 1,
    "zt.ua": 1,
    "zushi.kanagawa.jp": 1,
    "zw": 2,
    "\u00e1k\u014boluokta.no": 1,
    "\u00e1laheadju.no": 1,
    "\u00e1lt\u00e1.no": 1,
    "\u00e5fjord.no": 1,
    "\u00e5krehamn.no": 1,
    "\u00e5l.no": 1,
    "\u00e5lesund.no": 1,
    "\u00e5lg\u00e5rd.no": 1,
    "\u00e5mli.no": 1,
    "\u00e5mot.no": 1,
    "\u00e5rdal.no": 1,
    "\u00e5s.no": 1,
    "\u00e5seral.no": 1,
    "\u00e5snes.no": 1,
    "\u00f8ksnes.no": 1,
    "\u00f8rland.no": 1,
    "\u00f8rskog.no": 1,
    "\u00f8rsta.no": 1,
    "\u00f8stre-toten.no": 1,
    "\u00f8vre-eiker.no": 1,
    "\u00f8yer.no": 1,
    "\u00f8ygarden.no": 1,
    "\u00f8ystre-slidre.no": 1,
    "\u010d\u00e1hcesuolo.no": 1,
    "\u0438\u043a\u043e\u043c.museum": 1,
    "\u05d9\u05e8\u05d5\u05e9\u05dc\u05d9\u05dd.museum": 1,
    "\u0627\u064a\u0631\u0627\u0646.ir": 1,
    "\u0627\u06cc\u0631\u0627\u0646.ir": 1,
    "\u4e2a\u4eba.hk": 1,
    "\u500b\u4eba.hk": 1,
    "\u516c\u53f8.cn": 1,
    "\u516c\u53f8.hk": 1,
    "\u5546\u696d.tw": 1,
    "\u653f\u5e9c.hk": 1,
    "\u654e\u80b2.hk": 1,
    "\u6559\u80b2.hk": 1,
    "\u7b87\u4eba.hk": 1,
    "\u7d44\u7e54.hk": 1,
    "\u7d44\u7e54.tw": 1,
    "\u7d44\u7ec7.hk": 1,
    "\u7db2\u7d61.cn": 1,
    "\u7db2\u7d61.hk": 1,
    "\u7db2\u7edc.hk": 1,
    "\u7db2\u8def.tw": 1,
    "\u7ec4\u7e54.hk": 1,
    "\u7ec4\u7ec7.hk": 1,
    "\u7f51\u7d61.hk": 1,
    "\u7f51\u7edc.cn": 1,
    "\u7f51\u7edc.hk": 1
};

/*!
 * Parts of original code from ipv6.js <https://github.com/beaugunderson/javascript-ipv6>
 * Copyright 2011 Beau Gunderson
 * Available under MIT license <http://mths.be/mit>
 */

var RE_V4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|0x[0-9a-f][0-9a-f]?|0[0-7]{3})\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|0x[0-9a-f][0-9a-f]?|0[0-7]{3})$/i;
var RE_V4_HEX = /^0x([0-9a-f]{8})$/i;
var RE_V4_NUMERIC = /^[0-9]+$/;
var RE_V4inV6 = /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

var RE_BAD_CHARACTERS = /([^0-9a-f:])/i;
var RE_BAD_ADDRESS = /([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]$)/i;

function isIPv4(address)
{
  if (RE_V4.test(address))
    return true;
  if (RE_V4_HEX.test(address))
    return true;
  if (RE_V4_NUMERIC.test(address))
    return true;
  return false;
}

function isIPv6(address)
{
  var a4addon = 0;
  var address4 = address.match(RE_V4inV6);
  if (address4)
  {
    var temp4 = address4[0].split('.');
    for (var i = 0; i < 4; i++)
    {
      if (/^0[0-9]+/.test(temp4[i]))
        return false;
    }
    address = address.replace(RE_V4inV6, '');
    if (/[0-9]$/.test(address))
      return false;

    address = address + temp4.join(':');
    a4addon = 2;
  }

  if (RE_BAD_CHARACTERS.test(address))
    return false;

  if (RE_BAD_ADDRESS.test(address))
    return false;

  function count(string, substring)
  {
    return (string.length - string.replace(new RegExp(substring,"g"), '').length) / substring.length;
  }

  var halves = count(address, '::');
  if (halves == 1 && count(address, ':') <= 6 + 2 + a4addon)
    return true;
  if (halves == 0 && count(address, ':') == 7 + a4addon)
    return true;
  return false;
}

/**
 * Returns base domain for specified host based on Public Suffix List.
 */
function getBaseDomain(/**String*/ hostname) /**String*/
{
  // remove trailing dot(s)
  hostname = hostname.replace(/\.+$/, '');

  // return IP address untouched
  if (isIPv6(hostname) || isIPv4(hostname))
    return hostname;

  // decode punycode if exists
  //if (hostname.indexOf('xn--') >= 0)
  //{
  //  hostname = punycode.toUnicode(hostname);
  //}

  // search through PSL
  var prevDomains = [];
  var curDomain = hostname;
  var nextDot = curDomain.indexOf('.');
  var tld = 0;

  while (true)
  {
    var suffix = publicSuffixes[curDomain];
    if (typeof(suffix) != 'undefined')
    {
      tld = suffix;
        break;
    }

    if (nextDot < 0)
    {
      tld = 1;
      break;
    }

    prevDomains.push(curDomain.substring(0,nextDot));
    curDomain = curDomain.substring(nextDot+1);
    nextDot = curDomain.indexOf('.');
  }

  while (tld > 0 && prevDomains.length > 0)
  {
    curDomain = prevDomains.pop() + '.' + curDomain;
    tld--;
  }

  return curDomain;
}

/**
 * Checks whether a request is third party for the given document, uses
 * information from the public suffix list to determine the effective domain
 * name for the document.
 */
function isThirdParty(/**String*/ requestHost, /**String*/ documentHost)
{
  // Remove trailing dots
  requestHost = requestHost.replace(/\.+$/, "");
  documentHost = documentHost.replace(/\.+$/, "");

  // Extract domain name - leave IP addresses unchanged, otherwise leave only base domain
  var documentDomain = getBaseDomain(documentHost);
  if (requestHost.length > documentDomain.length)
    return (requestHost.substr(requestHost.length - documentDomain.length - 1) != "." + documentDomain);
  else
    return (requestHost != documentDomain);
}

/**
 * Extracts host name from a URL.
 */
function extractHostFromURL(/**String*/ url)
{
  if (url && extractHostFromURL._lastURL == url)
    return extractHostFromURL._lastDomain;

  var host = "";
  try
  {
    host = new URI(url).host;
  }
  catch (e)
  {
    // Keep the empty string for invalid URIs.
  }

  extractHostFromURL._lastURL = url;
  extractHostFromURL._lastDomain = host;
  return host;
}

/**
 * Parses URLs and provides an interface similar to nsIURI in Gecko, see
 * https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIURI.
 * TODO: Make sure the parsing actually works the same as nsStandardURL.
 * @constructor
 */
function URI(/**String*/ spec)
{
  this.spec = spec;
  this._schemeEnd = spec.indexOf(":");
  if (this._schemeEnd < 0)
    throw new Error("Invalid URI scheme");

  if (spec.substr(this._schemeEnd + 1, 2) != "//")
    throw new Error("Unexpected URI structure");

  this._hostPortStart = this._schemeEnd + 3;
  this._hostPortEnd = spec.indexOf("/", this._hostPortStart);
  if (this._hostPortEnd < 0)
    throw new Error("Invalid URI host");

  var authEnd = spec.indexOf("@", this._hostPortStart);
  if (authEnd >= 0 && authEnd < this._hostPortEnd)
    this._hostPortStart = authEnd + 1;

  this._portStart = -1;
  this._hostEnd = spec.indexOf("]", this._hostPortStart + 1);
  if (spec[this._hostPortStart] == "[" && this._hostEnd >= 0 && this._hostEnd < this._hostPortEnd)
  {
    // The host is an IPv6 literal
    this._hostStart = this._hostPortStart + 1;
    if (spec[this._hostEnd + 1] == ":")
      this._portStart = this._hostEnd + 2;
  }
  else
  {
    this._hostStart = this._hostPortStart;
    this._hostEnd = spec.indexOf(":", this._hostStart);
    if (this._hostEnd >= 0 && this._hostEnd < this._hostPortEnd)
      this._portStart = this._hostEnd + 1;
    else
      this._hostEnd = this._hostPortEnd;
  }
}
URI.prototype =
{
  spec: null,
  get scheme()
  {
    return this.spec.substring(0, this._schemeEnd).toLowerCase();
  },
  get host()
  {
    return this.spec.substring(this._hostStart, this._hostEnd);
  },
  get asciiHost()
  {
    var host = this.host;
    //if (/^[\x00-\x7F]+$/.test(host))
      return host;
    //else
    //  return punycode.toASCII(host);
  },
  get hostPort()
  {
    return this.spec.substring(this._hostPortStart, this._hostPortEnd);
  },
  get port()
  {
    if (this._portStart < 0)
      return -1;
    else
      return parseInt(this.spec.substring(this._portStart, this._hostPortEnd), 10);
  },
  get path()
  {
    return this.spec.substring(this._hostPortEnd);
  },
  get prePath()
  {
    return this.spec.substring(0, this._hostPortEnd);
  }
};

var RuleList = function( parentObj ) {

  this._parentObj = parentObj;

  // Runtime Rule object storage collection
  this._collection = [];

  this.createRule = function(rule, options) {

    rule += ""; // force rule argument to be a string
    
    // strip leading/trailing whitespace from rule
    rule = rule.replace(/\s*$/,''); // rtrim
    rule = rule.replace(/^\s*/,''); // ltrim
    
    if(rule === "") {
      return { 'id': 0, 'rule': null };
    }

    var ruleId = Math.floor( Math.random() * 1e15 );

    // Sanitize options, if any

    options = options || {};

    var opts = {
      'includeDomains': options.includeDomains || [],
      'excludeDomains': options.excludeDomains || [],
      'resources': options.resources || 0xFFFFFFFF,
      'thirdParty': options.thirdParty !== undefined ? options.thirdParty : null
    };

    //  Process options and append to rule argument

    var filterOptions = [];

    var includeDomainsStr = "";
    var excludeDomainsStr = "";

    if(opts.includeDomains && opts.includeDomains.length > 0) {

      for(var i = 0, l = opts.includeDomains.length; i < l; i++) {
        if(includeDomainsStr.length > 0) includeDomainsStr += "|"; // add domain seperator (pipe)
        includeDomainsStr += opts.includeDomains[i];
      }

    }

    if(opts.excludeDomains && opts.excludeDomains.length > 0) {

      for(var i = 0, l = opts.excludeDomains.length; i < l; i++) {
        if(excludeDomainsStr.length > 0 || includeDomainsStr.length > 0) excludeDomainsStr += "|"; // add domain seperator (pipe)
        excludeDomainsStr += "~" + opts.excludeDomains[i];
      }

    }

    if(includeDomainsStr.length > 0 || excludeDomainsStr.length > 0) {

      var domainsStr = "domain=" + includeDomainsStr + excludeDomainsStr;

      filterOptions.push(domainsStr);

    }

    if(opts.resources && opts.resources !== 0xFFFFFFFF) {

      var typeMap = {
        1: "other",
        2: "script",
        4: "image",
        8: "stylesheet",
        16: "object",
        32: "subdocument",
        64: "document",
        128: "refresh",
        2048: "xmlhttprequest",
        4096: "object_subrequest",
        16384: "media",
        32768: "font"
      };

      var resourcesListStr = "";

      for(var i = 0, l = 31; i < l; i ++) {
        if(((opts.resources >> i) % 2 != 0) === true) {
          var typeStr = typeMap[ Math.pow(2, i) ];
          if(typeStr) {
            if(resourcesListStr.length > 0) resourcesListStr += ",";
            resourcesListStr += typeStr;
          }
        }
      }

      if(resourcesListStr.length > 0) {
        filterOptions.push(resourcesListStr);
      }

    }

    if(opts.thirdParty === true) {
      filterOptions.push("third-party");
    } else if (opts.thirdParty === false) {
      filterOptions.push("~third-party");
    }

    if(filterOptions.length > 0) {
      rule += "$";

      for(var i = 0, l = filterOptions.length; i < l; i++) {
        if(i !== 0) rule += ","; // add filter options seperator (comma)
        rule += filterOptions[i];
      }
    }

    return { 'id': ruleId, 'rule': rule };

  }

  this.addRule = function( ruleObj ) {

    // Parse rule to a Filter object
      var filter = this._parentObj.Filter.fromText( ruleObj['rule'] );

      // Add rule's filter object to AdBlock FilterStorage
      this._parentObj.FilterStorage.addFilter(filter);

      // Add rule to current RuleList collection
      this._collection.push({
        'id': ruleObj['id'],
        'filter': filter
      });

  }

  this.removeRule = function( ruleId ) {

    for(var i = 0, l = this._collection.length; i < l; i++) {

      if( this._collection[i]['id'] && this._collection[i]['id'] == ruleId ) {

        // Remove rule's filter object from AdBlock FilterStorage
        this._parentObj.FilterStorage.removeFilter(this._collection[i]['filter']);

        // Remove rule from current RuleList collection
        this._collection.splice(i);

        break;
      }
    }

  }

};

RuleList.prototype.add = function( rule, options ) {

  var ruleObj = this.createRule(rule, options);

  if(ruleObj['rule'] !== null) {
    this.addRule(ruleObj);
  }

  return ruleObj['id'];

};

RuleList.prototype.remove = function( ruleId ) {

  this.removeRule( ruleId );

};

var BlockRuleList = function( parentObj ) {

  RuleList.call(this, parentObj);

};

BlockRuleList.prototype = Object.create( RuleList.prototype );

var AllowRuleList = function( parentObj ) {

  RuleList.call(this, parentObj);

};

AllowRuleList.prototype = Object.create( RuleList.prototype );

AllowRuleList.prototype.add = function( rule, options ) {

  var ruleObj = this.createRule(rule, options);

  if(ruleObj['rule'] !== null) {

    // Add exclude pattern to rule (@@)
    ruleObj['rule'] = "@@" + ruleObj['rule'];

    this.addRule(ruleObj);

  }

  return ruleObj['id'];

};

var UrlFilterManager = function() {

  OEventTarget.call(this);

  // Add rule list management stubs
  this.block = new BlockRuleList( this );
  this.allow = new AllowRuleList( this );

  // event queue manager
  this.eventQueue = {
    /*
    tabId: [
      'ready': false,
      'contentblocked': [ { eventdetails }, { eventDetails }, { eventDetails } ],
      'contentunblocked': [ { eventdetails }, { eventDetails }, { eventDetails } ],
      'contentallowed': [ { eventdetails }, { eventDetails }, { eventDetails } ] 
    ],
    ...
    */
  };

  // https://github.com/adblockplus/adblockpluschrome/blob/master/background.js

  with(require("filterClasses")) {
    this.Filter = Filter;
    this.RegExpFilter = RegExpFilter;
    this.BlockingFilter = BlockingFilter;
    this.WhitelistFilter = WhitelistFilter;
  }

  with(require("subscriptionClasses")) {
    this.Subscription = Subscription;
    //this.DownloadableSubscription = DownloadableSubscription;
  }

  this.FilterStorage = require("filterStorage").FilterStorage;

  this.defaultMatcher = require("matcher").defaultMatcher;

  // https://github.com/adblockplus/adblockpluschrome/blob/master/webrequest.js

  var self = this;

  var frames = {};

  function recordFrame(tabId, frameId, parentFrameId, frameUrl) {
    if (!(tabId in frames))
      frames[tabId] = {};
    frames[tabId][frameId] = {url: frameUrl, parent: parentFrameId};
  }

  function getFrameData(tabId, frameId) {
    if (tabId in frames && frameId in frames[tabId])
      return frames[tabId][frameId];
    else if (frameId > 0 && tabId in frames && 0 in frames[tabId])
    {
      // We don't know anything about javascript: or data: frames, use top frame
      return frames[tabId][0];
    }
    return null;
  }

  function getFrameUrl(tabId, frameId) {
    var frameData = getFrameData(tabId, frameId);
    return (frameData ? frameData.url : null);
  }

  function forgetTab(tabId) {
    delete frames[tabId];
  }

  function checkRequest(type, tabId, url, frameId) {
    if (isFrameWhitelisted(tabId, frameId))
      return false;

    var documentUrl = getFrameUrl(tabId, frameId);
    if (!documentUrl)
      return false;

    var requestHost = extractHostFromURL(url);
    var documentHost = extractHostFromURL(documentUrl);
    var thirdParty = isThirdParty(requestHost, documentHost);

    return self.defaultMatcher.matchesAny(url, type, documentHost, thirdParty);
  }

  function isFrameWhitelisted(tabId, frameId, type) {
    var parent = frameId;
    var parentData = getFrameData(tabId, parent);
    while (parentData)
    {
      var frame = parent;
      var frameData = parentData;

      parent = frameData.parent;
      parentData = getFrameData(tabId, parent);

      var frameUrl = frameData.url;
      var parentUrl = (parentData ? parentData.url : frameUrl);
      if ("keyException" in frameData || isWhitelisted(frameUrl, parentUrl, type))
        return true;
    }
    return false;
  }

  function isWhitelisted(url, parentUrl, type)
  {
    // Ignore fragment identifier
    var index = url.indexOf("#");
    if (index >= 0)
      url = url.substring(0, index);

    var result = self.defaultMatcher.matchesAny(url, type || "DOCUMENT", extractHostFromURL(parentUrl || url), false);
    return (result instanceof self.WhitelistFilter ? result : null);
  }

  // Parse a single web request url and decide whether we should block or not
  function onBeforeRequest(details) {

    if (details.tabId == -1) {
      return {};
    }

    var type = details.type;

    if (type == "main_frame" || type == "sub_frame") {
      recordFrame(details.tabId, details.frameId, details.parentFrameId, details.url);
    }

    // Type names match Mozilla's with main_frame and sub_frame being the only exceptions.
    if (type == "sub_frame") {
      type = "SUBDOCUMENT";
    } else if (type == "main_frame") {
      type = "DOCUMENT";
    } else {
      type = (type + "").toUpperCase();
    }

    var frame = (type != "SUBDOCUMENT" ? details.frameId : details.parentFrameId);

    var filter = checkRequest(type, details.tabId, details.url, frame);

    if (filter instanceof self.BlockingFilter) {

      var msgData = {
        "action": "___O_urlfilter_contentblocked",
        "data": {
          // send enough data so that we can fire the event in the injected script
          "url": details.url
        }
      };

      // Broadcast contentblocked event control message (i.e. beginning with '___O_')
      // towards the tab matching the details.tabId value
      // (but delay it until the content script is loaded!)
      if(self.eventQueue[details.tabId] !== undefined && self.eventQueue[details.tabId].ready === true) {

        // tab is already online so send contentblocked messages
        chrome.tabs.sendMessage(
          details.tabId,
          msgData,
          function() {}
        );

      } else {

        // queue up this event
        if(self.eventQueue[details.tabId] === undefined) {
          self.eventQueue[details.tabId] = { 'ready': false, 'contentblocked': [], 'contentunblocked': [], 'contentallowed': [] };
        }

        self.eventQueue[details.tabId]['contentblocked'].push( msgData );

      }

      return { cancel: true };

    } else if (filter instanceof self.WhitelistFilter) {

      var msgData = {
        "action": "___O_urlfilter_contentunblocked",
        "data": {
          // send enough data so that we can fire the event in the injected script
          "url": details.url
        }
      };

      // Broadcast contentblocked event control message (i.e. beginning with '___O_')
      // towards the tab matching the details.tabId value
      // (but delay it until the content script is loaded!)
      if(self.eventQueue[details.tabId] !== undefined && self.eventQueue[details.tabId].ready === true) {

        // tab is already online so send contentblocked messages
        chrome.tabs.sendMessage(
          details.tabId,
          msgData,
          function() {}
        );

      } else {

        // queue up this event
        if(self.eventQueue[details.tabId] === undefined) {
          self.eventQueue[details.tabId] = { 'ready': false, 'contentblocked': [], 'contentunblocked': [], 'contentallowed': [] };
        }

        self.eventQueue[details.tabId]['contentunblocked'].push( msgData );

      }

      return {};

    } else {
      
      var msgData = {
        "action": "___O_urlfilter_contentallowed",
        "data": {
          // send enough data so that we can fire the event in the injected script
          "url": details.url
        }
      };

      // Broadcast contentblocked event control message (i.e. beginning with '___O_')
      // towards the tab matching the details.tabId value
      // (but delay it until the content script is loaded!)
      if(self.eventQueue[details.tabId] !== undefined && self.eventQueue[details.tabId].ready === true) {

        // tab is already online so send contentblocked messages
        chrome.tabs.sendMessage(
          details.tabId,
          msgData,
          function() {}
        );

      } else {

        // queue up this event
        if(self.eventQueue[details.tabId] === undefined) {
          self.eventQueue[details.tabId] = { 'ready': false, 'contentblocked': [], 'contentunblocked': [], 'contentallowed': [] };
        }

        self.eventQueue[details.tabId]['contentallowed'].push( msgData );

      }

      return {};

    }
  }

  // Listen for webRequest beforeRequest events and block
  // if a rule matches in the associated block RuleList
  chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: [ "http://*/*", "https://*/*" ] }, [ "blocking" ]);

  // Wait for tab to add event listeners for urlfilter and then drain queued up events to that tab
  OEX.addEventListener('controlmessage', function( msg ) {

    if( !msg.data || !msg.data.action ) {
      return;
    }

    if( msg.data.action != '___O_urlfilter_DRAINQUEUE' || !msg.data.eventType ) {
      return;
    }

    // Drain queued events belonging to this tab
    var tabId = msg.source.tabId;
    
    if( self.eventQueue[tabId] !== undefined ) {
      self.eventQueue[tabId].ready = true; // set to resolved (true)
      
      var eventQueue = self.eventQueue[tabId][ msg.data.eventType ];

      for(var i = 0, l = eventQueue.length; i < l; i++) {

        msg.source.postMessage(eventQueue[i]);

      }
      
      self.eventQueue[tabId][ msg.data.eventType ] = []; // reset event queue

    }

  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    switch(changeInfo.status) {

      case 'loading':
      
        // kill previous events queue
        if(self.eventQueue[tabId] === undefined) {
          self.eventQueue[tabId] = { 'ready': false, 'contentblocked': [], 'contentunblocked': [], 'contentallowed': [] };
        } else {
          self.eventQueue[tabId].ready = false;
        }

        break;

      case 'complete':

        if(self.eventQueue[tabId] !== undefined && self.eventQueue[tabId].ready !== undefined ) {

          self.eventQueue[tabId].ready = true;

        }

        break;

    }

  });

};

UrlFilterManager.prototype = Object.create( OEventTarget.prototype );

// URL Filter Resource Types (bit-mask values)

UrlFilterManager.prototype.RESOURCE_OTHER             = 0x00000001; //     1
UrlFilterManager.prototype.RESOURCE_SCRIPT            = 0x00000002; //     2
UrlFilterManager.prototype.RESOURCE_IMAGE             = 0x00000004; //     4
UrlFilterManager.prototype.RESOURCE_STYLESHEET        = 0x00000008; //     8
UrlFilterManager.prototype.RESOURCE_OBJECT            = 0x00000010; //    16
UrlFilterManager.prototype.RESOURCE_SUBDOCUMENT       = 0x00000020; //    32
UrlFilterManager.prototype.RESOURCE_DOCUMENT          = 0x00000040; //    64
UrlFilterManager.prototype.RESOURCE_REFRESH           = 0x00000080; //   128
UrlFilterManager.prototype.RESOURCE_XMLHTTPREQUEST    = 0x00000800; //  2048
UrlFilterManager.prototype.RESOURCE_OBJECT_SUBREQUEST = 0x00001000; //  4096
UrlFilterManager.prototype.RESOURCE_MEDIA             = 0x00004000; // 16384
UrlFilterManager.prototype.RESOURCE_FONT              = 0x00008000; // 32768

if(manifest && manifest.permissions && manifest.permissions.indexOf('webRequest') != -1 && manifest.permissions.indexOf('webRequestBlocking') != -1 ) {

  OEX.urlfilter = OEX.urlfilter || new UrlFilterManager();

}

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

opera.isReady(function() {

  // Rewrite in-line event handlers (eg. <input ... onclick=""> for a sub-set of common standard events)

  document.addEventListener('DOMContentLoaded', function(e) {
  
    var selectors = ['load', 'beforeunload', 'unload', 'click', 'dblclick', 'mouseover', 'mousemove', 
                        'mousedown', 'mouseup', 'mouseout', 'keydown', 'keypress', 'keyup', 'blur', 'focus'];

    for(var i = 0, l = selectors.length; i < l; i++) {
      var els = document.querySelectorAll('[on' + selectors[i] + ']');
      for(var j = 0, k = els.length; j < k; j++) {
        var fn = new Function('e', els[j].getAttribute('on' + selectors[i]));
        var target = els[j];
        if(selectors[i].indexOf('load') > -1 && els[j] === document.body) {
          target = window;
        }
      
        els[j].removeAttribute('on' + selectors[i]);
        target.addEventListener(selectors[i], fn, true);
      }
    }
  
  }, false);

});

  // Make API available on the window DOM object
  global.opera = opera;

})( window );