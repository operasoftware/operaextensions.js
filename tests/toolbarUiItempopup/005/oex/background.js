opera.isReady(function() {
    var theButton;
    window.addEventListener("load", function() {
	var UIItemProperties = {
	    disabled : false,
	    title : "005 - createItem width",
	    icon : "oex/icon.png",
	    popup : {
		href : "oex/popup.html",
		width : 200
	    }
	}
	theButton = opera.contexts.toolbar.createItem(UIItemProperties);
	opera.contexts.toolbar.addItem(theButton);
	MANUAL("This is the created UIItem, it should have a popup http href defined:\n" + getProperties(theButton)); }, false);
});