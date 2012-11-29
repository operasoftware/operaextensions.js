var ext = opera.extension;

var file = getFile('/oex/resources/file.txt');

verifyTextFile(file, "pass", function(cb) {
  var resp  = {
		"type": 'popup'		
	};
	
	if(cb["result"] === "pass")resp.getFile = "true";
	
	ext.postMessage(resp);
	
});


var file1 = getFile('/oex/resources/file_noWAR.txt');

verifyTextFile(file1, "pass", function(cb) {
  var resp  = {
		"type": 'popup_noWAR'		
	};
	
	if(cb["result"] === "pass")resp.getFile = "true";
	
	ext.postMessage(resp);
	
});