
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
BrowserTab.prototype.close = function() {

  OEX.tabs.close(this);

};

BrowserTab.prototype.focus = function() {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved) {
    this.enqueue('focus');
    return;
  }

  chrome.tabs.update(this.properties.id, {
    active: true
  }, function() {
    this.dequeue();
  }.bind(this));

};

BrowserTab.prototype.update = function(browserTabProperties) {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved) {
    this.enqueue('update', browserTabProperties);
    return;
  }

  for (var i in browserTabProperties) {
    this.properties[i] = browserTabProperties[i];
  }

  // Parameter mappings
  browserTabProperties.active = browserTabProperties.focused || false;
  browserTabProperties.pinned = browserTabProperties.locked || false;

  // Not allowed in Chromium API
  delete browserTabProperties.focused;

  // TODO handle private tab insertion differently in Chromium
  //browserTabProperties.incognito = browserTabProperties.private || false;

  // Make any requested changes take effect in the user agent
  chrome.tabs.update(this.properties.id, browserTabProperties, function() {
    
    this.dequeue();

  }.bind(this));

};

BrowserTab.prototype.refresh = function() {
  // not implemented
};

// Web Messaging support for BrowserTab objects
BrowserTab.prototype.postMessage = function( postData ) {
  
  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._windowParent && !this._windowParent.resolved) ||
            (this._windowParent && this._windowParent._parent && !this._windowParent._parent.resolved)) {
    this.enqueue('postMessage', postData);
    return;
  }
  
  chrome.tabs.sendMessage( this.properties.id, postData );
  
  this.dequeue();
  
};

// Screenshot API support for BrowserTab objects
BrowserTab.prototype.getScreenshot = function( callback ) {
  
  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._windowParent && !this._windowParent.resolved) ||
            (this._windowParent && this._windowParent._parent && !this._windowParent._parent.resolved)) {
    this.enqueue('getScreenshot', callback);
    return;
  }
  
  if( !this._windowParent || this._windowParent.properties.closed === true) {
    callback.call( this, undefined );
    return;
  }
  
  try {
  
    // Get screenshot of requesting tab
    chrome.tabs.captureVisibleTab(
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
    
      }.bind(this)
    );
  
  } catch(e) {} 
  
};
