opera.isReady(function() {
    var tests = {}; // Asynchronous tests

    tests["zero"] = async_test("The wildcard should match zero characters.");
    tests["one"] = async_test("The wildcard should match one character.");
    tests["two"] = async_test("The wildcard should match two characters.");

    block.add("*pass.png*");
    allow.add("*pass.png?zero*char");
    allow.add("*pass.png?one*har");
    allow.add("*pass.png?two*ar");

    opera.extension.onmessage = function(evt) {
    	//opera.postError(JSON.stringify(evt.data));
    	var testid = null;
	
    	// Determine test ID
    	if (evt.data.url.indexOf("zero") > 0) {
    		testid = "zero"
    	} else if (evt.data.url.indexOf("one") > 0) {
    		testid = "one"
    	} else if (evt.data.url.indexOf("two") > 0) {
    		testid = "two"
    	}

    	if (evt.data.type === "contentunblocked") {
    		tests[testid].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/pass.png?" + testid + "char", "The correct URL should be blocked.");
    		});
    	} else if (evt.data.type === "contentblocked") {
    		tests["wildcard"].step(function(){
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

    var data = "<!DOCTYPE html>"
             + "<img src='http://t/resources/images/pass.png?zerochar'>"
             + "<img src='http://t/resources/images/pass.png?onechar'>"
             + "<img src='http://t/resources/images/pass.png?twochar'>"

    createTab({url: getProxyURL(encodeURIComponent(window.btoa(data)))});
});
