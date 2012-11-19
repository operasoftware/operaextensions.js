(function( global ) {

  var opera = global.opera || { REVISION: '1' };

  var OEX = opera.extension = opera.extension || {};
  
  var OEC = opera.contexts = opera.contexts || {};

  self.console = self.console || {

    info: function() {},
    log: function() {},
    debug: function() {},
    warn: function() {},
    error: function() {}

  };
