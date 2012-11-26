opera.isReady(function() {
  
  /**
   * Opera API shim test - widget.* API test
   *
   * This extension uses the Widgets API and Opera Extension Messaging API
   * http://www.w3.org/TR/widgets-apis/
   * 
   */

  var oex = opera.extension;

  // Setup
  widget.preferences.clear();

  widget.preferences.setItem( "testObj1", "testVal1" );
  widget.preferences.setItem( "testObj10", "testVal10" );

  // onmessage handler
  oex.onmessage = function( msg ) {
  
    if( !msg.data || !msg.data.action ) {
      return;
    }
  
    var data = msg.data;
  
    switch( data.action ) {
    
      case 'check_set_testObj2':
      
        msg.source.postMessage({
          "action": "check_set_testObj2_RESPONSE",
          "value": widget.preferences.getItem( "testObj2" )
        });
    
        break;
    
      case 'check_remove_testObj2':
    
        msg.source.postMessage({
          "action": "check_remove_testObj2_RESPONSE",
          "value": widget.preferences.getItem( "testObj2" )
        });
    
        break;
      
      case 'check_clear':
    
        msg.source.postMessage({
          "action": "check_clear_RESPONSE",
          "value": widget.preferences.getItem( "testObj1" )
        });
    
        break;
    
    }
  
  };


  // Test the Widget API here
  console.log("widget.* tests...");

  if( widget.name === 'Opera Extension API Test - widget.* API') {
    console.log("PASS: Widget Name set correctly");
  } else {
    console.error("FAIL: Widget Name set correctly");
  }

  if( widget.version === '1.0') {
    console.log("PASS: Widget version set correctly");
  } else {
    console.error("FAIL: Widget version set correctly");
  }

  if( widget.description === 'widget.* API Test Extension') {
    console.log("PASS: Widget description set correctly");
  } else {
    console.error("FAIL: Widget description set correctly");
  }

  // Test preferences
  console.log("widget.preferences.* tests...");

  // GETITEM TESTS

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

  widget.preferences.setItem( "testObj3", "testVal3" );

  if( widget.preferences.getItem( "testObj3" ) === "testVal3") {
    console.log("PASS: testObj3 set correctly");
  } else {
    console.error("FAIL: testObj3 not set correctly");
  }

  // REMOVEITEM TESTS 

  widget.preferences.removeItem( "testObj3" );

  //console.log(typeof widget.preferences.getItem( "blahblah" ));

  if( widget.preferences.getItem( "testObj3" ) === undefined) {
    console.log("PASS: testObj3 removed correctly");
  } else {
    console.error("FAIL: testObj3 not removed correctly");
  }

  window.setTimeout(function() {
    console.log('All tests completed. Check an injected script process console for further tests (open "devtools > console" on any web page)');
  }, 1000);
  
  // CLEAR TESTS
  // Not run in background process so we can run the tests in the Injected Scripts process
  // see 'content-script.js' 

  /*
  widget.preferences.clear();

  if( widget.preferences.getItem( "testObj1" ) === undefined && widget.preferences.getItem( "testObj10" ) === undefined ) {
    console.log("PASS: All objects removed correctly");
  } else {
    console.error("FAIL: All objects not removed correctly");
  }

  // Test that all localStorage items have been cleared from the 
  // background process
  opera.extension.postMessage({
    "action": "check_clear"
  });
  */

});