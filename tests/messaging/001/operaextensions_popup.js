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

var OperaExtension = function() {

  OMessagePort.call( this, false );

};

OperaExtension.prototype = Object.create( OMessagePort.prototype );

OperaExtension.prototype.__defineGetter__('bgProcess', function() {
  return chrome.extension.getBackgroundPage();
});

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

// Add Widget API via the bgProcess
global.widget = global.widget || OEX.bgProcess.widget;

if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.windows = OEX.windows || OEX.bgProcess.opera.extension.windows;

}

if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.tabs = OEX.tabs || OEX.bgProcess.opera.extension.tabs;

}

if(manifest && manifest.permissions && manifest.permissions.indexOf('tabs') != -1) {

  OEX.tabGroups = OEX.tabGroups || OEX.bgProcess.opera.extension.tabGroups;

}

if(manifest && manifest.browser_action !== undefined && manifest.browser_action !== null ) {

  OEC.toolbar = OEC.toolbar || OEX.bgProcess.opera.contexts.toolbar;

}

if(manifest && manifest.permissions && manifest.permissions.indexOf('contextMenus')!=-1){

  global.MenuItem = OEX.bgProcess.MenuItem;
  global.MenuContext = OEX.bgProcess.MenuContext;

  OEC.menu = OEC.menu || OEX.bgProcess.opera.contexts.menu;

}

if(global.opr && global.opr.speeddial && manifest && manifest.speeddial){

  OEC.speeddial = OEC.speeddial || OEX.bgProcess.opera.contexts.speeddial;

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

// Set the width and height of the popup window to values provided in the URL query string
opera.isReady(function() {

  function getParam( key ) {
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + key + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    return results == null ? "" : window.decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  window.addEventListener('DOMContentLoaded', function() {
    var w = getParam('w'), h = getParam('h');
    if(w !== "") {
      document.body.style.minWidth = w.replace(/\D/g,'') + "px";
    } else {
      document.body.style.minWidth = "300px"; // default width
    }
    if(h !== "") {
      document.body.style.minHeight = h.replace(/\D/g,'') + "px";
    } else {
      document.body.style.minHeight = "300px"; // default height
    }
  }, false);

});

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