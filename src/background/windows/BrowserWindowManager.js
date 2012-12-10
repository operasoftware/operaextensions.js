
var BrowserWindowManager = function() {

  OPromise.call(this);

  // Set up 1 mock BrowserWindow at startup
  this[0] = new BrowserWindow();
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
        this[0].properties[i] = _windows[0][i];
      }

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[0].tabs.length; j < k; j++) {
        _tabs[j] = new BrowserTab(_windows[0].tabs[j], this[0]);
        
        // Set as the currently focused tab?
        if(_tabs[j].properties.active == true && this[0].properties.focused == true) {
          this[0].tabs._lastFocusedTab = _tabs[j];
          OEX.tabs._lastFocusedTab = _tabs[j];
        }
        
      }
      this[0].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);
    }

    for (var i = 1, l = _windows.length; i < l; i++) {
      this[i] = new BrowserWindow(_windows[i]);
      this.length = i + 1;

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[i].tabs.length; j < k; j++) {
        _tabs[j] = new BrowserTab(_windows[i].tabs[j], this[i]);
        
        // Set as the currently focused tab?
        if(_tabs[j].properties.active == true && this[i].properties.focused == true) {
          this[i].tabs._lastFocusedTab = _tabs[j];
          OEX.tabs._lastFocusedTab = _tabs[j];
        }
        
      }
      this[i].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);

    }

    // Replace tabs in root tab manager object
    OEX.tabs.replaceTabs(_allTabs);

    // Set up the correct lastFocused window object
    chrome.windows.getLastFocused(
      { populate: false }, 
      function(_window) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (this[i].properties.id === _window.id) {
            this._lastFocusedWindow = this[i];
            break;
          }
        }
      }.bind(this)
    );

    // Resolve root window manager
    this.resolve();
    // Resolve root tabs manager
    OEX.tabs.resolve();

    // Resolve objects.
    //
    // Resolution of each object in order:
    // 1. Window
    // 2. Window's Tab Manager
    // 3. Window's Tab Manager's Tabs
    for (var i = 0, l = this.length; i < l; i++) {
      this[i].resolve();
      this[i].tabs.resolve();
      for (var j = 0, k = this[i].tabs.length; j < k; j++) {
        this[i].tabs[j].resolve();
      }
    }
    
    // Set WinTabs feature to LOADED
    deferredComponentsLoadStatus['WINTABS_LOADED'] = true;

  }.bind(this));

  // Monitor ongoing window events
  chrome.windows.onCreated.addListener(function(_window) {

    // Delay enough so that the create callback can run first in o.e.windows.create() function
    window.setTimeout(function() {

      var windowFound = false;

      // If this window is already registered in the collection then ignore
      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].properties.id == _window.id) {
          windowFound = true;
          if(this[i].focused) {
            this._lastFocusedWindow = this[i];
          }
          break;
        }
      }

      // If window was created outside of this framework, add it in and initialize
      if (!windowFound) {
        var newBrowserWindow = new BrowserWindow(_window);

        // Convert tab objects to BrowserTab objects
        var newBrowserTabs = [];
        for (var i in _window.tabs) {

          var newBrowserTab = new BrowserTab(_window.tabs[i], newBrowserWindow);

          newBrowserTabs.push(newBrowserTab);

        }
        // Add BrowserTab objects to new BrowserWindow object
        newBrowserWindow.tabs.replaceTabs(newBrowserTabs);

        this[this.length] = newBrowserWindow;
        this.length += 1;
        
        if(newBrowserWindow.focused) {
          this._lastFocusedWindow = newBrowserWindow;
        }

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
        this.dispatchEvent(new OEvent('create', {
          browserWindow: newBrowserWindow
        }));
        
      }
      
    }.bind(this), 200);

  }.bind(this));

  chrome.windows.onRemoved.addListener(function(windowId) {

    // Remove window from current collection
    var deleteIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == windowId) {
        deleteIndex = i;
        break;
      }
    }

    if (deleteIndex > -1) {

      // Fire a new 'close' event on the closed BrowserWindow object
      this[deleteIndex].dispatchEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));

      // Fire a new 'close' event on this manager object
      this.dispatchEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));

      // Manually splice the deleteIndex_th_ item from the current collection
      for (var i = deleteIndex, l = this.length; i < l; i++) {
        if (this[i + 1]) {
          this[i] = this[i + 1];
        }
      }
      delete this[this.length - 1];
      this.length -= 1;

    }

  }.bind(this));

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    
    // Delay enough so that the create callback can run first in o.e.windows.create() function
    window.setTimeout(function() {
    
      // Find and fire blur event on currently focused window
      for (var i = 0, l = this.length; i < l; i++) {

        if (this[i] == this._lastFocusedWindow && this[i].properties.id != windowId) {
        
          // Fire a new 'blur' event on this manager object
          this.dispatchEvent(new OEvent('blur', {
            browserWindow: this[i]
          }));
        
          break;
        }

      }
    
      // If no new window is focused, abort here
      if( windowId !== chrome.windows.WINDOW_ID_NONE ) {
    
        // Find and fire focus event on newly focused window
        for (var i = 0, l = this.length; i < l; i++) {

          if (this[i].properties.id == windowId && this[i] !== this._lastFocusedWindow) {
          
            this._lastFocusedWindow = this[i];
          
            // Fire a new 'focus' event on this manager object
            this.dispatchEvent(new OEvent('focus', {
              browserWindow: this[i]
            }));
          
            break;
          }

        }

      }
    
    }.bind(this), 200);

  }.bind(this));

};

