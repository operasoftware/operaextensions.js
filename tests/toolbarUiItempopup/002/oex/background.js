opera.isReady(function() {
	    var theButton;
	    window
		    .addEventListener(
			    "load",
			    function() {
				var UIItemProperties = {
				    disabled : false,
				    title : "002 - createItem href",
				    icon : "icon.png",
				    popup : {
					href : "oex/popup.html",
					width : 100,
					height : 100
				    }
				}
				theButton = opera.contexts.toolbar
					.createItem(UIItemProperties);

				opera.contexts.toolbar.addItem(theButton);
				MANUAL("This is the created UIItem, it should have a popup relative href defined:\n"
					+ getProperties(theButton));
			    }, false);
	});