
// Set the width and height of the popup window to values provided in the URL query string
opera.isReady(function() {

  function getParam( key ) {
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + key + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    return results == null ? "" : window.decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var w = getParam('w'), h = getParam('h');
  if(w !== "") {
    document.body.style.minWidth = w.replace(/\D/g,'') + "px";
  } else {
    document.body.style.minWidth = "300px"; // default width
  }
  if(h !== "") {
    document.body.style.minHeight = h.replace(/\D/g,'') + "px";
  } else {
    document.body.style.minHeight = "300px"; // default height
  }

});
