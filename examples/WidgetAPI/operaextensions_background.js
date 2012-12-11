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
  
  // General enqueue/dequeue infrastructure

  this._queue = [];

  this.on('promise:resolved', function() {
    // Run next enqueued action on this object, if any
    this.dequeue();
  }.bind(this));

};

OPromise.prototype = Object.create( Promise.prototype );

// Add OEventTarget helper functions to OPromise prototype
for(var i in OEventTarget.prototype) {
  OPromise.prototype[i] = OEventTarget.prototype[i];
}

OPromise.prototype.enqueue = function() {

  // Must at least provide a method name to queue
  if(arguments.length < 1) {
    return;
  }
  var methodObj = arguments[0];

  var methodArgs = [];

  if(arguments.length > 1) {
    for(var i = 1, l = arguments.length; i < l; i++) {
      methodArgs.push( arguments[i] );
    }
  }
  
  if(this.isResolved) {
    // Call immediately if object is resolved
    methodObj.apply(this, methodArgs);
  } else {
    // Otherwise add provided action item to this object's queue
    this._queue.push( { 'action': methodObj, 'args': methodArgs } );
  }

};

OPromise.prototype.dequeue = function() {
  // Select first queued action item
  var queueItem = this._queue[0];

  if(!queueItem) {
    return;
  }

  // Remove fulfilled action from this object's queue
  this._queue.splice(0, 1);

  // Fulfil action item
  if( queueItem.action ) {
    queueItem.action.apply( this, queueItem.args );
  }

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

  this._lastFocusedWindow = null;

  // Set up the real BrowserWindow (& BrowserTab) objects currently available
  chrome.windows.getAll({
    populate: true
  }, function(_windows) {

    var _allTabs = [];

    for (var i = 0, l = _windows.length; i < l; i++) {
      this[i] = new BrowserWindow(_windows[i]);
      this.length = i + 1;
      
      if(this[i].properties.focused == true) {
        this._lastFocusedWindow = this[i];
      }

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[i].tabs.length; j < k; j++) {
        _tabs[j] = new BrowserTab(_windows[i].tabs[j], this[i]);
        
        // Set as the currently focused tab?
        if(_tabs[j].properties.active == true) {
          this[i].tabs._lastFocusedTab = _tabs[j]; // window-focused tab
          
          if(this[i].properties.focused == true) {
            OEX.tabs._lastFocusedTab = _tabs[j]; // gloval-focused tab
          }
        }
        
      }
      this[i].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);

    }

    // Replace tabs in root tab manager object
    OEX.tabs.replaceTabs(_allTabs);

    // Set up the correct lastFocused window object
    /*chrome.windows.getLastFocused(
      { populate: false }, 
      function(_window) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (this[i].properties.id === _window.id) {
            this._lastFocusedWindow = this[i];
            break;
          }
        }
      }.bind(this)
    );*/

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

  // Monitor ongoing window events
  chrome.windows.onCreated.addListener(function(_window) {
    
    global.setTimeout(function() {
      
      var windowFound = false;

      // If this window is already registered in the collection then ignore
      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].properties.id == _window.id) {
          windowFound = true;
          if(this[i].properties.focused == true) {
            this._lastFocusedWindow = this[i];
          }
          break;
        }
      }

      // If window was created outside of this framework, add it in and initialize
      if (!windowFound) {

        var newBrowserWindow = new BrowserWindow(_window);

        // Convert tab objects to BrowserTab objects
        var newBrowserTabs = [];
        for (var i in _window.tabs) {

          var newBrowserTab = new BrowserTab(_window.tabs[i], newBrowserWindow);

          newBrowserTabs.push(newBrowserTab);

        }
        // Add BrowserTab objects to new BrowserWindow object
        newBrowserWindow.tabs.replaceTabs(newBrowserTabs);

        this[this.length] = newBrowserWindow;
        this.length += 1;
        
        if(newBrowserWindow.focused) {
          this._lastFocusedWindow = newBrowserWindow;
        }

        // Resolve objects.
        //
        // Resolution of each object in order:
        // 1. Window
        // 2. Window's Tab Manager
        // 3. Window's Tab Manager's Tabs
        newBrowserWindow.resolve(true);
        newBrowserWindow.tabs.resolve(true);
        for (var i = 0, l = newBrowserWindow.tabs.length; i < l; i++) {
          newBrowserWindow.tabs[i].resolve(true);
        }

        // Fire a new 'create' event on this manager object
        this.dispatchEvent(new OEvent('create', {
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
      /*this[deleteIndex].dispatchEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));*/

      // Fire a new 'close' event on this manager object
      this.dispatchEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));

      // Manually splice the deleteIndex_th_ item from the current collection
      for (var i = deleteIndex, l = this.length; i < l; i++) {
        if (this[i + 1]) {
          this[i] = this[i + 1];
        } else {
          delete this[i]; // remove last item
        }
      }
      this.length -= 1;

    }

  }.bind(this));

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    
      // Find and fire blur event on currently focused window
      for (var i = 0, l = this.length; i < l; i++) {

        if (this[i] == this._lastFocusedWindow && this[i].properties.id != windowId) {
        
          // Fire a new 'blur' event on this manager object
          this.dispatchEvent(new OEvent('blur', {
            browserWindow: this[i]
          }));
        
          break;
        }

      }
    
      // If no new window is focused, abort here
      if( windowId !== chrome.windows.WINDOW_ID_NONE ) {
    
        // Find and fire focus event on newly focused window
        for (var i = 0, l = this.length; i < l; i++) {

          if (this[i].properties.id == windowId && this[i] !== this._lastFocusedWindow) {
          
            this._lastFocusedWindow = this[i];
          
            // Fire a new 'focus' event on this manager object
            this.dispatchEvent(new OEvent('focus', {
              browserWindow: this[i]
            }));
          
            break;
          }

        }

      }

  }.bind(this));

};

