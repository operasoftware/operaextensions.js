opera.isReady(function() {
  
  var currentWindow = windows.getLastFocused();
  var win = null;
  var tests = {}, // Asynchronous tests
  eventsReceived = [], // List of events received
  eventsExpected = [ "create", "blur", "focus" ]; // List of expected events

  tests["create"] = async_test("Window create event");
  tests["blur"] = async_test("Window blur event");
  tests["focus"] = async_test("Window focus event");
  tests["order"] = async_test("Order of events");

  function getHandler(type) {
      return function(evt) {
          tests[type].step(function() {
              assert_equals(evt.type, type, "Event type should be '" + type + "'");
              assert_exists(evt, "browserWindow", "The event object should have a browserWindow property");
              if (evt.type === "blur") {
                  assert_equals(evt.browserWindow.id, currentWindow.id, "The event should refer to the existing window, the windows IDs should match.");
              } else {
                  assert_equals(evt.browserWindow.id, win.id, "The event should refer to the created window, the windows IDs should match.");
              }
          });
          tests[type].done();
      }
  }

  function eventOrder(evt) {
      // console.log("Event received: " + evt.type + ", Window: " +
      // evt.browserWindow.id);
      eventsReceived.push(evt.type);
      if (eventsReceived.length == eventsExpected.length) {
          setTimeout(function() {
              // opera.postError("Received: " + eventsReceived);
              tests["order"].step(function() {
                  for ( var i = 0; i < eventsReceived.length; i++) {
                      assert_equals(eventsReceived[i], eventsExpected[i], "The event order should match. Event number: " + i)
                  }
              });
              tests["order"].done();
          }, 500); // Wait, incase new unexpected events fire
      }
  }

  windows.addEventListener("create", getHandler("create"), false);
  windows.addEventListener("blur", getHandler("blur"), false);
  windows.addEventListener("focus", getHandler("focus"), false);

  windows.addEventListener("create", eventOrder, false);
  windows.addEventListener("close", eventOrder, false);
  windows.addEventListener("blur", eventOrder, false);
  windows.addEventListener("focus", eventOrder, false);

  try {
      win = createWindow(null, {
          focused : true
      }); // Create event
  } catch (e) {
      for ( var n in tests)
          tests[n].step(function() {
              assert_unreached("Couldn't create new window")
          });
  }
  
  opera.extension.windows[0].focus();
  win.focus();
});