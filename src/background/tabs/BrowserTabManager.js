
var BrowserTabManager = function( parentObj ) {

  OPromise.call( this );

  // Set up 0 mock BrowserTab objects at startup
  this.length = 0;

  this._focusedTab = null;
  this.__defineGetter__('_lastFocusedTab', function() {
    return this._focusedTab;
  });
  this.__defineSetter__('_lastFocusedTab', function(val) {
    /*if(this == OEX.tabs) {
      console.log( "Focused tab: " + val.url );
    }*/
    this._focusedTab = val;
  });

  this._parent = parentObj;

  // Remove all collection items and replace with browserTabs
  this.replaceTabs = function( browserTabs ) {

    for( var i = 0, l = this.length; i < l; i++ ) {
      delete this[ i ];
    }
    this.length = 0;
    
    if(browserTabs.length <= 0) {
      return;
    }

    for( var i = 0, l = browserTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        browserTabs[ i ].properties.index = i;
      }
      this[ i ] = browserTabs[ i ];
    }
    this.length = browserTabs.length;
    
    // Set focused on first tab object, unless some other tab object has focused=='true'
    var focusFound = false;
    for(var i = 0, l = browserTabs.length; i < l; i++) {
      if(browserTabs[i].properties.active == true) {
        focusFound = true;
        break;
      }
    }
    if(!focusFound) {
      browserTabs[0].focus();
    }

  };

  // Add an array of browserTabs to the current collection
  this.addTab = function( browserTab, startPosition ) {
    // Extract current set of tabs in collection
    var allTabs = [];
        
    for(var i = 0, l = this.length; i < l; i++) {
      allTabs[ i ] = this[ i ];
      if(allTabs[ i ].properties.active == true) {
        focusFound = true;
      }
    }
    
    if(browserTab.properties.active == true) {
      browserTab.focus();
    }
    
    var position = startPosition !== undefined ? startPosition : allTabs.length;
    
    // Add new browserTab to allTabs array
    allTabs.splice(this !== OEX.tabs ? position : this.length, 0, browserTab);

    // Rewrite the current tabs collection in order
    for( var i = 0, l = allTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        // Update all tab indexes to the current tabs collection order
        allTabs[ i ].properties.index = i;
      }
      this[ i ] = allTabs[ i ];
    }
    this.length = allTabs.length;
    
  };

  // Remove a browserTab from the current collection
  this.removeTab = function( browserTab ) {
    
    var oldCollectionLength = this.length;
    
    // Extract current set of tabs in collection
    var allTabs = [];
    var removeTabIndex = -1;
    for(var i = 0, l = this.length; i < l; i++) {
      allTabs[ i ] = this[ i ];
      if( allTabs[ i ].id == browserTab.id ) {
        removeTabIndex = i;
      }
    }

    // Remove browser tab
    if(removeTabIndex > -1) {
      allTabs.splice(removeTabIndex, 1);
    }

    // Rewrite the current tabs collection
    for( var i = 0, l = allTabs.length; i < l; i++ ) {
      if(this !== OEX.tabs) {
        allTabs[ i ].properties.index = i;
      }
      this[ i ] = allTabs[ i ];
    }
    this.length = allTabs.length;
    
    // Remove any ghost items, if any
    if(oldCollectionLength > this.length) {
      for(var i = this.length, l = oldCollectionLength; i < l; i++) {
        delete this[ i ];
      }
    }
    
  };

};

BrowserTabManager.prototype = Object.create( OPromise.prototype );

