opera.isReady(function(){
    var tests = {}; // Asynchronous tests
    
    tests["block"] = async_test("Adding filter to block content.");
    tests["allow"] = async_test("Adding exception to allow content.");
    
    block.add("*images/*.png"); // filter
    allow.add("*pass*")        // exception
    
    opera.extension.onmessage = function(evt) {
    	if (evt.data.type === "contentblocked") {
    		tests["block"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/fail.png", "The correct URL should be blocked.");
    		});
    		tests["block"].done();
    	} if (evt.data.type === "contentunblocked") {
    		tests["allow"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/pass.png", "The correct URL should be allowed.");
    		});
    		tests["allow"].done();
    	}
    }
    
    var data = "<!DOCTYPE html><p><img src='http://t/resources/images/fail.png'><img src='http://t/resources/images/pass.png'>";
    createTab({url: getProxyURL(encodeURIComponent(window.btoa(data)))});
});
