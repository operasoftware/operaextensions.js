var tests = []; // Aynchronous tests holder

for(var i = 0, l = 50; i < l; i++) {
  var index = tests.length;
  tests[index] = async_test("Calling '/resources/file.txt' test#" + (index+1) + " should return a File object.");

  var file = getFile("/oex/resources/file.txt");
  verifyTextFile(file, "pass", function(cb, cbArgs) {
    tests[cbArgs.index].step(function() {
      assert_true(cb["result"] === "pass", "Calling '/resources/file.txt' test#" + (cbArgs.index+1) + " returns a File object.");
      tests[cbArgs.index].done();
    });
  }, { "index": index });
}