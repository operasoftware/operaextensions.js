try {
	w = [
		windows.create(),                     // no tabs, no properties

		windows.create(null),                 // null tabs, no properties
		windows.create(null, null),           // null tabs, null properties
		windows.create(null, undefined),      // null tabs, undefined properties
		windows.create(null, {}),             // null tabs, empty properties

		windows.create(undefined),            // undefined tabs, no properties
		windows.create(undefined, null),      // undefined tabs, null properties
		windows.create(undefined, undefined), // undefined tabs, undefined properties
		windows.create(undefined, {}),        // undefined tabs, empty properties

		windows.create([]),                   // empty tabs, no properties
		windows.create([], null),             // empty tabs, null properties
		windows.create([], undefined),        // empty tabs, undefined properties
		windows.create([], {})                // empty tabs, empty properties
	];
} catch(e) {
	w = [ ]
}

// Global window manager API
test(function() { assert_exists(windows.__proto__, "create", "create method"); }, "Interface check: BrowserWindowManager.create");
test(function() { assert_exists(windows.__proto__, "getAll", "getAll method"); }, "Interface check: BrowserWindowManager.getAll");
test(function() { assert_exists(windows.__proto__, "getLastFocused", "getLastFocused method"); }, "Interface check: BrowserWindowManager.getLastFocused");

// BrowserWindow objects and IDs
test(function() {
	assert_equals(w.length, 13, "Created windows");

	for (var i = 0; i < w.length; i++) {
		assert_true(w[i] !== undefined, "BrowserWindowManager.create() returned an object");
		assert_exists(w[i], "id", "BrowserWindow [" + i + "] has an id")
	}
}, "Creating windows returns BrowserWindow objects");

test(function() {
	var ids = [];
	for (var i = 0; i < w.length; i++) {
		assert_true(ids.indexOf(w[i].id) === -1, "ID for window [" + i + "] is unique");
		ids.push(w[i].id);
	}
}, "Window IDs should be unique");
