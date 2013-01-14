/**
* MenuItem is used to create items that can be injected in to the right-click context menus of web pages.
*<pre class="brush: js">
window.addEventListener("load", function() {
  var item;
  var itemProps = {
    title: 'Context Menu Example',
    onclick: function(event) {
      console.log('Menu item clicked on ' + event.pageURL);
    }
  }
  item = opera.contexts.menu.createItem(itemProps); // create menu item
  opera.contexts.menu.addItem(item); // add menu item to the browser's context menu system
  item.addEventListener("click", doSomething, false); // add event listener
}, false);

function doSomething(event){
  window.opera.postError('Menu item clicked!');
}
</pre>
* @constructor
**/
function MenuItem(){}

/**
* This event is fired when the item in the <code>MenuItem</code> is clicked.
*<pre class="brush: js">
var item = opera.contexts.menu.createItem(itemprops);
item.addEventListener('click', function(event) {
  window.opera.postError('Menu item clicked.');
}, false);
opera.contexts.menu.addItem(item);
</pre>
* @param {EventListener} eventListener The function that is executed when the item in the <code>MenuItem</code> is clicked.
**/
MenuItem.prototype.onclick = function(){};

/**
* This read-only property is an indicator of whether a DOM menu item is clickable on activation. If the value is 'true' then this item will be displayed and is clickable in the targeted context menu(s). If the value is 'false' then this item will not be displayed in any of the targeted context menu(s). 
*
* This attribute defaults to 'false'.
* @type Boolean   
**/
MenuItem.prototype.disabled = false;

/**
* This read-only property represents the <code>title</code> of the item, which is exposed to the user as the content of the context menu item.
* @type DOMString 
**/
MenuItem.prototype.title = "";

/**
* This read-only property represents the icon for the <code>MenuItem</code>. It can reference the relative path to a data URI, an image located inside the package, or it can point to an external URL.
* @type DOMString 
**/
MenuItem.prototype.icon = "";

/**
* This read-only property represents the type of a DOM menu item. The list of valid type values for this attribute include: 'entry', 'folder' and 'line'. 
*
* This attribute defaults to a value of 'entry' if an invalid value is provided.
* @type DOMString 
**/
MenuItem.prototype.type = 'entry';

/**
* This is a settable attribute that can be used by a developer to identify the source of a click event in the case that they register a click event listener from an injected script context. This attribute defaults to an empty string.
* @type DOMString
**/
MenuItem.prototype.id = "";

/**
* This read-only property represents the list of contexts that this context menu item will appear in. The list of valid context values for this attribute include: 'all', 'page', 'frame', 'selection', 'link', 'editable', 'image', 'video' and 'audio'. 
*
* This attribute defaults to an array with a single entry of 'page'. Any of the values within this array that are not contained in the list of valid context values then this value must be ignored when displaying a context menu item. 
*
* If this array does not contain any valid context values then this context menu item is ignored when displaying a context menu item.
* @type Array
**/
MenuItem.prototype.contexts = new Array();

/**
* This read-only property represents an array of rules expressing the intended origin of the domains on which to match before activating the given DOM menu item. Any invalid rules will be ignored.
*
* If this attribute is null or an empty array or this attribute contains only invalid rules, then the context menu item will match on all origin domains (i.e. operate as if a single rule is provided with a value of *).
* @type Array
**/
MenuItem.prototype.documentURLPatterns = new Array();

/**
* This read-only property represents an array of rules expressing the hyperlink target domains on which to match before activating this DOM menu item. Any invalid rules must be ignored. If this attribute is null or an empty array or this attribute contains only invalid rules, then match on all target domains (i.e. operate as if a single rule is provided with a value of *).
* @type Array 
**/
MenuItem.prototype.targetURLPatterns = new Array(); 

/**
* This method is used to listen for events being dispatched.
*<pre class="brush: js">
item = opera.contexts.menu.createItem(itemprops); // create menu item
opera.contexts.menu.addItem(item); // add menu item to the browser
item.addEventListener("click", doSomething, false); // add event listener
</pre>
* @param {EventType} type Type of event. Allowed values are: <code>click</code>.
* @param {EventListener} eventListener The function that is executed when the event occurs.
* @param {useCapture} useCapture Boolean: should be kept as <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
MenuItem.prototype.addEventListener = function(type, eventListener, useCapture){};

/**
* This method removes a listener from receiving an event.
*<pre class="brush: js">
item = opera.contexts.menu.createItem(itemprops); // create menu item
opera.contexts.menu.addItem(item); // add menu item to the browser
item.addEventListener("click", doSomething, false); // add event listener
// Your code goes here
item.removeEventListener("click", doSomething, false); // remove event listener
</pre>
* @param {EventType} type Type of event. Allowed values are: <code>click</code>.
* @param {EventListener} eventListener The function to be removed.
* @param {useCapture} useCapture Boolean: should be kept as <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
MenuItem.prototype.removeEventListener = function(type, eventListener, useCapture){};
