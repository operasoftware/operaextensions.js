opera
	.isReady(function() {

	    var theButton;
	    window
		    .addEventListener(
			    "load",
			    function() {
				var UIItemProperties = {
				    disabled : false,
				    title : "010 - Item href change while open from within",
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
				MANUAL("The href will be changed after the popup is opened.");
			    }, false);
	});