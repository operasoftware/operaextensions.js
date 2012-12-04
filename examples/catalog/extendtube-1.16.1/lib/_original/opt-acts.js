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

var xhr = new XMLHttpRequest();
xhr.open("get", "/share/tmpl/action.tmpl", false);
xhr.send();

var actionTmpl = xhr.responseText;

log.info("opt-action:",
	"Template for actions is loaded."
);

// Fill actions section of page.
function fillActions() {
	var actions = pref.getPref("actions");
	for (var id in actions) {
		actions[id].id = id;
		createAction(actions[id]);
	}

	log.info("opt-action:",
		"Preferences page is filled with actions."
	);
}

// Create interface for an action item.
function createAction(action) {
	if (!action)
		return;

	var fragment = document.createElement("li");
	fragment.id = "action/" + action.id;
	fragment.insertAdjacentHTML("afterbegin", actionTmpl);

	var id = fragment.querySelector("input.id"),
		state = fragment.querySelector("input.state"),
		trigger = fragment.querySelector("select"),
		exec = fragment.querySelector("textarea"),
		save = fragment.querySelector("button.save"),
		del = fragment.querySelector("button.delete");

	state.id = "state-" + action.id + '-' + Math.random().toString().substr(2);
	state.nextElementSibling.htmlFor = state.id;

	id.addEventListener("input", notSaved, false);
	state.addEventListener("change", changeActionState, false);
	trigger.addEventListener("change", notSaved, false);
	exec.addEventListener("input", notSaved, false);
	save.addEventListener("click", saveAction, false);
	del.addEventListener("click", deleteAction, false);

	if (!action.enabled)
		id.readOnly = true;
	else
		state.nextElementSibling.textContent = "disable";
	Array.prototype.forEach.call(trigger, function (option) {
		if (option.value == action.trigger)
			option.selected = true;
	});
	save.disabled = true;

	if (arguments.callee.caller.name == "addNewAction") {
		fragment.id = "new/" + action.id;
		state.disabled = true;
		del.textContent = "Cancel new action";
		save.disabled = false;
		id.addClass("not-saved");
		trigger.addClass("not-saved");
		exec.addClass("not-saved");
		id.focus();
	}
	id.value = action.id;
	state.checked = action.enabled;
	exec.value = action.exec;

	var actions = document.getElementById("actions");
	actions.insertBefore(fragment, actions.lastElementChild);

	if (arguments.callee.caller.name == "addNewAction")
		scrollPage(save.offsetFromTop - document.documentElement.scrollTop - window.innerHeight + 151);
}

// Mark changed element.
function notSaved(event) {
	this.addClass("not-saved");
	this.parentNode.querySelector("button.save").disabled = false;
}

// Enable/disable action.
function changeActionState(event) {
	var actions = pref.getPref("actions"),
		sid = this.parentNode.id.split('/')[1];

	for (var id in actions) {
		if (sid == id) {
			actions[id].enabled = this.checked;

			pref.setPref("actions", actions);

			var logstate = "disabled";
			if (this.checked) {
				logstate = "enabled";
				this.nextElementSibling.textContent = "disable";
				this.nextElementSibling.nextElementSibling.readOnly = false;
			}
			else {
				this.nextElementSibling.textContent = "enable";
				this.nextElementSibling.nextElementSibling.readOnly = true;
			}

			log.info("opt-action:",
				"Action “" + id + "” is " + logstate + '.'
			);
			break;
		}
	}
}

// Save changed action.
function saveAction(event) {
	var actions = pref.getPref("actions"),
		li = this.parentNode.parentNode.parentNode;

	var newid = li.querySelector("input.id"),
		oldid = li.id.split('/'),
		taken = false;

	for (var id in actions) {
		if (id == newid.value) {
			taken = true;
			break;
		}
	}
	// Prevent overwriting an action. Check for id when saving
	// action or when changing (id) of old one.
	if ((oldid[0] == "new" || oldid[1] != newid.value) && taken) {
		window.alert("This ID is already taken!");
		newid.focus();
		// Bring cursor to the end of input field.
		li = newid.value;
		newid.value = '';
		newid.value = li;

		log.warn("opt-action:",
			"Action with id “" + li + "” cannot be saved. Id is already in use."
		);
		return;
	}

	var trigger = li.querySelector("select"),
		exec = li.querySelector("textarea");

	// Adding new action.
	if (oldid[0] == "new") {
		actions[newid.value] = {
			enabled: true,
			exec: exec.value.replace(/\r/g, ''),
			trigger: trigger.value
		};

		log.info("opt-action:",
			"A new action with id “" + newid.value + "” will be created."
		);
	}
	// Updating existing action.
	else {
		actions[newid.value] = {
			enabled: true,
			exec: exec.value.replace(/\r/g, ''),
			trigger: trigger.value
		};
		// Action ID is changed. Delete old one.
		if (oldid[1] != newid.value)
			delete actions[oldid[1]];

		log.info("opt-action:",
			"Action with id “" + newid.value + "” will be updated."
		);
	}

	pref.setPref("actions", actions);

	newid.removeClass("not-saved");
	trigger.removeClass("not-saved");
	exec.removeClass("not-saved");
	li.id = "action/" + newid.value;
	li.querySelector("input.state").disabled = false;
	li.querySelector("button.delete").textContent = "Delete action";

	this.disabled = true;
}

// Delete action.
function deleteAction(event) {
	var actions = pref.getPref("actions"),
		sid = this.parentNode.id.split('/');

	if (sid[0] == "new") {
		log.warn("opt-action:",
			"Creating new action is cancelled."
		);
	}
	else {
		for (var id in actions) {
			if (sid[1] == id) {
				delete actions[id];

				pref.setPref("actions", actions);

				log.warn("opt-action:",
					"Action “" + id + "” is deleted."
				);
				break;
			}
		}
	}

	this.parentNode.parentNode.removeChild(this.parentNode);
}

// Add new action.
function addNewAction(event) {
	createAction({
		enabled: true,
		id: "new-action",
		exec: '',
		trigger: "develop"
	});
}

// Remove interface for all actions.
function removeActions() {
	var actions = document.querySelectorAll("#actions > li:not(:last-child)");
	Array.prototype.forEach.call(actions, function(element) {
		element.parentNode.removeChild(element);
	});
}

});