var MenuEventTarget = function() {
    var that = this;
    var target = {};

    EventTarget.mixin(target);

    var onclick = null;

    Object.defineProperty(this, 'onclick', {
      enumerable: true,
      configurable: false,
      get: function() {
        return onclick;
      },
      set: function(value) {
        if (onclick != null) this.removeEventListener('click', onclick, false);

        onclick = value;

        if (onclick != null && onclick instanceof Function) this.addEventListener('click', onclick, false);
        else onclick = null;
      }
    });

    Object.defineProperty(this, 'dispatchEvent', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(event) {
        var currentTarget = this;
        var stoppedImmediatePropagation = false;
        Object.defineProperty(event, 'currentTarget', {
          enumerable: true,
          configurable: false,
          get: function() {
            return currentTarget;
          },
          set: function(value) {}
        });
        Object.defineProperty(event, 'stopImmediatePropagation', {
          enumerable: true,
          configurable: false,
          writable: false,
          value: function() {
            stoppedImmediatePropagation = true;
          }
        });

        var allCallbacks = callbacksFor(target),
            callbacks = allCallbacks[event.type],
            callbackTuple, callback, binding;


        if (callbacks) for (var i = 0, l = callbacks.length; i < l; i++) {
          callbackTuple = callbacks[i];
          callback = callbackTuple[0];
          binding = callbackTuple[1];
          if (!stoppedImmediatePropagation) callback.call(binding, event);
        };

      }
    });
    Object.defineProperty(this, 'addEventListener', {
      enumerable: true,
      configurable: false,
      writable: false,
      value: function(eventName, callback, useCapture) {
        target.on(eventName, callback, this); // no useCapture
      }
    });
    Object.defineProperty(this, 'removeEventListener', {
      enumerable: true,
      configurable: false,
      writable: false,
      value: function(eventName, callback, useCapture) {
        target.off(eventName, callback, this); // no useCapture
      }
    });

    };
