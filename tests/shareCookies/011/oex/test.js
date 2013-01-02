opera.isReady(function() {
	    var ckData = "name=ck_httponly;value=1";

	    window.addEventListener("load", function() {
		opera.extension.tabs.create({
		    url : ckURL + "?setck=" + ckData + ";httponly=1",
		    focused : true
		});
	    }, false);

	    opera.extension.onmessage = function(e) {
		opera.postError(e.data);
		if (e.data && e.data.indexOf("Loaded:") == 0) {
		    opera.postError('message received in extension');
		    if (checkCookie(ckData)
			    && e.data.indexOf("cookie found") === -1) {
			POST("PASSED");
		    } else {
			POST(
				"FAILED",
				"Did not get the expected cookie value or a HTTP only cookie was found in document.cookie.");
		    }
		} else {
		    opera.postError('message:' + e);
		}
	    }
	});