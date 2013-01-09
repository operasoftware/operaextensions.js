opera.isReady({
    var tests = {}; // Asynchronous tests
    var count = 0, allowCount = 0, blockCount = 0; // Message count
    
    tests["block"] = async_test("The rule should only block on domains that are excluded.");
    tests["allow"] = async_test("The rule should not allow on domains that are excluded.");
    
    block.add("*images/*.png*");
    allow.add("*images/*.png*", {excludeDomains: ["t", "testsuites.oslo.osa", "partial.aliases.t.oslo.osa", "aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd.aliases.t.oslo.osa"]});
    var expected = ["t", "testsuites.oslo.osa", "aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd.aliases.t.oslo.osa"];
    // Longest possible domain name: 253 characters total, up to 63 characters per segment.
    // But note that in Opera, including the colon and port number (default :80), the total length is limited to 256 characters.
    // So with the port number :8081 (5 characters), the domain name length is limted to 251 characters (251 + 5 = 256)
    
    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));
    
    	if (evt.data.type === "contentunblocked") {
    		allowCount++;
    		tests["allow"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/100x100-navy.png", "The correct URL should be blocked.");
    			assert_true(expected.indexOf(evt.data.hostname) === -1, "The exception should not apply on specified domains. (Location: " + evt.data.location + ")")
    		});
    
    	} else if (evt.data.type === "contentblocked") {
    		blockCount++;
    		tests["block"].step(function(){
    			assert_equals(evt.data.url, "http://t/resources/images/100x100-navy.png", "The correct URL should be blocked.");
    			assert_true(expected.indexOf(evt.data.hostname) >= 0, "The block should only apply on specified domains. (Location: " + evt.data.location + ")")
    		});
    	} else {
    		return // Ignore contentallowed events
    	}
    
    	count++;
    	if (count === 6) {
    		setTimeout(function() { // Wait in case unexpected events fire
    			tests["allow"].step(function(){
    				assert_equals(allowCount, 3, "Three URLs should be allowed.");
    			});
    
    			tests["block"].step(function(){
    				assert_equals(blockCount, 3, "Three URLs should be blocked.");
    			});
    
    			tests["allow"].done();
    			tests["block"].done();
    		}, 10);
    	}
    }
    
    var url = [
    	"http://t:8081/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://t.oslo.osa:8081/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://testsuites:8081/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://testsuites.oslo.osa:8081/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://matchpartial.aliases.t.oslo.osa:8081/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    	"http://aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeeeffffffffffggg.aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd.aliases.t.oslo.osa:8081/core/features/widget_tf/core-gadgets/extensions/url-filter/resources/domains.html",
    ];
    
    for (var i = 0; i < url.length; i++) {
    	createTab({"url": url[i]});
    }
});
