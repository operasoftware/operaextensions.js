var file = getFile();

test(function() {
  assert_true(file === null, "Calling getFile with no argument returns null");
}, "Calling getFile with no argument should return null");