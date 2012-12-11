opera.isReady(function() {
    var win = null, tab = null;
    var tests = {}; // Asynchronous tests

    tests["create"] = async_test("TabEvent object for create event");
    tests["move"] = async_test("TabEvent object for move event");
    tests["close"] = async_test("TabEvent object for close event");

    function createHandler(evt) {
        tests["create"].step(function() {
            assert_equals(evt.tab.id, tab.id, "The event's tab property should point to the created tab")
            assert_equals(evt.prevWindow, null, "The event's prevWindow property should be null")
            assert_equals(evt.prevPosition, 0, "The event's prevPosition property should be 0")
        });
        tests["create"].done();
    }

    function moveHandler(evt) {
        tests["move"].step(function() {
            assert_equals(evt.tab.id, tab.id, "The event's tab property should point to the created tab")
            assert_exists(evt, "prevPosition", "The event object should have a prevPosition property")
            assert_exists(evt, "prevWindow", "The event object should have a prevWindow property")
            assert_equals(evt.prevWindow.id, win.id, "The event's prevWindow property should point to the correct window")
            assert_equals(evt.prevPosition, 1, "The event's prevPosition property should be 1")
        });
        tests["move"].done();
    }

    function closeHandler(evt) {
        tests["close"].step(function() {
            assert_equals(evt.tab.id, tab.id, "The event's tab property should point to the created tab")
            assert_equals(evt.prevWindow, null, "The event's prevWindow property should be null")
            assert_equals(evt.prevPosition, 0, "The event's prevPosition property should be 0")
        });
        tests["close"].done();
    }

    try {
        win = createWindow(null, {
            focused : true
        });
        win2 = createWindow(undefined, {
            focused : true
        });
    } catch (e) {
        for ( var n in tests)
            tests[n].step(function() {
                assert_unreached("Couldn't create new window")
            });
    }

    tabs.addEventListener("create", createHandler, false);
    tabs.addEventListener("move", moveHandler, false);
    tabs.addEventListener("close", closeHandler, false);

    tab = createTab(undefined, win); // Create event

    setTimeout(function() {
        win2.insert(tab) // Move event
        setTimeout(function() {
            tab.close(); // Close event
        }, 100);
    }, 100);
});
