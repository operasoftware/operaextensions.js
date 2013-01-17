opera.isReady(function(){
    window.addEventListener( "load", function(){
      if( opera.extension )
      {
        var UIItemProperties = {
          disabled: false,
          title: "009 - popup back port",
          icon: "icon.png",
          popup: {
            href: "oex/popup.html"
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "Please click on the button to load the popup. Once the popup loads, it will contact the background." );
        opera.extension.onmessage = function( event ){
          if( event.ports ){
            MANUAL( "Responding to port" );
            event.ports[0].postMessage( "Hi" );
          } else {
            MANUAL( "Responding to source" );
            event.source.postMessage( "Hi" );
          }
        }
      } else {
        FAIL( "Couldn't find an opera.extension object." );
      }
    }, false);
});