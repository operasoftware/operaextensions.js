function select(selector) {
  return document.querySelector(selector);
}

function resetTable(id) {
	var table = select(id);
	while (table.rows.length > 2) {
		table.deleteRow(table.rows.length - 1);
	}
}

function reloadWindows2Table() {
	 
	var wins = windows.getAll();
	resetTable("#windows2");
	
	var table = select("#windows2");

	for (i in wins) {
		var win = wins[i];
		var tabs = win['tabs'].getAll();
		var row = table.insertRow(-1);
	    if(win.focused) {
	    	row.classList.add("focused");
	    }
		row.insertCell(-1).innerText = win.properties.id;
	    
	    row.insertCell(-1).innerText = tabs && tabs.length || 0;
	    var cell = row.insertCell(-1);
	    var s_tabs = "";
	    if(tabs) {
		    for(j in tabs){
		    	var tab = tabs[j];
		    	s_tabs += "<li "+ (tab.properties != null && tab.properties.active ? " class='active'" : "") + "><strong data-id='" + tab.properties.id + "' class='tab-focus'>[" + tab.properties.id;
		    	s_tabs += "]<button data-id='" + tab.properties.id + "' class='tab-close'>close tab</button><button data-id='" + tab.properties.id + "' class='tab-" + (tab.properties != null && tab.properties.pinned ? "un": "") + "lock'>" + (tab.properties != null && tab.properties.pinned ? "un": "") + "pin</button></strong>";
		    	s_tabs += " <span class='tab-url-edit' data-id='" + tab.properties.id + "'>" + tab.url + "</span></li>";
		    };
		    cell.innerHTML = "<ul>"+s_tabs+"</ul>";
	    }
	    var actionsCell = row.insertCell(-1);
	    actionsCell.innerHTML = ['<button data-id="',
	                             win.properties.id,
	                             '" class="window-insert-tab">insert tab</button>',
	                             '<button data-id="',
	                             win.properties.id,
	                             '" class="window-close">close win</button>',
	                             ].join('');
	}	
}
function reloadWindowsTable() {
  
	chrome.windows.getAll({populate: true}, function(w) {
		var wins = w;
		resetTable("#windows");
		var table = select("#windows");

		for (i in wins) {
			var win = wins[i];
			var tabs = win['tabs'];
			var row = table.insertRow(-1);
		    if(win.focused) {
		    	row.classList.add("focused");
		    }
			row.insertCell(-1).innerText = win.id;
		    
		    row.insertCell(-1).innerText = tabs && tabs.length || 0;
		    var cell = row.insertCell(-1);
		    var s_tabs = "";
		    if(tabs) {
			    for(j in tabs){
			    	var tab = tabs[j];
			    	s_tabs += "<li "+ (tab.active ? " class='active'" : "") + "><strong>[" + tab.id;
			    	s_tabs += "] "+ (tab.pinned ? "<i>pinned</i>" : "") +"</strong>";
			    	s_tabs += " <span class='tab-url-edit' data-id='" + tab.id + "'>" + tab.url + "</span></li>";
			    };
			    cell.innerHTML = "<ul>"+s_tabs+"</ul>";
		    }
		    
		}	
    });
}
function startListening() {
	chrome.windows.onCreated.addListener(listener("windows.onCreated"));
	chrome.windows.onRemoved.addListener(listener("windows.onRemoved"));
	chrome.windows.onFocusChanged.addListener(listener("windows.onFocusChanged"));
	
	chrome.tabs.onCreated.addListener(listener("tabs.onCreated"));
	chrome.tabs.onUpdated.addListener(listener("tabs.onUpdated"));
	chrome.tabs.onMoved.addListener(listener("tabs.onMoved"));
	chrome.tabs.onRemoved.addListener(listener("tabs.onRemoved"));
	chrome.tabs.onAttached.addListener(listener("tabs.onAttached"));
	chrome.tabs.onDetached.addListener(listener("tabs.onDetached"));
	chrome.tabs.onHighlighted.addListener(listener("tabs.onHighlighted"));
	chrome.tabs.onActivated.addListener(listener("tabs.onActivated"));
	chrome.tabs.onMoved.addListener(listener("tabs.onMoved"));
}
function logEvt(name) {
	$('#events').append(name +'<br />' );
	var elem = select("#events");
	var height = elem.scrollHeight - elem.offsetHeight;
	if(height > 0) {
		$('#events').scrollTop(height);
	}		
}
function logEvt2(name) {
	$('#events2').append(name +'<br />' );
	var elem = select("#events2");
	var height = elem.scrollHeight - elem.offsetHeight;
	if(height > 0) {
		$('#events2').scrollTop(height);
	}
		
}
function listener(type) {
	return function (evt) {
		logEvt(type);
		reloadWindowsTable();
		reloadWindows2Table();
	}
}
function listener2(type) {
	return function (evt) {
		var id = evt.browserWindow ? 'window: ' + evt.browserWindow.id : 'tab: '+ evt.tab.id;
		logEvt2(type + ' [' + id + ']');
		reloadWindowsTable();
		reloadWindows2Table();
	}
}
function stopListening() {
	chrome.windows.onCreated.removeListener(listener("windows.onCreated"));
	chrome.windows.onRemoved.removeListener(listener("windows.onRemoved"));
	chrome.windows.onFocusChanged.removeListener(listener("windows.onFocusChanged"));
	
	chrome.tabs.onCreated.removeListener(listener("tabs.onCreated"));
	chrome.tabs.onUpdated.removeListener(listener("tabs.onUpdated"));
	chrome.tabs.onMoved.removeListener(listener("tabs.onMoved"));
	chrome.tabs.onRemoved.removeListener(listener("tabs.onRemoved"));
	chrome.tabs.onAttached.removeListener(listener("tabs.onAttached"));
	chrome.tabs.onDetached.removeListener(listener("tabs.onDetached"));
	chrome.tabs.onHighlighted.removeListener(listener("tabs.onHighlighted"));
	chrome.tabs.onActivated.removeListener(listener("tabs.onActivated"));
	chrome.tabs.onMoved.removeListener(listener("tabs.onMoved"));
}
function startListening2() {
	windows.addEventListener("create", listener2("windows.create"), false);
	windows.addEventListener("close",  listener2("windows.close"), false);
	windows.addEventListener("blur",   listener2("windows.blur"), false);
	windows.addEventListener("focus",  listener2("windows.focus"), false);
	windows.addEventListener("update",  listener2("windows.update"), false);
	windows.addEventListener("move",  listener2("windows.move"), false);
	
	tabs.addEventListener("create", listener2("tabs.create"), false);
	tabs.addEventListener("close",  listener2("tabs.close"), false);
	tabs.addEventListener("blur",   listener2("tabs.blur"), false);
	tabs.addEventListener("focus",  listener2("tabs.focus"), false);
	tabs.addEventListener("update",  listener2("tabs.update"), false);
	tabs.addEventListener("move",  listener2("tabs.move"), false);
}
function onload() {
	startListening();
	reloadWindowsTable();
}

