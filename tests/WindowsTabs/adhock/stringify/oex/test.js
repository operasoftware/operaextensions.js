opera.isReady(function(){
    var tab = createTab({url: 'data:text/plain,Doubleplus cool'})
    var string = "";

    test(function() {
        string = JSON.stringify(tab)
        assert_true(string.indexOf('Doubleplus cool') >= 0)
    }, "JSON.stringify(tab) should give us some info")

    test(function() {
        var o = JSON.parse(string);
        assert_equals(o.url, tab.url, 'url');
        assert_equals(o.id, tab.id, 'id');
        assert_equals(o.locked, tab.locked, 'locked');
        assert_equals(o.position, tab.position, 'position');
        assert_equals(o.private, tab.private, 'private');
        assert_equals(o.selected, tab.selected, 'selected');
        assert_equals(o.tabGroup, tab.tabGroup, 'tabGroup');
        assert_equals(o.closed, tab.closed, 'closed');
        assert_equals(o.title, tab.title, 'title');
        assert_equals(o.browserWindow.id, tab.browserWindow.id, 'browserWindow.id');
    }, "JSON.parse(stringedtab) should give us something looking like a tab");

    /* This is specifically what the bug said. Altough it doesn't make sense*/
    var t = async_test("JSON.stringify with focus event listener")
    t.step(function() {
		var tab2;

		tabs.addEventListener('focus', t.step_func(function(e) {
		    	var s = JSON.stringify(tab2);
		    	console.log(tab2);
	    		assert_true(s.indexOf('url') >= 0, 'expect url');
    	    	t.done();
    	}), false);

    	tab2 = createTab({url:'data:text/plain,yay', focus:false});

	setTimeout(function(){ tab2.focus() }, 100);
    });
});
