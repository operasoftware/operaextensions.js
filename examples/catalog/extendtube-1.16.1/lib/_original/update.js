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
	if (/old/.test(window.location.hash))
		updated(window.location.hash.match(/old=(.+)/)[1]);
	else
		available();
}

function updated(oldVersion) {
	document.querySelector("#change-log").removeClass("hidden");
	document.querySelector("#change-log em").textContent = "from " + oldVersion + " to " + extVersion;

	var xhr = new XMLHttpRequest();
	xhr.open("get", "/Change.log", false);
	xhr.send();

	log.info("update:",
		"Change log loaded."
	);

	var changes = [],
		clog = xhr.responseText.split("\n"),
		elem = null;

	var elem = clog.shift();
	while (elem !== undefined) {
		var ver = elem.split(" - ");
		if (ver.length == 2 && ver[1] == oldVersion)
			break;
		else
			changes.push(elem);

		elem = clog.shift();
	}
	clog.unshift(elem);

	var strong = document.createElement("strong"),
		em = document.createElement("em"),
		pre = document.querySelector("pre");

	strong.textContent = changes.join("\n");
	em.textContent = clog.join("\n");

	pre.textContent = '';
	pre.appendChild(strong);
	pre.appendChild(document.createTextNode("\n"));
	pre.appendChild(em);
}

function available() {
	var version = bgProcess.availableUpdate.split('&'),
		available = [];

	version.forEach(function (ver) {
		available[ver.split('=')[0]] = ver.split('=')[1];
	});

	if (!available.approved && !available.unapproved)
		return window.close();

	document.querySelector("#update").removeClass("hidden");
	document.querySelector("#update strong").textContent = extVersion;

	if (available.approved) {
		document.querySelector("#approved").removeClass("hidden");
		document.querySelector("#approved strong").textContent = available.approved;
	}

	if (available.unapproved && available.unapproved != available.approved) {
		document.querySelector("#unapproved").removeClass("hidden");
		document.querySelector("#unapproved strong").textContent = available.unapproved;
	}
}

});