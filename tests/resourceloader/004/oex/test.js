var file = getFile("/oex/resources/../resources/foo.txt");

var test = async_test("Request for '/resources/../resources/foo.txt' should return a File");

test.step(function() {
  assert_true(file && file.toString() === "[object File]", "Request for '/resources/../resources/foo.txt' returns a File");
  test.done();
});