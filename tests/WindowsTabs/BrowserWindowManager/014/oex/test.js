opera.isReady(function() {
  
  var win = null;

  test(function() {
  	win = createWindow();
  	assert_equals(win.tabs.getAll().length, 1,  "Should only have a single tab");
  }, "Creating window without settings");

  test(function() {
  	win = createWindow([{url: 'data:text/plain,1'}]);
  	assert_equals(win.tabs.getAll().length, 1,  "Should only have a single tab");
  }, "Creating window with a tab");

  test(function() {
  	var tab = createTab({url: 'data:text/plain,2'})
  	win = createWindow([ tab ]);
  	assert_equals(win.tabs.getAll().length, 1,  "Should only have a single tab");
  }, "Creating window with a newly created tab");

  test(function() {
  	win = createWindow([ win.tabs.getAll()[0] ]);
  	assert_equals(win.tabs.getAll().length, 1,  "Should only have a single tab");
  }, "Creating window stealing a tab");

});