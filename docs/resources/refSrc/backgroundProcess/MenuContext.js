/**
* With the <code>MenuContext</code> you can create and add items to the browser's right click context menu
* based on a range of filter criteria.
* <pre class="brush: js">
window.addEventListener("load", function(){
	
	var theMenuItem = opera.contexts.menu.createItem({  // create item
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
    onclick: function(e) {
      // call translate function with provided MenuEvent 'e' ...
    }
  }); 

	opera.contexts.menu.addItem( theMenuItem ); // add item to in-page right-click context menu
	
}, false);
</pre>
*
**/
function MenuContext(){}

/**
* This attribute contains the number of UI items held by the <code>MenuContext</code>.
* @type Number
**/
MenuContext.prototype.length = 0;


/**
* This method adds a <code>MenuItem</code> to the in-page right click context menus in the browser. To create a <code>MenuItem</code> see the <code>createItem</code> method. 
* <pre class="brush: js">
var item = opera.contexts.menu.createItem({
  title: 'Translate!',
  contexts: ['selection', 'editable']
});
opera.contexts.menu.addItem( item ); // adds it to the in-page right-click context menu
</pre>
* @param {MenuItem} item The <code>MenuItem</code> to be added.
* @param {MenuItem} before The <code>MenuItem</code> to add the first argument before in the context menu (optional).
* @throws WRONG_ARGUMENT_ERR This error is thrown if the item was not created from the same <code>MenuContext</code>.
*/
MenuContext.prototype.addItem = function(item, before){};
 
/**
* This method removes a given <code>MenuItem</code> from the in-page right-click context menu
* <pre class="brush: js">
var item = opera.contexts.menu.createItem({
  title: 'Translate!',
  contexts: ['selection', 'editable']
});
opera.contexts.menu.addItem( item ); 
opera.contexts.menu.removeItem( item ); // remove the menu item
</pre>
* @param {MenuItem} item The <code>MenuItem</code> to be removed.
* @throws WRONG_ARGUMENT_ERR This error is thrown if the item is not attached to this <code>MenuContext</code>.
*/	

MenuContext.prototype.removeItem = function(item){};

/**
* This method retrieves a <code>MenuItem</code> by index.
* @param {Number} index The ordinal number of the <code>MenuItem</code> to be retrieved.
* @return {MenuItem} The <code>MenuItem</code> at the requested location. 
* @type MenuItem 
* @throws INDEX_OUT_OF_BOUNDS_ERR 	 
*/	
MenuContext.prototype.item = function(index){};

/**
* This method creates a <code>MenuItem</code> from a given property object.
* <pre class="brush: js">
var button = opera.contexts.menu.createItem({
  title: 'Translate!',
  contexts: ['selection', 'editable']
});
</pre>
* @param {MenuItemProperties} props The <code>MenuItemProperties</code> to use when creating the <code>MenuItem</code>.
* @return The <code>MenuItem</code>, which at this point is not yet associated with the <code>MenuContext</code>.
* @type MenuItem 
* @throws WRONG_ARGUMENT_ERR This error is thrown if an item was not created from the same <code>MenuContext</code>.	 
*/	
MenuContext.prototype.createItem = function(props){}
