opera.isReady(function() {
    var tests = {}; // Asynchronous tests

    tests["t"] = async_test("The wildcard should match the hostname (t).");
    tests["t.oslo.osa"] = async_test("The wildcard should match the hostname (t.oslo.osa).");

    block.add("*pass.png*");
    allow.add("http://*/resources/images/pass.png");

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));
    	var testid = null

    	// Determine test ID
    	if (evt.data.url.indexOf("http://t/") === 0) {
    		testid = "t"
    	} else {
    		testid = "t.oslo.osa"
    	}

    	if (evt.data.type === "contentunblocked") {
    		tests[testid].step(function(){
    			assert_equals(evt.data.url, "http://" + testid + "/resources/images/pass.png", "The correct URL should be blocked.");
    		});
    	} else if (evt.data.type === "contentblocked") {
    		tests["wildcard"].step(function(){
    			assert_unreached("Unexpected message recieved: " + JSON.stringify(evt.data))
    		});
    	} else {
    		if (evt.data.url.indexOf("pass.png") > 0) {
    			tests[testid].step(function(){
    				assert_unreached("Unexpectedly allowed " + evt.data.url)
    			})
    		} else {
    			return // Ignore contentallowed messages for non-test URLs
    		}
    	}
    	tests[testid].done();
    }

    var data = "<!DOCTYPE html>"
             + "<img src='http://t/resources/images/pass.png'>"
             + "<img src='http://t.oslo.osa/resources/images/pass.png'>"

    createTab({url: getProxyURL(encodeURIComponent(window.btoa(data)))});
});
