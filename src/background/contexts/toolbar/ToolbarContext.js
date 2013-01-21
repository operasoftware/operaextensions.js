
var ToolbarContext = function( isBackground ) {

  OEventTarget.call( this );
  
  this.isBackground = !!isBackground;
  
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
  
  if( this.isBackground ) {
    
    OEX.addEventListener('controlmessage', function(msg) {

      if( !msg.data || !msg.data.action ) {
        return;
      }

      if(msg.data.action == '___O_setup_toolbar_context_REQUEST') {

        if( !this[0] ) {
          
          msg.source.postMessage({
            action: '___O_setup_toolbar_context_RESPONSE',
            data: {
              toolbarUIItem_obj: undefined
            }
          });
          
        } else {
          
          var toolbarItemProps = Object.create( this[0].properties );
          toolbarItemProps.badge = toolbarItemProps.badge.properties;
          toolbarItemProps.popup = toolbarItemProps.popup.properties;

          msg.source.postMessage({
            action: '___O_setup_toolbar_context_RESPONSE',
            data: {
              toolbarUIItem_obj: toolbarItemProps
            }
          });
          
        }

      }

    }.bind(this), false);
  
  }

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
