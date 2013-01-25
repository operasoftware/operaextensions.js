
var ToolbarContext = function() {

  OEventTarget.call( this );
  
  this.length = 0;

  // Unfortunately, click events only fire if a popup is not supplied
  // to a registered browser action in Chromium :(
  // http://stackoverflow.com/questions/1938356/chrome-browser-action-click-not-working
  //
  // TODO also invoke clickEventHandler function when a popup page loads
  function clickEventHandler(_tab) {

    if( this[ 0 ] ) {
      this[ 0 ].dispatchEvent( new OEvent('click', {}) );
    }

    // Fire event also on ToolbarContext API stub
    this.dispatchEvent( new OEvent('click', {}) );

  }

  chrome.browserAction.onClicked.addListener(clickEventHandler.bind(this));

};

ToolbarContext.prototype = Object.create( OEventTarget.prototype );

ToolbarContext.prototype.createItem = function( toolbarUIItemProperties ) {
  return new ToolbarUIItem( toolbarUIItemProperties );
};

ToolbarContext.prototype.addItem = function( toolbarUIItem ) {

  if( !toolbarUIItem || !toolbarUIItem instanceof ToolbarUIItem ) {
    return;
  }

  this[ 0 ] = toolbarUIItem;
  this.length = 1;

  toolbarUIItem.resolve(true);
  toolbarUIItem.apply();

  toolbarUIItem.badge.resolve(true);
  toolbarUIItem.badge.apply();

  toolbarUIItem.popup.resolve(true);
  toolbarUIItem.popup.apply();

};

ToolbarContext.prototype.removeItem = function( toolbarUIItem ) {

  if( !toolbarUIItem || !toolbarUIItem instanceof ToolbarUIItem ) {
    return;
  }

  if( this[ 0 ] && this[ 0 ] === toolbarUIItem ) {

    delete this[ 0 ];
    this.length = 0;

    // Disable the toolbar button
    chrome.browserAction.disable();

    toolbarUIItem.dispatchEvent( new OEvent('remove', {}) );

    // Fire event on self
    this.dispatchEvent( new OEvent('remove', {}) );

  }

};
