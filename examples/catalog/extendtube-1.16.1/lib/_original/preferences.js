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

// This are default preferences. They can be changed on preferences page.
// Default preferences will not change YouTube behaviour.
var defaultPreferences = {
		// Hide ads on page.
		hidepageads: true,
		// Hide ads in video player.
		hideplayerads: true,
		// Hide annotations in flash player.
		hideannotations: false,
		// Auto-hide player controls.
		// 0 = controls and progress bar always visible,
		// 1 = controls and progress bar will be hidden after few seconds,
		// 2 = controls will be visible and progress bar will be minimised
		//     after few seconds,
		// 3 = controls will be hidden and progress bar will be minimised
		//     after few seconds.
		hidecontrols: 3,
		// What theme to use for video player.
		// Can be "dark" or "light".
		playertheme: "dark",
		// What colour to use for video player’s progress bar.
		// Can be "red" or "white".
		progresscolor: "red",
		// What type of messages should be logged to error console.
		// 0 = nothing, 1 = errors, 2 = warnings, 3 = informations.
		loglevel: 1,
		// Custom actions.
		actions: {},
		// Use this language.
		locale: "en",
		// If set to “true” language will always be English or whatever
		// language user chooses.
		overridelocale: false,
		// Respect autoplay option on channels.
		channelautoplay: false,
		// Make video player expanded.
		enablewideplayer: false,
		// Force this video quality. Can be one of: "default", "small",
		// "medium", "large", "hd720", "hd1080" or "highres".
		videoquality: "default",
		// Add download button and menu to page.
		enabledownload: false,
		// Use falback servers for video download links.
		usefallbacklinks: false,
		// Show preferences button on page.
		prefbutton: false,
		// Play video over and over again.
		loop: false,
		// Force video loop in playlists.
		forceloop: false,
		// Add loop button to page.
		loopbutton: false,
		// Add few more buttons.
		extrabuttons: false,
		// Add player pop out button.
		enablepopout: false,
		// Display real video size on pop out.
		popoutrealsize: false,
		// Enable lyrics to be loaded.
		lyrics: false,
		// Enable thumbnail video preview.
		thumbpreview: false,
		// What will trigger preview.
		// Can be "hover" or "button".
		thumbpreviewtrigger: "button",
		// Whether to show video ratings over thumbnails.
		ratevideos: false,
		// While seeking back/forward seek for this number of seconds.
		seektime: 3,
		// When saving video replace invalid characters whit this.
		replace: '',
		// Enable keyboard shortcuts.
		enableshortcutkeys: false,
		// Make player shortcuts work if player is not focused.
		exposeplayershortcuts: false,
		// Disable flash player shortcuts when they are exposed to page.
		disableflashshortcuts: /Linux|BSD|Mac/.test(window.navigator.platform),
		// Keyboard shortcuts.
		shortcut: {
			// Enable/disable section loop.
			loopsection: '',
			// Mark section start time.
			marksectionstart: '',
			// Mark section end time.
			marksectionend: '',
			// Play/pause video.
			playpause: '',
			// Play just one frame.
			framestep: '',
			// Jump few second back.
			seekback: '',
			// Jump few second forward.
			seekforward: '',
			// Expand/shrink video player.
			expandplayer: '',
			// Pop-out player.
			popplayer: '',
			// Show/hide lyrics
			showlyrics: '',
			// Enable/disable custom colours.
			togglecolors: '',
			// Enable/disable custom CSS.
			togglecss: '',
			// Hide/show all elements on page.
			hideall: '',
			// Temporary show elements hidden by “page clean-up”.
			showhidden: ''
		},
		// Remove various parts of page on “watch” pages.
		cleanwatch: {
			// Hide bar at top of the page that shows news like stuff.
			ticker: false,
			// Hide page header (logo, search form, links).
			header: false,
			// Hide video title.
			videotitle: false,
			// Headline user information.
			headuser: false,
			// Subscribe button.
			subscribe: false,
			// Hide branding info from page.
			brand: false,
			// Whole sidebar.
			allsidebar: false,
				// Featured videos in sidebar.
				featured: false,
				// Suggested videos in sidebar.
				suggestions: false,
			// All buttons beneath the player.
			allbuttons: false,
				// Like/dislike this button.
				likebutton: false,
				// Add to queue/favourites/playlist button.
				addtobutton: false,
				// Share this video button.
				sharebutton: false,
				// Get video embed code button.
				embedbutton: false,
				// Flag as inappropriate button.
				flagbutton: false,
				// Show video statistics button.
				statsbutton: false,
				// Interactive Transcript button.
				transcript: false,
			// Video view counter.
			viewcount: false,
			// Flash promo.
			flashpromo: false,
			// Video description.
			description: false,
			// All comments.
			allcomments: false,
				// Up-loader’s comments.
				uploader: false,
				// Top rated comments.
				toprated: false,
				// Video responses.
				responses: false,
				// Comments (titled as “All comments”).
				comments: false,
			// Page footer.
			footer: false
		},
		// Add custom CSS to page.
		enablecustomstyle: false,
		// Custom style to add to page.
		customstyle: '',
		// Show only videp player when Opera is in full screen mode.
		fullscreenstyle: false,
		// Replace YouTube logo.
		customlogo: false,
		// Use light icons for buttons added by extension.
		uselighticons: false,
		// Redefine colours on page.
		enablecustomcolors: false,
		// Redefined colours. Can be any CSS acceptable colour.
		// See http://www.w3.org/TR/css3-color/#colorunits.
		customcolor: {
			pagebackground: "#ffffff",
			pagecolor: "#000000",
			linkcolor: "#0033cc",
			videolinkhover: "#d1e1fa",
			videothumbbackground: "#ffffff",
			buttonbackground: "#f6f6f6",
			buttonbackgroundhover: "#f3f3f3",
			buttonborder: "#cccccc",
			buttoncolor: "#000000",
			titlecolor: "#333333",
			commenthover: "#eeeeee",
			infocolor: "#666666"
		},
		// Disable autoplay on new videos.
		disableautoplay: false,
		// Disable autoplay on every video.
		disableautoplayalways: false,
		// Play video when page is focused.
		playonfocus: false,
		// Play video only if tab is focused first time.
		onlyonfirstfocus: false,
		// Force play on focus.
		forceplayonfocus: false,
		// Add button to toolbar.
		addtoolbarbutton: false,
		// Add pop-up to toolbar button.
		addbuttonpopup: true,
		// Add pop-up to toolbar button even if there’s
		// one video available to control.
		buttonpopupalways: true,
		// Check for update on start-up.
		updatecheck: true,
		// Check for unapproved versions.
		unapprovedcheck: false
	};

