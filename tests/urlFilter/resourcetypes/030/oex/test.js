opera.isReady({
    var tests = {}; // Asynchronous tests

    tests["block"] = async_test("Blocking by resource type: image (CSS background).");
    block.add("*fail.png*", {resources: types("image")});

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));

    	if (evt.data.type === "contentblocked") {
    		tests["block"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/fail.png", "The correct URL should be blocked.");
    			assert_equals(evt.data.tagName.toUpperCase(), "BODY", "The correct element should be blocked.");
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

    var data = "<!DOCTYPE html><style>body{background:url(http://t/resources/images/fail.png)}</style><p>You should not see a background image.";

    createTab({url: createDataURL(data)});
});
