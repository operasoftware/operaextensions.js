
OEX.BrowserWindowsManager = function() {

  OEX.Promise.call(this);

  var self = this;

  // Set up 1 mock BrowserWindow at startup
  this[0] = new OEX.BrowserWindow();
  this.length = 1;

  this._lastFocusedWindow = this[0];

  // Set up the real BrowserWindow (& BrowserTab) objects currently available
  chrome.windows.getAll({
    populate: true
  }, function(_windows) {

    var _allTabs = [];

    // Treat the first window specially
    if (_windows.length > 0) {
      for (var i in _windows[0]) {
        self[0].properties[i] = _windows[0][i];
      }

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[0].tabs.length; j < k; j++) {
        _tabs[j] = new OEX.BrowserTab(_windows[0].tabs[j], self[0]);
      }
      self[0].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);
    }

    for (var i = 1, l = _windows.length; i < l; i++) {
      self[i] = new OEX.BrowserWindow(_windows[i]);
      self.length = i + 1;

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[i].tabs.length; j < k; j++) {
        _tabs[j] = new OEX.BrowserTab(_windows[i].tabs[j], self[i]);
      }
      self[i].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);

    }

    // Replace tabs in root tab manager object
    OEX.tabs.replaceTabs(_allTabs);

    // Set up the correct lastFocused window object
    chrome.windows.getLastFocused(
      { populate: false }, 
      function(_window) {
        for (var i = 0, l = self.length; i < l; i++) {
          if (self[i].properties.id === _window.id) {
            self._lastFocusedWindow = self[i];
            break;
          }
        }
      }
    );

    // Resolve root window manager
    self.resolve();
    // Resolve root tabs manager
    OEX.tabs.resolve();

    // Resolve objects.
    //
    // Resolution of each object in order:
    // 1. Window
    // 2. Window's Tab Manager
    // 3. Window's Tab Manager's Tabs
    for (var i = 0, l = self.length; i < l; i++) {
      self[i].resolve();
      self[i].tabs.resolve();
      for (var j = 0, k = self[i].tabs.length; j < k; j++) {
        self[i].tabs[j].resolve();
      }
    }

  });

  // Monitor ongoing window events
  chrome.windows.onCreated.addListener(function(_window) {

    // Delay enough so that the create callback can run first in o.e.windows.create() function
    window.setTimeout(function() {

      var windowFound = false;

      // If this window is already registered in the collection then ignore
      for (var i = 0, l = self.length; i < l; i++) {
        if (self[i].properties.id == _window.id) {
          windowFound = true;
          break;
        }
      }

      // If window was created outside of this framework, add it in and initialize
      if (!windowFound) {
        var newBrowserWindow = new OEX.BrowserWindow(_window);

        // Convert tab objects to OEX.BrowserTab objects
        var newBrowserTabs = [];
        for (var i in _window.tabs) {

          var newBrowserTab = new OEX.BrowserTab(_window.tabs[i], newBrowserWindow);

          newBrowserTabs.push(newBrowserTab);

        }
        // Add OEX.BrowserTab objects to new OEX.BrowserWindow object
        newBrowserWindow.tabs.replaceTabs(newBrowserTabs);

        self[self.length] = newBrowserWindow;
        self.length += 1;

        // Resolve objects.
        //
        // Resolution of each object in order:
        // 1. Window
        // 2. Window's Tab Manager
        // 3. Window's Tab Manager's Tabs
        newBrowserWindow.resolve();
        newBrowserWindow.tabs.resolve();
        for (var i = 0, l = newBrowserWindow.tabs.length; i < l; i++) {
          newBrowserWindow.tabs[i].resolve();
        }

        // Fire a new 'create' event on this manager object
        self.fireEvent(new OEX.Event('create', {
          browserWindow: newBrowserWindow
        }));

      }

    }, 200);
  });

  chrome.windows.onRemoved.addListener(function(windowId) {

    // Remove window from current collection
    var deleteIndex = -1;
    for (var i = 0, l = self.length; i < l; i++) {
      if (self[i].properties.id == windowId) {
        deleteIndex = i;
        break;
      }
    }

    if (deleteIndex > -1) {

      // Fire a new 'close' event on the closed BrowserWindow object
      self[deleteIndex].fireEvent(new OEX.Event('close', {
        'browserWindow': self[deleteIndex]
      }));

      // Fire a new 'close' event on this manager object
      self.fireEvent(new OEX.Event('close', {
        'browserWindow': self[deleteIndex]
      }));

      // Manually splice the deleteIndex_th_ item from the current collection
      for (var i = deleteIndex, l = self.length; i < l; i++) {
        if (self[i + 1]) {
          self[i] = self[i + 1];
        }
      }
      delete self[self.length - 1];
      self.length -= 1;

    }

  });

  chrome.windows.onFocusChanged.addListener(function(windowId) {

    for (var i = 0, l = self.length; i < l; i++) {

      if (self[i].properties.id == windowId) {
        self._lastFocusedWindow = self[i];
        break;
      }

    }

  });

};