// This preferences are not shown in preferences page.
// They can be changed only via Opera Dragonfly.
var hiddenPreferences = {
		// Current ExtendTube version.
		version: extVersion,
		// When showing/hiding lyrics should page be scrolled for
		// lyrics or video to be visible.
		scrollonlyricsdisplay: true,
		// Show lyrics button always. If set to “true” lyrics button
		// will be always visible. If not, ExtendTube will search for
		// artist and title and, only if find any, add a button.
		lyricsenablealways: false,
		// Whether lyrics search log should remain visible upon completed search.
		lyricssearchlog: false,
		// Should history navigation mode be overridden. If set to “false” can
		// cause problems while navigating through tab history (like video not
		// being played on page load and toolbar button showing wrong video count).
		overridehistory: true,
		// Mouse hover delay for thumbnail preview.
		thumbhoverdelay: 3000,
		// How fast pop-up should be updated (milliseconds).
		popupupdateinterval: 456,
		// Interval at which to check for new version (in hours).
		updateinterval: 5,
		// Time of last check for update (UNIX time).
		// This value will schedule update for five minutes after first run.
		updatechecktime: Date.now() - 36e5 * (5 - 1 / 12),
		// Style used by injected scripts.
		style: style,
		// Localised strings used by injected scripts.
		localisedStrings: localisedStrings,
		// Details about available video formats (used by injected scripts).
		videoFormat: videoFormat
	};

