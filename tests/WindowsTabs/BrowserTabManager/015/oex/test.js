opera.isReady(function() {
    var win, tests = []

    tests['basic'] = async_test("Basic function test")
    tests['basic'].step(function() {
        var tab = createTab({
            url : "data:text/plain,0"
        })

        setTimeout(tests['basic'].step_func(function() {
            assert_equals(tab.url, "data:text/plain,0")
            assert_throws("TYPE_MISMATCH_ERR", function() {
                tab.update()
            }, "update without arguments")
            tests['basic'].done()
        }), 10)
    })

    tests['hash'] = async_test("Update tab url hash")
    tests['hash'].step(function() {
        var tab = createTab({
            url : "data:text/plain,2"
        })

        setTimeout(tests['hash'].step_func(function() {
            assert_equals(tab.url, "data:text/plain,2")
            tab.update({
                url : "data:text/plain,2#updated"
            })
            setTimeout(tests['hash'].step_func(function() {
                assert_equals(tab.url, "data:text/plain,2#updated")
                tests['hash'].done()
            }), 10)
        }), 10)
    })

    test(function() {
        var tab = createTab({
            url : "data:text/plain,closed tab"
        })
        tab.close()
        assert_true(tab.closed, "Tab should be closed")

        assert_throws("INVALID_STATE_ERR", function() {
            tab.update({})
        }, "BrowserTab.update on closed tab")
        assert_throws("INVALID_STATE_ERR", function() {
            tab.update({
                url : "a"
            })
        }, "BrowserTab.update on closed tab")
        assert_throws("INVALID_STATE_ERR", function() {
            tab.update({
                title : "a"
            })
        }, "BrowserTab.update on closed tab")
    }, "Update closed tab")
});
