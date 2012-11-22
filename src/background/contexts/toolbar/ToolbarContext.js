
OEC.ToolbarContext = function() {
  
  OPromise.call( this );
  
  // we shouldn't need this on this object since it is never checked 
  // and nothing is enqueued
  // (we need OPromise for its event handling capabilities only)
  this.resolve();
  
  // Unfortunately, click events only fire if a popup is not supplied 
  // to a registered browser action in Chromium :(
  // http://stackoverflow.com/questions/1938356/chrome-browser-action-click-not-working
  //
  // TODO also invoke clickEventHandler function when a popup page loads
  function clickEventHandler(_tab) {
    
    if( this[ 0 ] ) {
      this[ 0 ].fireEvent( new OEvent('click', {}) );
    }
    
    // Fire event also on ToolbarContext API stub
    this.fireEvent( new OEvent('click', {}) );
    
  }
  
  chrome.browserAction.onClicked.addListener(clickEventHandler.bind(this));
  
};

OEC.ToolbarContext.prototype = Object.create( OPromise.prototype );

OEC.ToolbarContext.prototype.createItem = function( toolbarUIItemProperties ) {
  return new ToolbarUIItem( toolbarUIItemProperties );
};

OEC.ToolbarContext.prototype.addItem = function( toolbarUIItem ) {
  
  if( !toolbarUIItem || !(toolbarUIItem instanceof ToolbarUIItem) ) {
    return;
  }

  this[ 0 ] = toolbarUIItem;
  this.length = 1;

  toolbarUIItem.resolve();
  
  toolbarUIItem.badge.resolve();
  toolbarUIItem.popup.resolve();
  
  // Enable the toolbar button
  chrome.browserAction.enable();

};

OEC.ToolbarContext.prototype.removeItem = function( toolbarUIItem ) {

  if( !toolbarUIItem || !(toolbarUIItem instanceof ToolbarUIItem) ) {
    return;
  }

  if( this[ 0 ] && this[ 0 ] === toolbarUIItem ) {
    
    delete this[ 0 ];
    this.length = 0;

    // Disable the toolbar button
    chrome.browserAction.disable();
  
    toolbarUIItem.fireEvent( new OEvent('remove', {}) );
  
    // Fire event on self
    this.fireEvent( new OEvent('remove', {}) );
  
  }

};
