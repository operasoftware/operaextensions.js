opera.isReady(function() {
    var theButton;
    window.addEventListener("load", function() {
	var UIItemProperties = {
	    disabled : false,
	    title : "008 - Item href change while open",
	    icon : "oex/icon.png",
	    popup : {
		href : "oex/popup.html",
		width : 100,
		height : 100
	    }
	};
	try {
	    theButton = opera.contexts.toolbar.createItem(UIItemProperties);
	    opera.contexts.toolbar.addItem(theButton);

	    opera.extension.onconnect = function( event ){
		event.source.postMessage( "Respond to this immediately" );
	    };
	    opera.extension.onmessage = function (event) {
		var msg = event.data;
		if(event.data = "Hi from popup") {
		    setTimeout(function() {
	    		theButton.popup.href = "oex/popup2.html";
	    		MANUAL("The page has been changed. It should now say PASS.");
	    	    }, 500);
		}
	    }

	    MANUAL("The href will be changed after the popup is opened.");
	}catch(err){
	    FAIL(err);
	}
    }, false);
});