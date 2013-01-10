opera.isReady(function() {
    var tests = {} // Asynchronous tests
    var failurl = "http://t/resources/images/fail.png#"

    // All test characters
    var expectblocked = ["!", "\"", "#", "$", "&", "'", "(", ")", "*", "+", ",", "/", ":", ";",
                         "<", "=", ">", "?", "@", "[", "\\", "]", "^", "`", "{", "|", "}", "~"]

    var data = "<!DOCTYPE html>"

    // Register tests and create document
    for (var i = 0; i < expectblocked.length; i++) {
    	tests[expectblocked[i]] = async_test("The wildcard should match " + expectblocked[i])
    	data += "<img src='" + failurl + encodeHTML(expectblocked[i]) + "'>"
    }
    tests["EOL"]  = async_test("The wildcard should match end of line.")
    data += "<img src='" + failurl + "'>"

    // Setup filter
    block.add("http://t/resources/images/fail.png#^");

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));
    	var testid = null;
	
    	// Check for EOL test and determine test ID
    	if (evt.data.url === failurl) {
    		testid = "EOL"
    	} else if (evt.data.url.indexOf(failurl) === 0) {
    		testid = evt.data.url.charAt(evt.data.url.length - 1)
    	} else {
    		return // Not a test URL, ignore
    	}

    	if (evt.data.type === "contentblocked") {
    		tests[testid].step(function() {
    			if (testid === "EOL") {
    				assert_true(true)
    			} else {
    				assert_true(expectblocked.indexOf(testid) >= 0, "The matched character should be in the expected block set.")
    			}
    		});
    		tests[testid].done();
    	} else if (evt.data.type === "contentallowed") {
    		// Ignore
    	} else {
    		tests[testid].step(function() {
    			assert_unreached("Unexpected message recieved: " + evt + ".")
    		});
    	}
    }


    createTab({url: getProxyURL(data)});
});
