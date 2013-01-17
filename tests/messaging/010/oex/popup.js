opera.isReady(function(){
window.addEventListener( "load", function( event ){

  try{

    var useExt = extension;

  } catch(e) {

    var useExt = opera.extension;

  }

  if( useExt ){

    if( useExt.tabs ){useExt.tabs.create({url:"http://www.opera.com/"});}

    useExt.onmessage = function( event ){

      opera.postError( "Event received by the helper from " + event.origin );

      if( event.ports ){

        opera.postError( "Responding to port. Ports are:\n" );

        event.ports[0].postMessage( "Hi" );

      } else if(event.source){

        opera.postError( "Responding to source" );

        event.source.postMessage( "Hi" );

      } else {

        opera.postError( "Unable to use event.source, trying (opera)extension.postMessage." );

        useExt.postMessage("heyhey");

      }

    }

  } else {

    opera.postError( "Couldn't find an extension or opera.extension object." );

  }

}, false);
});