!(function( global ) {

  var opera = global.opera || { 
    REVISION: '1', 
    postError: function() { 
      console.log.apply( null, arguments ); 
    } 
  };
  