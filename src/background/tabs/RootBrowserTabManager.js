
var RootBrowserTabManager = function() {

  BrowserTabManager.call(this);
  
  // list of tab objects we should ignore
  this._blackList = {};

  // Event Listener implementations
  chrome.tabs.onCreated.addListener(function(_tab) {

    // Delay so chrome.tabs.create callback gets to run first, if any
    global.setTimeout(function() {
      
      if( this._blackList[ _tab.id ] ) {
        return;
      }
      
      // If this tab is already registered in the root tab collection then ignore
      var tabFoundIndex = -1;
      for (var i = 0, l = this.length; i < l; i++) {

        // opera.extension.windows.create rewrite hack
        if (this[i].rewriteUrl && this[i].properties.url == _tab.url) {

          if(this[i]._windowParent) {

            // If the window ids don't match then silently move the tab to the correct parent
            // e.g. this happens if we create a new tab from the background page's console.
            if(this[i]._windowParent.properties.id !== _tab.windowId) {
              for(var j = 0, k = OEX.windows.length; j < k; j++) {
                if(OEX.windows[j].properties.id == _tab.windowId) {
                  this[i]._windowParent.tabs.removeTab(this[i]);
                  this[i].properties.index = this[i]._windowParent.tabs.length;
                  this[i]._windowParent = OEX.windows[j];
                  this[i].properties.windowId = _tab.windowId;
                
                  OEX.windows[j].tabs.addTab( this[i], this[i].properties.index);
                }
              }
            }
          
          }
          
          for(var j in _tab) {
            if(j == 'url' || j == 'windowId') continue;
            this[i].properties[j] = _tab[j];
          }
          // now rewrite to the correct url 
          // (which will be navigated to automatically when tab is resolved)
          this[i].url = this[i].rewriteUrl;
          delete this[i].rewriteUrl;
          
          return;
        }
        
        // Standard tab search
        if (this[i].properties.id == _tab.id) {
          tabFoundIndex = i;
          break;
        }
      }
        
      var newTab;
      
      if (tabFoundIndex < 0) {
        
        var parentWindow;

        // find tab's parent window object
        var _windows = opera.extension.windows;
        for (var i = 0, l = _windows.length; i < l; i++) {
          if (_windows[i].properties.id == _tab.windowId) {
            parentWindow = _windows[i];
            break;
          }
        }

        if (!parentWindow) {
          parentWindow = OEX.windows.getLastFocused();
        }
        
        // Create and register a new BrowserTab object
        newTab = new BrowserTab(_tab, parentWindow);

        newTab._windowParent.tabs.addTab( newTab, newTab.properties.index );
        
        // Add object to root store
        this.addTab( newTab );
        
        // Resolve new tab, if it hasn't been resolved already
        newTab.resolve(true);

      } else {
        
        // Update tab properties
        for(var i in _tab) {
          this[tabFoundIndex].properties[i] = _tab[i];
        }
        
        newTab = this[tabFoundIndex];
        
      }
      
      newTab._windowParent.tabs.dispatchEvent(new OEvent('create', {
        "tab": newTab,
        "prevWindow": newTab._windowParent,
        "prevTabGroup": null,
        "prevPosition": NaN
      }));

      // Fire a create event at RootTabsManager
      this.dispatchEvent(new OEvent('create', {
        "tab": newTab,
        "prevWindow": newTab._windowParent,
        "prevTabGroup": null,
        "prevPosition": NaN
      }));
      
    }.bind(this), 200);

  }.bind(this));

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    
    if( this._blackList[ tabId ] ) {
      return;
    }

    // Remove tab from current collection
    var deleteIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        deleteIndex = i;
        break;
      }
    }

    if (deleteIndex > -1) {

      var oldTab = this[deleteIndex];
      
      var oldTabWindowParent = oldTab ? oldTab._windowParent : null;
      var oldTabPosition = oldTab ? oldTab.position : NaN;

      // Detach from parent BrowserWindow
      if (oldTabWindowParent) {
        
        oldTabWindowParent.tabs.removeTab( oldTab );

      }
      
      // Remove tab from root tab manager
      this.removeTab( oldTab );

      // Fire a new 'close' event on the closed BrowserTab object
      /*oldTab.dispatchEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));*/
      
      // Fire a new 'close' event on the closed BrowserTab's previous 
      // BrowserWindow parent object
      if(oldTabWindowParent) {
        oldTabWindowParent.tabs.dispatchEvent(new OEvent('close', {
          "tab": oldTab,
          "prevWindow": oldTabWindowParent,
          "prevTabGroup": null,
          "prevPosition": oldTabPosition
        }));
      }

      // Fire a new 'close' event on this root tab manager object
      this.dispatchEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));

    }

  }.bind(this));

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    var updateIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        updateIndex = i;
        break;
      }
    }

    if (updateIndex < 0) {
      return; // nothing to update
    }

    var updateTab = this[updateIndex];

    // Update tab properties in current collection
    for (var prop in tab) {
      if(prop == "id" || prop == "windowId") { // ignore these
        continue;
      }
      updateTab.properties[prop] = tab[prop];
    }
    
    // Set the window as focused if tab is set to active
    if(updateTab.properties.active == true) {
      updateTab._windowParent.tabs._lastFocusedTab = updateTab;
      if( OEX.windows._lastFocusedWindow == updateTab._windowParent) {
        OEX.tabs._lastFocusedTab = updateTab;
      }
    }

    // Update tab properties in _windowParent object
    if (updateTab._windowParent) {
      var parentUpdateIndex = -1;
      for (var i = 0, l = updateTab._windowParent.tabs.length; i < l; i++) {
        if (updateTab._windowParent.tabs[i].properties.id == tabId) {
          parentUpdateIndex = i;
          break;
        }
      }

      if (parentUpdateIndex > -1) {

        for (var i in changeInfo) {
          updateTab._windowParent.tabs[parentUpdateIndex].properties[i] = changeInfo[i];
        }

      }

    }

  }.bind(this));
  
  function moveHandler(tabId, moveInfo) {
    
    if( this._blackList[ tabId ] ) {
      return;
    }
    
    // Find tab object
    var moveIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        moveIndex = i;
        break;
      }
    }

    if (moveIndex < 0) {
      return; // nothing to update
    }

    var moveTab = this[moveIndex];
    var moveTabWindowParent = moveTab._windowParent || null;

    if(moveTab) {
      
      var oldPosition = moveTab.properties.position;

      // Detach from current _windowParent and attach to new BrowserWindow parent
      if (moveTabWindowParent) {

        var parentMoveIndex = -1;
        for (var i = 0, l = moveTabWindowParent.tabs.length; i < l; i++) {
          if (moveTabWindowParent.tabs[i].properties.id == tabId) {
            parentMoveIndex = i;
            break;
          }
        }

        if (parentMoveIndex > -1) {

          // Remove moveTab from _windowParent.tabs
          for (var i = parentMoveIndex, l = moveTabWindowParent.tabs.length; i < l; i++) {
            if (moveTabWindowParent.tabs[i + 1]) {
              moveTabWindowParent.tabs[i] = moveTabWindowParent.tabs[i + 1];
            }
          }
          delete moveTabWindowParent.tabs[moveTab._windowParent.length - 1];
          moveTabWindowParent.tabs.length -= 1;

        }

      }
      
      // Find new BrowserWindow parent and attach moveTab
      for (var i = 0, l = OEX.windows.length; i < l; i++) {
        if (OEX.windows[i].properties.id == (moveInfo.windowId !== undefined ? moveInfo.windowId : moveInfo.newWindowId)
              && moveTab._windowParent.properties.id !== OEX.windows[i].properties.id ) {
          // Reassign moveTab's _windowParent
          moveTab._windowParent = OEX.windows[i];
        
          // Attach tab to new parent
          OEX.windows[i].tabs.addTab( moveTab, (moveInfo.toIndex !== undefined ? moveInfo.toIndex : moveInfo.newPosition));
    
          break;
        }
      }

      moveTab.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldPosition
      }));

      this.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldPosition
      }));

    }

  }

  // Fired when a tab is moved within a window
  chrome.tabs.onMoved.addListener(moveHandler.bind(this));
  
  // Fired when a tab is moved between windows
  chrome.tabs.onAttached.addListener(moveHandler.bind(this));

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    
    if( this._blackList[ activeInfo.tabId ] ) {
      return;
    }
    
    if(!activeInfo.tabId) return;
    
    for(var i = 0, l = this.length; i < l; i++) {
      
      if(this[i].properties.id == activeInfo.tabId) {
        
        this[i].focus();
        
      }
      
    }

  }.bind(this));
  
  // Listen for getScreenshot requests from Injected Scripts
  OEX.addEventListener('controlmessage', function( msg ) {

    if( !msg.data || !msg.data.action || msg.data.action !== '___O_getScreenshot_REQUEST' || !msg.source.tabId ) {
      return;
    }
    
    // Resolve tabId to BrowserTab object
    var sourceBrowserTab = null
    for(var i = 0, l = this.length; i < l; i++) {
      if( this[ i ].properties.id == msg.source.tabId ) {
        sourceBrowserTab = this[ i ];
        break;
      }
    }
    
    if( sourceBrowserTab !== null && 
          sourceBrowserTab._windowParent && 
              sourceBrowserTab._windowParent.properties.closed != true ) { 
      
      try {
      
        // Get screenshot of requested window belonging to current tab
        chrome.tabs.captureVisibleTab(
          sourceBrowserTab._windowParent.properties.id, 
          {},
          function( nativeCallback ) {

            // Return the result to the callee
            msg.source.postMessage({
              "action": "___O_getScreenshot_RESPONSE",
              "dataUrl": nativeCallback || null
            });
      
          }.bind(this)
        );
    
      } catch(e) {}
    
    } else {
      
      msg.source.postMessage({
        "action": "___O_getScreenshot_RESPONSE",
        "dataUrl": undefined
      });
      
    }
    
  }.bind(this));

};

RootBrowserTabManager.prototype = Object.create( BrowserTabManager.prototype );

// Make sure .__proto__ object gets setup correctly
for(var i in BrowserTabManager.prototype) {
  if(BrowserTabManager.prototype.hasOwnProperty(i)) {
    RootBrowserTabManager.prototype[i] = BrowserTabManager.prototype[i];
  }
}

