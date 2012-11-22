
/**
 * Opera API shim test - Messaging API
 *
 * This extension uses the Opera Extension's Messaging API.
 * 
 */

window.setTimeout(function() {

  var oex = opera.extension;
  
  // NOTE: this will NOT grab a screenshot of any chrome:// page
  // (including Chromium's Extensions Manager page or New Tab)
  // so quickly look at another page for 4 seconds and then
  // come back to the Extension's Manager, view the console log 
  // and see that this has worked.
  
  oex.tabs.getSelected().getScreenshot( function( imageData ) {
  
    opera.postError( "Screenshot captured..." );
    console.log( imageData );

  });

}, 4000);