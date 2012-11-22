!(function( global ) {

  var opera = global.opera || { 
    REVISION: '1', 
    postError: function( str ) { 
      console.log( str ); 
    } 
  };
