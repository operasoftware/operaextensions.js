
var BrowserWindowManager = function() {

  OPromise.call(this);

  this.length = 0;

  this._lastFocusedWindow = null;

  // Set up the real BrowserWindow (& BrowserTab) objects currently available
  chrome.windows.getAll({
    populate: true
  }, function(_windows) {

    var _allTabs = [];

    for (var i = 0, l = _windows.length; i < l; i++) {
      this[i] = new BrowserWindow(_windows[i]);
      this.length = i + 1;
      
      // First run
      if(this._lastFocusedWindow === null) {
        this._lastFocusedWindow = this[i];
      }
      
      if(this[i].properties.focused == true) {
        this._lastFocusedWindow = this[i];
      }

      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[i].tabs.length; j < k; j++) {
        _tabs[j] = new BrowserTab(_windows[i].tabs[j], this[i]);
        
        // Set as the currently focused tab?
        if(_tabs[j].properties.active == true) {
          this[i].tabs._lastFocusedTab = _tabs[j]; // window-focused tab
          
          if(this[i].properties.focused == true) {
            OEX.tabs._lastFocusedTab = _tabs[j]; // gloval-focused tab
          }
        }
        
      }
      this[i].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);

    }

    // Replace tabs in root tab manager object
    OEX.tabs.replaceTabs(_allTabs);

    // Set up the correct lastFocused window object
    /*chrome.windows.getLastFocused(
      { populate: false }, 
      function(_window) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (this[i].properties.id === _window.id) {
            this._lastFocusedWindow = this[i];
            break;
          }
        }
      }.bind(this)
    );*/

    // Resolve root window manager
    this.resolve(true);
    // Resolve root tabs manager
    OEX.tabs.resolve(true);

    // Resolve objects.
    //
    // Resolution of each object in order:
    // 1. Window
    // 2. Window's Tab Manager
    // 3. Window's Tab Manager's Tabs
    for (var i = 0, l = this.length; i < l; i++) {
      this[i].resolve(true);
      this[i].tabs.resolve(true);
      for (var j = 0, k = this[i].tabs.length; j < k; j++) {
        this[i].tabs[j].resolve(true);
      }
    }
    
    // Set WinTabs feature to LOADED
    deferredComponentsLoadStatus['WINTABS_LOADED'] = true;

  }.bind(this));

  // Monitor ongoing window events
  chrome.windows.onCreated.addListener(function(_window) {
    
    global.setTimeout(function() {
      
      var windowFound = false;

      // If this window is already registered in the collection then ignore
      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].properties.id == _window.id) {
          windowFound = true;
          if(this[i].properties.focused == true) {
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
        newBrowserWindow.resolve(true);
        newBrowserWindow.tabs.resolve(true);
        for (var i = 0, l = newBrowserWindow.tabs.length; i < l; i++) {
          newBrowserWindow.tabs[i].resolve(true);
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
      /*this[deleteIndex].dispatchEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));*/
      
      this[deleteIndex].properties.closed = true;

      // Fire a new 'close' event on this manager object
      this.dispatchEvent(new OEvent('close', {
        'browserWindow': this[deleteIndex]
      }));

      // Manually splice the deleteIndex_th_ item from the current collection
      for (var i = deleteIndex, l = this.length; i < l; i++) {
        if (this[i + 1]) {
          this[i] = this[i + 1];
        } else {
          delete this[i]; // remove last item
        }
      }
      this.length -= 1;

    }

  }.bind(this));

  chrome.windows.onFocusChanged.addListener(function(windowId) {
    
      var _prevFocusedWindow = this._lastFocusedWindow;
    
      // If no new window is focused, abort here
      if( windowId !== chrome.windows.WINDOW_ID_NONE ) {
    
        // Find and fire focus event on newly focused window
        for (var i = 0, l = this.length; i < l; i++) {

          if (this[i].properties.id == windowId && this[i] !== this._lastFocusedWindow) {
            
            this[i].properties.focused = true;
          
            this._lastFocusedWindow = this[i];
            
            // Setup the current focused tab on window focus change event
            // since Chromium doesn't fire the chrome.tabs.onActivated function
            // when we just switch between browser windows
            for(var j = 0, k = this._lastFocusedWindow.tabs.length; j < k; j++) {
              if(this._lastFocusedWindow.tabs[j].properties.active == true) {
                OEX.tabs._lastFocusedTab = this._lastFocusedWindow.tabs[j];
                break;
              }
            }
          
            break;
          }

        }

      }
      
      // Find and fire blur event on currently focused window
      for (var i = 0, l = this.length; i < l; i++) {

        if (this[i].properties.id !== windowId && this[i] == _prevFocusedWindow) {
        
          this[i].properties.focused = false;
        
          // Fire a new 'blur' event on the window object
          this[i].dispatchEvent(new OEvent('blur', {
            // browserWindow should refer to the new foreground window
            // see: /tests/BrowserWindowManager/004/
            browserWindow: this._lastFocusedWindow
          }));
          
          // Fire a new 'blur' event on this manager object
          this.dispatchEvent(new OEvent('blur', {
            // browserWindow should refer to the new foreground window
            // see: /tests/BrowserWindowManager/004/
            browserWindow: this._lastFocusedWindow
          }));
          
          // If something is blurring then we should also fire the
          // corresponding 'focus' events
          
          // Fire a new 'focus' event on the window object
          this._lastFocusedWindow.dispatchEvent(new OEvent('focus', {
            // browserWindow should refer to the old background window
            // see: /tests/BrowserWindowManager/004/
            browserWindow: _prevFocusedWindow
          }));
          
          // Fire a new 'focus' event on this manager object
          this.dispatchEvent(new OEvent('focus', {
            // browserWindow should refer to the old background window
            // see: /tests/BrowserWindowManager/004/
            browserWindow: _prevFocusedWindow
          }));
        
          break;
        }

      }

  }.bind(this));

};

BrowserWindowManager.prototype = Object.create(OPromise.prototype);

BrowserWindowManager.prototype.create = function(tabsToInject, browserWindowProperties) {

  browserWindowProperties = browserWindowProperties || {};
  
  delete browserWindowProperties.closed;
  
  if(browserWindowProperties.private !== undefined) {
    browserWindowProperties.incognito = !!browserWindowProperties.private;
    delete browserWindowProperties.private;
  }

  var shadowBrowserWindow = new BrowserWindow(browserWindowProperties);

  // Add this object to the current collection
  this[this.length] = shadowBrowserWindow;
  this.length += 1;
  
  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.windows.create,
    browserWindowProperties, 
    function(_window) {

      // Update BrowserWindow properties
      for (var i in _window) {
        shadowBrowserWindow.properties[i] = _window[i];
      }

      // Resolution order:
      // 1. Window
      // 2. Window's Tab Manager
      // 3. Window's Tab Manager's Tabs
      shadowBrowserWindow.resolve(true);

      shadowBrowserWindow.tabs.resolve(true);

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

                  tab.resolve(true);
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

                  shadowBrowserTab.resolve(true);
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

  if(!browserWindow || !browserWindow instanceof BrowserWindow) {
    return;
  }
  
  browserWindow.close();

};
