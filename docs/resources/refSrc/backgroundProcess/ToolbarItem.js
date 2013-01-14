/**
* ToolbarItem is used to create items such as buttons on the toolbar.
*<pre class="brush: js">
window.addEventListener("load", function() {
  var button;
  var props = {
    disabled: false,
    title: "My Extension",
    icon: "icon.png"
  };
  button = opera.contexts.toolbar.createItem(props); // create button
  opera.contexts.toolbar.addItem(button); // add button to the browser
  button.addEventListener("click", doSomething, false); // add event listener
}, false);

function doSomething(event){
  window.opera.postError('Button clicked!');
}
</pre>
* @constructor
**/
function ToolbarItem(){}

/**
* This event is fired when the item in the <code>ToolbarItem</code> is clicked.
*<pre class="brush: js">
var button = opera.contexts.toolbar.createItem(props);
button.addEventListener('click', function(event) {
  window.opera.postError('Button clicked.');
}, false);
opera.contexts.toolbar.addItem(button);
</pre>
* @param {EventListener} eventListener The function that is executed when the item in the <code>ToolbarItem</code> is clicked.
**/
ToolbarItem.prototype.onclick = function(){};

/**
* This event is fired when the item in the <code>ToolbarItem</code> is removed.
*<pre class="brush: js">
var button = opera.contexts.toolbar.createItem(props);
button.addEventListener('remove', function(event) {
  window.opera.postError('Button removed.');
}, false);
opera.contexts.toolbar.addItem(button);
</pre>
* @param {EventListener} eventListener The function that is executed when the item in the <code>ToolbarItem</code> is removed. 
**/
ToolbarItem.prototype.onremove = function(){};

/**
* This read-only property indicates if the <code>ToolbarItem</code> is disabled. By default, it is set to <code>false</code> (meaning the item is enabled).
* @type Boolean   
**/
ToolbarItem.prototype.disabled = "";

/**
* This read-only property represents the <code>title</code> of the item, which is exposed to the user (e.g., as a tooltip when hovering over the item with a mouse).
* @type DOMString 
**/
ToolbarItem.prototype.title = "";

/**
* This read-only property represents the icon for the <code>ToolbarItem</code>. It can reference the relative path to a data URI, an image located inside the package, or it can point to an external URL.
* @type DOMString 
**/
ToolbarItem.prototype.icon = "";

/**
* This read-only property represents the <code>Badge</code> for the <code>ToolbarItem</code>.
* @type Badge 
**/
ToolbarItem.prototype.badge = new Badge(); 

/**
* This read-only property represents the <code>Popup</code> for the <code>ToolbarItem</code>.  
* @type Popup 
**/
ToolbarItem.prototype.popup = new Popup(); 

/**
* This method is used to listen for events being dispatched.
*<pre class="brush: js">
button = opera.contexts.toolbar.createItem(props); // create button
opera.contexts.toolbar.addItem(button); // add button to the browser
button.addEventListener("click", doSomething, false); // add event listener
</pre>
* @param {EventType} type Type of event. Allowed values are: <code>click</code> and <code>remove</code>.
* @param {EventListener} eventListener The function that is executed when the event occurs.
* @param {useCapture} useCapture Boolean: should be kept as <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
ToolbarItem.prototype.addEventListener = function(){};

/**
* This method removes a listener from receiving an event.
*<pre class="brush: js">
button = opera.contexts.toolbar.createItem(props); // create button
opera.contexts.toolbar.addItem(button); // add button to the browser
button.addEventListener("click", doSomething, false); // add event listener
// Your code goes here
button.removeEventListener("click", doSomething, false); // remove event listener
</pre>
* @param {EventType} type Type of event. Allowed values are: <code>click</code> and <code>remove</code>.
* @param {EventListener} eventListener The function to be removed.
* @param {useCapture} useCapture Boolean: should be kept as <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
ToolbarItem.prototype.removeEventListener = function(){};
