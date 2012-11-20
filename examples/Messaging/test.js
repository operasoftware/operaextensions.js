
/**
 * Opera API shim test - Messaging API
 *
 * This extension uses the Opera Extension's Messaging API.
 * 
 */

var oex = opera.extension;

oex.addEventListener('connect', function( e ) {
  
  e.source.postMessage( "background -> injected script #1" );
  
}, false);

oex.onmessage = function( msg ) {
  
  console.log( "Received: " + msg.data );
  
  msg.source.postMessage( "background -> injected script #2" );
  
};
