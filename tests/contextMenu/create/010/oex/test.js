opera.isReady(function() {
    var mi; // Menu item

    test(function() {
      createMenuItem({})
      assert_equals(m[0].id, "", "The id should be an empty string.")
      assert_equals(m[0].id, "", "The id property should default to an empty string.")
    }, "Unspecified id.");


    test(function() {
      mi = menu.createItem({id: "foo"})
      assert_equals(mi.id, "foo", "The id should be foo.")
    }, "Specified id: foo.");

    test(function() {
      mi = menu.createItem({id: ""})
      assert_equals(mi.id, "", "The id should be an empty string.")
    }, "Specified id: empty string.");

    // Readonly property
    test(function() {
      mi = menu.createItem({id: "foo"})
      mi.id = "bar"
      assert_equals(mi.id, "foo", "The id should be foo.")
    }, "Attempting to set the id property.");

    test(function() {
      mi = menu.createItem({id: null})
      assert_equals(mi.id, "null", "The id should be the string 'null'.")
    }, "Specified id: stringifying null.");

    test(function() {
      mi = menu.createItem({id: undefined})
      assert_equals(mi.id, "undefined", "The id should be the string 'undefined'.")
      }, "Specified id: stringifying undefined.");

    test(function() {
      mi = menu.createItem({id: 1})
      assert_equals(mi.id, "1", "The id should be the string '1'.")
      }, "Specified id: stringifying a number.");

    test(function() {
      mi = menu.createItem({id: true})
      assert_equals(mi.id, "true", "The id should be the string true.")
      }, "Specified id: stringifying a boolean.");

    test(function() {
      mi = menu.createItem({id: "foo"})
      delete mi.id
      assert_equals(mi.id, "foo", "The id should be foo.")
    }, "Attempting to delete the id property.");
});