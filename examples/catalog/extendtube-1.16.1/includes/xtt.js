// ==UserScript==
// @include 		http://www.youtube.com/*
// @include 		https://www.youtube.com/*
// @include 		http://www.youtube-nocookie.com/*
// @include 		https://www.youtube-nocookie.com/*
// @exclude			http://www.youtube.com/my_*
// @exclude			https://www.youtube.com/my_*
// @exclude			http://www.youtube.com/inbox*
// @exclude			https://www.youtube.com/inbox*
// @exclude			http://www.youtube.com/account*
// @exclude			https://www.youtube.com/account*
// ==/UserScript==

opera.isReady(function() {
  
/*
 * Copyright 2010-2012 Darko Pantić (pdarko@myopera.com)
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

/**
 * @file
 * This file is part of ExtendTube. It will be injected on most YouTube pages.
 *
 * @copyright <a href="mailto:pdarko@myopera.com">Darko Pantić</a>, 2010-2012
 * @license Apache License, Version 2.0
 * @version 1.13
 */

(function (window, document, opera, extension, widget) {
// Redirect “/v/*” pages to “/watch_popup?v=*”.
if (/^\/v\//.test(window.location.pathname)) {
	window.location.replace(window.location.href.replace(/\?/, '&').replace(/\/v\//, "/watch_popup?v="));
	return;
}

document.addEventListener("DOMContentLoaded", domContentLoaded, false);

extension.addEventListener("disconnect", connectionLost, false);
extension.addEventListener("message", messageReceived, false);

opera.addEventListener("AfterEvent.load", removeIFrameAds, false);
opera.addEventListener("AfterScript", afterScript, false);
opera.addEventListener("BeforeExternalScript", beforeExternalScript, false);
opera.addEventListener("BeforeScript", beforeScript, false);
opera.addEventListener("pluginInitialized", pluginInitialized, false);

window.addEventListener("blur", windowBlurred, false);
window.addEventListener("focus", windowFocused, false);
window.addEventListener("load", loaded, false);
window.addEventListener("lyrics", showLyrics, false);
window.addEventListener("message", messageReceived, false);
window.addEventListener("resize", windowResized, false);
window.addEventListener("unload", unLoad, false);

self.onYouTubePlayerReady = function () {};
window.__defineGetter__("onYouTubePlayerReady", function () {
	return xtt.player.playerReady;
});
window.__defineSetter__("onYouTubePlayerReady", function (value) {
	onYouTubePlayerReady = value;
});

/**
 * Default preferences for ExtendTube. They are defined here in case we
 * need them before they are sent by background process. For information
 * about individual preferences see
 * <a href="/lib/preferences.js"> preferences.js</a>.
 *
 * @type Object
 */
var prefs;
self.__defineGetter__("preferences", function () {
	if (!prefs)
		prefs = getPreferences();
	return prefs;
});

/**
 * Represents ExtendTube object. ExtendTube object is property of
 * <code>window.opera</code> object.
 *
 * @namespace xtt
 */
self.__defineGetter__("xtt", function () {
	opera.xtt = makeApi();
	delete self.xtt;
	self.xtt = opera.xtt;
	return opera.xtt;
});

var debug;
self.__defineGetter__("log", function () {
	if (!debug)
		debug = makeLogApi();
	return debug;
});

self.yt = {};
self.config_ = {};
self.playerConfig = {};

self.yt.__defineGetter__("playerConfig", function() {
	return playerConfig;
});
self.yt.__defineSetter__("playerConfig", function(value) {
	playerConfig = xtt.video.extractData.call(xtt.video, value);
});

self.yt.__defineGetter__("config_", function() {
	return config_;
});
self.yt.__defineSetter__("config_", function(value) {
	config_ = value;
});
self.config_.__defineGetter__("PLAYER_CONFIG", function() {
	return yt.playerConfig;
});
self.config_.__defineSetter__("PLAYER_CONFIG", function(value) {
	yt.playerConfig = value;
});

if (window.yt) {
	for (var property in window.yt)
		yt[property] = window.yt[property];

	window.yt = yt;
}
else {
	window.__defineGetter__("yt", function () {
		return yt;
	});
	window.__defineSetter__("yt", function (value) {});
}

var /**
	 * On some pages artist can be found in video description. In that the case
	 * we will search only for song title.
	 *
	 * @type ?String
	 */
	artist = null,
	/**
	 * Reference to time-out used to toggle loop when primary mouse button is
	 * held over <em>loop</em> button for some period.
	 *
	 * @type Number
	 * @default NaN
	 */
	buttonHeldDown = NaN,
	/**
	 * This will tell how many times this script failed to issue command to
	 * flash player, when was first attempt, what command failed and reference
	 * to timeout that is used to try issuing command again.
	 *
	 * @type Object
	 */
	controlAttempt = {
		count: 0,
		start: 0,
		timeout: NaN,
		command: null
	},
	/**
	 * Says if Control button is held down.
	 *
	 * @type Boolean
	 * @default false
	 */
	ctrlDown = false,
	/**
	 * “Artist - title” combinations for which is search in progress.
	 *
	 * @type Object
	 */
	current = { artist: "Artist", title: "Title" },
	/**
	 * Tell us if document is modified by this extension.
	 *
	 * @type Boolean
	 * @default false
	 */
	docModified = false,
	/**
	 * This object will hold references to time-outs for <cite>mouseenter</cite>
	 * event.
	 *
	 * @type Object
	 */
	enter = {},
	/**
	 * Used when temporary changing page clean-up. Says what is current state of
	 * page clean-up.
	 *
	 * @type Number
	 * Can be:
	 * -1 = assume every option in preferences is disabled,
	 * 0 = read from preferences, or
	 * 1 = assume every option in preferences is enabled
	 *
	 * @default 0
	 */
	hidden = 0,
	/**
	 * Message about lyrics search progress. It will be displayed on page during
	 * search for lyrics.
	 *
	 * @type String
	 */
	info = '',
	/**
	 * Language to be used. It will be changed on runtime.
	 *
	 * @type String
	 * @default "en"
	 */
	language = "en",
	/**
	 * This object will hold references to time-outs for <cite>mouseleave</cite>
	 * evens used when thumbnail preview is activated and is set to be triggered
	 * by mouse hovering video thumbnail.
	 *
	 * @type Object
	 */
	leave = {},
	/**
	 * List of possible “artist - title” combinations.
	 *
	 * @type Array
	 */
	list = [],
	/**
	 * Will hold lyrics data if lyrics can be found.
	 *
	 * @type ?String
	 */
	lyrics = null,
	/**
	 * Reference to time-out that is used to execute an action after multiple
	 * changes have occurred.
	 *
	 * @type Number
	 * @default NaN
	 */
	nodeInserted = NaN,
	/**
	 * Page ID used when sending message log to background process.
	 *
	 * @type ?String
	 */
	pid = null,
	/**
	 * Reference to interval that is used to ping background process.
	 *
	 * @type Number
	 * @default NaN
	 */
	pingint = NaN,
	/**
	 * Will be used to remember current playback progress when flash player need
	 * to be reloaded.
	 *
	 * @type Number
	 * @default NaN
	 */
	playbackProgress = NaN,
	/**
	 * Reference to extension’s pop-up window.
	 *
	 * @type ?MessagePort
	 * @default null
	 */
	popup = null,
	/**
	 * Should default action for click on button be cancelled.
	 *
	 * @type Boolean
	 * @default false
	 */
	preventClick = false,
	/**
	 * This variable will remember state of video playback when thumbnail
	 * preview is activated.
	 *
	 * @type Number
	 * @default NaN
	 */
	previousPlaybackState = NaN,
	/**
	 * Will be used to remember previous playback progress when we are
	 * simulating player state change event on channels.
	 *
	 * @type Number
	 * @default 0
	 */
	previousProgress = 0,
	/**
	 * Page title used when sending message log to background process.
	 *
	 * @type ?String
	 */
	ptitle = null,
	/**
	 * References to elements added by this extension (saved for later use).
	 *
	 * @type Object
	 */
	references = {
		// References to buttons, button containers and other elements added
		// to page by this script.
		downloadButton: null,
		downloadMenu: null,
		extraContainer: null,
		frameStepButton: null,
		loopButton: null,
		loopContainer: null,
		loopEndButton: null,
		loopStartButton: null,
		lyricsBody: null,
		lyricsContainer: null,
		lyricsFooter: null,
		lyricsHeader: null,
		lyricsManualForm: null,
		lyricsSearchLog: null,
		popoutButton: null,
		preferencesButton: null,
		seekBackButton: null,
		seekForwardButton: null
	},
	/**
	 * Reference to element from which elements should be removed to make room
	 * for buttons added by extension.
	 *
	 * @type ?HTMLElement
	 * @default null
	 */
	room = null,
	/**
	 * Elements moved from <cite>room</cite>.
	 *
	 * @type Array
	 */
	roomElements = [],
	/**
	 * Current status during lyrics search. Value can be:
	 * '' - lyrics search is not started
	 * "continue" - lyrics are not found but search is not competed yet
	 * "error" - lyrics are found but cannot be parsed
	 * "found" - lyrics are found but need to be parsed
	 * "invalid" - invalid artist and title
	 * "loaded" - lyrics are found and successfully parsed
	 * "lyrics" - parsing lyrics data
	 * "notfound" - lyrics search completed without results
	 * "parsing" - parsing search results
	 * "search" - lyrics search in progress
	 *
	 * @type String
	 */
	status = '',
	/**
	 * Reference to interval used to send status to parent window used to update
	 * thumbnail preview time.
	 *
	 * @type Number
	 * @default NaN
	 */
	statusInterval = NaN,
	/**
	 * This object will hold references to time-outs for focus  and blur events.
	 * Focus and blur event need to be processed  using time-outs because they
	 * are fired multiple times in quick succession.
	 *
	 * @type Object
	 */
	winevent = {
		blur: NaN,
		focus: NaN
	};

if (!Number.prototype.toPaddedString) {
	/**
	 * Convert number to string of fixed length. Pad it with defined character.
	 *
	 * @param {Number} length
	 * Targeted length.
	 *
	 * @param {String} [padchar = '0']
	 * Character to pad with.
	 *
	 * @returns {String}
	 * Number as string of <cite>length</cite> length,
	 * padded with <cite>padchar</cite>.
	 *
	 * @function
	 * @name toPaddedString
	 * @memberof Number
	 */
	Number.prototype.toPaddedString = function (length, padchar) {
		if (!padchar)
			padchar = '0';

		var number = this.toString();
		if (number.length < length) {
			var pad = length - number.length;
			while (pad-- > 0)
				number = padchar + number;
		}

		return number;
	};
}

if (!Number.prototype.toTimeString) {
	/**
	 * Treat number as number of seconds and convert it to time string.
	 *
	 * @param {Boolean} [showmin = false]
	 * Show minute even if it’s zero.
	 *
	 * @param {Boolean} [showhour = false]
	 * how hour even if it’s zero.
	 *
	 * @returns {String}
	 * Time formatted as string (h:mm:ss).
	 *
	 * @function
	 * @name toTimeString
	 * @memberof Number
	 */
	Number.prototype.toTimeString = function (showmin, showhour) {
		var time = Math.floor(this % 60).toString(),
			minute = Math.floor((this / 60) % 60),
			hour = Math.floor(this / 3600);

		if (minute || showmin || hour || showhour) {
			if (time.length < 2)
				time = '0' + time;
			time = minute.toString() + ':' + time;
			if (hour || showhour) {
				if (minute < 10)
					time = hour.toString() + ":0" + time;
				else
					time = hour.toString() + ':' + time;
			}
		}

		return time;
	};
}

if (!window.Element.prototype.offsetFromTop) {
	/**
	 * Top offset for <code>this</code> element.
	 *
	 * @returns {Number}
	 * Top offset of current element compared to document root.
	 *
	 * @name offsetFromTop
	 * @memberof Element
	 * @readonly
	 */
	window.Element.prototype.__defineGetter__("offsetFromTop", function () {
		var top = 0,
			node = this;

		do
			top += node.offsetTop;
		while (node = node.offsetParent);

		return top;
	});
}

/**
 * @namespace Node
 */
if (!window.Node.prototype.removeChildren) {
	/**
	 * Remove all child nodes from <code>this</code> node.
	 *
	 * @returns {DocumentFragment}
	 * Fragment containing all removed nodes.
	 *
	 * @function
	 * @name removeChildren
	 * @memberof Node
	 */
	window.Node.prototype.removeChildren = function () {
		var fragment = document.createDocumentFragment();

		while (this.firstChild)
			fragment.appendChild(this.firstChild);

		return fragment;
	};
}

log.info("Sending greetings to background process.");
sendMessage("hello");

addStyle();
if (preferences.enableshortcutkeys)
	xtt.shortcut.enable();

// Trigger “immediately” actions.
runActions("immediately");

function addExperimentalUIWarning() {
	var alert = document.querySelector("#alerts"),
		alertUI = "\
<div class=\"yt-alert yt-alert-default yt-alert-error ext-ui-alert\" id=\"confirmBox\">\
	<div class=\"yt-alert-icon\">\
		<img src=\"//s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif\" class=\"icon master-sprite\" alt=\"Alert icon\"/>\
	</div>\
	<div class=\"yt-alert-buttons\">\
		<button type=\"button\" class=\"close yt-uix-close yt-uix-button yt-uix-button-close\" onclick=\"return false\" data-close-parent-class=\"yt-alert\" role=\"button\">\
			<span class=\"yt-uix-button-content\">Close </span>\
		</button>\
	</div>\
	<div class=\"yt-alert-content\" role=\"alert\">\
		<span class=\"yt-alert-vertical-trick\"/>\
		<div class=\"yt-alert-message\">This page uses experimental UI. Some parts of ExtendTube may be broken. In fact, it may not work at all.</div>\
	</div>\
</div>";

	if (alert) {
		alert.insertAdjacentHTML("afterbegin", alertUI);
		setTimeout(function () {
			removeElement(document.querySelector("#alerts > .ext-ui-alert"));
		}, 1e4);
	}

	log.Warn("Page is using experimental UI. Some features may be broken.");
}

/**
 * If search for lyrics fails this function will add button for inserting
 * artist and title manually.
 */
function addManualSearch() {
	if (!references.lyricsSearchLog)
		return;

	var manual = document.querySelector(".ext-try-manual");
	if (!manual) {
		manual = createButton({ "class": "yt-uix-button yt-uix-button-default ext-try-manual" });
		manual.textContent = xtt.ll.getString("LYRICS_BUTTON_TRY");
		manual.addEventListener("click", manualSearch, false);
	}
	references.lyricsSearchLog.appendChild(manual);
	references.lyricsSearchLog.querySelector("div.box-close-link").classList.add("ext-hidden");

	log.info("Form for manual lyrics search inserted into page.");
}

/**
 * Add button to video thumbnail that can be used for video preview.
 *
 * @param {HTMLAnchorElement} element
 * Element containing video thumbnail.
 */
function addPreviewButton(element) {
	if (element.querySelector("button.ext-thumb-preview"))
		return;

	var addto = element.querySelector(".addto-button, .addto-container"),
		button = createButton({
			"class": getButtonClass() + " addto-button video-actions ext-thumb-preview",
			"data-tooltip-text": xtt.ll.getString("PREVIEW_START")
		});

	button.addEventListener("click", function (event) {
		event.preventDefault();

		if (this.classList.contains("ext-pause"))
			stopPreview(element);
		else
			startPreview(element);
	}, false);

	if (addto.nodeName.toLowerCase() != "button")
		addto.insertAdjacentElement("beforeend", button);
	else {
		addto.insertAdjacentElement("afterend", button);
		button.style.right = window.getComputedStyle(addto).width;
	}
}

/**
 * Add rating meter below video thumbnail.
 *
 * @param {HTMLElement} thumb
 * Element which holds video thumbnail.
 *
 * @param {Object} rating
 * Video rating.
 */
function addRatingMeter(thumb, rating) {
	if (!thumb || !thumb.parentNode || thumb.parentNode.querySelector(".ext-video-rating"))
		return;

	var meter = document.createElement("span"),
		score = parseInt(rating.numLikes) / parseInt(rating.numRaters) * 100,
		style = '',
		tooltip = xtt.ll.getString("RATING_NO_DATA");

	if (score || score == 0) {
		tooltip = xtt.ll.getString("RATING_LIKE").replace("%pcent", score.toString().substr(0, 4)) + " (" + rating.numLikes + " / " + rating.numDislikes + ')';

		style = "\
background-image: -o-linear-gradient(left, hsl(120, 100%, 40%), hsl(120, 60%, 40%) " + (score / 3) + "%, hsl(120, 50%, 30%) " + score + "%, transparent 0%), -o-linear-gradient(left, hsl(0, 100%, 30%), hsl(10, 100%, 50%) 66.66%, hsl(20, 100%, 80%));\
background-image: linear-gradient(to right, hsl(120, 100%, 40%), hsl(120, 60%, 40%) " + (score / 3) + "%, hsl(120, 50%, 30%) " + score + "%, transparent 0%), linear-gradient(to right, hsl(0, 100%, 30%), hsl(10, 100%, 50%) 66.66%, hsl(20, 100%, 80%));";
	}

	meter.setAttribute("class", "ext-video-rating yt-uix-tooltip");
	meter.setAttribute("style", style);
	meter.setAttribute("data-tooltip-text", tooltip);

	thumb.parentNode.appendChild(meter);
}

/**
 * Add general style to the document.
 */
function addStyle() {
	if (!document.querySelector("head"))
		return setTimeout(addStyle, 50);

	var css = document.createElement("style");
	css.setAttribute("type", "text/css");
	css.setAttribute("id", "ext-style-general");
	css.appendChild(document.createTextNode(getStyle("general")));
	document.querySelector("head").appendChild(css);

	log.info("General style added to document.");

	if (xtt.video.isEmbedded)
		return;

	// Customize page.
	xtt.ui.apply.cleanPage();
	if (preferences.enablecustomcolors)
		xtt.ui.apply.customColors();
	if (preferences.customlogo)
		xtt.ui.apply.customLogo();
	if (preferences.enablecustomstyle)
		xtt.ui.apply.customStyle();
	if (preferences.fullscreenstyle)
		xtt.ui.apply.fullScreenStyle();
}

/**
 * Event listener for <cite>AfterScript</cite> event.
 * Prevent next video advance in playlist.
 *
 * @param {UserJSEvent} event
 * Event object.
 */
function afterScript(event) {
	var src = event.element.getAttribute("src");
	if (src && (src.indexOf("www-core") > 0 ||  src.indexOf("www-watch7-extra") > 0)) {
		var handleNearPlaybackEnd = yt.www.lists.handleNearPlaybackEnd;
		yt.www.lists.handleNearPlaybackEnd = function () {
			if (!xtt.player.isLoopForced())
				handleNearPlaybackEnd.apply(null, arguments);
			else if(arguments[0] == "NEAR_END1")
				xtt.player.control("seek", 0);
		};

		if (src.indexOf("www-watch7-extra") > 0)
			xtt.player.writePlayer();
	}
}

/**
 * Event listener for <cite>f</cite> event.
 * Intercept external scripts to remove ads.
 *
 * @param {UserJSEvent} event
 * Event object.
 */
function beforeExternalScript(event) {
	var src = event.element.getAttribute("src");
	if (/googlesyndication|doubleclick|googleadservices|\/uds\/api\/ads\/|\/jsapi\?autoload[=\w\[\{:"]+"name":"ads"/.test(decodeURIComponent(src))) {
		if (preferences.hidepageads) {
			event.preventDefault();

			log.warn("Linked script blocked.",
				"URI: " + src + '.'
			);
		}
		else {
			log.info("Linked script is not blocked. Ads may be visible.",
				"URI: " + src + '.'
			);
		}
	}
}

/**
 * Event listener for <cite>BeforeScript</cite> event.
 * Intercept external scripts to extract video information. It will also modify
 * scripts to catch events like <cite>player ready</cite> or
 * <cite>player state change</cite>.
 *
 * @param {UserJSEvent} event
 * Event object.
 */
function beforeScript(event) {
	var src = event.element.getAttribute("src");
	if (/opera\.xtt/.test(src))
		return;

	if (!src) {
		if (/x\-shockwave\-flash/.test(event.element.text))
			return event.preventDefault();

		// Write player to normal pages.
		event.element.text = event.element.text.replace("forceUpdate,", "opera.xtt.player.writePlayer(),");
		// Write player to embedded pages.
		event.element.text = event.element.text.replace("yt.embed.writeEmbed()", "opera.xtt.player.writePlayer()");

		return;
	}

	if (/www\-channel/.test(src)) {
		xtt.video.isChannel = true;
	}
	// Iframe embedded videos.
	else if (/www\-embed/.test(src)) {
		// Prevent “restricted embedding” message.
		if (xtt.video.isPreview)
			event.element.text = event.element.text.replace(/\.el="embedded"/, ".el=\"popout\"");
	}
	else {
		log.info("No rules for modifying this script.",
			"URI: " + src + '.'
		);
	}

	// See if linked script is modified or not.
	if (/opera\.xtt/.test(event.element.text)) {
		log.warn("Linked script modified.",
			"Script URI: " + src + '.'
		);
	}
	else {
		log.info("Linked script not modified.",
			"URI: " + src + '.'
		);
	}
}

function bind(Func, This) {
	var args = Array.prototype.slice.call(arguments, 2);
	return function () {
		Func.apply(This, args.concat(Array.prototype.slice.call(arguments)));
	}
}
/**
 * Clean junk (strings like: feat, ft, hq...) from artist/title string.
 *
 * @param {String} el
 * String to be cleaned.
 */
function clean (el) {
	el = el.replace(/\b(ft|feat|featuring|w|hq)\b(\.|\/)?.{0,}/gi, '');
	el = el.replace(/"/g, '');

	return el.trim();
}

/**
 * Collapse loop button’s container so mark section start/end button are hidden.
 * This id done automatically by {@link xtt.player.loopSection.disable} when
 * section loop is disabled.
 */
function collapseLoopButton() {
	if (!references.loopContainer)
		return;
	references.loopContainer.classList.add("ext-collapsed");

	updateLoopButton();
}

/**
 * Hide lyrics.
 */
function collapseLyricsContainer() {
	references.lyricsBody.classList.add("ext-hidden");
	references.lyricsFooter.querySelector("button").textContent = xtt.ll.getString("LYRICS_BUTTON_SHOW");

	// Scroll page for video to be visible.
	if (preferences.scrollonlyricsdisplay) {
		var headline = document.querySelector("#watch-headline, #playnav-channel-header, #watch-stage");
		if (headline && document.documentElement.scrollTop > headline.offsetFromTop)
			scrollPage(headline.offsetFromTop - document.documentElement.scrollTop);
	}
}

/**
 * Event listener for <cite>disconnect</cite> event.
 * Called when connection with background process is lost to clean everything
 * that was added to page by extension. This should normally happen only when
 * extension is disabled, reloaded or uninstalled.
 *
 * @param {MessageEvent} event
 * Event object.
 */
function connectionLost(event) {
	log.error("Connection with background process is broken. All changes will be reverted.");

	removeListeners();

	preferences.forceloop = false;
	preferences.videoquality = "default";
	xtt.player.loopSection.disable();
	xtt.shortcut.disable();

	xtt.player.enableWide(xtt.getCookie("wide") == '1');

	xtt.ui.remove.all();
}

/**
 * Try to issue command to video player.
 *
 * @param {String} commands
 * Command to execute.
 *
 * @param {Any} data
 * Data to pass to player.
 */
function controlPlayer(command, data) {
	if (!xtt.player.playerElement) {
		log.warn("Player elemenet not available.");
		return;
	}

	if (!controlAttempt.start)
		controlAttempt.start = Date.now();

	try {
		if (data !== undefined) {
			xtt.player.playerElement[command](data);

			log.info("“" + command + "” command issued to player. Passed parameter:", data);
		}
		else {
			xtt.player.playerElement[command]();

			log.info("“" + command + "” command issued to player.");
		}

		// Cancel any previous unsuccessful command.
		if (controlAttempt.timeout) {
			clearTimeout(controlAttempt.timeout);

			log.info("Previous unsuccessful command cancelled. Command was:", controlAttempt.command);

			controlAttempt.count = 0;
			controlAttempt.start = 0;
			controlAttempt.timeout = NaN;
			controlAttempt.command = null;
		}
	}
	catch (error) {
		if (controlAttempt.count < 10) {
			log.warn("“" + command + "” player command failed. Try:", controlAttempt.count + 1);

			controlAttempt.command = command;
			controlAttempt.timeout = setTimeout(function controlPlayerTimeOut() {
				log.info("Attempting to control player again. Tries:", controlAttempt.count + 1);

				controlPlayer(command, data);
			}, 200);

			controlAttempt.count++;
		}
		else {
			log.error(
				"An attempt to issue “" + command + "” command to player failed",
				controlAttempt.count,
				"times in the past " + ((Date.now() - controlAttempt.start) / 1000) + " seconds.",
				"\nLast error is: " + error.message + '.',
				"\nStack:\n" + error.stacktrace
			);

			controlAttempt.count = 0;
			controlAttempt.start = 0;
			controlAttempt.command = null;
		}
	}
}

/**
 * Create button element with given attributes.
 *
 * @param {Object} attribute
 * List of attributes to be added to created button.
 */
function createButton(attribute) {
	var button = document.createElement("button");
	button.appendChild(document.createElement("img"));

	for (var property in attribute)
		button.setAttribute(property, attribute[property]);

	return button;
}

/**
 * Calculate cubic Bézier curve B(t) where first control point is 0, third is 1
 * and t∈[0, 1].
 *
 * @param {Number} p1
 * Second control point.
 *
 * @param {Number} p2
 * Third control point.
 */
function cubicBezier(p1, p2, t) {
	return 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t;
}

/**
 * Convert url encoded <cite>fmt_stream_map</cite> to <cite>fmt_url_map</cite>.
 *
 * @param {String} list
 * Url encoded list of video formats.
 *
 * @returns {Array}
 * List converted to array.
 */
function decodeStreamMap(map) {
	map = map.split(',').map(function (url) {
		var itag = url.match(/itag=(\d+)/),
			fallback = url.match(/fallback_host=([^&]+)/),
			sig = url.match(/sig=([^&]+)/),
			item = {};

		if (itag && itag[1])
			item.itag = itag[1];
		else
			item.itag = 0;

		url = url.match(/url=([^&]+)/);
		if (url && url[1])
			item.url = url[1];
		else
			return;

		if (!/signature%3D/.test(url)) {
			log.warn("Signature not found in URI.");

			if (sig && sig[1]) {
				item.url += "%26signature%3D" + sig[1];

				log.info("Signature found in stream map and appended to URI.");
			}
			else
				log.warn("Signature not found in stream map. Download will probably not work.");
		}

		if (fallback && fallback[1])
			item.fallback = item.url.replace(/(http%3A%2F%2F)[^%]+/, "$1" + fallback[1]);

		return item;
	});

	return map;
}

/**
 * Remove thumbnail preview for given video id.
 *
 * @param {String} id
 * ID of video for which thumbnail preview should be removed.
 */
function disableThumbPreview(id) {
	var preview = document.querySelector("a[href*=\"" + id + "\"].ext-preview-enabled");
	if (!preview)
		return;

	updateThumbPreviewButton(id, 0);

	var preview = preview.querySelector("iframe");
	if (preview) {
		preview.parentNode.classList.remove("ext-preview-container");
		removeElement(preview);
	}

	if (previousPlaybackState == 1) {
		xtt.player.control("play");
		previousPlaybackState = NaN;
	}

	log.info("Thumbnail preview is disabled for video " + id + '.');
}

/**
 * Event listener for <cite>DOMContentLoaded</cite> event.
 *
 * @param {Event} event
 * Event object.
 */
function domContentLoaded(event) {
	if (0 < document.body.className.indexOf("watch7"))
		addExperimentalUIWarning();

	removeIFrameAds(event);
	loaded(event);

	if (preferences.overridehistory)
		opera.setOverrideHistoryNavigationMode("compatible");

	if (xtt.video.isEmbedded) {
		if (xtt.video.isPreview)
			document.body.classList.add("ext-preview");

		return;
	}

	// Set language
	var lang = document.body.getAttribute("class"),
		skip = false;
	if (lang && lang.match(/[a-z]{2,3}_[A-Z]{2}/)) {
		xtt.ll.setLanguage(lang.match(/[a-z]{2,3}_[A-Z]{2}/)[0]);
		skip = true;
	}

	// Add thumbnail preview.
	if (preferences.thumbpreview)
		xtt.ui.add.thumbPreview();

	// Add video ratings.
	if (preferences.ratevideos)
		xtt.ui.add.videoRatings();

	if (!xtt.video.isChannel && !xtt.video.isWatch)
		return;

	modifyDocument(skip);

	// Add classes for hiding comments
	var comments = document.querySelectorAll("#comments-view .comments-section > h4:first-child, #comments-view .comments-section a.comments-section-see-all, #comments-view .comments-section a[href*=\"/watch?\"]");
	Array.prototype.forEach.call(comments, function (element) {
		if (element.nodeName.toLowerCase() == "h4") {
			if (element.querySelector("a[href*=\"user\"]"))
				element.parentNode.classList.add("ext-uploader-comments");
			else if (!element.querySelector("a"))
				element.parentNode.classList.add("ext-top-comments");
		}
		else if (element.nodeName.toLowerCase() == "a") {
			if (/video_response_view_all|\/watch\?/.test(element.href) && element.parentNode.parentNode.classList.contains("comments-section"))
				element.parentNode.parentNode.classList.add("ext-video-responses");
			else if (/all_comments/.test(element.href)) {
				var parent = element.parentNode;
				do {
					if (parent.classList.contains("comments-section")) {
						parent.classList.add("ext-all-comments");

						parent = parent.nextElementSibling;
						if (parent && parent.firstElementChild && parent.firstElementChild.classList.contains("comments-pagination"))
							parent.classList.add("ext-all-comments");

						parent = null;
					}
					else
						parent = parent.parentNode;
				} while (parent);
			}
		}
	});
}

/**
 * Event listener for <cite>click</cite> event on download menu item.
 * Download video in chosen format.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function downloadVideo(event) {
	// Add title to download link. This will be used as name of video file sent by YouTube.
	if (this.href.indexOf("&title=") < 0)
		this.href += "&title=" + encodeURIComponent(toFileName(xtt.video.getVideoTitle()));

	log.info("Video download started.",
		"Download type: " + this.textContent + '.',
		"Download URI: " + this.href + '.'
	);

	removeTooltip();
}

/**
 * Event listener for <cite>mouseenter</cite> event on video thumbnail element.
 * This event will start video preview.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function enterPreview(event) {
	clearTimeout(leave[this.getAttribute("href")]);

	var delay = preferences.thumbhoverdelay;
	if (event.target.querySelector("iframe"))
		delay = 500;

	enter[this.getAttribute("href")] = setTimeout(function () {
		startPreview(event.target);
	}, delay);
}

/**
 * Expand loop button’s container so mark section start/end button are visible.
 * This id done automatically by {@link xtt.player.loopSection.enable} when
 * section loop is enabled.
 */
function expandLoopButton() {
	if (!references.loopContainer)
		return;
	references.loopContainer.classList.remove("ext-collapsed");

	updateSectionButtons();
	updateLoopButton();
}

/**
 * Show lyrics.
 */
function expandLyricsContainer() {
	references.lyricsContainer.classList.remove("ext-hidden");
	references.lyricsBody.classList.remove("ext-hidden");
	references.lyricsManualForm.classList.add("ext-hidden");
	references.lyricsFooter.querySelector("button").textContent = xtt.ll.getString("LYRICS_BUTTON_HIDE");

	xtt.lyrics.load();

	// Scroll page for lyrics to be visible.
	if (preferences.scrollonlyricsdisplay) {
		var lyricstop = references.lyricsContainer.offsetFromTop,
			scrolltop = document.documentElement.scrollTop;

		if (lyricstop - scrolltop > window.innerHeight / 2 || lyricstop < scrolltop)
			scrollPage(lyricstop - scrolltop - window.innerHeight / 4);
	}
}

/**
 * Make all possible <cite>{artist} - {title}</cite> pairs from given array.
 *
 * @param {Array} song
 * Array containing possible values for artist and title.
 */
function extractSong(song) {
	// Reset list.
	list = [];

	// Artist not found in description.
	if (!artist) {
		if (song.length == 2) {
			// Found “{artist} - {title}” pattern.
			list.push({ artist: clean(song[0]), title: clean(song[1]) });
			list.push({ artist: clean(song[1]), title: clean(song[0]) });

			return true;
		}
		else if (song.length == 1) {
			// Search for “{artist} "{title}"” pattern.
			var tmp = song[0].match(/"([^"]+)/);
			if (tmp && tmp[1]) {
				// Found “{artist} "{title}"” pattern.
				list.push({ artist: clean(song[0].split(tmp[1])[0]), title: clean(tmp[1]) });
				list.push({ artist: clean(tmp[1]), title: clean(song[0].split(tmp[1])[0]) });

				return true;
			}
		}
		else if (song.length > 2) {
			// Probably some combination like “{artist} - {album} - {title}”.
			// Try all possible combinations.
			for (var k = 0; k < song.length; k++)
				for (var l = 0; l < song.length; l++)
					if (k != l)
						list.push({ artist: clean(song[k]), title: clean(song[l]) });

			return true;
		}
	}
	// Artist found in description.
	else {
		if (song.length == 1) {
			// This is probably song title.
			list.push({ artist: artist, title: clean(song[0]) });

			return true;
		}
		else if (song.length == 2) {
			// This may be “{artist} - {album} - {title}” pattern
			// but artist is removed from list ’cause real artist is found.
			list.push({ artist: artist, title: clean(song[1]) });
			list.push({ artist: artist, title: clean(song[0]) });

			return true;
		}
		else if (song.length > 2) {
			// This is some weird combination.
			// (like “{song number} - {artist} - {album} - {title}”).
			song.forEach(function (title) {
				list.push({ artist: artist, title: clean(title) });
			});

			return true;
		}
	}

	// “{artist} - {title}” pattern not found. :(
	return false;
}

/**
 * Extract rating information about videos from server response.
 *
 * @param {String} responses
 * Response from server.
 *
 * @returns {Object}
 * Part of response converted to JSON.
 */
function extractVideoInfo(response) {
	var parser = new window.DOMParser();
	var xml = parser.parseFromString(response, "text/xml");

	if (xml.documentElement.nodeName != "feed") {
		log.warn("Response is not feed.");
		return;
	}

	var error = [],
		video = {},
		gdns = "http://schemas.google.com/g/2005",
		ytns = "http://gdata.youtube.com/schemas/2007",
		batchns = "http://schemas.google.com/gdata/batch";

	Array.prototype.forEach.call(xml.querySelectorAll("entry"), function (entry) {
		var status = entry.getElementsByTagNameNS(batchns, "status")[0];
		if (status.getAttribute("code") != "200") {
			error.push({
				id: entry.getElementsByTagName("id")[0].firstChild.nodeValue,
				reason: status.getAttribute("reason")
			});
			return;
		}

		var item = {},
			id = entry.getElementsByTagNameNS(ytns, "videoid")[0].textContent,
			rating = entry.getElementsByTagNameNS(gdns, "rating")[0];

		if (rating) {
			item.average = rating.getAttribute("average");
			item.numRaters = rating.getAttribute("numRaters");
		}

		rating = entry.getElementsByTagNameNS(ytns, "rating")[0];
		if (rating) {
			item.numDislikes = rating.getAttribute("numDislikes");
			item.numLikes = rating.getAttribute("numLikes");
		}

		video[id] = { rating: item };
	});

	if (error.length)
		log.warn("There was errors in server response.", error);

	return video;
}

/**
 * Create and fire custom event (<cite>lyrics</cite>) to inform others about
 * current lyrics search status.
 */
function fireEvent() {
	var event = document.createEvent("CustomEvent"),
		detail = {
			artist: current.artist,
			title: current.title,
			message: info,
			lyrics: lyrics,
			status: status
		};
	event.initCustomEvent("lyrics", true, false, detail);
	window.dispatchEvent(event);
}

/**
 * Format time for printing log messages.
 *
 * @param {Number} start
 * Time to use as start time.
 *
 * @param {Number} current
 * Time to use as current time.
 *
 * @param {Boolean} [atime = false]
 * <code>true</code> - use absolute time; <code>false</code> - use relative time
 * (number of seconds since log is started).
 */
function formatTime (start, current, atime) {
	if (atime) {
		var time = new Date(current);

		var hour = time.getHours().toPaddedString(2),
			minute = time.getMinutes().toPaddedString(2),
			second = time.getSeconds().toPaddedString(2),
			milli = time.getMilliseconds().toPaddedString(2);

		time = hour + ':' + minute + ':' + second + '.' + milli;
	}
	else {
		var time = current - start;

		var second = Math.floor(time / 1000).toPaddedString(4, ' '),
			milli = (time - Math.floor(time / 1000) * 1000).toPaddedString(3);

		time = second + '.' + milli;
	}

	return time;
}

/**
 * Get default classes for buttons.
 */
function getButtonClass() {
	return "yt-uix-button yt-uix-button-default yt-uix-tooltip yt-uix-tooltip-reverse ext-button";
}

/**
 * Goes up the call stack and returns the name of first function who has it.
 *
 * @returns {String}
 * Name of first function that is not anonymous.
 */
function getCallerName() {
	var caller = arguments.callee.caller;
	while (caller && !caller.name)
		caller = caller.caller;

	if (caller)
		return caller.name;
	return "global";
}

/**
 * Get locally stored preferences.
 */
function getPreferences() {
	var preferences = {};

	for (var key in widget.preferences)
		preferences[key] = getStorageItem(widget.preferences, key);

	return preferences;
}

/**
 * Get an item from storage and convert it to its original type.
 *
 * @param {Storage} storage
 * Reference to storage which holds the data.
 *
 * @param {String} key
 * Key for accessing data.
 *
 * @returns {Any}
 * Any type of data on success; <cite>null</cite> on failure.
 */
function getStorageItem(storage, key) {
	var value = storage.getItem(key);

	if (value == "true")
		return true;
	else if (value == "false")
		return false;
	else if (value == "undefined")
		return undefined;
	else if (/^[+\-]?\d+$/.test(value))
		return parseInt(value, 10);
	else if (/^(0x)[\da-f]+$/i.test(value))
		return parseInt(value, 16);
	else if (/^[+\-]?\d*\.\d+(e[+\-]\d+)?$/i.test(value))
		return parseFloat(value);
	else if (/^\{.*\}$|^\[.*\]$/.test(value))
		return JSON.parse(value);

	return value;
}

/**
 * Generate style based on CSS defined in {@link style} and user preferences.
 */
function getStyle(path) {
	if (!path || typeof path != "string")
		return '';

	path = path.split('/');
	if (path[1]) {
		if (path[0] == "cleanwatch") {
			if (path[1] == "allsidebar") {
				var width = 950,
					height = 590;

				width = 970;
				if (window.innerWidth < 970)
					width = window.innerWidth;

				height = Math.round(width * 39 / 64);
				if (height > window.innerHeight) {
					height = window.innerHeight;
					width = Math.round(height *  64 / 39);
				}

				width = width.toString();
				height = height.toString();

				return preferences.style[path[0]][path[1]].replace(/@width@/g, width).replace(/@height@/g, height);
			}
			else
				return preferences.style[path[0]][path[1]];
		}
		else if (path[0] == "customcolor")
			return preferences.style[path[0]][path[1]].replace(/@color@/g, preferences[path[0]][path[1]]);
		else
			return preferences.style[path[0]][path[1]];
	}
	else if (path[0] == "popout") {
		var size = {
			width: 854,
			height: 480,
			ratio: 16 / 9
		};
		if (preferences.popoutrealsize)
			size = xtt.video.getVideoSize();

		if (size.height + 30 > window.innerHeight) {
			size.height = window.innerHeight - 30;
			size.width = size.height * size.ratio;
		}
		if (size.width > window.innerWidth) {
			size.width = window.innerWidth;
			size.height = size.width / size.ratio;
		}

		var topmargin = (window.innerHeight - size.height - 30) / 2;
		if (topmargin < 0)
			topmargin = 0;

		return preferences.style.popout.replace(/@width\s/g, size.width).replace(/@height\s/g, size.height + 30).replace(/@topmargin\s/g, topmargin);
	}
	else
		return preferences.style[path[0]];
}

/**
 * Try to find video id from element’s href attribute.
 *
 * @param {HTMLAnchorElement} anchor
 * Element containing video thumbnail.
 */
function getVideoID(anchor) {
	var id;
	if (/^\/watch/.test(anchor.pathname)) {
		var vid = anchor.search.match(/v=([^&]+)/);
		if (vid && vid[1])
			id = vid[1];
	}
	else if (/^\/user\//.test(anchor.pathname)) {
		var vid = anchor.hash.match(/^#p\/l\/([^\/]+)/);
		if (vid && vid[1])
			id = vid[1];
	}

	return id;
}

/**
 * Play video if necessary.
 */
function handleAutoPlay() {
	if (xtt.video.isChannel && preferences.channelautoplay) {
		if (xtt.player.suggestedAutoplay == '1') {
			log.info("Video will be played. Suggested by YouTube.");

			xtt.player.control("play");
		}
		else {
			log.info("Video will be paused.");

			xtt.player.control("pause");
		}
	}
	else if (xtt.video.isEmbedded) {
		if  (xtt.video.isPopup && xtt.player.autoplay && xtt.player.state != 1) {
			log.info("Video will be played. Autoplay: " + xtt.player.autoplay + "; player state: " + xtt.player.state + '.');

			xtt.player.control("play");
		}
	}
	else if (xtt.player.autoplay && xtt.player.state != 1) {
		log.info("Video will be played. Autoplay: " + xtt.player.autoplay + "; player state: " + xtt.player.state + '.');

		xtt.player.control("play");
	}
	else if (!xtt.player.autoplay)
		log.info("Video wont be started. Autoplay is: false.");
}

/**
 * Event listener for <cite>click</cite> event on <em>close search log</em>
 * element. If lyrics search log is visible this function will hide it.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function hideLyricsSearchLog(event) {
	if (references.lyricsSearchLog)
		references.lyricsSearchLog.classList.add("ext-hidden");
}

/**
 * Event listener for <cite>mouseleave</cite> event on video thumbnail element.
 * This event will stop video preview.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function leavePreview(event) {
	clearTimeout(enter[this.getAttribute("href")]);

	leave[this.getAttribute("href")] = setTimeout(function () {
		stopPreview(event.target);
	}, 1000);
}

/**
 * This function will execute custom actions registered with
 * <cite>DOM created</cite> or <cite>page loaded</cite> event.
 *
 * @param {Event} event
 * Event object.
 */
function loaded(event) {
	runActions(event.type);
}

/**
 * Write message to lyrics search log during lyrics search progress.
 *
 * @param {String} message
 * Message to be written to search log.
 */
function logLyricsSearchMessage(message) {
	if (references.lyricsSearchLog)
		references.lyricsSearchLog.insertAdjacentHTML("beforeend", message + "<br>");
}

/**
 * Event listener for <cite>submit</cite> event on <em>try manual</em> form.
 * Search for manually inserted lyrics.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function lyricsSearch(event) {
	event.preventDefault();

	log.info("Manual search for lyrics initiated.");

	this.classList.add("ext-hidden");
	references.lyricsSearchLog.querySelector("div.box-close-link").classList.remove("ext-hidden");
	xtt.lyrics.load(this.firstElementChild.value);
}

function makeApi() {
	var xtt = {};

	/**
	 * Retrieve cookie.
	 *
	 * @param {String} name
	 * Name of the cookie.
	 *
	 * @returns {String}
	 * Cookie value or <code>null</code> if cookie doesn’t exist.
	 *
	 * @memberof xtt
	 */
	xtt.getCookie = function (name) {
		var cookie = null;
		document.cookie.split("; ").some(function (element) {
			if (element.substring(0, element.indexOf('=')) == name) {
				cookie = element.substring(1 + element.indexOf('='));
				return true;
			}
		});

		return cookie;
	};

	/**
	 * Localisation of ExtendTube.
	 *
	 * @namespace xtt.ll
	 */
	xtt.ll = /** @lends xtt.ll */ {
		/**
		 * Get localised strings for every supported language.
		 *
		 * @returns {Object}
		 * Object with all localised strings.
		 *
		 * @private
		 */
		getAllTranslations: function () {
			return preferences.localisedStrings;
		},
		/**
		 * Get localised string.
		 *
		 * @param {String} key
		 * Key for localised string.
		 *
		 * @returns {String}
		 * Localised string for given <cite>key</cite>. If string is not localised
		 * it will return string from English language or <code>undefined</code> if
		 * <cite>key</cite> is not part of the translations.
		 */
		getString: function (key) {
			var string = preferences.localisedStrings[language][key];
			if (!string)
				string = preferences.localisedStrings["en"][key];

			return string;
		},
		/**
		 * Get array of localised strings.
		 *
		 * @param {String} arg1[,arg2[,...]]
		 * List of keys for localised strings.
		 *
		 * @returns {Array}
		 * Array of requested localised strings. If nothing is found it will return
		 * empty array.
		 */
		getStringsArray: function () {
			var strings = [];
			Array.prototype.forEach.call(arguments, function (key) {
				strings.push(this.getString(key));
			}, this);

			return strings;
		},
		/**
		 * Set language to be used when adding content.
		 *
		 * @param {String} [lang]
		 * Language to be used. If this parameter is missing language defined in
		 * preferences will be used.
		 */
		setLanguage: function setLanguage(lang) {
			if (preferences.overridelocale || !lang)
				language = preferences.locale;
			else {
				if (lang in preferences.localisedStrings)
					language = lang;
				else if (/^[a-z]{2,3}_[A-Z]{2}$/.test(lang) && lang.split('_')[0] in preferences.localisedStrings)
					language = lang.split('_')[0];
			}

			if (language == "fil")
				language = "tl";
			else if (language == "iw")
				language = "he";

			log.info("Language is set to “" + language + "”.");
		}
	};

	/**
	 * Contains methods that can be used to log debug messages.
	 *
	 * @namespace xtt.log
	 */
	xtt.log = /** @lends xtt.log */ {
		/**
		 * Log error message. All passed arguments will be separated by space.
		 * Acyclic objects will be converted to JSON format and then printed.
		 *
		 * @param {Any} arg1[,arg2[,...]]
		 * Arguments of any type.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is cyclic object.
		 */
		error: function () {
			log.error.apply(log, arguments);
		},
		/**
		 * Same as {@link xtt.log.error} but also logs message to Error console
		 * regardless of <cite>loglevel</cite> option in preferences.
		 */
		Error: function () {
			log.Error.apply(log, arguments);
		},
		/**
		 * Log info message. All passed arguments will be separated by space.
		 * Acyclic objects will be converted to JSON format and then printed.
		 *
		 * @param {Any} arg1[,arg2[,...]]
		 * Arguments of any type.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is cyclic object.
		 */
		info: function () {
			log.info.apply(log, arguments);
		},
		/**
		 * Same as {@link xtt.log.info} but also logs message to Error console
		 * regardless of <cite>loglevel</cite> option in preferences.
		 */
		Info: function () {
			log.Info.apply(log, arguments);
		},
		/**
		 * Log warning message. All passed arguments will be separated by space.
		 * Acyclic objects will be converted to JSON format and then printed.
		 *
		 * @param {Any} arg1[,arg2[,...]]
		 * Arguments of any type.
		 *
		 * @throws {TypeError}
		 * If some of the arguments is cyclic object.
		 */
		warn: function () {
			log.warn.apply(log, arguments);
		},
		/**
		 * Same as {@link xtt.log.warn} but also logs message to Error console
		 * regardless of <cite>loglevel</cite> option in preferences.
		 */
		Warn: function () {
			log.Warn.apply(log, arguments);
		}
	};

	/**
	 * Lyrics management.
	 *
	 * @namespace xtt.lyrics
	 */
	xtt.lyrics = /** @lends xtt.lyrics */ {
		/**
		 * Initiate search for lyrics.
		 *
		 * @param {String} data
		 * String in which to search for artist and title.
		 */
		load: function loadLyrics(data) {
			var logstatus = '';
			switch (status) {
				case "search":
				case "continue":
					logstatus = "Lyrics search in progress.";
					break;
				case "parsing":
					logstatus = "Parsing search results.";
					break;
				case "found":
					logstatus = "Lyrics are aready found.";
					break;
				case "lyrics":
					logstatus = "Parsing lyrics data.";
					break;
				case "loaded":
					logstatus = "Lyrics are already loaded.";
			}

			if (logstatus) {
				log.warn("Lyrics search will not be started.", logstatus);
				return;
			}

			status = '';
			if (parseVideoTitle(data)) {
				current = list.shift();
				searchLyrics(current);
			}
			else {
				status = "invalid";
				info = xtt.ll.getString("LYRICS_TITLE_INVALID");
				fireEvent();
			}
		},
		/**
		 * Delete loaded lyrics.
		 */
		reset: function resetLyrics() {
			if (lyrics === null)
				return;

			log.warn("Lyrics are now cleared. New search is required to display them.");

			lyrics = null;
			fireEvent();
			status = '';
			list = [];
		},
		/**
		 * Test if artist and title can be extracted form video title.
		 */
		test: function () {
			return parseVideoTitle();
		}
	};

	/**
	 * Holds information about player and methods to control it.
	 *
	 * @namespace xtt.player
	 */
	xtt.player = /** @lends xtt.player */ {
		/**
		 * What should player do when becomes ready to play video. It can be one of:
		 * true - autoplay is enabled
		 * false - autoplay is disabled
		 * null - autoplay not received from background process
		 *
		 * @type ?Boolean
		 * @default null
		 *
		 * @private
		 */
		autoplay: null,
		/**
		 * How many times playback started. This value is re-setted when flash
		 * player is reloaded.
		 *
		 * @type Number
		 * @default 0
		 * @readonly
		 */
		playcount: 0,
		/**
		 * Reference to player element. You can call YouTube player API methods on
		 * this element.
		 *
		 * @see http://code.google.com/apis/youtube/js_api_reference.html
		 * @readonly
		 */
		playerElement: null,
		/**
		 * Used to indicate that information about player being ready is returned
		 * from background process.
		 *
		 * @type Boolean
		 * @default false
		 *
		 * @private
		 */
		ready: false,
		/**
		 * Current state of video playback. It may be one of:
		 * -1 - not started
		 * 0 - ended
		 * 1 - playing
		 * 2 - paused
		 * 3 - buffering
		 * 5 - cued
		 *
		 * @see http://code.google.com/apis/youtube/js_api_reference.html#getPlayerState
		 *
		 * @type Number
		 * @default -1
		 * @readonly
		 */
		state: -1,
		/**
		 * Change video quality. If quality passed by argument is not available
		 * first lower quality will be set.
		 *
		 * @see http://code.google.com/apis/youtube/js_api_reference.html#setPlaybackQuality
		 *
		 * @param {String} quality
		 * Possible options for this argument are: <cite>small</cite>,
		 * <cite>medium</cite>, <cite>large</cite>, <cite>hd720</cite>,
		 * <cite>hd1080</cite>, <cite>highres</cite> or <cite>default</cite>.
		 * Value <cite>default</cite> will be ignored.
		 */
		adjustVideoQuality: function adjustVideoQuality(quality) {
			if (xtt.video.isPreview || !this.playerElement || !quality)
				return;

			controlPlayer("setPlaybackQuality", quality);
		},
		/**
		 * Change colour of video player’s progress bar.
		 *
		 * @param {String} [colour = "red"]
		 * Can be <cite>red</cite> or <cite>white</cite>.
		 */
		changeProgressColour: function changePlayerProgressBarColour(colour) {
			// Video controls are hidden in video preview.
			if (xtt.video.isPreview)
				return;

			if (colour != "white")
				colour = "red";

			if (xtt.video.ishtml5) {
				if (colour == "red")
					this.playerElement.classList.remove("ext-progress-white");
				else
					this.playerElement.classList.add("ext-progress-white");
			}
		},
		/**
		 * Change theme of video player.
		 *
		 * @param {String} [theme = "dark"]
		 * Can be <cite>dark</cite> or <cite>light</cite>.
		 */
		changeTheme: function changePlayerTheme(theme) {
			// Video controls are hidden in video preview.
			if (xtt.video.isPreview)
				return;

			if (theme != "light")
				theme = "dark";

			if (xtt.video.ishtml5) {
				if (theme == "light") {
					this.playerElement.classList.remove("dark-theme");
					this.playerElement.classList.add("light-theme");
				}
				else {
					this.playerElement.classList.remove("light-theme");
					this.playerElement.classList.add("dark-theme");
				}
			}
		},
		/**
		 * Issue a command to video player.
		 *
		 * @param {String} command
		 * Tell player what to do. This argument is enumerated and can be:
		 * <cite>play/pause</cite>, <cite>pause</cite>, <cite>play</cite>,
		 * <cite>stop</cite>, <cite>seek</cite> or <cite>volume</cite>.
		 * Command <cite>play/pause</cite> will play or pause video depending on
		 * current state. Command <cite>stop</cite> will pause video and stop
		 * buffering it. Commands <cite>seek</cite and<cite>volume</cite> will seek
		 * or change volume for value given by second argument.
		 *
		 * @param {String|Number} [data]
		 * This argument is needed when issuing commands <cite>seek</cite> and
		 * <cite>volume</cite>. If this argument is number or string written as
		 * &lt;number&gt;% (ex. 73%) change will be absolute regardless of current
		 * state. If argument is string written as +&lt;number&gt;% or
		 * -&lt;number&gt;% (ex. +38% or -49%) change will be relative to current
		 * state.
		 */
		control: function xttPlayerControl(command, data) {
			if (!this.playerElement)
				return;

			switch (command) {
				case "play/pause":
					if (this.state == 1)
						this.control("pause");
					else
						this.control("play");
					break;
				case "pause":
					controlPlayer("pauseVideo");
					break;
				case "play":
					controlPlayer("playVideo");
					break;
				case "stop":
					controlPlayer("stopVideo");
					break;
				// Jump to given time/percent.
				case "seek":
					if (data === undefined)
						return;

					if (typeof data == "string") {
						// Convert percent to time.
						if (/^[+\-]/.test(data))
							data = this.playerElement.getCurrentTime() + xtt.video.length * parseInt(data, 10) / 100;
						else
							data = xtt.video.length * parseInt(data, 10) / 100;
					}

					if (data < 0)
						data = 0;
					if (data > xtt.video.length)
						data = xtt.video.length;

					controlPlayer("seekTo", data);
					break;
				// Change volume.
				case "volume":
					if (!data)
						return;

					if (typeof data == "string") {
						// Convert percent to volume.
						if (/^[+\-]/.test(data))
							data = this.playerElement.getVolume() + parseInt(data, 10);
						else
							data = parseInt(data, 10);
					}

					if (data < 0)
						data = 0;
					if (data > 100)
						data = 100;

					controlPlayer("setVolume", data);
			}
		},
		/**
		 * Expand or shrink video player.
		 *
		 * @param {Boolean} [wide = undefined]
		 * Should player be expanded (<code>true</code>) or shrinked
		 * (<code>false</code>). If this parameter is missing player size will be
		 * alternated (if it was wide it will become normal and vice versa).
		 */
		enableWide: function enableWidePlayer(wide) {
			var iswide = !!document.querySelector("#page.watch-wide");
			if (!this.playerElement || xtt.video.isEmbedded || wide == iswide)
				return;

			var watch5 = yt.www.watch.watch5;

			if (watch5 && watch5.enableWide) {
				if (typeof wide == "string")
					return;

				try {
					if (wide !== undefined) {
						watch5.enableWide(wide);

						if (wide)
							log.info("Player size is changed to wide player size.");
						else
							log.info("Player size is changed to normal player size.");
					}
					// Toggle wide.
					else {
						watch5.enableWide(!iswide);

						if (iswide)
							log.info("Player size is changed to normal player size.");
						else
							log.info("Player size is changed to wide player size.");
					}
				}
				catch (error) {
					setTimeout(function () {
						enableWidePlayer(wide);
					}, 100);
				}
			}
			else
				log.warn("An error occurred while trying to toggle wide player. No known methods.");
		},
		/**
		 * This method will play only one frame of video. This is usually emulated
		 * using time-out, but since Opera 11.60 for HTML 5 videos it will
		 * accurately play one frame (it will advance video for 40ms).
		 */
		frameStep: function () {
			if (xtt.video.ishtml5) {
				if (this.state != 2)
					this.control("pause");
				this.playerElement.querySelector("video[src]").currentTime += 0.04;
			}
			else {
				this.control("play");
				setTimeout(function () {
					xtt.player.control("pause");
				}, 35);
			}
		},
		/**
		 * Hide annotations in video.
		 *
		 * @param {Boolean} [hide = true]
		 * Whether annotations should be visible (<code>false</code>) or hidden
		 * (<code>true</code>).
		 */
		hideAnnotations: function hideVideoAnnotations(hide) {
			// Do not enable annotations in video preview.
			if (xtt.video.isPreview || !this.playerElement)
				return;

			if (xtt.video.ishtml5) {
				var state = this.playerElement.classList.contains("iv-loaded");

				// Annotations already enabled.
				if (hide === false && state)
					return;
				// Annotations already disabled.
				if (hide !== false && !state)
					return;

				if (hide === false) {
					this.playerElement.classList.add("iv-loaded");

					log.warn("Annotations will be visible.");
				}
				else {
					this.playerElement.classList.remove("iv-loaded");

					log.warn("Annotations will be hidden.");
				}
			}
		},
		/**
		 * Change auto-hide option for player controls.
		 *
		 * @param {Number} [hide = 3]
		 * New value for auto-hide option. Possible options are:
		 * 0 = controls and progress bar always visible,
		 * 1 = controls and progress bar will be hidden after few seconds,
		 * 2 = controls will be visible; progress bar will be minimised
		 * 	   after few seconds,
		 * 3 = controls will be hidden; progress bar will be minimised
		 *     after few seconds.
		 */
		hideControls: function hidePlayerControls(hide) {
			// Video controls are hidden in video preview.
			if (xtt.video.isPreview)
				return;

			if (typeof hide != "number" || !/^[0-3]$/.test(hide.toString()))
				hide = 3;

			if (xtt.video.ishtml5) {
				var classes = ["autohide-off", "autohide-on", "autohide-fade", "autohide-auto"];
				classes.forEach(function (className, index) {
					if (hide == index)
						this.playerElement.classList.add(className);
					else
						this.playerElement.classList.remove(className);
				}, this);
			}
		},
		/**
		 * Test to see if loop is forced or loop section is enabled.
		 *
		 * @returns {Boolean}
		 * <code>true</code> if loop is forced or looping section;
		 * <code>false</code> otherwise.
		 */
		isLoopForced: function () {
			if (xtt.video.isPlaylist) {
				if (preferences.loop && preferences.forceloop)
					return true;
				if (this.loopSection.enabled)
					return true;
			}
			return false;
		},
		/**
		 * Seek video back/forward for time defined in preferences.
		 *
		 * @param {Boolean} forward
		 * Whether to seek forward (<code>true</code>)
		 * or backwards (<code>false</code>).
		 */
		seekVideo: function (forward) {
			if (!this.playerElement)
				return;

			if (forward)
				this.control("seek", this.playerElement.getCurrentTime() + preferences.seektime);
			else
				this.control("seek", this.playerElement.getCurrentTime() - preferences.seektime);
		},
		/**
		 * Should be run when player changes its state. It will be called by YouTube
		 * JavaScript API.
		 *
		 * @param {Number} newstate
		 * New state of playback.
		 *
		 * @private
		 */
		stateChanged: function playerStateChanged(newstate) {
			if (newstate == 1 && !xtt.video.isPreview) {
				if (!this.playcount && xtt.video.isEmbedded) {
					setTimeout(function () {
						xtt.player.adjustVideoQuality(preferences.videoquality);
					}, 200);
				}
				this.playcount++;

				if (!this.ready) {
					log.warn("Video playback started before player is ready. It will be paused.");

					this.control("pause");
					return;
				}
				else if (this.autoplay === null) {
					log.warn("Video playback started but autoplay option is unknown. It will be paused.");

					this.control("pause");
					return;
				}
				else if (!this.autoplay && this.playcount < 2 && xtt.video.ishtml5) {
					log.warn("Video playback started but autoplay option is false. It will be paused.");

					this.control("pause");
					return;
				}

				// Continue playback if player is reloaded.
				if (playbackProgress) {
					xtt.player.control("seek", playbackProgress);
					playbackProgress = NaN;
				}

				if (this.playcount == 2 && !xtt.video.isChannel && !xtt.video.ishtml5) {
					setTimeout(function () {
						xtt.player.control("play");
					}, 500);
				}
			}

			if (!xtt.video.length) {
				setTimeout(function () {
					if (!xtt.video.length) {
						try {
							xtt.video.length = xtt.player.playerElement.getDuration();
						}
						catch (error) {
							setTimeout(arguments.callee, 1000);
						}
					}
				}, 4);
			}

			if (this.state != newstate) {
				this.state = newstate;
				sendMessage("player state changed", { state: newstate });

				switch (newstate) {
					case 0:
						log.info("Video playback ended.");

						runActions("playback ended");
						stopSendingStatus();
						break;
					case 1:
						log.info("Video playback started. Ready: " + this.ready + ", autoplay: " + this.autoplay + ", playcount: " + this.playcount + '.');

						runActions("playback started");
						startSendingStatus();
						break;
					case 2:
						log.info("Video playback paused.");

						runActions("playback paused");
						stopSendingStatus();
				}
			}
		},
		/**
		 * Write player to page. It's called from modified YouTube scripts.
		 *
		 * @private
		 */
		writePlayer: function () {
			var watch7 = document.querySelector("#watch7-player"),
				playerId = "player";

			if (xtt.video.isEmbedded || watch7) {
				if (watch7)
					playerId = "watch7-player";

				if (xtt.video.ishtml5) {
					delete this.api;
					this.api = yt.player.update(playerId, yt.playerConfig, true);
				}
				else
					setTimeout(function () {
						yt.player.embed.call(window, playerId, yt.playerConfig);
					}, 0);
			}
			else if (!xtt.video.ishtml5)
				yt.flash.embed("watch-player", yt.playerConfig);
		}
	};
	xtt.player.__defineGetter__("api", function() {
		return yt.config_.PLAYER_REFERENCE;
	});
	/**
	 * What should player do when becomes ready to play video. This is
	 * suggestion from YouTube and it affects only videos on channels.
	 * It can be one of:
	 * '1' - autoplay is enabled
	 * '0' - autoplay is disabled
	 *
	 * @type String
	 * @default '0'
	 * @readonly
	 */
	xtt.player.__defineGetter__("suggestedAutoplay", function() {
		if (yt.playerConfig.args)
			return yt.playerConfig.args.autoplay;
		return '0';
	});
	/**
	 * Called when player is ready to play video. This method may be called
	 * more than once.
	 *
	 * @private
	 */
	xtt.player.__defineGetter__("playerReady", function() {
		function playerReady() {
			if (!this.api && xtt.video.isChannel) {
				delete this.api;
				this.api = yt.player.embed(document.querySelector(".channels-video-player"), yt.playerConfig);
				return;
			}

			// Remember reference to player.
			this.playerElement = document.querySelector("embed[flashvars], #movie_player-html5, #video-player-html5, .player-container #video-player");
			if (!this.playerElement) {
				log.error("Player element cannot be found.");
				return;
			}

			log.info("Video player is ready to play video.");

			if (this.api)
				this.api.addEventListener("onStateChange", bind(xtt.player.stateChanged, xtt.player));
			else
				xtt.log.error("Failed to get reference to YouTube player API");

			if (!xtt.video.isPreview)
				this.control("pause");

			// Inform background process that player is ready,
			sendMessage("player ready");
			// expand player if needed.
			if (preferences.enablewideplayer)
				this.enableWide(true);

			runActions("player ready");

			if (self.jsapicallback)
				self.jsapicallback.apply(this, arguments);
			return onYouTubePlayerReady.apply(this, arguments);
		}

		delete xtt.player.playerReady;
		xtt.player.playerReady = bind(playerReady, xtt.player);

		return xtt.player.playerReady;
	});

	/**
	 * Holds information about section loop and methods to control it.
	 *
	 * @namespace xtt.player.loopSection
	 */
	xtt.player.loopSection = /** @lends xtt.player.loopSection */ {
		/**
		 * Says if section loop is enabled (positive integer) or disabled (NaN).
		 *
		 * @type Number
		 * @default NaN
		 * @readonly
		 */
		enabled: NaN,
		/**
		 * End of section loop.
		 *
		 * @type Number
		 *
		 * @private
		 */
		end: 0,
		/**
		 * Begin of section loop.
		 *
		 * @type Number
		 *
		 * @private
		 */
		start: 0,
		/**
		 * Stop looping defined section of video.
		 */
		disable: function loopSectionDisable() {
			if (!this.enabled)
				return;

			clearInterval(this.enabled);
			this.enabled = NaN;

			log.info("Section loop is disabled.");

			collapseLoopButton();
		},
		/**
		 * Start looping section of video.
		 */
		enable: function loopSectionEnable() {
			if (this.enabled)
				return;

			// Reset section info.
			this.start = 0;
			this.end = xtt.video.length;

			this.enabled = setInterval(function loopSectionInterval() {
				var current = xtt.player.playerElement.getCurrentTime(),
					loopStartTime = xtt.player.loopSection.start;

				if (!xtt.video.ishtml5)
					loopStartTime -= 3;

				if (xtt.player.loopSection.end <= current || current < loopStartTime || xtt.player.state == 0) {
					log.info("Plyback is out of defined loop section. Current time is: " + current + "s.");

					xtt.player.control("seek", xtt.player.loopSection.start);
				}
			}, 321);

			log.info("Section loop is enabled.");

			expandLoopButton();
		},
		/**
		 * Change end time for section loop.
		 *
		 * @param {String} action
		 * This argument is enumerated and can be: <cite>mark</cite>,
		 * <cite>increment</cite> or <cite>decrement</cite>. First option mean use
		 * current time as end time. Second two options mean increment or decrement
		 * current value for one, respectively.
		 */
		endTime: function adjustSectionEndTime(action) {
			if (!this.enabled)
				return;

			if (action == "mark")
				this.end = xtt.player.playerElement.getCurrentTime();
			else if (action == "increment") {
				if (this.end < xtt.video.length)
					this.end++;
			}
			else if (action == "decrement") {
				if (this.end > this.start)
					this.end--;
			}

			log.info("Section loop end time is changed to " + this.end + '.');

			updateSectionButtons();
		},
		/**
		 * Change start time for section loop.
		 *
		 * @param {String} action
		 * This argument is enumerated and can be: <cite>mark</cite>,
		 * <cite>increment</cite> or <cite>decrement</cite>. First option mean use
		 * current time as start time.  Second two options mean increment or
		 * decrement current value for one, respectively.
		 */
		startTime: function adjustSectionStartTime(action) {
			if (!this.enabled)
				return;

			if (action == "mark")
				this.start = xtt.player.playerElement.getCurrentTime();
			else if (action == "increment") {
				if (this.start < this.end)
					this.start++;
			}
			else if (action == "decrement") {
				if (this.start > 0)
					this.start--;
			}

			log.info("Section loop start time is changed to " + this.start + '.');

			updateSectionButtons();
		},
		/**
		 * Start or stop looping section of video depending on current state.
		 */
		toggle: function () {
			if (this.enabled)
				this.disable();
			else
				this.enable();
		}
	};

	/**
	 * Keyboard shortcut management.
	 *
	 * @namespace xtt.shortcut
	 */
	xtt.shortcut = /** @lends xtt.shortcut */ {
		/**
		 * Stop listening for keyboard shortcuts.
		 */
		disable: function disableShortcuts() {
			document.removeEventListener("keypress", shortcutAction, false);

			log.info("Keyboard shortcuts are disabled.");
		},
		/**
		 * Start listening for keyboard shortcuts.
		 */
		enable: function enableShortcuts() {
			document.addEventListener("keypress", shortcutAction, false);

			log.info("Keyboard shortcuts are enabled.");
		}
	};

	/**
	 * Holds methods related to User Interface.Those are methods adding, removing or
	 * changing buttons, colours...
	 *
	 * @namespace xtt.ui
	 */
	xtt.ui = {};

	/**
	 * Methods used to add buttons, menus and other elements.
	 *
	 * @namespace xtt.ui.add
	 */
	xtt.ui.add = /** @lends xtt.ui.add */ {
		/**
		 * Adds button to page that can be used to download currently playing video.
		 * This button will contain empty menu that can later be updated using
		 * {@link xtt.ui.add.downloadMenuItem}.
		 *
		 * @param {HTMLElement} node
		 * Parent element for new button.
		 *
		 * @returns {HTMLButtonElement}
		 * Reference to created button or <code>null</code> if <cite>node</cite>
		 * parameter is missing.
		 */
		downloadButton: function addDownloadButton(node) {
			if (references.downloadButton || !node)
				return references.downloadButton;
			makeRoom(node);

			var button = createButton({
					"class": getButtonClass(),
					"id": "ext-download-button",
					"data-tooltip-text": xtt.ll.getString("DOWNLOAD_VIDEO")
				}),
				dlmenu = document.createElement("ul");

			dlmenu.setAttribute("class", "yt-uix-button-menu ext-download-menu");
			button.appendChild(dlmenu);
			button.addEventListener("click", showDownloadMenu, false);

			// Insert created nodes to document.
			if (references.preferencesButton && references.preferencesButton.parentNode == node)
				references.preferencesButton.insertAdjacentElement("beforebegin", button);
			else
				node.appendChild(button);

			log.info("Download button added to page.");

			// Remember reference to created elements.
			references.downloadButton = button;
			references.downloadMenu = dlmenu;
			updateDownloadMenu();
			return button;
		},
		/**
		 * Adds an item to download menu created by {@link xtt.ui.add.downloadButton}.
		 *
		 * @param {Object} item
		 * Object containing required properties to create menu item.
		 *
		 * @param {Function} [item.clickListener]
		 * Reference to function that will be called when user clicks
		 * on created menu item.
		 *
		 * @param {String} item.uri
		 * <a href="http://en.wikipedia.org/wiki/URI" title="Uniform Resource Identifier">URI</a>
		 * that will be set as target of menu item.
		 *
		 * @param {String} item.text
		 * Text that will be displayed as menu item.
		 *
		 * @param {String} [item.tooltip]
		 * Text tat will be used as tool-tip for menu item.
		 *
		 * @param {HTMLLIElement} [before]
		 * Reference to menu item before which should new item be added. If this
		 * parameter is missing menu item will be added at the end of the menu.
		 *
		 * @param {Boolean} [internal]
		 * Mark menu items that are added by internal methods. Those menu items
		 * will be removed when menu is updated, so don’t use it.
		 *
		 * @returns {Boolean}
		 * Reference to created menu item or <code>null</code> on error.
		 */
		downloadMenuItem: function addDownloadMenuItem(item, before, internal) {
			if (!references.downloadMenu) {
				log.warn("Cannot add menu item. Menu doesn’t exist.", item);
				return null;
			}
			else if (!item.uri) {
				log.warn("Cannot add menu item. Menu item’s address is missing.");
				return null;
			}
			else if (!item.text) {
				log.warn("Cannot add menu item. Menu item’s text content is missing.");
				return null;
			}

			var link = document.createElement("a");
			link.setAttribute("class", "yt-uix-button-menu-item yt-uix-tooltip");
			link.textContent = item.text;
			link.href = item.uri;
			if (item.tooltip)
				link.setAttribute("data-tooltip-text", item.tooltip);
			if (typeof item.clickListener == "function")
				link.addEventListener("click", item.clickListener, false);

			var menuItem = document.createElement("li");
			if (internal)
				menuItem.setAttribute("data-ext-internal", "true");
			menuItem.appendChild(link);

			if (before && before.parentNode)
				before.insertAdjacentElement("beforebegin", menuItem);
			else
				references.downloadMenu.appendChild(menuItem);

			log.info("New item is added to download menu.",
				"Item name: " + item.text + '.'
			);

			return menuItem;
		},
		/**
		 * Adds seek and frame step buttons. Seek buttons will allow you to seek
		 * video back or forward, while frame step button can be used to play
		 * approximately one frame at a time.
		 *
		 * @param {HTMLElement} node
		 * Parent element for new buttons.
		 *
		 * @returns {HTMLElement}
		 * Reference to container of created buttons or <code>null</code> if
		 * <cite>node</cite> parameter is missing.
		 */
		extraButtons: function addExtraButtons(node) {
			if (references.extraContainer || !node)
				return references.extraContainer;
			makeRoom(node);

			// Extra buttons container.
			var buttoncnt = document.createElement("span"),
				// Frame-step button.
				fstep = createButton({
					"class": getButtonClass() + " ext-button-middle",
					"id": "ext-framestep-button",
					"data-tooltip-text": xtt.ll.getString("STEP_FRAME_FORWARD")
				}),
				// Seek forward button.
				fseek = createButton({
					"class": getButtonClass() + " ext-button-end",
					"id": "ext-seekforward-button"
				}),
				// Seek back button.
				bseek = createButton({
					"class": getButtonClass() + " ext-button-start",
					"id": "ext-seekback-button"
				});

			buttoncnt.setAttribute("id", "ext-extra-button-container");
			fstep.addEventListener("click", videoFrameForward, false);
			bseek.addEventListener("click", videoSeekBack, false);
			fseek.addEventListener("click", videoSeekForward, false);

			buttoncnt.appendChild(bseek);
			buttoncnt.appendChild(fstep);
			buttoncnt.appendChild(fseek);

			// Insert created nodes to document.
			if (references.popoutButton && references.popoutButton.parentNode == node)
				references.popoutButton.insertAdjacentElement("afterend", buttoncnt);
			else
				node.insertAdjacentElement("afterbegin", buttoncnt);

			log.info("Seek back/forward and frame step buttons added to page.");

			// Remember references to created buttons.
			references.frameStepButton = fstep;
			references.seekForwardButton = fseek;
			references.seekBackButton = bseek;
			references.extraContainer = buttoncnt;
			// Update tool-tip for seek back/forward buttons.
			updateSeekButtons();
			return buttoncnt;
		},
		/**
		 * Adds loop and mark buttons. Loop button is for enabling/disabling video
		 * looping (whole or just a part of it). Mark buttons are for marking
		 * section of video to be looped.
		 *
		 * @param {HTMLElement} node
		 * Parent element for new buttons container.
		 *
		 * @returns {HTMLElement}
		 * Reference to container of created buttons or <code>null</code> if
		 * <cite>node</cite> parameter is missing.
		 */
		loopButtons: function addLoopButtons(node) {
			if (references.loopContainer || !node)
				return references.loopButton;
			makeRoom(node);

			// Button container.
			var lpcnt = document.createElement("span"),
				// Loop button.
				loop = createButton({
					"class": getButtonClass() + " ext-button-middle",
					"id": "ext-loop-button",
					"data-tooltip-text": xtt.ll.getString("LOOP_ENABLE")
				}),
				// Mark section start button.
				lpstart = createButton({
					"class": getButtonClass() + " ext-button-start",
					"id": "ext-loop-button-start-range",
					"data-tooltip-text": xtt.ll.getString("LOOP_MARK_START")
				}),
				// Mark section end button.
				lpend = createButton({
					"class": getButtonClass() + " ext-button-end",
					"id": "ext-loop-button-end-range",
					"data-tooltip-text": xtt.ll.getString("LOOP_MARK_END")
				});

			lpcnt.setAttribute("class", "ext-collapsed");
			lpcnt.setAttribute("id", "ext-loop-button-container");
			lpstart.appendChild(document.createElement("span"));
			lpend.appendChild(document.createElement("span"));

			lpcnt.appendChild(lpstart);
			lpcnt.appendChild(loop);
			lpcnt.appendChild(lpend);

			// Insert created nodes to document.
			if (references.downloadButton && references.downloadButton.parentNode == node)
				references.downloadButton.insertAdjacentElement("beforebegin", lpcnt);
			else if (references.preferencesButton && references.preferencesButton.parentNode == node)
				references.preferencesButton.insertAdjacentElement("beforebegin", lpcnt);
			else
				node.appendChild(lpcnt);

			log.info("Loop button (with mark section buttons) added to page.");

			loop.addEventListener("click", toggleLoop, false);
			loop.addEventListener("mousedown", toggleLoopDown, false);
			loop.addEventListener("mouseup", toggleLoopUp, false);
			lpstart.addEventListener("click", markSectionStart, false);
			lpstart.addEventListener("mousewheel", tuneSectionStart, false);
			lpend.addEventListener("click", markSectionEnd, false);
			lpend.addEventListener("mousewheel", tuneSectionEnd, false);
			document.addEventListener("keydown", updateLoopButtonTooltip, false);
			document.addEventListener("keyup", updateLoopButtonTooltip, false);

			// Remember references to created buttons.
			references.loopButton = loop;
			references.loopStartButton = lpstart;
			references.loopEndButton = lpend;
			references.loopContainer = lpcnt;
			// Update loop button content.
			updateLoopButton();
			return lpcnt;
		},
		/**
		 * Adds container to page that will be used to hold lyrics.
		 *
		 * @param {String} where
		 * Where to insert container relative to <code>node</code> element. Possible
		 * options are: <cite>beforebegin</cite>, <cite>afretbegin</cite>,
		 * <cite>beforeend</cite> or <cite>afterend</cite>.
		 * <a href="http://help.dottoro.com/ljbreokf.php">More</a> about this.
		 *
		 * @param {HTMLElement} node
		 * Parent element for new button.
		 *
		 * @returns {HTMLDivElement}
		 * Reference to created container or <code>null</code> if <cite>node</cite>
		 * parameter is missing.
		 */
		lyricsContainer: function addLyricsContainer(where, node) {
			if (!node)
				return null;
			if (references.lyricsContainer) {
				references.lyricsContainer.classList.remove("ext-hidden");
				return references.lyricsContainer;
			}

			// Header container.
			var header = document.createElement("div");
			header.setAttribute("class", "comments-section");
			header.insertAdjacentHTML("afterbegin", "<h4>" + xtt.ll.getString("LYRICS_LYRICS") + "</h4>");

			// Search log container.
			var infoel = document.createElement("p");
			infoel.setAttribute("class", "ext-lyrics-body-info");
			// Hide button for search log.
			infoel.insertAdjacentHTML("afterbegin", "<div class=\"box-close-link\"><img></div>");
			infoel.firstChild.addEventListener("click", hideLyricsSearchLog, false);

			// Manual search button.
			var load = createButton({ "class": "search-button yt-uix-button yt-uix-button-default" });
			load.textContent = xtt.ll.getString("LYRICS_BUTTON_LOAD");
			// Manual search input.
			var search = document.createElement("input");
			search.setAttribute("type", "search");
			search.setAttribute("class", "search-term");
			// Manual search form.
			var manualform = document.createElement("form");
			manualform.setAttribute("class", "ext-hidden");
			manualform.addEventListener("submit", lyricsSearch, false);
			manualform.appendChild(search);
			manualform.appendChild(load);

			// Lyrics and log container.
			var body = document.createElement("div");
			body.setAttribute("class", "ext-lyrics-body ext-hidden");
			body.appendChild(infoel);
			body.appendChild(manualform);

			// Expand/collapse button.
			var button = createButton({ "class": "metadata-inline yt-uix-button yt-uix-button-default" });
			button.textContent = xtt.ll.getString("LYRICS_BUTTON_SHOW");
			// Show/hide lyrics.
			button.addEventListener("click", xtt.ui.apply.toggleLyrics, false);

			// Expand/collapse button container.
			var expand = document.createElement("div");
			expand.setAttribute("class", "expand");
			expand.appendChild(button);

			var footer = document.createElement("div");
			footer.setAttribute("class", "yt-uix-expander-head");
			footer.appendChild(expand);

			// Container (lyrics and buttons).
			var container = document.createElement("div");
			container.setAttribute("class", "watch-expander yt-uix-expander ext-lyrics");
			container.appendChild(header);
			container.appendChild(body);
			container.appendChild(footer);

			if (!preferences.lyricsenablealways && !xtt.lyrics.test())
				container.classList.add("ext-hidden");

			node.insertAdjacentElement(where, container);

			log.info("Container element for lyrics added to page.");

			// Remember references to created elements.
			references.lyricsContainer = container;
			references.lyricsBody = body;
			references.lyricsHeader = header;
			references.lyricsFooter = footer;
			references.lyricsSearchLog = infoel;
			references.lyricsManualForm = manualform;
			return container;
		},
		/**
		 * Adds button to page that can be used to pop player out of page content.
		 * The player will then be centred on view-port and background will become
		 * dark.
		 *
		 * @param {HTMLElement} node
		 * Parent element for new button.
		 *
		 * @returns {HTMLButtonElement}
		 * Reference to created button or <code>null</code> if <cite>node</cite>
		 * parameter is missing.
		 */
		popoutButton: function addPopoutButton(node) {
			if (references.popoutButton || !node)
				return references.popoutButton;
			makeRoom(node);

			var popout = createButton({
					"class": getButtonClass(),
					"id": "ext-popout-button",
					"data-tooltip-text": xtt.ll.getString("POPOUT_PLAYER")
				});

			popout.addEventListener("click", popoutPlayer, false);

			// Insert created nodes to document.
			node.insertAdjacentElement("afterbegin", popout);

			log.info("Pop-out button added to page.");

			// Remember references to created button.
			references.popoutButton = popout;
			return popout;
		},
		/**
		 * Adds button to page which will be used to open ExtendTube preferences.
		 *
		 * @param {HTMLElement} node
		 * Parent element for new button.
		 *
		 * @returns {HTMLButtonElement}
		 * Reference to created button or <code>null</code> if <cite>node</cite>
		 * parameter is missing.
		 */
		preferencesButton: function addPreferencesButton(node) {
			if (references.preferencesButton || !node)
				return references.preferencesButton;
			makeRoom(node);

			var button = createButton({
					"class": getButtonClass(),
					"id": "ext-preferences-button",
					"data-tooltip-text": xtt.ll.getString("PREFERENCES")
				});

			button.addEventListener("click", showPreferencesWindow, false);

			// Insert created button to document.
			node.appendChild(button);

			log.info("Preferences button added to page.");

			// Remember reference to created button.
			references.preferencesButton = button;
			return button;
		},
		/**
		 * Add interface to preview video thumbnails.
		 */
		thumbPreview: function addThumbnailPreview() {
			if (arguments[0] && arguments[0].type == "DOMNodeInserted") {
				subtreeModified(addThumbnailPreview);
				return;
			}

			var thumb = document.querySelectorAll("a[href*=\"/watch?\"], a[href*=\"/user/\"]"),
				loadMore = document.querySelectorAll("#watch-more-from-user, #watch-more-related, #watch-sidebar .watch-sidebar-body, #feed, .gh-single-playlist");

			// Since further modification causes calls to this method we need to
			// remove those calls until we finish modification.
			Array.prototype.forEach.call(loadMore, function (node) {
				node.removeEventListener("DOMNodeInserted", addThumbnailPreview, false);
			});

			Array.prototype.forEach.call(thumb, function (anchor) {
				var thumb = anchor.querySelector(".video-thumb");
				if (!thumb || (/^\/user\//.test(anchor.pathname) && !/^#p\/l\//.test(anchor.hash)))
					return;

				var addto = anchor.querySelector(".addto-button, .addto-container");
				if (!addto) {
					addto = document.createElement("span");
					addto.className = "ext-addto addto-container short video-actions";

					thumb.classList.add("ux-thumb-wrap");
					thumb.appendChild(addto);
				}

				if (preferences.thumbpreviewtrigger == "button")
					addPreviewButton(anchor);
				else if (preferences.thumbpreviewtrigger == "hover") {
					previewOnHover(anchor);
					addto.classList.add("ext-hidden");
				}

				anchor.classList.add("ext-preview-enabled");
			});

			// Add preview interface to content that is added later;
			// like user video or load more suggestions.
			Array.prototype.forEach.call(loadMore, function (node) {
				node.addEventListener("DOMNodeInserted", addThumbnailPreview, false);
			});

			if (document.querySelector(".ext-preview-enabled"))
				log.info("Interface for video preview added to document.");
		},
		/**
		 * Get list of videos on page and send request for more informations about
		 * videos. When response to request comes, it will be used to add rating bar
		 * at the top of video thumbnails.
		 */
		videoRatings: function addVideoRatings() {
			if (arguments[0] && arguments[0].type == "DOMNodeInserted") {
				subtreeModified(addVideoRatings);
				return;
			}

			var videolist = [],
				partition = [],
				thumbs = document.querySelectorAll("a[href*=\"/watch?\"], a[href*=\"/user/\"]");

			Array.prototype.forEach.call(thumbs, function (anchor) {
				if (anchor.querySelector(".video-thumb") && !anchor.querySelector(".ext-video-rating"))
					videolist.push(getVideoID(anchor));
			});

			// Remove empty cells from array.
			videolist = videolist.filter(function (element) { return typeof element == "string"; });

			if (!videolist.length) {
				log.warn("Cannot get list of available videos.");
				return;
			}
			thumbs = videolist.length;

			while (videolist.length)
				partition.push(videolist.splice(0, 25));

			partition.forEach(function (list) {
				var postdata = makePostData(list);

				var header = {
						"Content-Type": "application/atom+xml; charset=utf-8",
						"Content-Length": postdata.length,
						"GData-Version": 2
					};

				sendMessage("load external resource",
					{
						uri: "http://gdata.youtube.com/feeds/api/videos/batch",
						method: "post",
						postdata: postdata,
						header: header,
						about: "ratings"
					}
				);
			});

			log.info("Request(s) for video information has been sent.",
				"There are " + thumbs + " videos in " + Math.ceil(thumbs / 25) + " request(s)."
			);
		}
	};

	/**
	 * Methods used to change page colours, icons of elements...
	 *
	 * @namespace xtt.ui.apply
	 */
	xtt.ui.apply = /** @lends xtt.ui.apply */ {
		/**
		 * Hide various elements on page.
		 *
		 * @param {Object} [data]
		 * Object containing information of which elements should be hidden  and
		 * which not. If this argument is missing or not an object, information
		 * defined in <a href="/options.html#preferences/cleanup">Page Clean-up</a>
		 * will be used. For object structure see
		 * <a href="/lib/preferences.js">preferences.js</a>.
		 */
		cleanPage: function cleanPage(data) {
			if (!data || typeof data != "object")
				data = preferences.cleanwatch;

			var style = '';
			for (var property in data)
				if (data[property])
					style += getStyle("cleanwatch/" + property);

			if (!data.featured && data.suggestions) {
				var feat = document.querySelector("#watch-sidebar > #branded-playlist-module");
				if (!feat || window.getComputedStyle(feat).display == "none")
					style += getStyle("cleanwatch/allsidebar");
			}

			var clean = document.querySelector("head > #ext-page-clean-up");
			// Update existing style.
			if (clean)
				clean.textContent = style;
			// Create new style.
			else {
				clean = document.createElement("style");
				clean.setAttribute("type", "text/css");
				clean.setAttribute("id", "ext-page-clean-up");
				clean.appendChild(document.createTextNode(style));
				document.querySelector("head").appendChild(clean);

				log.warn("Page clean-up style is added to page. Some parts of page will be hidden.");
			}
		},
		/**
		 * Replace colours on page with user defined colours.
		 *
		 * @param {Object} [data]
		 * Object containing colours to be applied to page. If this argument is
		 * missing or not an object, colours defined in
		 * <a href="/options.html#preferences/colors">Custom colours</a> will be
		 * applied. For object structure see
		 * <a href="/lib/preferences.js">preferences.js</a>.
		 */
		customColors: function customColors(data) {
			var customcolor = preferences.customcolor;
			if (typeof data == "object")
				customcolor = data;

			var style = '',
				coloursStyle = document.querySelector("head > #ext-custom-colour");

			for (var property in customcolor)
				if (customcolor[property])
					style += getStyle("customcolor/" + property);

			// Update existing style.
			if (coloursStyle)
				coloursStyle.textContent = style;
			// Create new style.
			else {
				coloursStyle = document.createElement("style");
				coloursStyle.setAttribute("type", "text/css");
				coloursStyle.setAttribute("id", "ext-custom-colour");
				coloursStyle.appendChild(document.createTextNode(style));
				document.querySelector("head").appendChild(coloursStyle);

				log.info("Custom colours are enabled.");
			}
		},
		/**
		 * Replace logo on page with transparent one.
		 */
		customLogo: function customLogo() {
			var logoStyle = document.querySelector("head > #ext-custom-logo");
			if (logoStyle)
				return;

			logoStyle = document.createElement("style");
			logoStyle.setAttribute("type", "text/css");
			logoStyle.setAttribute("id", "ext-custom-logo");
			logoStyle.appendChild(document.createTextNode(getStyle("customlogo")));
			document.querySelector("head").appendChild(logoStyle);

			log.info("Logo is replaced with custom one.");
		},
		/**
		 * Add user defined style to page.
		 *
		 * @param {string} [data]
		 * Style to be added to page. If this argument is missing or is not string,
		 * style defined in <a href="/options.html#preferences/css">Custom CSS</a>
		 * will be added.
		 */
		customStyle: function customStyle(data) {
			if (typeof data != "string")
				data = preferences.customstyle;

			var customStyle = document.querySelector("head > #ext-custom-style");
			// Update existing style.
			if (customStyle)
				customStyle.textContent = data;
			// Create new style.
			else {
				customStyle = document.createElement("style");
				customStyle.setAttribute("type", "text/css");
				customStyle.setAttribute("id", "ext-custom-style");
				customStyle.appendChild(document.createTextNode(data));
				document.querySelector("head").appendChild(customStyle);

				log.info("Custom style is enabled.");
			}
		},
		/**
		 * Add user defined style to page. This style will be applied only when
		 * Opera is in full screen mode.
		 *
		 * @param {string} [data]
		 * Style to be added to page. If this argument is missing or is not string,
		 * predefined style will be added.
		 */
		fullScreenStyle: function addFullScreenStyle(data) {
			if (typeof data != "string")
				data = getStyle("fullscreen");

			data = "@media projection {\n" + data + "\n}";

			var fullscreenStyle = document.querySelector("head > #ext-fullscreen-style");
			// Update existing style.
			if (fullscreenStyle)
				fullscreenStyle.textContent = data;
			// Create new style.
			else {
				fullscreenStyle = document.createElement("style");
				fullscreenStyle.setAttribute("type", "text/css");
				fullscreenStyle.setAttribute("id", "ext-fullscreen-style");
				fullscreenStyle.appendChild(document.createTextNode(data));
				document.querySelector("head").appendChild(fullscreenStyle);

				log.info("Full screen style is enabled.");
			}
		},
		/**
		 * Enable/disable light icons on buttons added by {@link xtt.ui.add} methods.
		 *
		 * @param {Boolean} [enable = false]
		 * <code>true</code> - enable; <code>false</code> - disable.
		 */
		lightIcons: function lightIcons(enable) {
			if (enable) {
				document.body.classList.add("ext-light-icon");

				log.info("Light icons for extension’s buttons are enabled.");
			}
			else {
				document.body.classList.remove("ext-light-icon");

				log.info("Light icons for extension’s buttons are disabled.");
			}
		},
		/**
		 * Pop out player out of page’s content flow or move it back.
		 *
		 * @param {Boolean} [popout = false]
		 * Whether to pop player out of page’s normal content flow
		 * (<code>true</code>) or to move it back into flow (<code>false</code>).
		 */
		popoutPlayer: function applyPopoutPlayer(popout) {
			var watch = document.querySelector("div#watch-player, div#watch7-player, div.player-container");
			if (!watch)
				return;

			if (popout) {
				var popoutCss = getStyle("popout"),
					popoutStyle = document.querySelector("head > #ext-player-pop-out");

				if (preferences.fullscreenstyle)
					popoutCss = "@media screen {\n" + popoutCss + "\n}";

				// Add pop out player style to document.
				if (!popoutStyle) {
					popoutStyle = document.createElement("style");
					popoutStyle.setAttribute("type", "text/css");
					popoutStyle.setAttribute("id", "ext-player-pop-out");
					popoutStyle.appendChild(document.createTextNode(popoutCss));
					document.querySelector("head").appendChild(popoutStyle);
				}
				else
					popoutStyle.textContent = popoutCss;

				document.body.classList.add("ext-popout-player");
				watch.addEventListener("click", popoutPlayer, false);

				log.warn("Player is popped out of normal page flow.");
			}
			else {
				document.body.classList.remove("ext-popout-player");
				watch.removeEventListener("click", popoutPlayer, false);

				log.info("Player is returned back to its original position.");
			}
		},
		/**
		 * Toggle state of options defined in
		 * <a href="/options.html#preferences/cleanup">Page Clean-up</a>.
		 *
		 * @param {boolean} hide
		 * If this argument is <code>true</code> it will toggle between hide all and
		 * respect preferences. If it's <code>false</code>it will toggle between
		 * show all and respect preferences. <cite>Hide all</cite> means pretend  that
		 * all options in <a href="/options.html#preferences/cleanup">Page Clean-up</a>
		 * section are set, while <cite>show all</cite> means pretend that all are
		 * unset.
		 */
		toggleHideAll: function (hide) {
			var data = {};
			for (var property in preferences.cleanwatch)
				data[property] = hide;

			if (hide && hidden > 0 || !hide && hidden < 0) {
				data = preferences.cleanwatch;
				hidden = 0;
			}
			else if (hide)
				hidden = 1;
			else
				hidden = -1;

			this.cleanPage(data);
		},
		/**
		 * Expand or collapse container that holds lyrics (show/hide lyrics).
		 */
		toggleLyrics: function () {
			if (/hidden/.test(references.lyricsBody.getAttribute("class")))
				expandLyricsContainer();
			else
				collapseLyricsContainer();
		}
	};

	/**
	 * Methods used to remove elements added by {@link xtt.ui.add}
	 * and {@link xtt.ui.apply}.
	 *
	 * @namespace xtt.ui.remove
	 */
	xtt.ui.remove = /** @lends xtt.ui.remove */ {
		/**
		 * Call all methods defined in <code>this</code> class (except self). This
		 * will remove all elements added by {@link xtt.ui.add} and revert
		 * everything applied by {@link xtt.ui.apply}.
		 */
		all: function () {
			this.customColors();
			this.customLogo();
			this.customStyle();
			this.downloadButton();
			this.extraButtons();
			this.loopButtons();
			this.lyrics();
			this.pageCleanUp();
			this.popoutButton();
			this.popoutPlayer();
			this.preferencesButton();
			this.thumbPreview(true);
			this.videoRatings();
		},
		/**
		 * Remove style that redefines colours on page
		 * (added by {@link xtt.ui.apply.customColors}).
		 */
		customColors: function removeCustomColors() {
			var customColors = document.querySelector("head > #ext-custom-colour");
			if (customColors) {
				removeElement(customColors);

				log.info("Custom colours are disabled.");
			}
		},
		/**
		 * Remove custom logo added by {@link xtt.ui.apply.customLogo}.
		 */
		customLogo: function removeCustomLogo() {
			var customLogo = document.querySelector("head > #ext-custom-logo");
			if (customLogo) {
				removeElement(customLogo);

				log.info("Custom logo is removed from page.");
			}
		},
		/**
		 * Remove custom styles added by {@link xtt.ui.apply.customStyle}.
		 */
		customStyle: function removeCustomStyle() {
			var customStyle = document.querySelector("head > #ext-custom-style");
			if (customStyle) {
				removeElement(customStyle);

				log.info("Custom style is disabled.");
			}
		},
		/**
		 * Remove custom styles added by {@link xtt.ui.apply.fullScreenStyle}.
		 */
		fullScreenStyle: function removeFullScreenStyle() {
			var fullscreenStyle = document.querySelector("head > #ext-fullscreen-style");
			if (fullscreenStyle) {
				removeElement(fullscreenStyle);

				log.info("Full screen style is disabled.");
			}
		},
		/**
		 * Remove button added by {@link xtt.ui.add.downloadButton}.
		 */
		downloadButton: function removeDownloadButton() {
			if (references.downloadButton) {
				removeElement(references.downloadButton);
				references.downloadButton = null;
				references.downloadMenu = null;
				restoreMovedElements();

				log.info("Download button is removed from page.");
			}
		},
		/**
		 * Remove buttons added by {@link xtt.ui.add.extraButtons}.
		 */
		extraButtons: function removeExtraButtons() {
			if (references.extraContainer) {
				removeElement(references.extraContainer);
				references.extraContainer = null;
				restoreMovedElements();

				log.info("Seek back/forward and frame step buttons are removed from page.");
			}
		},
		/**
		 * Remove buttons added by {@link xtt.ui.add.loopButtons}.
		 */
		loopButtons: function removeLoopButtons() {
			if (references.loopContainer) {
				removeElement(references.loopContainer);
				references.loopContainer = null;
				restoreMovedElements();

				log.info("Loop button (along with mark section buttons) is removed from page.");
			}
		},
		/**
		 * Remove container which holds lyrics added by
		 * {@link xtt.ui.add.lyricsContainer}.
		 */
		lyrics: function removeLyrics() {
			if (references.lyricsContainer) {
				removeElement(references.lyricsContainer);
				references.lyricsContainer = null;

				log.info("Container that is meant to display lyrics is removed from page.");
			}
		},
		/**
		 * Remove clean-up style added by {@link xtt.ui.apply.cleanPage}.
		 */
		pageCleanUp: function () {
			removeElement(document.querySelector("head > #ext-page-clean-up"));
		},
		/**
		 * Remove button added by {@link xtt.ui.add.popoutButton}.
		 */
		popoutButton: function removePopoutButton() {
			if (references.popoutButton) {
				removeElement(references.popoutButton);
				references.popoutButton = null;
				restoreMovedElements();

				log.info("Pop-out button is removed from page.");
			}
		},
		/**
		 * Return player back in it’s original place and remove style
		 * added by {@link xtt.ui.apply.popoutPlayer}.
		 */
		popoutPlayer: function () {
			xtt.ui.apply.popoutPlayer(false);
			removeElement(document.querySelector("head > #ext-player-pop-out"));
		},
		/**
		 * Remove button added by {@link xtt.ui.add.preferencesButton}.
		 */
		preferencesButton: function removePreferencesButton() {
			if (references.preferencesButton) {
				removeElement(references.preferencesButton);
				references.preferencesButton = null;
				restoreMovedElements();

				log.info("Preferences button is removed from page.");
			}
		},
		/**
		 * Remove interfaces (triggers) for video preview.
		 *
		 * @param {Boolean} [removePreview = false]
		 * Remove embedded previews (if some are activated).
		 */
		thumbPreview: function removeThumbnailPreview(removePreview) {
			var thumb = document.querySelectorAll("a[href*=\"/watch?\"], a[href*=\"/user/\"]");

			Array.prototype.forEach.call(thumb, function (element) {
				var addto = element.querySelector(".addto-button, .addto-container");
				if (!addto)
					return;

				if (removePreview) {
					var preview = element.querySelector("iframe");
					if (preview) {
						preview.parentNode.classList.remove("ext-preview-container");
						removeElement(preview);
					}
				}

				removeElement(element.querySelector(".ext-thumb-preview"));
				removeElement(element.querySelector(".ext-addto"));
				element.removeEventListener("mouseenter", enterPreview, false);
				element.removeEventListener("mouseleave", leavePreview, false);

				addto.classList.remove("ext-hidden");
				element.classList.remove("ext-preview-enabled");
				element.classList.remove("ext-preview-active");
			});

			var loadMore = document.querySelectorAll("#watch-more-from-user, #watch-more-related, #watch-sidebar .watch-sidebar-body, #feed, .gh-single-playlist");
			Array.prototype.forEach.call(loadMore, function (node) {
				node.removeEventListener("DOMNodeInserted", xtt.ui.add.thumbPreview, false);
			});

			log.info("Interfaces for video preview removed from document.");
		},
		/**
		 * Remove ratings added by {@link xtt.ui.add.videoRatings}.
		 */
		videoRatings: function () {
			var loadMore = document.querySelectorAll("#watch-more-from-user, #watch-more-related, #watch-sidebar .watch-sidebar-body, #feed, .gh-single-playlist");
			Array.prototype.forEach.call(loadMore, function (node) {
				node.removeEventListener("DOMNodeInserted", xtt.ui.add.videoRatings, false);
			});

			Array.prototype.forEach.call(document.querySelectorAll(".ext-video-rating"), removeElement);

			log.info("Ratings are removed from video thumbnails.");
		}
	};

	/**
	 * Holds information about playing video and methods to extract them.
	 *
	 * @namespace xtt.video
	 */
	xtt.video = /** @lends xtt.video */ {
		/**
		 * Video ID.
		 *
		 * @type String
		 *
		 * @private
		 */
		id: '',
		/**
		 * Indicate that video is part of a channel.
		 *
		 * @type Boolean
		 * @readonly
		 */
		isChannel: /^\/user\//.test(window.location.pathname),
		/**
		 * Indicate that video is Iframe embedded video or YouTube pop-up video
		 * (page that opens after user right clicks on flash player and choose
		 * option <cite>Pop out</cite>).
		 *
		 * @type Boolean
		 * @readonly
		 */
		isEmbedded: /^(\/embed\/|\/watch_popup)/.test(window.location.pathname),
		/**
		 * Indicate that video is part of a play list.
		 *
		 * @type Boolean
		 * @readonly
		 */
		isPlaylist: /\blist=/.test(window.location.search),
		/**
		 * Indicate that video is part of a YouTube pop-up page. When this property
		 * is <code>true</code> {@link xtt.video.isEmbedded} is also
		 * <code>true</code>.
		 *
		 * @type Boolean
		 * @readonly
		 */
		isPopup: /^\/watch_popup$/.test(window.location.pathname),
		/**
		 * Indicate that video is part of a YouTube pop-up page which itself is part
		 * of video thumbnail preview. When this property is <code>true</code>
		 * {@link xtt.video.isEmbedded} and {@link xtt.video.isPopup} are also
		 * <code>true</code>.
		 *
		 * @type Boolean
		 * @readonly
		 */
		isPreview: /\/watch_popup\?.+&feature=xtt_preview/.test(window.location.href),
		/**
		 * Indicate that video is part of a regular YouTube page.
		 *
		 * @type Boolean
		 * @readonly
		 */
		isWatch: /^\/watch$/.test(window.location.pathname),
		/**
		 * Video length (in seconds).
		 *
		 * @type Number
		 * @readonly
		 */
		length: 0,
		/**
		 * List of available video qualities with download links. This information
		 * will be used to construct download menu.
		 *
		 * @type Array
		 *
		 * @private
		 */
		urlmap: [],
		/**
		 * Change player parameters to hide ads and customise player.
		 *
		 * @param {String|Object} data
		 * Value of <cite>flashvars</cite> attribute of flash player or object used
		 * to construct <cite>flashvars</cite> attribute.
		 *
		 * @returns {String|Object}
		 * Modified version of passed argument.
		 *
		 * @private
		 */
		changeConfig: function changeConfig(data) {
			// “swf_args” object used to construct flashvars attribute.
			if (data && typeof data == "object") {
				if (typeof data != "object") {
					log.warn("An error occurred while trying to hide in-video ads. Player data not found.");
					return;
				}

				// Remove in-video ads.
				if (preferences.hideplayerads || this.isPreview) {
					for (var property in data)
						if (/^(ad\d?_.+|watermark)/.test(property))
							delete data[property];

					log.info("In-video ads disabled.");
				}

				// Hide video annotations.
				if (preferences.hideannotations || this.isPreview) {
					data.iv_load_policy = 3;

					log.info("Annotations will be hidden.");
				}
				// Show player controls.
				data.controls = 1;
				// Set auto-hide player controls option.
				data.autohide = preferences.hidecontrols;
				// Set player theme.
				data.theme = preferences.playertheme;
				// Set player progress colour.
				data.color = preferences.progresscolor;
				// Set desired quality
				if (preferences.videoquality != "default")
					data.vq = preferences.videoquality;
				if (preferences.exposeplayershortcuts && preferences.disableflashshortcuts)
					data.disablekb = 1;

				// Enable YouTube’s javascript API.
				data.enablejsapi = 1;

				if (typeof data.jsapicallback == "function")
					self.jsapicallback = data.jsapicallback;
				data.__defineGetter__("jsapicallback", function () {
					return window.onYouTubePlayerReady;
				});
				data.__defineSetter__("jsapicallback", function (value) {
					self.jsapicallback = value;
				});

				if (/#!?t=(\d+)/.exec(window.location.hash))
					data.start = RegExp.$1;
				else if (/#!?at=((\d+h)?\d{1,2}m)?\d{1,2}s/.exec(window.location.hash)) {
					data.start = 0;
					var start = window.location.hash.split('=')[1].slice(0, -1).split(/h|m/),
						item, multiplier = 1;
					while (item = start.pop()) {
						data.start += item * multiplier;
						multiplier *= 60;
					}
				}

				if (data.start && data.start > data.length_seconds)
					delete data.start;

				if (this.isPreview) {
					log.warn("Thumbnail preview video detected. Controls will be hidden.");

					data.iv_load_policy = 3;
					data.controls = 0;
					data.el = "popout";
					data.autoplay = 1;
					data.vq = "medium";
					data.showinfo = 0;
				}
			}
			else {
				log.warn("Argument from which ads should be removed is not Object.",
					"Data is: " + data + '.'
				);
				return data;
			}

			log.info("Player data modified.");
			return data;
		},
		/**
		 * Extract video information from plug-in parameters (for flash player) or
		 * from player configuration object.
		 *
		 * @param {Strong|Object} data
		 * String or object in which to search for video information.
		 *
		 * @private
		 */
		extractData: function extractVideoData(data) {
			// “swf_args” object used to construct flashvars attribute.
			if (data && typeof data == "object") {
				if (!("args" in data)) {
					log.warn("An error occurred while trying to extract video data.",
						"\ndata:",
						data
					);
					return;
				}

				var args = data.args;

				if (!this.id || this.id.indexOf(args.video_id) < 0)
					this.id = args.video_id + '@' + Date.now();
				if (data.html5)
					this.id += "&html5";
				if (this.isEmbedded)
					this.id += "&embedded";
				if (this.isPreview)
					this.id += "&preview";

				if ("url_encoded_fmt_stream_map" in args)
					this.urlmap = decodeStreamMap(args.url_encoded_fmt_stream_map);

				this.length = parseInt(args.length_seconds, 10);

				if (this.urlmap.length == 0) {
					log.warn("Cannot get list of video URLs. Download menu may be empty.",
						"\nargs:",
						args
					);
				}

				this.changeConfig(args);
			}
			else {
				log.warn("Argument from which video data should be extracted is not Object.",
					"Data is: " + data + '.'
				);
			}

			xtt.player.loopSection.disable();
			xtt.lyrics.reset();
			updateDownloadMenu();

			return data;
		},
		/**
		 * Get ID of currently playing video.
		 *
		 * @returns {String}
		 * ID of current video.
		 */
		getVideoID: function () {
			var id = this.id.replace(/@.+/, '');
			if (!id) {
				id = window.location.search.match(/(\?|&)v=([^&]+)/);
				if (id && id[2])
					id = id[2];
			}

			return id;
		},
		/**
		 * Get size of currently playing video. For flash videos predefined
		 * resolution is returned which may not be accurate. For HTML 5 videos real
		 * resolution is returned.
		 *
		 * @returns {Object}
		 * Object with information about video resolution. Returned object will have
		 * <cite>width</cite>, <cite>height</cite> and <cite>ratio</cite> properties.
		 */
		getVideoSize: function () {
			var videoSize = { width: 0, height: 1 };

			if (this.ishtml5) {
				var video = document.querySelector("video");
				videoSize.width = video.videoWidth;
				videoSize.height = video.videoHeight;
			}
			else {
				var quality = xtt.player.playerElement.getPlaybackQuality(),
					size = {
						small: { width: 320, height: 240 },
						medium: { width: 640, height: 360 },
						large: { width: 854, height: 480 },
						hd720: { width: 1280, height: 720 },
						hd1080: { width: 1920, height: 1080 },
						highres: { width: 4096, height: 3072 }
					};

				if (quality in size)
					videoSize = size[quality];
			}

			videoSize.ratio = videoSize.width / videoSize.height;
			return videoSize;
		},
		/**
		 * Get title of currently playing video.
		 *
		 * @returns {String}
		 * Title of current video.
		 */
		getVideoTitle: function () {
			var title = document.querySelector("#watch-headline-title, .title .yt-uix-sessionlink");
			if (title)
				title = title.textContent;
			if (!title)
				title = document.title.replace(/^YouTube\s-\s|\s-\sYouTube$/g, '');

			return title.trim();
		},
		/**
		 * Get URI of currently playing video.
		 *
		 * @param {Boolean} [encode = false]
		 * Return URI as URI-encoded string.
		 *
		 * @returns {String}
		 * URI of current video.
		 */
		getVideoURI: function (encode) {
			var uri = window.location.protocol + "//" + window.location.hostname;
			uri += "/watch?v=" + this.getVideoID();

			if (this.ishtml5)
				uri += "&html5=True";

			if (encode)
				uri = encodeURIComponent(uri);

			return uri;
		}
	};
	/**
	 * Says if video is 3D video.
	 *
	 * @type Boolean
	 * @readonly
	 */
	xtt.video.__defineGetter__("is3d", function() {
		if (yt.config_ && yt.config_.IS_3D_VIDEO)
			return true;
		return false;
	});
	/**
	 * Says if video is HTML 5 video.
	 *
	 * @type Boolean
	 * @readonly
	 */
	xtt.video.__defineGetter__("ishtml5", function() {
		return yt.playerConfig.html5;
	});

	return xtt;
}

/**
 * Contains methods that can be used to log debug messages to error console.
 */
function makeLogApi() {
	return {
		/**
		 * Message buffer.
		 *
		 * @type Array
		 */
		buffer: [
			{
				msgc: 0,
				time: Date.now(),
				mesg: "general: Message log started.",
				type: " i "
			},
			{
				msgc: 1,
				time: Date.now(),
				mesg: "general: Injected scripts will execute on " + window.location.href + '.',
				type: " i "
			}
		],
		/**
		 * Used as <cite>source of message</cite> when printing message to error
		 * console.
		 *
		 * @type String
		 */
		source: "ExtendTube\n‾‾‾‾‾‾‾‾‾‾",
		/**
		 * Log error message. All passed arguments will be separated with space.
		 * Acyclic objects will be converted to JSON format and then printed.
		 *
		 * @param {Any} arg1[,arg2[,...]]
		 * Arguments of any type.
		 */
		error: function () {
			var mesg = reduce.apply(log, arguments).trim("\n");
			mesg = getCallerName() + ": " + mesg;
			log.pushmesg(mesg, "{E}");

			if (preferences.loglevel > 0)
				console.error(log.source + "\n" + '[' + formatTime(log.buffer[0].time, log.buffer[log.buffer.length - 1].time) + "] " + mesg + "\n");
		},
		/**
		 * Same as {@link log.error} but also logs message to Error console
		 * regardless of <cite>loglevel</cite> option from preferences.
		 */
		Error: function () {
			var loglevel = preferences.loglevel;
			preferences.loglevel = 3;
			log.error.apply(log, arguments);
			preferences.loglevel = loglevel;
		},
		/**
		 * Log info message. All passed arguments will be separated with space.
		 * Acyclic objects will be converted to JSON format and then printed.
		 *
		 * @param {Any} arg1[,arg2[,...]]
		 * Arguments of any type.
		 */
		info: function () {
			var mesg = reduce.apply(log, arguments).trim("\n");
			mesg = getCallerName() + ": " + mesg;
			log.pushmesg(mesg, " i ");

			if (preferences.loglevel > 2)
				console.info(log.source + "\n" + '[' + formatTime(log.buffer[0].time, log.buffer[log.buffer.length - 1].time) + "] " + mesg + "\n");
		},
		/**
		 * Same as {@link log.info} but also logs message to Error console
		 * regardless of <cite>loglevel</cite> option from preferences.
		 */
		Info: function () {
			var loglevel = preferences.loglevel;
			preferences.loglevel = 3;
			log.info.apply(log, arguments);
			preferences.loglevel = loglevel;
		},
		/**
		 * Push message to the message buffer.
		 *
		 * @param {String} mesg
		 * Message to be added to buffer.
		 *
		 * @param {String} type
		 * Type of message (" i " - info, "'w'" - warning or "{E}" - error).
		 */
		pushmesg: function (mesg, type) {
			log.buffer.push({
				msgc: log.buffer.length,
				time: Date.now(),
				mesg: mesg,
				type: type
			});
		},
		/**
		 * Log warning message. All passed arguments will be separated with
		 * space. Acyclic objects will be converted to JSON format and then
		 * printed.
		 *
		 * @param {Any} arg1[,arg2[,...]]
		 * Arguments of any type.
		 */
		warn: function () {
			var mesg = reduce.apply(log, arguments).trim("\n");
			mesg = getCallerName() + ": " + mesg;
			log.pushmesg(mesg, "'w'");

			if (preferences.loglevel > 1)
				console.warn(log.source + "\n" + '[' + formatTime(log.buffer[0].time, log.buffer[log.buffer.length - 1].time) + "] " + mesg + "\n");
		},
		/**
		 * Same as {@link log.warn} but also logs message to Error console
		 * regardless of <cite>loglevel</cite> option from preferences.
		 */
		Warn: function () {
			var loglevel = preferences.loglevel;
			preferences.loglevel = 3;
			log.warn.apply(log, arguments);
			preferences.loglevel = loglevel;
		}
	}
}
/**
 * Make POST data for fetching video ratings.
 *
 * @see http://code.google.com/apis/youtube/2.0/developers_guide_protocol_activity_feeds.html
 *
 * @param {Array} list
 * List of video IDs.
 */
function makePostData(list) {
	var entry = '';
	list.forEach(function (id) {
		entry += "\
	<entry>\n\
		<id>http://gdata.youtube.com/feeds/api/videos/" + id + "</id>\n\
	</entry>\n";
	});

	return "\
<feed xmlns=\"http://www.w3.org/2005/Atom\"\n\
	xmlns:batch=\"http://schemas.google.com/gdata/batch\">\n\
	<batch:operation type=\"query\"/>\n" +
	entry + "\
</feed>";
}

/**
 * Make room for new buttons (move view count and statistic button to the left).
 *
 * @param {HTMLDivElement} node
 * Reference to container element in which buttons will be added.
 */
function makeRoom(node) {
	// Function not called by extension. It’s called by user.
	if (node != document.querySelector("#watch-actions-right"))
		return;

	room = node;
	// Some buttons are already added. No need to make room again.
	if (room.parentNode.querySelector(".ext-button"))
		return;

	var el = null,
		i = room.children.length - 1;
	while (el = room.children.item(i--)) {
		room.parentNode.appendChild(el);
		roomElements.push(el);
	}

	log.warn("Some elements are moved to make room for extension’s buttons.");
}

/**
 * Event listener for <cite>click</cite> event on <em>try manual</em> button.
 * Show interface for manual input of artist and title.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function manualSearch(event) {
	removeElement(this);
	logLyricsSearchMessage(xtt.ll.getString("LYRICS_TITLE_INFO"));
	logLyricsSearchMessage(xtt.ll.getString("LYRICS_TITLE_INFO_EX"));

	var input = references.lyricsManualForm.querySelector("input");
	references.lyricsManualForm.classList.remove("ext-hidden");
	input.focus();
	input.setAttribute("value", xtt.video.getVideoTitle());

	var fs = window.getComputedStyle(references.lyricsManualForm),
		bs = window.getComputedStyle(references.lyricsManualForm.querySelector("button")),
		is = window.getComputedStyle(input);

	is = parseInt(is.borderRightWidth) * 2 + parseInt(is.paddingRight) * 2;
	bs = parseInt(bs.paddingRight) * 2 + parseInt(bs.width);

	input.style.width = (parseInt(fs.width) - bs + is).toString() + "px";
}

/**
 * Event listener for <cite>click</cite> event on <em>mark loop end</em> button.
 * Mark section end time.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function markSectionEnd(event) {
	xtt.player.loopSection.endTime("mark");
}

/**
 * Event listener for <cite>click</cite> event on <em>mark loop start</em>
 * button. Mark section start time.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function markSectionStart(event) {
	xtt.player.loopSection.startTime("mark");
}

/**
 * Event listener for <cite>message</cite> event.
 * It listens only on channel opened by pop-up.
 *
 * @param {MessageEvent} event
 * Event object.
 */
function messageFromPopup(event) {
	switch (event.data.subject) {
		case "playback control":
			log.info("A command to video player is issued from pop-up.",
				"Command is: " + event.data.data.exec + '.'
			);

			xtt.player.control(event.data.data.exec, event.data.data.position);
			break;
		case "status report":
			sendStatus();
			break;
		case "focus self":
			window.focus();
			break;
		case "close self":
			if (window == window.parent)
				window.close();
			else
				window.location.href = "about:blank";
	}
}

/**
 * Event listener for <cite>message</cite> event.
 *
 * @param {MessageEvent} event
 * Event object.
 */
function messageReceived(event) {
	switch (event.data.subject) {
		case "player action":
			xtt.player.control(event.data.data.exec);
			break;
		case "auto play":
			log.info("Received autoplay message from background process.",
				"Autoplay is: " + event.data.data.autoplay + '.'
			);

			xtt.player.autoplay = event.data.data.autoplay;
			handleAutoPlay();
			break;
		case "player ready":
			xtt.player.ready = true;
			log.info("Background process acknowledges “player ready” message.");

			handleAutoPlay();

			runActions("player ready");
			break;
		case  "connection to popup":
			popup = event.ports[0];
			popup.addEventListener("message", messageFromPopup, false);
			popup.start();

			log.info("Connection with pop-up established.");

			popup.postMessage({
				subject: "video info",
				data: {
					id: xtt.video.id,
					title: xtt.video.getVideoTitle(),
					length: xtt.video.length
				}
			});
			break;
		case "popup closed":
			popup = null;

			log.info("Connection with pop-up is broken.");
			break;
		case "give me info":
			if (xtt.video.id && xtt.player.playerElement) {
				sendMessage("add tab",
					{
						title: xtt.video.getVideoTitle(),
						state: xtt.player.state
					}
				);
			}
			break;
		case "echo request":
			sendMessage("echo replay");
			break;
		case "external resource loaded":
			if (event.data.data.about == "lyrics")
				parseResponse(event.data.data);
			else if (event.data.data.about == "ratings")
				updateRatings(extractVideoInfo(event.data.data.xml));
			break;
		case "set preferences":
			log.info("Preferences are received from background process.");

			preferenceChanged(event.data);
			break;
		case "background process started":
			sendMessage("hello");
			sendMessage("player state changed", { state: xtt.player.state });
			break;
		case "give me message log":
			sendLog();
			break;
		case "preview state":
			updateThumbPreviewButton(event.data.data.id, event.data.data.state);
			break;
		case "preview time":
			updateThumbPreviewTime(event.data.data.id, event.data.data.time);
			break;
		case "disable video peview":
			disableThumbPreview(event.data.data.id);
	}
}

/**
 * Main function that modifies page.
 *
 * @param {Boolean} skipLanguage
 * Says if language is already set earlier.
 */
function modifyDocument(skipLanguage) {
	var elem = document.querySelector("#watch-actions-right, .channels-featured-video-details .view-count-and-actions, #watch7-content");
	// Don’t run more than once.

	if (docModified || !elem)
		return;
	docModified = true;

	// Set language
	if (!skipLanguage) {
		var lang = document.body.getAttribute("class");
		if (lang && lang.match(/[a-z]{2,3}_[A-Z]{2}/))
			xtt.ll.setLanguage(lang.match(/[a-z]{2,3}_[A-Z]{2}/)[0]);
	}

	var war = elem,
		wi = document.querySelector("#watch-info"),
		where = "afterbegin";
	// Channels and cosmic panda.
	if (elem.id != "watch-actions-right") {
		war = document.createElement("div");
		war.setAttribute("id", "watch-actions-right");
		war.classList.add("ext-actions-right");
		elem.insertBefore(war, elem.firstChild);
		wi = document.querySelector("#watch7-headline");
		where = "beforebegin";
	}
	// Add buttons.
	if (preferences.prefbutton)
		xtt.ui.add.preferencesButton(war);
	if (preferences.enabledownload)
		xtt.ui.add.downloadButton(war);
	if (preferences.loopbutton)
		xtt.ui.add.loopButtons(war);
	if (preferences.extrabuttons)
		xtt.ui.add.extraButtons(war);
	if (preferences.enablepopout)
		xtt.ui.add.popoutButton(war);
	// Add lyrics container.
	if (preferences.lyrics)
		xtt.ui.add.lyricsContainer(where, wi);
	// Customize page.
	if (preferences.uselighticons)
		xtt.ui.apply.lightIcons(true);

	log.info("Document modified.");

	runActions("doc modified");
}

/**
 * Parse lyrics data.
 *
 * @param {String} data.text
 * Lyrics data as (HTML) string.
 *
 * @param {String} data.xml
 * Lyrics data as XML string.
 */
function parseLyrics(data) {
	log.info("Trying to parse lyrics data.");

	status = "lyrics";
	info = xtt.ll.getString("LYRICS_PARSE_LYRICS");
	fireEvent();

	var tree = document.createElement("tree");
	tree.insertAdjacentHTML("afterbegin", data.text);

	var lyricsFragment = tree.querySelector("div.lyricbox");
	if (lyricsFragment) {
		var junk = lyricsFragment.querySelectorAll(".rtMatcher, i, p"),
			licensed = false;
		Array.prototype.forEach.call(junk, function (element) {
			if (element.textContent.indexOf("not licensed") > 0)
				licensed = true;

			element.parentNode.removeChild(element);
		});

		if (licensed) {
			licensed = "Full lyrics cannot be shown because they are protected by license.";
			lyricsFragment.insertAdjacentHTML("beforeend", "<em>" + licensed + "</em>");

			log.warn(licensed);
		}

		log.info("Lyrics successfully parsed.");

		lyrics = lyricsFragment;
		status = "loaded";
		info = xtt.ll.getString("LYRICS_PARSE_SUCCESS");
		fireEvent();
	}
	else {
		log.warn("An error occurred while trying to parse lyrics.",
			"Cannot find “div.lyricbox” element."
		);

		status = "error";
		info = xtt.ll.getString("LYRICS_PARSE_ERROR");
		fireEvent();
	}
}

/**
 * Parse response to last search request.
 *
 * @param {Object} data
 * Data to be parsed.
 */
function parseResponse(data) {
	if (status == "search")
		parseSearchResults(data);
	else if (status == "found")
		parseLyrics(data);
}

/**
 * Parse search results.
 *
 * @param {String} data.text
 * Search results as string.
 *
 * @param {String} data.xml
 * Search results as XML string.
 */
function parseSearchResults(data) {
	log.info("Parsing search results.");

	status = "parsing";
	info = xtt.ll.getString("LYRICS_PARSE_SEARCH");
	fireEvent();

	var parser = new window.DOMParser();
	data.xml = parser.parseFromString(data.xml, "text/xml");

	var lyrics = data.xml.querySelector("lyrics");
	if (lyrics === null || lyrics.textContent.trim() == "Not found") {
		status = "continue";
		info = xtt.ll.getString("LYRICS_SEARCH_NO_RESULT").replace("%song", current.artist + " - " + current.title);
		fireEvent();

		// Try other combination if any.
		if (list.length) {
			log.warn("No results. Trying other combinations.");

			current = list.shift();
			searchLyrics(current);
		}
		// Lyrics are not found.
		else {
			log.warn("Search for lyrics is completed without results. No more combination to try.");

			status = "notfound";
			info = xtt.ll.getString("LYRICS_SEARCH_NOT_FOUND");
			fireEvent();
		}
	}
	else {
		log.info(
			"Bingo! Lyrics are found for artist “" + current.artist + "” and title “" + current.title + "”.",
			"Trying to download them."
		);

		status = "found";
		info = xtt.ll.getString("LYRICS_SEARCH_FOUND");
		fireEvent();

		current.artist = data.xml.querySelector("artist").textContent;
		current.title = data.xml.querySelector("song").textContent;
		// Lyrics exist. Send new request to get them.
		var uri = data.xml.querySelector("url").textContent;
		sendMessage("load external resource",
			{
				uri: uri,
				method: "get",
				about: "lyrics"
			}
		);
	}
}

/**
 * Try to find song artist and title.
 *
 * @param {String} [song]
 * String in which to search for artist and title.
 */
function parseVideoTitle(song) {
	// Search from video title if user didn’t provided song manually.
	if (!song) {
		log.info("Trying to extract artist and title from video title.",
			"Video title is: " + xtt.video.getVideoTitle() + '.'
		);

		song = xtt.video.getVideoTitle().replace(/\([^\)]+\)|\[[^\]]+\]|\{[^\}]+\}/g, '');
		song = song.replace(/official\s{0,}(music)?\s{0,}video/i, '').trim();
		song = song.replace(/(with)?\s+lyrics/i, '').trim();
		// On some pages artist can be found in video description.
		artist = document.querySelector("#watch-info a[href*=\"artist\"] .link-like");
		if (artist && artist.textContent) {
			artist = artist.textContent.replace(/\([^\)]+\)|\[[^\]]+\]|\{[^\}]+\}/g, '').trim();

			log.info("Artist is found in video description. Artist is: " + artist + '.');
		}
	}
	else {
		log.info("Trying to extract artist and title from: " + song + '.');

		artist = null;
	}

	// Split artist and title.
	song = song.split(/\s-\s|\s-|[:\-]\s/);
	if (artist)
		song = song.filter(function (el) {
			// Remove artist from list.
			if (el.toLowerCase().indexOf(artist.toLowerCase()) > -1)
				return false;
			return true;
		});

	// Remove empty strings from list.
	song = song.filter(function (el) { return !/^\s*$/.test(el); });

	// Video title is chunked. Now extract artist/title.
	var extract = extractSong(song);

	if (extract)
		log.info("Possible “artist - title” combinations found.", list);
	else
		log.warn("Artist and title cannot be extracted from video title.");

	return extract;
}

/**
 * Event listener for <cite>pluginInitialized</cite> event.
 *
 * @param {UserJSEvent} event
 * Event object.
 */
function pluginInitialized(event) {
	// Inform background process that there is new video.
	sendMessage("add tab", {
		title: xtt.video.getVideoTitle(),
		state: xtt.player.state
	});
	runActions("pluginInitialised");
}

/**
 * Event listener for <cite>click</cite> event on <em>pop-out player</em> button.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function popoutPlayer(event) {
	if (event.currentTarget == event.target)
		xtt.ui.apply.popoutPlayer(!document.querySelector("body.ext-popout-player"));

	// Remove focus from button so keyboard shortcuts (like “Space”) can work.
	if (this.nodeName.toLowerCase() == "button")
		this.blur();
}

/**
 * Event listener for custom <cite>preferences</cite> event.
 * This function will be used to update page when some preferences are changed.
 *
 * @param {CustomEvent} event
 * Event object.
 */
function preferenceChanged(data) {
	self.preferences[data.key] = data.data[data.key];

	switch (data.key) {
		case "enabledownload":
			if (data.data[data.key])
				xtt.ui.add.downloadButton(document.getElementById("watch-actions-right"));
			else
				xtt.ui.remove.downloadButton();
			break;
		case "usefallbacklinks":
			updateDownloadMenu();
			break;
		case "prefbutton":
			if (data.data[data.key])
				xtt.ui.add.preferencesButton(document.getElementById("watch-actions-right"));
			else
				xtt.ui.remove.preferencesButton();
			break;
		case "loopbutton":
			if (data.data[data.key])
				xtt.ui.add.loopButtons(document.getElementById("watch-actions-right"));
			else
				xtt.ui.remove.loopButtons();
			break;
		case "extrabuttons":
			if (data.data[data.key])
				xtt.ui.add.extraButtons(document.getElementById("watch-actions-right"));
			else
				xtt.ui.remove.extraButtons();
			break;
		case "enablepopout":
			if (data.data[data.key])
				xtt.ui.add.popoutButton(document.getElementById("watch-actions-right"));
			else
				xtt.ui.remove.popoutButton();
			break;
		case "lyrics":
			if (data.data[data.key]) {
				var element = document.querySelector("#watch-info"),
					where = "afterbegin";
				if (element && element.id != "watch-info")
					where = "beforeend";
				xtt.ui.add.lyricsContainer(where, element);
			}
			else
				xtt.ui.remove.lyrics();
			break;
		case "videoquality":
			xtt.player.adjustVideoQuality(data.data[data.key]);
			break;
		case "loop":
		case "forceloop":
			updateLoopButton();
			break;
		case "enablewideplayer":
			xtt.player.enableWide(data.data[data.key]);
			break;
		case "overridehistory":
			if (event.detail.newValue)
				opera.setOverrideHistoryNavigationMode("compatible");
			else
				opera.setOverrideHistoryNavigationMode("automatic");
			break;
		case "popoutrealsize":
			if (document.querySelector("body.ext-popout-player"))
				xtt.ui.apply.popoutPlayer(true);
			break;
		case "cleanwatch":
			xtt.ui.apply.cleanPage(data.data[data.key]);
			break;
		case "seektime":
			updateSeekButtons(data.data[data.key]);
			break;
		case "hideannotations":
			xtt.player.hideAnnotations(data.data[data.key]);
			break;
		case "hidecontrols":
			xtt.player.hideControls(data.data[data.key]);
			break;
		case "playertheme":
			xtt.player.changeTheme(data.data[data.key]);
			break;
		case "progresscolor":
			xtt.player.changeProgressColour(data.data[data.key]);
			break;
		case "fullscreenstyle":
			if (data.data[data.key])
				xtt.ui.apply.fullScreenStyle();
			else
				xtt.ui.remove.fullScreenStyle();

			xtt.ui.apply.popoutPlayer(document.querySelector("body.ext-popout-player"));
			break;
		case "enablecustomstyle":
			if (data.data[data.key])
				xtt.ui.apply.customStyle();
			else
				xtt.ui.remove.customStyle();
			break;
		case "customstyle":
			if (preferences.enablecustomstyle)
				xtt.ui.apply.customStyle(data.data[data.key]);
			break;
		case "enablecustomcolors":
			if (data.data[data.key])
				xtt.ui.apply.customColors();
			else
				xtt.ui.remove.customColors();
			break;
		case "customcolor":
			if (preferences.enablecustomcolors)
				xtt.ui.apply.customColors(data.data[data.key]);
			break;
		case "customlogo":
			if (data.data[data.key])
				xtt.ui.apply.customLogo();
			else
				xtt.ui.remove.customLogo();
			break;
		case "uselighticons":
			xtt.ui.apply.lightIcons(data.data[data.key]);
			break;
		case "thumbpreview":
			if (data.data[data.key])
				xtt.ui.add.thumbPreview();
			else
				xtt.ui.remove.thumbPreview();
			break;
		case "thumbpreviewtrigger":
			if (preferences.thumbpreview) {
				xtt.ui.remove.thumbPreview();
				xtt.ui.add.thumbPreview();
			}
			break;
		case "ratevideos":
			if (data.data[data.key])
				xtt.ui.add.videoRatings();
			else
				xtt.ui.remove.videoRatings();
			break;
		case "enableshortcutkeys":
			if (data.data[data.key])
				xtt.shortcut.enable();
			else
				xtt.shortcut.disable();
			break;
		case "overridelocale":
		case "locale":
			xtt.ll.setLanguage();
			break;
		case "actions":
			runActions("develop");
	}
}

/**
 * Add <cite>hover</cite> event listener to video thumbnail that
 * can be used for video preview.
 *
 * @param {HTMLAnchorElement} element
 * Element containing video thumbnail.
 */
function previewOnHover(element) {
	element.addEventListener("mouseenter", enterPreview, false);
	element.addEventListener("mouseleave", leavePreview, false);
}

/**
 * Reduce all passed arguments to single string. Arguments will be separated
 * with space. Objects will be converted to JSON format.
 *
 * @param {Any} arg1[,arg2[,...]]
 * Arguments of any type.
 *
 * @returns {String}
 * Stringified and concatenated arguments.
 */
function reduce() {
	return Array.prototype.reduce.call(arguments, function (previous, argument) {
		if (typeof argument == "object") {
			if (previous)
				previous += "\n";

			return previous + JSON.stringify(argument) + ' ';
		}
		else
			return previous + argument + ' ';
		}, '');
}

/**
 * Remove an element from page.
 *
 * @param {Element}
 * Element to be removed from DOM.
 */
function removeElement(element) {
	if (element && element.parentNode)
		element.parentNode.removeChild(element);
}

/**
 * Event listener for <cite>AfterEvent.load</cite> event.
 * Remove iframe elements that link to ads. Also, it will be called from
 * <cite>DOMContentLoaded</cite> event listener.
 */
function removeIFrameAds(event) {
	if (!preferences.hidepageads)
		return;

	Array.prototype.forEach.call(document.querySelectorAll("iframe"), function (iframe) {
		if (/googlesyndication|doubleclick|googleadservices|\/adsense_script\.html/.test(iframe.src)) {
			removeElement(iframe);

			log.warn("Frame containing ads removed from document.",
				"Frame address: " + iframe.src + '.'
			);
		}
	});
}

/**
 * Remove event listeners added by this script.
 */
function removeListeners() {
	document.removeEventListener("DOMContentLoaded", domContentLoaded, false);

	opera.removeEventListener("BeforeScript", beforeExternalScript, false);
	opera.removeEventListener("pluginInitialized", pluginInitialized, false);

	window.removeEventListener("blur", windowBlurred, false);
	window.removeEventListener("focus", windowFocused, false);
	window.removeEventListener("load", loaded, false);
	window.removeEventListener("message", messageReceived, false);
	window.removeEventListener("resize", windowResized, false);
	window.removeEventListener("lyrics", showLyrics, false);
}

/**
 * Often, when user interaction causes overlay dialogue to appear (ex. alert or
 * download) or opens new tab, tool-tip wont disappear. This function will run
 * every second until tool-tip is removed.
 */
function removeTooltip() {
	setTimeout(function () {
		var tip = document.querySelector("body > div.yt-uix-tooltip-tip");
		if (tip) {
			removeElement(tip);
			setTimeout(arguments.callee, 1000);
		}
	}, 10);
}

/**
 * Restore elements that are moved to make room for extension’s buttons.
 */
function restoreMovedElements() {
	if (!room || room.querySelector(".ext-button"))
		return;

	var el = null;
	while (el = roomElements.pop())
		room.appendChild(el);

	log.info("Elements that are moved to make room for extension’s buttons are moved back to original place.");
}

/**
 * This function will try to execute user defined actions.
 *
 * @param {String} trigger
 * Event which triggered custom actions.
 */
function runActions(trigger) {
	var action = preferences.actions;
	for (var id in action) {
		if (action[id].trigger == trigger && action[id].enabled) {
			var loginfo = log.info;
			if (trigger == "develop")
				loginfo = log.Info;

			loginfo("About to execute user action.",
				"Trigger: " + trigger + '.',
				"ID: " + id + '.'
			);

			try {
				Function("xtt", action[id].exec)(xtt);
				loginfo("User action executed.",
					"Trigger: " + trigger + '.',
					"ID: " + id + '.'
				);
			}
			catch (error) {
				log.Error("An error occurred while trying to execute user action.",
					"Trigger: " + trigger + '.',
					"ID: " + id + '.',
					"\nError: " + error.message + '.',
					"\nStack:\n" + error.stacktrace
				);
			}
		}
	}
}

/**
 * Scroll page vertically by given pixels.
 *
 * @param {Number} pixels
 * Number of pixels for which page should be scrolled.
 */
function scrollPage(pixels) {
	var i = 0,
		prev = 0;

	var interval = setInterval(function () {
		i += 0.03;
		if (i > 1) {
			clearInterval(interval);
			return;
		}

		var y = Math.round(pixels * cubicBezier(1, 1, i));
		window.scrollBy(0, y - prev);
		prev = y;
	}, 10);
}

/**
 * Start search for lyrics for given song.
 *
 * @param {String} song.artist
 * Artist of the song for which to search lyrics.
 *
 * @param {String} song.title
 * Title of the song for which to search lyrics.
 */
function searchLyrics(song) {
	log.info("Search for lyrics initiated.",
		"Artist: " + song.artist + '.',
		"Title: " + song.title + '.'
	);

	status = "search";
	info = xtt.ll.getString("LYRICS_SEARCH_START").replace("%song", song.artist + " - " + song.title);
	fireEvent();

	var uri = "http://lyrics.wikia.com/api.php?artist=" + encodeURIComponent(song.artist) + "&song=" + encodeURIComponent(song.title) + "&fmt=xml";
	sendMessage("load external resource",
		{
			uri: uri,
			method: "get",
			about: "lyrics"
		}
	);
}

/**
 * Send message log (for log viewer) to background process.
 */
function sendLog() {
	if (!pid && xtt.video) {
		pid = xtt.video.id,
		ptitle = xtt.video.getVideoTitle();

		var info = '';
		if (xtt.video.isChannel)
			info += 'C';
		if (xtt.video.isEmbedded)
			info += 'E';
		if (xtt.video.isPopup)
			info += 'U';
		if (xtt.video.isPreview)
			info += 'P';

		if (info)
			ptitle = info + ": " + ptitle;
	}

	if (!pid) {
		pid = Date.now();
		ptitle = xtt.video.getVideoTitle();
		if (!ptitle)
			ptitle = window.location.href;
	}

	extension.postMessage({
		subject: "here is message log",
		data: {
			id: pid,
			title: ptitle,
			buffer: log.buffer
		}
	});
}

/**
 * Construct and send messages to background process.
 *
 * @param {String} subject
 * Message subject.
 *
 * @param {Object} [data]
 * Message body.
 */
function sendMessage(subject, data) {
	if (typeof data != "object")
		data = { data: data };

	data.id = xtt.video.id;
	data.player = !!xtt.player.playerElement;

	extension.postMessage({
		subject: subject,
		data: data
	});

	if (subject == "add tab")
		startPing();
}

/**
 * Send playback status to pop-up window.
 */
function sendStatus() {
	if (!popup)
		return;

	var message = {
			subject: "status report",
			data: {
				id: xtt.video.id,
				state: xtt.player.state,
				length: xtt.video.length
			}
		};

	try {
		message.data.progress = xtt.player.playerElement.getCurrentTime();
	}
	catch (error) {
		message.data.progress = null;
	}

	try {
		popup.postMessage(message);
	}
	catch (error) {}
}

/**
 * Send status to parent window. This is used only for thumbnail previews.
 *
 * @param {Boolean} [state = false]
 * Should message be about player state (<code>true</code>) or about current
 * playback time (<code>false</code>).
 */
function sendStatusToParent(state) {
	if (!xtt.video.isPreview)
		return;

	var message = {
			data: {
				id: xtt.video.getVideoID()
			}
		};

	if (state) {
		message.subject = "preview state";
		message.data.state = xtt.player.state;
	}
	else {
		message.subject = "preview time";
		try {
			message.data.time = xtt.player.playerElement.getCurrentTime();
		}
		catch (error) {}
	}

	window.parent.postMessage(message, window.location.href);
}

/**
 * Decides what action should be taken upon receiving keyboard shortcut.
 *
 * @param {KeyEvent} event
 * Event object.
 */
function shortcutAction(event) {
	var shortcut = translateKeyEvent(event),
		preventDefaultAction = true;

	if (/input|textarea/i.test(event.target.toString()) && /^(Shift\+)?[^+]+$/.test(shortcut))
		return;
	else if (/button/i.test(event.target.toString()) && /^((Ctrl\+)?Shift\+)?(Space|Enter)/.test(shortcut))
		return;

	switch (shortcut) {
		case "Esc":
			if (document.querySelector("body.ext-popout-player"))
				xtt.ui.apply.popoutPlayer(false);
			else if (document.querySelector(":focus"))
				document.querySelector(":focus").blur();
			break;
		case preferences.shortcut.seekback:
			xtt.player.seekVideo(false);
			break;
		case preferences.shortcut.seekforward:
			xtt.player.seekVideo(true);
			break;
		case preferences.shortcut.framestep:
			xtt.player.frameStep();
			break;
		case preferences.shortcut.loopsection:
			xtt.player.loopSection.toggle();
			break;
		case preferences.shortcut.marksectionstart:
			xtt.player.loopSection.startTime("mark");
			break;
		case preferences.shortcut.marksectionend:
			xtt.player.loopSection.endTime("mark");
			break;
		case preferences.shortcut.playpause:
			xtt.player.control("play/pause");
			break;
		case preferences.shortcut.expandplayer:
			xtt.player.enableWide();
			break;
		case preferences.shortcut.showlyrics:
			xtt.ui.apply.toggleLyrics();
			break;
		case preferences.shortcut.togglecolors:
			sendMessage("toggle custom colors");
			break;
		case preferences.shortcut.togglecss:
			sendMessage("toggle custom css");
			break;
		case preferences.shortcut.hideall:
			xtt.ui.apply.toggleHideAll(true);
			break;
		case preferences.shortcut.showhidden:
			xtt.ui.apply.toggleHideAll(false);
			break;
		case preferences.shortcut.popplayer:
			xtt.ui.apply.popoutPlayer(!document.querySelector("body.ext-popout-player"));
			break;
		default:
			if (preferences.exposeplayershortcuts) {
				switch (shortcut) {
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
					case "8":
					case "9":
						xtt.player.control("seek", shortcut + "0%");
						break;
					case "0":
					case "Home":
						xtt.player.control("seek", 0);
						break;
					case "End":
						xtt.player.control("seek", "100%");
						break;
					case "Space":
						xtt.player.control("play/pause");
						break;
					case "Up":
						xtt.player.control("volume", "+5%");
						break;
					case "Down":
						xtt.player.control("volume", "-5%");
						break;
					case "Right":
						xtt.player.control("seek", "+10%");
						break;
					case "Left":
						xtt.player.control("seek", "-10%");
						break;
					default:
						preventDefaultAction = false;
				}
			}
			else
				preventDefaultAction = false;
	}

	if (preventDefaultAction) {
		event.preventDefault();

		log.warn("Default action for shortcut “" + shortcut + "” prevented.");
	}
}

/**
 * Event handler for <cite>click</cite> event on <em>download</em> button.
 * When you click download button first time nothing happens. You need to click
 * on it twice for menu to appear. This will (hopefully) fix that.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function showDownloadMenu(event) {
	this.removeEventListener("click", arguments.callee, false);

	setTimeout(function () {
		if (!document.querySelector("body > ul.ext-download-menu"))
			event.target.click();
	}, 100);
}

/**
 * Event listener for custom <cite>lyrics</cite> event.
 * This event is used to inform about lyrics search progress and to show lyrics.
 *
 * @param {CustomEvent} event
 * Event object.
 */
function showLyrics(event) {
	logLyricsSearchMessage(event.detail.message);

	switch (event.detail.status) {
		case "loaded":
			writeLyrics(event.detail);
			break;
		case "invalid":
		case "notfound":
		case "error":
			addManualSearch();
	}
}

/**
 * Event listener for <cite>click</cite> event on preferences button.
 * Request from background process to open preferences window.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function showPreferencesWindow(event) {
	sendMessage("show preferences");
	removeTooltip();
}

/**
 * Simulate player state change event on channels.
 */
function simulateStateChange() {
	if (!xtt.video.isChannel)
		return;
	if (!xtt.player.playerElement || !xtt.player.playerElement.getCurrentTime)
		return;

	var currentProgress = xtt.player.playerElement.getCurrentTime();

	if (Math.abs(currentProgress - xtt.video.length) < 1) {
		if (xtt.player.state != 0)
			xtt.player.stateChanged(0);
	}
	else if (currentProgress > previousProgress) {
		if (xtt.player.state != 1)
			xtt.player.stateChanged(1);
	}
	else if (currentProgress == previousProgress) {
		if (xtt.player.state != 2)
			xtt.player.stateChanged(2);
	}

	previousProgress = currentProgress;
}

/**
 * Start pinging background process (every second) to let it know that page is
 * still available.
 */
function startPing () {
	if (pingint !== null)
		return;

	pingint = setInterval(function () {
		sendMessage("echo replay");
	}, 1000);
}

/**
 * Start video preview.
 *
 * @param {HTMLAnchorElement} anchor
 * Element containing video thumbnail.
 */
function startPreview(anchor) {
	// Remember state of regular video playback.
	if (xtt.player)
		previousPlaybackState = xtt.player.state;

	var preview = anchor.querySelector("iframe");
	if (preview) {
		preview.contentWindow.postMessage({
			subject: "player action",
			data: {
				exec: "play"
			}
		}, window.location.href);
	}
	else {
		var host = window.location.protocol + "//" + window.location.hostname,
			thumb = anchor.querySelector(".video-thumb"),
			vid = getVideoID(anchor);

		if (!vid) {
			log.warn("Cannot find video ID. This thumbnail cannot be converted to video.",
				"Thumbnail target: " + anchor.href + '.'
			);
			return;
		}

		preview = document.createElement("iframe");
		preview.src = host + "/watch_popup?v=" + vid + "&feature=xtt_preview";

		thumb.classList.add("ext-preview-container");
		thumb.appendChild(preview);

		log.info("Video thumbnail preview added. URI: " + preview.src + '.');
	}
}

/**
 * Start sending status to parent window.
 * This is used only for thumbnail previews.
 */
function startSendingStatus() {
	if (!statusInterval)
		statusInterval = setInterval(sendStatusToParent, 1000);

	sendStatusToParent(true);
}

/**
 * Stop video preview.
 *
 * @param {HTMLAnchorElement} anchor
 * Element containing video thumbnail.
 */
function stopPreview(anchor) {
	var preview = anchor.querySelector("iframe");
	if (preview) {
		preview.contentWindow.postMessage({
			subject: "player action",
			data: {
				exec: "pause"
			}
		}, window.location.href);
	}

	if (previousPlaybackState == 1) {
		xtt.player.control("play");
		previousPlaybackState = NaN;
	}
}

/**
 * Stop sending status to parent window.
 * This is used only for thumbnail previews.
 */
function stopSendingStatus() {
	clearInterval(statusInterval);
	statusInterval = NaN;

	sendStatusToParent(true);
}

/**
 * This function is used to accommodate multiple changes which occurs when DOM
 * sub-tree is modified.
 *
 * @param {Function} callback
 * Function to be called after some period of time.
 */
function subtreeModified(callback) {
	clearTimeout(nodeInserted);
	nodeInserted = setTimeout(callback, 321);
}

/**
 * Replace characters that would be invalid if string is used as name of
 * file. Also remove spaces from beginning and end.
 *
 * @param {String} string
 * String to fix.
 *
 * @returns {String}
 * Fixed string.
 */
function toFileName(string) {
	if (/Win/.test(window.navigator.platform))
		string = string.replace(/[\\\/:\*\?"<>\|]+/g, preferences.replace);
	else if (/Linux|BSD/.test(window.navigator.platform))
		string = string.replace(/\/+/g, preferences.replace);
	else if (/Mac/.test(window.navigator.platform))
		string = string.replace(/[\/:]+/g, preferences.replace);

	return string.trim();
}

/**
 * Event listener for <cite>click</cite> event on <em>loop</em> button.
 * Toggle loop or section loop.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function toggleLoop(event) {
	if (preventClick || event.shiftKey || event.altKey || event.metaKey) {
		preventClick = false;
		return;
	}

	if (event.ctrlKey) {
		if (!xtt.player.loopSection.enabled)
			sendMessage("toggle loop");
	}
	else if (xtt.player.loopSection.enabled)
		xtt.player.loopSection.disable();
	else
		xtt.player.loopSection.enable();
}

/**
 * Event listener for <cite>mousedown</cite> event on <em>loop</em> button.
 * Toggle loop if primary mouse button is pressed.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function toggleLoopDown(event) {
	if (event.button == 0) {
		buttonHeldDown = setTimeout(function () {
			if (!xtt.player.loopSection.enabled) {
				sendMessage("toggle loop");
				preventClick = true;
			}
		}, 1000);
	}
}

/**
 * Event listener for <cite>mouseup</cite> event on <em>loop</em> button.
 * Cancel toggle loop if primary mouse button is released or toggle loop if
 * mouse wheel button is released.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function toggleLoopUp(event) {
	if (buttonHeldDown) {
		clearTimeout(buttonHeldDown);
		buttonHeldDown = NaN;
	}
	else if (event.button == 1 && !xtt.player.loopSection.enabled)
		sendMessage("toggle loop");
}

/**
 * Translate keypress event to shortcut string (like <cite>Ctrl+Shift+D</cite>).
 *
 * @param {KeyEvent} event
 * Event object that represents keypress event.
 *
 * @returns {String}
 * Shortcut string extracted from event object.
 */
function translateKeyEvent(event) {
	if (event.which == 0 && event.keyCode == 0)
		return;

	var keyCombination = [],
		keyStr = String.fromCharCode(event.keyCode),
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

	if (event.altKey)
		keyCombination.push("Alt");
	if (event.ctrlKey)
		keyCombination.push("Ctrl");
	if (event.metaKey)
		keyCombination.push("Meta");
	if (event.shiftKey)
		keyCombination.push("Shift");

	// Typewriter keys, Enter key and numeric keyboard.
	if (event.which) {
		if (event.keyCode.toString() in keyCode1)
			keyStr = keyCode1[event.keyCode.toString()];
	}
	// Function keys, cursor control keys and other keys.
	else {
		if (event.keyCode.toString() in keyCode0)
			keyStr = keyCode0[event.keyCode.toString()];
	}

	keyCombination.push(keyStr);
	return keyCombination.join('+');
}

/**
 * Event listener for <cite>mousewheel</cite> event on <em>mark loop end</em>
 * button. Fine tune section end time using mouse wheel.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function tuneSectionEnd(event) {
	event.preventDefault();

	if (event.detail > 0 )
		xtt.player.loopSection.endTime("decrement");
	else if (event.detail < 0)
		xtt.player.loopSection.endTime("increment");
}

/**
 * Event listener for <cite>mousewheel</cite> event on <em>mark loop start</em>
 * button. Fine tune section start time using mouse wheel.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function tuneSectionStart(event) {
	event.preventDefault();

	if (event.detail > 0)
		xtt.player.loopSection.startTime("decrement");
	else if (event.detail < 0)
		xtt.player.loopSection.startTime("increment");
}

/**
 * Event listener for <cite>unload</cite> event.
 *
 * @param {Event} event
 * Event object.
 */
function unLoad(event) {
	sendMessage("remove tab");

	if (popup) {
		popup.postMessage({
			subject: "remove video",
			data: {
				id: xtt.video.id
			}
		});
	}

	if (xtt.video.isPreview) {
		window.parent.postMessage({
			subject: "disable video peview",
			data: {
				id: xtt.video.getVideoID()
			}
		}, window.location.href);
	}
}

/**
 * Add download links from {@link xtt.video.urlmap} to download menu.
 */
function updateDownloadMenu() {
	var dlmenu = references.downloadMenu;
	if (!dlmenu) {
		log.warn("No reference to download menu.");
		return;
	}

	// Remove old menu.
	Array.prototype.forEach.call(dlmenu.querySelectorAll("[data-ext-internal]"), removeElement);
	var before = dlmenu.lastElementChild;

	// Add new menu to download button.
	if (xtt.video.urlmap.length) {
		var menuItem = {
				clickListener: downloadVideo
			},
			videoTitle = encodeURIComponent(toFileName(xtt.video.getVideoTitle())),
			videoFormat = preferences.videoFormat;

		xtt.video.urlmap.forEach(function (item) {
			var uri = item.url;
			if (preferences.usefallbacklinks && item.fallback)
				uri = item.fallback;

			if (item.itag in videoFormat) {
				menuItem.text = videoFormat[item.itag][0];
				menuItem.tooltip = videoFormat[item.itag][1];
			}
			else {
				menuItem.text = item.itag;
				menuItem.tooltip = xtt.ll.getString("DOWNLOAD_UNKNOWN_TIP");
			}
			menuItem.uri = decodeURIComponent(uri) + "&title=" + videoTitle;

			xtt.ui.add.downloadMenuItem(menuItem, before, true);
		});
	}
	// Download options not found.
	else {
		var menuItem = {
				text: xtt.ll.getString("DOWNLOAD_EMPTY"),
				tooltip: xtt.ll.getString("DOWNLOAD_EMPTY_TIP"),
				uri: "javascript:alert(\"" + xtt.ll.getString("DOWNLOAD_EMPTY_TIP") + "\");"
			};

		xtt.ui.add.downloadMenuItem(menuItem, null, true);

		log.warn("No download options.");
	}

	log.info("Download menu updated.");
}

/**
 * Update icon on loop button and tool-tip also.
 */
function updateLoopButton() {
	if (!references.loopButton)
		return;

	var tooltip = document.querySelector("body > div[id*=\"tooltip\"] div[id*=\"content\"]"),
		test = xtt.ll.getStringsArray("LOOP_ENABLE", "LOOP_DISABLE", "LOOP_SECTION_DISABLE", "LOOP_SECTION_ENABLE").join('');

	if (xtt.player.loopSection.enabled) {
		references.loopButton.classList.add("ext-loop-on");
		references.loopButton.classList.add("ext-loop-force");
		references.loopButton.setAttribute("data-tooltip-text", xtt.ll.getString("LOOP_SECTION_DISABLE"));
		if (tooltip && test.indexOf(tooltip.textContent) > -1)
			tooltip.textContent = xtt.ll.getString("LOOP_SECTION_DISABLE");
	}
	else if (preferences.loop) {
		// Test if playing playlist.
		if (xtt.video.isPlaylist) {
			references.loopButton.classList.add("ext-loop-force");
			if (preferences.forceloop)
				references.loopButton.classList.add("ext-loop-on");
			else
				references.loopButton.classList.remove("ext-loop-on");
		}
		else {
			references.loopButton.classList.remove("ext-loop-force");
			references.loopButton.classList.add("ext-loop-on");
		}

		if (ctrlDown) {
			references.loopButton.setAttribute("data-tooltip-text", xtt.ll.getString("LOOP_DISABLE"));
			if (tooltip && test.indexOf(tooltip.textContent) > -1)
				tooltip.textContent = xtt.ll.getString("LOOP_DISABLE");
		}
		else {
			references.loopButton.setAttribute("data-tooltip-text", xtt.ll.getString("LOOP_SECTION_ENABLE"));
			if (tooltip && test.indexOf(tooltip.textContent) > -1)
				tooltip.textContent = xtt.ll.getString("LOOP_SECTION_ENABLE");
		}
	}
	else {
		references.loopButton.classList.remove("ext-loop-on");
		references.loopButton.classList.remove("ext-loop-force");

		if (ctrlDown) {
			references.loopButton.setAttribute("data-tooltip-text", xtt.ll.getString("LOOP_ENABLE"));
			if (tooltip && test.indexOf(tooltip.textContent) > -1)
				tooltip.textContent = xtt.ll.getString("LOOP_ENABLE");
		}
		else {
			references.loopButton.setAttribute("data-tooltip-text", xtt.ll.getString("LOOP_SECTION_ENABLE"));
			if (tooltip && test.indexOf(tooltip.textContent) > -1)
				tooltip.textContent = xtt.ll.getString("LOOP_SECTION_ENABLE");
		}
	}
}

/**
 * Event listener for <cite>keydown</cite> and <cite>keyup</cite> events on
 * <cite>document</cite>. Update loop button tool-tip when <cite>Control</cite>
 * key is pressed or released.
 *
 * @param {KeyEvent} event
 * Event object.
 */
function updateLoopButtonTooltip(event) {
	if (event.type == "keydown" && event.keyCode == 17) {
		ctrlDown = true;

		if (references.loopButton && !xtt.player.loopSection.enabled) {
			var tooltip = document.querySelector("body > div[id*=\"tooltip\"] div[id*=\"content\"]"),
				test = xtt.ll.getStringsArray("LOOP_SECTION_ENABLE", "LOOP_SECTION_DISABLE").join('');

			if (preferences.loop) {
				references.loopButton.setAttribute("data-tooltip-text", xtt.ll.getString("LOOP_DISABLE"));
				if (tooltip && test.indexOf(tooltip.textContent) > -1)
					tooltip.textContent = xtt.ll.getString("LOOP_DISABLE");
			}
			else {
				references.loopButton.setAttribute("data-tooltip-text", xtt.ll.getString("LOOP_ENABLE"));
				if (tooltip && test.indexOf(tooltip.textContent) > -1)
					tooltip.textContent = xtt.ll.getString("LOOP_ENABLE");
			}
		}
	}
	else if (event.type == "keyup" && event.keyCode == 17) {
		ctrlDown = false;
		updateLoopButton();
	}
}

/**
 * Update display of ratings for videos.
 *
 * @param {Object} data
 * Object containing rating information about videos.
 */
function updateRatings(data) {
	if (!data || typeof data != "object") {
		log.warn("Cannot update ratings. No valid data.");
		return;
	}

	var thumbs = document.querySelectorAll("a[href*=\"/watch?\"], a[href*=\"/user/\"]"),
		loadMore = document.querySelectorAll("#watch-more-from-user, #watch-more-related, #watch-sidebar .watch-sidebar-body, #feed, .gh-single-playlist");

	// Since further modification will cause new calls to this function we’ll
	// remove those calls until we finish modification. If not, new requests for
	// video information, which we already have, will be made. That can cause
	// server to respond with “quota exceeded” error.
	Array.prototype.forEach.call(loadMore, function (node) {
		node.removeEventListener("DOMNodeInserted", xtt.ui.add.videoRatings, false);
	});

	Array.prototype.forEach.call(thumbs, function (anchor) {
		var thumb = anchor.querySelector(".video-thumb");
		if (!thumb)
			return;

		var id = getVideoID(anchor);
		if (id in data)
			addRatingMeter(thumb.querySelector(".yt-thumb-clip"), data[id].rating);
	});

	// Watch for videos added later and show their rating an well.
	Array.prototype.forEach.call(loadMore, function (node) {
		node.addEventListener("DOMNodeInserted", xtt.ui.add.videoRatings, false);
	});

	if (document.querySelector(".ext-video-rating"))
		log.info("Video ratings added to thumbnails.");
}

/**
 * Update times on mark loop section start/end buttons.
 */
function updateSectionButtons() {
	if (!references.loopContainer)
		return;

	references.loopStartButton.textContent = xtt.player.loopSection.start.toTimeString(true);
	references.loopEndButton.textContent = xtt.player.loopSection.end.toTimeString(true);
}

/**
 * Update seek time on tool-tips for seek buttons.
 *
 * @param {String} time
 * Number of seconds video will seek when seek button is pressed.
 */
function updateSeekButtons(time) {
	if (!references.extraContainer)
		return;

	if (!time)
		time = preferences.seektime;

	references.seekForwardButton.setAttribute("data-tooltip-text", xtt.ll.getString("SEEK_FORWARD") + " (+" + time + "s)");
	references.seekBackButton.setAttribute("data-tooltip-text", xtt.ll.getString("SEEK_BACK") + " (-" + time + "s)");
}

/**
 * Update button for thumbnail preview.
 *
 * @param {String} id
 * ID of video for which thumbnail preview button should be updated.
 *
 * @param {Number} state
 * Current state of preview playback.
 */
function updateThumbPreviewButton(id, state) {
	var anchor = document.querySelector("a[href*=\"" + id + "\"].ext-preview-enabled"),
		thumb = document.querySelector("a[href*=\"" + id + "\"].ext-preview-enabled .ext-thumb-preview");

	if (anchor) {
		if (state == 1)
			anchor.classList.add("ext-preview-active");
		else {
			anchor.classList.remove("ext-preview-active");
			updateThumbPreviewTime(id);
		}
	}

	if (thumb) {
		if (state == 1) {
			thumb.classList.add("ext-pause");
			thumb.setAttribute("data-tooltip-text", xtt.ll.getString("PREVIEW_END"));
		}
		else {
			thumb.classList.remove("ext-pause");
			thumb.setAttribute("data-tooltip-text", xtt.ll.getString("PREVIEW_START"));
		}
	}
}

/**
 * Update current time for thumbnail preview.
 *
 * @param {String} id
 * ID of video for which current preview time should be updated.
 *
 * @param {Number} [time]
 * Current time of preview playback. If this argument is missing
 * or not a number video length will be used instead.
 */
function updateThumbPreviewTime(id, time) {
	var vtime = document.querySelector("a[href*=\"" + id + "\"].ext-preview-enabled .video-time");
	if (!vtime)
		return;

	if (!vtime.getAttribute("data-ext-video-length"))
		vtime.setAttribute("data-ext-video-length", vtime.textContent);

	if (typeof time == "number")
		vtime.textContent = time.toTimeString(true);
	else
		vtime.textContent = vtime.getAttribute("data-ext-video-length");
}

/**
 * Event listener for <cite>click</cite> event on <em>frame step</em> button.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function videoFrameForward(event) {
	xtt.player.frameStep();
}

/**
 * Event listener for <cite>click</cite> event on <em>seek back</em> button.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function videoSeekBack(event) {
	xtt.player.seekVideo(false);
}

/**
 * Event listener for <cite>click</cite> event on <em>seek forward</em> button.
 *
 * @param {MouseEvent} event
 * Event object.
 */
function videoSeekForward(event) {
	xtt.player.seekVideo(true);
}

/**
 * Event listener for <cite>blur</cite> event.
 *
 * @param {Event} event
 * Event object.
 */
function windowBlurred(event) {
	clearTimeout(winevent.blur);
	clearTimeout(winevent.focus);

	winevent.blur = setTimeout(function () {
		sendMessage("tab blurred");
	}, 100);
}

/**
 * Event listener for <cite>focus</cite> event.
 *
 * @param {Event} event
 * Event object.
 */
function windowFocused(event) {
	clearTimeout(winevent.blur);
	clearTimeout(winevent.focus);

	winevent.focus = setTimeout(function () {
		sendMessage("tab focused");
	}, 100);
}

/**
 * Event listener for <cite>resize</cite> event.
 *
 * @param {Event} event
 * Event object.
 */
function windowResized(event) {
	if (preferences.cleanwatch.allsidebar || preferences.cleanwatch.suggestions)
		xtt.ui.apply.cleanPage();
	if (preferences.enablepopout)
		xtt.ui.apply.popoutPlayer(!!document.querySelector(".ext-popout-player"));
}

/**
 * Write lyrics to lyrics container.
 *
 * @param {Object} [data]
 * Object containing lyrics data to be written on page. If this argument is
 * missing or not well formed, existing lyrics will be removed.
 *
 * @param {string} data.artist
 * Artist of currently playing song.
 *
 * @param {string} data.lyrics
 * Lyrics for song.
 *
 * @param {string} data.title
 * Song title.
 */
function writeLyrics(data) {
	if (!references.lyricsHeader)
		return;

	if (data && data.lyrics) {
		var str = xtt.ll.getString("LYRICS_LYRICS_FOR").replace("%song", "<strong>" + data.artist + " - " + data.title + "</strong>");

		references.lyricsHeader.firstElementChild.removeChildren();
		references.lyricsHeader.firstElementChild.insertAdjacentHTML("afterbegin", str);

		references.lyricsBody.appendChild(data.lyrics);
		if (!preferences.lyricssearchlog)
			references.lyricsSearchLog.classList.add("ext-hidden");

		log.info("Lyrics for “" + data.artist + " - " + data.title + "” are written to page.");
	}
	else {
		references.lyricsHeader.firstElementChild.textContent = xtt.ll.getString("LYRICS_LYRICS");
		references.lyricsBody.removeChildren();
		collapseLyricsContainer();

		log.warn("Lyrics cannot be written to page. Nothing to write.");
	}
}
})(window, window.document, window.opera, opera.extension, widget);

});
