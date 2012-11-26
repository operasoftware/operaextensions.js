// ==UserScript==
// @include http://team.opera.com/testbed/generic/blank.html?resourceload_010
// ==/UserScript==

var ext = opera.extension;

// Check for existence of getFile and post result back to background process
if(typeof ext.getFile === "function") {
  var file = ext.getFile("http://team.opera.com/testbed/generic/blank.html");
  if(file == null) {
    ext.postMessage("success");
  } else {
    ext.postMessage("fail");
  }
} else {
  ext.postMessage("fail");
}