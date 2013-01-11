opera.isReady(function() {
    function func( event ){
      PASS( getProperties(event, 2) );
    }
    window.addEventListener("load", function(){
        var theButton;
        var UIItemProperties = {
          disabled: false,
          title: "009 - createItem w event listener click",
          icon: "oex/icon.png"
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        theButton.addEventListener( "click", func, false);
        MANUAL( "If there is an enabled button with a title and favicon, click the button to run the test." );
    }, false);
});