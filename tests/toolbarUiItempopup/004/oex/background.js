opera
	.isReady(function() {

	    var theButton;
	    window
		    .addEventListener(
			    "load",
			    function() {
				var UIItemProperties = {
				    disabled : false,
				    title : "004 - createItem datauri href",
				    icon : "/oex/icon.png",
				    popup : {
					href : "data:text/html;charset=utf-8,%3CDOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%3Cmeta%20http-equiv%3D%22refresh%22%20content%3D%222%3Burl%3Dhttp%3A%2F%2Fwww.opera.com%2F%22%3E%3C%2Fhead%3E%3Cbody%3E%3Cp%3ETest.%20Should%20reload%20to%20opera.com%3C%2Fp%3E%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A",
					width : 100,
					height : 100
				    }
				}
				theButton = opera.contexts.toolbar
					.createItem(UIItemProperties);
				opera.contexts.toolbar.addItem(theButton);
				MANUAL("This is the created UIItem, it should have a popup datauri href\n"
					+ getProperties(theButton));
			    }, false);
	});