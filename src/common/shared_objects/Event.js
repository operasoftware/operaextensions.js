
var OEvent = function(eventType, eventProperties) {
  
  var evt = eventProperties || {};
  
  evt.type = eventType;
        
  if(!evt.target) evt.target = global;
  if(!evt.currentTarget) evt.currentTarget = evt.target;
  if(!evt.srcElement) evt.srcElement = evt.target;
  
  if(evt.bubbles !== true) evt.bubbles = false;
  if(evt.cancelable !== true) evt.cancelable = false;
  
  if(!evt.timeStamp) evt.timeStamp = 0;
  
  /*var evt = document.createEvent("Event");

  evt.initEvent(eventType, true, true);

  // Add custom properties or override standard event properties
  for (var i in eventProperties) {
    evt[i] = eventProperties[i];
  }*/

  return evt;

};
