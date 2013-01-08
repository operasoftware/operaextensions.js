opera.isReady(function(){
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "000 - exists",
          icon: "./oex/icon.png",
          popup: {
            href: "./oex/popup.html" ,
            width: 100,
            height: 100
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "If there is an enabled button with a title and favicon, click the button to open the popup." );
    }, false);
});