var win = null;

// Private windows
test(function() {
	win = createWindow()
	assert_false(win.private, "The window should not be private, checking private property")
}, "Create a window, default privacy mode is normal")

test(function() {
	win = createWindow(null, {private: true});
	assert_true(win.private,  "The window privacy mode should be private, checking private property");
	assert_true(win.tabs.getAll()[0].private, "A new tab in a private window. The tab privacy mode should be private, checking private property");
}, "Create a private window, explicitly specifying the private property");

test(function() {
	win.update({private: false});
	assert_true(win.private,  "The window privacy mode should not change, should remain private, checking private property");
}, "Attempt to change the window privacy mode from private to normal");

test(function() {
	var tab = createTab({url: "data:text/plain,private"}, win);
	assert_true(win.tabs.getAll()[0].private, "A new tab in a private window. The tab privacy mode should be private, checking private property");
}, "Create a tab within a private window, default privacy mode is private");

test(function() {
	win = createWindow(null, {private: false});
	assert_false(win.private, "The window should not be private, checking private property")
	assert_false(win.tabs.getAll()[0].private, "A new tab in a non-private window should not be private, checking private property");
}, "Create a non-private window, explicitly specifying the private property");

test(function() {
	win.update({private: true});
	assert_false(win.private,  "The window privacy mode should not change, should remain normal, checking private property");
}, "Attempt to change the window privacy mode from normal to private");
