opera.isReady(function(){
    var connectedTo = [];
    var responses = 0;
    var uri = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%3Cscript%3E"+
    "window.addEventListener(%22load%22%2C%20function()%7Bopera.extension.onmessage%20%3D%20function(%20event%20)%7Bevent."+
    "source.postMessage(%22Hi%22)%3B%7D%7D%2C%20false)%3B%3C%2Fscript%3E%20%3C%2F"+
    "head%3E%20%3Cbody%3E%20%20%3Cp%3E%3C%2Fp%3E%20%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A";
    window.addEventListener( "load", function(){
      if( opera.extension )
      {
        opera.extension.tabs.create({url:"http://www.opera.com/"});
        opera.extension.tabs.create({url:"http://www.opera.com/"});
        opera.extension.tabs.create({url:"data:text/html,Please click on the button after the tabs finish loading. Once the popup loads, a broadcast will be sent out.", focused: true} );

        var UIItemProperties = {
          disabled: false,
          title: "002 - back broadCast both",
          icon: "./oex/icon.png",
          popup: {
            href: "./oex/popup.html"
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );

        opera.extension.onmessage = function( event ){
            if( connectedTo.indexOf(event.source) > -1 ){
              MANUAL( "Response received from a known connected source. The event looks like this:\n" + getProperties( event, 0 ) );
              responses++;
            } else {
              FAIL( "Response received from an unknown source. The event looks like this:\n" + getProperties( event, 0 ) );
            }
            if( responses == 3){
              PASS( "Message received from all userJS's. Seems they were contacted correctly. The event looks like this:\n" + getProperties( event, 0 ) );

            }
        }

        opera.extension.onconnect = function( event ){
    	console.log(event.source);
            connectedTo.push(event.source);
            if( connectedTo.length  == 3) {
              opera.extension.broadcastMessage( "Reply to this immediately. All of you!" );
              MANUAL( "If 3 responses are not received, then this test fails. The received connect event looks like this:\n" + getProperties( event, 0 ) );
            }
        }
      } else {
        FAIL( "Couldn't find an opera.extension object." );
      }
    }, false);
});