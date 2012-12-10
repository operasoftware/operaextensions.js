opera.isReady(function() {
    var win = null, win2 = null, tab = null;
    var tests = {}, // Asynchronous tests
    eventsReceived = [], // List of received events
    eventsExpected = [ // List of expected events
    // Step 1
    {
        target : "tab",
        type : "move"
    },

    // Step 2
    {
        target : "browserWindow",
        type : "close"
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
    try {
        win = createWindow(null, {
            focused : true
        }); // Create window, implicitly
        // creates a tab
        win2 = createWindow(null, {
            focused : true
        }); // Create another window,
        // implicitly creates a tab
    } catch (e) {
        for ( var n in tests)
            tests[n].step(function() {
                assert_unreached("Couldn't create new window")
            });
    }

    tab = win.tabs.getAll()[0]; // Get the tab from the first window

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
        win2.insert(tab) // Fire move event, might implicitly close the previous
        // window

        // Step 2
        win.close(); // Close the window, if it didn't close automatically
    }, 100);
});
