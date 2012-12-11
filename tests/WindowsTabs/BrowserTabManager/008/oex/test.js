opera.isReady(function() {

    test(function() {
        var tab = createTab({
            url : "data:text/plain,default tab"
        })
        assert_false(tab.private)
    }, "Not private by default")

    test(function() {
        var tab = createTab({
            url : "data:text/plain,private tab",
            private : true
        })
        assert_true(tab.private)

        tab.update({
            private : false
        })
        assert_true(tab.private, "Updating shouldn't change private mode")

    }, "Update tab attribute private")

    test(function() {
        var tab = createTab({
            url : "data:text/plain,unprivate tab",
            private : false
        })
        assert_false(tab.private)

        tab.update({
            private : true
        })
        assert_false(tab.private, "Updating shouldn't change private mode")

    }, "Update tab attribute private 2")

    test(function() {
        var tab = createTab({
            url : "data:text/plain,closed tab",
            private : true
        })

        tab.close()
        assert_true(tab.closed, "The tab should close")
    }, "Closing private tab")

    /* Assumes no access to private tabs */
    var test_ = async_test("Checking attributes on private tab (with default privacy setting)")
    test_.step(function() {
        var tab = createTab({
            url : "data:text/html,<!doctype html><title>FAIL</title>Private",
            private : true
        })

        setTimeout(test_.step_func(function() {
            assert_equals(tab.url, undefined, "URL should be restricted")
            assert_equals(tab.title, undefined, "Title should be restricted")
            assert_equals(tab.faviconURL, undefined, "faviconURL should be restricted")
            assert_equals(tab.readystate, undefined, "ReadyState should be restricted")
            tab.update({
                url : "data:text/plain,private tab 2 - now even better"
            })
            setTimeout(test_.step_func(function() {
                assert_equals(tab.url, undefined, "URL should still be restricted after update")
                test_.done()
            }), 10)
        }), 10)
    });

});
