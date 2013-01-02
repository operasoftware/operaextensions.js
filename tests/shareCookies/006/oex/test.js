opera.isReady(function() {
    window.addEventListener(
    		"load",
    		function() {
    		    opera.extension.tabs
    			    .create({
    				url : "http://testsuites.oslo.osa/core/features/widget_tf/core-gadgets/extensions/share-cookies/res/mkc.php?setck=name=ck_domain1;value=1;"
    			    });
    		    opera.extension.tabs
    			    .create({
    				url : "http://www.testsuites.oslo.opera.com/core/features/widget_tf/core-gadgets/extensions/share-cookies/res/mkc.php?setck=name=ck_domain2;value=2;"
    			    });
    		}, false);

    opera.extension.onmessage = function(e) {
        opera.postError(e.data);
        if (e.data && e.data.indexOf("Loaded:") == 0) {
    	opera.postError('message received in extension');
    	if (checkCookie(
    		"name=ck_domain1;value=1",
    		"http://testsuites.oslo.osa/core/features/widget_tf/core-gadgets/extensions/share-cookies/res/mkc.php")
    		&& checkCookie(
    			"name=ck_domain2;value=2",
    			"http://www.testsuites.oslo.opera.com/core/features/widget_tf/core-gadgets/extensions/share-cookies/res/mkc.php")) {
    	    POST("PASSED");
    	} else {
    	    POST("FAILED", "Did not get the expected cookie value.");
    	}
        } else {
    	opera.postError('message:' + e);
        }
    }
});