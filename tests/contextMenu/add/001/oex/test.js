opera.isReady(function() {
    var l;
    createMenuItem({title: "Item 1", type: "entry"})    // 0
    createMenuItem({title: "Item 2", type: "folder"})   // 1
    createMenuItem({title: "Item 1.1"})                 // 2
    createMenuItem({title: "Item 2.1", type: "folder"}) // 3
    createMenuItem({title: "Item 2.2"})                 // 4
    createMenuItem({title: "Item 2.3"})                 // 5
    createMenuItem({title: "Item 2.4"})                 // 6

    createMenuItem({contexts: ["image"], title: "Image context"}) // 7
    createMenuItem({contexts: ["link"], title: "Link context"})   // 8

    test(function() {
      assert_true(m[0] !== undefined, "A menu should have been created.")
    }, "Creating MenuItem objects.")

    test(function() {
      menu.addItem(m[0])
      assert_equals(menu.length, 1, "There should be 1 menu item.")
      assert_equals(menu[0], m[0], "The correct menu item should be returned")
    }, "Adding an 'entry' item to the root menu context.")

    test(function() {
      l = menu.length
      assert_throws("NOT_SUPPORTED_ERR", function() {
        menu.addItem(m[1])
      }, "This should throw a NOT_SUPPORTED_ERR.")
      if (menu.length > l){menu.removeItem(menu.length - 1) // Remove the item if it was incorrectly added
}
      assert_equals(menu[0], m[0], "The correct menu item should be at index 0.")
    }, "Adding a second menu item to the root menu context.")

    test(function() {
      assert_throws("TYPE_MISMATCH_ERR", function() {
        m[0].addItem(m[2])
      }, "This should throw a TYPE_MISMATCH_ERR.")
    }, "Attempting to add a submenu item to an 'entry' item.")

    test(function() {
      menu.removeItem(0)
      menu.addItem(m[1])
      assert_equals(menu.length, 1, "The root menu should contain one item.")
      assert_equals(menu[0].title, m[1].title, "The correct menu item should be at index 0.")
    }, "Adding a 'folder' item to the root context menu.")

    test(function() {
      assert_equals(m[1].parent, menu, "The folder item's parent should be the root menu context.")
    }, "Checking the top level menu's parent.")

    test(function() {
      m[1].addItem(m[3])
      assert_equals(m[1].length, 1, "There should be 1 submenu item.")
      assert_equals(menu[0][0].title, m[3].title, "The correct menu item should be at index 0.")
      assert_equals(m[3].parent, m[1], "The menu item's parent should be set accordingly.")
    }, "Adding a menu item to a 'folder' item.")

    test(function() {
      assert_equals(m[3].parent, m[1], "The menu item's parent should be set to the parent folder item.")
    }, "Checking the menu item's parent.")

    test(function() {
      assert_throws("HIERARCHY_REQUEST_ERR", function() {
        m[3].addItem(m[1])
      }, "This should throw a HIERARCHY_REQUEST_ERR.")
    }, "Attempting to add a menu item as a descendant of itself.")


    l = m[1].length // Record the length now for use in the second test below this line
    test(function() {
      assert_throws("HIERARCHY_REQUEST_ERR", function() {
        m[1].addItem(m[4], m[0])
      }, "This should throw a HIERARCHY_REQUEST_ERR.")
    }, "Adding one menu item before another with a different parent.")


    test(function() {
      // Inspecting the menu to ensure the previous tests have not made incorrect alterations
      if (m[1].length !== l) {
        for (var i = 0; i < menu[0].length; i++) { // Find and remove the incorrect item
          if (menu[0][i].title === m[4].title){menu[0].removeItem(i)
}        }

        assert_unreached("The length is incorrect, menu item was incorrectly added.")
      }

      assert_equals(menu[0][0].title, m[3].title, "The correct menu item should be at index 0.")
    }, "Verifying the expected state of the menu.")

    test(function() {
      m[1].addItem(m[5])
      assert_equals(menu[0][0].title, m[3].title, "The correct menu item should be at index 0 (after).")
      assert_equals(menu[0][1].title, m[5].title, "The correct menu item should be at index 1.")
    }, "Add a second submenu item.")

    test(function() {
      l = m[1].length
      m[1].addItem(m[3], m[3]) // This should not have any effect on its current index
      assert_equals(m[1].length, l, "The menu item should not have been added again, check the length.")
      assert_equals(menu[0][0].title, m[3].title, "The correct menu item should be at index 0.")
      assert_equals(menu[0][1].title, m[5].title, "The correct menu item should be at index 1.")
    }, "Attempting to add an existing menu item before itself.")

    test(function() {
      l = m[1].length
      assert_throws("HIERARCHY_REQUEST_ERR", function() {
        m[1].addItem(m[6], m[6])
      }, "This should throw a HIERARCHY_REQUEST_ERR.")
      assert_equals(m[1].length, l, "The length should not have increased.")
    }, "Adding a new menu item before itself.")

    test(function() {
      l = m[1].length
      m[1].removeItem(1000)
      assert_equals(m[1].length, l, "The length should not have decreased")
    }, "Removing an item with an out of range index.")

    test(function() {
      menu.removeItem(0)
      assert_equals(menu.length, 0, "The root menu should contain zero items.")
      assert_equals(m[1].parent, null, "The folder item should not have a parent after being removed.")
    }, "Removing the top level folder.")

    test(function() {
     menu.addItem(m[7]) // Add one for image context
     assert_throws("NOT_SUPPORTED_ERR", function() {
       menu.addItem(m[8]) // Attempt to add one for link context
     }, "This should throw a NOT_SUPPORTED_ERR.")
    }, "Attempt to add multiple menu items to the root context applying to different contexts.")

    test(function() {
      assert_throws("TYPE_MISMATCH_ERR", function() {
        m[0].addItem()
      }, "This should throw a TYPE_MISMATCH_ERR.")
    }, "Calling addItem() with no parameters.")

    test(function() {
      assert_throws("TYPE_MISMATCH_ERR", function() {
        m[0].addItem(null)
      }, "This should throw a TYPE_MISMATCH_ERR.")
    }, "Calling addItem() with null value.")

    test(function() {
      assert_throws("TYPE_MISMATCH_ERR", function() {
        m[0].removeItem()
      }, "This should throw a TYPE_MISMATCH_ERR.")
    }, "Calling removeItem() with no parameters.")
});
