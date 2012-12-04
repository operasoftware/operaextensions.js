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

// Fill shortcuts section with current shortcuts.
function fillShortcuts() {
	var shortcut = pref.getPref("shortcut"),
		scatform = document.querySelectorAll("#shortcut span[id]");

	Array.prototype.forEach.call(scatform, function (element) {
		replaceShortcut(element, shortcut[element.id]);
	});

	log.info("opt-shortcut:",
		"Preferences are filled with shortcuts."
	);
}

// Update shortcuts in shortcut section of page.
function replaceShortcut(element, shortcut) {
	element.removeChildren();

	if (shortcut)
		element.insertAdjacentHTML("afterbegin", shortcut.split('+').map(makeKey).join('+'));
	else
		element.insertAdjacentHTML("afterbegin", "<em>(not set)</em>");
}

function makeKey(key) {
	return "<kbd>" + key + "</kbd>";
}

// Clear shortcut.
function clearShortcut(event) {
	var shortcut = pref.getPref("shortcut"),
		key = this.parentNode.previousElementSibling.id;

	shortcut[key] = '';
	pref.setPref("shortcut", shortcut);

	log.info("opt-shortcut:",
		"A shortcut for “" + key + "” is deleted."
	);
}

// Name of shortcut that will be changed.
var shortcutName = '';

// Display change shortcut dialogue.
function changeShortcut(event) {
	shortcutName = this.parentNode.parentNode.firstElementChild.textContent;
	document.querySelector(".capture p strong").textContent = shortcutName;
	document.querySelector(".capture").addClass("expanded");
	document.querySelector(".capture .note").addClass("hidden");
	document.getElementById("shortcut-capture").removeChildren();

	shortcutName = this.parentNode.previousElementSibling.id;
	document.addEventListener("keypress", catchKeyCombination, false);
}

// Save captured shortcut. Override if already in use.
function saveCapture(event) {
	document.removeEventListener("keypress", catchKeyCombination, false);
	hideCaptureDialog();

	var shortcut = pref.getPref("shortcut"),
		newShortcut = document.getElementById("shortcut-capture").textContent.trim();

	// Delete shortcut if user didn’t enter new one.
	if (newShortcut == '') {
		shortcut[shortcutName] = '';

		log.warn("opt-shortcut:",
			"Shortcut for “" + shortcutName + "” is deleted."
		);
	}
	else {
		// User entered same shortcut as it was before.
		if (shortcut[shortcutName] == newShortcut)
			return;

		var used = checkShortcut(newShortcut);
		// Override shortcut if already used.
		if (used) {
			shortcut[used] = '';

			log.warn("opt-shortcut:",
				"Shortcut “" + newShortcut + "” is already in use.",
				"Shortcut for “" + used + "” will be deleted."
			);
		}

		log.info("opt-shortcut:",
			"A shortcut for “" + shortcutName + "” is changed.",
			"From: " + shortcut[shortcutName] + '.',
			"To: " + newShortcut + '.'
		);

		shortcut[shortcutName] = newShortcut;
	}

	pref.setPref("shortcut", shortcut);
}

// Abort capturing keyboard shortcuts.
function abortCapture(event) {
	hideCaptureDialog();
	document.removeEventListener("keypress", catchKeyCombination, false);
}

// Hide change shortcut dialogue.
function hideCaptureDialog() {
	document.querySelector(".capture").removeClass("expanded");
}

// Catch key combination and update capture dialogue.
function catchKeyCombination(event) {
	event.preventDefault();

	var capture = document.getElementById("shortcut-capture"),
		keyCombination = [];

	if (event.altKey)
		keyCombination.push(makeKey("Alt"));
	if (event.ctrlKey)
		keyCombination.push(makeKey("Ctrl"));
	if (event.metaKey)
		keyCombination.push(makeKey("Meta"));
	if (event.shiftKey)
		keyCombination.push(makeKey("Shift"));

	keyCombination.push(makeKey(getKeyName(event)));
	keyCombination = keyCombination.join('+');

	if (keyCombination.replace(/<\/?kbd>/g, '') == "Esc") {
		abortCapture();
		return;
	}

	// Update capture dialogue.
	capture.removeChildren();
	capture.insertAdjacentHTML("afterbegin", keyCombination);

	// Check if shortcut is already in use.
	var taken = checkShortcut(capture.textContent);
	if (taken) {
		taken = document.querySelector("#shortcut #" + taken).previousElementSibling.textContent;
		document.querySelector(".capture .note strong").textContent = taken;
		document.querySelector(".capture .note").removeClass("hidden");
	}
	else
		document.querySelector(".capture .note").addClass("hidden");
}

// Check if shortcut is already in use.
function checkShortcut(newShortcut) {
	var shortcut = pref.getPref("shortcut");

	for (var id in shortcut)
		if (shortcut[id] == newShortcut && id != shortcutName)
			return id;

	return false;
}

// Get name of key.
// See /includes/_shortcut.js for details.
function getKeyName(event) {
	var keyStr = String.fromCharCode(event.keyCode),
		keyCode0 = {
			  '0': "Menu",
			 "27": "Esc",
			 "33": "PageUp",
			 "34": "PageDown",
			 "35": "End",
			 "36": "Home",
			 "37": "Left",
			 "38": "Up",
			 "39": "Right",
			 "40": "Down",
			 "45": "Insert",
			 "46": "Delete",
			"112": "F1",
			"113": "F2",
			"114": "F3",
			"115": "F4",
			"116": "F5",
			"117": "F6",
			"118": "F7",
			"119": "F8",
			"120": "F9",
			"121": "F10",
			"122": "F11",
			"123": "F12"
		},
		keyCode1 = {
			 '8': "Backspace",
			 '9': "Tab",
			"13": "Enter",
			"32": "Space"
		};

	if (event.which) {
		if (event.keyCode.toString() in keyCode1)
			keyStr = keyCode1[event.keyCode.toString()];
	}
	else {
		if (event.keyCode.toString() in keyCode0)
			keyStr = keyCode0[event.keyCode.toString()];
	}

	return keyStr;
}

});