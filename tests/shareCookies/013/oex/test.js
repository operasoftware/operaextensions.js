opera.isReady(function() {

    window.addEventListener("load", function ()
						{
	// opera.extension.tabs.create({url: ckURL + "?setck=" + ckData});
	opera.extension.tabs.create({url: "data:text/plain, Open '" + ckURL + "?setck=" + ckData + "' in a private tab and then click the button added by the extension to check cookies. PASS if the cookies 'Set' in private tab are not present in the popup page." , focused: true});

	var btn = opera.contexts.toolbar.createItem({title:"Click to test", popup: { href: "/oex/t.html", height: 600, width: 400}});
	opera.contexts.toolbar.addItem(btn);

	/* This is a manual test */
	reported = true;
    }, false);


});