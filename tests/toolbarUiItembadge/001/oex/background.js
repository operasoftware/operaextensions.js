opera
	.isReady(function() {
	    var theButton;
	    window
		    .addEventListener(
			    "load",
			    function() {
				var UIItemProperties = {
				    title : "001 - createItem blank",
				    badge : {}
				}
				theButton = opera.contexts.toolbar
					.createItem(UIItemProperties);
				opera.contexts.toolbar.addItem(theButton);
				MANUAL("There should be a blank badge now. In desktop, there should be no artifacts.");
			    }, false);
	});