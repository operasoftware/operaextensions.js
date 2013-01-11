opera.isReady(function() {
    function func( event ){
      FAIL( getProperties(event, 2) );
    }
    window.addEventListener("load", function(){
        var theButton;
        var UIItemProperties = {
          disabled: false,
          title: "010 - createItem w event listener click removed",
          icon: "oex/icon.png"
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );

        theButton.addEventListener( "click", func, false);

        theButton.removeEventListener( "click", func, false);

        theButton.addEventListener( "click", function( event ){
          MANUAL( "This should be the last statement." );
        }, false);

        MANUAL( "If there is an enabled button with a title and favicon, click the button to run the test." );
    }, false);
});