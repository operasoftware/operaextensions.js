opera.isReady(function() {
  
  var win = null, window_supported = true,
      tests = {}, // Asynchronous tests
      eventsReceived = [], // List of events received
      eventsExpected = ["create", "focus", "close"]; // List of expected events

  tests["create"] = async_test("Window create event");
  tests["close"]  = async_test("Window close event");
  tests["focus"]  = async_test("Window focus event");
  tests["order"]  = async_test("Order of events");


  try {
  	win = createWindow();
  } catch(e) {
  	for (var n in tests)
  		tests[n].step(function(){ assert_unreached("Couldn't create new window") });
  	window_supported = false;
  }

  if (window_supported) {
  	var all = windows.getAll();
  	for (var i = 0; i < all.length; i++) {
  		all[i].close();
  	}
  }

  function getHandler(type) {
  	return function(evt) {
  		tests[type].step(function() {
  			assert_equals(evt.type, type, "Event type should be '" + type + "'");
  			assert_exists(evt, "browserWindow", "The event object should have a browserWindow property");

  			assert_equals(evt.browserWindow.id, win.id, "The event should refer to the created window");
  		});
  		tests[type].done();
  	}
  }

  function eventOrder(evt) {
  	var evtTarget = (evt.browserWindow ? "browserWindow" : (evt.tabGroup ? "tabGroup" : (evt.tab ? "tab" : "unknown")))
  	//opera.postError("Event received: " + evt.type + ", Window: " + evt.browserWindow.id + ", evttarget: " + evtTarget);
  	eventsReceived.push(evt.type);
  	if (eventsReceived.length == eventsExpected.length) {
  		setTimeout(function() {
  			//opera.postError("Received: " + eventsReceived);
  			tests["order"].step(function() {
  				for (var i = 0; i < eventsReceived.length; i++) {
  					assert_equals(eventsReceived[i], eventsExpected[i], "The event order should match. Event number: " + i)
  				}
  			});
  			tests["order"].done();
  		}, 500); // Wait, incase new unexpected events fire
  	}
  }

  windows.addEventListener("create", getHandler("create"), false);
  windows.addEventListener("close",  getHandler("close"),  false);
  windows.addEventListener("focus",  getHandler("focus"),  false);

  windows.addEventListener("create", eventOrder, false);
  windows.addEventListener("close",  eventOrder, false);
  windows.addEventListener("blur",   eventOrder, false);
  windows.addEventListener("focus",  eventOrder, false);

  if (window_supported) {
  	win = createWindow(null, {});

  	setTimeout(function() {
  		win.close();
  	}, 1000);
  }

});