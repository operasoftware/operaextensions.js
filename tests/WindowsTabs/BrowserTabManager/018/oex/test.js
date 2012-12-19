opera.isReady(function(){
    var tab = null, tab2 = null;
    var tests = {}, // Asynchronous tests
        eventsReceived = [], // List of received events
        eventsExpected = [   // List of expected events
    		// Step 1
    		{target: "tab", type: "create"},
    		{target: "tab", type: "blur"},
    		{target: "tab", type: "focus"},
    	];

    tests["blur"]  = async_test("Tab blur event");
    tests["focus"] = async_test("Tab focus event");
    tests["order"]  = async_test("Order of events");

    function getHandler(type) {
    	return function(evt) {
    		tests[type].step(function() {
    			assert_equals(evt.type, type, "Event type should be '" + type + "'");
    			assert_exists(evt, "tab", "The event object should have a tabGroup property");

    			if (evt.type === "blur") {
    				assert_equals(evt.tab.id, tab.id, "The event should refer to the blurred tab");
    			} else if (evt.type === "focus") {
    				assert_equals(evt.tab.id, tab2.id, "The event should refer to the focused tab");
    			}
    		});
    		tests[type].done();
    	}
    }

    function eventOrder(evt) {
    	var evtTarget = evt.browserWindow ? "browserWindow" : evt.tabGroup ? "tabGroup" : evt.tab ? "tab" : "unknown"

    	eventsReceived.push({target: evtTarget, type: evt.type});

    	if (eventsReceived.length === eventsExpected.length) {
    		setTimeout(function() {
    			tests["order"].step(function() {
    				//for (i = 0; i < eventsReceived.length; i++) {
    				//	opera.postError(eventsReceived[i].target + ": " + eventsReceived[i].type)
    				//}

    				for (i = 0; i < eventsReceived.length; i++) {
    					assert_equals("{" + eventsReceived[i].target + ", " + eventsReceived[i].type + "}",
    					              "{" + eventsExpected[i].target + ", " + eventsExpected[i].type + "}",
    					              "The event order, type and target should match. Event number: " + i)
    				}
    			});
    			tests["order"].done();
    		}, 500); // Wait, incase new unexpected events fire
    	}
    }

    // Setup
    tab = createTab({focused: true}); // Create event

    tabs.addEventListener("focus", getHandler("focus"), false);
    tabs.addEventListener("blur",  getHandler("blur"),  false);

    windows.addEventListener("create", eventOrder, false);
    windows.addEventListener("close",  eventOrder, false);
    windows.addEventListener("focus",  eventOrder, false);
    windows.addEventListener("blur",   eventOrder, false);
     groups.addEventListener("create", eventOrder, false);
     groups.addEventListener("move",   eventOrder, false);
     groups.addEventListener("close",  eventOrder, false);
     groups.addEventListener("focus",  eventOrder, false);
     groups.addEventListener("blur",   eventOrder, false);
       tabs.addEventListener("create", eventOrder, false);
       tabs.addEventListener("move",   eventOrder, false);
       tabs.addEventListener("close",  eventOrder, false);
       tabs.addEventListener("focus",  eventOrder, false);
       tabs.addEventListener("blur",   eventOrder, false);


    tab2 = createTab({focused: true}); // Create and focus event
    
    console.log(eventsReceived);
});