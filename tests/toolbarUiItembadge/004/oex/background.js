opera.isReady(function(){
    var timer = null, counter = 0;
    var theButton;
    var colors = ["blue", "red", "green", "yellow", "pink", "magenta", "black"];
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "004 - createItem backgroundColor name",
          icon: "./oex/icon.png",
          onclick: function(){
            if( timer ){
              window.clearTimeout( timer );
              timer = null;
            } else {
              timer = window.setInterval( function(){
                  var newColor = colors[counter];//[0x50 + counter, 0xff, 0xff - counter, 0x33];//"#FFFFFF"
                  MANUAL( "Changing theButton.badge.backgroundColor to " + newColor );
                  theButton.badge.backgroundColor = newColor;
                  counter++;
                  if( counter==colors.length ){counter = 0;}
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
        MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.backgroundColor to blue" );
    }, false);
});