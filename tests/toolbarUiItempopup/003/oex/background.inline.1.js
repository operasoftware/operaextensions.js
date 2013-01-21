opera.isReady(function() {
  
  var getProperties = window['getProperties'] = function( object, depth, prefix )
  {
      prefix = prefix||"";
      var t = "";
      for( key in object )
      {
          t += prefix + "" + "[" + key  + "] " + typeof(object[key]) + " " + object[key] + "\n";
          if( typeof(object[key]) == "object" && depth>0 )
          {
              t += getProperties( object[key], depth-1, "[" + key  + "]" + prefix );
          }
          if( depth==0 ){
              t += "------------Max depth reached \n";
          }
      }
      return t;
  }
  
  var postToLocalHost = window['postToLocalHost'] = false;
  var POST = window['POST'] = function( result, msg )
  {
    msg = msg||"";
    if( postToLocalHost && ( result == "PASSED" || result == "FAILED" ) )
    {
      var lx = new XMLHttpRequest();
      lx.open("POST", "http://localhost/", true);
      lx.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var dataResult = "result=" + ((result=="PASSED") ? "PASS" : "FAIL");
      var dataMessage = ((result=="PASSED") ? "" : "%09" +  encodeURI(msg));
      lx.send( dataResult + dataMessage );
      opera.postError( "Submitted this result to SPARTAN:\t" + dataResult + "\n" + dataMessage);
    }
    var value = "Extensions: 003 - createItem http href \t" + result + "\n" + msg;
    opera.postError( "==BackgroundProcess==\n" + value );
  }
  var PASS = window['PASS'] = function( msg )
  {
      POST( "PASSED", msg );
  }
  var FAIL = window['FAIL'] = function( msg )
  {
      POST( "FAILED", msg );
  }
  var MANUAL = window['MANUAL'] = function( msg )
  {
      POST( "MANUAL", msg );
  }
  
});