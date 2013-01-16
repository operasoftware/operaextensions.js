opera.isReady(function(){

    var tests = [],t,t2,
    	tabMsg = false, extMsg = false;
    var eventsExpected = ["focus", "message"],
    	eventsReceived = [];
    tests['tab-post-message'] = async_test("tab.postMessage event", {timeout: 5000});
    tests['order'] = async_test("Order of events")


    function eventOrder(evt) {
	eventsReceived.push(evt.type);
	console.log(evt.type);
	if (eventsReceived.length === eventsExpected.length) {
            setTimeout(function() {
                tests["order"].step(function() {
                    for (i = 0; i < eventsReceived.length; i++) {
                        assert_equals(eventsReceived[i], eventsExpected[i], "The event order, type should match. Event number: " + i)
                    }
                });
                tests["order"].done();
            }, 500); // Wait, incase new unexpected events fire
        }
    }

    function onFocus( event ){
	var tab = opera.extension.tabs.getFocused();
	if( tab ){
	    if( tab.postMessage ){
		console.log(tab)
		console.log( "Asking the tab to respond." );
	        tab.onmessage = function( event ){
	            console.log("TAB SPECIFIC listener:");
	            assert_true(true, "TAB SPECIFIC listener: Response received. The event looks like this:\n" + getProperties( event, 0 ));
	            tests['tab-post-message'].done();
//	            PASS( "TAB SPECIFIC listener: Response received. The event looks like this:\n" + getProperties( event, 0 ) );
	        };

	        tab.postMessage( "Respond to this immediately" );
	    } else {
		assert_true(false, "postMessage method not found");
		tests['tab-post-message'].done();
//	          MANUAL( "postMessage method not found. The tab object looks like :\n" + getProperties( tab, 0 ) );
	    }
	}
    }


    tabs.addEventListener("focus", eventOrder, false);
    tabs.addEventListener("focus", onFocus, false);

    opera.extension.addEventListener("message", eventOrder, false);


    tests['tab-post-message'].step(function(){
	console.log('creating tab');
	t = createTab({ url : "http://www.opera.com/?t=" + new Date() });
	t2 = createTab({ url : "http://www.opera.com/?t=" + new Date(), focused: true });
	t.focus();
    });

});