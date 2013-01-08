// The base document. The userJS for the test is attached above this point.
function getProperties( object, depth, prefix )
{
    prefix = prefix||"";
    var t = "";
    for( key in object )
    {
        try{
          t += prefix + "" + "[" + key  + "] " + typeof(object[key]) + " " + object[key] + "\n";
          if( typeof(object[key]) == "object" && depth>0 )
          {
              t += getProperties( object[key], depth-1, "[" + key  + "]" );
          }
          if( depth==0 ){
              t += "------------ Depth limit reached. \n";
          }
        } catch (e){
          t += getProperties( e, 5 ) + "\n";
        }
    }
    return t;
}
var postToLocalHost = false;
function POST( result, msg )
{
  msg = msg||"";
  var value = "Extensions: 003 - createItem backgroundColor hex \t" + result + "\n" + msg;
  var req = new window.XMLHttpRequest();
  if( postToLocalHost )
  {
    params = "jstests[]=" + value;
    req.open( "http://localhost:8840", "POST");
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", params.length);
    req.setRequestHeader("Connection", "close");
    req.send( params );
  } else {
    if( window.opera ) window.opera.postError( "==userJS==\n" + value );
  }
}
function PASS( msg )
{
    POST( "PASSED", msg );
}
function FAIL( msg )
{
    POST( "FAILED", msg );
}
function MANUAL( msg )
{
    POST( "MANUAL", msg );
}
