var test = async_test("Calling a Web Page URL from an Injected Script Process should return null");

function getHandler() {
	return function(evt) {
		test.step(function() {
		  assert_equals(evt.data, "success", "Calling a Web Page URL from an Injected Script Process returns null");
		});
		test.done();
	}
}

ext.onmessage = getHandler();

// Injectable Interface Test
createTab({url: 'http://team.opera.com/testbed/generic/blank.html?resourceload_010', focused: true});