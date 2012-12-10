// ==UserScript==
// @include https://auth.opera.com/service/oauth/authorize
// ==/UserScript==

/*
 * This include script automatically reads the 6-digit verifier code as soon
 * as the user grants OAuth access to the application
 */

window.addEventListener('DOMContentLoaded', function(e) {

	var extensionName = 'To-Read sites';

	var verifier = document.getElementById('verifier');
	if(!verifier) {
		return;
	}
	// Check that the authorized extension is actually this one
	var p = verifier.previousElementSibling;
	if(p.textContent.indexOf(extensionName) == -1)
		return;

	// Send the verification code to the extension
	opera.extension.postMessage({
		action : 'verifier',
		verifier : verifier.textContent,
	});
	opera.extension.onmessage = function(e) {
		switch (e.data.action) {
			case 'close':
				window.close();
				break;
		}
	}
}, false);
