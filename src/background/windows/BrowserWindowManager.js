
var BrowserWindowManager = function() {

  OPromise.call(this);

  this.length = 0;

  // Set up the real BrowserWindow (& BrowserTab) objects available at start up time
  chrome.windows.getAll({
    populate: true
  }, function(_windows) {

    var _allTabs = [];

    for (var i = 0, l = _windows.length; i < l; i++) {
      var newWindow = new BrowserWindow(_windows[i]);
      
      // Set properties not available in BrowserWindow constructor
      newWindow.properties.id = _windows[i].id;
      newWindow.properties.incognito = _windows[i].incognito;
      
      this[i] = newWindow;
      this.length = i + 1;
      
      // Replace tab properties belonging to this window with real properties
      var _tabs = [];
      for (var j = 0, k = _windows[i].tabs.length; j < k; j++) {
        _tabs[j] = new BrowserTab(_windows[i].tabs[j], this[i], true);
        
        // Set properties not available in BrowserTab constructor
        _tabs[j].properties.id = _windows[i].tabs[j].id;
        _tabs[j].properties.active = _windows[i].tabs[j].active;
        _tabs[j].properties.pinned = _windows[i].tabs[j].pinned;
        _tabs[j].properties.status = _windows[i].tabs[j].status;
        _tabs[j].properties.title = _windows[i].tabs[j].title;
        _tabs[j].properties.favIconUrl = _windows[i].tabs[j].favIconUrl;
        _tabs[j].properties.url = _windows[i].tabs[j].url;
        _tabs[j].properties.index = _windows[i].tabs[j].index;
        _tabs[j].properties.incognito = _windows[i].tabs[j].incognito;
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
  
  this.addWindow = function(windowId, windowObj) {
    
    windowObj.properties.id = windowId;
    
    this[this.length] = windowObj;
    this.length += 1;
    
    // Resolve object
    windowObj.resolve(true);
    windowObj.tabs.resolve(true);
    
    // Fire a new 'create' event on this manager object
    this.dispatchEvent(new OEvent('create', {
      browserWindow: windowObj
    }));
    
  };

  // Monitor ongoing window events
  
  chrome.windows.onFocusChanged.addListener(function(windowId) {
      
      var _prevFocusedWindow = this.getLastFocused();

      // If no new window is focused, abort here
      if( windowId !== chrome.windows.WINDOW_ID_NONE ) {
    
        // Find and fire focus event on newly focused window
        for (var i = 0, l = this.length; i < l; i++) {

          if (this[i].properties.id == windowId && _prevFocusedWindow !== this[i] ) {
            
            this[i].properties.focused = true;
          
          } else {
            
            this[i].properties.focused = false;
            
          }

        }

      }
      
      // Find and fire blur event on currently focused window
      for (var i = 0, l = this.length; i < l; i++) {

        if (this[i].properties.id !== windowId && this[i] == _prevFocusedWindow) {
        
          this[i].properties.focused = false;
        
          // Fire a new 'blur' event on the window object
          this[i].dispatchEvent(new OEvent('blur', {
            browserWindow: _prevFocusedWindow
          }));
          
          // Fire a new 'blur' event on this manager object
          this.dispatchEvent(new OEvent('blur', {
            browserWindow: _prevFocusedWindow
          }));
          
          // If something is blurring then we should also fire the
          // corresponding 'focus' events
          
          var _newFocusedWindow = this.getLastFocused();
          
          // Fire a new 'focus' event on the window object
          _newFocusedWindow.dispatchEvent(new OEvent('focus', {
            browserWindow: _newFocusedWindow
          }));
          
          // Fire a new 'focus' event on this manager object
          this.dispatchEvent(new OEvent('focus', {
            browserWindow: _newFocusedWindow
          }));
        
          break;
        }

      }
      
      Queue.dequeue();

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
      
      var removedWindow = this[deleteIndex];

      removedWindow.properties.closed = true;

      // Set window tabs collection to empty
      removedWindow.tabs.replaceTabs([]);

      // Manually splice the deleteIndex_th_ item from the current windows collection
      for (var i = deleteIndex, l = this.length; i < l; i++) {
        if (this[i + 1]) {
          this[i] = this[i + 1];
        } else {
          delete this[i]; // remove last item
        }
      }
      this.length -= 1;
      
      // Fire a new 'close' event on the closed BrowserWindow object
      removedWindow.dispatchEvent(new OEvent('close', {}));

      // Fire a new 'close' event on this manager object
      this.dispatchEvent(new OEvent('close', {
        'browserWindow': removedWindow
      }));

    }
    
    Queue.dequeue();

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
    throw new OError(
      "NotSupportedError", 
      "Cannot create a new window without providing at least one method parameter.", 
      DOMException.NOT_SUPPORTED_ERR
    );
  }
  
  if(!isEmpty_TabsToInject && isEmpty_BrowserWindowProperties) {
    throw new OError(
      "NotSupportedError", 
      "Cannot create a new window without providing at least one window property parameter.", 
      DOMException.NOT_SUPPORTED_ERR
    );
  }
  
  if(isEmpty_TabsToInject && !isEmpty_BrowserWindowProperties) {
    throw new OError(
      "NotSupportedError", 
      "Cannot create a new window without providing at least one object (or 'null')", 
      DOMException.NOT_SUPPORTED_ERR
    );
  }*/

  // Create new BrowserWindow object (+ sanitize browserWindowProperties values)
  var shadowBrowserWindow = new BrowserWindow(browserWindowProperties);
  
  var createProperties = {
    'focused': shadowBrowserWindow.properties.focused,
    'incognito': shadowBrowserWindow.properties.incognito,
    'width': shadowBrowserWindow.properties.width,
    'height': shadowBrowserWindow.properties.height,
    'top': shadowBrowserWindow.properties.top,
    'left': shadowBrowserWindow.properties.left
  };
  
  // Add tabs included in the create() call to the newly created
  // window, if any, based on type
  var hasTabsToInject = false;
  
  var tabsToMove = [];
  var tabsToCreate = [];
  
  if (tabsToInject &&
        Object.prototype.toString.call(tabsToInject) === "[object Array]" && 
          tabsToInject.length > 0) {

    hasTabsToInject = true;

    for (var i = 0, l = tabsToInject.length; i < l; i++) {

      if (tabsToInject[i] instanceof BrowserTab) {

        (function(existingBrowserTab, index) {
          
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
          
          // Don't create the first tab as this will be resolved differently
          if(index == 0) {
            
            // Implicitly add the first BrowserTab to the new window
            createProperties.tabId = existingBrowserTab.properties.id;
            
          } else {

           // handled in window.create callback function
           // because we need the window's id property to move
           // items to this window object 
           tabsToMove.push(existingBrowserTab);
              
          }
          
          // move events etc will fire in onMoved listener of RootBrowserTabManager
          
        })(tabsToInject[i], i);

      } else { // Treat as a BrowserTabProperties object by default

        (function(browserTabProperties, index) {
          
          browserTabProperties = browserTabProperties || {};
          
          var newBrowserTab = new BrowserTab(browserTabProperties, shadowBrowserWindow);
          
          newBrowserTab.properties.index = i;

          // Register BrowserTab object with the current BrowserWindow object
          shadowBrowserWindow.tabs.addTab( newBrowserTab, newBrowserTab.properties.index);
          
          // Add object to root store
          OEX.tabs.addTab( newBrowserTab );

          // set BrowserWindow object's rewriteUrl to first tab's opera id
          if( index == 0 ) {
            
            createProperties.url = shadowBrowserWindow.rewriteUrl = "chrome://newtab/#" + newBrowserTab._operaId;

          } else {
            
            tabsToCreate.push(newBrowserTab);
            
          }

        })(tabsToInject[i], i);

      }

    }

  } else { // we only have one default chrome://newtab tab to set up
    
    // setup single new tab and tell onCreated to ignore this item
    var defaultBrowserTab = new BrowserTab({ active: true }, shadowBrowserWindow);
    
    // Register BrowserTab object with the current BrowserWindow object
    shadowBrowserWindow.tabs.addTab( defaultBrowserTab, defaultBrowserTab.properties.index );
    
    // Add object to root store
    OEX.tabs.addTab( defaultBrowserTab );
    
    // set rewriteUrl to windowId
    shadowBrowserWindow.rewriteUrl = "chrome://newtab/#" + shadowBrowserWindow._operaId;
    
    createProperties.url = shadowBrowserWindow.rewriteUrl;

  }
  
  // Add this object to the current collection
  this[this.length] = shadowBrowserWindow;
  this.length += 1;
  
  // unfocus all other windows in collection if this window is focused
  if(shadowBrowserWindow.properties.focused == true ) {
    for(var i = 0, l = this.length; i < l; i++) {
      if(this[i] !== shadowBrowserWindow) {
        this[i].properties.focused = false;
      }
    }
  }
  
  // Queue platform action or fire immediately if this object is resolved
  Queue.enqueue(this, function(done) {

  chrome.windows.create(
    createProperties,
    function(_window) {

      // Update BrowserWindow properties
      for (var i in _window) {
        if(i == 'tabs') continue; // don't overwrite tabs!
        shadowBrowserWindow.properties[i] = _window[i];
      }
    
      // Move any remaining existing tabs to new window
      // now that we have the window.id property assigned
      // above in properties copy
      if( tabsToMove.length > 0 ) {
      
        for(var i = 0, l = tabsToMove.length; i < l; i++) {
        
          (function(existingBrowserTab) {
        
            // Explicitly move anything after the first BrowserTab to the new window
            Queue.enqueue(existingBrowserTab, function(done) {
          
              chrome.tabs.move(
                this.properties.id, 
                {
                  index: this._windowParent.tabs.length,
                  windowId: this._windowParent.properties.id
                },
                function(_tab) {
                  for (var i in _tab) {
                    if(i == 'url') continue;
                    this.properties[i] = _tab[i];
                  }
          
                  done();
                }.bind(this)
              );
            }.bind(existingBrowserTab));
        
          })(tabsToMove[i]);
        
        }
      
      }
    
      if( tabsToCreate.length > 0 ) {
      
        for(var i = 0, l = tabsToCreate.length; i < l; i++) {
        
          (function(newBrowserTab) {

            var tabCreateProps = {
              'windowId': shadowBrowserWindow.properties.id,
              'url': newBrowserTab.properties.url || "chrome://newtab/",
              'active': newBrowserTab.properties.active,
              'pinned': newBrowserTab.properties.pinned,
              'index': newBrowserTab.properties.index
            };
          
            Queue.enqueue(this, function(done) {
            chrome.tabs.create(
              tabCreateProps, 
              function(_tab) {
                for (var i in _tab) {
                  newBrowserTab.properties[i] = _tab[i];
                }

                newBrowserTab.resolve(true);

                done();
              
              }.bind(shadowBrowserWindow.tabs)
            );
            }.bind(this), true);
          
            newBrowserTab._windowParent.tabs.dispatchEvent(new OEvent('create', {
              "tab": newBrowserTab,
              "prevWindow": newBrowserTab._windowParent,
              "prevTabGroup": null,
              "prevPosition": NaN
            }));

            // Fire a create event at RootTabsManager
            OEX.tabs.dispatchEvent(new OEvent('create', {
              "tab": newBrowserTab,
              "prevWindow": newBrowserTab._windowParent,
              "prevTabGroup": null,
              "prevPosition": NaN
            }));
          
          })(tabsToCreate[i]);
        
        }
      
      }
      
      done();

    }.bind(this)
  );
  
  }.bind(this), true);
  
  // return shadowBrowserWindow from this function before firing these events!
  global.setTimeout(function() {
    
    // Fire a new 'create' event on this manager object
    this.dispatchEvent(new OEvent('create', {
      browserWindow: shadowBrowserWindow
    }));
    
  }.bind(this), 50);
  
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

  for(var i = 0, l = this.length; i < l; i++) {
    if(this[i].focused == true) {
      return this[i];
    }
  }

  // default
  if(this[0]) {
    this[0].properties.focused = true;
  }
  
  return this[0] || undefined;

};

BrowserWindowManager.prototype.close = function(browserWindow) {

  if(!browserWindow || !(browserWindow instanceof BrowserWindow)) {
    return;
  }
  
  browserWindow.close();

};
