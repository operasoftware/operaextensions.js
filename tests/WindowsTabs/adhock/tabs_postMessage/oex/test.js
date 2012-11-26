function waitTillTabReady(tab, fun)
{
	setTimeout(function(){
		if (tab.readyState == "complete")
			fun()
		else
			waitTillTabReady(tab, fun);
	}, 100);
}

var test = async_test("Check that tab.postMessage works after refreshing tab - CORE-46732")
test.step(function() {
	var tab = opera.extension.tabs.create({url:"http://t.oslo.osa"});
	waitTillTabReady(tab, test.step_func(function()
	{
		tab.postMessage("foo");
		tab.refresh();
		waitTillTabReady(tab, test.step_func(function()
		{
			try
			{
				tab.postMessage("foo");
				assert_true(true, "Expect no exception in tab.postMessage()");
			}
			catch(e)
			{
				assert_true(false, "Expect no exception in tab.postMessage()");
			}
			tab.close();
			test.done();
		}));
	}));
});
