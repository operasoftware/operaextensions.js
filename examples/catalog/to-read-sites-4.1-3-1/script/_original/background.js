Array.prototype.removeByUrl = function(url) {
	var j = 0;
	for(var i = 0; i < this.length; i++) {
		if(this[i].url == url) {
			this.splice(i, 1);
		}
	}
};
Array.prototype.isSynced = function(url) {
	for(var i = 0; i < this.length; i++) {
		if(this[i].url == url) {
			return this[i].synced == 1;
		}
	}
	return false;
};
Array.prototype.getByUrl = function(url) {
	for(var i = 0; i < this.length; i++) {
		if(this[i].url == url) {
			return this[i];
		}
	}
	return null;
};
Array.prototype.setValue = function(url, name, value) {
	for(var i = 0; i < this.length; i++) {
		if(this[i].url == url) {
			this[i][name] = value;
			break;
		}
	}
};
var theButton, extension = opera.extension, tabs = extension.tabs, links = [];

var synchronizer = (function() {

	var id = null, syncInProgress = false, folderId = null, initialized = false;

	function init() {
		if(!initialized) {
			initialized = true;
			doSync();
			id = window.setInterval(function() {
				if(authorized) {
					doSync();
				}
			}, 1000 * 60 * (localStorage.getItem("syncInterval") || 5));
		}
	}

	function syncFinished() {
		syncInProgress = false;
	}

	function doSync() {
		if(!initialized) {
			if(id) {
				window.clearInterval(id);
			}
		}
		if(syncInProgress) {
			return;
		}
		syncInProgress = true;
		linkBookmarks.getFolderId(function(id) {
			folderId = id;
			linkBookmarks.syncAll(syncFinished);
		});
	}

	return {
		register : function() {
			opera.link.consumer('5ylmz7Z2ccww4bh2dc1neMv4b4namBJq', 'XcrGsCDEXRprPLzz9Oo3D0Bz9PwVaCEx');
			if(opera.link.loadToken()) {
				opera.link.testAuthorization(function(result) {
					authorized = result;
					if(authorized) {
						init();
					}
				});
			} else {
				authorized = false;
			}
		},
		dispose : function() {
			if(id != null) {
				window.clearInterval(id);
				id = null;
			}
			initialized = false;
			syncInProgress = false;
			authorized = false;
			tempToken = null;
			opera.link.deauthorize();
			opera.link.clearSavedToken();
		},
		verify : function(verifier) {
			if(tempToken) {
				opera.link.getAccessToken(tempToken.token, tempToken.secret, verifier, function() {
					saveAccessToken();
					if(authorized) {
						init();
					} else {
						synchronizer.dispose();
					}
				}, requestFailed);
			}
		},
		changeInterval : function() {
			if(id) {
				window.clearInterval(id);
			}
			id = window.setInterval(function() {
				if(authorized) {
					doSync();
				}
			}, 1000 * 60 * (localStorage.getItem("syncInterval") || 5));
		},
		getFolderId : function() {
			return folderId;
		}
	}
})();
var linkBookmarks = {
	/**
	 * @param item - item already added to list
	 */
	addItem : function(item) {
		if(authorized && synchronizer.getFolderId()) {
			item.synced = 1;
			if(item.title === undefined || item.url === undefined) {
				return;
			}
			opera.link.bookmarks.create({
				title : item.title,
				uri : item.url,
				description : JSON.stringify({
					favicon : item.favicon,
					locked : item.locked
				})
			}, synchronizer.getFolderId(), function(data) {
				if(data.status == opera.link.response.Ok) {
					item.id = data.response.id;
				} else {
					item.synced = 0;
					if(messageData) {
						messageData.source.postMessage({
							action : "error",
							message : "Could not sync with link",
						});
					}
					console.log(JSON.stringify(data));
				}
				tlr.save();
			});
		}
	},
	deleteItem : function(url) {
		opera.link.bookmarks.get(synchronizer.getFolderId() + "/children", function(data) {
			if(data.status == opera.link.response.Ok) {
				for(var i = 0; i < data.response.length; i++) {
					item = data.response[i];
					if(item.properties.uri == url) {
						opera.link.bookmarks.deleteItem(item.id, function(data) {
							if(data.status != opera.link.response.Deleted) {
								opera.postError("Could not delete: " + JSON.stringify(item));
							}
						});
						break;
					}
				}
			} else {
				opera.postError("Could not delete synced data");
			}
		});
	},
	getFolderId : function(callback) {
		opera.link.bookmarks.get('children', function(data) {
			if(data.status != opera.link.response.Ok) {
				opera.postError('failed to get bookmarks');
				return;
			}
			var bookmarkFolderId, found = false;
			for(var i = 0; i < data.response.length && !found; i++) {
				item = data.response[i];
				if(item.properties.title == 'To-Read sites') {
					bookmarkFolderId = item.id;
					found = true;
				}
			}
			if(!found) {
				opera.link.bookmarks.createFolder({
					title : 'To-Read sites',
				}, function(data) {
					bookmarkFolderId = data.id;
					callback(data.id);
				});
			} else {
				callback(bookmarkFolderId);
			}
		});
	},
	updateLock : function(message, url) {
		if(!authorized) {
			return;
		}
		var item = links.getByUrl(url);
		opera.link.bookmarks.update(item.id, {
			title : item.title,
			uri : item.url,
			description : JSON.stringify({
				favicon : item.favicon,
				locked : item.locked
			})
		}, function(data) {
			if(data.status != opera.link.response.Ok)
				message.source.postMessage({
					action : "error",
					message : "Error syncing",
				});
		});
	},
	syncAll : function(callback) {
		var id = synchronizer.getFolderId();
		if(!id) {
			opera.postError("Error: Folder ID is null.");
			return;
		}
		opera.link.bookmarks.get(id + "/children", function(data) {
			if(data.status == opera.link.response.Ok) {
				var toAdd = [];
				for(var i = 0; i < links.length; i++) {
					var item = links[i];
					if(item.title === undefined || item.url === undefined) {
						continue;
					}
					if(item.synced != 1) {
						toAdd.push(item);
					}
				}
				links = toAdd;
				for(var i = 0; i < data.response.length; i++) {
					var item = data.response[i];
					var description = item.properties.description ? JSON.parse(item.properties.description) : {};
					tlr.addItemWithoutPopup({
						title : item.properties.title,
						url : item.properties.uri,
						locked : description.locked || false,
						favicon : description.favicon || "",
						id : item.id,
						synced : 1
					});
				}

				var item;
				for(var i = 0; i < links.length; i++) {
					item = links[i];
					if(item.title === undefined || item.url === undefined) {
						continue;
					}
					if(item.synced != 1) {
						linkBookmarks.addItem(item);
					}
				}
				tlr.updateBadge();
				tlr.save();
			} else {
				opera.postError("Connection problem: " + data.status);
			}
			callback();
		});
	},
	requestToken : function(message) {
		if(authorized) {
			return;
		}
		if(tempToken) {
			tempToken = null;
		}
		tokenRequester = message.source;
		getRequestToken();
	}
}

