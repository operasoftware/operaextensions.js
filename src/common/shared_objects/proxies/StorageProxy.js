
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
