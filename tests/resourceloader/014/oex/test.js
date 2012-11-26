var test = async_test("Appending a resource by widget URL (widget://) to a web page should not be possible");

function getHandler() {
	return function(evt) {
		test.step(function() {
		  assert_equals(evt.data, "success", "Appending a resource by widget URL (widget://) to a web page failed");
		});
		test.done();
	}
}

var testTab, widgetUrl = '';

ext.onconnect = function( event ){
  
  if(!testTab) return;
  
  var tImg = document.createElement('img');
  tImg.onload = tImg.onerror = function(e) {

    widgetUrl = e.target.src;

    // Pass widget url to injected script
    event.source.postMessage( widgetUrl );

  };
  tImg.src = "/";
  
};

ext.onmessage = getHandler();

testTab = createTab({url: 'http://team.opera.com/testbed/generic/blank.html?resourceload_014', focused: true});






