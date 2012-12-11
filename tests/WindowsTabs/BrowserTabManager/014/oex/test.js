opera.isReady(function() {
    var tab, tests = []

    var doc = "data:text/html,<!DOCTYPE html><title>PASS</title><p>Title Test";

    tests['data'] = async_test("Simple title test")

    tests['data'].step(function() {
        tab = createTab({
            url : doc
        })

        var count = 0
        // Make sure the document loads before checking the title.
        // Otherwise, this would give random results on spartan
        var timer = setInterval(tests['data'].step_func(function() {
            if (tab.readyState === "complete" || count > 100) {
                clearInterval(timer)
                assert_equals(tab.readyState, "complete", "The document failed to complete loading");
                assert_equals(tab.title, "PASS", "The title should match the document title");
                tests['data'].done();
            }
            count++;
        }), 10);
    });
});
