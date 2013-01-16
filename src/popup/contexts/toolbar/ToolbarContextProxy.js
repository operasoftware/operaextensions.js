
var ToolbarContextProxy = function() {

  ToolbarContext.call( this, false );
  
  // Set up the current toolbarUIItem from the background process, if any
  OEX.addEventListener('controlmessage', function(msg) {

    if( !msg.data || !msg.data.action ) {
      return;
    }

    if( msg.data.action == '___O_setup_toolbar_context_RESPONSE' ) {

      if(msg.data.data.toolbarUIItem_obj !== undefined && msg.data.data.toolbarUIItem_obj !== null) {
        // Setup the toolbarUIItem object
        this[0] = new ToolbarUIItem( msg.data.data.toolbarUIItem_obj );
        this.length = 1;
      }

      // Set TOOLBAR_CONTEXT_LOADED feature to LOADED
      deferredComponentsLoadStatus['TOOLBAR_CONTEXT_LOADED'] = true;

    }

  }.bind(this), false);

  OEX.postMessage({
    action: '___O_setup_toolbar_context_REQUEST',
    data: {}
  });

};

ToolbarContextProxy.prototype = Object.create( ToolbarContext.prototype );
