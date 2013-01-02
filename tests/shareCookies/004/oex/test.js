opera.isReady(function() {
    window.addEventListener("load", function() {
		// opera.extension.tabs.create({url: "data:text/plain, Test
		// initiated.", focused: true});
		// setTimeout(function()
		// {
	opera.extension.tabs.create({
	    url : ckURL + "?setck=" + ckData,
	    focused : true
	});
	// }, 500);
    }, false);

    opera.extension.onmessage = function(e) {
	opera.postError(e.data);
	if (e.data && e.data.indexOf("Loaded:") == 0) {
	    opera.postError('message received in extension');
	    /* We should not get the cookie in this case */
	    if (!checkCookie(ckData)) {
		POST("PASSED");
	    } else {
		POST("FAILED", "Should not have got the same cookie that the browser set.");
	    }
	} else {
	    opera.postError('message:' + e);
	}
    }
});