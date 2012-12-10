opera.isReady(function() {

  var tab = null,
      win = windows.getLastFocused(),
      allwindows = [];

  test(function() {
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create() }, "no tabs, no properties");

  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(null) },            "null tabs, no properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(null, null) },      "null tabs, null properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(null, undefined) }, "null tabs, undefined properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(null, {}) },        "null tabs, empty properties");

  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(undefined) },            "undefined tabs, no properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(undefined, null) },      "undefined tabs, null properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(undefined, undefined) }, "undefined tabs, undefined properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create(undefined, {}) },        "undefined tabs, empty properties");

  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([]) },            "empty tabs, no properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([], null) },      "empty tabs, null properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([], undefined) }, "empty tabs, undefined properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([], {}) },        "empty tabs, empty properties");

  }, "Creating default windows throws NOT_SUPPORTED_ERR");

  allwindows = windows.getAll();
  for (var i = 0; i < allwindows.length; i++) {
  	if (allwindows[i] != null && allwindows[i] != win)
  		allwindows[i].close();
  }

  tab = createTab({url: 'data:text/plain,lonelytab'})

  test(function() {
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([{}]) },                         "empty tab, no properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([{}, {}]) },                     "empty tabs, no properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([{url: 'data:text/plain,1'}]) }, "adressed tab, no properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([tab]) },                        "existing tab, no properties");

  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([{}], null) },           "empty tab, null properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([{}], undefined) },      "empty tab, undefined properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([{}], {}) },             "empty tab, empty properties");
  	assert_throws('NOT_SUPPORTED_ERR', function() { windows.create([{}], {focused:true}) }, "empty tab, with properties");

  }, "Creating windows with tabs throws NOT_SUPPORTED_ERR");

  tab.close()
  allwindows = windows.getAll();
  for (var i = 0; i < allwindows.length; i++) {
  	if (allwindows[i] != null && allwindows[i] != win)
  		allwindows[i].close();
  }

});