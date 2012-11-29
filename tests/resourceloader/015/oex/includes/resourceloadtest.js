// ==UserScript==
// @include http://team.opera.com/testbed/generic/blank.html?resourceload_015
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

var file = ext.getFile('/oex/resources/file.txt');

verifyTextFile(file, "pass", function(cb) {
  var resp  = {
		"type": 'injectable'		
	};
	
	if(cb["result"] === "pass")resp.getFile = "true";
	
	ext.postMessage(resp);
	
});


var file1 = ext.getFile('/oex/resources/file_noWAR.txt');

verifyTextFile(file1, "pass", function(cb) {
  var resp  = {
		"type": 'injectable_noWAR'		
	};
	
	if(cb["result"] === "pass")resp.getFile = "true";
	
	ext.postMessage(resp);
	
});