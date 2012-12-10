opera.isReady(function() {
  
  var tr = {
      addButtonLabel: "Add current page to list",
  	deleteButtonLabel: "Delete site from the list",
  	lockButtonLabel: "Lock site"
  };
  
  var eventsList = [], nextId = 1;

	function addEvent(event) {
		if(event.title === undefined || event.url === undefined) {
			return;
		}
		var node = document.createElement("li");
		node.setAttribute("data-url", event.url);
		node.innerHTML = '<div class="clickable"><div class="img" style="background: url(' + event.favicon + ') no-repeat">&nbsp;</div>' + '<div class="desc"><p>' + event.title + '<br/>' + event.url + '</p></div></div><div class="pinDiv"><input class="pin" type="checkbox" id="c' + nextId + '"/><label title="' + tr.lockButtonLabel + '" for="c' + (nextId++) + '"></label></div><div class="del" title="' + tr.deleteButtonLabel + '"></div>';
		var pinNode = node.querySelector(".pin");
		
		if(event.locked) {
			var label = node.querySelector("label");
			pinNode.checked = true;
			label.className = "checked-label";
		}
		node.querySelector(".del").onclick = function(evt) {
			deleteEvent(evt.currentTarget.parentNode);
		};
		document.getElementById("list").appendChild(node);
		node.querySelector(".clickable").onclick = function(el) {
			openLink(node, event.url);
		};
		node.querySelector(".pin").onchange = function(evt) {
			event.locked = pinNode.checked;
			if(!event.locked) {
				label.className = "";
			}
			opera.extension.postMessage({
				action : 'lock',
				url : event.url,
				locked : event.locked
			});
		};
	}

	function deleteEvent(el) {
		var list = document.getElementById("list");
		opera.extension.postMessage({
			action : 'delete',
			url : el.getAttribute("data-url")
		});
		var els = list.querySelectorAll("li");
		var index = 0;
		for(var i = 0, event; event = els[i]; i++) {
			if(event === el) {
				index = i;
				list.removeChild(el);
				opera.extension.postMessage({
					action : "setBadge",
					height : document.body.clientHeight
				});
				return;
			}
		}
	}

	function openLink(el, url) {
		if(!el.querySelector(".pin").checked) {
			// remove from list if not locked
			deleteEvent(el);
		}
		opera.extension.postMessage({
			action : "open",
			url : url
		});
	}


	opera.extension.onmessage = function(message) {
		switch (message.data.action) {
			case "add":
				addEvent(message.data.linkData);
				message.source.postMessage({
					action : "setBadge",
					height : document.body.clientHeight
				});
				break;
			case "error":
				var errorNode = document.getElementById("errorMessage");
				errorNode.innerHTML = message.data.message;
				errorNode.style.visibility = "visible";
				setTimeout(function() {
					errorNode.style.visibility = "hidden";
				}, 3000);
				break;
		}

	};

	window.addEventListener("load", function() {
		var addButton = document.getElementById("addButton");
		addButton.setAttribute("title", tr.addButtonLabel);
		addButton.onclick = function() {
			opera.extension.postMessage({
				action : "add"
			});
		}
		var list = localStorage.getItem('eventsList');
		eventsList = list ? JSON.parse(list) : [];

		for(var i = 0, event; event = eventsList[i]; i++) {
			addEvent(event);
		}
		opera.extension.postMessage({
			action : "setBadge",
			height : document.body.clientHeight
		});
	}, false);
  
});