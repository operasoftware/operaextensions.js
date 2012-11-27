
var OWidgetObj = function() {
  
  OPromise.call(this);
  
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
          this.resolve();
          
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

OWidgetObj.prototype = Object.create( OPromise.prototype );

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
  return this.properties.author || "";
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
