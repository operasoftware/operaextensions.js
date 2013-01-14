/**
* With the <code>ToolbarContext</code> you can create and add buttons to the browser UI
* <pre class="brush: js">
window.addEventListener("load", function(){
	
	var theButton = opera.contexts.toolbar.createItem({  // create button
		title: "My First Extension",
		icon: "icons/small_18x18.png",
		popup: {
			href: "popup.html",
			width: 400,
			height: 400
		} 
	}); 
	opera.contexts.toolbar.addItem( theButton ); // add button to UI
	
}, false);
</pre>
*
**/
function ToolbarContext(){}

/**
* This attribute contains the number of UI items held by the <code>ToolbarContext</code>. <strong>Note:</strong> the <code>ToolbarContext</code> is currently restricted to a maximum of one UI item. 
* @type Number
**/
ToolbarContext.prototype.length = 0;


/**
* This method adds a <code>ToolbarItem</code> to the toolbar in the browser. To create a <code>ToolbarItem</code> see the <code>createUIITem</code> method. 
* <pre class="brush: js">
var button = opera.contexts.toolbar.createItem({ // creates a button
	title:'Weather Extension',
	icon:'yr.png'
});
opera.contexts.toolbar.addItem( button ); // adds it to the browser UI
</pre>
* @param {ToolbarItem} item The <code>ToolbarItem</code> to be added.
* @throws WRONG_ARGUMENT_ERR This error is thrown if the item was not created from the same <code>ToolbarContext</code>.
*/
ToolbarContext.prototype.addItem = function(item){};
 
/**
* This method removes a given <code>ToolbarItem</code> from the toolbar in the browser.
* <pre class="brush: js">
var button = opera.contexts.toolbar.createItem({ 
	title:'Weather Extension',
	icon:'yr.png'
});
opera.contexts.toolbar.addItem( button ); 
opera.contexts.toolbar.removeItem( button ); // remove the button
</pre>
* @param {ToolbarItem} item The <code>ToolbarItem</code> to be removed.
* @throws WRONG_ARGUMENT_ERR This error is thrown if the item is not attached to this <code>ToolbarContext</code>.
*/	

ToolbarContext.prototype.removeItem = function(item){};

/**
* This method retrieves a <code>ToolbarItem</code> by index.
* @param {Number} index The ordinal number of the <code>ToolbarItem</code> to be retrieved.
* @return {ToolbarItem} The <code>ToolbarItem</code> at the requested location. 
* @type ToolbarItem 
* @throws INDEX_OUT_OF_BOUNDS_ERR 	 
*/	
ToolbarContext.prototype.item = function(index){};

/**
* This method creates a <code>ToolbarItem</code> from a given property object. <strong>Note:</strong> the item can only be used within the <code>ToolbarContext</code> that it is created in. 
* <pre class="brush: js">
var button = opera.contexts.toolbar.createItem({ // create a button
	title:'Weather Extension',
	icon:'yr.png'
});
</pre>
* @param {ToolbarItemProperties} props The <code>ToolbarItemProperties</code> to use when creating the <code>ToolbarItem</code>.
* @return The <code>ToolbarItem</code>, which at this point is not yet associated with the <code>ToolbarContext</code>.
* @type ToolbarItem 
* @throws WRONG_ARGUMENT_ERR This error is thrown if an item was not created from the same <code>ToolbarContext</code>.	 
*/	
ToolbarContext.prototype.createItem = function(props){}
