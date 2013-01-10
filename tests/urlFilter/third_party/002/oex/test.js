opera.isReady({
    var tests = {}; // Asynchronous tests

    tests["block"] = async_test("The rule should only block resources from the same-origin.");


    block.add("*images/*.png*", {thirdParty: false});

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));

    	if (evt.data.type === "contentblocked") {
    		tests["block"].step(function(){
    			assert_equals(evt.data.url, "http://testsuites/resources/images/fail.png", "The correct URL should be blocked.");
    		});
    	} else	if (evt.data.type === "contentunblocked") {
    		tests["block"].step(function() {
    			assert_unreached("Unexpected message recieved: " + JSON.stringify(evt.data))
    		});
    	} else {
    		if (evt.data.url.indexOf("fail.png") > 0) {
    			tests["block"].step(function(){
    				assert_unreached("Unexpectedly allowed " + evt.data.url)
    			})
    		} else {
    			return // Ignore contentallowed messages for non-test URLs
    		}
    	}
    	tests["block"].done();
    }

    createTab({url: "http://testsuites/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/third-party.html"});
});
