
var UrlFilterEventListener = function() {

  OEventTarget.call(this);
  
  this.pageSrcElementsPointers = {};
  this.pageSrcElements = {};
  
  // Catch resource load failures and reconcile with incoming event messages from background
  global.addEventListener('load', function(evt) {

    // Catch static HTML elements that load external content via 'src' tag: 
    // SCRIPT (script), IMAGE (img, image), STYLESHEET (link rel='stylesheet'), 
    // OBJECT (object, embed), SUB-DOCUMENT (iframe), MEDIA (audio, video),
    // OTHER (e.g. but not limited to: input, textarea, etc)
    var els = global.document.querySelectorAll("[src],link[rel='stylesheet'][href],object[data],body[background]");
    
    for(var i = 0, l = els.length; i < l; i++) {
      var url = els[ i ].src || els[ i ].href || els[ i ].data || els[ i ].background;
      
      // keep track of the full URL
      els[i].origUrl = url;
      
      var key = global.encodeURIComponent( url.split('#')[0] );
      
      if(this.pageSrcElements[ key ] === undefined ) {
        this.pageSrcElements[ key ] = [];
      }
      this.pageSrcElements[ key ].push( els[i] );
    }
    
  }.bind(this), false);
  
  /*Object.defineProperty(this, 'matchUrlToInPageElement', {
    enumerable: false,  
    configurable: false, 
    writable: false, 
    value: function( url ) {
      // Strip # seperator from URL (since it is not provided as part of any blocked path URL)
      url = url.split("#")[0];
      
      var key = global.encodeURIComponent( url );
      var pos = this.pageSrcElementsPointers[key];
      
      if( pos === undefined ) {
        pos = this.pageSrcElementsPointers[key] = 0;
      }
    
      if( this.pageSrcElements[key] !== undefined && this.pageSrcElements[key].length > 0 ) {
      
        var el = this.pageSrcElements[key][pos];
        
        if(this.pageSrcElements[key].length > pos) {
          pos = this.pageSrcElementsPointers[key] += 1;
        }
      
        return el;
      
      } 
    
      return undefined; // default, not found
    }
  });*/

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
      
        var key = global.encodeURIComponent( (msg.data.data.url).split('#')[0] );
        
        if( this.pageSrcElements[ key ] == undefined || this.pageSrcElements[ key ] == null ) {
          
          // Fire 1 basic contentblocked event on this object
          this.dispatchEvent( new OEvent('contentblocked', msg.data.data) );
          
        } else {
      
          for(var i = 0, l = this.pageSrcElements[ key ].length; i < l; i++) {
        
            var evtData = msg.data.data;

            // Reconcile element from blocked url
            evtData.element = this.pageSrcElements[ key ][ i ];
            
            // Re-write correct URL for contentblocked event
            evtData.url = evtData.element ? evtData.element.origUrl : evtData.url;

            // Fire contentblocked event on this object
            this.dispatchEvent( new OEvent('contentblocked', evtData) );
          
          }
          
          this.pageSrcElements[ key ] = [];
        
        }

        break;

      case '___O_urlfilter_contentunblocked':
      
        var key = global.encodeURIComponent( (msg.data.data.url).split('#')[0] );
      
        if( this.pageSrcElements[ key ] == undefined || this.pageSrcElements[ key ] == null ) {
        
          // Fire 1 basic contentblocked event on this object
          this.dispatchEvent( new OEvent('contentunblocked', msg.data.data) );
        
        } else {
    
          for(var i = 0, l = this.pageSrcElements[ key ].length; i < l; i++) {
      
            var evtData = msg.data.data;

            // Reconcile element from blocked url
            evtData.element = this.pageSrcElements[ key ][ i ];
          
            // Re-write correct URL for contentblocked event
            evtData.url = evtData.element ? evtData.element.origUrl : evtData.url;

            // Fire contentblocked event on this object
            this.dispatchEvent( new OEvent('contentunblocked', evtData) );
        
          }
          
          this.pageSrcElements[ key ] = [];
      
        }

        break;
        
      case '___O_urlfilter_contentallowed':
      
        var key = global.encodeURIComponent( (msg.data.data.url).split('#')[0] );
      
        if( this.pageSrcElements[ key ] == undefined || this.pageSrcElements[ key ] == null ) {
        
          // Fire 1 basic contentblocked event on this object
          this.dispatchEvent( new OEvent('contentallowed', msg.data.data) );
        
        } else {
    
          for(var i = 0, l = this.pageSrcElements[ key ].length; i < l; i++) {
      
            var evtData = msg.data.data;

            // Reconcile element from blocked url
            evtData.element = this.pageSrcElements[ key ][ i ];
          
            // Re-write correct URL for contentblocked event
            evtData.url = evtData.element ? evtData.element.origUrl : evtData.url;

            // Fire contentblocked event on this object
            this.dispatchEvent( new OEvent('contentallowed', evtData) );
        
          }
          
          this.pageSrcElements[ key ] = [];
      
        }

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
