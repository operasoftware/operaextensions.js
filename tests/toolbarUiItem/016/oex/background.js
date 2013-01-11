opera.isReady(function(){
    window.addEventListener("load", function(){
        var theButton_1;
        theButton_1 = opera.contexts.toolbar.createItem( {
          title: "016 - createItem multiple",
          icon: "oex/icon.png"
        });
        var theButton_2;
        theButton_2 = opera.contexts.toolbar.createItem( {
        icon: "oex/icon.png",
          title: "016 - createItem multiple"
        });
        opera.contexts.toolbar.addItem( theButton_1 );
        try{
          opera.contexts.toolbar.addItem( theButton_2 );
          MANUAL( "If there are two buttons in Opera's UI, this test has failed. " + getProperties( opera.contexts.toolbar, 3 ) );
        } catch (e) {
          PASS( "An error occurred when adding a second button" + getProperties( opera.contexts.toolbar, 3 ) );
        }
    }, false);
});