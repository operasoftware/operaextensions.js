
var OMessagePort = function( isBackground ) {

  OEventTarget.call( this );

  this._isBackground = isBackground || false;

  this._localPort = null;

  // Every process, except the background process needs to connect up ports
  if( !this._isBackground ) {

    this._localPort = chrome.extension.connect({ "name": ("" + Math.floor( Math.random() * 1e16)) });

    this._localPort.onDisconnect.addListener(function() {

      this.dispatchEvent( new OEvent( 'disconnect', { "source": this._localPort } ) );

      this._localPort = null;

    }.bind(this));

    var onMessageHandler = function( _message, _sender, responseCallback ) {

      var localPort = this._localPort;

      if(_message && _message.action && _message.action.indexOf('___O_') === 0) {

        // Fire controlmessage events *immediately*
        this.dispatchEvent( new OEvent(
          'controlmessage',
          {
            "data": _message,
            "source": {
              postMessage: function( data ) {
                localPort.postMessage( data );
              },
              "tabId": _sender && _sender.tab ? _sender.tab.id : null
            }
          }
        ) );

      } else {

        // Fire 'message' event once we have all the initial listeners setup on the page
        // so we don't miss any .onconnect call from the extension page.
        // Or immediately if the shim isReady
        addDelayedEvent(this, 'dispatchEvent', [ new OEvent(
          'message',
          {
            "data": _message,
            "source": {
              postMessage: function( data ) {
                localPort.postMessage( data );
              },
              "tabId": _sender && _sender.tab ? _sender.tab.id : null
            }
          }
        ) ]);

      }

      if(responseCallback)responseCallback({});

    }.bind(this);

    this._localPort.onMessage.addListener( onMessageHandler );
    chrome.extension.onMessage.addListener( onMessageHandler );


    // Fire 'connect' event once we have all the initial listeners setup on the page
    // so we don't miss any .onconnect call from the extension page
    addDelayedEvent(this, 'dispatchEvent', [ new OEvent('connect', { "source": this._localPort }) ]);

  }

};

OMessagePort.prototype = Object.create( OEventTarget.prototype );

OMessagePort.prototype.postMessage = function( data ) {

  if( !this._isBackground ) {
    if(this._localPort) {

      this._localPort.postMessage( data );

    }
  } else {

    this.broadcastMessage( data );

  }

};
