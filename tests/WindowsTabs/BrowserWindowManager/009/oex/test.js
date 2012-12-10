opera.isReady(function() {
  
  var tests = [];

  // Opening windows with tabs
  tests["one_tab"] = async_test("Create a window with one tab at a specified URL");
  tests["one_tab"].step(function() {
  	var win = createWindow([{url: "http://t/resources/pass.html"}]);  // One tab properties, no window properties
  	assert_equals(win.tabs.getAll().length, 1, "There should be 1 tab");

  	setTimeout(tests["one_tab"].step_func(function() {
  		assert_true(win.tabs.getAll()[0].url === "http://t/resources/pass.html", "The tab's URL should be as specified");

  		tests["one_tab"].done();
  	}), 100)
  });

  tests["move_tabs"] = async_test("Create a window with three tabs at a specified URL, then move them to a new window");
  tests["move_tabs"].step(function() {
  	var win = createWindow([    // Multiple tab properties, no window properties
  		{url: "http://t/resources/pass.html"},
  		{url: "http://t/resources/pass.html"},
  		{url: "http://t/resources/pass.html"}
  	]);
  	assert_equals(win.tabs.getAll().length, 3, "There should be 3 tabs");

  	setTimeout(tests["move_tabs"].step_func(function() {
  		assert_equals(win.tabs.getAll()[0].url, "http://t/resources/pass.html", "Tab 0: The URL should be as specified");
  		assert_equals(win.tabs.getAll()[1].url, "http://t/resources/pass.html", "Tab 1: The URL should be as specified");
  		assert_equals(win.tabs.getAll()[2].url, "http://t/resources/pass.html", "Tab 2: The URL should be as specified");

  		var win2 = createWindow(win.tabs.getAll());
  		assert_equals(win.tabs.getAll().length, 0, "All tabs should have moved to the other window");
  		assert_equals(win2.tabs.getAll().length, 3, "The three tabs should have moved to this window");

  		assert_equals(win2.tabs.getAll()[0].url, "http://t/resources/pass.html", "Tab 0: The URL should be as specified");
  		assert_equals(win2.tabs.getAll()[1].url, "http://t/resources/pass.html", "Tab 1: The URL should be as specified");
  		assert_equals(win2.tabs.getAll()[2].url, "http://t/resources/pass.html", "Tab 2: The URL should be as specified");

  		tests["move_tabs"].done();
  	}), 100);
  });

  tests["tab_props"] = async_test("Create a window with multiple tabs, each with different properties");
  tests["tab_props"].step(function() {
  	var win = createWindow([    // Multiple tab properties, no window properties
  		{url: "data:text/plain,1", locked: true},
  		{url: "data:text/plain,2", focused: true}, // focused is ignored
  		{url: "data:text/plain,3", private: true}
  	]);
  	var t = win.tabs.getAll();

  	assert_equals(t.length, 3, "There should be 3 tabs");
  	t[1].focus(); // We have to explicitly focus since the property is ignored in the new spec

  	setTimeout(tests["tab_props"].step_func(function() {
  		assert_true( t[0].locked,   "Tab 0 should be locked")
  		assert_false(t[0].selected, "Tab 0 should not be selected")
  		assert_false(t[0].private,  "Tab 0 should not be private")

  		assert_false(t[1].locked,   "Tab 1 should not be locked")
  		assert_true( t[1].selected, "Tab 1 should be selected")
  		assert_false(t[1].private,  "Tab 1 should not be private")

  		assert_false(t[2].locked,   "Tab 2 should not be locked")
  		assert_false(t[2].selected, "Tab 2 should not be selected")
  		assert_true( t[2].private,  "Tab 2 should be private")

  		var win2 = createWindow(win.tabs.getAll());
  		assert_equals(win.tabs.getAll().length, 0, "All tabs should have moved to the other window");
  		assert_equals(win2.tabs.getAll().length, 3, "The three tabs should have moved to this window");

  		tests["tab_props"].done();
  	}), 50);
  });

  tests["tab_pos"] = async_test("Create a window with multiple tabs, ignore explicit positioning");
  tests["tab_pos"].step(function() {
  	var win = createWindow([    // Multiple tab properties, explicit tab positions ignored, no window properties
  		{url: "data:text/plain,1", position: 3},
  		{url: "data:text/plain,2", position: 5},
  		{url: "data:text/plain,3", position: 2},
  		{url: "data:text/plain,4", position: 1},
  		{url: "data:text/plain,5", position: 4}
  	]);
  	var t = win.tabs.getAll();

  	setTimeout(tests["tab_pos"].step_func(function() {
  		assert_equals(win.tabs.getAll()[0].url, "data:text/plain,1", "Tab 0: The URL should be as specified");
  		assert_equals(win.tabs.getAll()[1].url, "data:text/plain,2", "Tab 1: The URL should be as specified");
  		assert_equals(win.tabs.getAll()[2].url, "data:text/plain,3", "Tab 2: The URL should be as specified");
  		assert_equals(win.tabs.getAll()[3].url, "data:text/plain,4", "Tab 3: The URL should be as specified");
  		assert_equals(win.tabs.getAll()[4].url, "data:text/plain,5", "Tab 4: The URL should be as specified");

  		tests["tab_pos"].done();
  	}), 50);
  });

});