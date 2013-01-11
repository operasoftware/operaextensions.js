
var UrlFilterEventListener = function() {

  OEventTarget.call(this);
  
  this.pageSrcElements = {};
  
  // Catch resource load failures and reconcile with incoming event messages from background
  global.addEventListener('load', function(evt) {

    // Catch static HTML elements that load external content via 'src' tag: 
    // SCRIPT (script), IMAGE (img, image), STYLESHEET (link rel='stylesheet'), 
    // OBJECT (object, embed), SUB-DOCUMENT (iframe), MEDIA (audio, video),
    // OTHER (e.g. but not limited to: input, textarea, etc)
    var els = global.document.querySelectorAll("[src],link[rel='stylesheet'][href],object[data]");
    
    for(var i = 0, l = els.length; i < l; i++) {
      var key = els[ i ].src || els[ i ].href || els[ i ].data;
      
      if(this.pageSrcElements[ key ] === undefined ) {
        this.pageSrcElements[ key ] = [];
      }
      this.pageSrcElements[ key ].push( els[i] );
    }
    
  }.bind(this), false);
  
  this.matchUrlToInPageElement = function( url ) {
    if( this.pageSrcElements[url] !== undefined && this.pageSrcElements[url].length > 0 ) {
      
      return this.pageSrcElements[url].shift();
      
    } 
    
    return undefined; // default, not found
  }

  // listen for block events sent from the background process
  // and fire in this content script

  OEX.addEventListener('controlmessage', function( msg ) {

    if( !msg.data || !msg.data.action ) {
      return;
    }
    
    msg.data.data = msg.data.data || {};
    
    switch( msg.data.action ) {

      // Set up all storage properties
      case '___O_urlfilter_contentblocked':
        
        // Reconcile element from blocked url
        msg.data.data.element = this.matchUrlToInPageElement(msg.data.data.url);

        // Fire contentblocked event on this object
        this.dispatchEvent( new OEvent('contentblocked', msg.data.data) );

        break;

      case '___O_urlfilter_contentunblocked':
      
        // Reconcile element from unblocked url
        msg.data.data.element = this.matchUrlToInPageElement(msg.data.data.url);

        // Fire contentunblocked event on this object
        this.dispatchEvent( new OEvent('contentunblocked', msg.data.data) );

        break;
        
      case '___O_urlfilter_contentallowed':
      
        // Reconcile element from allowed url
        msg.data.data.element = this.matchUrlToInPageElement(msg.data.data.url);

        // Fire contentallowed event on this object
        this.dispatchEvent( new OEvent('contentallowed', msg.data.data) );

        break;
    }

  }.bind(this));
  
};

UrlFilterEventListener.prototype = Object.create( OEventTarget.prototype );

// Override
UrlFilterEventListener.prototype.addEventListener = function(eventName, callback, useCapture) {
  eventName = (eventName + "").toLowerCase(); // force to lower case string
  
  this.on(eventName, callback); // no useCapture

  // Trigger delivery of URLFilter events from the background process
  addDelayedEvent(OEX, 'postMessage', [
    { 'action': '___O_urlfilter_DRAINQUEUE', 'eventType': eventName }
  ]);

};
