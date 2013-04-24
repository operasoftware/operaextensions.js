
var BrowserTab = function(browserTabProperties, windowParent, bypassRewriteUrl) {

  if(!windowParent) {
    throw new OError('Parent missing', 'BrowserTab objects can only be created with a window parent provided');
  }

  OPromise.call(this);

  this._windowParent = windowParent;
  
  browserTabProperties = browserTabProperties || {};
  
  // Set the correct tab index
  var tabIndex = 0;
  if(browserTabProperties.position !== undefined && 
      browserTabProperties.position !== null && 
        parseInt(browserTabProperties.position, 10) >= 0) {
    tabIndex = parseInt(browserTabProperties.position, 10);
  } else if(windowParent && windowParent.tabs) {
    tabIndex = windowParent.tabs.length;
  }

  this.properties = {
    'id': undefined, // not settable on create
    'closed': false, // not settable on create
    // locked:
    'pinned': browserTabProperties.locked ? !!browserTabProperties.locked : false,
    // private:
    'incognito': false, // TODO handle private tab creation in Chromium model
    // selected:
    'active': browserTabProperties.focused ? !!browserTabProperties.focused : false,
    // readyState:
    'status': 'loading', // not settable on create
    // faviconUrl:
    'favIconUrl': '', // not settable on create
    'title': '', // not settable on create
    'url': browserTabProperties.url ? (browserTabProperties.url + "") : newTab_BaseURL + "/",
    // position:
    'index': tabIndex
    // 'browserWindow' not part of settable properties
    // 'tabGroup' not part of settable properties
  }

  // Create a unique browserTab id
  this._operaId = Math.floor(Math.random() * 1e16);

  // Pass the identity of this tab through the Chromium Tabs API via the URL field
  if(!bypassRewriteUrl) {
    this.rewriteUrl = this.properties.url;
    this.properties.url = newTab_BaseURL + "/#" + this._operaId;
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

  // URL rewrite hack
  if (this.rewriteUrl) {
    return this.rewriteUrl;
  }

  return this.properties.url || "";
}); // read-only

BrowserTab.prototype.__defineSetter__("url", function(val) {
  this.properties.url = val + "";

  Queue.enqueue(this, function(done) {
    chrome.tabs.update(
      this.properties.id,
      { 'url': this.properties.url },
      function(_tab) {
        done();
      }.bind(this)
    );
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

  if(this.properties.active == true || this.properties.closed == true) {
    return; // already focused or invalid because tab is closed
  }

  // Set BrowserTab object to active state
  this.properties.active = true;

  if(this._windowParent) {
    // unset active state of all other tabs in this collection
    for(var i = 0, l = this._windowParent.tabs.length; i < l; i++) {
      if(this._windowParent.tabs[i] !== this) {
        this._windowParent.tabs[i].properties.active = false;
      }
    }
  }

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    chrome.tabs.update(
      this.properties.id,
      { active: true },
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

BrowserTab.prototype.update = function(browserTabProperties) {

  if( this.properties.closed == true ) {
    throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is closed. Cannot call 'update' on this object.",
      DOMException.INVALID_STATE_ERR
    );
  }

  if( isObjectEmpty(browserTabProperties || {}) ) {
    throw new OError(
      'TypeMismatchError',
      'You must provide some valid properties to update a BrowserTab object',
      DOMException.TYPE_MISMATCH_ERR
    );
  }

  var updateProperties = {};

  // Cannot set focused = false in update
  if(browserTabProperties.focused !== undefined && browserTabProperties.focused == true) {
    this.properties.active = updateProperties.active = !!browserTabProperties.focused;

    // unset active parameter of all other objects
    if(this._windowParent) {
      for(var i = 0, l = this._windowParent.tabs.length; i < l; i++) {
        if(this._windowParent.tabs[i] != this) {
          this._windowParent.tabs[i].properties.active = false;
        }
      }
    }
  }

  if(browserTabProperties.locked !== undefined && browserTabProperties.locked !== null) {
    this.properties.pinned = updateProperties.pinned = !!browserTabProperties.locked;
  }

  if(browserTabProperties.url !== undefined && browserTabProperties.url !== null) {
    if(this.rewriteUrl) {
      this.rewriteUrl = updateProperties.url = browserTabProperties.url;
    } else {
      this.properties.url = updateProperties.url = browserTabProperties.url;
    }
  }

  if( !isObjectEmpty(updateProperties) ) {

    // Queue platform action or fire immediately if this object is resolved
    Queue.enqueue(this, function(done) {
      chrome.tabs.update(
        this.properties.id,
        updateProperties,
        function(_tab) {
          done();
        }.bind(this)
      );
    }.bind(this));

  }

};

BrowserTab.prototype.refresh = function() {

  // Cannot refresh if the tab is in the closed state
  if(this.properties.closed === true) {
    return;
  }

  // reload by resetting the URL

  //this.properties.status = "loading";
  //this.properties.title = undefined;

  Queue.enqueue(this, function(done) {
    // reset the readyState + title
    this.properties.status = "loading";
    this.properties.title = undefined;

    chrome.tabs.reload(
      this.properties.id,
      { bypassCache: true },
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

// Web Messaging support for BrowserTab objects
BrowserTab.prototype.postMessage = function( postData ) {

  // Cannot send messages if tab is in the closed state
  if(this.properties.closed === true) {
    throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is in the closed state and therefore is invalid.",
      DOMException.INVALID_STATE_ERR
    );
  }

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    chrome.tabs.sendMessage(
      this.properties.id,
      postData,
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};

// Screenshot API support for BrowserTab objects
BrowserTab.prototype.getScreenshot = function( callback ) {

  // Cannot get a screenshot if tab is in the closed state
  if(this.properties.closed === true) {
    throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is in the closed state and therefore is invalid.",
      DOMException.INVALID_STATE_ERR
    );
  }

  if( !this._windowParent || this._windowParent.properties.closed === true) {
    callback.call( this, undefined );
    return;
  }

  try {

    // Queue platform action or fire immediately if this object is resolved
    Queue.enqueue(this, function(done) {
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

            }.bind(this);
            img.src = nativeCallback;

          } else {

            callback.call( this, undefined );

          }

          done();

        }.bind(this)
      );
    }.bind(this));

  } catch(e) {}

};

BrowserTab.prototype.close = function() {

  if(this.properties.closed == true) {
    /*throw new OError(
      "InvalidStateError",
      "The current BrowserTab object is already closed. Cannot call 'close' on this object.",
      DOMException.INVALID_STATE_ERR
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
  //this._windowParent = null;

  // Remove index
  this._oldIndex = this.properties.index;
  this.properties.index = undefined;

  // Remove tab from current collection
  if(this._oldWindowParent) {
    this._oldWindowParent.tabs.removeTab( this );
  }

  // Remove tab from global collection
  OEX.tabs.removeTab( this );

  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {
    if(!this.properties.id) return;
    chrome.tabs.remove(
      this.properties.id,
      function() {
        done();
      }.bind(this)
    );
  }.bind(this));

};
