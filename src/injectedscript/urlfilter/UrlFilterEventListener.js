
var UrlFilterEventListener = function() {
  
  OEventTarget.call(this);
  
  // listen for block events sent from the background process 
  // and fire in this content script
  
  OEX.addEventListener('controlmessage', function( msg ) {
    
    if( !msg.data || !msg.data.action ) {
      return;
    }
    
    switch( msg.data.action ) {
      
      // Set up all storage properties
      case '___O_urlfilter_contentblocked':
      
        // Fire contentblocked event on this object
        console.log("Some content has been blocked!")
        this.dispatchEvent( new OEvent('contentblocked', {}) );
        
        break;
        
      case '___O_urlfilter_contentunblocked':
      
        // Fire contentunblocked event on this object
        this.dispatchEvent( new OEvent('contentunblocked', {}) );
      
        break;
    }
    
  });
  
};

UrlFilterEventListener.prototype = Object.create( OEventTarget.prototype );

// Override
UrlFilterEventListener.prototype.addEventListener = function(eventName, callback, useCapture) {
  this.on(eventName, callback); // no useCapture
  
  // Trigger delivery of URLFilter events from background process
  OEX.postMessage({
    'action': '___O_urlfilter_drainQueue'
  });
};
