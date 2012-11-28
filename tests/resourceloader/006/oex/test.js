var file = getFile("../oex/resources/foo.txt");

var test = async_test("Request for '../resources/foo.txt' should return a File");

verifyTextFile(file, "pass", function(cb) {
  test.step(function() {
    assert_true(cb["result"] === "pass",  "Request for '../resources/foo.txt' returns a File");
    test.done();
  });
});