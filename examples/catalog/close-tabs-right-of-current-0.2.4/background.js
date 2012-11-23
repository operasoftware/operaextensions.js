var leftButton, rightButton, extension = opera.extension;
var tabs = extension.tabs.getAll ? extension.tabs.getAll() : extension.tabs;

// for compatibility with Opera 11.x
function getFocusedWindow() {
  return extension.windows.getFocused ? extension.windows.getFocused() : extension.windows.getLastFocused();
}

function closeTab(tab) {
  tabs.close ? tabs.close(tab) : tab.close();
}

function isFocused(tab) {
  return tab.focused || tab.selected;
}

function closeTabsRightOfCurrent(current_tabs) {
  var current_tabs_arr = current_tabs.map ? current_tabs : current_tabs.getAll();
  var i = current_tabs_arr.map(isFocused).indexOf(true);
  current_tabs_arr.slice(i + 1 - parseInt(widget.preferences.getItem('includeSelf'))).forEach(closeTab);
}

function closeTabsLeftOfCurrent(current_tabs) {
  var current_tabs_arr = current_tabs.map ? current_tabs : current_tabs.getAll();
  var i = current_tabs_arr.map(isFocused).indexOf(true);
  current_tabs_arr.slice(0, i + parseInt(widget.preferences.getItem('includeSelf'))).forEach(closeTab);
}

function setupConnection() {
  extension.onmessage = function(event) {
    resetButtons();
  };

  extension.onconnect = function(event) {
    event.source.postMessage("hello");
  };
}

function resetButtons() {
  opera.contexts.toolbar.removeItem(leftButton);
  opera.contexts.toolbar.removeItem(rightButton);

  if (widget.preferences.getItem('option') == '1') {
    opera.contexts.toolbar.addItem(leftButton);
  }
  else if (widget.preferences.getItem('option') == '2') {
    opera.contexts.toolbar.addItem(rightButton);
  }
}

window.addEventListener('load', function() {

			  var leftProperties = {
			    disabled: false,
			    title: "Close tabs left of current",
			    icon: "icons/icon_left_18.png"
			  };

			  var rightProperties = {
			    disabled: false,
			    title: "Close tabs right of current",
			    icon: "icons/icon_right_18.png"
			  };

			  leftButton = opera.contexts.toolbar.createItem(leftProperties);
			  rightButton = opera.contexts.toolbar.createItem(rightProperties);

			  leftButton.onclick = function() {
			    closeTabsLeftOfCurrent(getFocusedWindow().tabs);
			  };
			  rightButton.onclick = function() {
			    closeTabsRightOfCurrent(getFocusedWindow().tabs);
			  };

			  setupConnection();

			  if (widget.preferences.getItem('option') == undefined)
			    widget.preferences.setItem('option', '2'); //default: right

			  if (widget.preferences.getItem('includeSelf') == undefined)
			    widget.preferences.setItem('includeSelf', 0); //default: no

			  resetButtons();

			}, false);

