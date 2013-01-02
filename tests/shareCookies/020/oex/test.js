opera.isReady(function() {
    window.addEventListener("load", function () {
        var scr = document.createElement("script");
        scr.src = ckURL + "?setck=name=ck_bg_process;value=1;";
        document.body.appendChild(scr);
        opera.extension.tabs.create({url: "data:text/plain, Enable confirmation for setting cookies in prefs., and then clear cookies. After this restart the extension and click the button created by the extension. Pass if a cookie confirmation dialog is not shown on restarting the extension and the cookie 'ck_bg_process' is not shown as set in the popup." , focused: true});
        var btn = opera.contexts.toolbar.createItem({title:"Click to test", popup: { href: "/oex/t.html", height: 600, width: 400}});
        opera.contexts.toolbar.addItem(btn);
        /* This is a manual test */
        reported = true;
    }, false);

});