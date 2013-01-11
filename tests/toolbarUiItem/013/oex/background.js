opera.isReady(function(){
    function func( event ){
      FAIL( getProperties(event, 2) );
    }
    window.addEventListener("load", function(){
        var theButton;
        var UIItemProperties = {
          disabled: false,
          title: "013 - createItem w event listener remove removed",
          icon: "oex/icon.png"
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        theButton.addEventListener( "remove", func, false);
        theButton.removeEventListener( "remove", func, false);
        theButton.addEventListener( "remove", function( event ){
          MANUAL( "This should be the last statement." );
        }, false);
        opera.contexts.toolbar.removeItem( theButton );
        MANUAL( "If there is an enabled button with a title and favicon, click the button to run the test." );
    }, false);
});