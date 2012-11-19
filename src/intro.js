(function( global ) {

  var opera = global.opera || {};

  var OEX = opera.extension = opera.extension || { REVISION: '1' };

  self.console = self.console || {

    info: function() {},
    log: function() {},
    debug: function() {},
    warn: function() {},
    error: function() {}

  };
