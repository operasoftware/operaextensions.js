opera.isReady(function() {
    var mi; // Menu item

    test(function() {
      mi = menu.createItem({targetURLPatterns: ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""]})
      assert_true(Array.isArray(mi.targetURLPatterns), "The value should be an array.")
    }, "Return type of targetURLPatterns.");

    test(function() {
      mi = menu.createItem({targetURLPatterns: ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""]})
      assert_array_equals(mi.targetURLPatterns, ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""], "The targetURLPatterns should be an array of URL patterns.")
    }, "Specified targetURLPatterns: valid values.");

    test(function() {
      mi = menu.createItem({targetURLPatterns: ["example\uFFFF", "new\u000D\u000Aline", "invalid\uD800character"]})
      assert_array_equals(mi.targetURLPatterns, ["example\uFFFF", "new\u000D\u000Aline", "invalid\uD800character"], "The targetURLPatterns should be an array of URL patterns.")
    }, "Specified targetURLPatterns: invalid values.");

    test(function() {
      mi = menu.createItem({targetURLPatterns: ["*", "*"]})
      assert_array_equals(mi.targetURLPatterns, ["*", "*"], "The targetURLPatterns should be an array of URL patterns.")
    }, "Specified targetURLPatterns: duplicate values.");

    test(function() {
      mi = menu.createItem({targetURLPatterns: []})
      assert_true(Array.isArray(mi.targetURLPatterns), "The value should be an array.")
      assert_array_equals(mi.targetURLPatterns, [], "The targetURLPatterns should be an empty array.")
    }, "Specified targetURLPatterns: empty array.");

    test(function() {
      mi = menu.createItem({targetURLPatterns: null})
      assert_equals(mi.targetURLPatterns, null, "The targetURLPatterns should be nullable.")
    }, "Unspecified targetURLPatterns (null).");

    test(function() {
      mi = menu.createItem({targetURLPatterns: undefined})
      assert_equals(mi.targetURLPatterns, null, "The targetURLPatterns should be nullable.")
    }, "Unspecified targetURLPatterns (undefined).");

    test(function() {
      mi = menu.createItem({})
      mi.targetURLPatterns = ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""]
      assert_array_equals(mi.targetURLPatterns, ["||example.org*", "||example.com^foo*", "https://example.net^foo*", ""], "The targetURLPatterns should be an array of URL patterns.")
    }, "Setting targetURLPatterns.");
});