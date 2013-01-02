opera.isReady(function() {
    window.addEventListener( "load", function() {
	opera.extension.tabs.create({
	    url : ckURL + "?setck=" + ckData
	});
	opera.extension.tabs.create({
	    url : "data:text/plain, Click the button added by the extension to test.",
	    focused : true
	});

	var btn = opera.contexts.toolbar.createItem({
	    title : "Click to test",
	    popup : {
		href : "/oex/t.html",
		height : 600,
		width : 400
	    }
	});
	opera.contexts.toolbar.addItem(btn);
	/* This is a manual test */
	reported = true;
    }, false);
});