document.addEventListener('DOMContentLoaded', function() {
  onload();
  
  $('body').on('click', '.tab-url-edit' , function(evt){
	  var elem = $(this);
	  var elemUrl = elem.html();
	  var id = elem.attr('data-id');
	  var newElem = "<input class='tab-edit' type='text' value='" + elemUrl + "'/>";
	  elem.replaceWith(newElem);
	  console.log(newElem);
	  $('.tab-edit').focus().keypress(function(e){
		  code= (e.keyCode ? e.keyCode : e.which);
		  if (code == 13) {
			  var newUrl = $(this).val();
			  
			  $(this).replaceWith("<span class='tab-url-edit' data-id='" + id + "'>" + newUrl + "</span>");
			  updateTabUrl(id,newUrl);
			  e.preventDefault();
		  }
	  }).blur(function(){
		  $(this).replaceWith("<span class='tab-url-edit' data-id='" + id + "'>" + elemUrl + "</span>");
	  });
  });
  
  $('body').on('click', '.tab-close', function(evt){
	  var elem = $(this);
	  var id = elem.attr('data-id');
	  closeTab(id);
  });
  
  $('body').on('click', '.window-insert-tab', function(evt){
	  var elem = $(this);
	  var id = elem.attr('data-id');
	  insertTab(id);
  });
  
  $('body').on('click', '.window-close', function(evt){
	  var elem = $(this);
	  var id = elem.attr('data-id');
	  closeWin(id);
  });

  $('body').on('click', '.tab-focus', function(evt){
	  var elem = $(this);
	  var id = elem.attr('data-id');
	  focusTab(id);
	  console.log('focus-tab ' + id);
  });
  
  $('body').on('click', '.tab-lock', function(evt){
	  var elem = $(this);
	  evt.stopPropagation();
	  elem.attr("disabled", true);
	  var id = elem.attr('data-id');
	  updateTab(id,{locked: 1 });
  });
  $('body').on('click', '.tab-unlock', function(evt){
	  var elem = $(this);
	  evt.stopPropagation();
	  elem.attr("disabled", true);
	  var id = elem.attr('data-id');
	  updateTab(id,{locked: 0 });
  });
  
});

var windows = opera.extension.windows; 
var tabs = opera.extension.tabs;

opera.isReady(function(){
	startListening2();
	reloadWindows2Table();
	var btn = select('#new_window');
	btn.addEventListener('click', function(){
		windows.create([], {});
	});
	btn.disabled = false;
	$('.tab-close').click()
});	

function closeTab(id) {
	var t = tabs.getAll();
	for(var i=0; i<t.length; i++){
		if(t[i].properties.id == id){
			t[i].close();
		}
	}
}
function closeWin(id) {
	var w = windows.getAll();
	for(var i=0; i<w.length; i++){
		if(w[i].properties.id == id){
			w[i].close();
		}
	}
}
function insertTab(id) {
	var w = windows.getAll();
	for(var i=0; i<w.length; i++){
		if(w[i].properties.id == id){
			var t = w[i].tabs.getAll();
			var a = 0
			if(t.length > 0){
				 a = Math.floor((Math.random()*t.length)); 
			}
			console.log(a);
			console.log(w[i])
			w[i].tabs.create({url: "http://opera.com"}, t[a]);
		}
	}
}
function updateTabUrl(id,url) {
	var t = tabs.getAll();
	for(var i=0; i<t.length; i++){
		if(t[i].properties.id == id){
			t[i].update({url: url});
		}
	}
}

function focusTab(id){
	var t = tabs.getAll();
	for(var i=0; i<t.length; i++){
		if(t[i].properties.id == id){
			t[i].focus();
		}
	}
}

function updateTab(id,prop){
	var t = tabs.getAll();
	for(var i=0; i<t.length; i++){
		if(t[i].properties.id == id){
			t[i].update(prop);
		}
	}
}