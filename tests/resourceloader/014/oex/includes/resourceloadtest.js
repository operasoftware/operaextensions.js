// ==UserScript==
// @include http://team.opera.com/testbed/generic/blank.html?resourceload_014
// ==/UserScript==

var ext = opera.extension;

ext.onmessage = function(event) {
  
  // Attempt to append a real resource by Widget URL to the web page
  var realImage = document.createElement('img');

  realImage.onerror = function(e) {
    event.source.postMessage("success"); // image not loaded
  };

  realImage.onload = function(e) {
    if(realImage.width === 159) { // image loaded
      return event.source.postMessage("fail");
    } else {
      event.source.postMessage("success"); // image not loaded
    }
  };

  realImage.src = event.data + "resources/opera.png"

  document.body.appendChild(realImage);
  
};