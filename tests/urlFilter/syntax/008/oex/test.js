opera.isReady({
    var tests = {}; // Asynchronous tests

    tests["gif"] = async_test("The wildcard should match any path (gif).");
    tests["png"] = async_test("The wildcard should match any path (png).");

    block.add("*pass.*");
    allow.add("http://t/*pass.*");

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data))
    	var testid = null

    	// Determine test ID
    	if (evt.data.url.indexOf("gif") > 0) {
    		testid = "gif"
    	} else {
    		testid = "png"
    	}

    	if (evt.data.type === "contentunblocked") {
    		tests[testid].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/pass." + testid, "The correct URL should be blocked.");
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
             + "<img src='http://t/resources/images/pass.gif'>"

    createTab({url: getProxyURL(data)});
});
