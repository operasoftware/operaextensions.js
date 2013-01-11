opera.isReady(function(){
    var timer = null, counter = 0;
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "015 - toolbar enumerate",
          icon: "oex/icon.png",
          onclick: function(){
            MANUAL( "Fully initialised opera.contexts looks like this:\n" + getProperties( opera.contexts, 5 ) );
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
        MANUAL( "Fully initialised opera.contexts looks like this:\n" + getProperties( opera.contexts, 5 ) );
    }, false);
});