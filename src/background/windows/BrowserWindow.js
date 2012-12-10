
var BrowserWindow = function(browserWindowProperties) {

  OPromise.call(this);

  this.properties = browserWindowProperties || {};

  this._parent = null;

  // Create a unique browserWindow id
  this._operaId = Math.floor(Math.random() * 1e16);

  this.tabs = new BrowserTabsManager(this);

  this.tabGroups = new BrowserTabGroupManager(this);
};

BrowserWindow.prototype = Object.create(OPromise.prototype);

// API
BrowserWindow.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

BrowserWindow.prototype.__defineGetter__("closed", function() {
  return this.properties.closed || false;
});

BrowserWindow.prototype.__defineGetter__("focused", function() {
  return this.properties.focused || false;
});

BrowserWindow.prototype.__defineGetter__("private", function() {
  return this.properties.incognito || false;
});

BrowserWindow.prototype.__defineGetter__("parent", function() {
  return this._parent;
});

BrowserWindow.prototype.insert = function(browserTab, child) {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._parent && !this._parent.resolved) || !browserTab.resolved ||
            (child && !child.resolved)) {
    this.enqueue('insert', browserTab, child);
    return;
  }

  if (this.closed === true) {
    throw {
      name: "Invalid State Error",
      message: "Current window is in the closed state and therefore is invalid"
    };
    return;
  }

  var browserTabProperties = {
    windowId: this.properties.id
  };

  // Set insert position for the new tab from 'before' attribute, if any
  if (child && child instanceof BrowserTab) {

    if (child.closed === true) {
      throw {
        name: "Invalid State Error",
        message: "'child' attribute is in the closed state and therefore is invalid"
      };
      return;
    }

    if (child._windowParent && child._windowParent.closed === true) {
      throw {
        name: "Invalid State Error",
        message: "Parent window of 'child' attribute is in the closed state and therefore is invalid"
      };
      return;
    }
    browserTabProperties.windowId = child._windowParent ?
                                      child._windowParent.properties.id : browserTabProperties.windowId;
    browserTabProperties.index = child.position;

  }

  if (browserTab instanceof BrowserTab) {

    // Fulfill this action against the current object
    chrome.tabs.move(
      browserTab.properties.id, 
      browserTabProperties, 
      function(_tab) {
        // Run next enqueued action on this object, if any
        this.dequeue();
      }.bind(this)
    );

  }

};

BrowserWindow.prototype.focus = function() {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved || (this._parent && !this._parent.resolved)) {
    this.enqueue('focus');
    return;
  }

  chrome.windows.update(
    this.properties.id, {
      focused: true
    }, 
    function() {
      this.dequeue();
    }.bind(this)
  );

};

BrowserWindow.prototype.update = function(browserWindowProperties) {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved || (this._parent && !this._parent.resolved)) {
    this.enqueue('update', browserWindowProperties);
    return;
  }

  for (var i in browserWindowProperties) {
    this.properties[i] = browserWindowProperties[i];
  }

  // TODO enforce incognito because we can't make a tab incognito once it has been added to a non-incognito window.
  //browserWindowProperties.incognito = browserWindowProperties.private || false;
  
  // Make any requested changes take effect in the user agent
  chrome.windows.update(
    this.properties.id, 
    browserWindowProperties, 
    function() {
      this.dequeue();
    }
  );

}

BrowserWindow.prototype.close = function() {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved || (this._parent && !this._parent.resolved)) {
    this.enqueue('close');
    return;
  }

  OEX.windows.close(this);

};
