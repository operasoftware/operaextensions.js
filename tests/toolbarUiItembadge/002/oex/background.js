opera.isReady(function() {
    var theButton;
    window.addEventListener("load", function() {
	var UIItemProperties = {
	    title : "002 - createItem textContent",
	    icon: 'oex/icon.png',
	    badge : {
		textContent : "test"
	    }
	}
	theButton = opera.contexts.toolbar.createItem(UIItemProperties);
	opera.contexts.toolbar.addItem(theButton);
	MANUAL("There should be a badge with 'test' written in it now.");
    }, false);
});