BrowserWindowManager.prototype = Object.create(OPromise.prototype);

BrowserWindowManager.prototype.create = function(tabsToInject, browserWindowProperties, obj) {

  browserWindowProperties = browserWindowProperties || {};

  var shadowBrowserWindow = obj || new BrowserWindow(browserWindowProperties);

  // If current object is not resolved, then enqueue this action
  if (!this.resolved) {
    this.enqueue('create', tabsToInject, browserWindowProperties, shadowBrowserWindow);
    return shadowBrowserWindow;
  }

  browserWindowProperties.incognito = browserWindowProperties.private || false;

  chrome.windows.create(
    browserWindowProperties, 
    function(_window) {
      // Update BrowserWindow properties
      for (var i in _window) {
        shadowBrowserWindow.properties[i] = _window[i];
      }

      // Convert tab objects to BrowserTab objects
      var browserTabs = [];

      if (_window.tabs) {

        for (var i = 0, l = _window.tabs.length; i < l; i++) {

          var shadowBrowserTab = new BrowserTab(_window.tabs[i], shadowBrowserWindow);

          browserTabs.push(shadowBrowserTab);

        }

      }

      //shadowBrowserWindow._parent = self;
      shadowBrowserWindow.tabs.replaceTabs(browserTabs);

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

          if (tabsToInject[i] instanceof BrowserTab) {

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

          } else { // Treat as a BrowserTabProperties object by default
            (function(browserTabProperties) {
              
              var shadowBrowserTab = new BrowserTab(browserTabProperties, shadowBrowserWindow);

              //shadowBrowserTab.properties.index = -1;
              shadowBrowserTab.properties.windowId = _window.id;

              chrome.tabs.create(
                shadowBrowserTab.properties, 
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
      this.dispatchEvent(new OEvent('create', {
        browserWindow: shadowBrowserWindow
      }));

      this.dequeue();

    }.bind(this)
  );
  
  // Add this object to the current collection
  this[this.length] = shadowBrowserWindow;
  this.length += 1;

  return shadowBrowserWindow;
};

BrowserWindowManager.prototype.getAll = function() {

  var allWindows = [];

  for (var i = 0, l = this.length; i < l; i++) {
    allWindows[i] = this[i];
  }

  return allWindows;

};

BrowserWindowManager.prototype.getLastFocused = function() {

  return this._lastFocusedWindow;

};

BrowserWindowManager.prototype.close = function(browserWindow) {

  chrome.windows.remove(browserWindow.properties.id, function() {

    browserWindow.properties.closed = true;
    browserWindow.dequeue();

  });

};
