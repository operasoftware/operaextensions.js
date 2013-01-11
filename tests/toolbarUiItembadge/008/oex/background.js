opera.isReady(function(){
    var timer = null, counter = 0;

    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "008 - createItem color rgba",
          icon: "oex/icon.png",
          onclick: function(){
            if( timer ){
              window.clearTimeout( timer );
              timer = null;
            } else {
              timer = window.setInterval( function(){
                  var newColor = [counter, 0xff, 0xff - counter, 0x33];//"blue";//"#FFFFFF"
                  MANUAL( "Changing theButton.badge.color to " + newColor );
                  theButton.badge.color = newColor;
                  counter = counter + 10;
                  if(counter>255){counter = 0;}
              }, 500);
            }
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
        MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.color to [r, g, b, o]" );
    }, false);
});