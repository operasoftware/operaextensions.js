opera.isReady(function() {

/*
 * Copyright 2009-2012 Darko Pantić (pdarko@myopera.com)
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

// Fill controls in preferences section with preferences.
function fillPreferences() {
	var control = document.querySelectorAll("fieldset:not(.dont-listen) input[id], fieldset:not(.dont-listen) select[id]");
	Array.prototype.forEach.call(control, function (element) {
		var group = element.id.split('/');
		// Stored preferences are object.
		if (group[1]) {
			var prefItem = pref.getPref(group[0]);

			if (element.type == "text" || element.type == "number")
				element.value = prefItem[group[1]];
			else if (element.type == "color") {
				// Legacy colours (before version 1.8.1).
				if (prefItem[group[1]].substr(0, 1) == '#') {
					element.value = prefItem[group[1]];

					element.style.opacity = '1';
					element.nextElementSibling.value = '1';
					element.nextElementSibling.nextElementSibling.textContent = '1';
				}
				else {
					var alpha = prefItem[group[1]].match(/(\d(\.\d+)?)\)$/)[1];

					element.value = hsla2rgb(prefItem[group[1]]);
					element.style.opacity = alpha;
					element.nextElementSibling.value = alpha;
					element.nextElementSibling.nextElementSibling.textContent = alpha;
				}
			}
			else if (element.type == "checkbox")
				element.checked = prefItem[group[1]];
			else if (element.type == "select-one")
				Array.prototype.forEach.call(element, function (option) {
					if (option.value == prefItem[group[1]])
						option.selected = true;
				});
		}
		else {
			if (element.type == "text" || element.type == "number")
				element.value = pref.getPref(element.id);
			else if (element.type == "checkbox")
				element.checked = pref.getPref(element.id);
			else if (element.type == "select-one")
				Array.prototype.forEach.call(element, function (option) {
					if (option.value == pref.getPref(element.id))
						option.selected = true;
				});
		}
	});

	var customstyle = pref.getPref("customstyle");
	if (customstyle)
		document.getElementById("customstyle").value = customstyle;

	log.info("opt-prefs:",
		"Preferences page is filled with options."
	);
}

// Listener for "change" event on input and select elements.
function optionChanged(event) {
	if (this.type == "checkbox") {
		var group = this.id.split('/');
		if (group[1] && group[0] == "cleanwatch") {
			var cleanwatch = pref.getPref("cleanwatch"),
				node = this.parentNode.parentNode;

			var logid = this.id,
				logfrom = cleanwatch[group[1]],
				logto = this.checked;

			if (/sub\-group/.test(node.className)) {
				var id = node.parentNode.firstElementChild.id.split('/')[1];
				if (/^all/.test(id)) {
					var all = node.querySelectorAll("input");
					all = Array.prototype.every.call(all, function (el) { return el.checked; });

					if (all) {
						logid = id;
						logto = true;
						logfrom = cleanwatch[id];

						cleanwatch[id] = true;
					}
					else
						cleanwatch[group[1]] = this.checked;
				}
				else
					cleanwatch[group[1]] = this.checked;
			}
			else
				cleanwatch[group[1]] = this.checked;

			log.info("opt-prefs:",
				"An option is changed.",
				"ID: " + logid + '.',
				"From: " + logfrom + '.',
				"To: " + logto + '.'
			);

			pref.setPref("cleanwatch", cleanwatch);
		}
		else {
			log.info("opt-prefs:",
				"An option is changed.",
				"ID: " + this.id + '.',
				"From: " + pref.getPref(this.id) + '.',
				"To: " + this.checked + '.'
			);

			pref.setPref(this.id, this.checked);
		}
	}
	else if (this.type == "color" || this.type == "range") {
		var customcolor = pref.getPref("customcolor"),
			group = this.id.split(/\/|\-/);

		var logfrom = customcolor[group[1]]

		if (group[1] && group[0] == "customcolor")
			customcolor[group[1]] = rgb2hsla(this.value, this.nextElementSibling.value);
		else
			customcolor[group[1]] = rgb2hsla(this.previousElementSibling.value, this.value);

		log.info("opt-prefs:",
			"An option is changed.",
			"ID: customcolor/" + group[1] + '.',
			"From: " + logfrom + '.',
			"To: " + customcolor[group[1]] + '.'
		);

		pref.setPref("customcolor", customcolor);
	}
	else if (this.type == "text" || this.type == "select-one" || this.type == "number") {
		log.info("opt-prefs:",
			"An option is changed.",
			"ID: " + this.id + '.',
			"From: " + pref.getPref(this.id) + '.',
			"To: " + this.value + '.'
		);

		pref.setPref(this.id, this.value);
	}
}

// Convert colour from HSLA to RGB.
function hsla2rgb(c) {
	c = c.match(/(\d+(\.\d+)?)/g);
	var H = Number(c[0]),
		S = Number(c[1]) / 100,
		L = Number(c[2]) / 100;

	var q = L < 1/2 ? L * (1 + S) : L + S - L * S;
	var p = 2 * L - q;
	var h = H / 360;

	var r = new Array();
	r[0] = h + 1/3 < 0 ? h + 4/3 : (h + 1/3 > 1 ? h - 2/3 : h + 1/3);
	r[1] = h;
	r[2] = h - 1/3 < 0 ? h + 2/3 : (h - 1/3 > 1 ? h - 4/3 : h - 1/3);

	for (var i = 0; i < 3; i++) {
		if (r[i] < 1/6)
			r[i + 3] = p + 6 * r[i] * (q - p);
		else if (1/6 <= r[i] && r[i] < 1/2)
			r[i + 3] = q;
		else if (1/2 <= r[i] && r[i] < 2/3)
			r[i + 3] = p + 6 * (2/3 - r[i]) * (q - p);
		else
			r[i + 3] = p;
	}

	var R = Math.round(r[3] * 255).toString(16),
		G = Math.round(r[4] * 255).toString(16),
		B = Math.round(r[5] * 255).toString(16);

	if (R.length == 1)
		R = '0' + R;
	if (G.length == 1)
		G = '0' + G;
	if (B.length == 1)
		B = '0' + B;

	return '#' + R + G + B;
}

// Convert colour from RGB to HSLA.
function rgb2hsla(c, A) {
	A = Number(A);
	if ((!A && A != 0) || A < 0 || A > 1)
		A = 1;

	var H,
		R = Number("0x" + c.substr(1, 2)) / 255,
		G = Number("0x" + c.substr(3, 2)) / 255,
		B = Number("0x" + c.substr(5, 2)) / 255;

	var m = Math.max(R, G, B);
	var n = Math.min(R, G, B);

	if (m == n)
		H = 0;
	else if (m == R)
		H = (60 * (G - B) / (m - n) + 360) % 360;
	else if (m == G)
		H = 60 * (B - R) / (m - n) + 120;
	else if (m == B)
		H = 60 * (R - G) / (m - n) + 240;

	var L = (m + n) / 2;
	var S = m == n ? 0 : (L > 1/2 ? (m - n) / (2 - 2 * L) : (m - n) / L / 2);

	H = Math.round(H);
	S = (S * 100).round(3);
	L = (L * 100).round(3);

	return "hsla(" + H + ", " + S + "%, " + L + "%, " + A + ')';
}

// Reset preferences to default.
function resetPreferences(event) {
	var confirm = document.getElementById("clear-confirmed");
	if (!confirm.checked)
		window.alert("To confirm that you understand repercussions of this action please check check-box on the left side of this button.");
	else {
		loadDefaultPreferences();
		removeActions();
		fillActions();
		confirm.checked = false;
		toggleButton({ target: confirm });

		log.info("opt-prefs:",
			"Preferences are cleared."
		);
		window.alert("Preferences are cleared.\n\nOnly ads will be hidden now.");
	}
}

// Load recommended preferences.
function loadRecommended(event) {
	var confirm = document.getElementById("load-confirmed");
	if (!confirm.checked)
		window.alert("To confirm that you understand repercussions of this action please check check-box on the left side of this button.");
	else {
		loadRecommendedPreferences();
		removeActions();
		fillActions();
		confirm.checked = false;
		toggleButton({ target: confirm });

		log.info("opt-prefs:",
			"Recommended preferences loaded"
		);
		window.alert("Recommended preferences loaded");
	}
}

// Import previously exported preferences.
function importPreferences(event) {
	var imported = document.getElementById("import-preferences"),
		note = document.getElementById("import").previousElementSibling;

	// Remove comments.
	imported = imported.value.split(/\r?\n/).reduce(function (previous, current) {
		if (/^\/\//.test(current.trim()))
			return previous;
		else
			return previous + current;
	}, '');

	if (!imported) {
		note.textContent = "Preferences are empty.";
		return;
	}

	// Try to parse imported preferences.
	try {
		imported = window.JSON.parse(imported);
	}
	catch (error) {
		log.error("opt-prefs:",
			"An error occurred while trying to parse imported preferences.",
			"\nError: " + error.message + '.',
			"\nStack:\n" + error.stacktrace
		);

		if (pref.getPref("loglevel"))
			note.textContent = "An error occurred. Please check error console.";
		else
			note.textContent = "An error occurred. Please check preferences syntax.";
		return;
	}

	delete imported.firstrun;
	delete imported.version;
	delete imported.updatechecktime;

	var prefs = compareStructure(imported);
	// Don’t treat actions as not being part of preferences.
	prefs.excess = prefs.excess.filter(function (item) {
		return !/^actions\./.test(item);
	});
	// Delete wrong or preferences that are not part of extension.
	prefs.wrong.concat(prefs.excess).forEach(function (item) {
		var key = item.split('.')

		if (key[1])
			delete imported[key[0]][key[1]];
		else
			delete imported[key[0]];
	});

	for (var key in imported) {
		if (Object.isObject(imported[key]))
			pref.setPref(key, Object.union(pref.getPref(key), imported[key], true));
		else
			pref.setPref(key, imported[key]);
	}

	checkOldStructure();

	note.textContent = '';
	document.getElementById("import-check-box").checked = false;
	removeActions();
	fillActions();

	var messages = "Preferences imported.";
	if (prefs.excess.length)
		messages += "\nThis preferences are not part of ExtendTube.\n\t" + prefs.excess.slice(0).join(", ");
	if (prefs.wrong.length)
		messages += "\nThis preferences have wrong type or same ID! They are skipped.\n\t", prefs.wrong.join(", ");

	if (prefs.excess.length + prefs.wrong.length) {
		log.warn("opt-prefs:",
			messages
		);
		window.alert("Preferences imported with some warnings.\n\nSee Error Console (Ctrl+Shift+O).");
	}
	else {
		log.info("opt-prefs:",
			messages
		);
		window.alert("Preferences successfully imported.");
	}
}

// Enable or disable “reset preferences” and “load recommended” buttons.
function toggleButton(event) {
	var button = event.target.parentNode.querySelector("button");
	if (event.target.checked)
		button.disabled = false;
	else
		button.disabled = true;
}

});
