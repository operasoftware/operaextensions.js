opera.isReady(function() {
  
  // Send and receive messages to/from the background process

  opera.extension.onconnect = function() {

    console.log("Injected Script messaging channel connected.");

  };

  opera.extension.onmessage = function( msg ) {
  
    console.log( msg.data );
  
    if( msg.data === "background -> injected script #1" ) {
      opera.extension.postMessage( 'injected script -> extension #1' );
    }
  
  };

});
