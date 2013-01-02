opera.isReady(function() {
    window.addEventListener("load", function () {
	opera.extension.tabs.create({url: "data:text/plain, Login to hotmail.com from the browser and then click the button to open the extension popup page. You should be logged in in the popup also.",focused:true});
	var btn = opera.contexts.toolbar.createItem({title:"Click to test", popup: { href: "/oex/t.html", height: 400, width: 400}});
	opera.contexts.toolbar.addItem(btn);
	reported = true;
    }, false);
});
