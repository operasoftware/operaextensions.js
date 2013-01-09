opera.extension.urlfilter.addEventListener("contentblocked", function(evt) {
	opera.extension.postMessage({
		type: "contentblocked",
		url: evt.url,
		hostname: window.location.hostname,
		location: window.location.href,
		tagName: evt.element ? evt.element.tagName : null
	});
}, false);

opera.extension.urlfilter.addEventListener("contentunblocked", function(evt) {
	opera.extension.postMessage({
		type: "contentunblocked",
		url: evt.url,
		hostname: window.location.hostname,
		location: window.location.href,
		tagName: evt.element ? evt.element.tagName : null
	});
}, false);

// Special debugging event for test cases, gogi only.
opera.extension.urlfilter.addEventListener("contentallowed", function(evt) {
	opera.extension.postMessage({
		type: "contentallowed",
		url: evt.url,
		hostname: window.location.hostname,
		location: window.location.href,
		tagName: evt.element ? evt.element.tagName : null
	});
}, false);
