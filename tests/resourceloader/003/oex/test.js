var file = getFile("/resources/bar.txt");

var test = async_test("A request for a non-existent file should return null");

test.step(function() {
  assert_true(file == null, "Request for a non-existent file returns null");
  test.done();
});