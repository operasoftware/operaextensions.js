opera.isReady(function() {
    window.addEventListener("load", function(){
        var theButton;
        var ToolbarUIItemProperties = {
          title: "006 - createItem w http icon",
          disabled: false,
          icon: "http://www.opera.com/favicon.ico"
        }
        theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "If there is a enabled button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
    }, false);
});