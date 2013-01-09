opera.isReady(function() {

opera.contexts.menu.onclick = function(e){
  console.log(e.target.id,e.currentTarget,e.srcElement, e.selectionText);
};

});