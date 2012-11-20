
OEX.RootBrowserTabsManager = function() {

  OEX.BrowserTabsManager.call(this);

  // Event Listener implementations
  chrome.tabs.onCreated.addListener(function(_tab) {

    window.setTimeout(function() {

      // If this tab is already registered in the root tab collection then ignore
      var tabFound = false;
      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].properties.id == _tab.id) {
          tabFound = true;
          break;
        }
      }

      if (!tabFound) {
        // Create and register a new BrowserTab object
        var newTab = new OEX.BrowserTab(_tab);

        var noParentFound = true;

        // Attach the tab to its parent window object
        var _windows = opera.extension.windows;
        for (var i = 0, l = _windows.length; i < l; i++) {
          if (_windows[i].properties.id == _tab.windowId) {

            noParentFound = false;

            newTab._windowParent = _windows[i];

            break;
          }
        }

        if (noParentFound) {
          newTab._windowParent = OEX.windows.getLastFocused();
        }

        newTab._windowParent.tabs.addTabs([newTab], newTab.properties.index);

        newTab._windowParent.tabs.fireEvent(new OEvent('create', {
          "tab": newTab,
          "prevWindow": newTab._windowParent,
          "prevTabGroup": null,
          "prevPosition": NaN
        }));

        // Add object to root store
        this.addTabs([newTab]);

        // Resolve new tab, if it hasn't been resolved already
        newTab.resolve();

        // Fire a create event at RootTabsManager
        this.fireEvent(new OEvent('create', {
          "tab": newTab,
          "prevWindow": newTab._windowParent,
          "prevTabGroup": null,
          "prevPosition": NaN
        }));

      }

    }.bind(this), 200);

  }.bind(this));

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

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
      oldTab.fireEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));
      
      // Fire a new 'close' event on the closed BrowserTab's previous 
      // BrowserWindow parent object
      if(oldTabWindowParent) {
        oldTabWindowParent.tabs.fireEvent(new OEvent('close', {
          "tab": oldTab,
          "prevWindow": oldTabWindowParent,
          "prevTabGroup": null,
          "prevPosition": oldTabPosition
        }));
      }

      // Fire a new 'close' event on this root tab manager object
      this.fireEvent(new OEvent('close', {
        "tab": oldTab,
        "prevWindow": oldTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": oldTabPosition
      }));

    }

  }.bind(this));

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {

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
    for (var i in changeInfo) {
      updateTab.properties[i] = changeInfo[i];
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

  chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {

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
    var moveTabWindowParent = moveTab ? moveTab._windowParent : null;

    if(moveTab) {

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
        if (OEX.windows[i].properties.id == moveInfo.windowId) {
          // Attach tab to new parent
          OEX.windows[i].tabs.addTabs([moveTab], moveInfo.toIndex);
          
          // Reassign moveTab's _windowParent
          moveTab._windowParent = OEX.windows[i];
          
          break;
        }
      }

      moveTab.fireEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveInfo.fromIndex
      }));

      this.fireEvent(new OEvent('move', {
        "tab": moveTab,
        "prevWindow": moveTabWindowParent,
        "prevTabGroup": null,
        "prevPosition": moveInfo.fromIndex
      }));
    
    }

  }.bind(this));

  chrome.tabs.onHighlighted.addListener(function(highlightInfo) {

    // Set current tab property to active while setting everything else to inactive
    for (var i = 0, l = OEX.windows.length; i < l; i++) {

      for (var j = 0, k = OEX.windows[i].tabs.length; j < k; j++) {

        for (var x = 0, z = highlightInfo.tabIds.length; x < z; x++) {

          if (OEX.windows[i] == highlightInfo.windowId &&
                OEX.windows[i].tabs[j].properties.id == highlightInfo.tabIds[x]) {

            OEX.windows[i].tabs[j].properties.active = true;

          } else {

            OEX.windows[i].tabs[j].properties.active = false;

          }

        }

      }

    }

  });

};

OEX.RootBrowserTabsManager.prototype = Object.create(OEX.BrowserTabsManager.prototype);
