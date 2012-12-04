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
document.addEventListener("scroll", pageScrolled, false);

var logs = {};

function pageLoaded(event) {
	extension.addEventListener("message", messageReceived, false);

	document.querySelector("select").addEventListener("change", refreshLog, false);
	document.querySelector("button#refresh").addEventListener("click", refreshLog, false);
	document.querySelector("button#export").addEventListener("click", exportLogs, false);
	refreshLog();

	window.setInterval(function () {
		if (document.querySelector("select").value == "bgProcess")
			refreshLog();

		broadcastRequest();
	}, 10000);
}

function messageReceived(event) {
	if (event.data.subject == "here is message log") {
		updateList(event);
		printLog(event.data.data);
	}
}

function broadcastRequest() {
	bgProcess.extension.broadcastMessage({ subject: "give me message log"});
}

function refreshLog() {
	hideInfo(true);
	broadcastRequest();

	var from = document.querySelector("select").value;
	if (from == "bgProcess")
		printLog({ buffer: log.buffer });
	else
		requestLog(from);
}

function printLog(data) {
	if (data.id) {
		logs[data.id].buffer = data.buffer;

		if (data.id != document.querySelector("select").value)
			return;
	}

	var atime = document.querySelector("input[type=\"radio\"]:checked");
	if (atime.value == '1')
		atime = true;
	else
		atime = false;

	hideInfo();
	document.querySelector("pre").textContent = '';

	var frag = document.createDocumentFragment();
	data.buffer.forEach(function (mesg) {
		var time = mesg.msgc.toPaddedString(3, ' ') + " [" + formatTime(data.buffer[0].time, mesg.time, atime) + ']',
			type = document.createElement("span");

		if (mesg.type == " i ")
			type.className = "info";
		else if (mesg.type == "'w'")
			type.className = "warn";
		else if (mesg.type == "{E}")
			type.className = "error";

		frag.appendChild(document.createTextNode(time));
		frag.appendChild(type);
		frag.appendChild(document.createTextNode(mesg.mesg + "\n"));
	});
	document.querySelector("pre").appendChild(frag);
}

function updateList(event) {
	var tabs = document.querySelector("select optgroup"),
		data = event.data.data;

	if (typeof logs[data.id] != "object") {
		logs[data.id] = {};
		logs[data.id].title = data.title;
		logs[data.id].source = event.ports[0];

		tabs.appendChild(new Option(data.title, data.id));
	}
}

function requestLog(from) {
	if (!logs[from]) {
		showInfo("Page is not available.");
		return;
	}

	showInfo("Getting message log from “" + logs[from].title + "”. Please wait.");
	try {
		logs[from].source.postMessage({ subject: "are you still there" });
	}
	catch (error) {
		showInfo("Message log cannot be fetched from page: “" + logs[from].title + "”. Page is probably closed. Old log will be displayed instead.", true);
		printLog({ buffer: logs[from].buffer });

		Array.prototype.some.call(document.querySelector("select"), function (option) {
			if (option.value == from && !/^\(closed\)/.test(option.textContent)) {
				option.textContent = "(closed) " + option.textContent;
				return true;
			}
		});
	}
}

function showInfo(info, note) {
	var infoel = document.querySelector("p#note");

	infoel.removeClass("hidden");
	infoel.textContent = info;

	if (note)
		infoel.addClass("note");
	else
		infoel.removeClass("note");
}

function hideInfo(force) {
	var infoel = document.querySelector("p#note");

	if (force || infoel.className.indexOf("note") < 0)
		infoel.addClass("hidden");
}

function exportLogs() {
	var header ="\
// ╭──────────────────────────────────────────────────╮\n\
// │ Please include this file when you report bug(s). │\n\
// ╰──────────────────────────────────────────────────╯\n\
//\n\
// ExtendTube: Exported debug messages\n\
//    version: " + extVersion + "\n\n",
		exp = [{ "bgProcess": log.lsmesg("%i") }];

	for (var id in logs) {
		var obj = {};
		obj[id] = log.lsmesg("%i", logs[id].buffer);
		exp.push(obj);
	}
	exp = window.JSON.stringify(exp, null, 1).replace(/(\\n)?(\[)/g, "\n\t[").trim();

	var tab = {
		url: "data:application/javascript," + window.encodeURIComponent(header + exp),
		focused: true
	};

	if (bgProcess)
		bgProcess.extension.tabs.create(tab);
	else
		extension.tabs.create(tab);
}

function pageScrolled(event) {
	var ctrl = document.querySelector(".controls");
	if (!ctrl)
		return;

	if (document.documentElement.scrollTop > 164)
		ctrl.classList.add("fixed");
	else
		ctrl.classList.remove("fixed");
}

});