opera.isReady(function(){
    var port;
    window.addEventListener( "load", function(){
      if( opera.extension )
      {
        opera.extension.tabs.create({url:"http://www.opera.com/"});
        var UIItemProperties = {
          disabled: false,
          title: "010 - userjs back port popup",
          icon: "oex/icon.png",
          popup: {
            href: "oex/popup.html"
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        opera.extension.onmessage = function( event ){
          if( event.ports ){
            MANUAL( "Storing port" );
            port = event.ports[0];
          } else {
            MANUAL( "Storing source" );
            port = event.source;
          }
          MANUAL( "Please click on the button to load the popup. Once the popup loads, the background will forward it a port to the userJS." );
        }
        opera.extension.onconnect = function( event ){
          MANUAL( "received onconnect from "  + event.origin);
          if( port ){
            event.source.postMessage( "Respond to the port", [port] );
            MANUAL( "userJS should receive a message from the popup now. The received connect event looks like this:\n" + getProperties( event, 0 ) );
          }
        }
      } else {
        FAIL( "Couldn't find an opera.extension object." );
      }
    }, false);
});