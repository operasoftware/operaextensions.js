opera
	.isReady(function() {
	    window
		    .addEventListener(
			    "load",
			    function() {
				var theButton;
				var ToolbarUIItemProperties = {
				    title : "003 - createItem disabled",
				    disabled : true
				}
				theButton = opera.contexts.toolbar
					.createItem(ToolbarUIItemProperties);
				opera.contexts.toolbar.addItem(theButton);
				MANUAL("If there is a disabled button in Opera's UI, this test has passed. "
					+ getProperties(theButton, 5));
			    }, false);
	});