var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "http://www.opera.com/" ,
        width: 100,
        height: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to open the popup." );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "If there is an enabled button with a title and favicon, click the button to open the popup." );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "popup.html",
        width: 100,
        height: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "This is the created UIItem, it should have a popup relative href defined:\n" + getProperties(theButton) );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "http://www.opera.com/",
        width: 100,
        height: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "This is the created UIItem, it should have a popup http href defined:\n" + getProperties(theButton) );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Agreen%3B%22%3EPASS%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
        width: 100,
        height: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "This is the created UIItem, it should have a popup http href defined:\n" + getProperties(theButton) );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Agreen%3B%22%3EPASS%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
        width: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "This is the created UIItem, it should have a popup http href defined:\n" + getProperties(theButton) );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Agreen%3B%22%3EPASS%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
        height: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "This is the created UIItem, it should have a popup http href defined:\n" + getProperties(theButton) );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Ared%3B%22%3EFAIL%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
        width: 100,
        height: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "The href is being changed." );
    theButton.popup.href = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Agreen%3B%22%3EPASS%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A";
    MANUAL( "Click the popup to reveal PASS" );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Ablue%3B%22%3EWait%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
        width: 100,
        height: 100
      },
      onclick: function(){
        window.setTimeout( function(){
          theButton.popup.href = "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Agreen%3B%22%3EPASS%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A";
          MANUAL( "The page has been changed. It should now say PASS." );
        }, 500);
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "The href will be changed after the popup is opened." );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20HTML%204.0%2F%2FEN%22%3E%0D%0A%3Chtml%20lang%3D%22en%22%3E%0D%0A%20%3Chead%3E%0D%0A%20%20%3Ctitle%3ETest%3C%2Ftitle%3E%0D%0A%20%20%3Cstyle%20type%3D%22text%2Fcss%22%3E%0D%0A%20%20%3C%2Fstyle%3E%0D%0A%20%3C%2Fhead%3E%0D%0A%20%3Cbody%3E%0D%0A%20%20%3Cp%20style%3D%22color%3Ablue%3B%22%3ETry%20opening%20the%20popup%20again%3C%2Fp%3E%0D%0A%20%3C%2Fbody%3E%0D%0A%3C%2Fhtml%3E%0D%0A",
        width: 100,
        height: 100
      },
      onclick: function(){
        window.setTimeout( function(){
          theButton.popup.href = "";
          theButton.popup.width = "";
          theButton.popup.height = "";
          MANUAL( "The popup has been removed." );
        }, 500);
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "The popup will be removed after the popup is opened." );
}, false);
var theButton;
window.addEventListener("load", function(){
    var UIItemProperties = {
      disabled: false,
      title: "EXTENSION_NAME",
      icon: "icon.png",
      popup: {
        href: "data:text/html;charset=utf-8,%3C!DOCTYPE%20HTML%3E%3Chtml%3E%3Chead%3E%3Ctitle%3ETest%3C%2Ftitle%3E%3Cmeta%20http-equiv%3D%22refresh%22%20content%3D%222%3Burl%3Dhttp%3A%2F%2Fwww.opera.com%2F%22%3E%3C%2Fhead%3E%3Cbody%3E%3Cp%3ETest.%20Should%20reload%20to%20opera.com%3C%2Fp%3E%3C%2Fbody%3E%3C%2Fhtml%3E%0D%0A",
        width: 100,
        height: 100
      }
    }
    theButton = opera.contexts.toolbar.createItem( UIItemProperties );
    opera.contexts.toolbar.addItem( theButton );
    MANUAL( "The href will be changed after the popup is opened." );
}, false);
