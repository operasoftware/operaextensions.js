opera.isReady(function() {
    var win = null, tab = null;
    var tests = {}, // Asynchronous tests
    eventsReceived = [], // List of events received
    eventsExpected = [ {
        target : "tab",
        type : "create"
    }, {
        target : "browserWindow",
        type : "create"
    }, {
        target : "tab",
        type : "create"
    }, {
        target : "tab",
        type : "move"
    }, {
        target : "tab",
        type : "close"
    }, {
        target : "browserWindow",
        type : "close"
    } ]; // List of expected events

    tests["create"] = async_test("Tab Group create event");
    tests["move"] = async_test("Tab Group move event");
    tests["close"] = async_test("Tab Group close event");
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

    tabs.addEventListener("create", getHandler("create"), false);
    tabs.addEventListener("move", getHandler("move"), false);
    tabs.addEventListener("close", getHandler("close"), false);

    windows.addEventListener("create", eventOrder, false);
    windows.addEventListener("close", eventOrder, false);
    groups.addEventListener("create", eventOrder, false);
    groups.addEventListener("move", eventOrder, false);
    groups.addEventListener("close", eventOrder, false);
    tabs.addEventListener("create", eventOrder, false);
    tabs.addEventListener("move", eventOrder, false);
    tabs.addEventListener("close", eventOrder, false);

    tab = createTab(); // Create event
    try {
        win = createWindow(null, {
            focused : true
        }); // Create a window
    } catch (e) {
        for ( var n in tests)
            tests[n].step(function() {
                assert_unreached("Couldn't create new window")
            });
    }

    setTimeout(function() {
        win.insert(tab) // Fire a move event
        setTimeout(function() {
            tab.close(); // Close event
            win.close(); // Window close event
        }, 100);
    }, 100);
});
