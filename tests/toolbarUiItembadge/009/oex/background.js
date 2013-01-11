opera.isReady(function(){
    var theButton;

    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "009 - createItem display none",
          icon: "oex/icon.png",
          badge: {
            textContent: 'This is the Badge.',
            backgroundColor: '#ffeedd',
            color: '#404040',
            display: 'none'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "There should be a badge, but not visible." );
    }, false);
});