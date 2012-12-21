
/**
 * Queue for running multi-object promise-rooted asynchronous 
 * functions serially
 */
var Queue = (function() {
  var _q = [], _lock = false, _timeout = 1000;
  
  function callNext() {
    _lock = false;
    dequeue(); // auto-execute next queue item
  }

  function dequeue() {
    if (_lock) {
      return;
    }
    _lock = true; // only allow one accessor at a time
    
    var item = _q.shift(); // pop the next item from the queue

    if (item === undefined) {
      _lock = false;
      return; // end dequeuing
    }
    if (item.obj.isResolved) {
      // execute queue item immediately
      item.fn.call(item.obj, callNext);
    } else {
      if(item.ignoreResolve) {
        item.fn.call(item.obj, callNext);
      } else {
        // break deadlocks
        var timer = global.setTimeout(function() {
          console.warn('PromiseQueue deadlock broken with timeout.');
          console.log(item.obj);
          console.log(item.obj.isResolved);
          item.obj.trigger('promise:resolved'); // manual trigger / resolve
        }, _timeout);
      
        // execute queue item when obj resolves
        item.obj.on('promise:resolved', function() {
          if(timer) global.clearTimeout(timer);
        
          item.obj.isResolved = true; // set too late in rsvp.js
        
          item.fn.call(item.obj, callNext);
        });
      }
    }
  };

  return {
    enqueue: function(obj, fn, ignoreResolve) {
      _q.push({ "obj": obj, "fn": fn, "ignoreResolve": ignoreResolve });
      dequeue(); // auto-execute next queue item
    },
    dequeue: function() {
      dequeue();
    }
  }
})();
