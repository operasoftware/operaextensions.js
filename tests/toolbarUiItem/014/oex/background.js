opera.isReady(function(){
    var timer = null, counter = 0;
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "014 - Item enumerate",
          icon: "oex/icon.png",
          onclick: function(){
            MANUAL( "A fully initialised ToolbarUIItem looks like this:\n" + getProperties( theButton, 5 ) );
          },
          badge: {
            textContent: 'Description',
            backgroundColor: '#ffeedd',
            color: '#404040',
            display: 'hidden'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "A fully initialised ToolbarUIItem looks like this:\n" + getProperties( theButton, 5 ) );
    }, false);
});