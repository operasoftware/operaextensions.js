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
    "hexLong": /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    "hexShort": /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
  };

  for(var colorType in hexColorTypes) {
    if(color.match(hexColorTypes[ colorType ]))
      return color;
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
        h : ( parseInt( bits[ 1 ], 10 ) % 360 ) / 360,
        s : ( parseInt( bits[ 2 ], 10 ) % 101 ) / 100,
        l : ( parseInt( bits[ 3 ], 10 ) % 101 ) / 100,
        a : bits[4] || 1
      };

      if ( hsl.s === 0 )
        return [ hsl.l, hsl.l, hsl.l ];

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
            h : ( parseInt( bits[ 1 ], 10 ) % 360 ) / 360,
            s : ( parseInt( bits[ 2 ], 10 ) % 101 ) / 100,
            v : ( parseInt( bits[ 3 ], 10 ) % 101 ) / 100
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
    if((alpha + "") === "NaN" || alpha < 0 || alpha >= 1) return rgb;
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

  var evt = document.createEvent("Event");

  evt.initEvent(eventType, true, true);

  // Add custom properties or override standard event properties
  for (var i in eventProperties) {
    evt[i] = eventProperties[i];
  }

  return evt;

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
    
    this._localPort.onMessage.addListener( function( _message, _sender, responseCallback ) {

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
      
    }.bind(this) );

    // Fire 'connect' event once we have all the initial listeners setup on the page
    // so we don't miss any .onconnect call from the extension page
    addDelayedEvent(this, 'dispatchEvent', [ new OEvent('connect', { "source": this._localPort }) ]);
    
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
  
  this._allPorts = [];
  
  chrome.extension.onConnect.addListener(function( _remotePort ) {
  
    var portIndex = this._allPorts.length;
    
    // When this port disconnects, remove _port from this._allPorts
    _remotePort.onDisconnect.addListener(function() {
      
      this._allPorts.splice( portIndex - 1, 1 );
      
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
  
    this.dispatchEvent( new OEvent('connect', { "source": _remotePort }) );
  
  }.bind(this));
  
};

OBackgroundMessagePort.prototype = Object.create( OMessagePort.prototype );

OBackgroundMessagePort.prototype.broadcastMessage = function( data ) {
  
  for(var i = 0, l = this._allPorts.length; i < l; i++) {
    this._allPorts[ i ].postMessage( data );
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
          
          // Set extension id from base URL
          this.properties.id = /^chrome\-extension\:\/\/(.*)\/$/.exec(chrome.extension.getURL(""))[1];

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

OWidgetObj.prototype = Object.create( OEventTarget.prototype );

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
        
          // Fire a new 'blur' event on the window object
          this[i].dispatchEvent(new OEvent('blur', {
            browserWindow: _prevFocusedWindow
          }));
          
          // Fire a new 'blur' event on this manager object
          this.dispatchEvent(new OEvent('blur', {
            browserWindow: _prevFocusedWindow
          }));
          
          // If something is blurring then we should also fire the
          // corresponding 'focus' events
          
          var _newFocusedWindow = this.getLastFocused();
          
          // Fire a new 'focus' event on the window object
          _newFocusedWindow.dispatchEvent(new OEvent('focus', {
            browserWindow: _newFocusedWindow
          }));
          
          // Fire a new 'focus' event on this manager object
          this.dispatchEvent(new OEvent('focus', {
            browserWindow: _newFocusedWindow
          }));
        
          break;
        }

      }
      
      Queue.dequeue();

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
    
    Queue.dequeue();

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
            
            shadowBrowserWindow.rewriteUrl = "chrome://newtab/#" + existingBrowserTab.properties.id;

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
            
            createProperties.url = shadowBrowserWindow.rewriteUrl = "chrome://newtab/#" + newBrowserTab._operaId;

          } else {
            
            tabsToCreate.push(newBrowserTab);
            
          }

        })(tabsToInject[i], i);

      }

    }

  } else { // we only have one default chrome://newtab tab to set up
    
    // setup single new tab and tell onCreated to ignore this item
    var defaultBrowserTab = new BrowserTab({ active: true }, shadowBrowserWindow);
    
    // Register BrowserTab object with the current BrowserWindow object
    shadowBrowserWindow.tabs.addTab( defaultBrowserTab, defaultBrowserTab.properties.index );
    
    // Add object to root store
    OEX.tabs.addTab( defaultBrowserTab );
    
    // set rewriteUrl to windowId
    shadowBrowserWindow.rewriteUrl = "chrome://newtab/#" + shadowBrowserWindow._operaId;
    
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
              'url': newBrowserTab.properties.url || "chrome://newtab/",
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
  }
  
  // Set parent window to create the tab in

  if(this._parent && this._parent.closed === true ) {
    throw new OError(
      "InvalidStateError",
      "Parent window of the current BrowserTab object is in the closed state and therefore is invalid.",
      DOMException.INVALID_STATE_ERR
    );
  }
  
  var shadowBrowserTab = new BrowserTab( browserTabProperties, this._parent || OEX.windows.getLastFocused() );
  
  // Sanitized tab properties
  var createTabProperties = {
    'url': shadowBrowserTab.properties.url,
    'active': shadowBrowserTab.properties.active,
    'pinned': shadowBrowserTab.properties.pinned
  };
  
  // By default, tab will be created at end of current collection
  shadowBrowserTab.properties.index = createTabProperties.index = shadowBrowserTab._windowParent.tabs.length;
  
  // Set insert position for the new tab from 'before' attribute, if any
  if( before && (before instanceof BrowserTab) ) {

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
    createTabProperties.windowId = before._windowParent ?
                                      before._windowParent.properties.id : createTabProperties.windowId;
    createTabProperties.index = before.position;

  }
  
  // Set up tab index on start
  if(this === OEX.tabs) {
    shadowBrowserTab._windowParent = OEX.windows.getLastFocused();
    shadowBrowserTab.properties.index = createTabProperties.index = shadowBrowserTab._windowParent.tabs.length;
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
  
        // Move this object to the correct position within the current tabs collection
        // (but don't worry about doing this for the global tabs manager)
        // TODO check if this is the correct behavior here
        if(this !== OEX.tabs) {
          this.removeTab( shadowBrowserTab );
          this.addTab( shadowBrowserTab, shadowBrowserTab.properties.index);
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
        
        this._allTabs[i].properties.url = this._allTabs[i].rewriteUrl;
      
        delete this._allTabs[i].rewriteUrl;
        
        chrome.tabs.update(
          this._allTabs[i].properties.id, 
          { 'url': this._allTabs[i].properties.url }, 
          function(_tab) {}
        );
          
        //this._allTabs[i].rewriteDone = true;
        
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
        newTab = new BrowserTab(_tab, parentWindow);
        
        // write properties not available in BrowserTab constructor
        newTab.properties.id = _tab.id;
        newTab.properties.url = _tab.url;
        newTab.properties.title = _tab.title;
        newTab.properties.favIconUrl = _tab.favIconUrl;

        newTab.properties.pinned = _tab.pinned;
        newTab.properties.incognito = _tab.incognito;

        newTab.properties.status = _tab.status;

        newTab.properties.index = _tab.index;

        if(_tab.active == true) {
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
    
    // now rewrite to the correct url 
    // (which will be automatically trigger navigation to the rewrite url)
    if(newTab.rewriteUrl !== undefined) {
      newTab.url = newTab.rewriteUrl;
      delete newTab.rewriteUrl;
    }
    
    // Resolve new tab, if it hasn't been resolved already
    newTab.resolve(true);
    
    Queue.dequeue();
    
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
    
    Queue.dequeue();

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
    
    Queue.dequeue();

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
      if( _windows[i].rewriteUrl && _windows[i].rewriteUrl == "chrome://newtab/#" + tabId ) {
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
    
    Queue.dequeue();

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
    
    Queue.dequeue();
    
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
    
    Queue.dequeue();

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
    'url': browserTabProperties.url ? (browserTabProperties.url + "") : 'chrome://newtab',
    // position:
    'index': browserTabProperties.position ? parseInt(browserTabProperties.position, 10) : 0
    // 'browserWindow' not part of settable properties
    // 'tabGroup' not part of settable properties
  }

  // Create a unique browserTab id
  this._operaId = Math.floor(Math.random() * 1e16);
  
  // Pass the identity of this tab through the Chromium Tabs API via the URL field
  if(!bypassRewriteUrl) {
    this.rewriteUrl = this.properties.url;
    this.properties.url = "chrome://newtab/#" + this._operaId;
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
OEX.windows = OEX.windows || new BrowserWindowManager();

OEX.tabs = OEX.tabs || new RootBrowserTabManager();

OEX.tabGroups = OEX.tabGroups || new BrowserTabGroupManager();

var ToolbarContext = function() {
  
  OEventTarget.call( this );
  
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
  
  if( !toolbarUIItem || !(toolbarUIItem instanceof ToolbarUIItem) ) {
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
  
  // Enable the toolbar button
  chrome.browserAction.enable();

};

ToolbarContext.prototype.removeItem = function( toolbarUIItem ) {

  if( !toolbarUIItem || !(toolbarUIItem instanceof ToolbarUIItem) ) {
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
  this.properties.textContent = properties.textContent;
  this.properties.backgroundColor = complexColorToHex(properties.backgroundColor);
  this.properties.color = complexColorToHex(properties.color);
  this.properties.display = properties.display;
  
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
  this.properties.backgroundColor = complexColorToHex("" + val);

  Queue.enqueue(this, function(done) {
    
    chrome.browserAction.setBadgeBackgroundColor({ "color": this.properties.backgroundColor });
    
    done();
    
  }.bind(this));
});

ToolbarBadge.prototype.__defineGetter__("color", function() {
  return this.properties.color;
});

ToolbarBadge.prototype.__defineSetter__("color", function( val ) {
  this.properties.color = complexColorToHex("" + val);
  // not implemented in chromium
});

ToolbarBadge.prototype.__defineGetter__("display", function() {
  return this.properties.display;
});

ToolbarBadge.prototype.__defineSetter__("display", function( val ) {
  if(("" + val).toLowerCase() === "block") {
    this.properties.display = "block";
    Queue.enqueue(this, function(done) {

      chrome.browserAction.setBadgeText({ "text": this.properties.textContent });

      done();

    }.bind(this));
  } else {
    this.properties.display = "none";
    Queue.enqueue(this, function(done) {

      chrome.browserAction.setBadgeText({ "text": "" });

      done();

    }.bind(this));
  }
});

var ToolbarPopup = function( properties ) {
  
  OPromise.call( this );
  
  this.properties = {};
  
  // Set provided properties through object prototype setter functions
  this.properties.href = properties.href || "";
  this.properties.width = properties.width;
  this.properties.height = properties.height;
  
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
  
  Queue.enqueue(this, function(done) {

    chrome.browserAction.setPopup({ "popup": ("" + val) });

    done();

  }.bind(this));
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

    chrome.browserAction.setTitle({ "title": (this.title) });

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

OEC.toolbar = OEC.toolbar || new ToolbarContext();

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
            "domcontentloaded": [],
            "load": []
          };

      var hasFired_DOMContentLoaded = false,
          hasFired_Load = false;

      global.document.addEventListener("DOMContentLoaded", function handle_DomContentLoaded() {
        hasFired_DOMContentLoaded = true;
        global.document.removeEventListener("DOMContentLoaded", handle_DomContentLoaded, true);
      }, true);
    
      global.addEventListener("load", function handle_Load() {
        hasFired_Load = true;
        global.removeEventListener("load", handle_Load, true);
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
      interceptAddEventListener(global, 'domcontentloaded'); // handled bubbled DOMContentLoaded

      function fireEvent(name, target) {
        var evtName = name.toLowerCase();

        var evt = new OEvent(evtName, {});

        for (var i = 0, len = fns[evtName].length; i < len; i++) {
          fns[evtName][i].call(target, evt);
        }
        fns[evtName] = [];
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
          
          var domContentLoadedTimeoutOverride = new Date().getTime() + 3000;

          // Synthesize and fire the document domcontentloaded event
          (function fireDOMContentLoaded() {
            
            var currentTime = new Date().getTime();

            // Check for hadFired_Load in case we missed DOMContentLoaded
            // event, in which case, we syntesize DOMContentLoaded here
            // (always synthesized in Chromium Content Scripts)
            if (hasFired_DOMContentLoaded || hasFired_Load || currentTime >= domContentLoadedTimeoutOverride) {
              
              fireEvent('domcontentloaded', global.document);
              
              if(currentTime >= domContentLoadedTimeoutOverride) {
                console.warn('document.domcontentloaded event fired on check timeout');
              }
              
              var loadTimeoutOverride = new Date().getTime() + 3000;
              
              // Synthesize and fire the window load event
              // after the domcontentloaded event has been
              // fired
              (function fireLoad() {
                
                var currentTime = new Date().getTime();

                if (hasFired_Load || currentTime >= loadTimeoutOverride) {

                  fireEvent('load', window);
                  
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

      var holdTimeoutOverride = new Date().getTime() + 3000;
    
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