BrowserWindowManager.prototype = Object.create(OPromise.prototype);

BrowserWindowManager.prototype.create = function(tabsToInject, browserWindowProperties) {

  browserWindowProperties = browserWindowProperties || {};
  
  delete browserWindowProperties.closed;
  
  if(browserWindowProperties.private !== undefined) {
    browserWindowProperties.incognito = !!browserWindowProperties.private;
    delete browserWindowProperties.private;
  }

  var shadowBrowserWindow = new BrowserWindow(browserWindowProperties);

  // Add this object to the current collection
  this[this.length] = shadowBrowserWindow;
  this.length += 1;
  
  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.windows.create,
    browserWindowProperties, 
    function(_window) {

      // Update BrowserWindow properties
      for (var i in _window) {
        shadowBrowserWindow.properties[i] = _window[i];
      }

      // Convert tab objects to BrowserTab objects
      var browserTabs = [];

      if (_window.tabs) {

        for (var i = 0, l = _window.tabs.length; i < l; i++) {

          var shadowBrowserTab = new BrowserTab(_window.tabs[i], shadowBrowserWindow);

          browserTabs.push(shadowBrowserTab);

        }

      }

      //shadowBrowserWindow._parent = self;
      shadowBrowserWindow.tabs.replaceTabs(browserTabs);

      // Resolution order:
      // 1. Window
      // 2. Window's Tab Manager
      // 3. Window's Tab Manager's Tabs
      shadowBrowserWindow.resolve(true);

      shadowBrowserWindow.tabs.resolve(true);

      // Add tabs included in the create() call to the newly created
      // window, if any, based on type
      if (tabsToInject) {
        for (var i in tabsToInject) {

          if (tabsToInject[i] instanceof BrowserTab) {

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

                  tab.resolve(true);
                }
              );
            })(tabsToInject[i]);

          } else { // Treat as a BrowserTabProperties object by default
            (function(browserTabProperties) {
              
              var shadowBrowserTab = new BrowserTab(browserTabProperties, shadowBrowserWindow);

              //shadowBrowserTab.properties.index = -1;
              shadowBrowserTab.properties.windowId = _window.id;

              chrome.tabs.create(
                shadowBrowserTab.properties, 
                function(_tab) {
                  for (var i in _tab) {
                    shadowBrowserTab.properties[i] = _tab[i];
                  }

                  shadowBrowserTab.resolve(true);
                }
              );

              // Register BrowserTab object with the current BrowserWindow object
              shadowBrowserWindow.tabs.addTabs([shadowBrowserTab]);

            })(tabsToInject[i]);

          }

        }

      }

      // Fire a new 'create' event on this manager object
      this.dispatchEvent(new OEvent('create', {
        browserWindow: shadowBrowserWindow
      }));

      this.dequeue();

    }.bind(this)
  );

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

  return this._lastFocusedWindow;

};

