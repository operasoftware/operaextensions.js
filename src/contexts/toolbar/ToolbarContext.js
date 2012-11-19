
OEC.ToolbarContext = function() {
  
  OEX.Promise.call( this );
  
  // we shouldn't need this on this object since it is never checked 
  // and nothing is enqueued
  // (we need OEX.Promise for its event handling capabilities only)
  this.resolve(); 
  
};

OEC.ToolbarContext.prototype = Object.create( OEX.Promise.prototype );

OEC.ToolbarContext.prototype.createItem = function( toolbarUIItemProperties ) {
  return new ToolbarUIItem( toolbarUIItemProperties );
};

OEC.ToolbarContext.prototype.addItem = function( toolbarUIItem ) {

  toolbarUIItem.resolve();
  
  toolbarUIItem.badge.resolve();
  toolbarUIItem.popup.resolve();
  
  // Enable the toolbar button
  chrome.browserAction.enable();

};

OEC.ToolbarContext.prototype.removeItem = function( toolbarUIItem ) {

  // Disable the toolbar button
  chrome.browserAction.disable();
  
  toolbarUIItem.fireEvent( new OEX.Event('remove', {}) );
  
  // Fire event on self
  OEC.toolbar.fireEvent( new OEX.Event('remove', {}) );

};
