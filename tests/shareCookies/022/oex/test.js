opera.isReady(function() {
    window.addEventListener("load", function () {
	var ifr = document.createElement("iframe");
	var uu = ckURL + "?setck=" + ckData;
	ifr.src = uu;
	document.body.appendChild(ifr);
	ifr.onload = function () {
	    if(checkCookie(ckData)) {
		POST("PASSED");
	    } else {
		POST("FAILED", "Did not get the expected cookie value or the cookie was also sent over insecure network.");
	    }
	}
    }, false);
});
