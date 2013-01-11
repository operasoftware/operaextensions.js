opera.isReady(function(){
    window.addEventListener("load", function(){
        var theButton;
        var UIItemProperties = {
          disabled: false,
          title: "012 - createItem w event listener remove",
          icon: "oex/icon.png"
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        theButton.addEventListener( "remove", function(){
          PASS( getProperties(event, 2) );
        },false);
        opera.contexts.toolbar.removeItem( theButton );
        MANUAL( "If a button is added and then removed immediately, you should see a PASS in the error console." );
    }, false);
});