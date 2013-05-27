if(window.location.href.indexOf('https://www.google.com/accounts/ServiceLogin?service=mail')==0){
  window.opera.defineMagicVariable('CP', null, function(originalObj){
    /* the data is in a double array, [ [1,2], [1,2] ... ] */
    for( var i=0; i<originalObj.length; i++ ){
      originalObj[i][1]*=-1;
    }
    return originalObj;
  });
}
