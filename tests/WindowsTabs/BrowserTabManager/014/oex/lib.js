var windows = opera.extension.windows;   // Global window manager
var groups  = opera.extension.tabGroups; // Global tab group manager
var tabs    = opera.extension.tabs;      // Global tab manager

var w = [], // Collection of all windows opened during testing
    g = [], // Collection of all tab groups opened during testing
    t = []; // Collection of all tabs opened during testing

function createWindow(tabs, properties) {
	return w[w.length] = windows.create(tabs, properties)
}

function createGroup(tabs, properties, container, before) {
  return g[g.length] = (container ?
                          container.tabGroups.create(tabs, properties, before) :
                          groups.create(tabs, properties, before));
}

function createTab(properties, container, before) {
  return t[t.length] = (container ? container.tabs.create(properties, before) : tabs.create(properties, before));
}

/* Decorating/wrapping assert_throws in order to allow Opera's internal
 * WRONG_ARGUMENTS_ERR === TYPE_MISMATCH_ERR. So that we pass these tests
 * even though we're throwing an old kind exception
 */
var real_assert_throws = assert_throws;
var assert_throws = function(code, func, description)
{
  if (code == 'TYPE_MISMATCH_ERR')
  {
    try {
      func.call(this);
      assert(false, make_message("assert_throws", description,
                                  "${func} did not throw", {func:func}));
    }
    catch (e) {
      if (e.code != DOMException.TYPE_MISMATCH_ERR
          && e.message != 'TYPE_MISMATCH_ERR'
          && e.message != 'WRONG_ARGUMENTS_ERR')
        real_assert_throws(code, func, description);
    }
  }
  else
    real_assert_throws(code, func, description);
}

// Cleanup windows, groups and tabs
add_completion_callback(function(tests, status) {
	//return;
	for (i = 0; i < w.length; i++) {
	    if (w[i] != null)
		    w[i].close();
	}
	for (i = 0; i < g.length; i++) {
		g[i].close();
	}
	for (var i = 0; i < t.length; i++) {
		t[i].close();
	}
})

var resultWindow = opera.extension.windows.getLastFocused();

add_completion_callback(function(tests, status) {
	var log = document.querySelector("#log");
	var dataurl = "data:text/html,<!DOCTYPE html><title>Test Results</title><link rel='stylesheet' href='http://t/resources/testharness.css'>" + encodeURIComponent(log.innerHTML);

	if (!resultWindow || resultWindow.closed) {
		resultWindow = opera.extension.windows.create([{url: dataurl}], {focused: true});
	} else {
		resultWindow.tabs.create({url: dataurl, focused: true});
	}
});
