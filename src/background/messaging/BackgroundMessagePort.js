
var OBackgroundMessagePort = function() {

  OMessagePort.call( this, true );
  
  this._allPorts = [];
  
  chrome.extension.onConnect.addListener(function( _remotePort ) {
  
    var portIndex = this._allPorts.length;
    
    // When this port disconnects, remove _port from this._allPorts
    _remotePort.onDisconnect.addListener(function() {
      
      this._allPorts.splice( portIndex - 1, 1 );
      
      this.fireEvent( new OEvent('disconnect', { "source": _remotePort }) );
      
    }.bind(this));
    
    this._allPorts[ portIndex ] = _remotePort;
    
    _remotePort.onMessage.addListener( function( _message, _sender, responseCallback ) {
      
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
              _remotePort.postMessage( data );
            },
            "tabId": _remotePort.sender && _remotePort.sender.tab ? _remotePort.sender.tab.id : null
          }
        }
      ));

    }.bind(this) );
  
    this.fireEvent( new OEvent('connect', { "source": _remotePort }) );
  
  }.bind(this));
  
};

OBackgroundMessagePort.prototype = Object.create( OMessagePort.prototype );

OBackgroundMessagePort.prototype.broadcastMessage = function( data ) {
  
  for(var i = 0, l = this._allPorts.length; i < l; i++) {
    this._allPorts[ i ].postMessage( data );
  }
  
};
