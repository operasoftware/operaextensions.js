window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "005 - createItem w icon",
      disabled: false,
      icon: "icon.png"
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a enabled button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
}, false);
