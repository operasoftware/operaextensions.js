opera.isReady(function() {

    /* https url */
    var ckURL = "https://testsuites.oslo.osa/core/features/widget_tf/core-gadgets/extensions/share-cookies/res/mkc.php";
    window.addEventListener("load", function ()
    						{
    							opera.extension.tabs.create({url: ckURL + "?setck=" + ckData , focused: true});
    						}, false);

    opera.extension.onmessage = function (e)
    {
    	opera.postError( e.data );
    	if (e.data && e.data.indexOf("Loaded:") == 0)
    	{
    		opera.postError( 'message received in extension' );
    		if(checkCookie(ckData))
    		{
    			POST("PASSED");
    		}
    		else
    		{
    			POST("FAILED", "Did not get the expected cookie value.");
    		}
    	}
    	else
    	{
    		opera.postError('message:' + e );
    	}
    }
});