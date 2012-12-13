
var BrowserWindowManager = function() {

  OPromise.call(this);

  this.length = 0;

  this._focusedWin = null;
  this.__defineGetter__('_lastFocusedWindow', function() {
    return this._focusedWin;
  });
  this.__defineSetter__('_lastFocusedWindow', function(val) {
    /*console.log( "Focused window:");
    console.debug(val);*/
    this._focusedWin = val;
  });

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
        _tabs[j] = new BrowserTab(_windows[i].tabs[j], this[i], true);
      }
      this[i].tabs.replaceTabs(_tabs);

      _allTabs = _allTabs.concat(_tabs);

    }

    // Replace tabs in root tab manager object
    OEX.tabs.replaceTabs(_allTabs);

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
    
    // Delay so chrome.windows.create callback gets to run first, if any
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
          
          // Focus the window if this tab is created as focused
          if(newBrowserTab.properties.active) {
            this._lastFocusedWindow = newBrowserWindow;
          }

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
  
  chrome.windows.onFocusChanged.addListener(function(windowId) {
      
      var _prevFocusedWindow = this._lastFocusedWindow;

      // If no new window is focused, abort here
      if( windowId !== chrome.windows.WINDOW_ID_NONE ) {
    
        // Find and fire focus event on newly focused window
        for (var i = 0, l = this.length; i < l; i++) {

          if (this[i].properties.id == windowId && this._lastFocusedWindow !== this[i] ) {
            
            this[i].properties.focused = true;
          
            this._lastFocusedWindow = this[i];
            
            // Setup the current focused tab on window focus change event
            // since Chromium doesn't fire the chrome.tabs.onActivated function
            // when we just switch between browser windows
            for(var j = 0, k = this._lastFocusedWindow.tabs.length; j < k; j++) {
              if(this._lastFocusedWindow.tabs[j].properties.active == true) {
                this._lastFocusedWindow.tabs._lastFocusedTab = this._lastFocusedWindow.tabs[j];
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

};

BrowserWindowManager.prototype = Object.create(OPromise.prototype);

BrowserWindowManager.prototype.create = function(tabsToInject, browserWindowProperties) {
  
  /*
  // Support tc-BrowserWindowManager-015 test
  
  var isEmpty_TabsToInject = true;
  
  if(tabsToInject && Object.prototype.toString.call(tabsToInject) === "[object Array]") {
    for(var i = 0, l = tabsToInject.length; i < l; i++) {
      if( !isObjectEmpty(tabsToInject[i]) ) {
        isEmpty_TabsToInject = false;
        break;
      }
    }
  }
  
  var isEmpty_BrowserWindowProperties = isObjectEmpty(browserWindowProperties || {});
  
  // undefined/null tabsToInject w/ non-empty window properties is ok
  if( !isEmpty_BrowserWindowProperties && (tabsToInject === undefined || tabsToInject === null)) {
    noTabsToInject = false;
  }

  if(isEmpty_TabsToInject && isEmpty_BrowserWindowProperties) {
    throw new OError("NotSupportedError", "Cannot create a new window without providing at least one method parameter.", 9);
  }
  
  if(!isEmpty_TabsToInject && isEmpty_BrowserWindowProperties) {
    throw new OError("NotSupportedError", "Cannot create a new window without providing at least one window property parameter.", 9);
  }
  
  if(isEmpty_TabsToInject && !isEmpty_BrowserWindowProperties) {
    throw new OError("NotSupportedError", "Cannot create a new window without providing at least one object (or 'null')", 9);
  }*/

  // Create new BrowserWindow object (+ sanitize browserWindowProperties values)
  var shadowBrowserWindow = new BrowserWindow(browserWindowProperties);
  
  // Add tabs included in the create() call to the newly created
  // window, if any, based on type
  var hasTabsToInject = false;
  
  if (tabsToInject &&
        Object.prototype.toString.call(tabsToInject) === "[object Array]" && 
          tabsToInject.length > 0) {
          
    hasTabsToInject = true;

    for (var i = 0, l = tabsToInject.length; i < l; i++) {

      if (tabsToInject[i] instanceof BrowserTab) {

        (function(existingBrowserTab) {
          
          // Delay this so we pick up the id property of the shadowBrowserWindow once
          // it's been created :)
          shadowBrowserWindow.tabs.enqueue(function() {
            chrome.tabs.move(
              existingBrowserTab.properties.id, 
              {
                index: -1,
                windowId: shadowBrowserWindow.properties.id
              }, 
              function(_tab) {
                for (var i in _tab) {
                  existingBrowserTab.properties[i] = _tab[i];
                }

                existingBrowserTab.resolve(true);
                
                this.dequeue();
              }.bind(shadowBrowserWindow.tabs)
            );
          });
          
          // Remove tab from previous window parent and then 
          // add it to its new window parent
          if(existingBrowserTab._windowParent) {
            existingBrowserTab._windowParent.tabs.removeTab(existingBrowserTab);
          }
          
          // Rewrite tab's BrowserWindow parent
          existingBrowserTab._windowParent = shadowBrowserWindow;
          // Rewrite tab's index position in collection
          existingBrowserTab.properties.index = shadowBrowserWindow.tabs.length;
          
          shadowBrowserWindow.tabs.addTab( existingBrowserTab, existingBrowserTab.properties.index);
          
          // move events etc will fire in onMoved listener of RootBrowserTabManager
          
        })(tabsToInject[i]);

      } else { // Treat as a BrowserTabProperties object by default

        (function(browserTabProperties) {
          
          var newBrowserTab = new BrowserTab(browserTabProperties, shadowBrowserWindow);

          // Register BrowserTab object with the current BrowserWindow object
          shadowBrowserWindow.tabs.addTab( newBrowserTab, newBrowserTab.properties.index);
          
          // Add object to root store
          OEX.tabs.addTab( newBrowserTab );

          // Delay this so we pick up the id property of the shadowBrowserWindow once
          // it's been created :)
          shadowBrowserWindow.tabs.enqueue(function() {
            newBrowserTab.properties.windowId = shadowBrowserWindow.properties.id;
            
            var tabProps = newBrowserTab.properties;
            
            // remove invalid parameters if they exist
            if(tabProps.closed !== undefined) {
              delete tabProps.closed;
            }
            
            chrome.tabs.create(
              tabProps, 
              function(_tab) {
                for (var i in _tab) {
                  newBrowserTab.properties[i] = _tab[i];
                }
                
                this.dispatchEvent(new OEvent('create', {
                  "tab": newBrowserTab,
                  "prevWindow": newBrowserTab._windowParent,
                  "prevTabGroup": null,
                  "prevPosition": NaN
                }));

                newBrowserTab.resolve(true);
                
                // Fire a create event at RootTabsManager
                OEX.tabs.dispatchEvent(new OEvent('create', {
                  "tab": newBrowserTab,
                  "prevWindow": newBrowserTab._windowParent,
                  "prevTabGroup": null,
                  "prevPosition": NaN
                }));
                
                this.dequeue();
              }.bind(shadowBrowserWindow.tabs)
            );
          });

        })(tabsToInject[i]);

      }

    }

  } else { // we only have one default chrome://newtab tab to set up
    
    // setup single new tab and tell onCreated to ignore this item
    var defaultBrowserTab = new BrowserTab({ active: true }, shadowBrowserWindow);
    
    // Register BrowserTab object with the current BrowserWindow object
    shadowBrowserWindow.tabs.addTab( defaultBrowserTab, defaultBrowserTab.properties.index );
    
    // Add object to root store
    OEX.tabs.addTab( defaultBrowserTab );
    
    // Set tab focus
    shadowBrowserWindow.tabs._lastFocusedTab = defaultBrowserTab;
    // Set global tab focus if shadowBrowserWindow is also currently focused
    if(OEX.windows._lastFocusedWindow == shadowBrowserWindow) {
      OEX.tabs._lastFocusedTab = defaultBrowserTab;
    }

  }

  // Add this object to the current collection
  this[this.length] = shadowBrowserWindow;
  this.length += 1;
  
  // Queue platform action or fire immediately if this object is resolved
  this.enqueue(
    chrome.windows.create,
    shadowBrowserWindow.properties, 
    function(_window) {

      // Update BrowserWindow properties
      for (var i in _window) {
        if(i == 'tabs') continue; // don't overwrite!
        shadowBrowserWindow.properties[i] = _window[i];
      }
      
      // remove starting tab if we have been asked to add at least 
      // one tabsToInject. Otherwise, ignore this and keep the newly
      // created tab(s) by default
      if(hasTabsToInject === true) {
        for(var i = 0, l = _window.tabs.length; i < l; i++) {
          // Blacklist stray tabs from the master tab's manager collection
          OEX.tabs._blackList[ _window.tabs[i].id ] = true;
          
          // Remove stray tab from the platform
          shadowBrowserWindow.tabs.enqueue(
            chrome.tabs.remove,
            _window.tabs[i].id,
            function() {
              this.dequeue();
            }.bind(shadowBrowserWindow.tabs)
          );
        }
      } else {
        // consolidate the one default tab with the lazy loaded tab object above
        if(_window.tabs[0] !== undefined && _window.tabs[0] !== null) {
          for(var i in _window.tabs[0]) {
            shadowBrowserWindow.tabs[0].properties[i] = _window.tabs[0][i];
          }
        }
      }
      
      // Resolution order:
      // 1. Window
      // 2. Window's Tab Manager
      // 3. Window's Tab Manager's Tabs (after tabs cleanup below)
      shadowBrowserWindow.resolve(true);

      shadowBrowserWindow.tabs.resolve(true);
      
      for(var i = 0, l = shadowBrowserWindow.tabs.length; i < l; i++) {
        shadowBrowserWindow.tabs[i].resolve(true);
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

  if(!browserWindow || !(browserWindow instanceof BrowserWindow)) {
    return;
  }
  
  browserWindow.close();

};
