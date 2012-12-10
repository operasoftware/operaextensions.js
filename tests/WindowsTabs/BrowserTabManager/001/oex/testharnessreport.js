var SPARTAN_HOST = "localhost";
var SPARTAN_PORT = "80";

/*
 * Semi-short callback script for SPARTAN.
 * 
 * There may well be bugs. You have been warned. (Especially if you set
 * useRawForm to false, as iframes are buggy, and form submission in iframes is
 * really buggy.)
 * 
 * Example: var spartan = new spartanHandler("My amazing test suite");
 * spartan.addTest("This test passes!", true); spartan.addTest("This test
 * fails!", false, "Test message about fail, timeout, etc."); spartan.send();
 * 
 * Usage: - The spartanHandler constructor creates a new test suite, and takes
 * one string as an argument, the name of the test suite. - addTest adds a test
 * to the test suite, whose first argument is the test case name (this must be
 * unique within the test suite), a string, and whose second argument is a
 * boolean where true is a pass and false is a failure. - send sends the results
 * to SPARTAN.
 * 
 * NB: The combined length of the test suite name and any test case name plus
 * two (as they are concatenated with ": ") must not be greater than 255.
 * 
 * NB: Neither the test suite name nor any test case name can contain a tab
 * character.
 */
var spartanHandler = function(name) {
    if (name) {
        var testSuiteName = String(name);
        if (testSuiteName.indexOf("\t") !== -1) {
            throw new Error("spartanHandler's name parameter must not contain any tabs");
        }
    } else {
        var testSuiteName = "";
    }

    var tests = [], sendOnLoad = false, sent = false, useRawForm = false, useXHR = true;

    this.addTest = function(name, passed, message) {
        name = String(name);
        message = message ? String(message) : '';
        if (name.indexOf("\t") !== -1) {
            throw new Error("spartanHandler.addTest's name parameter must not contain any tabs");
        }

        if (typeof passed !== "boolean") {
            throw new TypeError("spartanHandler.addTest's passed parameter must be a boolean");
        }

        if (message.indexOf("\t") !== -1) {
            throw new Error("spartanHandler.addTest's message parameter must not contain any tabs");
        }

        tests.push([ name, passed, message ]);
    };

    this.send = function() {
        if (sent) {
            throw new Error("spartanHandler has already sent results");
        }

        if (document.body || document.createElement("iframe").contentDocument !== null || useRawForm || useXHR) {
            realSend();
        } else {
            sendOnLoad = true;
        }
    };

    var formatTestName = function(test_name) {
        var name = (testSuiteName ? testSuiteName + ": " : "") + test_name;
        if (name.length > 255) {
            throw new Error("Test case identifier is longer than 255 characters: " + name);
        }
        return name;
    };

    var formatValue = function(test_name, pass, test_message) {
        var name = formatTestName(test_name);
        if (test_message != '') {
            test_message = "\t# " + test_message;
        }
        return name + "\t" + (pass ? "PASSED" : "FAILED") + test_message;
    };

    var createFormRaw = function() {
        var form = document.createElement("form");
        if (typeof g_resultHome !== "undefined") {
            form.action = g_resultHome;
        } else {
            var host = "localhost";
            var port = "80";
            if (typeof SPARTAN_HOST != "undefined") {
                host = SPARTAN_HOST;
            }
            if (typeof SPARTAN_PORT != "undefined") {
                port = SPARTAN_PORT;
            }
            form.action = "http://" + host + ":" + port + "/";
        }
        form.method = "POST";
        return form;
    };

    var createFormIframe = function() {
        var iframe = document.createElement("iframe");
        // iframe.style.display = "none";
        document.body.appendChild(iframe);
        var iframeDoc = iframe.contentDocument;
        var form = iframeDoc.forms[0];
        if (typeof g_resultHome !== "undefined") {
            form.action = g_resultHome;
        } else {
            var host = "localhost";
            var port = "80";
            if (typeof SPARTAN_HOST != "undefined") {
                host = SPARTAN_HOST;
            }
            if (typeof SPARTAN_PORT != "undefined") {
                port = SPARTAN_PORT;
            }
            form.action = "http://" + host + ":" + port + "/";
        }
        return form;
    };

    var populateForm = function(form) {
        tests.forEach(function(test) {
            form.appendChild(form.ownerDocument.createElement("input"));
            form.lastChild.name = "jstests[]";
            form.lastChild.value = formatValue(test[0], test[1], test[2]);
        });
        return form;
    };

    var sendForm = function(create_func) {
        populateForm(create_func()).submit();
    };

    var formEncode = function(data) {
        var encoded = data.reduce(function(prev, cur) {
            return prev + (prev === "" ? "" : "&") + encodeURIComponent(cur[0]) + "=" + encodeURIComponent(cur[1]);
        }, "");
        var space_replaced = encoded.replace("%20", "+");
        return encoded;
    };

    var sendXHR = function() {
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && document.body) {
                var pre = document.createElement("pre");
                pre.textContent = "Response from localhost:\n" + this.responseText;
                document.body.appendChild(pre);
            }
        };

        var form_name_values = tests.map(function(x) {
            return [ "jstests[]", formatValue(x[0], x[1]) ];
        });
        var data = formEncode(form_name_values);
        if (typeof g_resultHome !== "undefined") {
            xhr.open("POST", g_resultHome);
        } else {
            var host = "localhost";
            var port = "80";
            if (typeof SPARTAN_HOST != "undefined") {
                host = SPARTAN_HOST;
            }
            if (typeof SPARTAN_PORT != "undefined") {
                port = SPARTAN_PORT;
            }
            xhr.open("POST", "http://" + host + ":" + port + "/");
        }
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        xhr.send(data);
    };

    var realSend = function() {
        if (useXHR) {
            sendXHR();
        } else if (useRawForm) {
            sendForm(createFormRaw);
        } else {
            sendForm(createFormIframe);
        }
    };

    document.addEventListener("DOMContentLoaded", function() {
        if (sendOnLoad) {
            realSend();
            sendOnLoad = false;
        }
    }, false);
};

function register_spartan_handler(name) {
    // XXX should really escape tab characters here
    var spartan_handler = new spartanHandler("");
    var register_result = function(test) {
        var name = test.name;
        var passed = test.status === test.PASS;
        var message = test.message;
        spartan_handler.addTest(name, passed, message);
    };
    var send_results = function(tests) {
        spartan_handler.send();
    };
    add_result_callback(register_result);
    add_completion_callback(send_results);
}

if (window.opera) {
    register_spartan_handler();
}
