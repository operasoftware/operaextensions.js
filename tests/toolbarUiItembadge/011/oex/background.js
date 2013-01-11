opera.isReady(function(){
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "011 - Item display toggle",
          icon: "oex/icon.png",
          onclick: function(){
              if( theButton.badge.display == "block" ){
                theButton.badge.display = "none";
                MANUAL( "If the Badge is now hidden, this test passes" );
              } else {
                theButton.badge.display = "block";
                MANUAL( "If the Badge is now shown, click again to hide" );
              }
          },
          badge: {
            textContent: 'This is the Badge.',
            backgroundColor: '#ffeedd',
            color: '#404040',
            display: 'none'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "If there is an enabled button with a title, favicon and a hidden (none) badge, click the button to toggle the badge." );
    }, false);
});