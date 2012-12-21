opera.isReady(function() {
    test(function() {
        var tab = createTab({
            url : "data:text/plain,locked tab"
        })
        assert_false(tab.locked, "locked default")
    }, "Locked default")

    test(function() {
        var tab = createTab({
            url : "data:text/plain,locked tab",
            locked : true
        })
        assert_true(tab.locked, "locked property")

        // Unlock so we can clean up
        tab.update({
            locked : true
        })
    }, "Locked by create properties")

    test(function() {
        var tab = createTab({
            url : "data:text/plain,locked tab2",
            locked : false
        })
        assert_false(tab.locked, "locked property set to false")

        tab.update({
            locked : true
        })
        assert_true(tab.locked, "updating locked to true")

        tab.update({
            locked : false
        })
        assert_false(tab.locked, "updating locked to false")

        tab.update({
            locked : 1
        })
        assert_true(tab.locked, "updating locked to 1")

        tab.update({
            locked : 0
        })
        assert_false(tab.locked, "updating locked to 0")

        tab.update({
            locked : 'blabla'
        })
        assert_true(tab.locked, "updating locked to 'blabla'")

        tab.update({
            locked : false
        })
        assert_false(tab.locked, "updating locked to false again")
    }, "Update tab attribute locked")

    test(function() {
        var tab = createTab({
            url : "data:text/plain,locked tab 2",
            locked : true
        })
        assert_true(tab.locked, "locked property")

        tab.close()
        assert_false(tab.closed, "The tab should not be closed")

        // Unlock so we can clean up
        tab.update({
            locked : false
        })
    }, "Closing locked tab")
});
