opera.isReady(function() {
  // injected script content here (none provided in this extension)
  
  opera.extension.urlfilter.addEventListener('contentblocked', function(evt) {
    console.log('contentblocked event received!');
    console.log(evt);
  }, false);
});