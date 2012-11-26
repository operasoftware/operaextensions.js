// ==UserScript==
// @include http://team.opera.com/testbed/generic/blank.html?resourceload_001
// ==/UserScript==

var ext = opera.extension;

if(typeof ext.getFile === "function") {
  ext.postMessage({"type": "injectable", "getFile": "true"});
} else {
  ext.postMessage({"type": "injectable"});
}