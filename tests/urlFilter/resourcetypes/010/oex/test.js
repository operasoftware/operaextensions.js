opera.isReady(function() {
    var tests = {}; // Asynchronous tests
    
    tests["block"] = async_test("Blocking by resource type: document.");
    block.add("*fail.html*");
    
    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));
    
    	if (evt.data.type === "contentblocked") {
    		tests["block"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/fail.html", "The correct URL should be blocked.");
    			assert_equals(evt.data.tagName, null, "No element should be associated with this block.");
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
    
    createTab({url: "http://t/resources/fail.html"});
});