BrowserTabManager.prototype.create = function( browserTabProperties, before ) {

  if(before && !(before instanceof BrowserTab)) {
    throw new OError(
      "TypeMismatchError",
      "Could not create BrowserTab object. 'before' attribute provided is invalid.",
      DOMException.TYPE_MISMATCH_ERR
    );
  }
  
  // Set parent window to create the tab in

  if(this._parent && this._parent.closed === true ) {
    throw new OError(
      "InvalidStateError",
      "Parent window of the current BrowserTab object is in the closed state and therefore is invalid.",
      DOMException.INVALID_STATE_ERR
    );
  }
  
  browserTabProperties = browserTabProperties || {};
  
  // Remove parameters not allowed from create properties
  /*if(browserTabProperties.closed !== undefined) {
    delete browserTabProperties.closed;
  }
  
  if(browserTabProperties.private !== undefined) {
    delete browserTabProperties.private;
  }*/
  
  var shadowBrowserTab = new BrowserTab( browserTabProperties, this._parent || OEX.windows.getLastFocused() );
  
  // Sanitized tab properties
  browserTabProperties = shadowBrowserTab.properties;
  
  // By default, tab will be created at end of current collection
  shadowBrowserTab.properties.index = browserTabProperties.index = shadowBrowserTab._windowParent.tabs.length;
  
  // no windowId will default to adding the tab to the current window
  browserTabProperties.windowId = this._parent ? this._parent.properties.id : OEX.windows.getLastFocused().properties.id;

  // Set insert position for the new tab from 'before' attribute, if any
  if( before && (before instanceof BrowserTab) ) {

    if( before.closed === true ) {
      throw new OError(
        "InvalidStateError",
        "'before' BrowserTab object is in the closed state and therefore is invalid.",
        DOMException.INVALID_STATE_ERR
      );
    }

    if(before._windowParent && before._windowParent.closed === true ) {
      throw new OError(
        "InvalidStateError",
        "Parent window of 'before' BrowserTab object is in the closed state and therefore is invalid.",
        DOMException.INVALID_STATE_ERR
      );
    }
    browserTabProperties.windowId = before._windowParent ?
                                      before._windowParent.properties.id : browserTabProperties.windowId;
    browserTabProperties.index = before.position;

  }
  
  // Set up tab index on start
  if(this === OEX.tabs) {
    shadowBrowserTab.properties.index = browserTabProperties.index = OEX.windows.getLastFocused().tabs.length;
  }
  
  // Add this object to the end of the current tabs collection
  shadowBrowserTab._windowParent.tabs.addTab(shadowBrowserTab, shadowBrowserTab.properties.index);

  // Add this object to the root tab manager
  OEX.tabs.addTab( shadowBrowserTab );

  // Queue platform action or fire immediately if this object is resolved
  this.enqueue( chrome.tabs.create, browserTabProperties, function( _tab ) {
    
      // Update BrowserTab properties
      for(var i in _tab) {
        if(i == 'url') continue;
        shadowBrowserTab.properties[i] = _tab[i];
      }
    
      // Move this object to the correct position within the current tabs collection
      // (but don't worry about doing this for the global tabs manager)
      // TODO check if this is the correct behavior here
      if(this !== OEX.tabs) {
        this.removeTab( shadowBrowserTab );
        this.addTab( shadowBrowserTab, shadowBrowserTab.properties.index);
      }

      // Resolve new tab, if it hasn't been resolved already
      shadowBrowserTab.resolve(true);

      // Dispatch oncreate event to all attached event listeners
      this.dispatchEvent( new OEvent('create', {
          "tab": shadowBrowserTab,
          "prevWindow": shadowBrowserTab._windowParent, // same as current window
          "prevTabGroup": null,
          "prevPosition": NaN
      }) );

      this.dequeue();

  }.bind(this));

  return shadowBrowserTab;

};

BrowserTabManager.prototype.getAll = function() {

  var allTabs = [];

  for(var i = 0, l = this.length; i < l; i++) {
    allTabs[ i ] = this[ i ];
  }

  return allTabs;

};

BrowserTabManager.prototype.getSelected = function() {

  return this._lastFocusedTab || this[ 0 ];

};
// Alias of .getSelected()
BrowserTabManager.prototype.getFocused = BrowserTabManager.prototype.getSelected;

BrowserTabManager.prototype.close = function( browserTab ) {

  if( !browserTab || !(browserTab instanceof BrowserTab)) {
    throw new OError(
      "TypeMismatchError",
      "Expected browserTab argument to be of type BrowserTab.",
      DOMException.TYPE_MISMATCH_ERR
    );
  }
  
  browserTab.close();

};
