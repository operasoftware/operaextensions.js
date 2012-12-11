opera.isReady(function() {
    var tab, tests = [];

    tests['title'] = async_test("Check the tab's title");

    tests['title'].step(function() {
        tab = createTab({
            url : "data:text/html,<!DOCTYPE html><title>PASS</title><p>Title Test"
        });

        setTimeout(tests['title'].step_func(function() {
            assert_equals(tab.title, "PASS", "The tab title should be PASS");
            tests['title'].done()
        }), 100);
    })
});
