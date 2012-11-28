var file = getFile("/oex/resources/foo.txt");

test(function() {
  assert_true(file && file.toString() === "[object File]", "Object returned from getFile call is of type 'File'");
}, "The object returned from getFile call should be of type 'File'");

// Attributes exist checks

test(function() {
  assert_exists(file, "name", "name attribute");
}, "Attribute check: File.name");

test(function() {
  assert_exists(file, "type", "type attribute");
}, "Interface check: File.type");

test(function() {
  assert_exists(file, "size", "size attribute");
}, "Interface check: File.size");

test(function() {
  assert_exists(file, "lastModifiedDate", "lastModifiedDate attribute");
}, "Interface check: File.lastModifiedDate");

// Attributes return correct value check

test(function() {
  assert_equals(file.name, "foo.txt", "name attribute valid");
}, "Name attribute should return the name of the loaded file");

test(function() {
  assert_equals(file.type, "text/plain", "type attribute valid");
}, "Type attribute should return the correct content type of the loaded file");

test(function() {
  assert_equals(file.size, 4, "size attribute valid");
}, "Size attribute should return the byte size of the loaded file");

test(function() {
  assert_equals(file.lastModifiedDate, null, "lastModifiedDate attribute");
}, "lastModifiedDate attribute should return null in the Resource Loader API");

