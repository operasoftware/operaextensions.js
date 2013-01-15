opera.isReady(function() {
    var theButton;
    window.addEventListener( "load", function() {

	var UIItemProperties = {
	    title : "001 - createItem blank",
	    badge : {}
	}
	theButton = opera.contexts.toolbar.createItem(UIItemProperties);
	try {
	    opera.contexts.toolbar.addItem(theButton);
	    MANUAL("There should be a blank badge now. In desktop, there should be no artifacts.");
	} catch(err) {
	    FAIL("error thrown when declaring empty badge [badge: {}] " + err );
	}
    }, false);
});