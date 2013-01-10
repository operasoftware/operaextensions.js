opera.isReady(function() {
    var tests = {}; // Asynchronous tests
    var count = 0; // Message count
    
    tests["block"] = async_test("The rule should only block on domains that are included and not excluded.");
    
    block.add("*images/*.png*", {includeDomains: ["oslo.osa"], excludeDomains: ["testsuites.oslo.osa"]});
    
    var expected = ["t.oslo.osa", "aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddee.aliases.t.oslo.osa"];
    // Longest possible domain name: 253 characters total, up to 63 characters per segment.
    
    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));
    
    	if (evt.data.type === "contentblocked") {
    		tests["block"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/100x100-navy.png", "The correct URL should be blocked.");
    			assert_true(expected.indexOf(evt.data.hostname) >= 0, "The block should only apply on specified domains. (Location: " + evt.data.location + ")")
    		});
    	} else if (evt.data.type === "contentunblocked") {
    		tests["block"].step(function() {
    			assert_unreached("Unexpected message recieved: " + JSON.stringify(evt.data))
    		});
    	} else {
    		return // Ignore contentallowed events
    	}
    
    	count++;
    	if (count === 2) {
    		setTimeout(function() { // Wait in case unexpected events fire
    			tests["block"].done();
    		}, 10);
    	}
    }
    
    var url = [
    	"http://t/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://t.oslo.osa/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://testsuites/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://testsuites.oslo.osa/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddee.aliases.t.oslo.osa/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	createDataURL("<!DOCTYPE html><title>Domains Test</title><p><img src='http://t/resources/images/100x100-navy.png'>")
    ];
    
    for (var i = 0; i < url.length; i++) {
    	createTab({"url": url[i]});
    }
});
