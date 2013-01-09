opera
	.isReady(function() {
	    window

		    .addEventListener(
			    "load",
			    function() {
				var theButton;
				var ToolbarUIItemProperties = null;
				MANUAL("Attempting to make a back button. If an error is thrown, this test passes.");
				try {
				    theButton = opera.contexts.toolbar
					    .createItem(ToolbarUIItemProperties);
				    opera.contexts.toolbar.addItem(theButton);
				} catch (e) {
				    PASS("An error was thrown: "
					    + getProperties(e, 1));
				}
			    }, false);
	});