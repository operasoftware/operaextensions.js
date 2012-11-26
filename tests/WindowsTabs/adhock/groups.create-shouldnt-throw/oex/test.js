win = windows.getAll()[0]

test(function() {
	g[0] = groups.create(
		[
			{ url: "data:text/plain,1" },
			{ url: "data:text/plain,2" },
			{ url: "data:text/plain,yay" },
		])

	assert_equals(g[0].tabs.getAll().length, 3)
	var tab = g[0].tabs.getAll()[2]

	g[1] = groups.create(
		[
			tab, // <-- throws
			{ url: "data:text/plain,9" }
		])

	assert_equals( g[0].tabs.getAll().length, 2)
	assert_equals( g[1].tabs.getAll().length, 2)
}, "Create group in default window")
