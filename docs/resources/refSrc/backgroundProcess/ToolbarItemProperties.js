/**
* ToolbarItemProperties is a JSON-style object for items such as toolbar buttons.
*<pre class="brush: js">
window.addEventListener("load", function() {
  var button;
  var props = {
    disabled: false,
    title: "My Extension",
    icon: "icon.png",
    popup: {
      href: 'popup.html',
      width: 200,
      height: 100
	},
	badge: {
      backgroundColor: '#ff0000',
      color: '#ffffff',
      display: 'block',
      textContent: '42'
	},
	onclick: doSomething
  };
  button = opera.contexts.toolbar.createItem(props); // create button
  opera.contexts.toolbar.addItem(button); // add button to the browser
}, false);

function doSomething(event){
  window.opera.postError('Button clicked.');
}
</pre>
* @constructor
**/
function ToolbarItemProperties(){}

/**
* This event fires when the <code>{@link ToolbarItem}</code> is clicked.
*<pre class="brush: js">
var props = {
  disabled: false,
  title: "My Extension",
  icon: "icon.png",
  onclick: function(event) {
    window.opera.postError('Button clicked.');
  }	
};
</pre>
* @param {EventListener} eventListener The function that is executed when the <code>{@link ToolbarItem}</code> is clicked.
**/
ToolbarItemProperties.prototype.onclick = function(){}

/**
* This event fires when the <code>{@link ToolbarItem}</code> is removed.
*<pre class="brush: js">
var props = {
  disabled: false,
  title: "My Extension",
  icon: "icon.png",
  onremove: function(event) {
    window.opera.postError('Button removed.');
  }	
};
</pre>
* @param {EventListener} eventListener The function that is executed when the <code>{@link ToolbarItem}</code> is removed. 
**/
ToolbarItemProperties.prototype.onremove = function(){}

/**
* This property indicates that the <code>{@link ToolbarItem}</code> needs to be disabled when created. If you don't include it, the default value is <code>false</code> (meaning the created item will be enabled).
* @type Boolean   
**/
ToolbarItemProperties.prototype.disabled = "";

/**
* This property represents the <code>title</code> of the item, which is exposed to the user (e.g., as a tooltip when hovering over the item with a mouse).
* @type DOMString 
**/
ToolbarItemProperties.prototype.title = "";

/**
* A relative link to a data URI, an image located inside the package, or it can point to an external URL.
* @type DOMString 
**/
ToolbarItemProperties.prototype.icon = "";

/**
* This property represents the {@link Badge} for the <code>{@link ToolbarItem}</code>.
*<pre class="brush: js">
props.badge = {
  backgroundColor: '#ff0000',
  color: '#ffffff',
  display: 'block',
  textContent: '42'
};
</pre>
* @type Badge 
**/
ToolbarItemProperties.prototype.badge = new Badge(); 

/**
* This property represents the <code>{@link Popup}</code> for the <code>{@link ToolbarItem}</code>.
*<pre class="brush: js">
props.popup = {
  href: 'popup.html',
  width: 200,
  height: 100
};
</pre>
* @type Popup 
**/
ToolbarItemProperties.prototype.popup = new Popup(); 
