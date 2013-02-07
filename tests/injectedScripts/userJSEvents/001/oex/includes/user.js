opera.isReady(function() { console.log('user JS adds event listeners');
    opera.addEventListener("BeforeEvent.load", function(evt) { console.log('event '+evt.type);
    	opera.extension.postMessage({
    		type: "loadfired",
    		evttype: evt.type,
    		evtDefined: evt.event ? true:false
    	});
    }, false);

    opera.addEventListener("BeforeEventListener.DOMContentLoaded", function(evt) {
    	opera.extension.postMessage({
    		type: "dclfired",
    		evttype: evt.type,
    		evtDefined: evt.event ? true:false
    	});
    }, false);
});
