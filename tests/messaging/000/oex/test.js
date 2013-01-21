opera.isReady(function(){

    var connectedTo = [];
    var responses = [];
    var tab = [];
    var test = async_test("Check back broadCast userjs", {timeout: 5000});

    function onMessage(event) {
	responses.push(event.data);
	console.log(event.data);
	//console.log(event.data);
	if(responses.length === connectedTo.length) {
	    test.step(function(){
		for (i = 0; i < responses.length; i++) {
		    assert_equals(responses[i], "Responding to source", "Response should be received from source #" + i );
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
        tab.push( createTab({ url : "http://www.opera.com/" }));
        tab.push( createTab({ url : "http://www.opera.com/" }));
        tab.push( createTab({ url : "http://www.opera.com/" }));

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
            	}, 10000);
            });
        }, 2000);

    } catch (e) {
        tests.step(function() {
            assert_unreached("Couldn't create tabs");
        });
    }
});