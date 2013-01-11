window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "EXTENSION_NAME"
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
}, false);
window.addEventListener("load", function(){    var theButton;    var ToolbarUIItemProperties = null;    MANUAL( "Attempting to make a back button. If an error is thrown, this test passes." );    try{      theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );      opera.contexts.toolbar.addItem( theButton );    } catch(e){      PASS( "An error was thrown: " + getProperties( e, 1 ) );    }}, false);window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "EXTENSION_NAME"
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
}, false);
window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "EXTENSION_NAME",
      disabled: true
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a disabled button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
}, false);
window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "EXTENSION_NAME",
      disabled: false
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a enabled button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
}, false);
window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "EXTENSION_NAME",
      disabled: false,
      icon: "icon.png"
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a enabled button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
}, false);
window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "EXTENSION_NAME",
      disabled: false,
      icon: "http://www.opera.com/favicon.ico"
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a enabled button in Opera's UI, this test has passed. " + getProperties( theButton, 5 ) );
}, false);
var ICON = "data:image/jpeg,%FF%D8%FF%E0%00%10JFIF%00%01%01%00%00%01%00%01%00%00%FF%DB%00C%00%09%06%07%08%07%06%09%08%07%08%0A%0A"+
"%09%0B%0D%16%0F%0D%0C%0C%0D%1B%14%15%10%16%20%1D%22%22%20%1D%1F%1F%24(4%2C%24%261'%1F%1F-%3D-157%3A%3A%3A%23%2B%3FD%3F8C49%3A7"+
"%FF%DB%00C%01%0A%0A%0A%0D%0C%0D%1A%0F%0F%1A7%25%1F%2577777777777777777777777777777777777777777777777777%FF%C0%00%11%08%00%10%00"+
"%10%03%01%22%00%02%11%01%03%11%01%FF%C4%00%15%00%01%01%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%07%FF%C4%00%14%10%01%00%00"+
"%00%00%00%00%00%00%00%00%00%00%00%00%00%00%FF%C4%00%14%01%01%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%FF%C4%00%14%11%01"+
"%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%FF%DA%00%0C%03%01%00%02%11%03%11%00%3F%00%86%80%0F%FF%D9";

window.addEventListener("load", function(){
    var theButton;
    var ToolbarUIItemProperties = {
      title: "EXTENSION_NAME",
      disabled: false,
      icon: ICON
    }
    theButton = opera.contexts.toolbar.createItem( ToolbarUIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is a enabled button in Opera's UI, this test has passed. " + getProperties( theButton, 2 ) );
}, false);
window.addEventListener("load", function(){
    var theButton;
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onclick: function( event ){
          PASS( getProperties(event, 2) );
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to run the test." );
}, false);
function func( event ){
  PASS( getProperties(event, 2) );
}
window.addEventListener("load", function(){
    var theButton;
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png"
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    theButton.addEventListener( "click", func, false);
    MANUAL( "If there is an enabled button with a title and favicon, click the button to run the test." );
}, false);
function func( event ){
  FAIL( getProperties(event, 2) );
}
window.addEventListener("load", function(){
    var theButton;
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png"
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    theButton.addEventListener( "click", func, false);
    theButton.removeEventListener( "click", func, false);
    theButton.addEventListener( "click", function( event ){
      MANUAL( "This should be the last statement." );
    }, false);
    MANUAL( "If there is an enabled button with a title and favicon, click the button to run the test." );
}, false);
window.addEventListener("load", function(){
    var theButton;
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onremove: function(){
        PASS( getProperties(event, 2) );
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    opera.contexts.toolbar.removeItem( theButton );
    MANUAL( "If a button is added and then removed immediately, you should see a PASS in the error console." );
}, false);
window.addEventListener("load", function(){
    var theButton;
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png"
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    theButton.addEventListener( "remove", function(){
      PASS( getProperties(event, 2) );
    },false);
    opera.contexts.toolbar.removeItem( theButton );
    MANUAL( "If a button is added and then removed immediately, you should see a PASS in the error console." );
}, false);
function func( event ){
  FAIL( getProperties(event, 2) );
}
window.addEventListener("load", function(){
    var theButton;
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png"
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    theButton.addEventListener( "remove", func, false);
    theButton.removeEventListener( "remove", func, false);
    theButton.addEventListener( "remove", function( event ){
      MANUAL( "This should be the last statement." );
    }, false);
    opera.contexts.toolbar.removeItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to run the test." );
}, false);
var timer = null, counter = 0;
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onclick: function(){
        MANUAL( "A fully initialised ToolbarUIItem looks like this:\n" + getProperties( theButton, 5 ) );
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
    MANUAL( "A fully initialised ToolbarUIItem looks like this:\n" + getProperties( theButton, 5 ) );
}, false);
var timer = null, counter = 0;
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      onclick: function(){
        MANUAL( "Fully initialised opera.contexts looks like this:\n" + getProperties( opera.contexts, 5 ) );
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
    MANUAL( "Fully initialised opera.contexts looks like this:\n" + getProperties( opera.contexts, 5 ) );
}, false);
window.addEventListener("load", function(){
    var theButton_1;
    theButton_1 = opera.contexts.toolbar.createItem( {
      title: "EXTENSION_NAME"
    });
    var theButton_2;
    theButton_2 = opera.contexts.toolbar.createItem( {
      title: "EXTENSION_NAME"
    });
    opera.contexts.toolbar.addItem( theButton_1 );
    try{
      opera.contexts.toolbar.addItem( theButton_2 );
      MANUAL( "If there are two buttons in Opera's UI, this test has failed. " + getProperties( opera.contexts.toolbar, 3 ) );
    } catch (e) {
      PASS( "An error occurred when adding a second button" + getProperties( opera.contexts.toolbar, 3 ) );
    }
}, false);
