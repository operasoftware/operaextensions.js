opera.isReady(function() {
    var win, tab1_1, tab1_2, win2, tab2_1, tab2_2

    win = windows.getLastFocused()
    tab1_1 = createTab({
        url : 'data:text/plain,1-1',
        focused : true
    })
    tab1_2 = createTab({
        url : 'data:text/plain,1-2'
    })

    test(function() {
        var selected_tab = tabs.getSelected()

        assert_equals(selected_tab.browserWindow.id, win.id, "Selected tab's browserWindow")
        assert_equals(selected_tab.id, tab1_1.id, "Selected tab ID")
        assert_equals(selected_tab, tab1_1, "Selected tab object")
    }, "Get selected tab")

    try {
        win2 = createWindow(null, {
            focused : true
        })
    } catch (e) {
        win2 = win
    }
    tab2_1 = createTab({
        url : 'data:text/plain,2-1'
    }, win2)
    tab2_2 = createTab({
        url : 'data:text/plain,2-2',
        focused : true
    }, win2)

    test(function() {
        var selected_tab = tabs.getSelected()
        assert_true(win != win2 && win2 != null, "Have new window")

        assert_equals(selected_tab.browserWindow.id, win2.id, "Selected tab's browserWindow")
        assert_equals(selected_tab.id, tab2_2.id, "Selected tab ID")
        assert_equals(selected_tab, tab2_2, "Selected tab object")
    }, "Get selected tab after new window");

    test(function() {
        var win_tab = win.tabs.getSelected(), selected_tab = tabs.getSelected()
        assert_true(win != win2 && win2 != null, "Have new window")

        assert_equals(win_tab.browserWindow.id, win.id, "Selected tab's browserWindow")
        assert_equals(win_tab.id, tab1_1.id, "Selected tab ID")
        assert_equals(win_tab, tab1_1, "Selected tab object")

        assert_equals(windows.getLastFocused(), win2, "getLastFocused shouldn't change")
        assert_equals(selected_tab, tab2_2, "Selected tab shouldn't change")
    }, "Get selected tab in blurred window")
});
