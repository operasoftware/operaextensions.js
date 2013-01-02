opera.isReady(function() {
    var mi; // Menu item

    test(function() {
      mi = menu.createItem({contexts: ['all', 'page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio']})
      assert_true(Array.isArray(mi.contexts), "The value should be an array.")
      assert_array_equals(mi.contexts, ['all', 'page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio'], "The contexts should be an array of all valid values.")
    }, "Specified contexts: valid values.");

    test(function() {
      mi = menu.createItem({contexts: ['ALL', 'PAGE', 'FRAME', 'SELECTION', 'LINK', 'EDITABLE', 'IMAGE', 'VIDEO', 'AUDIO']})
      assert_true(Array.isArray(mi.contexts), "The value should be an array.")
      assert_array_equals(mi.contexts, ['ALL', 'PAGE', 'FRAME', 'SELECTION', 'LINK', 'EDITABLE', 'IMAGE', 'VIDEO', 'AUDIO'], "The contexts should be an array of all specified values.")
    }, "Specified contexts: uppercase values.");

    test(function() {
      mi = menu.createItem({contexts: []})
      assert_true(Array.isArray(mi.contexts), "The value should be an array.")
      assert_array_equals(mi.contexts, [], "The contexts should be an empty array.")
    }, "Specified contexts: empty array.");

    test(function() {
      mi = menu.createItem({contexts: ["unknown"]})
      assert_true(Array.isArray(mi.contexts), "The value should be an array.")
      assert_array_equals(mi.contexts, ["unknown"], "The contexts should be an array of the specified value.")
    }, "Specified contexts: unknown value.");

    test(function() {
      mi = menu.createItem({contexts: [""]})
      assert_true(Array.isArray(mi.contexts), "The value should be an array.")
      assert_array_equals(mi.contexts, [""], "The contexts should be an array of the specified value.")
    }, "Specified contexts: empty string value.");

    test(function() {
        assert_throws(new TypeError(), function() {
          menu.createItem({contexts: null})
        }, "This should throw a TypeError")
    }, "Unspecified contexts (null).");

    test(function() {
      assert_throws(new TypeError(), function() {
        menu.createItem({contexts: undefined})
      }, "This should throw a TypeError")
    }, "Unspecified contexts (undefined).");

    test(function() {
      mi = menu.createItem({contexts: []})
      mi.contexts.push("image")
      assert_array_equals(mi.contexts, ["image"], "The contexts should contain the specified values.")
    }, "Editing the contexts array.");

    test(function() {
      mi = menu.createItem({contexts: []})
      mi.contexts = ["image", "audio", "video"]
      assert_array_equals(mi.contexts, ["image", "audio", "video"], "The contexts should contain the specified values.")
    }, "Replacing the contexts array.");
});