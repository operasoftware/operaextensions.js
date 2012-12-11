opera.isReady(function(){
    var tab, title1, title2,
        tests = [];


    tests['basic'] = async_test("Refresh test");

    tests['basic'].step(function() {
    	tab = createTab({url: "oex/refresh.html"});

    	var count = 0;
    	// Make sure the document loads before checking the title.
    	// Otherwise, this would give random results on spartan
    	var timer = setInterval(tests['basic'].step_func(function() {
    		if (tab.readyState === "complete" || count > 100) {
    			clearInterval(timer);
    			assert_equals(tab.readyState, "complete", "The document failed to complete loading");
    			title1 = tab.title;

    			setTimeout(tests['basic'].step_func(function() {
    				tab.refresh();
    				var timer = setInterval(tests['basic'].step_func(function() {
    					if (tab.readyState === "complete" || count > 100) {
    						clearInterval(timer);
    						assert_equals(tab.readyState, "complete", "The document failed to complete re-loading");

    						title2 = tab.title;

    						//opera.postError("Title 1: " + title1 + ", Title 2: " + title2);
    						assert_true(parseInt(title1) < parseInt(title2), "The title should have updated");
    						tests['basic'].done();
    					}
    					count++;
    				}), 10);
    			}), 10);
    		}
    		count++;
    	}), 10);

    });

});
