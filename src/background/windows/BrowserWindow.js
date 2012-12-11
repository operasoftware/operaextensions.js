
var BrowserWindow = function(browserWindowProperties) {

  OPromise.call(this);

  this.properties = browserWindowProperties || {};

  this._parent = null;

  // Create a unique browserWindow id
  this._operaId = Math.floor(Math.random() * 1e16);

  this.tabs = new BrowserTabManager(this);

  this.tabGroups = new BrowserTabGroupManager(this);
};

BrowserWindow.prototype = Object.create(OPromise.prototype);

// API
BrowserWindow.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

BrowserWindow.prototype.__defineGetter__("closed", function() {
  return this.properties.closed !== undefined ? !!this.properties.closed : false;
});

BrowserWindow.prototype.__defineGetter__("focused", function() {
  return this.properties.focused !== undefined ? !!this.properties.focused : false;
});

BrowserWindow.prototype.__defineGetter__("private", function() {
  return this.properties.incognito !== undefined ? !!this.properties.incognito : false;
});

BrowserWindow.prototype.__defineGetter__("parent", function() {
  return this._parent;
});

BrowserWindow.prototype.insert = function(browserTab, child) {

  if (!browserTab || !(browserTab instanceof BrowserTab)) { 
    return;
  }

  if (this.properties.closed === true) {
    throw new OError(
      "Invalid state",
      "Current window is in the closed state and therefore is invalid"
    );
  }

  var moveProperties = {
    windowId: this.properties.id
  };

  // Set insert position for the new tab from 'before' attribute, if any
  if (child && (child instanceof BrowserTab)) {

    if (child.closed === true) {
      throw new OError(
        "Invalid state",
        "'child' parameter is in the closed state and therefore is invalid"
      );
    }

    if (child._windowParent && child._windowParent.closed === true) {
      throw new OError(
        "Invalid state",
        "Parent window of 'child' parameter is in the closed state and therefore is invalid"
      );
    }
    moveProperties.windowId = child._windowParent ?
                                      child._windowParent.properties.id : moveProperties.windowId;
    moveProperties.index = child.position;

  }

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.tabs.move,
    browserTab.properties.id, 
    moveProperties, 
    function(_tab) {
      this.dequeue();
    }.bind(this)
  );

};

BrowserWindow.prototype.focus = function() {

  // Set BrowserWindow object to focused state
  this.properties.focused = true;

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.windows.update,
    this.properties.id, 
    {
      focused: true
    }, 
    function() {
      this.dequeue();
    }.bind(this)
  );

};

BrowserWindow.prototype.update = function(browserWindowProperties) {

  // Remove invalid parameters if present:
  delete browserWindowProperties.closed; // cannot set closed state via update

  // TODO enforce incognito because we can't make a tab incognito once it has been added to a non-incognito window.
  //browserWindowProperties.incognito = browserWindowProperties.private || false;

  for (var i in browserWindowProperties) {
    this.properties[i] = browserWindowProperties[i];
  }

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.windows.update,
    this.properties.id, 
    browserWindowProperties, 
    function() {
      this.dequeue();
    }.bind(this)
  );

}

BrowserWindow.prototype.close = function() {
  
  // Set BrowserWindow object to closed state
  this.properties.closed = true;

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(function() {
    chrome.windows.remove(
      this.properties.id,
      function() {
        this.dequeue();
        OEX.windows.dequeue();
      }.bind(this)
    );
  }.bind(this));

};
