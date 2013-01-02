opera.isReady(function() {
    var mi; // Menu item

    test(function() {
      mi = menu.createItem({documentURLPatterns: ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""]})
      assert_true(Array.isArray(mi.documentURLPatterns), "The value should be an array.")
    }, "Return type of documentURLPatterns.");

    test(function() {
      mi = menu.createItem({documentURLPatterns: ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""]})
      assert_array_equals(mi.documentURLPatterns, ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""], "The documentURLPatterns should be an array of URL patterns.")
    }, "Specified documentURLPatterns: valid values.");

    test(function() {
      mi = menu.createItem({documentURLPatterns: ["example\uFFFE", "new\u000D\u000Aline", "invalid\uD800character"]})
      assert_array_equals(mi.documentURLPatterns, ["example\uFFFE", "new\u000D\u000Aline", "invalid\uD800character"], "The documentURLPatterns should be an array of URL patterns.")
    }, "Specified documentURLPatterns: invalid values.");

    test(function() {
      mi = menu.createItem({documentURLPatterns: ["*", "*"]})
      assert_array_equals(mi.documentURLPatterns, ["*", "*"], "The documentURLPatterns should be an array of URL patterns.")
    }, "Specified documentURLPatterns: duplicate values.");

    test(function() {
      mi = menu.createItem({documentURLPatterns: []})
      assert_true(Array.isArray(mi.documentURLPatterns), "The value should be an array.")
      assert_array_equals(mi.documentURLPatterns, [], "The documentURLPatterns should be an empty array.")
    }, "Specified documentURLPatterns: empty array.");

    test(function() {
      mi = menu.createItem({documentURLPatterns: []})
      assert_true(Array.isArray(mi.documentURLPatterns), "The value should be an array.")
      assert_array_equals(mi.documentURLPatterns, [], "The documentURLPatterns should be an empty array.")
    }, "Specified documentURLPatterns: empty array.");

    test(function() {
      mi = menu.createItem({documentURLPatterns: null})
      assert_equals(mi.documentURLPatterns, null, "The documentURLPatterns should be nullable.")
    }, "Unspecified documentURLPatterns (null).");

    test(function() {
      mi = menu.createItem({documentURLPatterns: undefined})
      assert_equals(mi.documentURLPatterns, null, "The documentURLPatterns should be nullable.")
    }, "Unspecified documentURLPatterns (undefined).");

    test(function() {
      mi = menu.createItem({})
      mi.documentURLPatterns = ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""]
      assert_array_equals(mi.documentURLPatterns, ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""], "The documentURLPatterns should be an array of URL patterns.")
    }, "Setting documentURLPatterns.");
});