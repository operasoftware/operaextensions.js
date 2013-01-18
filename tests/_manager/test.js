var tests = [];
var curr = 0;
var timer = null;
var TC_TIMEOUT = 5000;

window.addEventListener("load", function() {
	try{
		chrome.management.getAll( function(exts) {
			var str = "";

			for (var i = 0; i < exts.length; i++){
				if(exts[i].type == "extension" && exts[i].name.substring(0,3) == "tc-"){
					tests.push(exts[i]);
					str +=  i + " " + JSON.stringify(exts[i]) + "<br />";
				}
			}
			debug(str);
			runTest();

		});
	}
	catch(err){

	}

});


chrome.extension.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		if(sender.id == tests[curr].id) {
			clearTimeout(timer);

			var log = document.getElementById('log');
			var results = decodeURIComponent(request);
			log.innerHTML += encodeURIComponent("<h2>" + tests[curr].name + "</h2><table class='results'>" + results + "</table>");//decodeURIComponent();

			chrome.management.setEnabled(tests[curr].id, false, function(){
				curr++;
				runTest();
			});
		}
});

function runTest(){
	if(curr == tests.length) {
		result();
	}
	if(curr >= tests.length) {
	    return;
	}
	chrome.management.setEnabled(tests[curr].id, true, function(){
		//chrome.extension.sendMessage(tests[curr].id, "testrun");

		timer = setTimeout(function(){
			chrome.management.setEnabled(tests[curr].id, false, function(){
				curr++;
				runTest();
			});
		},TC_TIMEOUT);
	});
}
function result(){
	var str = "data:text/html,<!DOCTYPE html><title>Test Results</title><link rel='stylesheet' href='http://t/resources/testharness.css'>";
		str += document.getElementById('log').innerHTML;
		chrome.tabs.create({"url": str});
}
function debug(msg) {
	var url = "data:text/html," + msg;
	//chrome.tabs.create({"url": url});
}