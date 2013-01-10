opera.isReady(function(){
    window.addEventListener("load", function() {
        opera.extension.onmessage = function(event) {
    	event.source.postMessage("Hi");
        }
    }, false);
});