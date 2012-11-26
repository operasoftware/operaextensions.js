opera.isReady(function() {
  
  // Send and receive messages to/from the background process

  var oex = opera.extension;

  oex.getScreenshot( function( imageData ) {

    console.log( "Screenshot captured..." );
    console.log( imageData );
  
    console.log( "Replacing page contents with image as a test... ");
  
    var canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
  
    var ctx = canvas.getContext('2d');
  
    ctx.putImageData( imageData, 0, 0 );
  
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 30px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText("IMAGE COPY", 10, 10);
  
    // Replace current page's body contents with image :)
  
    var bodyEl = document.getElementsByTagName('body')[0];
  
    bodyEl.textContent = '';
    bodyEl.appendChild(canvas);
  
    console.log( "...page should now just be an image :)");

  });

});
