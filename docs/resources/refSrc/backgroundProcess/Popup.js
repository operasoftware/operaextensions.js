/**
* A URL reference to the page to pop up. This page will pop up when the user clicks on an <code>ExtensionUIItem</code>.
* Editing the <code>href</code> attribute while the popup is open will close the popup.
* @type DOMString
* @Example
<code>
var theButton;
window.addEventListener("load", function(){
    theButton = opera.contexts.toolbar.createItem({
      disabled: false,
      title: "004 - window localStorage",
      icon: "icon.png",
      popup: {
        href: "popup.html", // local html file
        width: 300,
        height: 300
      }
    });
    opera.contexts.toolbar.addItem( theButton );

	// change popup url
	theButton.href = "http://touch.facebook.com";

}, false);
</code>
**/
Popup.prototype.href = "";

/**
* The width of the popup window. By default, the width is 300px
* @type Number
**/
Popup.prototype.width = 0;

/**
* The height of the popup window. By default, the height is 300px
* @type Number
**/
Popup.prototype.height = 0;
