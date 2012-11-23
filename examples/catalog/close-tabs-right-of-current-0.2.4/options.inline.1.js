
var source = false;
opera.extension.onmessage = function(event){
  source = event.source;
}

window.addEventListener('load', function() {

  window.setTimeout(function() {

    var select = document.getElementById('option');
    var checkbox = document.getElementById('includeSelf');

    if ( widget.preferences.getItem('option') ) {
      select.value = widget.preferences.getItem('option');
    }

    if ( widget.preferences.getItem('includeSelf') ) {
      checkbox.checked = (widget.preferences.getItem('includeSelf') == 1 ? true : false);
    }

    select.addEventListener('change', function() {
      widget.preferences.setItem('option', this.value);
      if (source)
        source.postMessage("reset");
    }, false );

    checkbox.addEventListener('change', function() {
      widget.preferences.setItem('includeSelf', (this.checked ? 1 : 0));
      if (source)
        source.postMessage("reset");
    }, false );      

  }, 250);

}, false);
