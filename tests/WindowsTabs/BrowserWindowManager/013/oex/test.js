opera.isReady(function() {
  
  // Closing windows
  test(function() {
  	var win = createWindow();
  	assert_false(win.closed,  "The window should not be closed")
  	win.close();
  	assert_true(win.closed,  "The window should be closed")
  }, "Opening and closing windows, checking closed property");

});