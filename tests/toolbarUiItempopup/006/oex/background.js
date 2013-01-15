opera
	.isReady(function() {

	    var theButton;
	    window
		    .addEventListener(
			    "load",
			    function() {
				var UIItemProperties = {
				    disabled : false,
				    title : "006 - createItem height",
				    icon : "oex/icon.png",
				    popup : {
					href : "oex/popup.html",
					height : 200
				    }
				}
				theButton = opera.contexts.toolbar
					.createItem(UIItemProperties);
				opera.contexts.toolbar.addItem(theButton);
				MANUAL("This is the created UIItem, it should have a popup of height 200"
					+ getProperties(theButton));
			    }, false);
	});