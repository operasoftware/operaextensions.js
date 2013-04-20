
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
    var _readyState = "uninitialized";
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

      var evt = new OEvent(evtName, props || {});

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

        var domContentLoadedTimeoutOverride = new Date().getTime() + 3000;

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

            var loadTimeoutOverride = new Date().getTime() + 3000;

            // Synthesize and fire the window load event
            // after the domcontentloaded event has been
            // fired
            (function fireLoad() {

              var currentTime = new Date().getTime();

              if (hasFired_Load || currentTime >= loadTimeoutOverride) {
                
                global.document.readyState = 'complete';
                fireEvent('readystatechange', global.document);

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
