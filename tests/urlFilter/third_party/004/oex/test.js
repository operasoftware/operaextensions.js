opera.isReady(function() {
    var tests = {}; // Asynchronous tests

    tests["t"] = async_test("The rule should block resources from the same-origin.");
    tests["testsuites"] = async_test("The rule should block resources third-party domains.");

    block.add("*images/*.png*", {thirdParty: null});

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));
	
    	var testid = null, path = null
	
    	if (evt.data.url.indexOf("http://t/") === 0) {
    		testid = "t"
    		path = "pass"
    	} else {
    		testid = "testsuites"
    		path = "fail"
    	}

    	if (evt.data.type === "contentblocked") {
    		tests[testid].step(function(){
    			assert_equals(evt.data.url, "http://" + testid + "/resources/images/" + path + ".png", "The correct URL should be blocked.");
    		});
    	} else	if (evt.data.type === "contentunblocked") {
    		tests["block"].step(function() {
    			assert_unreached("Unexpected message recieved: " + JSON.stringify(evt.data))
    		});
    	} else {
    		if (evt.data.url.indexOf("fail.png") > 0) {
    			tests[testid].step(function(){
    				assert_unreached("Unexpectedly allowed " + evt.data.url)
    			})
    		} else {
    			return // Ignore contentallowed messages for non-test URLs
    		}
    	}
    	tests[testid].done();
    }

    createTab({url: "http://t/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/third-party.html"});
});
