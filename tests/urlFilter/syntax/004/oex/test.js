opera.isReady(function() {
    var tests = {}; // Asynchronous tests

    tests["http"] = async_test("The wildcard should match http scheme.")
    tests["https"] = async_test("The wildcard should match https scheme.")

    block.add("*pass.png*")
    allow.add("*://t/resources/images/pass.png")

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));

    	// Determine test ID
    	var testid = (evt.data.url.indexOf("http:") === 0) ? "http" : "https"

    	if (evt.data.type === "contentunblocked") {
    		tests[testid].step(function(){
    			assert_equals(evt.data.url, testid + "://t/resources/images/pass.png", "The correct http URL should be allowed.");
    		})
    	} else if (evt.data.type === "contentblocked") {
    		tests[testid].step(function(){
    			assert_unreached("Unexpected message recieved: " + JSON.stringify(evt.data))
    		})
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
             + "<img src='https://t/resources/images/pass.png'>"

    createTab({url: getProxyURL(encodeURIComponent(window.btoa(data)))});
});
