opera.isReady(function(){
    var tests = {}; // Asynchronous tests
    
    tests["block"] = async_test("Adding filter to block content.");
    block.add("*/fail.png");
    
    opera.extension.onmessage = function(evt) {
    	if (evt.data.type === "contentblocked") {
    		tests["block"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/fail.png", "The correct URL should be blocked.");
    		});
    	} else if (evt.data.type === "contentunblocked") {
    		tests["block"].step(function(){
    			assert_unreached("Unexpected message recieved: " + JSON.stringify(evt.data))
    		});
    	} else {
    		return // Ignore contentallowed events
    	}
    	tests["block"].done();
    }
    
    var data = "<!DOCTYPE html><p><img src='http://t/resources/images/fail.png'><img src='http://t/resources/images/pass.png'>";
    createTab({url: getProxyURL(data)});
});