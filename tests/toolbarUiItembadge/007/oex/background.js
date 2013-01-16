opera.isReady(function(){
    var timer = null, counter = 0;
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: true,
          title: "007 - createItem disabled button",
          icon: "oex/icon.png",
          badge: {
            textContent: 'Description',
            backgroundColor: '#ffeedd',
            color: '#404040',
            display: 'hidden'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "If there is an disabled button with a title and favicon, click the button to enable" );
    }, false);
});