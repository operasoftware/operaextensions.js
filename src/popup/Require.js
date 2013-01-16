
// Used to trigger opera.isReady() functions
var deferredComponentsLoadStatus = {
  'WIDGET_API_LOADED': false,
  'WIDGET_PREFERENCES_LOADED': false,
  'TOOLBAR_CONTEXT_LOADED': false
  // ...etc
};

// Events to delay until window 'load' event has been
// fired by opera.isReady() below
var delayedExecuteEvents = [
  // Example:
  // { 'target': opera.extension, 'eventName': 'message', 'eventObj': event }
];
