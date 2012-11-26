var test = async_test("Calling './../resources/file.txt' from Injected Script Process returns File object");

function getHandler() {
	return function(evt) {
		test.step(function() {
		  assert_equals(evt.data, "success", "Calling './../resources/file.txt' from Injected Script Process returns File object");
		});
		test.done();
	}
}

ext.onmessage = getHandler();

// Injectable Interface Test
createTab({url: 'http://team.opera.com/testbed/generic/blank.html?resourceload_009', focused: true});