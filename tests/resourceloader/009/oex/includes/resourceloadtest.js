// ==UserScript==
// @include http://team.opera.com/testbed/generic/blank.html?resourceload_009
// ==/UserScript==

var ext = opera.extension;

function verifyTextFile(fileObj, expectedResult, callback) {
  if(!fileObj || fileObj.toString() !== "[object File]" || !expectedResult) {
    if(!callback || typeof callback !== "function") {
      return;
    } else {
      callback({"result": "fail"});
    }
  }

  var fr = new window.FileReader();
  fr.onload = function() {
    if(fr.result === expectedResult) {
      callback({"result": "pass"});
    } else {
      callback({"result": "fail"});
    }
  };
  fr.onerror = fr.onabort = function() {
    callback({"result": "fail"});
  }
  fr.readAsText(fileObj);
}

// Check for existence of getFile and post result back to background process
if(typeof ext.getFile === "function") {
  var file = ext.getFile("./../resources/file.txt");
  // verify the contents of file
  verifyTextFile(file, "pass", function(cb) {
    if(cb["result"] === "pass") {
      ext.postMessage("success");
    } else {
      ext.postMessage("fail");
    }
  });
} else {
  ext.postMessage("fail");
}