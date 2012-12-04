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

var // References to injected scripts.
	video = {},
	// Template for video entry in pop-up list.
	videoItem = '';

function pageLoaded(event) {
	var xhr = new XMLHttpRequest();
	xhr.open("get", "/share/tmpl/popup-video-item.tmpl", false);
	xhr.send();
	videoItem = xhr.responseText;

	log.info("pop-up:",
		"Template for pop-up video controls is loaded."
	);

	// Connect with injected scripts.
	for (var id in bgProcess.video) {
		var channel = new MessageChannel();
		channel.port1.addEventListener("message", messageFromInjectedScript, false);
		channel.port1.start();

		video[id] = channel.port1;
		try {
			bgProcess.video[id].source.postMessage({ subject: "connection to popup" }, [channel.port2]);

			log.info("pop-up:",
				"Handshake request sent to " + id + '.'
			);
		}
		catch (error) {
			log.warn("pop-up:",
				"Handshake request cannot be sent to " + id + '.',
				"Error: " + error.message + '.'
			);
		}
	}

	if (widget.preferences.getPref("enablecustomcolors")) {
		var style = document.createElement("style"),
			color = widget.preferences.getPref("customcolor");

		xhr.open("get", "/share/tmpl/popup-style.tmpl", false);
		xhr.send();

		log.info("pop-up:",
			"Template for pop-up style is loaded."
		);

		style.setAttribute("type", "text/css");
		style.textContent = xhr.responseText.
			replace(/@pbgColor/g, color.pagebackground).
			replace(/@pColor/g, color.pagecolor).
			replace(/@chColor/g, color.commenthover).
			replace(/@lColor/g, color.linkcolor);

		document.querySelector("head").appendChild(style);
	}
}

function messageFromInjectedScript(event) {
	if (event.data.subject == "status report")
		updateStatus(event.data.data);
	else if (event.data.subject == "video info") {
		log.info("pop-up:",
			"Handshake request accepted by " + event.data.data.id + '.'
		);

		addVideo(event.data.data);
	}
	else if (event.data.subject == "remove video")
		removeVideo(event.data.data.id);
}

function updateStatus(status) {
	var li = document.getElementById(status.id);

	var progress = li.querySelector("meter"),
		current = li.querySelector("span.current-time").firstChild,
		ctrl = li.querySelector("img.ctrl");

	if (status.progress !== null) {
		progress.value = status.progress / status.length;
		current.textContent = Math.round(status.progress).toTimeString();
		current.title = status.progress;
	}
	if (status.state == 1) {
		if (ctrl.getAttribute("src") != "../image/playing.png")
			ctrl.src = "../image/playing.png";
		progress.high = 1;
	}
	else if (status.state == 3) {
		if (ctrl.getAttribute("src") != "../image/buffering.png")
			ctrl.src = "../image/buffering.png";
		progress.high = 1e-3;
	}
	else {
		if (ctrl.getAttribute("src") != "../image/paused.png")
			ctrl.src = "../image/paused.png";
		progress.high = 1e-3;
	}
}

function addVideo(data) {
	var item = document.createElement("li");
	item.id = data.id;
	item.insertAdjacentHTML("afterbegin", videoItem);

	var progress = item.querySelector("meter");
	progress.dataset.length = data.length;
	progress.optimum = 1e-3;

	var current = item.querySelector("span.current-time");
	current.lastChild.nodeValue = " / " + Math.round(data.length).toTimeString(true);

	var ctrl = item.querySelector("img.ctrl");
	ctrl.src = "../image/paused.png";

	var title = item.querySelector("span.title");
	title.textContent = data.title;
	if (data.id.indexOf("&html5") > -1)
		title.insertAdjacentHTML("afterbegin", "<img src=\"../image/html5.png\" title=\"HTML5 video\">");
	if (data.id.indexOf("&embedded") > -1) {
		if (data.id.indexOf("&preview") > -1)
			title.insertAdjacentHTML("afterbegin", "<img src=\"../image/preview.png\" title=\"Embedded video preview\">");
		else
			title.insertAdjacentHTML("afterbegin", "<img src=\"../image/iframe.png\" title=\"IFrame embedded video\">");
		title.className += " link";
		title.title = "Click to open video in new tab.";
	}

	var close = item.querySelector("span.close");
	if (data.id.indexOf("&preview") > -1)
		close.title = "Click to remove thumbnail preview.";
	else if (data.id.indexOf("&embedded") > -1)
		close.title = "Click to remove embeded video.";

	document.querySelector("ul").appendChild(item);

	progress.addEventListener("mousemove", updateTooltip, false);
	progress.addEventListener("click", seekVideo, false);
	title.addEventListener("click", openVideo, false);
	ctrl.addEventListener("click", controlVideo, false);
	close.addEventListener("click", closeVideo, false);

	window.setInterval(function () {
		if (video[data.id])
			video[data.id].postMessage({ subject: "status report" });
	}, pref.getPref("popupupdateinterval"));

	log.info("pop-up:",
		"A new video is added to pop-up list.",
		"Video " + data.id + " can now be controlled from pop-up."
	);

	resizePopup();
}

function controlVideo(event) {
	video[this.parentNode.parentNode.id].postMessage({
		subject: "playback control",
		data: {
			exec: "play/pause"
		}
	});

	log.info("pop-up:",
		"'play/pause' request sent to video " + this.parentNode.parentNode.id + '.'
	);
}

function openVideo(event) {
	if (this.className.indexOf("link") < 0) {
		video[this.parentNode.id].postMessage({ subject: "focus self" });

		log.info("pop-up:",
			"“focus self” request sent to video " + this.parentNode.id + '.'
		);
	}
	else {
		video[this.parentNode.id].postMessage({
			subject: "playback control",
			data: {
				exec: "pause"
			}
		});

		bgProcess.extension.tabs.create({
			url: "http://www.youtube.com/watch?v=" +
				this.parentNode.id.replace(/@.+/, '') +
				"#t=" +
				this.parentNode.querySelector("meter").value,
			focused: true
		});

		log.info("pop-up:",
			"Embedded video (" + this.parentNode.id + ") is now opened as regular video."
		);
	}
}

function updateTooltip(event) {
	var hover = this.dataset.length * event.x / window.parseInt(window.getComputedStyle(this, null).width);
	this.nextElementSibling.textContent = hover.toTimeString(true);
	this.nextElementSibling.style.left = event.x + "px";
}

function seekVideo(event) {
	var position = this.dataset.length * event.x / window.parseInt(window.getComputedStyle(this, null).width);
	video[this.parentNode.parentNode.id].postMessage({
		subject: "playback control",
		data: {
			exec: "seek",
			position: position
		}
	});

	log.info("pop-up:",
		"“seek video” (to " + position + ") request sent to video " + this.parentNode.parentNode.id + '.'
	);
}

function closeVideo(event) {
	video[this.parentNode.id].postMessage({ subject: "close self" });
}

function removeVideo(id) {
	if (!id)
		return;

	delete video[id];

	var item = document.getElementById(id);
	item.parentNode.removeChild(item);

	log.info("pop-up:",
		"A video is removed from pop-up list.",
		"Video " + id + " can no longer be controlled from pop-up."
	);

	resizePopup();
}

function resizePopup() {
	var popupHeight = window.getComputedStyle(document.documentElement, null).height;
	bgProcess.toolbar.button.popup.height = window.parseInt(popupHeight);
}

});
