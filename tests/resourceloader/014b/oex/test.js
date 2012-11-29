var test = async_test("Appending a resource by widget URL (widget://) to a web page should not be possible");

function getHandler() {
	return function(evt) {
			test.step(function() {
				assert_equals(evt.data, "success", "Appending a resource by widget URL (widget://) to a web page failed");
			});
			test.done();
	}
}

ext.onmessage = getHandler();

var testTab = createTab({url: 'http://team.opera.com/testbed/generic/blank.html?resourceload_014', focused: true});




