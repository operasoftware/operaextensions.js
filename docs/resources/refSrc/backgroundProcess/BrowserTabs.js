
/**
* The property returns the currently focused <code>BrowserTab</code>.
* @return {BrowserTab} The currently focused <code>BrowserTab</code>. If Opera itself is not currently in focus or the currently focused tab is not accessible by the background process, this will return <code>null</code>. For a tab to be accessible by the background process, it must have an injected script running in it.
* @returns BrowserTab 
* @type BrowserTab
*/
BrowserTabs.prototype.getFocused = function(){} 

/**
* This method creates and returns a new <code>BrowserTab</code>.
* @param {BrowserTabProperties} props The properties to use when creating the tab.
* @return BrowserTab
* @type BrowserTab 
*/
BrowserTabs.prototype.create = function( props ){};

/**
* The function assigned to this attribue will be called  when  a <code>BrowserTab</code> is focused.
* @param {EventListener} eventListener The function to be executed when a <code>BrowserTab</code> is focused. 
* @type null
**/
BrowserTabs.prototype.onfocus = null;

/**
* The function assigned to this attribue will be called  when  a <code>BrowserTab</code> is closed.
* @param {EventListener} eventListener The function to be executed when a <code>BrowserTab</code> is closed. 
*@type null
**/
BrowserTabs.prototype.onclose = null;

/**
* The function assigned to this attribue will be called  when  a <code>BrowserTab</code> is created.
* @param {EventListener} eventListener The function to be executed when a <code>BrowserTab</code> is created.  
* @type null
**/
BrowserTabs.prototype.oncreate = null; 

/**
* The function assigned to this attribue will be called  when  a <code>BrowserTab</code> is blurred / loses focus.
* @param {EventListener} eventListener The function to be executed when a <code>BrowserTab</code> is blurred / loses focus.  
* @type null
**/
BrowserTabs.prototype.onblur = null;

/**
* This method is used to listen for events being dispatched.
* @param {String} type Type of event. Allowed values are: <code>focus</code>, <code>close</code>, <code>create</code> and <code>blur</code>.
* @param {EventListener} eventListener The function to be executed when the event occurs.
* @param {useCapture} useCapture Boolean, keep <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
BrowserTabs.prototype.addEventListener = function(){};


/**
* This method removes a listener from receiving an event.
* @param {String} type Type of event. Allowed values are: <code>focus</code>, <code>close</code>, <code>create</code> and <code>blur</code>.
* @param {EventListener} eventListener The function to be removed.
* @param {useCapture} useCapture Boolean, keep <code>false</code> for now. <strong>Note:</strong> this value currently has no purpose.
**/
BrowserTabs.prototype.removeEventListener = function(){};