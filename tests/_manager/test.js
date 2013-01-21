var tests = [];
var disabled = 0;
var curr = 0;
var timer = null;
var TC_TIMEOUT = 15000;

window.addEventListener("load", function() {
    try{
	chrome.management.getAll( function(exts) {
	    var str = "";

	    for (var i = 0; i < exts.length; i++){
        	if(exts[i].type == "extension" && exts[i].name.substring(0,3) == "tc-"){
        	    tests.push(exts[i]);
        	    str +=  i + " " + JSON.stringify(exts[i]) + "<br />";
        	}
	    }
	    //debug(str);
	    //runTest();
	    disableAll(function(){prepareEnvironment(runTest);});
	});
    }
    catch(err){}
});

function checkDisabledAll(callback){
    disabled++;
    if (disabled == tests.length) {
	if(callback){callback();}
    }
}

function disableAll(callback){
    for (var i = 0; i < tests.length; i++) {
	if (tests[i].enabled == true) {
	    chrome.management.setEnabled(tests[i].id, false, function(){
		checkDisabledAll(callback);
	    });
	}
	else {
	    checkDisabledAll(callback);
	}
    }
}

function prepareEnvironment(callback){
    chrome.windows.getAll({populate: true}, function(wins){
	if(wins.length){
	    for(var i=0; i<wins.length; i++){
		var tabs = [];
		tabs = tabs.concat(wins[i].tabs);
	    }
	    var waitForClosingNo = tabs.length-1;
	    if(waitForClosingNo <= 0){ if(callback){callback();} }

	    for (var i=0; i < tabs.length; i++) {
		chrome.tabs.remove(tabs[i].id, function(){
		    waitForClosingNo--;
    		    if(waitForClosingNo == 0){
    			chrome.windows.create({}, function(){
    			    if(callback){callback();}
    			});
    		    }
		});
	    }
	} else {
	    chrome.windows.create({}, function(){
		if(callback){callback();}
	    });
	}
    });
}

chrome.extension.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
	if(sender.id == tests[curr].id) {
	    if(timer){clearTimeout(timer);}
	    var log = document.getElementById('log');
	    var results = decodeURIComponent(request);
	    log.innerHTML += encodeURIComponent("<h2>" + tests[curr].name + "</h2><table class='results'>" + results + "</table>");//decodeURIComponent();
	    chrome.management.setEnabled(tests[curr].id, false, function(){
        	curr++;
        	prepareEnvironment(runTest);
	    });
	}
});

function runTest(){
    if(curr == tests.length) {
	result();
    }
    if(curr >= tests.length) {
	return;
    }
    chrome.management.setEnabled(tests[curr].id, true, function(){
	timer = setTimeout(function(){
	    chrome.management.setEnabled(tests[curr].id, false, function(){
		var log = document.getElementById('log');
		log.innerHTML += encodeURIComponent("<h2>" + tests[curr].name + "</h2><table class='results'><tr><td class='notrun'></td></tr></table>");

		curr++;

		prepareEnvironment(runTest);
	    });
	},TC_TIMEOUT);
    });
}

function summarizeResults(html){
    var div = document.createElement('div');
    	div.innerHTML = '<div>'+ html + '</div>';

    	html = div.firstElementChild;

    var tests = html.querySelectorAll('.results'),
    	testcases = html.querySelectorAll('.results tbody tr'),
    	fails = html.querySelectorAll('tr.fail'),
    	notrun = html.querySelectorAll('tr.notrun'),
    	passes = html.querySelectorAll('tr.pass');
    var str = [ "<section id='info_results'><p>Tests: ", tests.length, " [testcases: ",
	testcases.length, "]", "</p><p>Pass: ", passes.length,
	" / Fail: ", fails.length, " / Not run: ", notrun.length,
	"</p></section>" ].join('');

    var passesPr = +(passes.length * 100 / testcases.length).toFixed(0);
    var failsPr = +(fails.length * 100 / testcases.length).toFixed(0);
    var notrunPr = +(notrun.length * 100 / testcases.length).toFixed(0);

    var str_progress =  [
        '<section id="info_progress">',
	'<span class="percent" style="width: ' + passesPr + '%;">'
		+ passesPr + '%</span>',
	'<span class="percent fail" style="left: ' + passesPr
		+ '%;width: ' + failsPr + '%;">' + failsPr
		+ '%</span>',
	'<span class="percent notrun" style="left: '
		+ failsPr + passesPr + '%;width: ' + notrunPr
		+ '%;">' + notrunPr + '%</span>',
	'<span class="bg"> </span>', '</section>' ].join('');
    return str + str_progress;
}
function result(){

    var css = "html{font-family:DejaVu Sans, Bitstream Vera Sans, Arial, Sans}#log .warning,#log .warning a{color:#000;background:#FF0}#log .error,#log .error a{color:#FFF;background:red}#log pre{border:1px solid #000;padding:1em}section.summary{margin-bottom:1em}table.results{border-collapse:collapse;table-layout:fixed;width:100%}table.results th:first-child,table.results td:first-child{width:4em}table.results th:last-child,table.results td:last-child{width:50%}table.results.assertions th:last-child,table.results.assertions td:last-child{width:35%}table.results th{border-bottom:medium solid #000;padding:0 0 .5em}table.results td{border-bottom:thin solid #000;padding:1em 1em .5em}tr.pass>td:first-child{color:green}tr.notrun>td:first-child{color:blue}.pass>td:first-child,.fail>td:first-child,.timeout>td:first-child,.notrun>td:first-child{font-variant:small-caps}table.results span{display:block}h2{font-size:1.3em}a{border:2px solid #00C;color:#fff;background-color:#00C;display:block;line-height:1.5em;padding:0 .5em}a:hover{background-color:#fff;color:#00C}#info_progress{width:100%;position:relative;background:rgba(0,0,0,0.5);height:25px}#info_progress .percent{position:absolute;left:0;top:0;color:#FFF;font-weight:700;height:25px;line-height:25px;display:block;background:green;text-align:center}#info_progress .percent.fail{background:red}#info_progress .percent.notrun{background:gray}tr.fail>td:first-child,tr.timeout>td:first-child{color:red}table.results span.expected,table.results span.actual{font-family:DejaVu Sans Mono, Bitstream Vera Sans Mono, Monospace;white-space:pre}";
    var str = "data:text/html,<!DOCTYPE html><title>RAPORT</title><style>"+css+"</style>";
    var results = document.getElementById('log');
    var stats = summarizeResults(decodeURIComponent(results.innerHTML));
    //console.log();
    str += stats + results.innerHTML;
    chrome.windows.create({"url": str, focused: true});

}
function debug(msg) {
	var url = "data:text/html," + msg;
	//chrome.tabs.create({"url": url});
}