// This are recommended preferences. This object contain parts of
// “defaultPreferences” and “hiddenPreferences” that is recommended and
// will be set when extension is installed.
var recommendedPreferences = {
		hideannotations: true,
		enabledownload: true,
		loop: true,
		loopbutton: true,
		extrabuttons: true,
		enablepopout: true,
		thumbpreview: true,
		lyrics: true,
		enableshortcutkeys: true,
		exposeplayershortcuts: true,
		shortcut: {
			loopsection: 'o',
			marksectionstart: '[',
			marksectionend: ']',
			playpause: "Space",
			framestep: '.',
			seekback: "Left",
			seekforward: "Right",
			expandplayer: 'w',
			popplayer: 'b',
			showlyrics: 'l',
			togglecolors: 'c',
			togglecss: 's',
			hideall: 'h',
			showhidden: 'a'
		},
		cleanwatch: {
			brand: true,
			sharebutton: true,
			embedbutton: true,
			flagbutton: true,
			statsbutton: true,
			flashpromo: true,
			responses: true,
			footer: true
		},
		replace: ' ',
		disableautoplay: true,
		onlyonfirstfocus: true,
		addtoolbarbutton: true,
		customcolor: {
			pagebackground: "#2b394a",
			pagecolor: "#c3c3c3",
			linkcolor: "#00a2e8",
			videolinkhover: "hsla(214, 37.5%, 59.216%, 0.38)",
			videothumbbackground: "#4c7780",
			buttonbackground: "#2c4552",
			buttonbackgroundhover: "#2c5152",
			buttonborder: "hsla(198, 100%, 45.49%, 0.58)",
			buttoncolor: "#ffc90e",
			titlecolor: "#f37318",
			commenthover: "hsla(213, 26.627%, 33.137%, 0.65)",
			infocolor: "#22b14c"
		},
		customstyle: "\
/* This style is just an example. It may not work at all. */\n\
#homepage-sidebar-ads,\n\
#default-language-box {\n\
	display: none !important;\n\
}\n\
.yt-uix-button-player:focus {\n\
	outline: none !important;\n\
}",
		fullscreenstyle: true,
		actions: {
			"EXAMPLE-expand-video-description": {
				enabled: false,
				exec: "\
// This action is just an example. It may not work at all.\n\
var description = document.querySelector(\"#watch-description\");\n\
if (description)\n\
	description.classList.remove(\"yt-uix-expander-collapsed\");\n",
				trigger: "DOMContentLoaded"
			},
			"EXAMPLE-prevent-video-autobuffering": {
				enabled: false,
				exec: "\
// This action is just an example. It may not work at all.\n\
window.setTimeout(function () {\n\
	xtt.player.control(\"stop\");\n\
}, 1000);\n",
				trigger: "player ready"
			},
			"I'M-NOT-GUINEA-PIG": {
				enabled: true,
				exec: "\
// This action will be enabled on every strtup.\n\
// If you want to disable it change its code.\n\
var expUI = [\"jZNC3DCddAk\", \"vSPn-CmshUU\", \"9UnXBzJIHDc\", \"pfnTZqEKHEE\", \"eKxEWQ3xcc8\", \"wyVhs9Df-0E\"],\n\
	expCookie = xtt.getCookie(\"VISITOR_INFO1_LIVE\");\n\
\n\
if (expCookie && -1 < expUI.indexOf(expCookie)) {\n\
	document.cookie = \"VISITOR_INFO1_LIVE=; path=/; domain=.youtube.com\";\n\
	window.location.reload();\n\
}\n",
				trigger: "immediately"
			}
		}
	};

// Check to see if preferences are removed or preferences structure is changed
// from outside of extension (e.g. via Dragonfly) and fix if necessary.
function comparePrefs() {
	var version = pref.getItem("version"),
		defs = Object.union(defaultPreferences, hiddenPreferences);
	if (version && String.natcmp(version, extVersion) < 0) {
		exportPreferences();
		checkOldStructure();

		pref.setPref("style", defaultPreferences.style);
		pref.setPref("localisedStrings", defaultPreferences.localisedStrings);
		pref.setPref("videoFormat", defaultPreferences.videoFormat);
	}

	log.info("prefs:",
		"Comparing preferences structure."
	);

	var changes = compareStructure(defs);
	var changedItems = changes.wrong.concat(changes.missing.filter(function (item) { return !/^actions\./.test(item); }));

	// If there are changes restore them from recommended preferences.
	if (changedItems.length) {
		defs = Object.union(recommendedPreferences, defs);

		changedItems.forEach(function (item) {
			var key = item.split('.');
			var newPref = defs[key[0]];

			if (key[1]) {
				newPref = pref.getPref(key[0]);
				newPref[key[1]] = defs[key[0]][key[1]];
			}

			pref.setPref(key[0], newPref);
		});

		log.warn("prefs:",
			"Preferences structure is changed outside of the extension. Changes are set to recommended preferences.",
			"Changed items are:",
			changedItems.join(", ") + '.'
		);
	}
	else {
		log.info("prefs:",
			"Preferences structure is OK."
		);
	}

	checkActions();
}

// Compare structure of given object with preferences.
function compareStructure(object) {
	var prefs = {},
		keys = Object.keyUnion(defaultPreferences, hiddenPreferences);

	// Build preferences structure.
	keys.forEach(function (key) {
		if (key != "version" && key != "firstrun")
			prefs[key] = pref.getPref(key);
	});

	var diff = {
			// Missing from preferences.
			missing: Object.keyComplement(prefs, object),
			// Not part of preferences.
			excess: Object.keyComplement(object, prefs),
			// Type of properties is different.
			wrong: []
		};

	Object.keyIntersection(object, prefs).forEach(function (key) {
		// Item deleted by Opera.
		if (prefs[key] === null)
			diff.missing.push(key);
		// Items are not of same type.
		else if (Object.internalClass(prefs[key]) != Object.internalClass(object[key]))
			diff.wrong.push(key);
		else if (Object.isObject(prefs[key])) {
			var objdiff = {
					missing: Object.keyComplement(object[key], prefs[key]),
					excess: Object.keyComplement(prefs[key], object[key]),
					wrong: []
				};

			Object.keyIntersection(object[key], prefs[key]).forEach(function (seckey) {
				if (typeof prefs[key][seckey] != typeof object[key][seckey])
					objdiff.wrong.push(seckey);
			});

			diff.missing = diff.missing.concat(objdiff.missing.map(function (element) { return key + '.' + element; }));
			diff.excess = diff.excess.concat(objdiff.excess.map(function (element) { return key + '.' + element; }));
			diff.wrong = diff.wrong.concat(objdiff.wrong.map(function (element) { return key + '.' + element; }));
		}
	});

	return diff;
}

