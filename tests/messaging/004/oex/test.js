opera.isReady(function(){

    var connectedTo;
    var test = async_test("Check back connect popup", {timeout: 30000});

    function createBtn(){
	var UIItemProperties = {
	    disabled: false,
	    title: "004 - back connect popup",
	    icon: "oex/icon.png",
	    popup: {
	        href: 'oex/popup.html'
	    }
	}
	theButton = opera.contexts.toolbar.createItem( UIItemProperties );
	opera.contexts.toolbar.addItem( theButton );
    }
    function onMessage(event) {

	test.step(function(){
	    console.log(connectedTo);
	    console.log(event.source);
	    assert_equals(connectedTo, event.source, "Response received.");
	});
	test.done();
    }
    function onConnect(event) {
	connectedTo = event.source;
        event.source.postMessage( "Respond to this immediately" );
    }

    opera.extension.onmessage = onMessage;
    opera.extension.onconnect = onConnect;
    createBtn();

    var uri = "data:text/html,<!DOCTYPE html>" + encodeURIComponent("Please click on the button to load the popup. Once the popup loads, a broadcast will be sent out.");
    createTab({url: uri, focused: true });

});