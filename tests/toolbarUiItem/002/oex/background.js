opera.isReady(function() {
    window.addEventListener("load", function() {

	var theButton;
	var ToolbarUIItemProperties = {
	    title : "002 - createItem title"
	}
	theButton = opera.contexts.toolbar.createItem(ToolbarUIItemProperties);
	opera.contexts.toolbar.addItem(theButton);
	MANUAL("If there is a button in Opera's UI, this test has passed."
		+ getProperties(theButton, 5));
    }, false);
});