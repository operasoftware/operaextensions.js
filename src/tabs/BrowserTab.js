
OEX.BrowserTab = function(browserTabProperties, windowParent) {

  OPromise.call(this);

  this.properties = browserTabProperties || {};

  this._windowParent = windowParent;

  // Create a unique browserTab id
  this._operaId = Math.floor(Math.random() * 1e16);

};

OEX.BrowserTab.prototype = Object.create(OPromise.prototype);

// API
OEX.BrowserTab.prototype.__defineGetter__("id", function() {
  return this._operaId;
});

OEX.BrowserTab.prototype.__defineGetter__("closed", function() {
  return this.properties.closed || false;
});

OEX.BrowserTab.prototype.__defineGetter__("locked", function() {
  return this.properties.pinned || false;
});

OEX.BrowserTab.prototype.__defineGetter__("focused", function() {
  return this.properties.active || false;
});

OEX.BrowserTab.prototype.__defineGetter__("selected", function() {
  return this.properties.active || false;
});

OEX.BrowserTab.prototype.__defineGetter__("private", function() {
  return this.properties.incognito || false;
});

OEX.BrowserTab.prototype.__defineGetter__("faviconUrl", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.favIconUrl || "";
});

OEX.BrowserTab.prototype.__defineGetter__("title", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.title || "";
});

OEX.BrowserTab.prototype.__defineGetter__("url", function() {
  if (this.properties.closed) {
    return "";
  }
  return this.properties.url || "";
});

OEX.BrowserTab.prototype.__defineGetter__("readyState", function() {
  return this.properties.status || "loading";
});

OEX.BrowserTab.prototype.__defineGetter__("browserWindow", function() {
  return this._windowParent;
});

OEX.BrowserTab.prototype.__defineGetter__("tabGroup", function() {
  // not implemented
  return null;
});

OEX.BrowserTab.prototype.__defineGetter__("position", function() {
  return this.properties.index || NaN;
});

// Methods
OEX.BrowserTab.prototype.close = function() {

  OEX.tabs.close(this);

};

OEX.BrowserTab.prototype.focus = function() {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._windowParent && !this._windowParent.resolved) ||
            (this._windowParent && this._windowParent._parent && !this._windowParent._parent.resolved)) {
    this.enqueue('focus');
    return;
  }

  var self = this;

  chrome.tabs.update(this.properties.id, {
    active: true
  }, function() {
    self.dequeue();
  });

};

OEX.BrowserTab.prototype.update = function(browserTabProperties) {

  // If current object is not resolved, then enqueue this action
  if (!this.resolved ||
        (this._windowParent && !this._windowParent.resolved) ||
            (this._windowParent && this._windowParent._parent && !this._windowParent._parent.resolved)) {
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
  var self = this;

  // Make any requested changes take effect in the user agent
  chrome.tabs.update(this.properties.id, browserTabProperties, function() {
    self.dequeue();
  });

};

OEX.BrowserTab.prototype.refresh = function() {
  // not implemented
};
