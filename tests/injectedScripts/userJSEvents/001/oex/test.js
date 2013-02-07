opera.isReady(function() {
  console.log('background ready');
  var t = async_test("User JS BeforeEventListener.DOMContentLoaded in extension", {timeout:8000});
  var expected=[  { type: "dclfired", evttype: 'BeforeEventListener.DOMContentLoaded', evtDefined: true } ];
  
  opera.extension.onmessage = function(evt) { console.log(evt.data);
    var curExp=expected.shift(), a, b;
    for(var prop in curExp){
      a=curExp[prop], b=evt.data[prop];
      t.step( (function(a,b){return function(){assert_equals(a,b, prop)}})(a,b) );
    }
    if( expected.length==0 )t.done();
  }
  var data = "<!DOCTYPE html><p>Test page (expected to fire DOMContentLoaded and load events)</p>";
  createTab({url: getProxyURL(encodeURIComponent(window.btoa(data)))});

});
