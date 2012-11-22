
var OWidgetObjProxy = function() {
  
  this.properties = {};
  
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

        // Copy initial _preferences items to storage proxy object
        if(msg.data._prefs) {
          var size = 0;
          for(var i in msg.data._prefs) {
            this._preferences[ i ] = msg.data._prefs[ i ];
            this._preferences.length++;
          }
        }
      
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
  
};

OWidgetObjProxy.prototype = Object.create( OPromise.prototype );

OWidgetObjProxy.prototype.__defineGetter__('name', function() {
  return this.properties.name || "";
});

OWidgetObjProxy.prototype.__defineGetter__('shortName', function() {
  return this.properties.name ? this.properties.name.short || "" : "";
});

OWidgetObjProxy.prototype.__defineGetter__('id', function() {
  // TODO return an id (currently no id attribute is set up)
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
