
var OMessagePort = function( isBackground ) {

  OPromise.call( this );
  
  this._isBackground = isBackground || false;
  
  this._localPort = null;
  
  // Every process, except the background process needs to connect up ports
  if( !this._isBackground ) {
    
    this._localPort = chrome.extension.connect({ "name": ("" + Math.floor( Math.random() * 1e16)) });
    
    this._localPort.onDisconnect.addListener(function() {
    
      this.fireEvent( new OEvent( 'disconnect', { "source": this._localPort } ) );
      
      this._localPort = null;
      
    }.bind(this));
    
    this._localPort.onMessage.addListener( function( _message, _sender, responseCallback ) {

      var messageType = 'message';
      if(_message && _message.action && _message.action.indexOf('___O_') === 0) {
        messageType = 'controlmessage';
      }

      this.fireEvent( new OEvent(
        messageType, 
        { 
          "data": _message,
          "source": {
            postMessage: function( data ) {
              this._localPort.postMessage( data );
            },
            "tabId": _sender && _sender.tab ? _sender.tab.id : null
          }
        }
      ));

    }.bind(this) );

    // Fire 'connect' event once we have all the initial listeners setup on the page
    // so we don't miss any .onconnect call from the extension page
    global.addEventListener('load', function() {
      this.fireEvent( new OEvent('connect', { "source": this._localPort }) );
    }.bind(this), false);
    
  }
  
};

OMessagePort.prototype = Object.create( OPromise.prototype );

OMessagePort.prototype.postMessage = function( data ) {
  
  if( !this._isBackground ) {
    if(this._localPort) {
      
      this._localPort.postMessage( data );
      
    }
  } else {
    
    this.broadcastMessage( data );
        
  }
  
};
