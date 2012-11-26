var ext     = opera.extension;  // Root opera object
var windows = ext.windows;      // Global window manager
var tabs    = ext.tabs;         // Global tab manager

var w = [], // Collection of all windows opened during testing
    t = []; // Collection of all tabs opened during testing

function createWindow(tabs, properties) {
	return w[w.length] = windows.create(tabs, properties)
}

// tab creation with legacy Tabs API support
function createTab(properties) {
  if(!tabs.createTab) {
    return t[t.length] = tabs.create(properties);
  } else {
    return t[t.length] = tabs.createTab(properties.url, properties);
  }
}

// obtain a file via the Resource Loader API
function getFile(path) {
	return (ext.getFile) ? ext.getFile(path) : undefined;
}

// pass a File object through a FileReader and fire success/error
// callback after checking its content matches expectedResult
function verifyTextFile(fileObj, expectedResult, callback, callbackArgs) {
  if(!fileObj || fileObj.toString() !== "[object File]" || !expectedResult) {
    if(!callback || typeof callback !== "function") {
      return;
    } else {
      callback.call(this, {"result": "fail"}, callbackArgs);
    }
  }
  var fr = new FileReader();
  fr.onload = function() {
    if(fr.result === expectedResult) {
      callback.call(this, {"result": "pass"}, callbackArgs);
    } else {
      callback.call(this, {"result": "fail"}, callbackArgs);
    }
  };
  fr.onerror = fr.onabort = function() {
    callback.call(this, {"result": "fail"}, callbackArgs);
  }
  fr.readAsText(fileObj);
}

// Cleanup opened windows and tabs on complete
add_completion_callback(function(tests, status) {
	//return;
	for (i = 0; i < w.length; i++) {
	    if (w[i] != null)
		    w[i].close();
	}
	for (var i = 0; i < t.length; i++) {
		t[i].close();
	}
});

// Display the results in the browser on complete
add_completion_callback(function(tests, status) {
  var resultWindow = opera.extension.windows.getLastFocused ? opera.extension.windows.getLastFocused() : null;
	var log = document.querySelector("#log");
	var dataurl = "data:text/html,<!DOCTYPE html><title>Test Results</title><link rel='stylesheet' href='http://t/resources/testharness.css'>" + encodeURIComponent(log.innerHTML);

	if (resultWindow && resultWindow.closed) {
		resultWindow = opera.extension.windows.create([{url: dataurl}], {focused: true});
	} else {
		opera.extension.tabs.create({url: dataurl, focused: true});
	}
});