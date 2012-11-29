var tests = [], // Asynchronous tests
testNames = {
    "background" : "Background Process with web_accessible_resources",
    "popup" : "Popup Process with web_accessible_resources",
    "injectable" : "Injected Script with web_accessible_resources",
		"background_noWAR" : "Background Process without web_accessible_resources",
    "popup_noWAR" : "Popup Process without web_accessible_resources",
    "injectable_noWAR" : "Injected Script without web_accessible_resources"
};

tests["background"] = async_test(testNames["background"]);
tests["background_noWAR"] = async_test(testNames["background_noWAR"]);
tests["popup"] = async_test(testNames["popup"]);
tests["popup_noWAR"] = async_test(testNames["popup_noWAR"]);
tests["injectable"] = async_test(testNames["injectable"]);
tests["injectable_noWAR"] = async_test(testNames["injectable_noWAR"]);

function getHandler() {
    return function(evt) {
        var type = evt.data.type;
        tests[type].step(function() {
            assert_true(evt.data.getFile!=undefined, "Calling getFile with a "+type.replace('_noWAR','')+" pointing to a valid file returns a File");
        });
        tests[type].done();
    }
}

ext.onmessage = getHandler();


var file = getFile('/oex/resources/file.txt');

verifyTextFile(file, "pass", function(cb) {
  tests["background"].step(function() {
    assert_true(cb["result"] === "pass", "Calling getFile with a background pointing to a valid file returns a File");
    tests["background"].done();
  });
});

var file = getFile('/oex/resources/file_noWAR.txt');

verifyTextFile(file, "pass", function(cb) {
  tests["background_noWAR"].step(function() {
    assert_true(cb["result"] === "pass", "Calling getFile with a background pointing to a valid file returns a File");
    tests["background_noWAR"].done();
  });
});


// Popup Interface Test
createTab({
    url : '/popup.html?' + Math.floor(Math.random() * 1e10),
    focused : true
}); // with
// cache
// buster

// Injectable Interface Test
createTab({
    url : 'http://team.opera.com/testbed/generic/blank.html?resourceload_015',
    focused : true
});
