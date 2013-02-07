opera.isReady(function() {
    opera.addEventListener("BeforeEventListener.DOMContentLoaded", function(evt) { console.log('DCL')
    	opera.extension.postMessage({
    		type: "dclfired",
    		evttype: evt.type,
    		evtDefined: evt.event ? true:false
    	});
    }, false);/* 
    opera.addEventListener("BeforeEvent.load", function(evt) {console.log('load')
    	opera.extension.postMessage({
    		type: "loadfired",
    		evttype: evt.type,
    		evtDefined: evt.event ? true:false
    	});
    }, false); */
});
