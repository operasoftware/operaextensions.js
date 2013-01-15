opera.isReady(function(){
    var theButton;
    window.addEventListener("load", function(){
        var UIItemProperties = {
          disabled: false,
          title: "009 - Item remove",
          icon: "./oex/icon.png",
          popup: {
            href: "./oex/popup.html",
            width: 100,
            height: 100
          }
        }
        theButton = opera.contexts.toolbar.createItem( UIItemProperties );
        opera.contexts.toolbar.addItem( theButton );

        opera.extension.onconnect = function( event ){
		event.source.postMessage( "Respond to this immediately" );
	    };
	    opera.extension.onmessage = function (event) {
		var msg = event.data;
		if(event.data = "Hi from popup") {
		    setTimeout(function() {
			theButton.popup.href = "";
		              theButton.popup.width = "";
		              theButton.popup.height = "";
		              MANUAL( "The popup has been removed." );
	    	    }, 500);
		}
	    }
        MANUAL( "The popup will be removed after the popup is opened." );
    }, false);
});