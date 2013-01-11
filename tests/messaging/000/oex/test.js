opera.isReady(function(){

    var connectedTo = [];
    var responses = [];
    var tab = [];
    var test = async_test("Check back broadCast userjs", {timeout: 5000});

    function onMessage(event) {
	responses.push(event.source);
	//console.log(event.data);
	if(responses.length === connectedTo.length) {
	    test.step(function(){
		for (i = 0; i < responses.length; i++) {
		    assert_in_array(responses[i], connectedTo, "Response should be received from a known connected event.source #" + i );
		}
	    });
	    test.done();
	    for(i=0; i<tabs.length;i++) {tab[i].close();}
	}
    }
    function onConnect(event) {
	connectedTo.push(event.source);
	//console.log(event.source);
	//event.source.postMessage("Reply to this immediately. All of you");

	if (connectedTo.length === tab.length) {
	    opera.extension.broadcastMessage("Reply to this immediately. All of you");
	    //console.log("Broadcast Message sent");
	    //MANUAL("If 3 responses are not received, then this test fails.");
	}
    }

    opera.extension.onmessage = onMessage;
    opera.extension.onconnect = onConnect;

    try {
        //setup - create 3 tabs
        tab.push( createTab({ url : "http://www.opera.com/?t=" + new Date() }));
        tab.push( createTab({ url : "http://www.opera.com/?t=" + new Date() }));
        tab.push( createTab({ url : "http://www.opera.com/?t=" + new Date() }));

        setTimeout(function(){
            console.log(tab.length);
            test.step(function(){
        	assert_equals(connectedTo.length, tab.length, "All tabs should connect to bg-process");
        	setTimeout(function(){
        	    test.step(function(){
        		assert_equals(responses.length, tab.length, "Message should be received from all userJS's");
        	    });
        	    test.done();
        	    for(i=0; i<tabs.length;i++) {tab[i].close();}
            	}, 2000);
            });
        }, 2000);

    } catch (e) {
        tests.step(function() {
            assert_unreached("Couldn't create tabs");
        });
    }
});