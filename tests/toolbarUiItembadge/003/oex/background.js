opera.isReady(function(){
    var timer = null, counter = 0;;
    var theButton;
    var colors = ["#FFFFFF", "#f0a", "#666", "#fff", "#009900" ];
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "003 - createItem backgroundColor hex",
          icon: "./oex/icon.png",
          onclick: function(){
            if( timer ){
        	window.clearInterval( timer );
              timer = null;
            } else {
        	timer = window.setInterval( function(){
        	var newColor = colors[counter];
                  MANUAL( "Changing theButton.badge.backgroundColor to " + newColor );
                  theButton.badge.backgroundColor = newColor;
                  counter++;
                  if( counter==colors.length ){counter = 0;}
              }, 500);
            }
          },
          badge: {
            textContent: '1234',
            backgroundColor: '#000000',
            color: '#404040',
            display: 'hidden'
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );
        MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.backgroundColor to #FFFFFF" );
    }, false);
});