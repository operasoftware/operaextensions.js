opera.isReady(function() {
    var mi; // Menu item

    test(function() {
      mi = menu.createItem({type: "entry"})
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Specified type: entry.");

    test(function() {
      mi = menu.createItem({type: "folder"})
      assert_equals(mi.type, "folder", "The type should be folder.")
    }, "Specified type: folder.");

    test(function() {
      mi = menu.createItem({type: "line"})
      assert_equals(mi.type, "line", "The type should be line.")
    }, "Specified type: line.");

    test(function() {
      mi = menu.createItem({type: "unknown"})
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Unrecognised type (string), default to entry.");

    test(function() {
      mi = menu.createItem({type: null})
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Unrecognised type (null), default to entry.");

    test(function() {
      mi = menu.createItem({type: undefined})
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Unrecognised type (undefined), default to entry.");

    test(function() {
      mi = menu.createItem({type: 1})
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Unrecognised type (number), default to entry.");

    test(function() {
      mi = menu.createItem({type: true})
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Unrecognised type (boolean), default to entry.");

    test(function() {
      mi = menu.createItem({type: {}})
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Unrecognised type (object), default to entry.");

    // Readonly property
    test(function() {
      mi = menu.createItem({type: "entry"})
      mi.type = "folder"
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Setting the type property to folder.");

    test(function() {
      mi = menu.createItem({type: "entry"})
      mi.type = "line"
      assert_equals(mi.type, "entry", "The type should be entry.")
    }, "Setting the type property to line.");

    test(function() {
      mi = menu.createItem({type: "folder"})
      mi.type = "entry"
      assert_equals(mi.type, "folder", "The type should be folder.")
    }, "Setting the type property to entry.");

    test(function() {
      mi = menu.createItem({type: "folder"})
      delete mi.type
      assert_equals(mi.type, "folder", "The type should be folder.")
    }, "Attempting to delete the type property.");
});