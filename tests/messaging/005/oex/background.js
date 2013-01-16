window.addEventListener( "load", function(){
  if( opera.extension )
  {
    opera.extension.tabs.create({url:"http://www.opera.com/", focused: true});
    MANUAL( "Once a tab is focused, a message will be sent and acknowledgement expected via tab.postMessage ." );
    opera.extension.onmessage = function( event ){
      PASS( "Response received. The event looks like this:\n" + getProperties( event, 0 ) );
    }
    opera.extension.tabs.onfocus = function( event ){
      var tab = opera.extension.tabs.getFocused();
      if( tab ){
        if( tab.postMessage ){
          MANUAL( "Asking the tab to respond." );
          tab.onmessage = function( event ){
            PASS( "TAB SPECIFIC listener: Response received. The event looks like this:\n" + getProperties( event, 0 ) );
          }
          tab.postMessage( "Respond to this immediately" );
        } else {
          MANUAL( "postMessage method not found. The tab object looks like :\n" + getProperties( tab, 0 ) );
        }
      }
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);