var tlr = {
	init : function() {
		var list = localStorage.getItem('eventsList');
		links = list ? JSON.parse(list) : [];
		tlr.updateBadge();

	},
	addItem : function(message, tab) {
		if(tabs.getFocused() || tab) {
			var currentTab = tab || tabs.getFocused();
			if(tlr.hasLink(currentTab.url)) {
				message.source.postMessage({
					action : "error",
					message : "Site already added", // TODO i18-n
				});
				return;
			}
			var newLink = {
				title : currentTab.title,
				favicon : currentTab.faviconUrl,
				url : currentTab.url,
				synced : 0,
				locked : localStorage.getItem("lockAutomatically") == 1
			};
			links.push(newLink);
			// dodawanie
			message.source.postMessage({
				action : "add",
				linkData : newLink
			});
			tlr.save();
			linkBookmarks.addItem(newLink);
		} else {
			message.source.postMessage({
				action : "error",
				message : tr.error,
			});
		}
	},
	addItemWithoutPopup : function(item) {
		if(tlr.hasLink(item.url)) {
			links.setValue(item.url, 'synced', 1);
		} else {
			links.push(item);
		}
	},
	deleteLink : function(url) {
		linkBookmarks.deleteItem(url);
		links.removeByUrl(url);
		tlr.save();
	},
	deleteLinkWithoutPopup : function(tab) {
		links.removeByUrl(url);
	},
	hasLink : function(url) {
		for(var i = 0, item; item = links[i]; i++) {
			if(item.url == url) {
				return true;
			}
		}
		return false;
	},
	lockLink : function(message) {
		links.setValue(message.data.url, "locked", message.data.locked)
		linkBookmarks.updateLock(message, message.data.url);
		tlr.save();
	},
	openLink : function(message) {
		tabs.create({
			url : message.data.url,
			focused : true
		});
	},
	save : function() {
		localStorage.setItem('eventsList', JSON.stringify(links));
	},
	updateBadge : function(height) {
		theButton.badge.textContent = (links.length > 0) ? links.length : "";
		if(height) {
			theButton.popup.height = height + 20;
		}
	}
}

window.addEventListener("load", function() {

	var UIItemProperties = {
		disabled : false,
		title : "To-Read Sites",
		icon : "icon_18.png",
		popup : {
			href : "popup.html",
			width : "320px",
			height : "240px"
		},
		badge : {
			textContent : "",
			backgroundColor : "#1e1e1e"
		}
	}
	theButton = opera.contexts.toolbar.createItem(UIItemProperties);
	opera.contexts.toolbar.addItem(theButton);

	tlr.init();

	extension.onmessage = function(message) {
		if(!message.data.action) {
			return;
		}
		switch (message.data.action) {
			case 'init' :
				tlr.init();
				break;
			case 'setBadge':
				tlr.updateBadge(message.data.height);
				break;
			case 'open':
				tlr.openLink(message);
				break;
			case 'add':
				tlr.addItem(message);
				break;
			case 'delete':
				tlr.deleteLink(message.data.url);
				break;
			case 'lock':
				tlr.lockLink(message);
				break;
			case 'changeSyncInterval':
				synchronizer.changeInterval();
				break;
			case 'request_token':
				linkBookmarks.requestToken(message);
				break;

			case 'verifier':
				// If we get a verifier code and we're waiting for one, finish authentication
				synchronizer.verify(message.data.verifier);
				message.source.postMessage({
					action : 'close'
				});
				break;
			case 'disable-link':
				synchronizer.dispose();
				break;
		}
	};
	synchronizer.register();
}, false);
