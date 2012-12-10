opera.isReady(function() {
  
  // Focused windows
  test(function() {
  	win = createWindow(null, {focused: true});
  	assert_true(win.focused,  "The window should be focused, checking focused property");
  }, "Create a focused window, explicitly specifying the focused property");

  test(function() {
  	win = createWindow(null, {focused: false});
  	assert_false(win.focused, "The window should not be focused, checking focused property")
  }, "Create a non-focused window, explicitly specifying the focused property");

  test(function() {
  	win.focus();
  	assert_true(win.focused,  "The window should be focused, checking focused property");
  }, "Use the focus() method");

  test(function() {
  	var win2 = createWindow(null, {focused: true});
  	assert_true(win2.focused, "The new window should be focused, checking focused property");
  	assert_false(win.focused, "The old shouldn't focused, checking focused property");

  	win.focus();
  	assert_true(win.focused,   "The focus()'ed should be focused, checking focused property");
  	assert_false(win2.focused, "The non focus()'ed window should not be focused, checking focused property");
  }, "Create a second focused window, and afterwards focus the previous window");

});