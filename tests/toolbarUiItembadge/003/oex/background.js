opera.isReady(function(){
    var timer = null;
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "003 - createItem backgroundColor hex",
          icon: "./oex/icon.png",
          onclick: function(){
            if( timer ){
              window.clearTimeout( timer );
              timer = null;
            } else {
              timer = window.setTimeout( function(){
                  var newColor = "#FFFFFF";
                  MANUAL( "Changing theButton.badge.backgroundColor to " + newColor );
                  theButton.badge.backgroundColor = newColor;
              }, 500);
            }
          },
          badge: {
            textContent: '1234',
            backgroundColor: '#ffeedd',
            color: '#404040',
            display: 'hidden'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.backgroundColor to #FFFFFF" );
    }, false);
});