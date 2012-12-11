opera.isReady(function(){
    var tab,
        tests = [];

    var navy  = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAACRJREFUOE9jZGBoYCARADWQhEhTDXIOScaPaiAyuEaDlXBAAQBiw3iCaRp9LAAAAABJRU5ErkJggg==";
    var green = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAdSURBVDhPY2RoYCAJMJGkGqh4VAMxITYaSoMjlAC7HwCg2cupqgAAAABJRU5ErkJggg==";
    var red   = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAfSURBVDhPY%2FzPwABE5AMm8rVCdI4aMBoGo%2BlgsOQFAFhtAh7mIZv1AAAAAElFTkSuQmCC";
    var remote = "http://t/resources/images/16x16-navy.png";

    function getDoc(iconUrl) {
    	return "data:text/html,<!DOCTYPE html><title>Favicon</title>"
    	     + "<link rel='icon' href='" + iconUrl + "'><p>Favicon Test";
    }

    tests['data'] = async_test("Simple favicon data URL test");
    tests['update'] = async_test("Updating the favicon");

    tests['data'].step(function() {
    	tab = createTab({ url: getDoc(green) });

    	var count = 0;
    	// Make sure the document loads before checking the favicon URL.
    	// Otherwise, this would give random results on spartan
    	var timer = setInterval(tests['data'].step_func(function() {
    		if (tab.readyState === "complete" || count > 100) {
    			clearInterval(timer);
    			assert_equals(tab.readyState, "complete", "The document failed to complete loading");
    			assert_equals(tab.faviconUrl, green, "The favicon URL should match the specified address");
    			tests['data'].done();

    			tab.update({faviconUrl: red});
    			setTimeout(tests['update'].step_func(function() {
    				assert_equals(tab.faviconUrl, green, "The favicon URL should not change");
    				tests['update'].done();
    			}), 10);
    		}
    		count++;
    	}), 10);
    });

    tests['http'] = async_test("Simple favicon http URL test");
    tests['http'].step(function() {
    	var tab = createTab({ url: "http://t/resources/favicon.html" });
    	//var tab = createTab({ url: "http://localhost/t/favicon.php" })

    	var count = 0;
    	// Make sure the document loads before checking the favicon URL.
    	// Otherwise, this would give random results on spartan
    	var timer = setInterval(tests['http'].step_func(function() {
    		if (tab.readyState === "complete" || count > 100) {
    			clearInterval(timer);
    			assert_equals(tab.readyState, "complete", "The document failed to complete loading");
    			assert_equals(tab.faviconUrl, remote, "The favicon URL should match the specified address");
    			tests['http'].done();
    		}
    		count++;
    	}), 10);
    });
});