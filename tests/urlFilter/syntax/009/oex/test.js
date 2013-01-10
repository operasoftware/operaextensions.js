opera.isReady(function() {
    var tests = {}; // Asynchronous tests

    tests["port"] = async_test("The wildcard should match the port.");

    block.add("https://ssl.opera.com:8*2/resources/images/fail.png");

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data))

    	if (evt.data.type === "contentblocked") {
    		tests["port"].step(function(){
    			assert_equals(evt.data.url, "https://ssl.opera.com:8012/resources/images/fail.png", "The correct URL should be blocked.");
    		});
    	} else if (evt.data.type === "contentunblocked") {
    		tests["port"].step(function(){
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
    	tests["port"].done();
    }

    var data = "<!DOCTYPE html>"
             + "<img src='https://ssl.opera.com:8012/resources/images/fail.png'>"
             + "<img src='https://ssl.opera.com:8012/resources/images/pass.png'>"

    createTab({url: getProxyURL(encodeURIComponent(window.btoa(data)))});
});
