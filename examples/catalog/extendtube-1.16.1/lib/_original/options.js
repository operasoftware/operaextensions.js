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
window.addEventListener("hashchange", hashchanged, false);
extension.addEventListener("message", messageReceived, false);

// Executed on "load" event.
function pageLoaded(event) {
	fillPreferences();
	fillShortcuts();
	fillAbout();
	fillActions();
	addListeners();

	var helpnotice = document.querySelector("#help #version-notice span");
	if (extVersion == helpnotice.textContent)
		helpnotice.parentNode.addClass("hidden");

	if (window.location.hash)
		hashchanged({ newURL: window.location.href });
	else
		hashchanged({ newURL: window.location.href + "#preferences" });

	var xhr = new XMLHttpRequest();
	xhr.open("get", "/xtt.hack", false);
	xhr.send();

	var pre = document.createElement("pre"),
		link = document.querySelector("a[href=\"xtt.hack\"]");

	pre.textContent = xhr.responseText;
	link.parentNode.replaceChild(pre, link);
}

// Event listener for "message" event.
function messageReceived(event) {
	if (event.data.subject == "set preferences") {
		if (event.data.key == "shortcut")
			fillShortcuts();
		else if (event.data.key != "actions")
			fillPreferences();
	}
}

// URL hash changed.
function hashchanged(event) {
	// Hide previously visible sub-section.
	if (event.oldURL) {
		var hash = event.oldURL.split('#');
		if (hash[1]) {
			var path = hash[1].split('/');
			var element = document.querySelector('#' + path[0] + " ." + path[1]);
			if (element)
				element.parentNode.addClass("collapsed");
		}
	}

	var hash = event.newURL.split('#');
	// No new sub-section.
	if (!hash[1])
		return;

	var path = hash[1].split('/');
	// Show new section and hide others.
	showSection(path[0]);

	// Show new sub-section.
	var element = document.querySelector('#' + path[0] + " ." + path[1]);
	if (element)
		element.parentNode.removeClass("collapsed");

	// Update menu.
	var menu = document.querySelectorAll("nav ul:not(:first-child):not([class=\"" + path[0] + "\"])");
	// Hide old sub-menu.
	Array.prototype.forEach.call(menu, function (element) {
		element.addClass("collapsed");
	});
	// Show new sub-menu.
	document.querySelector("nav ul." + path[0]).removeClass("collapsed");

	// Update sub-menu.
	var sunmenu = document.querySelectorAll("nav a[href]");
	Array.prototype.forEach.call(sunmenu, function (element) {
		if (element.getAttribute("href").substr(1) == hash[1])
			element.addClass("menu-active-item");
		else
			element.removeClass("menu-active-item");
	});

	// Scroll sub-section to top of page.
	var target = document.querySelector(":target");
	if (target)
		scrollPage(target.offsetFromTop - document.documentElement.scrollTop - 62);
}

// Show and hide sections of page.
function showSection(section) {
	var sections = document.querySelectorAll("section");
	Array.prototype.forEach.call(sections, function (element) {
		if (element.id == section)
			element.style.display = "block";
		else
			element.style.display = "none";
	});
}

// Scroll page vertically by given pixels.
function scrollPage(pixels) {
	var i = 0,
		prev = 0;

	var interval = window.setInterval(function () {
		i += 0.2;
		if (i > 1) {
			window.clearInterval(interval);
			return;
		}

		var y = Math.round(pixels * cubicBezier(1, 1, i));
		window.scrollBy(0, y - prev);
		prev = y;
	}, 10);
}

// Cubic Bezier: B(t), t∈[0,1] P0=0 P3=1
function cubicBezier(p1, p2, t) {
	return 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
}

// Expand/collapse content (fieldset and/or div.link).
function expandItem(event) {
	var click = document.createEvent("MouseEvent");
	click.initMouseEvent("click", true, true, document.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

	if (/collapsed/.test(this.parentNode.className))
		var menu = document.querySelector("nav a[href=\"#" + this.id + "\"]");
	else
		var menu = document.querySelector("nav a[href=\"#" + this.id.split('/')[0] + "\"]");

	if (menu)
		menu.dispatchEvent(click);
}

// Prevent scrolling when choosing menu item second time.
function handleMenuChange(event) {
	if (this.pathname == "/options.html" && window.location.hash == this.hash)
		event.preventDefault();
}

// Fill about section of page with extension info.
function fillAbout() {
	var abtname = document.getElementById("about-name"),
		abtversion = document.getElementById("about-version"),
		abtauthor = document.getElementById("about-author"),
		abtemail = document.getElementById("about-email"),
		abtpage = document.getElementById("about-page"),
		abtplatform = document.getElementById("about-platform"),
		abtopera = document.getElementById("about-opera"),
		abtid = document.getElementById("about-id");

	if (widget.name)
		abtname.textContent = widget.name;
	if (extVersion) {
		abtversion.removeChild(abtversion.firstElementChild);
		abtversion.insertBefore(document.createTextNode(extVersion), abtversion.firstChild);
	}
	if (widget.author)
		abtauthor.textContent = widget.author;
	if (abtauthor = widget.authorEmail) {
		abtemail.removeChild(abtemail.firstElementChild);
		abtemail.insertAdjacentHTML("afterbegin", "<a href=\"mailto:" + abtauthor + "\">" + abtauthor + "</a>");
	}
	if (abtauthor = widget.authorHref) {
		abtpage.removeChild(abtpage.firstElementChild);
		abtpage.insertAdjacentHTML("afterbegin", "<a href=\"" + abtauthor + "\">" + abtauthor + "</a>");
	}
	abtplatform.textContent = window.navigator.platform;
	abtopera.textContent = opera.version() + " (build " + opera.buildNumber() + ')';
	abtid.textContent = window.location.hostname;

	log.info("options:",
		"About section is filled with information about extension."
	);
}

});