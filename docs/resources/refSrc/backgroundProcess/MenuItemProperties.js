/**
* MenuItemProperties is a JSON-style object for creating context menu items.
*<pre class="brush: js">
window.addEventListener("load", function() {
  // Create a Context Menu based on the desired elements to activate upon:
  var contextMenuItem = opera.contexts.menu.createItem({
    title: 'Translate!',
    contexts: ['selection', 'editable']
    icon: '/images/menuitem.png',
    documentURLPatterns: [
      'http://google.com/*',
      'https://google.com/*',
      'http://*.google.com/*',
      'https://*.google.com/*'
    ],
    targetURLPatterns: null,
    onclick: doSomething
  });
 
  // Add/Bind the Context Menu Item to the Context Menu:
  opera.contexts.menu.addItem( contextMenuItem );
}, false);

function doSomething(event){
  window.opera.postError('Context menu item clicked.');
}
</pre>
* @constructor
**/
function MenuItemProperties(){}

/**
* This event fires when the <code>{@link MenuItem}</code> is clicked.
*<pre class="brush: js">
var props = {
  title: "My Context Menu Item",
  onclick: function(event) {
    window.opera.postError('Menu item clicked.');
  }	
};
</pre>
* @param {EventListener} eventListener The function that is executed when the <code>{@link MenuItem}</code> is clicked.
**/
MenuItemProperties.prototype.onclick = function(){}

/**
* This property indicates that the <code>{@link MenuItem}</code> needs to be disabled when created. If you don't include it, the default value is <code>false</code> (meaning the created item will be enabled).
* @type Boolean   
**/
MenuItemProperties.prototype.disabled = "";

/**
* This property represents the <code>title</code> of the item, which is exposed to the user as the content of the context menu item.
* @type DOMString 
**/
MenuItemProperties.prototype.title = "";

/**
* This property represents the icon for the {@link MenuItem}. It can reference the relative path to a data URI, an image located inside the package, or it can point to an external URL.
* @type DOMString 
**/
MenuItemProperties.prototype.icon = "";

/**
* This property represents the type of a DOM menu item. The list of valid type values for this attribute include: 'entry', 'folder' and 'line'. 
*
* This attribute defaults to a value of 'entry' if an invalid value is provided.
* @type DOMString 
**/
MenuItemProperties.prototype.type = 'entry';

/**
* This property can be used by a developer to identify the source of a click event in the case that they register a click event listener from an injected script context. This attribute defaults to an empty string.
* @type DOMString
**/
MenuItemProperties.prototype.id = "";

/**
* This property represents the list of contexts that this context menu item will appear in. The list of valid context values for this attribute include: 'all', 'page', 'frame', 'selection', 'link', 'editable', 'image', 'video' and 'audio'. 
*
* This attribute defaults to an array with a single entry of 'page'. Any of the values within this array that are not contained in the list of valid context values then this value must be ignored when displaying a context menu item. 
*
* If this array does not contain any valid context values then this context menu item is ignored when displaying a context menu item.
* @type Array
**/
MenuItemProperties.prototype.contexts = new Array();

/**
* This property represents an array of rules expressing the intended origin of the domains on which to match before activating the given DOM menu item. Any invalid rules will be ignored.
*
* If this attribute is null or an empty array or this attribute contains only invalid rules, then the context menu item will match on all origin domains (i.e. operate as if a single rule is provided with a value of *).
* @type Array
**/
MenuItemProperties.prototype.documentURLPatterns = new Array();

/**
* This property represents an array of rules expressing the hyperlink target domains on which to match before activating this DOM menu item. Any invalid rules must be ignored. If this attribute is null or an empty array or this attribute contains only invalid rules, then match on all target domains (i.e. operate as if a single rule is provided with a value of *).
* @type Array 
**/
MenuItemProperties.prototype.targetURLPatterns = new Array();
