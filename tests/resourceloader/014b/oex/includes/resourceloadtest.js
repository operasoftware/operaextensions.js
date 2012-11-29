// ==UserScript==
// @include http://team.opera.com/testbed/generic/blank.html?resourceload_014
// ==/UserScript==

var ext = opera.extension;

  
  // Attempt to append a real resource by Widget URL to the web page
  var realImage = document.createElement('img');

  realImage.onerror = function(e) {
    ext.postMessage("success"); // image not loaded
  };

  realImage.onload = function(e) {
    if(realImage.width === 159) { // image loaded
      return ext.postMessage("fail");
    } else {
      ext.postMessage("success"); // image not loaded
    }
  };
  
  realImage.src = chrome.extension.getURL('') + "oex/resources/opera.png"
  
  document.body.appendChild(realImage);