// Reset all preferences to default.
function loadDefaultPreferences() {
	for (var key in defaultPreferences) {
		// Skip this ones.
		if (/firstrun|version|updatechecktime/.test(key))
			continue;

		pref.setPref(key, defaultPreferences[key]);
	}

	log.info("prefs:",
		"Preferences are (re)setted to default values."
	);
}

// This function will change recommended preferences but other will be left unchanged.
function loadRecommendedPreferences(all) {
	for (var key in recommendedPreferences) {
		if (!all && /customstyle|actions/.test(key))
			continue;

		if (Object.isObject(recommendedPreferences[key]))
			pref.setPref(key, Object.union(recommendedPreferences[key], pref.getPref(key)));
		else
			pref.setPref(key, recommendedPreferences[key]);
	}

	checkActions(true);

	log.info("prefs:",
		"Some preferences are (re)setted to recommended values."
	);
}

// Export preferences for later import.
function exportPreferences(event) {
	var exp = {};
	for (var key in defaultPreferences)
		exp[key] = pref.getPref(key);
	for (key in hiddenPreferences)
		exp[key] = pref.getPref(key);

	delete exp.localisedStrings;
	delete exp.style;
	delete exp.videoFormat;
	exp = window.JSON.stringify(exp, null, 4);

	var header ="\
// ╭───────────────────────────────────────────────────╮\n\
// │ Please save this file so you can import it later. │\n\
// ╰───────────────────────────────────────────────────╯\n\
//\n\
// ExtendTube: Exported preferences\n\
// date, time: " + (new Date()).format("%e.%m.%Y, %T").trim() + "\n\
//    version: " + pref.getItem("version") + "\n\n";

	var tab = {
		url: "data:application/javascript," + window.encodeURIComponent(header + exp),
		focused: true
	};

	if (bgProcess)
		bgProcess.extension.tabs.create(tab);
	else
		extension.tabs.create(tab);

	log.info("prefs:",
		"Preferences are exported."
	);
}

// Check for old preferences structure and convert them to new one.
function checkOldStructure() {
	var actions = pref.getPref("actions");

	if (Array.isArray(actions)) {
		var newpref = {}
		actions.forEach(function (action) {
			newpref[action.id] = {};
			newpref[action.id].enabled = action.enabled;
			newpref[action.id].exec = action.exec;
			newpref[action.id].trigger = action.when;
		});

		pref.setPref("actions", newpref);

		log.warn("prefs:",
			"An old structure for actions detected and converted to new one."
		);
	}
	else if (Object.isObject(actions)) {
		var changed = false;
		for (var id in actions) {
			if (actions[id].when) {
				actions[id].trigger = actions[id].when;
				delete actions[id].when;
				changed = true;
			}
		}

		if (changed) {
			pref.setPref("actions", actions);

			log.warn("prefs:",
				"An old structure for actions detected and converted to new one."
			);
		}
	}
}

// Check if necessary actions are present.
function checkActions(restoreCode) {
	var actions = pref.getPref("actions"),
		changed = false;

	if (!Object.isObject(actions)) {
		log.error("prefs:",
			"Could not get actions from widget storage."
		);
		return;
	}

	if (!actions.hasOwnProperty("I'M-NOT-GUINEA-PIG") || restoreCode) {
		actions["I'M-NOT-GUINEA-PIG"] = recommendedPreferences.actions["I'M-NOT-GUINEA-PIG"];
		changed = true;
	}
	else {
		if (!actions["I'M-NOT-GUINEA-PIG"].enabled) {
			actions["I'M-NOT-GUINEA-PIG"].enabled = true;
			changed = true;
		}
		if (actions["I'M-NOT-GUINEA-PIG"].trigger != "immediately") {
			actions["I'M-NOT-GUINEA-PIG"].trigger = true;
			changed = true;
		}
	}

	if (changed) {
		pref.setPref("actions", actions);

		log.warn("prefs:",
			"I'M-NOT-GUINEA-PIG action restored."
		);
	}
}

});