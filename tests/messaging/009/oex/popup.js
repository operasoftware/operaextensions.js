opera.isReady(function(){
    window.addEventListener( "load", function(){

      if( opera.extension )

      {

        var channel = new MessageChannel();

        channel.port1.onmessage = function( event ){

          opera.postError( "Response received" );

        }

        opera.extension.postMessage( "Respond to this immediately", [channel.port2] );

        opera.postError( "A message has been sent to the background, a reply should come soon." );

      } else {

        opera.postError( "Couldn't find an opera.extension object." );

      }

    }, false);
});