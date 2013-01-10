var MenuEvent = (function(){
  var lastSrcElement = null;

  document.addEventListener('contextmenu',function(e){
    lastSrcElement = e.srcElement;
  },false);

  return function(type,args,target){

    var event = OEvent(type,{

      documentURL: args.info.pageUrl,
      pageURL: args.info.pageUrl,
      isEditable: args.info.editable,
      linkURL: args.info.linkUrl || null,
      mediaType: args.info.mediaType || null,
      selectionText: args.info.selectionText || null,
      source:  null,
      srcURL: args.info.srcUrl || null
    });

    Object.defineProperty(event,'target',{enumerable: true,  configurable: false,  get: function(){return target || null;}, set: function(value){}});
    Object.defineProperty(event,'srcElement',{enumerable: true,  configurable: false,  get: function(srcElement){ return function(){return srcElement || null;} }(lastSrcElement), set: function(value){}});

    return event;
  };

})();

MenuEvent.prototype = Object.create( Event.prototype );
