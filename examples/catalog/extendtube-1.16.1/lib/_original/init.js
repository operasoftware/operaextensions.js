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

var document = window.document,
	opera = window.opera,
	extension = window.opera.extension,
	pref = window.widget.preferences,
	widget = window.widget;

var bgProcess = window.opera.extension.bgProcess,
	extensionAddress = window.location.protocol + "//" + window.location.hostname,
	operaVersion = window.parseFloat(window.opera.version()),
	extVersion = window.widget.version.replace(/\-.+/, ''),
	availableUpdate = '';

if (bgProcess)
	var log = bgProcess.log;
else {
	// Log messages and print them to error console.
	var log = {
			counter: 1,
			buffer: [{
				msgc: 1,
				time: Date.now(),
				mesg: "boot: Message log started.",
				type: " i "
			}],
			clearbuffer: function clearMessageLogBuffer() {
				this.buffer = [this.buffer.shift()];
				this.info("Message buffer cleared.");
			},
			pushmesg: function (mesg, type) {
				this.buffer.push({
					msgc: ++this.counter,
					time: Date.now(),
					mesg: mesg,
					type: type
				});
			},
			lsmesg: function (atime, buffer) {
				if (!buffer)
					buffer = this.buffer;

				return buffer.map(function (message) {
						return '[' + formatTime(buffer[0].time, message.time, atime) + "] " + message.type + ' ' + message.mesg;
					}, this).join("\n");
			},
			src: "ExtendTube\n‾‾‾‾‾‾‾‾‾‾",
			info: function () {
				var mesg = reduce.apply(this, arguments).trim("\n");
				mesg = getCallerName() + ": " + mesg;
				this.pushmesg(mesg, " i ");

				if (pref.getPref("loglevel") > 2)
					window.console.info(this.src + "\n" + '[' + formatTime(this.buffer[0].time, this.buffer[this.buffer.length - 1].time) + "] " + mesg + "\n");
			},
			Info: function () {
				var loglevel = pref.getPref("loglevel");
				pref.setPref("loglevel", 3);
				this.info.apply(this, arguments);
				pref.setPref("loglevel", loglevel);
			},
			warn: function () {
				var mesg = reduce.apply(this, arguments).trim("\n");
				mesg = getCallerName() + ": " + mesg;
				this.pushmesg(mesg, "'w'");

				if (pref.getPref("loglevel") > 1)
					window.console.warn(this.src + "\n" + '[' + formatTime(this.buffer[0].time, this.buffer[this.buffer.length - 1].time) + "] " + mesg + "\n");
			},
			Warn: function () {
				var loglevel = pref.getPref("loglevel");
				pref.setPref("loglevel", 3);
				this.warn.apply(this, arguments);
				pref.setPref("loglevel", loglevel);
			},
			error: function () {
				var mesg = reduce.apply(this, arguments).trim("\n");
				mesg = getCallerName() + ": " + mesg;
				this.pushmesg(mesg, "{E}");

				if (pref.getPref("loglevel") > 0 || pref.getPref("loglevel") === null)
					window.console.error(this.src + "\n" + '[' + formatTime(this.buffer[0].time, this.buffer[this.buffer.length - 1].time) + "] " + mesg + "\n");
			},
			Error: function () {
				var loglevel = pref.getPref("loglevel");
				pref.setPref("loglevel", 3);
				this.error.apply(this, arguments);
				pref.setPref("loglevel", loglevel);
			}
		};

	// Prevent log buffer overgrowth.
	window.setInterval(function () {
		var targetLength = 1e3;

		if (targetLength < log.buffer.length - 1) {
			log.info("Performing log buffer maintenance. Log buffer have", log.buffer.length, "messages");
			targetLength = log.buffer.length - targetLength;
			log.buffer.splice(0, targetLength, log.buffer[0]);
			log.info("First " + targetLength + " messages removed from log buffer.");
		}
	}, 3e5);

}

function reduce() {
	return Array.prototype.reduce.call(arguments, function (previous, argument) {
		if (Object.isObject(argument))
			return previous + Object.ls(argument) + ' ';
		else
			return previous + argument + ' ';
		}, '');
}

function formatTime(start, current, atime) {
	if (atime) {
		if (typeof atime != "string")
			atime = "%v";

		var time = (new Date(current)).format(atime);
	}
	else {
		var time = current - start;

		var second = Math.floor(time / 1000).toPaddedString(5, ' '),
			milli = (time - Math.floor(time / 1000) * 1000).toPaddedString(3);

		time = second + '.' + milli;
	}

	return time;
}

function getCallerName() {
	var caller = arguments.callee.caller;
	while (caller && !caller.name)
		caller = caller.caller;

	if (caller)
		return caller.name;
	return "global";
}

});