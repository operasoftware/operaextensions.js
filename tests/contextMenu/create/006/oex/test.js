opera.isReady(function() {
    var mi; // Menu item

    test(function() {
      mi = menu.createItem({disabled: true})
      assert_true(mi.disabled, "The menu item should be disabled.")
    }, "Specified disabled state: true.");

    test(function() {
      mi = menu.createItem({disabled: false})
      assert_false(mi.disabled, "The menu item should not be disabled.")
    }, "Specified disabled state: false.");

    test(function() {
      mi = menu.createItem({disabled: null})
      assert_false(mi.disabled, "The menu item should not be disabled.")
    }, "Specified disabled state: null cast to boolean.");

    test(function() {
      mi = menu.createItem({disabled: undefined})
      assert_false(mi.disabled, "The menu item should not be disabled.")
    }, "Specified disabled state: undefined cast to boolean.");

    test(function() {
      mi = menu.createItem({disabled: 0})
      assert_false(mi.disabled, "The menu item should not be disabled.")
    }, "Specified disabled state: a number cast to boolean.");

    test(function() {
      mi = menu.createItem({disabled: 1})
      assert_true(mi.disabled, "The menu item should be disabled.")
    }, "Specified   disabled state: a non-zero number cast to boolean.");

    test(function() {
      mi = menu.createItem({disabled: "test"})
      assert_true(mi.disabled, "The menu item should be disabled.")
    }, "Specified   disabled state: a non-empty string cast to boolean.");

    test(function() {
      mi = menu.createItem({disabled: ""})
      assert_false(mi.disabled, "The menu item should not be disabled.")
    }, "Specified disabled state: an empty string cast to a boolean.");

    test(function() {
      mi = menu.createItem({disabled: true})
      mi.disabled = false
      assert_false(mi.disabled, "The menu item should be disabled.")
    }, "Setting the disabled property to false");

    test(function() {
      mi = menu.createItem({disabled: false})
      mi.disabled = true
      assert_true(mi.disabled, "The menu item should be disabled.")
    }, "Setting the disabled property to true");
});