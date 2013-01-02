opera.isReady(function() {
    createMenuItem({})

    menu.addItem(m[0])

    test(function() {
      assert_equals(m[0].type, "entry", "The default type should be entry.")
    }, "Default MenuItem type.");

    test(function() {
      assert_true(Array.isArray(m[0].contexts), "The contexts property should be an array.")
      assert_array_equals(m[0].contexts, ["page"], "The default contexts array should contain nothing.")
    }, "Default MenuItem contexts.");

    test(function() {
      assert_equals(m[0].title, "", "The title property should default to an empty string.")
    }, "Default MenuItem title.");

    test(function() {
      assert_false(m[0].disabled, "The disabled property should default to false.")
    }, "Default MenuItem disabled state.");

    test(function() {
      assert_equals(m[0].icon, "", "The icon property should default to an empty string.")
    }, "Default MenuItem icon.");

    test(function() {
      assert_equals(m[0].id, "", "The id property should default to an empty string.")
    }, "Default MenuItem id.");

    test(function() {
      assert_equals(m[0].documentURLPatterns, null, "The documentURLPatterns property should default to an null.")
    }, "Default MenuItem documentURLPatterns.");

    test(function() {
      assert_equals(m[0].targetURLPatterns, null, "The targetURLPatterns property should default to an null.")
    }, "Default MenuItem targetURLPatterns.");

    test(function() {
      assert_equals(m[0].onclick, null, "The onclick property should default to null.")
    }, "Default MenuItem onclick handler");
});