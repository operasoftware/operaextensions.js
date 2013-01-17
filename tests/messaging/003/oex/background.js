opera.isReady(function(){
    var connectedTo;
    window.addEventListener( "load", function(){
	if( opera.extension ) {
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
		event.source.postMessage( "Respond to this immediately" );
		MANUAL( "If a response is  not received, then this test fails. The received connect event looks like this:\n" + getProperties( event, 0 ) );
	    }
	} else {
	    FAIL( "Couldn't find an opera.extension object." );
	}
    }, false);
});