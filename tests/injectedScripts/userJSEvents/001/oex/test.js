opera.isReady(function() {
  console.log('background ready');
  var t = async_test("User JS BeforeEvent.load, BeforeEventListener.DOMContentLoaded in extension", {timeout:8000});
  var expected=[ { type: "loadfired", evttype: 'BeforeEvent.load', evtDefined: true }, { type: "dclfired", evttype: 'BeforeEventListener.DOMContentLoaded', evtDefined: true } ];
  
  opera.extension.onmessage = function(evt) {
    var curExp=expected.shift(), a, b;
    for(var prop in curExp){
      a=curExp[prop], b=evt.data[prop];
      t.step( function(){assert_equals(a,b, prop)} );
    }
    if( expected.length==0 )t.done();
    console.log( request );
  }
  var data = "<!DOCTYPE html><p>Test page (expected to fire DOMContentLoaded and load events)</p>";
  createTab({url: getProxyURL(encodeURIComponent(window.btoa(data)))});

});
