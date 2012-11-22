
// Send and receive messages to/from the background process

// TODO we have a [race condition / bug] here :(
// If we exclude the setTimeout then the widget.preferences do
// not get setup in time for the call made to them below. 

window.setTimeout(function() {

  var oex = opera.extension;

  oex.onmessage = function( msg ) {
  
    if( !msg.data || !msg.data.action ) {
      return;
    }
  
    var data = msg.data;
  
    switch( data.action ) {
    
      case 'check_set_testObj2_RESPONSE':
    
        if( data.value === "testVal2") {
          console.log("PASS: testObj2 set correctly in background process");
        } else {
          console.error("FAIL: testObj2 not set correctly in background process");
        }
    
        break;
    
      case 'check_remove_testObj2_RESPONSE':
    
        if( data.value === null) {
          console.log("PASS: testObj2 removed correctly in background process");
        } else {
          console.error("FAIL: testObj2 not removed correctly in background process");
        }
    
        break;
      
      case 'check_clear_RESPONSE':
    
        if( data.value === null) {
          console.log("PASS: All items removed correctly in background process");
        } else {
          console.error("FAIL: All items not removed correctly in background process");
        }
    
        break;
    
    }
  
  };

  // Test the Widget API here
  
  console.log("widget.* tests...");

  if( widget.name === 'Opera Extension API Test - widget.* API') {
    console.log("PASS: Widget Name set correctly");
  } else {
    console.error("FAIL: Widget Name not set correctly");
  }

  if( widget.version === '1.0') {
    console.log("PASS: Widget version set correctly");
  } else {
    console.error("FAIL: Widget version not set correctly");
  }

  if( widget.description === 'widget.* API Test Extension') {
    console.log("PASS: Widget description set correctly");
  } else {
    console.error("FAIL: Widget description not set correctly");
  }

  // Test preferences
  console.log("widget.preferences.* tests...");

  // GETITEM TESTS

  // 'testObj1' has been set in the background process
  if( widget.preferences.getItem( "testObj1" ) === "testVal1") {
    console.log("PASS: testObj1 retrieved correctly");
  } else {
    console.error("FAIL: testObj1 not retrieved correctly");
  }
  
  // 'testObj10' has been set in the background process
  if( widget.preferences["testObj10"] === "testVal10") {
    console.log("PASS: testObj10 retrieved correctly");
  } else {
    console.error("FAIL: testObj10 not retrieved correctly");
  }

  // SETITEM TESTS

  widget.preferences.setItem( "testObj2", "testVal2" );

  if( widget.preferences.getItem( "testObj2" ) === "testVal2") {
    console.log("PASS: testObj2 set correctly");
  } else {
    console.error("FAIL: testObj2 not set correctly");
  }

  // Test the 'testObj2' propagated to the background process also
  opera.extension.postMessage({
    "action": "check_set_testObj2"
  });

  // REMOVEITEM TESTS 

  widget.preferences.removeItem( "testObj2" );

  if( widget.preferences.getItem( "testObj2" ) === null) {
    console.log("PASS: testObj2 removed correctly");
  } else {
    console.error("FAIL: testObj2 not removed correctly");
  }

  // Test the 'testObj2' propagated to the background process also
  opera.extension.postMessage({
    "action": "check_remove_testObj2"
  });

  // CLEAR TESTS 

  widget.preferences.clear();

  if( widget.preferences.getItem( "testObj1" ) === null) {
    console.log("PASS: All objects removed correctly");
  } else {
    console.error("FAIL: All objects not removed correctly");
  }

  // Test that all localStorage items have been cleared from the 
  // background process
  opera.extension.postMessage({
    "action": "check_clear"
  });
  
  window.setTimeout(function() {
    console.log('All tests completed. Check the background process console for further tests');
  }, 1000);
  
  // Set up the test for next running...
  widget.preferences.setItem( "testObj1", "testVal1" );
  widget.preferences.setItem( "testObj10", "testVal10" );

}, 500);
