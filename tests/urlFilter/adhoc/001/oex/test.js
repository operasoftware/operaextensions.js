opera
	.isReady(function() {
	    var tests = {}; // Asynchronous tests

	    tests["block"] = async_test("Blocking demo.");

	    opera.extension.onmessage = function(evt) {
		opera.postError(JSON.stringify(evt.data));

		if (evt.data.type === "contentblocked") {
		    tests["block"].step(function() {
			assert_true(true);
		    });
		} else {
		    tests["block"].step(function() {
			assert_unreached("Unexpected message recieved: " + evt
				+ ".")
		    });
		}
		tests["block"].done();
	    }

	    var data = "<!DOCTYPE html><img src='http://t/resources/images/fail.png#test'>"

	    createTab({
		url : createDataURL(data)
	    });
	});