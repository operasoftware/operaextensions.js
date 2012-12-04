====================
"Hacking" ExtendTube
====================

All ExtendTube preferences are defined in /lib/preferences.js file.
Most of them (but not all) are configurable in preferences page.
Those "not configurable" options can be configured via Dragonfly.
Here's how.

Open Opera Dragonfly (Ctrl+Shift+I) and click on "Debug context" button.
A menu will appear. From that menu choose "ExtendTube: Background process"
option. Then click on "Storage" tab and then on "Widget Preferences".
You're there. Just double click on preference you want to change, enter
new value and click apply.



This preferences are not configurable from preferences page:

firstrun - default false
	Only presence of this option in storage is required; value can be anything.
	If you remove it from storage you'll see "First Run" message on next start
	and recommended preferences will be loaded.

version - default is current version
	Current version of ExtendTube. If you change this option you'll see change
	log on next start.

lyricssearchlog - default false
	While searching for lyrics ExtendTube logs current progress on page.
	This option says if log should remain visible after successful search.
	On search failure log will remain visible regardless of this option.

lyricsenablealways - default false
	When lyrics are enabled ExtendTube will parse video title in search for
	artist and title of video. If it finds artist and title and, if this option
	is set to false, lyrics button will be shown on page. If this option is set
	to true lyrics button will be always visible.

scrollonlyricsdisplay - default true
	When showing and hiding lyrics should page be scrolled for lyrics (on show)
	or video (on hide) to be visible on screen.

overridehistory - default true
	Should history navigation mode be set to "compatible". If set to false can
	cause problems while navigating through tab history (like video not being
	played on page load and toolbar button not showing accurate data).
	For more information about history navigation see:
	http://www.opera.com/support/kb/view/827/.

scriptstorage - default depends on Opera's preferences
	Says whether script storage is enabled (true) or not (false). If you
	didn't change "User JS Storage Quota" this preference will be false.
	This option will be updated every time you open a YouTube page.

thumbhoverdelay - default 3000ms
	When "mouse over" is used to activate thumbnail preview how many
	milliseconds to wait before preview is activated. This time will be used
	only if preview is not yet added to page. If preview is already added delay
	will be 300ms.

popupupdateinterval - default 456ms
	How fast pop-up should be updated (milliseconds). At this interval pop-up
	will send request to opened videos for current playback status.

updateinterval - default 5
	Interval at which to check for new version (in hours) if check for
	updates is enabled.

updatechecktime  - default is 295 minutes before first run
	Time of last check for update (UNIX timestamp).

style
	This value (object) contains various styles that are used by
	injected scripts.

localisedStrings
	Localised strings used by injected scripts.

videoFormat
	Details about available video formats (used by injected scripts).
	This value contains data used in tooltips which describe available
	video formats.
