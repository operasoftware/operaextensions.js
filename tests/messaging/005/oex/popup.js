var connectedTo = [];
var responses = 0;
window.addEventListener( "load", function(){
  if( opera.extension )
  {
    opera.extension.tabs.create({url:"http://www.opera.com/"});
    opera.extension.tabs.create({url:"http://www.opera.com/"});
    opera.extension.tabs.create({url:"http://www.opera.com/"});
    MANUAL( "Once all three tabs load, a broadcast will be sent out." );
    opera.extension.onmessage = function( event ){
        if( connectedTo.indexOf(event.source) > -1 ){
          MANUAL( "Response received from a known connected source." );
          responses++;
        } else {
          FAIL( "Response received from an unknown source." );
        }
        if( responses == 3){
          PASS( "Message received from all userJS's. Seems they were contacted correctly." );
        }
    }
    opera.extension.onconnect = function( event ){
        connectedTo.push(event.source);
        if( connectedTo.length  == 3) {
          opera.extension.broadcastMessage( "Reply to this immediately. All of you!" );
          MANUAL( "If 3 responses are not received, then this test fails." );
        }
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);var uri = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%3Cscript%3E"+
"window.addEventListener(%22load%22%2C%20function()%7Bopera.extension.onmessage%20%3D%20function(%20event%20)%7Bevent."+
"source.postMessage(%22Hi%22)%3B%7D%7D%2C%20false)%3B%3C%2Fscript%3E%20%3C%2F"+
"head%3E%20%3Cbody%3E%20%20%3Cp%3E%3C%2Fp%3E%20%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A";
window.addEventListener( "load", function(){
  if( opera.extension )
  {
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: uri
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "Please click on the button to load the popup. Once the popup loads, a broadcast will be sent out." );
    opera.extension.onmessage = function( event ){
      PASS( "Message received from the popup. Seems they were contacted correctly. The event looks like this:\n" + getProperties( event, 0 ) );
    }
    opera.extension.onconnect = function( event ){
      opera.extension.broadcastMessage( "Reply to this immediately!" );
      MANUAL( "The received connect event looks like this:\n" + getProperties( event, 0 ) );
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);var connectedTo = [];
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
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: uri
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "Please click on the button after the tabs finish loading. Once the popup loads, a broadcast will be sent out." );
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
        connectedTo.push(event.source);
        if( connectedTo.length  == 3) {
          opera.extension.broadcastMessage( "Reply to this immediately. All of you!" );
          MANUAL( "If 3 responses are not received, then this test fails. The received connect event looks like this:\n" + getProperties( event, 0 ) );
        }
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);var connectedTo;
window.addEventListener( "load", function(){
  if( opera.extension )
  {
    opera.extension.tabs.create({url:"http://www.opera.com/"});
    MANUAL( "Once the tab loads, a message will be sent and expected back." );
    opera.extension.onmessage = function( event ){
      if( connectedTo == event.source ){
        PASS( "Response received. The event looks like this:\n" + getProperties( event, 0 ) );
      } else {
        FAIL( "Response received from an unknown source. The event looks like this:\n" + getProperties( event, 0 ) );
      }
    }
    opera.extension.onconnect = function( event ){
      connectedTo = event.source;
      event.source.postMessage( "Respond to this immediately!" );
      MANUAL( "If a response is  not received, then this test fails. The received connect event looks like this:\n" + getProperties( event, 0 ) );
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);var connectedTo;
var uri = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%3Cscript%3E"+
"window.addEventListener(%22load%22%2C%20function()%7Bopera.extension.onmessage%20%3D%20function(%20event%20)%7Bevent."+
"source.postMessage(%22Hi%22)%3B%7D%7D%2C%20false)%3B%3C%2Fscript%3E%20%3C%2F"+
"head%3E%20%3Cbody%3E%20%20%3Cp%3E%3C%2Fp%3E%20%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A";
window.addEventListener( "load", function(){
  if( opera.extension )
  {
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: uri
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
      event.source.postMessage( "Respond to this immediately!" );
      MANUAL( "If a response is  not received, then this test fails. The received connect event looks like this:\n" + getProperties( event, 0 ) );
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);window.addEventListener( "load", function(){
  if( opera.extension )
  {
    opera.extension.tabs.create({url:"http://www.opera.com/", selected: true});
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
          tab.postMessage( "Respond to this immediately!" );
        } else {
          MANUAL( "postMessage method not found. The tab object looks like :\n" + getProperties( tab, 0 ) );
        }
      }
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);window.addEventListener( "load", function(){
  if( opera.extension )
  {
    opera.extension.onmessage = function( event ){
      PASS( "Response received. The event looks like this:\n" + getProperties( event, 0 ) );
    }
    opera.extension.postMessage( "Respond to this immediately!" );
    MANUAL( "A message has been sent to the background, a reply should come soon." );
  } else {
    FAIL( "Couldn't find an extension object." );
  }
}, false);window.addEventListener( "load", function(){
  if( opera.extension )
  {
    var channel = new MessageChannel();
    channel.port1.onmessage = function( event ){
      PASS( "Response received. The event looks like this:\n" + getProperties( event, 0 ) );
    }
    opera.extension.postMessage( "Respond to this immediately!", [channel.port2] );
    MANUAL( "A port has been sent to the background, a reply should come soon." );
  } else {
    FAIL( "Couldn't find an extension object." );
  }
}, false);var uri = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%3Cscript%3E%0D%0Awindow.addEventListener(%20%22load%22%2C%20function()%7B%0D%0A%20%20if(%20opera.extension%20)%0D%0A%20%20%7B%0D%0A%20%20%20%20opera.extension.onmessage%20%3D%20function(%20event%20)%7B%0D%0A%20%20%20%20%20%20opera.postError(%20%22Response%20received.%20%22%20)%3B%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20opera.";
uri += "extension.postMessage(%20%22Respond%20to%20this%20immediately!%22%20)%3B%0D%0A%20%20%20%20opera.postError(%20%22A%20message%20has%20been%20sent%20to%20the%20background%2C%20a%20reply%20should%20come%20soon.%22%20)%3B%0D%0A%20%20%7D%20else%20%7B%0D%0A%20%20%20%20opera.postError(%20%22Couldn't%20find%20an%20opera.extension%20object.%22%20)%3B%0D%0A%20%20%7D%0D%0A%7D%2C%20false)%3B%0D%0A%3C%2Fscript%3E%3C%2Fhead%3E%3Cbody%3ESee%20console%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A";
window.addEventListener( "load", function(){
  if( opera.extension )
  {
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: uri
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
}, false);var uri = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%3Cscript%3E%0D%0Awindow.addEventListener(%20%22load%22%2C%20function()%7B%0D%0A%20%20if(%20opera.extension%20)%0D%0A%20%20%7B%0D%0A%20%20%20%20var%20channel%20%3D%20new%20MessageChannel()%3B%0D%0A%20%20%20%20channel.port1.";uri += "onmessage%20%3D%20function(%20event%20)%7B%0D%0A%20%20%20%20%20%20opera.postError(%20%22Response%20received%22%20)%3B%0D%0A%20%20%20%20%7D%0D%0A%20%20%20%20opera.extension.postMessage(%20%22Respond%20to%20this%20immediately%22%2C%20%5Bchannel.port2%5D%20)%3B%0D%0A%20%20%20%20opera.postError(%20%22A%20message%20has%20been%20sent%20to%20the%20background%2C%20a%20reply%20should%20come%20soon.%22%20)%3B%0D%0A%20%20%7D%20else%20%7B%0D%0A%20%20%20%20opera.";uri +=  "postError(%20%22Couldn't%20find%20an%20opera.extension%20object.%22%20)%3B%0D%0A%20%20%7D%0D%0A%7D%2C%20false)%3B%0D%0A%3C%2Fscript%3E%3C%2Fhead%3E%3Cbody%3ESee%20console%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A";window.addEventListener( "load", function(){  if( opera.extension )  {    var UIItemProperties = {      disabled: false,      title: "EXTENSION_NAME",      icon: "icon.png",      popup: {        href: uri      }    }    theButton = opera.contexts.toolbar.createItem( UIItemProperties );    opera.contexts.toolbar.addItem( theButton );    MANUAL( "Please click on the button to load the popup. Once the popup loads, it will contact the background." );    opera.extension.onmessage = function( event ){      if( event.ports ){        MANUAL( "Responding to port" );        event.ports[0].postMessage( "Hi" );      } else {        MANUAL( "Responding to source" );        event.source.postMessage( "Hi" );      }    }  } else {    FAIL( "Couldn't find an opera.extension object." );  }}, false);var uri = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%3Cscript%3E%0D%0Awindow.addEventListener(%20%22load%22%2C%20function(%20event%20)%7B%0D%0A%20%20try%7B%0D%0A%20%20%20%20var%20useExt%20%3D%20extension%3B%0D%0A%20%20%7D%20catch(e)%20%7B%0D%0A%20%20%20%20var%20useExt%20%3D%20opera.extension%3B%0D%0A%20%20%7D%0D%0A%20%20if(%20useExt%20)%7B%0D%0A%20%20%20%20if(%20useExt.tabs%20)%20useExt.tabs.create(%7Burl%3A%22http%3A%2F%2Fwww.opera.com%2F%22%7D)%3B%0D%0A%20%20%20%20useExt.onmessage%20%3D%20function(%20event%20)%7B%0D%0A%20%20%20%20%20%20opera.postError(%20%22Event%20received%20by%20the%20helper%20from%20%22%20%2B%20event.origin%20)%3B%0D%0A%20%20%20%20%20%20if(%20event.ports%20)%7B%0D%0A%20%20%20%20%20%20%20%20opera.postError(%20%22Responding%20to%20port.%20Ports%20are%3A%5Cn%22%20)%3B%0D%0A%20%20%20%20%20%20%20%20event.ports%5B0%5D.postMessage(%20%22Hi%22%20)%3B%0D%0A%20%20%20%20%20%20%7D%20else%20if(event.source)";
uri += "%7B%0D%0A%20%20%20%20%20%20%20%20opera.postError(%20%22Responding%20to%20source%22%20)%3B%0D%0A%20%20%20%20%20%20%20%20event.source.postMessage(%20%22Hi%22%20)%3B%0D%0A%20%20%20%20%20%20%7D%20else%20%7B%0D%0A%20%20%20%20%20%20%20%20opera.postError(%20%22Unable%20to%20use%20event.source%2C%20trying%20(opera)extension.postMessage.%22%20)%3B%0D%0A%20%20%20%20%20%20%20%20useExt.postMessage(%22heyhey%22)%3B%0D%0A%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%7D%0D%0A%20%20%7D%20else%20%7B%0D%0A%20%20%20%20opera.postError(%20%22Couldn't%20find%20an%20extension%20or%20opera.extension%20object.%22%20)%3B%0D%0A%20%20%7D%0D%0A%7D%2C%20false)%3B%3C%2Fscript%3E%3C%2Fhead%3E%3Cbody%3E%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A";
var port;
window.addEventListener( "load", function(){
  if( opera.extension )
  {
    opera.extension.tabs.create({url:"http://www.opera.com/"});
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: uri
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    opera.extension.onmessage = function( event ){
      if( event.ports ){
        MANUAL( "Storing port" );
        port = event.ports[0];
      } else {
        MANUAL( "Storing source" );
        port = event.source;
      }
      MANUAL( "Please click on the button to load the popup. Once the popup loads, the background will forward it a port to the userJS." );
    }
    opera.extension.onconnect = function( event ){
      MANUAL( "received onconnect from "  + event.origin);
      if( port ){
        event.source.postMessage( "Respond to the port!", [port] );
        MANUAL( "userJS should receive a message from the popup now. The received connect event looks like this:\n" + getProperties( event, 0 ) );
      }
    }
  } else {
    FAIL( "Couldn't find an opera.extension object." );
  }
}, false);window.addEventListener( "load", function(){
  window.opera.postError("userjs just being present...");
}, false);window.addEventListener( "load", function( event ){
  if( opera.extension ){
    if( opera.extension.tabs ) opera.extension.tabs.create({url:"http://www.opera.com/"});
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
}, false);window.addEventListener( "load", function(){
  if( opera.extension )
  {
    var channel = new MessageChannel();
    channel.port1.onmessage = function( event ){
      PASS( "Response received. The event looks like this:\n" + getProperties( event, 0 ) );
    }
    opera.extension.postMessage( "Respond to this immediately!", [channel.port2] );
    MANUAL( "A port has been sent to the background, a reply should come soon." );
  } else {
    FAIL( "Couldn't find an extension object." );
  }
}, false);