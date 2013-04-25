
var OEvent = function(eventType, eventProperties) {
  
  var props = eventProperties || {};
  
  var newEvt = new CustomEvent(eventType, true, true);

  for(var i in props) {
    newEvt[i] = props[i];
  }

  return newEvt;

};
