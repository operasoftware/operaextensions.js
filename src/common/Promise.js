
var OPromise = function() {

  Promise.call( this );
  
  // General enqueue/dequeue infrastructure

  this._queue = [];
  this.resolved = false;

  this.on('promise:resolved', function() {

    // Mark this object as resolved
    this.resolved = true;

    // Run next enqueued action on this object, if any
    this.dequeue();
  }.bind(this));

};

OPromise.prototype = Object.create( Promise.prototype );

// Add OEventTarget helper functions to OPromise prototype
for(var i in OEventTarget.prototype) {
  OPromise.prototype[i] = OEventTarget.prototype[i];
}

OPromise.prototype.enqueue = function() {

  // Must at least provide a method name to queue
  if(arguments.length < 1) {
    return;
  }
  var methodObj = arguments[0];

  var methodArgs = [];

  if(arguments.length > 1) {
    for(var i = 1, l = arguments.length; i < l; i++) {
      methodArgs.push( arguments[i] );
    }
  }
  
  if(this.resolved) {
    // Call immediately if object is resolved
    methodObj.apply(this, methodArgs);
  } else {
    // Otherwise add provided action item to this object's queue
    this._queue.push( { 'action': methodObj, 'args': methodArgs } );
  }

};

OPromise.prototype.dequeue = function() {
  // Select first queued action item
  var queueItem = this._queue[0];

  if(!queueItem) {
    return;
  }

  // Remove fulfilled action from this object's queue
  this._queue.splice(0, 1);

  // Fulfil action item
  if( queueItem.action ) {
    queueItem.action.apply( this, queueItem.args );
  }

};