BrowserWindowManager.prototype.close = function(browserWindow) {

  if(!browserWindow || !browserWindow instanceof BrowserWindow) {
    return;
  }
  
  browserWindow.close();

};

var BrowserWindow = function(browserWindowProperties) {

  OPromise.call(this);

  this.properties = browserWindowProperties || {};

  this._parent = null;

  // Create a unique browserWindow id
  this._operaId = Math.floor(Math.random() * 1e16);

  this.tabs = new BrowserTabManager(this);

  this.tabGroups = new BrowserTabGroupManager(this);
};

BrowserWindow.prototype = Object.create(OPromise.prototype);

// API
BrowserWindow.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

BrowserWindow.prototype.__defineGetter__("closed", function() {
  return this.properties.closed || false;
});

BrowserWindow.prototype.__defineGetter__("focused", function() {
  return this.properties.focused || false;
});

BrowserWindow.prototype.__defineGetter__("private", function() {
  return this.properties.incognito || false;
});

BrowserWindow.prototype.__defineGetter__("parent", function() {
  return this._parent;
});

BrowserWindow.prototype.insert = function(browserTab, child) {

  if (!browserTab || !browserTab instanceof BrowserTab) { 
    return;
  }

  if (this.properties.closed === true) {
    throw {
      name: "Invalid State Error",
      message: "Current window is in the closed state and therefore is invalid"
    };
    return;
  }

  var moveProperties = {
    windowId: this.properties.id
  };

  // Set insert position for the new tab from 'before' attribute, if any
  if (child && child instanceof BrowserTab) {

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
    moveProperties.windowId = child._windowParent ?
                                      child._windowParent.properties.id : moveProperties.windowId;
    moveProperties.index = child.position;

  }

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.tabs.move,
    browserTab.properties.id, 
    moveProperties, 
    function(_tab) {
      this.dequeue();
    }.bind(this)
  );

};

BrowserWindow.prototype.focus = function() {

  // Set BrowserWindow object to focused state
  this.properties.focused = true;

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.windows.update,
    this.properties.id, 
    {
      focused: true
    }, 
    function() {
      this.dequeue();
    }.bind(this)
  );

};

BrowserWindow.prototype.update = function(browserWindowProperties) {

  // Remove invalid parameters if present:
  delete browserWindowProperties.closed; // cannot set closed state via update

  // TODO enforce incognito because we can't make a tab incognito once it has been added to a non-incognito window.
  //browserWindowProperties.incognito = browserWindowProperties.private || false;

  for (var i in browserWindowProperties) {
    this.properties[i] = browserWindowProperties[i];
  }

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.windows.update,
    this.properties.id, 
    browserWindowProperties, 
    function() {
      this.dequeue();
    }.bind(this)
  );

}

BrowserWindow.prototype.close = function() {
  
  // Set BrowserWindow object to closed state
  this.properties.closed = true;

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(function() {
    chrome.windows.remove(
      this.properties.id,
      function() {
        this.dequeue();
        OEX.windows.dequeue();
      }.bind(this)
    );
  }.bind(this));

};

