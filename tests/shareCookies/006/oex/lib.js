var reported = false;
var ckURL = "http://testsuites.oslo.osa/core/features/widget_tf/core-gadgets/extensions/share-cookies/res/mkc.php";
var ckData = "name=ck" + (new Date().getTime()) + "check;value=1";

/* Object enumerator */
function getProperties( object, depth, prefix )
{
	prefix = prefix||"";
	var t = "";
	for( key in object )
	{
		t += prefix + "" + "[" + key  + "] " + typeof(object[key]) + " " + object[key] + "\n";
		if( typeof(object[key]) == "object" && depth>0 )
		{
			t += getProperties( object[key], depth-1, "[" + key  + "]" );
		}
		if( depth==0 ){
			t += "------------ 5 \n";
		}
	}
	return t;
}

function POST( result, msg )
{
	if(reported) 
		return;
	msg = msg||"";
	var dataResult = "result=" + ((result=="PASSED") ? "PASS" : "FAIL");
	var dataMessage = ((result=="PASSED") ? "" : "%09" +  encodeURI(msg));
	try
	{
		var lx = new window.XMLHttpRequest();
		lx.open("POST", "http://localhost/", true);
		lx.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		lx.send( dataResult + dataMessage );
	}
	catch(e)
	{
		opera.postError( "Security error; attempting a form submission now.");
		var frm = document.createElement("form");
		frm.action = "http://localhost/";
		frm.method = "POST";
		var data = document.createElement("input");
		data.type = "hidden";
		data.name = "result";
		data.value = dataResult + dataMessage;
		frm.appendChild(data);
		frm.submit();
		opera.postError( 'frm submit done' );
	}
	opera.postError( "Submitted this result to SPARTAN:\t" + dataResult + "\n" + dataMessage);
	if(opera.extension && opera.extension.tabs)
		opera.extension.tabs.create({url: "data:text/plain, " + result + "\n" + dataMessage, focused:true});
	reported  = true;
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
	try
	{
		opera.postError( "MANUAL", msg );
	}
	catch(e)
	{
	}
}

/* Report failure timeout for the test*/

window.addEventListener("load", function(){
	setTimeout(function ()
			   {
				   if(!reported)
				   {
					   opera.postError( 'Test timed out');
					   POST("FAILED", "Timed out.");
				   }
			   },
			   20000);
}, false);

function checkCookie(expected, tp, meth)
{
	tp = tp || ckURL;
	meth = meth || 'GET';
	try
	{
		var xhr = new XMLHttpRequest();
		xhr.open(meth, tp, false);
		xhr.send(null);
		var d = xhr.responseText;
		opera.postError( 'Expects: ' + expected + "\nin\n" + xhr.responseText );
		if(d.indexOf(expected) > 0)
		{
			return true;
		}
	}
	catch(e)
	{
		opera.postError( e );
	}
	return false;
}
