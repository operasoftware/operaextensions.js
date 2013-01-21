opera.isReady(function() {
    var theButton;
    window.addEventListener(
			    "load",
			    function() {
				var UIItemProperties = {
				    disabled : false,
				    title : "003 - createItem http href",
				    icon : "/oex/icon.png",
				    popup : {
					href : "http://www.opera.com/",
					width : 100,
					height : 100
				    }
				}
				theButton = opera.contexts.toolbar
					.createItem(UIItemProperties);
				opera.contexts.toolbar.addItem(theButton);
				MANUAL("This is the created UIItem, it should have a popup http href defined:\n"
					+ getProperties(theButton));
			    }, false);
	});