var file = getFile("./resources/foo.txt");

var test = async_test("Request for './resources/foo.txt' should return a File");

test.step(function() {
  assert_true(file && file.toString() === "[object File]", "Request for './resources/foo.txt' returns a File");
  test.done();
});