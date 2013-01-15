opera.isReady(function() {
    var theButton;
    window.addEventListener( "load", function() {
	var UIItemProperties = {
	    disabled : false,
	    title : "007 - Item href change",
	    icon : "oex/icon.png",
	    popup : {
		href : "oex/popup.html",
		width : 100,
		height : 100
	    }
	}
	theButton = opera.contexts.toolbar.createItem(UIItemProperties);
	opera.contexts.toolbar.addItem(theButton);
	MANUAL("The href is being changed.");
	theButton.popup.href = "oex/popup2.html";
	MANUAL("Click the popup to reveal PASS");
    }, false);
});