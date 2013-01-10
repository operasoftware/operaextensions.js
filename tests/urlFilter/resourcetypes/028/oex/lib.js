var urlfilter = opera.extension.urlfilter;
var block     = opera.extension.urlfilter.block;
var allow     = opera.extension.urlfilter.allow;

var windows = opera.extension.windows;   // Global window manager
var groups  = opera.extension.tabGroups; // Global tab group manager
var tabs    = opera.extension.tabs;      // Global tab manager

var resultWindow = opera.extension.windows.getLastFocused();

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


add_completion_callback(function(tests, status) {
	var log = document.querySelector("#log");
	var dataurl = createDataURL("<!DOCTYPE html><title>Test Results</title><link rel='stylesheet' href='http://t/resources/testharness.css'>" + log.innerHTML);

	if (!resultWindow || resultWindow.closed) {
		resultWindow = opera.extension.windows.create([{url: dataurl}], {focused: true});
	} else {
		resultWindow.tabs.create({url: dataurl, focused: true});
	}
});



function createDataURL(data) {
	return "data:text/html;base64," + window.btoa(data);
}

function types(types) {
	var contentType = 0;
	var map = {
		"other":            urlfilter.RESOURCE_OTHER,             //     1
		"script":           urlfilter.RESOURCE_SCRIPT,            //     2
		"image":            urlfilter.RESOURCE_IMAGE,             //     4
		"stylesheet":       urlfilter.RESOURCE_STYLESHEET,        //     8
		"object":           urlfilter.RESOURCE_OBJECT,            //    16
		"subdocument":      urlfilter.RESOURCE_SUBDOCUMENT,       //    32
		"document":         urlfilter.RESOURCE_DOCUMENT,          //    64
		"refresh":          urlfilter.RESOURCE_REFRESH,           //   128
		"xmlhttprequest":   urlfilter.RESOURCE_XMLHTTPREQUEST,    //  2048
		"objectsubrequest": urlfilter.RESOURCE_OBJECT_SUBREQUEST, //  4096
		"media":            urlfilter.RESOURCE_MEDIA,             // 16384
		"font":             urlfilter.RESOURCE_FONT               // 32768
	}

	for (var i = 0; i < arguments.length; i++) {
		contentType |= map[arguments[i]];
	}
	return contentType;
}

// Simple function to encode a single character as an HTML named character reference
function encodeHTML(ch) {
	switch (ch) {
	case "'":
		return "&apos;"
	case "\"":
		return "&quot;"
	case "&":
		return "&amp;"
	case "<":
		return "&lt;"
	case ">":
		return "&gt;"
	default:
		return ch
	}
}
