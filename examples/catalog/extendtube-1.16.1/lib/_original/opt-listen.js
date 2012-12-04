opera.isReady(function() {

/*
 * Copyright 2011-2012 Darko Pantić (pdarko@myopera.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Add event listeners to various elements of the page.
function addListeners() {
	var control = document.querySelectorAll("fieldset:not(.dont-listen) input[id], fieldset:not(.dont-listen) select[id]"),
		scutChange = document.querySelectorAll("#shortcut li > .right button:last-child"),
		scutClear = document.querySelectorAll("#shortcut li > .right button:first-child"),
		scutReset = document.getElementById("shortcut-reset"),
		scutAbort = document.querySelector(".capture button:first-of-type"),
		scutSave = document.querySelector(".capture button:last-of-type"),
		customStyleSave = document.getElementById("customstyle-save"),
		customStyle = document.getElementById("customstyle"),
		colorReset = document.getElementById("customcolor-reset"),
		expand = document.querySelectorAll(".collapsed > .link"),
		addAction = document.getElementById("new-action"),
		resetConfirm = document.querySelectorAll("fieldset.dont-listen > ul:not(#actions) input"),
		resetpref = document.getElementById("preferences-reset"),
		recpref = document.getElementById("preferences-recommended"),
		exppref = document.getElementById("preferences-export"),
		imppref = document.getElementById("import"),
		nav = document.querySelectorAll("nav a"),
		opcfg = document.querySelectorAll("a[href^=\"opera:\"]");

	// Monitor changes on input and select elements (not in “clean page” section).
	Array.prototype.forEach.call(control, function (element) {
		element.addEventListener("change", optionChanged, false);
	});

	// Change shortcut buttons.
	Array.prototype.forEach.call(scutChange, function (element) {
		element.addEventListener("click", changeShortcut, false);
	});

	// Clear shortcut buttons.
	Array.prototype.forEach.call(scutClear, function (element) {
		element.addEventListener("click", clearShortcut, false);
	});

	// Reset shortcuts.
	scutReset.addEventListener("click", function (event) {
		pref.setPref("shortcut", defaultPreferences.shortcut);
	}, false);

	// Abort and save captured shortcut.
	scutAbort.addEventListener("click", abortCapture, false);
	scutSave.addEventListener("click", saveCapture, false);

	// Save custom CSS.
	customStyleSave.addEventListener("click", function (event) {
		document.getElementById("customstyle").value = document.getElementById("customstyle").value.replace(/\r/g, '').replace(/\s*(\B-(moz|webkit|ms)-|\b(filter|zoom):)[^;\{\}\n]+/g, '').replace(/\s*[\w\-]+:(;|\n|\})/g, "$1").replace(/;{2,}/g, ';').replace(/\s*\n/g, "\n");
		pref.setPref("customstyle", document.getElementById("customstyle").value);
		this.previousElementSibling.addClass("saved");
		this.previousElementSibling.textContent = "Custom style saved.";
		document.getElementById("customstyle").removeClass("not-saved");
	}, false);
	// Custom CSS changed.
	customStyle.addEventListener("input", function () {
		this.addClass("not-saved");
		var note = document.getElementById("customstyle-save").previousElementSibling;
		note.removeClass("saved");
		note.textContent = "Custom style changed but not saved.";
	}, false);

	// Reset custom colours.
	colorReset.addEventListener("click", function (event) {
		pref.setPref("customcolor", defaultPreferences.customcolor);
	}, false);

	// Expand/collapse fieldset content.
	Array.prototype.forEach.call(expand, function (element) {
		element.addEventListener("click", expandItem, false);
	});

	// Add new action.
	addAction.addEventListener("click", addNewAction, false);

	// Enable/disable next button.
	Array.prototype.forEach.call(resetConfirm, function (element) {
		element.addEventListener("change", toggleButton, false);
		toggleButton({ target: element });
	});
	// Reset preferences.
	resetpref.addEventListener("click", resetPreferences, false);
	// Load recommended preferences.
	recpref.addEventListener("click", loadRecommended, false);
	// Export preferences.
	exppref.addEventListener("click", exportPreferences, false);
	// Import preferences.
	imppref.addEventListener("click", importPreferences, false);

	// Prevent flickering when choosing menu item.
	Array.prototype.forEach.call(nav, function (element) {
		element.addEventListener("click", handleMenuChange, false);
	});

	// Open opera: links in new tab.
	Array.prototype.forEach.call(opcfg, function (element) {
		element.addEventListener("click", function (event) {
			event.preventDefault();
			bgProcess.extension.tabs.create({
				url: this.href,
				focused: true
			});
		}, false);
	});

	log.info("opt-listen:",
		"Event listeners are added to preferences controls."
	);
}

});