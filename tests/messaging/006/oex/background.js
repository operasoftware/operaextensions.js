opera.isReady(function(){
    window.addEventListener( "load", function( event ){
      if( opera.extension ){
        if( opera.extension.tabs ){opera.extension.tabs.create({url:"http://www.opera.com/"});}
        opera.extension.onmessage = function( event ){
          MANUAL( "Event received by the helper from " + event.origin );

          if( event.ports ){
            MANUAL( "Responding to port. Ports are:\n" + getProperties( event.ports, 2 ) );
            event.ports[0].postMessage( "Hi" );
          } else if(event.source){
            MANUAL( "Responding to source" );
            event.source.postMessage( "Hi" );
          } else {
            MANUAL( "Unable to use event.source, trying opera.extension.postMessage." );
            opera.extension.postMessage("heyhey");
          }
        }
      } else {
        FAIL( "Couldn't find an extension or opera.extension object." );
      }
    }, false);
});