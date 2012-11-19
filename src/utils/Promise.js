
OEX.Promise = function() {

  OEX.RSVP.Promise.call( this );

  // General enqueue/dequeue infrastructure

  var self = this;

  this._queue = [];
  this.resolved = false;

  this.on('promise:resolved', function() {

    // Mark this object as resolved
    self.resolved = true;

    // Run next enqueued action on this object, if any
    self.dequeue();
  });

};

OEX.Promise.prototype = Object.create( OEX.RSVP.Promise.prototype );

OEX.Promise.prototype.addEventListener = OEX.Promise.prototype.on;

OEX.Promise.prototype.removeEventListener = OEX.Promise.prototype.off;

OEX.Promise.prototype.fireEvent = function( oexEventObj ) {

  var eventName = oexEventObj.type;

  if(typeof this[ 'on' + eventName.toLowerCase() ] === 'function') {
    this[ 'on' + eventName.toLowerCase() ].call( this, oexEventObj );
  }

  this.trigger( eventName, oexEventObj );

}

OEX.Promise.prototype.enqueue = function() {

  // Must at least provide a method name to queue
  if(arguments.length < 1) {
    return;
  }
  var methodName = arguments[0];

  var methodArgs = [];

  if(arguments.length > 1) {
    for(var i = 1, l = arguments.length; i < l; i++) {
      methodArgs.push( arguments[i] );
    }
  }

  // Add provided action item to the queue
  this._queue.push( { 'action': methodName, 'args': methodArgs } );

  //console.log("Enqueue on obj[" + this._operaId + "] queue length = " + this._queue.length);
};

OEX.Promise.prototype.dequeue = function() {
  // Select first queued action item
  var queueItem = this._queue[0];

  if(!queueItem) {
    return;
  }

  // Remove fulfilled action from the queue
  this._queue.splice(0, 1);

  // Fulfil action item
  if( this[ queueItem.action ] ) {
    this[ queueItem.action ].apply( this, queueItem.args );
  }

  //console.log("Dequeue on obj[" + this._operaId + "] queue length = " + this._queue.length);
};
