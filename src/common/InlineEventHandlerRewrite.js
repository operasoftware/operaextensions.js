
opera.isReady(function() {

  // Rewrite in-line event handlers (eg. <input ... onclick=""> for a sub-set of common standard events)

  document.addEventListener('DOMContentLoaded', function(e) {
  
    var selectors = ['load', 'beforeunload', 'unload', 'click', 'dblclick', 'mouseover', 'mousemove', 
                        'mousedown', 'mouseup', 'mouseout', 'keydown', 'keypress', 'keyup', 'blur', 'focus'];

    for(var i = 0, l = selectors.length; i < l; i++) {
      var els = document.querySelectorAll('[on' + selectors[i] + ']');
      for(var j = 0, k = els.length; j < k; j++) {
        var fn = new Function('e', els[j].getAttribute('on' + selectors[i]));
        var target = els[j];
        if(selectors[i].indexOf('load') > -1 && els[j] === document.body) {
          target = window;
        }
      
        els[j].removeAttribute('on' + selectors[i]);
        target.addEventListener(selectors[i], fn, true);
      }
    }
  
  }, false);

});
