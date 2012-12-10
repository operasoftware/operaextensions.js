opera.isReady(function() {
    t = [ tabs.create(), // 2 tabs, no properties
    tabs.create(null), // 2 tabs, null properties
    tabs.create(undefined), // 2 tabs, undefined properties
    tabs.create({}), // 2 tabs, empty properties
    ];

    // Global tab manager API
    test(function() {
        assert_exists(tabs.__proto__, "create", "create method");
    }, "Interface check: BrowserTabManager.create");
    test(function() {
        assert_exists(tabs.__proto__, "getAll", "getAll method");
    }, "Interface check: BrowserTabManager.getAll");

    // BrowserTab objects and IDs
    test(function() {
        for ( var i = 0; i < t.length; i++) {
            assert_true(t[i] !== undefined, "BrowserTabManager.create() should return an object");
            assert_exists(t[i], "id", "BrowserTabGroup [" + i + "] should have an id");
        }
    }, "Creating tabs returns BrowserTab objects");

    test(function() {
        var ids = [];
        for ( var i = 0; i < t.length; i++) {
            assert_true(ids.indexOf(t[i].id) === -1, "ID for window [" + i + "] should be unique");
            ids.push(t[i].id);
        }
    }, "Tab IDs should be unique");
});
