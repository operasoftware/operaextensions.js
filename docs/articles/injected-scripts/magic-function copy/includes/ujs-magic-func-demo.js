opera.defineMagicFunction('toggleElement', function( realFunc, realThis, elm ){
  elm.style.OTransition='opacity 1s';
  elm.style.transition='opacity 1s';
  if(elm.style.opacity==1 || elm.style.opacity==''){
    elm.style.opacity=0;
  }else{
    elm.style.opacity=1;
  }
});
