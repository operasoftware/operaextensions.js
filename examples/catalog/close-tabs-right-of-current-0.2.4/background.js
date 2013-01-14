opera.isReady(function() {

  window.onload = function() {
    console.log('' + (+new Date) + ': Onload fired');
  };

  document.onreadystatechange = function() {
    console.log('' + (+new Date) + ': Ready state changed: ' + document.readyState);
  };

  window.addEventListener("DOMContentLoaded", function() {
    console.log('' + (+new Date) + ': DOM Content Loaded');
  });

});
