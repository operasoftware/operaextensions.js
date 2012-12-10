function initLink() {
	document.getElementById("link-status").className = "checking...";
	if(opera.link.loadToken()) {
		opera.link.testAuthorization(function(result) {
			authorized = result;
			document.getElementById("configure-link").className = "disabled";
			document.getElementById("disable-link").className = "";
			document.getElementById("link-status").className = "";
		});
	} else {
		document.getElementById("configure-link").className = "";
		document.getElementById("disable-link").className = "disabled";
		document.getElementById("link-status").className = "disabled";
	}
}

window.addEventListener("DOMContentLoaded", function() {
	opera.link.consumer('5ylmz7Z2ccww4bh2dc1neMv4b4namBJq', 'XcrGsCDEXRprPLzz9Oo3D0Bz9PwVaCEx');
	document.getElementById("export").addEventListener("click", handleExport, false);
	document.getElementById("import").addEventListener("change", handleFileUpload, false);
	var sync = document.getElementById("syncInterval");
	sync.value = localStorage.getItem("syncInterval") || 5;
	sync.addEventListener("change", handleChangeSyncInterval, false);
	var lock = document.getElementById("lockAutomatically");
	lock.checked = (localStorage.getItem("lockAutomatically")==1) ? "checked" : "";
	lock.addEventListener("change", handleLock);

	initLink();

}, false);
function handleLock(evt) {
	localStorage.setItem("lockAutomatically", evt.srcElement.checked?1:0);
}

function handleChangeSyncInterval(evt) {
	localStorage.setItem("syncInterval", evt.srcElement.value);
	opera.extension.postMessage({
		action : 'changeSyncInterval'
	});
}

function handleFileUpload(evt) {
	var file = evt.target.files[0];
	// FileList object

	var reader = new FileReader();

	reader.onload = function(evt) {
		try {
			var importData = JSON.parse(evt.target.result);
			if(importData.app !== "to-read-sites") {
				throw "Wrong file";
			}
			var entries = JSON.parse(importData.data);
			for(var i = 0, entry; entry = entries[i]; i++) {
				if(entry.title === undefined || entry.url === undefined) {
					throw "Wrong data format";
				}
			}
			var currentEntries = JSON.parse(localStorage.getItem("eventsList"));
			if(currentEntries === null) {
				currentEntries = [];
			}
			currentEntries = currentEntries.concat(entries);
			localStorage.setItem("eventsList", JSON.stringify(currentEntries));

			opera.extension.postMessage({
				action : "setBadge",
				size : currentEntries.length
			});
			opera.extension.postMessage({
				action : "init"
			});
			alert("Your sites have been imported");
		} catch (e) {
			alert('Could not import data: ' + e);
		}
	};

	reader.readAsText(file);

}

function handleExport() {
	var items = localStorage.getItem("eventsList");
	if(items == null) {
		alert("There is nothing to export");
		return;
	}
	var elements = {
		app : "to-read-sites",
		version : "2",
		"data" : items
	};
	window.open("data:text/plain;charset=utf-8," + escape(JSON.stringify(elements)));
}

function handleConfigureLink() {
	opera.extension.postMessage({
		action : "request_token"
	});
}

function handleDisableLink() {
	authorized = false;
	// opera.link.deauthorize();
	// opera.link.clearSavedToken();
	opera.extension.postMessage({
		action : "disable-link"
	});
	document.getElementById("configure-link").className = "";
	document.getElementById("disable-link").className = "disabled";
	document.getElementById("link-status").className = "disabled";
}

opera.extension.onmessage = function(e) {
	switch (e.data.action) {
		case 'update':
			if(updateAction) {
				updateAction(e.data);
				updateAction = null;
			}
			break;
		case 'import_error':
			errorStatus('import');
			var el = useFileApi ? $('#import_fileselect') : $('#import_textarea');
			el.disabled = $('#import').disabled = importing = false;
			break;
		case 'import_done':
			closeStatus('import');
			var el = useFileApi ? $('#import_fileselect') : $('#import_textarea');
			el.disabled = $('#import').disabled = importing = false;
			break;
		case 'authorized':
			authorized = true;
			initLink();
			break;
	}

}