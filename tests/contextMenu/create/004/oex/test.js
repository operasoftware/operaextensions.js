opera.isReady(function() {
    var mi; // Menu item

    test(function() {
      mi = menu.createItem({title: "Test"})
      assert_equals(mi.title, "Test", "The title should be Test.")
    }, "Specified title: Test.");

    test(function() {
      mi = menu.createItem({title: "Null\u0000Character"})
      assert_equals(mi.title, "Null\u0000Character", "The title should contain a U+0000 NULL character.")
    }, "Specified title: Null character.");

    test(function() {
      mi = menu.createItem({title: "Invalid\uFFFFCharacter"})
      assert_equals(mi.title, "Invalid\uFFFFCharacter", "The title should contain a U+FFFF character.")
    }, "Specified title: Invalid character.");

    test(function() {
      mi = menu.createItem({title: "Really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title."}) // 3
      assert_equals(mi.title, "Really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title really long title.", "The title should be really long.")
    }, "Specified title: Really long title.");

    test(function() {
      mi = menu.createItem({title: null})
      assert_equals(mi.title, "null", "The title property should be the string 'null'.")
    }, "Specified title: stringifying null.");

    test(function() {
      mi = menu.createItem({title: undefined})
      assert_equals(mi.title, "undefined", "The title property should be the string 'undefined'.")
    }, "Specified title: stringifying undefined");

    test(function() {
      mi = menu.createItem({title: 1})
      assert_equals(mi.title, "1", "The title should be 1.")
    }, "Specified title: a number cast to string.");

    test(function() {
      mi = menu.createItem({title: true})
      assert_equals(mi.title, "true", "The title should be true.")
    }, "Specified title: a boolean cast to string.");

    test(function() {
      mi = menu.createItem({title: {}})
      assert_equals(mi.title, "[object Object]", "The title should be [object Object].")
    }, "Specified title: an object cast to string.");

    test(function() {
      mi = menu.createItem({title: ""})
      assert_equals(mi.title, "", "The title should be empty.")
    }, "Specified title: empty string.");

    test(function() {
      mi.title = "PASS"
      assert_equals(mi.title, "PASS", "The title should be PASS.")
    }, "Setting the title property.");
});