OEX.BrowserWindowsManager.prototype = Object.create(OEX.Promise.prototype);

OEX.BrowserWindowsManager.prototype.create = function(tabsToInject, browserWindowProperties, obj) {

  browserWindowProperties = browserWindowProperties || {};

  var shadowBrowserWindow = obj || new OEX.BrowserWindow(browserWindowProperties);

  // If current object is not resolved, then enqueue this action
  if (!this.resolved) {
    this.enqueue('create', tabsToInject, browserWindowProperties, shadowBrowserWindow);
    return shadowBrowserWindow;
  }

  browserWindowProperties.incognito = browserWindowProperties.private || false;

  var self = this;

  chrome.windows.create(
    browserWindowProperties, 
    function(_window) {
      // Update BrowserWindow properties
      for (var i in _window) {
        shadowBrowserWindow.properties[i] = _window[i];
      }

      // Convert tab objects to OEX.BrowserTab objects
      var browserTabs = [];

      if (_window.tabs) {

        for (var i = 0, l = _window.tabs.length; i < l; i++) {

          var shadowBrowserTab = new OEX.BrowserTab(_window.tabs[i], shadowBrowserWindow);

          browserTabs.push(shadowBrowserTab);

        }

      }

      //shadowBrowserWindow._parent = self;
      shadowBrowserWindow.tabs.replaceTabs(browserTabs);

      // Add this object to the current collection
      self[self.length] = shadowBrowserWindow;
      self.length += 1;

      // Resolution order:
      // 1. Window
      // 2. Window's Tab Manager
      // 3. Window's Tab Manager's Tabs
      shadowBrowserWindow.resolve();

      shadowBrowserWindow.tabs.resolve();

      // Add tabs included in the create() call to the newly created
      // window, if any, based on type
      if (tabsToInject) {
        for (var i in tabsToInject) {

          if (tabsToInject[i] instanceof OEX.BrowserTab) {

            (function(tab) {
              chrome.tabs.move(
                tab.properties.id, 
                {
                  index: -1,
                  windowId: _window.id
                }, function(_tab) {
                  for (var i in _tab) {
                    tab.properties[i] = _tab[i];
                  }

                  tab.resolve();
                }
              );
            })(tabsToInject[i]);

          } else if (tabsToInject[i] instanceof OEX.BrowserTabGroup) {

            // TODO
          } else { // Treat as a BrowserTabProperties object by default
            (function(browserTabProperties) {

              var shadowBrowserTab = new OEX.BrowserTab(browserTabProperties, shadowBrowserWindow);

              chrome.tabs.create(
                shadowBrowserTab.properties, 
                {
                  index: -1,
                  windowId: _window.id
                }, 
                function(_tab) {
                  for (var i in _tab) {
                    shadowBrowserTab.properties[i] = _tab[i];
                  }

                  shadowBrowserTab.resolve();
                }
              );

              // Register BrowserTab object with the current BrowserWindow object
              shadowBrowserWindow.tabs.addTabs([shadowBrowserTab]);

            })(tabsToInject[i]);

          }

        }

      }

      // Fire a new 'create' event on this manager object
      self.fireEvent(new OEX.Event('create', {
        browserWindow: shadowBrowserWindow
      }));

      self.dequeue();

    }
  );

  return shadowBrowserWindow;
};

OEX.BrowserWindowsManager.prototype.getAll = function() {

  var allWindows = [];

  for (var i = 0, l = this.length; i < l; i++) {
    allWindows[i] = this[i];
  }

  return allWindows;

};

OEX.BrowserWindowsManager.prototype.getLastFocused = function() {

  return this._lastFocusedWindow;

};

OEX.BrowserWindowsManager.prototype.close = function(browserWindow) {

  chrome.windows.remove(browserWindow.properties.id, function() {

    browserWindow.properties.closed = true;
    browserWindow.dequeue();

  });

};
