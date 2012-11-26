var tests = [], // Asynchronous tests
testNames = {
    "background" : "Background Process Interface check",
    "popup" : "Popup Process Interface check",
    "injectable" : "Injected Script Process Interface check"
};

tests["background"] = async_test(testNames["background"]);
tests["popup"] = async_test(testNames["popup"]);
tests["injectable"] = async_test(testNames["injectable"]);

function getHandler() {
    return function(evt) {
        var type = evt.data.type;
        tests[type].step(function() {
            assert_exists(evt.data, "getFile", testNames[type] + ": OperaResourceLoader.getFile");
        });
        tests[type].done();
    }
}

ext.onmessage = getHandler();

// Background Interface Test
tests["background"].step(function() {
    assert_exists(ext.__proto__, "getFile", testNames["background"] + ": OperaResourceLoader.getFile");
    tests["background"].done();
});

// Popup Interface Test
createTab({
    url : 'popup.html?' + Math.floor(Math.random() * 1e10),
    focused : true
}); // with
// cache
// buster

// Injectable Interface Test
createTab({
    url : 'http://team.opera.com/testbed/generic/blank.html?resourceload_001',
    focused : true
});
