var senderID = "nandnlijbdgklpggddgnojncccikgcfa";
add_completion_callback(function(tests, status) {
    var log = document.querySelector("#log #results");
    var msg = encodeURIComponent(log.innerHTML);
    if(senderID) {
	chrome.extension.sendMessage(senderID, msg);
    }
});