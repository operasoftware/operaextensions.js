
var BrowserTab = function(browserTabProperties, windowParent, bypassRewriteUrl) {

  if(!windowParent) {
    throw new OError('Parent missing', 'BrowserTab objects can only be created with a window parent provided');
  }

  OPromise.call(this);
  
  this._windowParent = windowParent;

  this.sanitizeProperties = function( props ) {

    if(props.focused !== undefined) {
      props.active = !!props.focused;
      // Not allowed in Chromium API
      delete props.focused;
    } else if( props.active !== true ) {
      // Explicitly set active to false by default in Opera implementation
      props.active = false;
    }

    if(props.locked !== undefined) {
      props.pinned = !!props.locked;
      delete props.locked;
    }

    if(props.url === undefined || props.url === null) {
      props.url = "chrome://newtab";
    }
    
    if(props.position !== undefined) {
      props.index = props.position;
      delete props.position;
    }
    
    if(props.index === undefined || props.index === null) {
      props.index = this._windowParent.tabs.length;
    }
    
    // TODO handle private tab insertion differently in Chromium
    if()
    //browserTabProperties.incognito = browserTabProperties.private || false;
    
    // Properties disallowed when creating a new object or updating an existing object
    if(props.closed !== undefined) {
      delete props.closed;
    }
    
    return props;
  };
  
  this.properties = this.sanitizeProperties(browserTabProperties || {});

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
  return this.properties.url || "";
}); // read-only

BrowserTab.prototype.__defineSetter__("url", function(val) {
  this.properties.url = val + "";
  
  this.enqueue(chrome.tabs.update, this.properties.id, { url: this.properties.url }, function() {
    this.dequeue();
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
  
  if(this.properties.active == true) {
    return; // already focused
  }
  
  // Set BrowserTab object to active state
  this.properties.active = true;
  
  if(this._windowParent) {
    // Set tab focused
    this._windowParent.tabs._lastFocusedTab = this;
    // Set global tab focus if window is also currently focused
    if(OEX.windows._lastFocusedWindow === this._windowParent) {
      OEX.tabs._lastFocusedTab = this;
    }
    
    // unset active state of all other tabs in this collection
    for(var i = 0, l = this._windowParent.tabs.length; i < l; i++) {
      if(this._windowParent.tabs[i] !== this) {
        this._windowParent.tabs[i].properties.active = false;
      }
    }
  }

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(chrome.tabs.update, this.properties.id, { active: true }, function() {
    this.dequeue();
  }.bind(this));

};

BrowserTab.prototype.update = function(browserTabProperties) {
  
  if( this.properties.closed == true ) {
    throw new OError(
      "Invalid state",
      "The current BrowserTab object is closed. Cannot call 'update' on this object."
    );
  }
  
  var updateProperties = {};
  
  // Cannot set focused = false in update
  if(browserTabProperties.focused !== undefined && browserTabProperties.focused == true) {
    this.properties.active = updateProperties.active = !!browserTabProperties.focused;
  }
  
  if(browserTabProperties.locked !== undefined && browserTabProperties.locked !== null) {
    this.properties.pinned = updateProperties.pinned = !!browserTabProperties.locked;
  }
  
  if(browserTabProperties.url !== undefined && browserTabProperties.url !== null) {
    this.propeerties.url = updateProperties.url = browserTabProperties.url;
  }
  
  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(chrome.tabs.update, this.properties.id, updateProperties, function() {
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
    throw new OError(
      "Invalid state",
      "The current BrowserTab object is in the closed state and therefore is invalid."
    );
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
    throw new OError(
      "Invalid state",
      "The current BrowserTab object is in the closed state and therefore is invalid."
    );
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
    /*throw new OError(
      "Invalid state",
      "The current BrowserTab object is already closed. Cannot call 'close' on this object."
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
  this._windowParent = null;
  
  // Remove index
  this._oldIndex = this.properties.index;
  this.properties.index = undefined;
  
  // Remove tab from current collection
  if(this._oldWindowParent) {
    this._oldWindowParent.tabs.removeTab( this );
  } 
  
  // Don't remove from root tab manager because we need this in the chrome.tabs.onRemoved listener!
  
  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.tabs.remove, 
    this.properties.id, 
    function() {
      this.dequeue();
    }.bind(this)
  );

};
