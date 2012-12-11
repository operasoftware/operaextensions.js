opera.isReady(function() {
    var tab = null;

    test(function() {
        tab = createTab({
            url : "data:text/plain,default tab"
        });
        assert_false(tab.selected, "The tab focus state should be blurred");
        assert_true(tab.selected === tab.focused, "Tab.focused is alias for Tab.selected.");
    }, "Create a new tab, default focus state is blurred");

    test(function() {
        tab.update({
            focused : true
        });
        assert_true(tab.selected, "The tab focus state should change to true");
        assert_true(tab.selected === tab.focused, "Tab.focused is alias for Tab.selected.");
    }, "Attempt to update the tab focus state from blurred to focused");

    test(function() {
        tab.focus();
        assert_true(tab.selected, "The tab focus state should change to focused, checking selected property");
        assert_true(tab.selected === tab.focused, "Tab.focused is alias for Tab.selected.");
    }, "Attempt to focus the tab");

    test(function() {
        tab = createTab({
            url : "data:text/plain,focused tab",
            focused : true
        });
        assert_true(tab.selected, "The tab focus state should be focused");
        assert_true(tab.selected === tab.focused, "Tab.focused is alias for Tab.selected.");
    }, "Create a focused tab, explicitly specifying the focused property");

    test(function() {
        tab.update({
            focused : false
        });
        assert_true(tab.selected, "The tab focus state should not change, should remain focused, checking selected property");
        assert_true(tab.selected === tab.focused, "Tab.focused is alias for Tab.selected.");
    }, "Attempt to change the tab focus state from focused to blurred");
});
