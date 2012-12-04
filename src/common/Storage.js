
var OStorage = function () {
  
  // All attributes and methods defined in this class must be non-enumerable, 
  // hence the structure of this class and use of Object.defineProperty.
  
  Object.defineProperty(this, "_storage", { value : localStorage });
  
  Object.defineProperty(this, "length", { value : 0, writable:true });
  
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
