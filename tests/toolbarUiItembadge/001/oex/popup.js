var timer = null, counter = 0;
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onclick: function(){
        if( timer ){
          window.clearTimeout( timer );
          timer = null;
        } else {
          timer = window.setInterval( function(){
              MANUAL( "Changing theButton.badge.textContent to Counter = " + counter );
              theButton.badge.textContent = "Counter = " + counter;
              counter++;
          }, 500);
        }
      },
      badge: {
        textContent: 'EXTENSION_DESCRIPTION',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'hidden'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.textContent" );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      title: "EXTENSION_NAME",
      badge: {
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "There should be a blank badge now. In desktop, there should be no artifacts." );
}, false);var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      title: "EXTENSION_NAME",
      badge: {
        textContent: "test"
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "There should be a badge with 'test' written in it now." );
}, false);var timer = null;
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
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
        textContent: 'EXTENSION_DESCRIPTION',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'hidden'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.backgroundColor to #FFFFFF" );
}, false);
var timer = null, counter = 0;
var theButton;
var colors = ["blue", "red", "green", "yellow", "pink", "magenta", "black"];
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
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
              if( counter==colors.length ) counter = 0;
          }, 500);
        }
      },
      badge: {
        textContent: 'EXTENSION_DESCRIPTION',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'hidden'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.backgroundColor to blue" );
}, false);
var timer = null, counter = 0;
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onclick: function(){
        if( timer ){
          window.clearTimeout( timer );
          timer = null;
        } else {
          timer = window.setInterval( function(){
              var newColor = [counter, 0xff, 0xff - counter, 0x33];//"blue";//"#FFFFFF"
              MANUAL( "Changing theButton.badge.backgroundColor to " + newColor );
              theButton.badge.backgroundColor = newColor;
              counter = counter + 10;
              if(counter>255) counter = 0;
          }, 500);
        }
      },
      badge: {
        textContent: 'EXTENSION_DESCRIPTION',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'hidden'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.backgroundColor to [r, g, b, o]" );
}, false);
var timer = null;
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onclick: function(){
        if( timer ){
          window.clearTimeout( timer );
          timer = null;
        } else {
          timer = window.setTimeout( function(){
              var newColor = "#FFFFFF";
              MANUAL( "Changing theButton.badge.color to " + newColor );
              theButton.badge.color = newColor;
          }, 500);
        }
      },
      badge: {
        textContent: 'EXTENSION_DESCRIPTION',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'hidden'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.color to #FFFFFF" );
}, false);
var timer = null, counter = 0;
var theButton;
var colors = ["blue", "red", "green", "yellow", "pink", "magenta", "black"];
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onclick: function(){
        if( timer ){
          window.clearTimeout( timer );
          timer = null;
        } else {
          timer = window.setInterval( function(){
              var newColor = colors[counter];//[0x50 + counter, 0xff, 0xff - counter, 0x33];//"#FFFFFF"
              MANUAL( "Changing theButton.badge.color to " + newColor );
              theButton.badge.color = newColor;
              counter++;
              if( counter==colors.length ) counter = 0;
          }, 500);
        }
      },
      badge: {
        textContent: 'EXTENSION_DESCRIPTION',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'hidden'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.color" );
}, false);
var timer = null, counter = 0;
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
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
              if(counter>255) counter = 0;
          }, 500);
        }
      },
      badge: {
        textContent: 'EXTENSION_DESCRIPTION',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'hidden'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to change badge.color to [r, g, b, o]" );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
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
}, false);var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      badge: {
        textContent: 'This is the Badge.',
        backgroundColor: '#ffeedd',
        color: '#404040',
        display: 'block'
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "There should be a badge, and it should be visible." );
}, false);var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
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
}, false);var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      title: "EXTENSION_NAME",
      badge: {
        textContent: 23
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "There should badge with a number now." );
}, false);