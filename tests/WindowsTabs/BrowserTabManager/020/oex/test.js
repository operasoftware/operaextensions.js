opera.isReady(function(){
// Global tab manager API
    test(function() { assert_exists(tabs.__proto__, "close", "create method"); }, "Interface check: BrowserTabManager.close");

    // BrowserTab objects and IDs
    test(function() {
	var num_tabs = tabs.getAll().length;
	var tab = tabs.create({});
	assert_true(!tab.closed);
	assert_true(num_tabs + 1 == tabs.getAll().length);
	assert_true(tabs.getAll().indexOf(tab) != -1)
	tabs.close(tab);
	assert_true(tab.closed);
	assert_true(num_tabs == tabs.getAll().length);
	assert_true(tabs.getAll().indexOf(tab) == -1)
    }, "BrowserTabManager.close(tab) should close the tab.");
});