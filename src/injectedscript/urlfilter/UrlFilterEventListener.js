
var UrlFilterEventListener = function() {

  OEventTarget.call(this);

  this.pageSrcElementsPointers = {};
  this.pageSrcElements = {};

  // Catch resource load failures and reconcile with incoming event messages from background
  this.grabPageElements = function() {

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

  };

  this.dispatchURLFilterEvent = function( type, data ) {

    // get a set of the latest page elements
    this.pageSrcElements = {};
    this.grabPageElements.call(this);

    type = type + ""; // force 'type' to string
    data = data || { 'url': 'null' };

    var key = global.encodeURIComponent( (data.url).split('#')[0] );

    if( this.pageSrcElements[ key ] == undefined || this.pageSrcElements[ key ] == null ) {

      // Fire 1 basic event on this object
      this.dispatchEvent( new OEvent(type, data) );

    } else {

      for(var i = 0, l = this.pageSrcElements[ key ].length; i < l; i++) {

        var evtData = data;

        // Reconcile element from provided event url
        evtData.element = this.pageSrcElements[ key ][ i ];

        // Re-write correct URL for event
        evtData.url = evtData.element ? evtData.element.origUrl : evtData.url;

        // Fire event on this object
        this.dispatchEvent( new OEvent(type, evtData) );

      }

      this.pageSrcElements[ key ] = [];

    }

  }

  // listen for URL Filter block/unblock/allowed events sent from the background
  // process and fire in this content script

  OEX.addEventListener('controlmessage', function( msg ) {

    if( !msg.data || !msg.data.action || !msg.data.data ) {
      return;
    }

    switch( msg.data.action ) {

      // Set up all storage properties
      case '___O_urlfilter_contentblocked':

        this.dispatchURLFilterEvent.call(this, 'contentblocked', msg.data.data)

        break;

      case '___O_urlfilter_contentunblocked':

        this.dispatchURLFilterEvent.call(this, 'contentunblocked', msg.data.data)

        break;

      case '___O_urlfilter_contentallowed':

        this.dispatchURLFilterEvent.call(this, 'contentallowed', msg.data.data)

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
