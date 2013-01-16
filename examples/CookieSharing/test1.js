var cookieVal = 'baz';

var debug = document.getElementsByTagName('div')[0];

var xhr = new XMLHttpRequest();

xhr.open('GET', 'http://t/core/features/extensions/share-cookies/hlp/set.pl?c=' + cookieVal, true);

xhr.onloadend = function() {
  
  xhr.open('GET', 'http://t/core/features/extensions/share-cookies/hlp/get.pl', true);
  
  xhr.onloadend = function(evt) {
    
    if(xhr.responseText == cookieVal) {
      debug.textContent = 'PASS';
      console.log('PASS');
    } else {
      debug.textContent = 'FAIL';
      console.log('FAIL');
    }
  };
  
  xhr.send();
  
};

xhr.send();