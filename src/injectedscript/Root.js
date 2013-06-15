
var OperaExtension = function() {

  OMessagePort.call( this, false );

};

OperaExtension.prototype = Object.create( OMessagePort.prototype );

OperaExtension.prototype.__defineGetter__('bgProcess', function() {
  return chrome.extension.getBackgroundPage();
});

// Add Screenshot API to Injected Script processes only
OperaExtension.prototype.getScreenshot = function( callback ) {

  var screenshotCallback = function( msg ) {

    if( !msg.data || !msg.data.action || msg.data.action !== '___O_getScreenshot_RESPONSE' || !msg.data.dataUrl ) {
      return;
    }

    // Convert the returned dataUrl in to an ImageData object and
    // return via callback function argument
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload = function(){
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img,0,0);

      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Return the ImageData object to the callee
      callback.call( this, imageData );
    };
    img.src = msg.data.dataUrl;

    // Tear down this event listener
    OEX.removeEventListener('controlmessage', screenshotCallback);

  }.bind(this);

  // Set up this event listener
  OEX.addEventListener('controlmessage', screenshotCallback);

  // Request the screenshot from the background process
  OEX.postMessage({
    "action": "___O_getScreenshot_REQUEST"
  });

};

// Generate API stubs

var OEX = opr.extension = opr.extension || new OperaExtension();

var OEC = opr.contexts = opr.contexts || {};