var BrowserTabManager = function( parentObj ) {

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

BrowserTabManager.prototype = Object.create( OPromise.prototype );

BrowserTabManager.prototype.create = function( browserTabProperties, before ) {

  if(before && !before instanceof BrowserTab) {
    throw {
        name:        "TYPE_MISMATCH_ERR",
        message:     "Could not create BrowserTab object with invalid before attribute provided"
    };
  }

  browserTabProperties = browserTabProperties || {};

  // Parameter mappings
  if(browserTabProperties.focused !== undefined) {
    browserTabProperties.active = !!browserTabProperties.focused;
    // Not allowed in Chromium API
    delete browserTabProperties.focused;
  } else {
    // Explicitly set active to false by default in Opera implementation
    browserTabProperties.active = false;
  }
  
  if(browserTabProperties.locked !== undefined) {
    browserTabProperties.pinned = !!browserTabProperties.locked;
    delete browserTabProperties.locked;
  }
  
  // TODO handle private tab insertion differently in Chromium
  //browserTabProperties.incognito = browserTabProperties.private || false;
  
  delete browserTabProperties.closed;

  // Set parent window to create the tab in

  if(this._parent && this._parent.closed === true ) {
    throw {
        name:        "Invalid State Error",
        message:     "Parent window is in the closed state and therefore is invalid"
    };
  }
  
  var shadowBrowserTab = new BrowserTab( Object.create(browserTabProperties), this._parent || OEX.windows.getLastFocused() );
  
  // no windowId will default to adding the tab to the current window
  browserTabProperties.windowId = this._parent ? this._parent.properties.id : OEX.windows.getLastFocused().properties.id;

  // Set insert position for the new tab from 'before' attribute, if any
  if( before && before instanceof BrowserTab ) {

    if( before.closed === true ) {
      throw {
          name:        "Invalid State Error",
          message:     "'before' attribute is in the closed state and therefore is invalid"
      };
    }

    if(before._windowParent && before._windowParent.closed === true ) {
      throw {
          name:        "Invalid State Error",
          message:     "Parent window of 'before' attribute is in the closed state and therefore is invalid"
      };
    }
    browserTabProperties.windowId = before._windowParent ?
                                      before._windowParent.properties.id : browserTabProperties.windowId;
    browserTabProperties.index = before.position;

  }
  
  // Set up tab index on start
  shadowBrowserTab.properties.index = browserTabProperties.index || this !== OEX.tabs ? this.length : OEX.windows.getLastFocused().tabs.length;
  
  // Add this object to the end of the current tabs collection
  this.addTabs([ shadowBrowserTab ]);

  // Add this object to the root tab manager (if this is not the root tab manager)
  if(this !== OEX.tabs) {
    OEX.tabs.addTabs([ shadowBrowserTab ]);
  }
  
  delete browserTabProperties.closed;

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue( chrome.tabs.create, browserTabProperties, function( _tab ) {

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
    
      // TODO check what correct behavior should be for this
      // Move this object to the correct position within the current tabs collection
      // (but don't worry about doing this for the global tabs manager)
      /*if(this !== OEX.tabs) {
        this.removeTab( shadowBrowserTab );
        this.addTabs([ shadowBrowserTab ], shadowBrowserTab.properties.index);
      }*/

      // Resolve new tab, if it hasn't been resolved already
      shadowBrowserTab.resolve( _tab );

      // Dispatch oncreate event to all attached event listeners
      this.dispatchEvent( new OEvent('create', {
          "tab": shadowBrowserTab,
          "prevWindow": shadowBrowserTab._windowParent,
          "prevTabGroup": null,
          "prevPosition": -1
      }) );

      this.dequeue();

  }.bind(this));

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

  return this._lastFocusedTab || this[ 0 ];

};
// Alias of .getSelected()
BrowserTabManager.prototype.getFocused = BrowserTabManager.prototype.getSelected;

BrowserTabManager.prototype.close = function( browserTab ) {

  if( !browserTab || !browserTab instanceof BrowserTab) {
    throw {
            name:        "TYPE_MISMATCH_ERR",
            message:     "Expected BrowserTab object"
    };
  }
  
  browserTab.close();

};

var RootBrowserTabManager = function() {

  BrowserTabManager.call(this);

  // Event Listener implementations
  chrome.tabs.onCreated.addListener(function(_tab) {

    global.setTimeout(function() {
      
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
        var newTab = new BrowserTab(_tab);

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

        newTab._windowParent.tabs.dispatchEvent(new OEvent('create', {
          "tab": newTab,
          "prevWindow": newTab._windowParent,
          "prevTabGroup": null,
          "prevPosition": NaN
        }));

        // Add object to root store
        this.addTabs([newTab]);

        // Resolve new tab, if it hasn't been resolved already
        newTab.resolve(true);

        // Fire a create event at RootTabsManager
        this.dispatchEvent(new OEvent('create', {
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
      /*oldTab.dispatchEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));*/
      
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

    }

  }.bind(this));

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    global.setTimeout(function() {

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
      for (var prop in tab) {
        if(prop == "id" || prop == "windowId") { // ignore these
          continue;
        }
        updateTab.properties[prop] = tab[prop];
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
    
    }.bind(this), 200);

  }.bind(this));
  
  function moveHandler(tabId, moveInfo) {
    
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
      
      var oldPosition = moveTab.properties.position;

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
        if (OEX.windows[i].properties.id == (moveInfo.windowId || moveInfo.newWindowId)) {
          // Attach tab to new parent
          OEX.windows[i].tabs.addTabs([moveTab], (moveInfo.toIndex || moveInfo.newPosition));
      
          // Reassign moveTab's _windowParent
          moveTab._windowParent = OEX.windows[i];
      
          break;
        }
      }

      moveTab.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldPosition
      }));

      this.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldPosition
      }));

    }

  }

  // Fired when a tab is moved within a window
  chrome.tabs.onMoved.addListener(moveHandler.bind(this));
  
  // Fired when a tab is moved between windows
  chrome.tabs.onAttached.addListener(moveHandler.bind(this));

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    
    if(!activeInfo.tabId) return;
    
    for(var i = 0, l = this.length; i < l; i++) {
      
      if(this[i].properties.id == activeInfo.tabId) {
        
        this[i].properties.active = true;
        
        if(this[i]._windowParent) {
          this[i]._windowParent.tabs._lastFocusedTab = this[i];
        }
        
        this._lastFocusedTab = this[i];
        
      } else {
        
        this[i].properties.active = false;
        
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

RootBrowserTabManager.prototype = Object.create( BrowserTabManager.prototype );

// Make sure .__proto__ object gets setup correctly
for(var i in BrowserTabManager.prototype) {
  if(BrowserTabManager.prototype.hasOwnProperty(i)) {
    RootBrowserTabManager.prototype[i] = BrowserTabManager.prototype[i];
  }
}


var BrowserTab = function(browserTabProperties, windowParent) {

  OPromise.call(this);

  this.properties = browserTabProperties || {};

  this._windowParent = windowParent;

  // Create a unique browserTab id
  this._operaId = Math.floor(Math.random() * 1e16);

};

BrowserTab.prototype = Object.create(OPromise.prototype);

// API
BrowserTab.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

BrowserTab.prototype.__defineGetter__("closed", function() {
  return this.properties.closed || false;
});

BrowserTab.prototype.__defineGetter__("locked", function() {
  return this.properties.pinned || false;
});

BrowserTab.prototype.__defineGetter__("focused", function() {
  return this.properties.active || false;
});

BrowserTab.prototype.__defineGetter__("selected", function() {
  return this.properties.active || false;
});

BrowserTab.prototype.__defineGetter__("private", function() {
  return this.properties.incognito || false;
});

BrowserTab.prototype.__defineGetter__("faviconUrl", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.favIconUrl || "";
});

BrowserTab.prototype.__defineGetter__("title", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.title || "";
});

