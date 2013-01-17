opera.isReady(function(){
    var connectedTo;
    var uri = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%3Cscript%3E"+
    "window.addEventListener(%22load%22%2C%20function()%7Bopera.extension.onmessage%20%3D%20function(%20event%20)%7Bevent."+
    "source.postMessage(%22Hi%22)%3B%7D%7D%2C%20false)%3B%3C%2Fscript%3E%20%3C%2F"+
    "head%3E%20%3Cbody%3E%20%20%3Cp%3E%3C%2Fp%3E%20%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A";

    window.addEventListener( "load", function(){
      if( opera.extension )
      {
        var UIItemProperties = {
          disabled: false,
          title: "004 - back connect popup",
          icon: "oex/icon.png",
          popup: {
            href: 'oex/popup.html'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "Please click on the button to load the popup. Once the popup loads, it will be postMessaged." );
        opera.extension.onmessage = function( event ){
          if( connectedTo == event.source ){
            PASS( "Response received. The event looks like this:\n" + getProperties( event, 0 ) );
          } else {
            FAIL( "Response received from an unknown source. The event looks like this:\n" + getProperties( event, 0 ) );
          }
        }
        opera.extension.onconnect = function( event ){
          connectedTo = event.source;
          event.source.postMessage( "Respond to this immediately" );
          MANUAL( "If a response is  not received, then this test fails. The received connect event looks like this:\n" + getProperties( event, 0 ) );
        }
      } else {
        FAIL( "Couldn't find an opera.extension object." );
      }
    }, false);
});