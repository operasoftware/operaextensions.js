opera.isReady(function() {
    var timer = null, counter = 0;
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "005 - createItem backgroundColor rgba",
          icon: "oex/icon.png",
          onclick: function(){
            if( timer ){
              window.clearInterval( timer );
              timer = null;
            } else {
              timer = window.setInterval( function(){
                  var newColor = [counter, 0xff, 0xff - counter, 0x33];//"blue";//"#FFFFFF"
                  MANUAL( "Changing theButton.badge.backgroundColor to " + newColor );
                  theButton.badge.backgroundColor = newColor;
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
        MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.backgroundColor to [r, g, b, o]" );
    }, false);
});