BrowserTab.prototype.__defineGetter__("url", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.url || "";
});

BrowserTab.prototype.__defineGetter__("readyState", function() {
  return this.properties.status || "loading";
});

BrowserTab.prototype.__defineGetter__("browserWindow", function() {
  return this._windowParent;
});

BrowserTab.prototype.__defineGetter__("tabGroup", function() {
  // not implemented
  return null;
});

BrowserTab.prototype.__defineGetter__("position", function() {
  return this.properties.index || NaN;
});

// Methods

BrowserTab.prototype.focus = function() {
  
  // Set BrowserTab object to active state
  this.properties.active = true;

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(chrome.tabs.update, this.properties.id, { active: true }, function() {
    this.dequeue();
  }.bind(this));

};

BrowserTab.prototype.update = function(browserTabProperties) {

  // Parameter mappings 
  
  if(browserTabProperties.focused !== undefined) {
    // Cannot set BrowserTab object focused to false! 
    // See: /tests/WindowsTabs/BrowserTabManager/010/ test#5
    if(browserTabProperties.focused !== false) {
      browserTabProperties.active = !!browserTabProperties.focused;
    }
    // Not allowed in Chromium API
    delete browserTabProperties.focused;
  }
  if(browserTabProperties.locked !== undefined) {
    browserTabProperties.pinned = !!browserTabProperties.locked;
    delete browserTabProperties.locked;
  }
  
  // TODO handle private tab insertion differently in Chromium
  //browserTabProperties.incognito = browserTabProperties.private || false;
  
  // Remove invalid parameters if present:
  delete browserTabProperties.closed; // cannot set closed state via update

  for (var i in browserTabProperties) {
    this.properties[i] = browserTabProperties[i];
  }
  
  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(chrome.tabs.update, this.properties.id, browserTabProperties, function() {
    this.dequeue();
  }.bind(this));

};

