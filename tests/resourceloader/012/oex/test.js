var test = async_test("Calling getFile with a widget URL pointing to a valid file should return a File");

var file = getFile('widget://' + document.domain + '/resources/file.txt');

verifyTextFile(file, "pass", function(cb) {
  test.step(function() {
    assert_true(cb["result"] === "pass", "Calling getFile with a widget URL pointing to a valid file returns a File");
    test.done();
  });
});