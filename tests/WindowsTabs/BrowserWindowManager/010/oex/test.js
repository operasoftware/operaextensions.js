opera.isReady(function() {

  var win = null;
  // Tab Groups
  test(function() {
  	win = createWindow([
  	    		{url: "http://t/resources/pass.html"},
  	  		{url: "http://t/resources/pass.html"},
  	  		{url: "http://t/resources/pass.html"}
  	  	]);

  	//assert_equals(win.tabGroups.getAll().length, 1, "There should be 1 tab group");

  	var win2 = createWindow(win.tabs.getAll());
  	assert_equals(win2.tabs.getAll().length, 3, "Three tabs should have moved to this window within the tab group");
  	//assert_equals(win2.tabGroups.getAll().length, 1, "The tab group should have moved to this window");
  	assert_equals(win.tabs.getAll().length, 0, "The tabs should have moved to the other window");
  }, "Create a window with three tabs, then move them to a new window");
});