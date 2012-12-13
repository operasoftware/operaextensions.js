
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

    if (deleteIndex < 0) {
      return;
    }

    var oldTab = this[deleteIndex];
    
    var oldTabWindowParent = oldTab._oldWindowParent;
    var oldTabPosition = oldTab._oldIndex || oldTab.properties.index;

    // Detach from current parent BrowserWindow (if close happened outside of our framework)
    if (!oldTabWindowParent && oldTab._windowParent !== undefined && oldTab._windowParent !== null) {
      oldTab.properties.closed = true;
      
      oldTab._windowParent.tabs.removeTab( oldTab );
      
      // Remove tab from root tab manager
      this.removeTab( oldTab );
      
      // Focus new tab within the removed tab's window
      for(var i = 0, l = oldTab._windowParent.tabs.length; i < l; i++) {
        if(oldTab._windowParent.tabs[i].properties.active == true) {
          oldTab._windowParent.tabs[i].focus();
        } else {
          oldTab._windowParent.tabs[i].properties.active = false;
        }
      }
      
      oldTab.properties.index = NaN;
      
      oldTabWindowParent = oldTab._windowParent;
      oldTab._windowParent = null;
    }

    // Fire a new 'close' event on the closed BrowserTab object
    oldTab.dispatchEvent(new OEvent('close', {
      "tab": oldTab,
      "prevWindow": oldTabWindowParent,
      "prevTabGroup": null,
      "prevPosition": oldTabPosition
    }));
    
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
    
    if(updateTab.properties.active == true 
        && updateTab._windowParent 
          && updateTab._windowParent.tabs._lastFocusedTab !== updateTab) {
      updateTab.focus();
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
    
    if(moveTab) {
      
      // Remove and re-add to BrowserTabManager parent in the correct position
      if(moveTab._oldWindowParent) {
        moveTab._oldWindowParent.tabs.removeTab( moveTab );
      } else {
        moveTab._windowParent.tabs.removeTab( moveTab );
      }
      console.log(moveTab.properties.index + " / " +  moveInfo.toIndex );
      moveTab._windowParent.tabs.addTab( moveTab, moveInfo.toIndex );
      
      moveTab.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTab._oldWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveTab._oldIndex
      }));

      this.dispatchEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTab._oldWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveTab._oldIndex
      }));
      
      // Clean up temporary attributes
      if(moveTab._oldWindowParent !== undefined) {
        delete moveTab._oldWindowParent;
      }
      if(moveTab._oldIndex !== undefined) {
        delete moveTab._oldIndex;
      }

    }

  }
  
  function attachHandler(tabId, attachInfo) {
    
    // Find tab object
    var attachIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        attachIndex = i;
        break;
      }
    }

    if (attachIndex < 0) {
      return; // nothing to update
    }

    var attachedTab = this[attachIndex];
    
    // Detach tab from existing BrowserWindow parent (if any)
    if (attachedTab._oldWindowParent) {
      attachedTab._oldWindowParent.tabs.removeTab( attachedTab );
    }
    
    // Wait for new window to be created and attached!
    global.setTimeout(function() {
    
      // Attach tab to new BrowserWindow parent
      for (var i = 0, l = OEX.windows.length; i < l; i++) {
        console.log(OEX.windows[i].properties.id + " / " + attachInfo.newWindowId);
        if (OEX.windows[i].properties.id == attachInfo.newWindowId) {
          // Reassign attachedTab's _windowParent
          attachedTab._windowParent = OEX.windows[i];
        
          // Update index
          attachedTab.properties.index = attachInfo.newPosition;
  
          // Tab will be added in the moveHandler function
          
          break;
        }
      }
    
      var moveInfo = {
        windowId: attachInfo.newWindowId,
        //fromIndex: null,
        toIndex: attachInfo.newPosition
      };
    
      // Execute normal move handler
      moveHandler.bind(this).call(this, tabId, moveInfo);
    
    }.bind(this), 200);
  }
  
  function detachHandler(tabId, detachInfo) {
    
    // Find tab object
    var detachIndex = -1;
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i].properties.id == tabId) {
        detachIndex = i;
        break;
      }
    }

    if (detachIndex < 0) {
      return; // nothing to update
    }

    var detachedTab = this[detachIndex];
    
    if(detachedTab) {
      detachedTab._oldWindowParent = detachedTab._windowParent;
      detachedTab._oldIndex = detachedTab.position;
    }
    
  }
  
  // Fired when a tab is moved within a window
  chrome.tabs.onMoved.addListener(moveHandler.bind(this));
  
  // Fired when a tab is moved between windows
  chrome.tabs.onAttached.addListener(attachHandler.bind(this));
  
  // Fired when a tab is removed from an existing window
  chrome.tabs.onDetached.addListener(detachHandler.bind(this));

  chrome.tabs.onActivated.addListener(function(activeInfo) {
    
    if( this._blackList[ activeInfo.tabId ] ) {
      return;
    }
    
    if(!activeInfo.tabId) return;
    
    for(var i = 0, l = this.length; i < l; i++) {
      
      if(this[i].properties.id == activeInfo.tabId) {
        
        // Set BrowserTab object to active state
        this[i].properties.active = true;

        if(this[i]._windowParent) {
          // Set tab focused
          this[i]._windowParent.tabs._lastFocusedTab = this[i];
          // Set global tab focus if window is also currently focused
          if(OEX.windows._lastFocusedWindow === this[i]._windowParent) {
            OEX.tabs._lastFocusedTab = this[i];
          }

          // unset active state of all other tabs in this collection
          for(var i = 0, l = this[i]._windowParent.tabs.length; i < l; i++) {
            if(this[i]._windowParent.tabs[i] !== this[i]) {
              this[i]._windowParent.tabs[i].properties.active = false;
            }
          }
        }
        
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

