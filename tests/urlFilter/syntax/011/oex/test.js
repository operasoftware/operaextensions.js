opera.isReady({
    var tests = {} // Asynchronous tests
    var failurl = "http://t/resources/images/fail.png#"
    var passurl = "http://t/resources/images/pass.png#"

    // All test characters
    var expectblocked = ["!", "\"", "#", "$", "&", "'", "(", ")", "*", "+", ",", "/", ":", ";",
                         "<", "=", ">", "?", "@", "[", "\\", "]", "^", "`", "{", "|", "}", "~"]

    var expectallowed = ["_" ,"-", ".", "%", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                         "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                         "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
                         "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
                         "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

    var data = "<!DOCTYPE html>"

    // Register tests and create document
    for (var i = 0; i < expectblocked.length; i++) {
    	tests[expectblocked[i]] = async_test("The wildcard should match " + expectblocked[i])
    	data += "<img src='" + failurl + encodeHTML(expectblocked[i]) + "'>"
    }
    tests["EOL"]  = async_test("The wildcard should match end of line.")
    data += "<img src='" + failurl + "'>"

    for (var i = 0; i < expectallowed.length; i++) {
    	tests[expectallowed[i]] = async_test("The wildcard should not match " + expectallowed[i] + " (requires SELFTEST support)")
    	data += "<img src='" + passurl + expectallowed[i] + "'>"
    }

    // Setup filter
    block.add("http://t/resources/images/fail.png#^");

    opera.extension.onmessage = function(evt) {
    	opera.postError(JSON.stringify(evt.data));
    	var testid = null;
	
    	// Check for EOL test and determine test ID
    	if (evt.data.url === failurl) {
    		testid = "EOL"
    	} else if (evt.data.url.indexOf(failurl) === 0 || evt.data.url.indexOf(passurl) === 0) {
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
    		tests[testid].step(function() {
    			assert_true(expectallowed.indexOf(testid) >= 0, "The matched character should be in the expected allow set.")
    		});
    		tests[testid].done();
    	} else {
    		tests[testid].step(function() {
    			assert_unreached("Unexpected message recieved: " + evt + ".")
    		});
    	}
    }


    createTab({url: createDataURL(data)});
});
