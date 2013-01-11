opera.isReady(function(){

    var tab = [];
    var test = async_test("Check back broadCast popup", {timeout: 30000});

    function onMessage(event) {

	test.step(function(){
	    assert_equals("Message from popup", event.data, "Message received from the popup.");
	});
	test.done();
    }
    function onConnect(event) {
	opera.extension.broadcastMessage("Reply to this immediately. All of you");
    }

    opera.extension.onmessage = onMessage;
    opera.extension.onconnect = onConnect;

    try {
	var UIItemProperties = {
	    disabled: false,
	    title: "001 - broadcast popup",
	    icon: "oex/icon.png",
	    popup: {
		href: "oex/popup.html"
	    },
	    onclick: function(){
		testStarted = true;
		console.log('test started');
	    }

	}
	theButton = opera.contexts.toolbar.createItem( UIItemProperties );
	theButton.addEventListener('click', function(){console.log('dupa')});
	opera.contexts.toolbar.addItem( theButton );

	var uri = "data:text/html,<!DOCTYPE html>" + encodeURIComponent("Please click on the button to load the popup. Once the popup loads, a broadcast will be sent out.");
	createTab({url: uri, focused: true });

    } catch (e) {
        tests.step(function() {
            assert_unreached("Couldn't create button");
        });
    }
});