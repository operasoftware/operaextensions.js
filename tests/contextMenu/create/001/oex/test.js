opera.isReady(function() {
    test(function() {
      assert_exists(opera, "contexts", "Root context");
      assert_exists(opera.contexts, "menu", "Root menu context");
    }, "Interface check: opera.contexts.menu");

    createMenuItem({})

    test(function() {
      assert_true(m[0] !== undefined, "A menu should have been created")
    }, "Check that a MenuItem object was created.");

    test(function() {
      assert_exists(m[0], "type", "Check the menu has a type property")
    }, "Interface check: menu.type");

    test(function() {
      assert_exists(m[0], "contexts", "Check the menu has a contexts property")
    }, "Interface check: menu.contexts");

    test(function() {
      assert_exists(m[0], "disabled", "Check the menu has a disabled property")
    }, "Interface check: menu.disabled");

    test(function() {
      assert_exists(m[0], "title", "Check the menu has a title property")
    }, "Interface check: menu.title");

    test(function() {
      assert_exists(m[0], "icon", "Check the menu has an icon property")
    }, "Interface check: menu.icon");

    test(function() {
      assert_exists(m[0], "documentURLPatterns", "Check the menu has a documentURLPatterns property")
    }, "Interface check: menu.documentURLPatterns");

    test(function() {
      assert_exists(m[0], "targetURLPatterns", "Check the menu has a targetURLPatterns property")
    }, "Interface check: menu.targetURLPatterns");

    test(function() {
      assert_exists(m[0], "onclick", "Check the menu has an onclick property")
    }, "Interface check: menu.onclick");

    test(function() {
      assert_equals(m[0].toString(), "[object MenuItem]", "The MenuItem should stringify correctly.")
    }, "Stringifying the menu item objects.");

    test(function() {
      assert_equals(menu.toString(), "[object MenuContext]", "The root menu context should stringify correctly.")
    }, "Stringifying the root menu context.");

    test(function() {
      assert_true(m[0] instanceof MenuItem, "The object should be an instance of MenuItem.")
    }, "Checking instanceof MenuItem.");

    test(function() {
      assert_true(menu instanceof MenuContext, "The object should be an instance of MenuContext.")
    }, "Checking instanceof MenuContext.");

    test(function() {
      var expected = ["addEventListener","addItem","contexts","disabled","documentURLPatterns","icon","id","item","length","onclick","parent","removeEventListener","removeItem","targetURLPatterns","title","type"].sort()
      var found = []
      for (prop in m[0]) {
        found.push(prop)
      }
      found.sort()

      //console.log("MenuItem expected: " + expected.toString())
      //console.log("MenuItem found: " + found.toString())
      assert_array_equals(found, expected, "All of the properties should be enumerable.")
    }, "Enumerating a menu item's properties.");

    test(function() {
      var expected = ["addEventListener", "addItem", "createItem", "item", "length", "onclick", "removeItem", "removeEventListener"].sort()
      var found = []
      for (prop in menu) {
        found.push(prop)
      }
      found.sort()

      //console.log("RootMenuContext expected: " + expected.toString())
      //console.log("RootMenuContext found: " + found.toString())
      assert_array_equals(found, expected, "All of the properties should be enumerable.")
    }, "Enumerating the root menu context's properties.");
});