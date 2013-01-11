opera.isReady(function(){
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "010 - createItem display block",
          icon: "oex/icon.png",
          badge: {
            textContent: 'This is the Badge.',
            backgroundColor: '#ffeedd',
            color: '#404040',
            display: 'block'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "There should be a badge, and it should be visible." );
    }, false);
});