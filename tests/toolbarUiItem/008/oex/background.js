opera.isReady(function() {
	    window
		    .addEventListener(
			    "load",
			    function() {
				var theButton;
				var UIItemProperties = {
				    disabled : false,
				    title : "008 - createItem w onclick",
				    icon : "oex/icon.png",
				    onclick : function(event) {
					PASS(getProperties(event, 2));
				    }
				}
				theButton = opera.contexts.toolbar.createItem(UIItemProperties);
				opera.contexts.toolbar.addItem(theButton);
				MANUAL("If there is an enabled button with a title and favicon, click the button to run the test.");
			    }, false);
	});