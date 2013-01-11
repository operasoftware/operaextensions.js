opera.isReady(function() {
    opera.extension.urlfilter.addEventListener("contentblocked", function(evt) {
      console.log(evt);
    	opera.extension.postMessage({
    		type: "contentblocked",
    		url: evt.url,
    		hostname: window.location.hostname,
    		location: window.location.href,
    		tagName: evt.element ? evt.element.tagName : null
    	});
    }, false);

    opera.extension.urlfilter.addEventListener("contentunblocked", function(evt) {
      console.log(evt);
    	opera.extension.postMessage({
    		type: "contentunblocked",
    		url: evt.url,
    		hostname: window.location.hostname,
    		location: window.location.href,
    		tagName: evt.element ? evt.element.tagName : null
    	});
    }, false);
});
