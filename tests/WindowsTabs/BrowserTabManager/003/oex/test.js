opera.isReady(function() {
    var tab = null;

    var tests = {}, // Asynchronous tests
    eventsReceived = [], // List of received events
    eventsExpected = [ // List of expected events
    // Step 1
    {
        target : "browserWindow",
        type : "create"
    }, {
        target : "tab",
        type : "move"
    }, ];

    tests["move"] = async_test("Tab move event");
    tests["order"] = async_test("Order of events");

    function getHandler(type) {
        return function(evt) {
            tests[type].step(function() {
                assert_equals(evt.type, type, "Event type should be '" + type + "'");
                assert_exists(evt, "tab", "The event object should have a tabGroup property");
                assert_equals(evt.tab.id, tab.id, "The event should refer to the created tab group");
            });
            tests[type].done();
        }
    }

    function eventOrder(evt) {
        var evtTarget = evt.browserWindow ? "browserWindow" : evt.tabGroup ? "tabGroup" : evt.tab ? "tab" : "unknown"

        eventsReceived.push({
            target : evtTarget,
            type : evt.type
        });

        if (eventsReceived.length === eventsExpected.length) {
            setTimeout(function() {
                tests["order"].step(function() {
                    // for (i = 0; i < eventsReceived.length; i++) {
                    // opera.postError(eventsReceived[i].target + ": " +
                    // eventsReceived[i].type)
                    // }

                    for (i = 0; i < eventsReceived.length; i++) {
                        assert_equals("{" + eventsReceived[i].target + ", " + eventsReceived[i].type + "}", "{" + eventsExpected[i].target + ", " + eventsExpected[i].type + "}",
                                "The event order, type and target should match. Event number: " + i)
                    }
                });
                tests["order"].done();
            }, 500); // Wait, incase new unexpected events fire
        }
    }

    // Setup
    tab = createTab(); // Create event

    tabs.addEventListener("move", getHandler("move"), false);

    windows.addEventListener("create", eventOrder, false);
    windows.addEventListener("close", eventOrder, false);
    groups.addEventListener("create", eventOrder, false);
    groups.addEventListener("move", eventOrder, false);
    groups.addEventListener("close", eventOrder, false);
    tabs.addEventListener("create", eventOrder, false);
    tabs.addEventListener("move", eventOrder, false);
    tabs.addEventListener("close", eventOrder, false);

    setTimeout(function() {
        // Step 1
        try {
            createWindow([ tab ], {
                focused : true
            }); // Create a window, move the tab
            // group. Fire move events
        } catch (e) {
            for ( var n in tests)
                tests[n].step(function() {
                    assert_unreached("Couldn't create new window")
                });
        }
    }, 100);
});
