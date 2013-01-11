opera.isReady(function(){
    window.addEventListener("load", function(){
        var theButton;
        var UIItemProperties = {
          disabled: false,
          title: "011 - createItem w onremove",
          icon: "oex/icon.png",
          onremove: function(){
            PASS( getProperties(event, 2) );
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        opera.contexts.toolbar.removeItem( theButton );
        MANUAL( "If a button is added and then removed immediately, you should see a PASS in the error console." );
    }, false);
});