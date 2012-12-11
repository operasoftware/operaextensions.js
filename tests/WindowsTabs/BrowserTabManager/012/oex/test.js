opera.isReady(function() {
    var win = null, tab = [], ungroupedTab = null, groupedTab = null
    closedTab = null, closedGroup = null, externalTab = null, externalGroup = null, window_supported = true;

    externalTab = createTab({
        url : "data:text/plain,External tab"
    });
    //    
    // externalGroup = createGroup([ { url : "data:text/plain,External Group Tab
    // 1" }, { url : "data:text/plain,External Group Tab 2" } ], {});
    //     
    try {
        win = createWindow(null, {
            focused : true
        });
    } catch (e) {
        // Clean up current window to look like the window we couldn't open
        win = windows.getAll()[0];
        var alltabs = win.tabs.getAll();
        for ( var i = 1; i < alltabs.length; i++) {
            alltabs[i].close(); // Close everything except first "default" tab
        }
        window_supported = false;
    }

    test(function() {
        tab[0] = createTab({
            url : "data:text/plain,Tab 0"
        });
        tab[1] = createTab({
            url : "data:text/plain,Tab 1"
        }, null, null);

        assert_equals(tab[0].position, 1, "The tab (0) should take the next available position");
        assert_equals(tab[1].position, 2, "The tab (1) should take the next available position");
    }, "Creating tabs in the default positions");

    ungroupedTab = win.tabs.getAll()[0];
    closedTab = createTab({}, win);
    closedTab.close();

    // groupedTab = createTab({
    // url : "data:text/plain,Grouped tab 1"
    // }, win);
    // createGroup([ groupedTab, {
    // url : "data:text/plain,Grouped tab 2"
    // } ], {}, win)

    // closedGroup = createGroup([ {}, {} ], {}, win);
    // closedGroup.close();

    test(function() {
        tab[2] = createTab({
            url : "data:text/plain,Tab 2"
        }, null, ungroupedTab);

        assert_equals(tab[2].position, 0, "The tab group (0) should be inserted into the specified position");
        assert_equals(ungroupedTab.position, 1, "The ungrouped tab should have adjusted its position");
        assert_equals(tab[0].position, 2, "The tab group (2) should should have adjusted its position");
        assert_equals(tab[1].position, 3, "The tab group (3) should should have adjusted its position");
    }, "Creating a tab inserted before an ungrouped tab");

    test(function() {
        tab[3] = createTab({
            url : "data:text/plain,Tab 3"
        }, null, tab[1]);
        tab[4] = createTab({
            url : "data:text/plain,Tab 4"
        }, null, tab[3]);

        assert_equals(tab[2].position, 0, "The tab (0) should not change position");
        assert_equals(ungroupedTab.position, 1, "The ungrouped tab should not change position");
        assert_equals(tab[0].position, 2, "The tab (2) should be inserted into the specified position");
        assert_equals(tab[4].position, 3, "The tab (3) should be inserted into the specified position");
        assert_equals(tab[3].position, 4, "The tab (4) should be inserted into the specified position");
        assert_equals(tab[1].position, 5, "The tab (5) should be inserted into the specified position");
    }, "Creating a tab inserted before specified tabs");

    test(function() {
        assert_throws("TYPE_MISMATCH_ERR", function() {
            createTab({
                url : "data:text/plain,Throw 1"
            }, null, win);
        }, "Attempt to insert tab before a window object");
    }, "Creating a tab inserted before a window object");

    test(function() {
        assert_throws("TYPE_MISMATCH_ERR", function() {
            createTab({
                url : "data:text/plain,Throw 2"
            }, null, {});
        }, "Attempt to insert tab before a generic object");
    }, "Creating a tab inserted before a generic object");

    test(function() {
        assert_throws("INVALID_STATE_ERR", function() {
            createTab({
                url : "data:text/plain,Throw 3"
            }, null, closedTab);
        }, "Attempt to insert tab before a closed tab");
    }, "Creating a tab inserted before a closed tab");

    // test(function() {
    // assert_throws("INVALID_STATE_ERR", function() {
    // createTab({
    // url : "data:text/plain,Throw 4"
    // }, null, closedGroup);
    // }, "Attempt to insert tab before a closed group");
    // }, "Creating a tab inserted before a closed group");

    test(function() {
        if (!window_supported) {
            assert_unreached("Test doesn't make sense without window support");
        }
        tab[5] = createTab({
            url : "data:text/plain,Tab 5"
        }, null, externalTab);
        assert_equals(tab[5].browserWindow, externalTab.browserWindow, "The tab should be inserted into the same window as the reference tab")
        assert_equals(tab[5].position, externalTab.position - 1, "The tab should be inserted before reference tab")
    }, "Creating a tab inserted before an external tab");

    // test(function() {
    // if (!window_supported){assert_unreached("Test doesn't make sense without
    // window support");}
    // tab[6] = createTab({
    // url : "data:text/plain,Tab 6"
    // }, null, externalGroup);
    // assert_equals(tab[6].browserWindow, externalGroup.browserWindow, "The tab
    // should be inserted into the same window as the reference group")
    // assert_equals(tab[6].position, externalGroup.position - 1, "The tab
    // should be inserted before reference tab")
    // }, "Creating a tab inserted before an external group");

    // test(function() {
    // tab[7] = createTab({
    // url : "data:text/plain,Tab 7"
    // }, null, groupedTab);
    //
    // assert_equals(tab[7].tabGroup, groupedTab.tabGroup, "The tab (7) should
    // be inserted into the the same group as the specified tab");
    // assert_equals(tab[7].position, groupedTab.position - 1, "The tab should
    // be inserted before reference tab")
    // }, "Creating a tab inserted before a grouped tab");
});
