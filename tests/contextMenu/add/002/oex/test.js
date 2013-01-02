opera.isReady(function() {
    createMenuItem({title: "Item 1", type: "folder"}) // 0
    createMenuItem({title: "Item 1.1"})               // 1
    createMenuItem({title: "Item 1.2"})               // 2
    createMenuItem({title: "Item 1.3"})               // 3
    createMenuItem({title: "Item 1.4"})               // 4
    createMenuItem({title: "Item 1.5"})               // 5
    createMenuItem({title: "Item 1.6"})               // 6
    createMenuItem({type: "line"})                    // 7

    test(function() {
      menu.addItem(m[0])
      assert_equals(menu.length, 1, "There should be 1 menu item.")
      assert_equals(menu[0], m[0], "The correct menu item should be at index 0.")
    }, "Adding an 'entry' item to the root menu context.")

    test(function() {
      menu[0].addItem(m[1])
      menu[0].addItem(m[5])
      assert_equals(menu[0][0].title, m[1].title, "The correct menu item should be at index 0.")
      assert_equals(menu[0][1].title, m[5].title, "The correct menu item should be at index 1.")
    }, "Adding submenu items.")

    test(function() {
      menu[0].addItem(m[4], 1)
      menu[0].addItem(m[2], 1)
      assert_equals(menu[0][0].title, m[1].title, "The correct menu item should be at index 0.")
      assert_equals(menu[0][1].title, m[2].title, "The correct menu item should be at index 1.")
      assert_equals(menu[0][2].title, m[4].title, "The correct menu item should be at index 2.")
      assert_equals(menu[0][3].title, m[5].title, "The correct menu item should be at index 3.")
    }, "Adding submenu items at specified index.")

    test(function() {
      menu[0].addItem(m[3], m[4])
      assert_equals(menu[0][0].title, m[1].title, "The correct menu item should be at index 0.")
      assert_equals(menu[0][1].title, m[2].title, "The correct menu item should be at index 1.")
      assert_equals(menu[0][2].title, m[3].title, "The correct menu item should be at index 2.")
      assert_equals(menu[0][3].title, m[4].title, "The correct menu item should be at index 3.")
      assert_equals(menu[0][4].title, m[5].title, "The correct menu item should be at index 4.")
    }, "Adding submenu items relative to others.")

    test(function() {
      menu[0].addItem(m[6], null)
      assert_equals(menu[0][5].title, m[6].title, "The correct menu item should be at index 5.")
    }, "Adding submenu items relative to null.")

    test(function() {
      while (menu[0].length > 0){menu[0].removeItem(0);}

      menu[0].addItem(m[3], 83498) // Inserted at pos 0
      menu[0].addItem(m[5], 4392) // Inserted as pos 1 (after m[3])
      menu[0].addItem(m[2], Infinity) // Converted to 0 per IDL requirements, inserted at pos 0 (before m[3])
      menu[0].addItem(m[4], -4294967294) // ToUint32(n) returns 2, inserted at pos 2 (before m[5])
      menu[0].addItem(m[1], NaN) // Converted to 0 per IDL requirements, inserted at pos 0 (before m[2])
      menu[0].addItem(m[6], -1) // ToUint32(n) returns 4294967295, inserted at pos 5 (after m[5])
      menu[0].addItem(m[7], 3) // Inserted as pos 3 (before m[4])

      assert_equals(menu[0][0].title, m[1].title, "The correct menu item should be at index 0.")
      assert_equals(menu[0][1].title, m[2].title, "The correct menu item should be at index 1.")
      assert_equals(menu[0][2].title, m[3].title, "The correct menu item should be at index 2.")
      assert_equals(menu[0][3].title, m[7].title, "The correct menu item should be at index 3.")
      assert_equals(menu[0][4].title, m[4].title, "The correct menu item should be at index 4.")
      assert_equals(menu[0][5].title, m[5].title, "The correct menu item should be at index 5.")
      assert_equals(menu[0][6].title, m[6].title, "The correct menu item should be at index 6.")
    }, "Adding submenu items with specified positions out of range.")
});
