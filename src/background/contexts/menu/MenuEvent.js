var MenuEvent = function(type,args,target){
  var event;
	
	var tab = null;
  var tabs = OEX.tabs.getAll();
  for(var i=0;i<tabs.length;i++){
    if(tabs[i].properties.id==args.tab.id&&tabs[i].browserWindow.properties.id==args.tab.windowId)tab = tabs[i];
  };
  
	if(type=='click'){
		event = OEvent(type,{		
			documentURL: args.info.pageUrl,
			pageURL: args.info.pageUrl,
			isEditable: args.info.editable,
			linkURL: args.info.linkUrl || null,
			mediaType: args.info.mediaType || null,
			selectionText: args.info.selectionText || null,
			source: tab,//tab.port should be implemented
			srcURL: args.info.srcUrl || null
		});
	} else event = OEvent(type,args);
	
	
	Object.defineProperty(event,'target',{enumerable: true,  configurable: false,  get: function(){return target || null;}, set: function(value){}});
	
	return event;

};

MenuEvent.prototype = Object.create( Event.prototype );

