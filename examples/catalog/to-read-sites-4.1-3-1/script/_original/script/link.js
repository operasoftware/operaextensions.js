var tempToken = null, authorized = false, tokenRequester = null;
opera.link.consumer('5ylmz7Z2ccww4bh2dc1neMv4b4namBJq', 'XcrGsCDEXRprPLzz9Oo3D0Bz9PwVaCEx');
function requestFailed(xhr) {
	opera.postError(xhr.toString);
	opera.postError('error: ' + xhr.status + ' ' + xhr.statusText);
}

function getRequestToken() {
	opera.link.requestToken(function(e) {
		tempToken = {
			token : e.token,
			secret : e.secret
		};
	}, requestFailed);
}

function saveAccessToken() {
	opera.link.saveToken();
	tempToken = null;
	authorized = true;

	if(tokenRequester) {
		tokenRequester.postMessage({
			action : 'authorized'
		});
		tokenRequester = null;
	}
}