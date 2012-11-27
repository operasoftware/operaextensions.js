
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