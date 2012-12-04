// ==UserScript==
// @include 		https://addons.opera.com/*
// ==/UserScript==

opera.isReady(function() {

/*
 * Copyright 2012 Darko Pantić (pdarko@myopera.com)
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

(function (window, document, extension) {
	if (window.location.pathname.indexOf("/extendtube/") < 0)
		return;

	document.addEventListener("DOMContentLoaded", insertNotice, false);
	extension.addEventListener("disconnect", connectionLost, false);

	function insertNotice(event) {
		var ff = document.querySelector("#feedback-form"),
			span = document.createElement("span");

		if (!ff)
			return;

		addStyle();

		span.setAttribute("id", "xtt-notice");
		if (window.location.search.indexOf("reports") < 0) {
			span.textContent =
				"Please do not ask questions here. " +
				"I do read reviews, but I can not answer your question here. " +
				"To ask question go to support page or write me an email (pdarko@myopera.com).";
		}
		else {
			span.setAttribute("class", "link");
			span.textContent = "Before reporting an issue please read this (click here).";
			span.addEventListener("click", function () {
				extension.postMessage({subject: "show bug report window"});
			}, false);
		}

		ff.insertBefore(span, ff.firstChild);
	}

	function insertReportNotice(event) {
		var ff = document.querySelector("#feedback-form"),
			span = document.createElement("span");

		if (!ff)
			return;


		ff.insertBefore(span, ff.firstChild);
	}

	function connectionLost(event) {
		var notice = document.querySelector("#xtt-notice");
		if (notice)
			notice.parentNode.removeChild(notice);
	}

	function addStyle() {
		var style = document.createElement("style");

		style.setAttribute("type", "text/css");
		style.textContent = "\
#xtt-notice {\n\
	float: right;\n\
	color: red;\n\
	font-size: 1.3em;\n\
	-o-transition: all .2s;\n\
}\n\
#xtt-notice.link {\n\
	cursor: pointer;\n\
}\n\
#xtt-notice ~ ul {\n\
	clear: right;\n\
}\n\
#xtt-notice:hover {\n\
	color: #009DF0;\n\
}\n\
#xtt-notice:active {\n\
	color: #5270a7;\n\
	text-shadow: 0 0 2px #5270a7;\n\
}\n";

		document.querySelector("head").appendChild(style);
	}
})(window, window.document, opera.extension);

});