BrowserTab.prototype.refresh = function() {
  // not implemented
};

// Web Messaging support for BrowserTab objects
BrowserTab.prototype.postMessage = function( postData ) {
  
  // Cannot send messages if tab is in the closed state
  if(this.properties.closed === true) {
    throw {
        name:        "Invalid State Error",
        message:     "BrowserTab is in the closed state"
    };
  }
  
  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(chrome.tabs.sendMessage, this.properties.id, postData, function() {
    this.dequeue();
  }.bind(this));
  
};

// Screenshot API support for BrowserTab objects
BrowserTab.prototype.getScreenshot = function( callback ) {
  
  // Cannot get a screenshot if tab is in the closed state
  if(this.properties.closed === true) {
    throw {
        name:        "Invalid State Error",
        message:     "BrowserTab is in the closed state"
    };
  }
  
  if( !this._windowParent || this._windowParent.properties.closed === true) {
    callback.call( this, undefined );
    return;
  }
  
  try {
  
    // Queue platform action or fire immediately if this object is resolved
    this.enqueue(
      chrome.tabs.captureVisibleTab,
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
        
        this.dequeue();
    
      }.bind(this)
    );
  
  } catch(e) {} 
  
};

BrowserTab.prototype.close = function() {
  
  if(this.properties.closed == true) {
    throw {
        name:        "Invalid State Error",
        message:     "BrowserTab is already closed so cannot call close on this object"
    };
  }
  
  // Set BrowserTab object to closed state
  this.properties.closed = true;

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(function() {
    chrome.tabs.remove(
      this.properties.id,
      function() {
        this.dequeue();
        if(this._parent) {
          this._parent.dequeue();
        }
        OEX.tabs.dequeue();
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
  throw {
      name:        "Not Supported Error",
      message:     "The current user agent does not support Tab Groups"
  };
  
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
  if( this.properties.display === "block" ) {
    this.enqueue(chrome.browserAction.setBadgeText, { "text": ("" + val) });
  }
});

ToolbarBadge.prototype.__defineGetter__("backgroundColor", function() {
  return this.properties.backgroundColor;
});

ToolbarBadge.prototype.__defineSetter__("backgroundColor", function( val ) {
  this.properties.backgroundColor = complexColorToHex("" + val);

  this.enqueue(chrome.browserAction.setBadgeBackgroundColor, { "color": this.properties.backgroundColor });
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
    this.enqueue(chrome.browserAction.setBadgeText, { "text": this.properties.textContent });
  } else {
    this.properties.display = "none";
    this.enqueue(chrome.browserAction.setBadgeText, { "text": "" });
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
  this.enqueue(chrome.browserAction.setPopup, { "popup": ("" + val) });
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
      this.enqueue(chrome.browserAction.disable);
    } else {
      this.properties.disabled = false;
      this.enqueue(chrome.browserAction.enable);
    }
  }
});

ToolbarUIItem.prototype.__defineGetter__("title", function() {
  return this.properties.title;
});

ToolbarUIItem.prototype.__defineSetter__("title", function( val ) {
  this.properties.title = "" + val;
  
  this.enqueue(chrome.browserAction.setTitle, { "title": (this.title) });
});

ToolbarUIItem.prototype.__defineGetter__("icon", function() {
  return this.properties.icon;
});

ToolbarUIItem.prototype.__defineSetter__("icon", function( val ) {
  this.properties.icon = "" + val;
  
  this.enqueue(chrome.browserAction.setIcon,{ "path": this.icon });
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