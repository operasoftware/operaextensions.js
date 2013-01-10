opera.isReady(function(){
    var connectedTo = [];
    var responses = 0;
    window.addEventListener( "load", function() {
        if (opera.extension) {
    	opera.extension.tabs.create({
    	    url : "http://www.opera.com/"
    	});
    	opera.extension.tabs.create({
    	    url : "http://www.opera.com/"
    	});
    	opera.extension.tabs.create({
    	    url : "http://www.opera.com/"
    	});

    	MANUAL("Once all three tabs load, a broadcast will be sent out.");

    	opera.extension.onmessage = function(event) {

    	    if (connectedTo.indexOf(event.source) > -1) {
    		MANUAL("Response received from a known connected source.");
    		responses++;
    	    } else {
    		FAIL("Response received from an unknown source.");
    	    }
    	    if (responses == 3) {
    		PASS("Message received from all userJS's. Seems they were contacted correctly.");
    	    }
    	}

    	opera.extension.onconnect = function(event) {
    	    connectedTo.push(event.source);

    	    if (connectedTo.length == 3) {
    		opera.extension.broadcastMessage("Reply to this immediately. All of you");
    		MANUAL("If 3 responses are not received, then this test fails.");
    	    }
    	}
        } else {
    	FAIL("Couldn't find an opera.extension object.");
        }
    }, false);
});