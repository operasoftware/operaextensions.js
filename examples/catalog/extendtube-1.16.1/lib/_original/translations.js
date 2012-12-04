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

window.addEventListener("load", pageLoaded, false);

function pageLoaded(event) {
	var select = document.querySelector("select"),
		language = window.navigator.language;

	document.querySelector("#version").textContent = extVersion;

	select.addEventListener("change", showTranslation, false);
	document.querySelector("button").addEventListener("click", showAll, false);
	document.querySelector("button:only-child").addEventListener("click", selectTranslation, false);

	if (!(language in localisedStrings))
		language = language.replace('-', '_');
	if (!(language in localisedStrings))
		language = language.substr(0, 2);

	Array.prototype.some.call(document.querySelector("select"), function (option) {
		if (option.value == language) {
			option.selected = true;
			showTranslation();
			return true;
		}
		select.selectedIndex = -1;
	});
}

function string(object) {
	return window.JSON.stringify(object, null, 4).replace(/:/g, ": ").replace(/\x20{4}/g, "\t");
}

function showTranslation(event) {
	var select = document.querySelector("select"),
		pre = document.querySelector("section pre");

	if (select.value in localisedStrings) {
		pre.textContent = '"' + select.value + "\": " + string(localisedStrings[select.value]);
		pre.dir = select[select.selectedIndex].dir;
	}
	else {
		pre.textContent = "No translation for selected language.";
		pre.dir = "ltr";
	}
}

function showAll(event) {
	document.querySelector("section pre").textContent = string(localisedStrings).replace(/^\{|\}$/g, '').replace(/\t(?!\t)/g, '').trim();
	document.querySelector("section pre").dir = "ltr";
	document.querySelector("select").selectedIndex = -1;
}

function selectTranslation(event) {
	var selection = window.getSelection()
		range = document.createRange();

	range.selectNodeContents(document.querySelector("section pre"));
	selection.removeAllRanges();
	selection.addRange(range);
}

});